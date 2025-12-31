


// ----------------------------------------------------------  BEGIN IMPORTS

// React Imports
import { useState, useEffect } from 'react';
//FireBase Imports
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
//Configuration Imports
import { db } from './config/firebase';
//Constants Imports
import { SCOOP_TAGS, APP_ID } from './constants/data';
//Components Imports
import Layout from './components/Layout';
import { ContactPage, BlogPage, LegalPage } from './components/StaticPages';
import Home from './components/Home';
import RecruiterProfile from './components/RecruiterProfile';
import RateForm from './components/RateForm';
import AddRecruiter from './components/AddRecruiter';
import SuccessView from './components/SuccessView';
//Hooks Imports
import { useRecruiterData } from './hooks/useRecruiterData';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
// ----------------------------------------------------------  END IMPORTS



// ----------------------------------------------------------  BEGIN EXPORTS

export default function App() {
  // 1. UI State (Keep these here)
  const [view, setView] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submittedReview, setSubmittedReview] = useState(null); 
  const [rateForm, setRateForm] = useState({ stage: '', tags: [], headline: '', comment: '', rating: 0, agreed: false, verified: false });
  const [addRecruiterForm, setAddRecruiterForm] = useState({ firstName: '', lastName: '', firm: '', location: '', roleTitle: '' });

  // 2. Custom Hooks (The Clean Logic)
  const { user, userLocation, userFingerprint } = useAuth();
  const { recruiters, reviews, loading, hasReviewed, setHasReviewed } = useFirestore(user, selectedRecruiter, userFingerprint);
  const { filteredRecruiters, dashboardData, showAutoAddProfile, bestMatch } = useRecruiterData(recruiters, searchQuery, userLocation);

  // 3. Handlers
  const handleSetView = (newView) => {
    setView(newView);
    setCaptchaVerified(false);
    if (newView !== 'rate') {
      setAddRecruiterForm({ firstName: '', lastName: '', firm: '', location: '', roleTitle: '' });
      setHasReviewed(false);
    }
  };

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  // Sync Live Data for Selected Recruiter (Kept here as it bridges UI and Data)
  useEffect(() => {
    if (selectedRecruiter && recruiters.length > 0) {
       const liveRecord = recruiters.find(r => r.id === selectedRecruiter.id);
       if (liveRecord && (liveRecord.rating !== selectedRecruiter.rating || liveRecord.reviewCount !== selectedRecruiter.reviewCount)) {
         setSelectedRecruiter(prev => ({...prev, ...liveRecord}));
       }
    }
  }, [recruiters, selectedRecruiter]);

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

// ----------------------------------------------------------  END EXPORTS




// ----------------------------------------------------------  BEGIN RETURN

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

// ----------------------------------------------------------  END RETURN()
}