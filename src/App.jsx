// React Imports
import { useState, useEffect, useMemo } from 'react';

//FireBase Imports
import { signInAnonymously, onAuthStateChanged,signInWithCustomToken } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

//Configuration Imports
import { auth, db } from './config/firebase';

//Constants Imports
import { SCOOP_TAGS, APP_ID } from './constants/data';

//Utilities Imports
import { getBrowserFingerprint } from './utils/helper';

//Components Imports
import Layout from './components/Layout';
import { ContactPage, BlogPage, LegalPage } from './components/StaticPages';
import Home from './components/Home';
import RecruiterProfile from './components/RecruiterProfile';
import RateForm from './components/RateForm';
import AddRecruiter from './components/AddRecruiter';
import SuccessView from './components/SuccessView';


// ----------------------------------------------------------  MAIN APP 

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [userLocation, setUserLocation] = useState(null); 
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userFingerprint, setUserFingerprint] = useState('');
  const [submittedReview, setSubmittedReview] = useState(null); 
  const [rateForm, setRateForm] = useState({
    stage: '', tags: [], headline: '', comment: '', rating: 0, agreed: false, verified: false
  });

  const [addRecruiterForm, setAddRecruiterForm] = useState({
    firstName: '', lastName: '', firm: '', location: '', roleTitle: ''
  });

  const handleSetView = (newView) => {
    setView(newView);
    setCaptchaVerified(false);
    // Deleted the two lines here
    if (newView !== 'rate') {
      setAddRecruiterForm({ firstName: '', lastName: '', firm: '', location: '', roleTitle: '' });
      setHasReviewed(false);
    }
  };

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { await signInAnonymously(auth); }
    };

    initAuth();

    setUserFingerprint(getBrowserFingerprint());

    fetch('https://ipapi.co/json/').then(res => res.json())
      .then(data => { if (data.city) setUserLocation(data.city); })
      .catch(() => console.log('Location default: Global'));
    const unsubscribe = onAuthStateChanged(auth, setUser);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'recruiters'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecruiters(data);
      setLoading(false);
    }, console.error);

  }, [user]);

  useEffect(() => {
    if (selectedRecruiter && recruiters.length > 0) {
       const liveRecord = recruiters.find(r => r.id === selectedRecruiter.id);

       if (liveRecord && (liveRecord.rating !== selectedRecruiter.rating || liveRecord.reviewCount !== selectedRecruiter.reviewCount)) {
         setSelectedRecruiter(prev => ({...prev, ...liveRecord}));
       }
    }
  }, [recruiters, selectedRecruiter]); 
  
  useEffect(() => {
    if (!user || !selectedRecruiter) return;
    if (selectedRecruiter.id === 'temp_new_recruiter') {
      setReviews([]); setHasReviewed(false); return;
    }
    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'reviews'));
    return onSnapshot(q, (snapshot) => {
      const allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const related = allReviews.filter(r => r.recruiterId === selectedRecruiter.id)
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setReviews(related);
      const myReview = related.find(r => r.authorId === user.uid || (r.fingerprint && r.fingerprint === userFingerprint));
      setHasReviewed(!!myReview);
    }, console.error);
  }, [user, selectedRecruiter, userFingerprint]);

  const handleAddRecruiter = (e) => {
    e.preventDefault();
    if (!addRecruiterForm.firm || !addRecruiterForm.roleTitle) return;
    const hasName = addRecruiterForm.firstName || addRecruiterForm.lastName;
    setSelectedRecruiter({
      id: 'temp_new_recruiter',
      name: hasName ? `${addRecruiterForm.firstName} ${addRecruiterForm.lastName}`.trim() : '',
      firm: addRecruiterForm.firm,
      location: addRecruiterForm.location,
      roleTitle: addRecruiterForm.roleTitle,
      rating: 0,
      reviewCount: 0,
      criticalFlagCount: 0
    });
    handleSetView('rate');
  };

  const handleSubmitReview = async () => {
    if (!selectedRecruiter || !captchaVerified || rateForm.rating === 0 || !rateForm.agreed) return;
    try {
      let finalRecruiterId = selectedRecruiter.id;
      let finalRecruiterName = selectedRecruiter.name;
      let finalRecruiterFirm = selectedRecruiter.firm;
      const hasCriticalTags = rateForm.tags.some(tagId => {
        const tag = SCOOP_TAGS.find(t => t.id === tagId);
        return tag && tag.type === 'critical';
      });
      if (selectedRecruiter.id === 'temp_new_recruiter') {
         const newRecruiterData = {
            name: selectedRecruiter.name, firm: selectedRecruiter.firm, location: selectedRecruiter.location,
            roleTitle: selectedRecruiter.roleTitle || '', rating: 0, reviewCount: 0, createdAt: serverTimestamp(), tags: {},
            criticalFlagCount: hasCriticalTags ? 1 : 0
         };
         const docRef = await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'recruiters'), newRecruiterData);
         finalRecruiterId = docRef.id;
      }
      await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'reviews'), {
        recruiterId: finalRecruiterId, stage: rateForm.stage, tags: rateForm.tags, headline: rateForm.headline,
        comment: rateForm.comment, rating: rateForm.rating, authorId: user.uid, fingerprint: userFingerprint,
        verified: rateForm.verified, timestamp: serverTimestamp(), flags: 0
      });
      const currentCount = selectedRecruiter.id === 'temp_new_recruiter' ? 0 : (selectedRecruiter.reviewCount || 0);
      const currentRating = selectedRecruiter.id === 'temp_new_recruiter' ? 0 : (selectedRecruiter.rating || 0);
      const newCount = currentCount + 1;
      const newAverage = (currentRating * currentCount + rateForm.rating) / newCount;     
      const updateData = {
        rating: newAverage, reviewCount: increment(1), lastReviewed: serverTimestamp()
      };
      if (hasCriticalTags) { updateData.criticalFlagCount = increment(1); }
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'recruiters', finalRecruiterId), updateData);
      setSubmittedReview({ rating: rateForm.rating, headline: rateForm.headline, recruiterName: finalRecruiterName || 'Hiring Team', firm: finalRecruiterFirm });
      setRateForm({ stage: '', tags: [], headline: '', comment: '', rating: 0, agreed: false, verified: false });
      handleSetView('success');
    } catch (err) { console.error("Error submitting review:", err); }
  };

  const handleFlagReview = async (reviewId, currentFlags) => {
    try {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'reviews', reviewId), { flags: (currentFlags || 0) + 1 });
      alert("This Review has been flagged for moderation.");
    } catch (err) { console.error(err); }
  };


  const bestMatch = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    const searchLower = searchQuery.toLowerCase();
    const matches = recruiters.filter(r => r.name?.toLowerCase().startsWith(searchLower));
    if (matches.length === 0) return null;
    return matches.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0];
  }, [recruiters, searchQuery]);

  const handleSearchKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && bestMatch) {
      e.preventDefault();
      setSearchQuery(bestMatch.name);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const exactMatch = recruiters.find(r => r.name?.toLowerCase() === searchQuery.toLowerCase());
      if (exactMatch) { setSelectedRecruiter(exactMatch); handleSetView('recruiter'); }
      else if (bestMatch && bestMatch.name.toLowerCase() === searchQuery.toLowerCase()) { setSelectedRecruiter(bestMatch); handleSetView('recruiter'); }
    }
  };

  const filteredRecruiters = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const matches = recruiters.filter(r => r.name?.toLowerCase().includes(searchLower) || r.firm?.toLowerCase().includes(searchLower));
    return matches.sort((a, b) => {
      const nameA = a.name || "Hiring Team";
      const nameB = b.name || "Hiring Team";
      const nameCompare = nameA.localeCompare(nameB);
      if (nameCompare !== 0) return nameCompare;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
  }, [recruiters, searchQuery]);

  const dashboardData = useMemo(() => {
    if (searchQuery) return { recruiters: [], teams: [] };
    const isCriticalProfile = (r) => {
      const total = r.reviewCount || 0;
      if (total === 0) return false;
      return (r.criticalFlagCount || 0) / total >= 0.10;
    };
    const ranker = (a, b) => {
       const aBad = isCriticalProfile(a); const bBad = isCriticalProfile(b);
       if (aBad && !bBad) return 1; if (!aBad && bBad) return -1;
       if (userLocation) {
         const aLoc = (a.location || '').toLowerCase(); const bLoc = (b.location || '').toLowerCase(); const loc = userLocation.toLowerCase();
         const aIsLocal = aLoc.includes(loc); const bIsLocal = bLoc.includes(loc);
         if (aIsLocal && !bIsLocal) return -1; if (!aIsLocal && bIsLocal) return 1;
       }
       const scoreA = (a.rating || 0) * Math.log((a.reviewCount || 0) + 1);
       const scoreB = (b.rating || 0) * Math.log((b.reviewCount || 0) + 1);
       return scoreB - scoreA;
    };
    const namedRecruiters = recruiters.filter(r => r.name && r.name.trim() !== '');
    const hiringTeams = recruiters.filter(r => !r.name || r.name.trim() === '');
    return { recruiters: namedRecruiters.sort(ranker).slice(0, 8), teams: hiringTeams.sort(ranker).slice(0, 8) };
  }, [recruiters, userLocation, searchQuery]);

  const showAutoAddProfile = searchQuery.length > 0 && filteredRecruiters.length === 0;


 
  // ----------------------------------------------------------  Main Render 

  return (
    <Layout 
      setView={handleSetView} 
      setSearchQuery={setSearchQuery} 
      setSelectedRecruiter={setSelectedRecruiter}
    >
      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {(view === 'home' || view === 'eviews' || view === 'teams') && (
            <Home 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              bestMatch={bestMatch}
              handleSearchKeyDown={handleSearchKeyDown}
              filteredRecruiters={filteredRecruiters}
              showAutoAddProfile={showAutoAddProfile}
              handleAddRecruiter={handleAddRecruiter}
              addRecruiterForm={addRecruiterForm}
              setAddRecruiterForm={setAddRecruiterForm}
              dashboardData={dashboardData}
              view={view}
              handleSetView={handleSetView}
              setSelectedRecruiter={setSelectedRecruiter}
            />
          )}

          {view === 'recruiter' && selectedRecruiter && (
            <RecruiterProfile 
              selectedRecruiter={selectedRecruiter}
              handleSetView={handleSetView}
              hasReviewed={hasReviewed}
              reviews={reviews}
              handleFlagReview={handleFlagReview}
            />
          )}

          {view === 'rate' && selectedRecruiter && (
            <RateForm 
              selectedRecruiter={selectedRecruiter}
              rateForm={rateForm}
              setRateForm={setRateForm}
              captchaVerified={captchaVerified}
              setCaptchaVerified={setCaptchaVerified}
              onSubmit={handleSubmitReview}
              onCancel={() => handleSetView('recruiter')}
            />
          )}

          {view === 'add' && (
            <AddRecruiter 
              form={addRecruiterForm}
              setForm={setAddRecruiterForm}
              onSubmit={handleAddRecruiter}
              onCancel={() => handleSetView('home')}
            />
          )}

          {view === 'success' && (
            <SuccessView 
              submittedReview={submittedReview}
              onGoHome={() => {
                handleSetView('home');
                setSearchQuery('');
              }}
            />
          )}
          
          {view === 'blog' && <BlogPage />}
          {view === 'contact' && <ContactPage />}
          {view === 'privacy' && <LegalPage type="privacy" />}
          {view === 'terms' && <LegalPage type="terms" />}
        </>
      )}
    </Layout>
  );
}