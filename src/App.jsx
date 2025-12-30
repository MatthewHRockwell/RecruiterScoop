import { useState, useEffect, useMemo } from 'react';
import { signInAnonymously, onAuthStateChanged,signInWithCustomToken } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Search, UserPlus, Briefcase, MapPin, Flag, Menu,ChevronRight,Info,Check,X,ThumbsUp,ThumbsDown,Share2,ArrowRight,FileText,AlertTriangle,Building,FileCheck,Scale } from 'lucide-react';
// 1. Import Config
import { auth, db } from './config/firebase';
// 2. Import Constants
import { STAGES, SCOOP_TAGS, APP_ID } from './constants/data';
// 3. Import Utils
import { getBrowserFingerprint } from './utils/helper';
// 4. Import Components (You need to create these files first!)
import RecruiterCard from './components/RecruiterCard';
import StarRating from './components/StarRating';
import Captcha from './components/Captcha';
import ShareModal from './components/ShareModal';
import GuidelinesModal from './components/GuidelinesModal';
import ComingSoonButton from './components/ComingSoonButton';
import { HeaderLogo, LandingLogo, FooterLogo } from './components/Logos';
import Layout from './components/Layout';
import { ContactPage, BlogPage, LegalPage } from './components/StaticPages';
import Home from './components/Home';
import RecruiterProfile from './components/RecruiterProfile';
import RateForm from './components/RateForm';
import AddRecruiter from './components/AddRecruiter';



const appId = APP_ID;



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
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null); 
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
    setMobileMenuOpen(false); 
    setShareModalOpen(false); 
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

    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'recruiters'));
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
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'));
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
         const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'recruiters'), newRecruiterData);
         finalRecruiterId = docRef.id;
      }
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), {
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
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'recruiters', finalRecruiterId), updateData);
      setSubmittedReview({ rating: rateForm.rating, headline: rateForm.headline, recruiterName: finalRecruiterName || 'Hiring Team', firm: finalRecruiterFirm });
      setRateForm({ stage: '', tags: [], headline: '', comment: '', rating: 0, agreed: false, verified: false });
      handleSetView('success');
    } catch (err) { console.error("Error submitting review:", err); }
  };

  const handleFlagReview = async (reviewId, currentFlags) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reviews', reviewId), { flags: (currentFlags || 0) + 1 });
      alert("This Review has been flagged for moderation.");
    } catch (err) { console.error(err); }
  };

  const toggleTag = (tagId) => {
    setRateForm(prev => {
      const isCritical = SCOOP_TAGS.find(t => t.id === tagId)?.type === 'critical';
      const isAdding = !prev.tags.includes(tagId);
      const tags = isAdding ? [...prev.tags, tagId] : prev.tags.filter(t => t !== tagId);
      let rating = prev.rating;
      if (isAdding && isCritical) rating = 1;
      return { ...prev, tags, rating };
    });
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

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand('copy'); document.body.removeChild(el); alert("Text copied!");
  };

 // ----------------------------------------------------------  Render Functions (Internal) 
  


  const renderSuccess = () => {
    if (!submittedReview) return null;
    const isPositive = submittedReview.rating >= 4;
    const isNegative = submittedReview.rating <= 2;
    let content = {
      headline: "Intel Received. 📂", emoji: "📂",
      body: "You're officially an insider. Thanks to you, the hiring market just got a little less opaque.",
      primaryBtn: "Share Intel", shareText: `Just checked the intel on my recruiter at RecruiterScoop.com. Don't fly blind.`, secondaryLink: "Search for another recruiter"
    };
    if (isPositive) {
      content = {
        headline: "Review Secured.", emoji: "🚀", body: "Thanks for highlighting the good ones! Your review is now live.",
        primaryBtn: "Share the Love", shareText: `Just gave my recruiter a glowing review on RecruiterScoop.com.`, secondaryLink: "See who else is hiring"
      };
    } else if (isNegative) {
      content = {
        headline: "Loud and Clear.", emoji: "🛡️", body: "Thanks for speaking up. Your review has been added to the database.",
        primaryBtn: "Warn Your Network", shareText: `Hiring is tough enough without bad actors. I just dropped some honest intel.`, secondaryLink: "Read other horror stories"
      };
    }
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-3 ${isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-blue-600'}`}></div>
          <div className="text-6xl mb-6">{content.emoji}</div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">{content.headline}</h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">{content.body}</p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-10 text-left shadow-sm">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Review Confirmed</div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">"{submittedReview.headline}"</h3>
            <div className="text-gray-500 font-medium">Re: {submittedReview.recruiterName} <span className="text-gray-300 mx-2">|</span> {submittedReview.firm}</div>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => setShareModalOpen(true)} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 ${isPositive ? 'bg-green-600 hover:bg-green-700' : isNegative ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <Share2 className="w-5 h-5" />{content.primaryBtn}
            </button>
            <button onClick={() => { handleSetView('home'); setSearchQuery(''); }} className="text-gray-500 font-bold hover:text-gray-900 py-2">{content.secondaryLink}</button>
          </div>
          <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} shareText={content.shareText} isPositive={isPositive} />
        </div>
      </div>
    );
  };


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

          {view === 'success' && renderSuccess()}
          
          {view === 'blog' && <BlogPage />}
          {view === 'contact' && <ContactPage />}
          {view === 'privacy' && <LegalPage type="privacy" />}
          {view === 'terms' && <LegalPage type="terms" />}
        </>
      )}
    </Layout>
  );

}