// ... (Imports remain the same)
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { ContactPage, BlogPage, LegalPage } from './components/StaticPages';
import Home from './components/Home';
import RecruiterProfile from './components/RecruiterProfile';
import RateForm from './components/RateForm';
import AddRecruiter from './components/AddRecruiter';
import SuccessView from './components/SuccessView';
import { useRecruiterData } from './hooks/useRecruiterData';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';

export default function App() {
  // 1. UI State
  const [view, setView] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submittedReview, setSubmittedReview] = useState(null); 
  const [rateForm, setRateForm] = useState({ stage: '', tags: [], headline: '', comment: '', rating: 0, agreed: false, verified: false });
  
  // UPDATE: Added 'type' default
  const [addRecruiterForm, setAddRecruiterForm] = useState({ type: 'recruiter', firstName: '', lastName: '', firm: '', location: '', roleTitle: '' });

  const { user, userLocation, userFingerprint } = useAuth();
  
  const { recruiters, reviews, loading, hasReviewed, setHasReviewed, submitReview, flagReview } = useFirestore(user, selectedRecruiter, userFingerprint);
  const { filteredRecruiters, dashboardData, showAutoAddProfile, bestMatch } = useRecruiterData(recruiters, searchQuery, userLocation);

  const handleSetView = (newView) => {
    setView(newView);
    setCaptchaVerified(false);
    if (newView !== 'rate') {
      // UPDATE: Reset with type default
      setAddRecruiterForm({ type: 'recruiter', firstName: '', lastName: '', firm: '', location: '', roleTitle: '' });
      setHasReviewed(false);
    }
  };

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  // Sync Live Data
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
      criticalFlagCount: 0,
      type: addRecruiterForm.type // UPDATE: Passing type
    });
    handleSetView('rate');
  };

  // ... (Rest of handlers: handleSubmitReview, handleFlagReview, handleSearchKeyDown... remain same)

  const handleSubmitReview = async () => {
    if (!selectedRecruiter || !captchaVerified || rateForm.rating === 0 || !rateForm.agreed) return;
    try {
      await submitReview(rateForm, selectedRecruiter);
      setSubmittedReview({ 
        rating: rateForm.rating, 
        headline: rateForm.headline, 
        recruiterName: selectedRecruiter.name || 'Hiring Team', 
        firm: selectedRecruiter.firm 
      });
      setRateForm({ stage: '', tags: [], headline: '', comment: '', rating: 0, agreed: false, verified: false });
      handleSetView('success');
    } catch (err) { console.error("Error submitting review:", err); }
  };

  const handleFlagReview = async (reviewId, currentFlags) => {
    const success = await flagReview(reviewId, currentFlags);
    if (success) alert("This Review has been flagged for moderation.");
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

  // ... (Return statement remains the same)
  return (
    <Layout setView={handleSetView} setSearchQuery={setSearchQuery} setSelectedRecruiter={setSelectedRecruiter}>
      {loading ? (
        <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>
      ) : (
        <>
          {(view === 'home' || view === 'eviews' || view === 'teams' || view === 'candidates' || view === 'recruiters') && (
            <Home 
              searchQuery={searchQuery} setSearchQuery={setSearchQuery} bestMatch={bestMatch} handleSearchKeyDown={handleSearchKeyDown}
              filteredRecruiters={filteredRecruiters} showAutoAddProfile={showAutoAddProfile} handleAddRecruiter={handleAddRecruiter}
              addRecruiterForm={addRecruiterForm} setAddRecruiterForm={setAddRecruiterForm} dashboardData={dashboardData}
              view={view} handleSetView={handleSetView} setSelectedRecruiter={setSelectedRecruiter}
            />
          )}
          {view === 'recruiter' && selectedRecruiter && (
            <RecruiterProfile selectedRecruiter={selectedRecruiter} handleSetView={handleSetView} hasReviewed={hasReviewed} reviews={reviews} handleFlagReview={handleFlagReview} />
          )}
          {view === 'rate' && selectedRecruiter && (
            <RateForm selectedRecruiter={selectedRecruiter} rateForm={rateForm} setRateForm={setRateForm} captchaVerified={captchaVerified} setCaptchaVerified={setCaptchaVerified} onSubmit={handleSubmitReview} onCancel={() => handleSetView('recruiter')} />
          )}
          {view === 'add' && (
            <AddRecruiter form={addRecruiterForm} setForm={setAddRecruiterForm} onSubmit={handleAddRecruiter} onCancel={() => handleSetView('home')} />
          )}
          {view === 'success' && (
            <SuccessView submittedReview={submittedReview} onGoHome={() => { handleSetView('home'); setSearchQuery(''); }} />
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