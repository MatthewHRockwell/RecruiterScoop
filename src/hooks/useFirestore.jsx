// ... (Imports remain same)
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { APP_ID, SCOOP_TAGS } from '../constants/data';

export const useFirestore = (user, selectedRecruiter, userFingerprint) => {
  const [recruiters, setRecruiters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  // 1. Fetch Recruiters
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'recruiters'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecruiters(data);
      setLoading(false);
    }, console.error);
  }, [user]);

  // 2. Fetch Reviews
  useEffect(() => {
    if (!user || !selectedRecruiter) { setReviews([]); return; }
    if (selectedRecruiter.id === 'temp_new_recruiter') { setReviews([]); setHasReviewed(false); return; }
    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'reviews'));
    return onSnapshot(q, (snapshot) => {
      const allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const related = allReviews.filter(r => r.recruiterId === selectedRecruiter.id).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setReviews(related);
      const myReview = related.find(r => r.authorId === user.uid || (r.fingerprint && r.fingerprint === userFingerprint));
      setHasReviewed(!!myReview);
    }, console.error);
  }, [user, selectedRecruiter, userFingerprint]);

  // 3. Submit Review (WRITE)
  const submitReview = async (rateForm, recruiterData) => {
    if (!user) return;

    let finalRecruiterId = recruiterData.id;
    const hasCriticalTags = rateForm.tags.some(tagId => {
      const tag = SCOOP_TAGS.find(t => t.id === tagId);
      return tag && tag.type === 'critical';
    });

    if (recruiterData.id === 'temp_new_recruiter') {
       const newRecruiterData = {
          name: recruiterData.name, 
          firm: recruiterData.firm, 
          location: recruiterData.location,
          roleTitle: recruiterData.roleTitle || '', 
          rating: 0, 
          reviewCount: 0, 
          createdAt: serverTimestamp(), 
          tags: {},
          criticalFlagCount: hasCriticalTags ? 1 : 0,
          // UPDATE: Saving the Type
          type: recruiterData.type || 'recruiter' 
       };
       const docRef = await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'recruiters'), newRecruiterData);
       finalRecruiterId = docRef.id;
    }

    await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'reviews'), {
      recruiterId: finalRecruiterId, 
      stage: rateForm.stage, 
      tags: rateForm.tags, 
      headline: rateForm.headline,
      comment: rateForm.comment, 
      rating: rateForm.rating, 
      authorId: user.uid, 
      fingerprint: userFingerprint,
      verified: rateForm.verified, 
      timestamp: serverTimestamp(), 
      flags: 0
    });

    const currentCount = recruiterData.id === 'temp_new_recruiter' ? 0 : (recruiterData.reviewCount || 0);
    const currentRating = recruiterData.id === 'temp_new_recruiter' ? 0 : (recruiterData.rating || 0);
    const newCount = currentCount + 1;
    const newAverage = (currentRating * currentCount + rateForm.rating) / newCount;     
    
    const updateData = {
      rating: newAverage, 
      reviewCount: increment(1), 
      lastReviewed: serverTimestamp()
    };
    
    if (hasCriticalTags) { updateData.criticalFlagCount = increment(1); }
    
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'recruiters', finalRecruiterId), updateData);
    return { success: true };
  };

  const flagReview = async (reviewId, currentFlags) => {
    try {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'reviews', reviewId), { flags: (currentFlags || 0) + 1 });
      return true;
    } catch (err) { console.error(err); return false; }
  };

  return { recruiters, reviews, loading, hasReviewed, setHasReviewed, submitReview, flagReview };
};