import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { APP_ID } from '../constants/data';

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

  // 2. Fetch Reviews (Dependent on Selected Recruiter)
  useEffect(() => {
    if (!user || !selectedRecruiter) {
        setReviews([]); 
        return;
    }
    
    // Handle temporary "new" recruiter
    if (selectedRecruiter.id === 'temp_new_recruiter') {
      setReviews([]); 
      setHasReviewed(false); 
      return;
    }

    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'reviews'));
    return onSnapshot(q, (snapshot) => {
      const allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const related = allReviews
        .filter(r => r.recruiterId === selectedRecruiter.id)
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      
      setReviews(related);
      
      const myReview = related.find(r => r.authorId === user.uid || (r.fingerprint && r.fingerprint === userFingerprint));
      setHasReviewed(!!myReview);
    }, console.error);
  }, [user, selectedRecruiter, userFingerprint]);

  return { recruiters, reviews, loading, hasReviewed, setHasReviewed };
};