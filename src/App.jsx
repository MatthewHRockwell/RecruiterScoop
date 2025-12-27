import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  limit
} from 'firebase/firestore';
import { 
  Search, 
  Star, 
  UserPlus, 
  Briefcase, 
  MapPin, 
  Flag, 
  Shield,
  Menu,
  ChevronRight,
  Lock,
  Newspaper, 
  Info,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Share2,
  Copy,
  ArrowRight,
  BookOpen,
  FileText
} from 'lucide-react';

// --- Components ---

// Integrated Logo Component
const Logo = ({ className = "w-8 h-8", textClassName = "text-xl" }) => (
  <div className="flex items-center gap-2 select-none">
    <div className="relative">
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M10 50C10 27.9086 27.9086 10 50 10C72.0914 10 90 27.9086 90 50C90 72.0914 72.0914 90 50 90C38.6 90 28.5 85.1 21.5 77.5L10 85V50Z" 
          className="fill-black"
        />
        <path 
          d="M65 65L82 82" 
          stroke="white" 
          strokeWidth="8" 
          strokeLinecap="round"
        />
        <circle cx="45" cy="45" r="18" className="fill-blue-600" />
        <path 
          d="M38 45L43 50L53 40" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className={`font-black tracking-tight text-gray-900 ${textClassName}`}>
      Recruiter<span className="text-blue-600">Scoop</span>
    </span>
  </div>
);

// 1. Legal/Disclaimer Modal
const GuidelinesModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 text-amber-600">
          <Shield className="w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">Community Guidelines</h2>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          RecruiterScoop is the community-driven intelligence layer for the hiring world.
          To keep this intelligence useful, we need your help.
        </p>
        <ul className="space-y-3 mb-6 text-sm text-gray-700">
          <li className="flex gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span><strong>Unfiltered but Fair:</strong> We don't hide hard truths, but avoid personal attacks. Focus on the process.</span>
          </li>
          <li className="flex gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span><strong>No Doxing:</strong> Do not post home addresses, personal phone numbers, or private life details.</span>
          </li>
          <li className="flex gap-2">
            <Shield className="w-4 h-4 text-green-500 shrink-0" />
            <span><strong>Fact-Check Your Scoop:</strong> Ensure your review is based on a genuine interaction.</span>
          </li>
        </ul>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-md">Cancel</button>
          <button 
            onClick={onAccept}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Star Rating Input
const StarRating = ({ rating, setRating, interactive = true, size = "md" }) => {
  const sizeClasses = size === "lg" ? "w-8 h-8" : "w-5 h-5";
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          className={`focus:outline-none transition-transform ${interactive ? 'hover:scale-110' : 'cursor-default'}`}
        >
          <Star 
            className={`${sizeClasses} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
            fill={star <= rating ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

// 3. Captcha Component
const Captcha = ({ onVerify }) => {
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [val, setVal] = useState('');

  const handleChange = (e) => {
    const input = e.target.value;
    if (!/^\d*$/.test(input)) return;
    setVal(input);
    if (parseInt(input) === num1 + num2) {
      onVerify(true);
    } else {
      onVerify(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Security Check</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-300 font-mono font-bold text-gray-800 select-none shadow-sm">
          {num1} + {num2} = ?
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={val}
          onChange={handleChange}
          placeholder="Sum"
          className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-gray-800"
        />
        {parseInt(val) === num1 + num2 && <Shield className="w-6 h-6 text-green-500 animate-bounce" />}
      </div>
    </div>
  );
};

// --- Configuration & Initialization ---

const firebaseConfig = {
  apiKey: "AIzaSyDCmNjPM2avnmrw9qOGB_7S7zG4l0AuHqc",
  authDomain: "recruiterscoop.firebaseapp.com",
  projectId: "recruiterscoop",
  storageBucket: "recruiterscoop.firebasestorage.app",
  messagingSenderId: "850975692966",
  appId: "1:850975692966:web:3f5ca72035f508a8adbc67",
  measurementId: "G-8PD21B2XYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const appId = 'recruiter-scoop';

// --- Constants & Data ---

const STAGES = [
  { id: 'initial', label: 'Initial Chat', desc: 'We spoke, but nothing happened.' },
  { id: 'submitted', label: 'Submitted', desc: 'They sent my resume to the company.' },
  { id: 'interviewed', label: 'Interviewed', desc: 'I got in front of the hiring manager.' },
  { id: 'ghosted', label: 'Ghosted', desc: 'They vanished mid-process.' },
  { id: 'hired', label: 'Hired', desc: 'I got the job!' }
];

const SCOOP_TAGS = [
  // Good
  { id: 'straight_shooter', label: 'Straight Shooter', type: 'positive', desc: 'Honest about salary & remote work.' },
  { id: 'feedback_loop', label: 'Feedback Loop', type: 'positive', desc: 'Gave me actual feedback.' },
  { id: 'career_advocate', label: 'Career Advocate', type: 'positive', desc: 'Fought for my offer/terms.' },
  // Bad
  { id: 'radio_silence', label: 'Radio Silence', type: 'negative', desc: 'Ignored emails for weeks.' },
  { id: 'role_baiting', label: 'Role Baiting', type: 'negative', desc: 'Job desc didn\'t match reality.' },
  { id: 'time_waster', label: 'Time Waster', type: 'negative', desc: 'Process took way too long.' }
];

// 4. Main Application Component
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
  
  // Spam prevention state
  const [hasReviewed, setHasReviewed] = useState(false);

  // New State to hold the review just submitted for the confirmation screen
  const [submittedReview, setSubmittedReview] = useState(null);

  // New Rate Form State
  const [rateForm, setRateForm] = useState({
    stage: '',         
    tags: [],          
    headline: '',      
    comment: '',       
    rating: 0,         
    agreed: false
  });

  const [addRecruiterForm, setAddRecruiterForm] = useState({
    firstName: '',
    lastName: '',
    firm: '',
    location: ''
  });

  const handleSetView = (newView) => {
    setView(newView);
    setCaptchaVerified(false);
    setMobileMenuOpen(false); // Close mobile menu on nav
    // Reset add form and spam check when moving views (except when moving to 'rate' from 'add')
    if (newView !== 'rate') {
      setAddRecruiterForm({ firstName: '', lastName: '', firm: '', location: '' });
      setHasReviewed(false);
    }
  };

  // Scroll to top whenever the view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Custom token auth failed (likely mismatch), falling back to anonymous", err);
        // Fallback to anonymous auth if the environment token doesn't match the project config
        await signInAnonymously(auth);
      }
    };
    initAuth();
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

  // Keep selectedRecruiter in sync with live data
  useEffect(() => {
    if (selectedRecruiter && recruiters.length > 0) {
       const liveRecord = recruiters.find(r => r.id === selectedRecruiter.id);
       if (liveRecord) {
         if (liveRecord.rating !== selectedRecruiter.rating || liveRecord.reviewCount !== selectedRecruiter.reviewCount) {
           setSelectedRecruiter(prev => ({...prev, ...liveRecord}));
         }
       }
    }
  }, [recruiters]); 

  // Fetch reviews and check for spam/existing reviews
  useEffect(() => {
    if (!user || !selectedRecruiter) return;
    
    // If it's a new temporary recruiter, no need to fetch reviews
    if (selectedRecruiter.id === 'temp_new_recruiter') {
      setReviews([]);
      setHasReviewed(false);
      return;
    }

    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'));
    return onSnapshot(q, (snapshot) => {
      const allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const relatedReviews = allReviews
        .filter(r => r.recruiterId === selectedRecruiter.id)
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      
      setReviews(relatedReviews);

      // Check if current user has already left a review
      const myReview = relatedReviews.find(r => r.authorId === user.uid);
      setHasReviewed(!!myReview);

    }, console.error);
  }, [user, selectedRecruiter]);

  const handleAddRecruiter = (e) => {
    e.preventDefault();
    if (!addRecruiterForm.firstName || !addRecruiterForm.lastName || !addRecruiterForm.firm) return;

    // We do NOT save to DB yet. We move to the Rate step first.
    // We create a temporary recruiter object for the UI to use.
    setSelectedRecruiter({
      id: 'temp_new_recruiter',
      name: `${addRecruiterForm.firstName} ${addRecruiterForm.lastName}`,
      firm: addRecruiterForm.firm,
      location: addRecruiterForm.location,
      rating: 0,
      reviewCount: 0
    });
    
    // Move to rate view
    handleSetView('rate');
  };

  const handleSubmitReview = async () => {
    if (!selectedRecruiter || !captchaVerified || rateForm.rating === 0) return;

    try {
      let finalRecruiterId = selectedRecruiter.id;
      let finalRecruiterName = selectedRecruiter.name;
      let finalRecruiterFirm = selectedRecruiter.firm;

      // 1. Handle New Recruiter Creation if needed (Delayed creation)
      if (selectedRecruiter.id === 'temp_new_recruiter') {
         const newRecruiterData = {
            name: selectedRecruiter.name,
            firm: selectedRecruiter.firm,
            location: selectedRecruiter.location,
            rating: 0,
            reviewCount: 0,
            createdAt: serverTimestamp(),
            tags: {}
         };
         const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'recruiters'), newRecruiterData);
         finalRecruiterId = docRef.id;
      }

      // 2. Create Review
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), {
        recruiterId: finalRecruiterId,
        stage: rateForm.stage,
        tags: rateForm.tags,
        headline: rateForm.headline,
        comment: rateForm.comment,
        rating: rateForm.rating, 
        authorId: user.uid,
        timestamp: serverTimestamp(),
        flags: 0
      });

      // 3. Update Recruiter Stats
      const currentCount = selectedRecruiter.id === 'temp_new_recruiter' ? 0 : (selectedRecruiter.reviewCount || 0);
      const currentRating = selectedRecruiter.id === 'temp_new_recruiter' ? 0 : (selectedRecruiter.rating || 0);
      
      const newCount = currentCount + 1;
      const currentTotal = currentRating * currentCount;
      const newAverage = (currentTotal + rateForm.rating) / newCount;

      const recruiterRef = doc(db, 'artifacts', appId, 'public', 'data', 'recruiters', finalRecruiterId);
      await updateDoc(recruiterRef, {
        rating: newAverage,
        reviewCount: increment(1)
      });

      // Store submitted review for Success View
      setSubmittedReview({
        rating: rateForm.rating,
        headline: rateForm.headline,
        recruiterName: finalRecruiterName,
        firm: finalRecruiterFirm
      });

      // Reset Form
      setRateForm({ 
        stage: '',
        tags: [], 
        headline: '',
        comment: '', 
        rating: 0,
        agreed: false 
      });

      // Go to Success View
      handleSetView('success');

    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  const handleFlagReview = async (reviewId, currentFlags) => {
    try {
      const reviewRef = doc(db, 'artifacts', appId, 'public', 'data', 'reviews', reviewId);
      await updateDoc(reviewRef, { flags: (currentFlags || 0) + 1 });
      alert("This Scoop has been flagged for moderation. Thanks for keeping the intel verified.");
    } catch (err) { console.error(err); }
  };

  const toggleTag = (tagId) => {
    setRateForm(prev => {
      const tags = prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]; 
      return { ...prev, tags };
    });
  };

  const filteredRecruiters = recruiters.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.firm?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("Text copied to clipboard! Ready to paste into LinkedIn.");
  };

  // --- Static Pages Renderers ---

  const renderBlog = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-black mb-8">Intel Blog</h1>
      <div className="grid gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-bold text-blue-600 mb-2">CAREER ADVICE</div>
            <h2 className="text-2xl font-bold mb-3">How to Spot a "Ghoster" Before the First Call</h2>
            <p className="text-gray-600 mb-4">Red flags are easy to spot if you know where to look. Here is the 5-point checklist...</p>
            <button className="text-sm font-bold underline">Read Article</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLegal = (type) => (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-blue">
      <h1 className="text-2xl md:text-3xl font-black mb-6">{type === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}</h1>
      <p className="lead text-lg md:text-xl text-gray-600 mb-8">
        Last Updated: December 2025. Transparency is our core value, starting with how we handle your data.
      </p>
      
      <h3 className="text-xl font-bold mb-2">1. The Basics</h3>
      <p className="mb-6 text-gray-700">
        RecruiterScoop is a public platform. Reviews you post are public. However, we protect your identity. 
        We do not sell your personal email address to recruiters.
      </p>

      <h3 className="text-xl font-bold mb-2">2. Content Guidelines</h3>
      <p className="mb-6 text-gray-700">
        We reserve the right to remove content that violates our community standards, including hate speech, 
        doxing, or verifiably false claims.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-500">
        This is a placeholder legal document for the prototype. Please consult legal counsel for the production version.
      </div>
    </div>
  );

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
           <div className="bg-black text-white p-3 rounded-xl shadow-lg rotate-[-5deg]">
              <Newspaper className="w-8 h-8" />
           </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
          Recruiter<span className="text-blue-600">Scoop</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 font-light">
          Get the <span className="font-bold text-gray-900">inside scoop</span> on your next recruiter.
        </p>
        
        <div className="relative w-full max-w-xl mx-auto mb-16 shadow-2xl rounded-full">
          <input 
            type="text" 
            placeholder="Find Intel on a firm or recruiter..." 
            className="w-full h-16 pl-14 pr-6 rounded-full border-0 bg-white text-lg focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-5 top-5 text-gray-400 w-6 h-6" />
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            {searchQuery ? 'Search Results' : 'Headline Recruiters'}
          </h2>
          <button 
            onClick={() => handleSetView('add')}
            className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
          >
            <UserPlus className="w-4 h-4" /> Add Profile
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecruiters.length > 0 ? (
            filteredRecruiters.slice(0, 9).map(recruiter => (
              <div 
                key={recruiter.id}
                onClick={() => { setSelectedRecruiter(recruiter); handleSetView('recruiter'); }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <div className={`font-black text-xl px-3 py-1 rounded-lg border border-gray-100 transition-colors ${
                     (recruiter.rating || 0) >= 4 ? 'bg-green-50 text-green-700' :
                     (recruiter.rating || 0) >= 3 ? 'bg-yellow-50 text-yellow-700' :
                     'bg-gray-50 text-gray-900'
                  }`}>
                    {recruiter.rating ? recruiter.rating.toFixed(1) : '-'}
                  </div>
                </div>
                <div className="pr-12">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{recruiter.name}</h3>
                  <div className="text-gray-500 text-sm flex items-center gap-2 mb-4">
                    <Briefcase className="w-3 h-3" /> {recruiter.firm}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>{recruiter.reviewCount || 0} Scoops</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4 text-lg">No intel found for "{searchQuery}"</p>
              <button 
                onClick={() => handleSetView('add')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg"
              >
                Submit New Intel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecruiterProfile = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => handleSetView('home')} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Intelligence
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{selectedRecruiter.name}</h1>
            <div className="flex flex-col gap-2 text-lg text-gray-600">
              <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-gray-400" /> {selectedRecruiter.firm}</span>
              <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-400" /> {selectedRecruiter.location || 'Location Not Listed'}</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Overall Verdict</div>
                <div className="text-xs text-gray-400">Based on {selectedRecruiter.reviewCount || 0} scoops</div>
             </div>
             <div className={`text-5xl md:text-6xl font-black tracking-tighter ${
                selectedRecruiter.rating >= 4 ? 'text-green-500' : 
                selectedRecruiter.rating >= 3 ? 'text-yellow-500' : 
                'text-gray-300'
              }`}>
                {selectedRecruiter.rating ? selectedRecruiter.rating.toFixed(1) : 'N/A'}
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Latest Scoops
          </h3>
        </div>
        {hasReviewed ? (
          <div className="bg-green-100 text-green-800 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm border border-green-200">
            <Check className="w-5 h-5" />
            Scoop Submitted
          </div>
        ) : (
          <button 
            onClick={() => setShowGuidelines(true)}
            className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
          >
            <Flag className="w-4 h-4" />
            Submit a Scoop
          </button>
        )}
      </div>

      <div className="space-y-6">
        {reviews.length > 0 ? reviews.map(review => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
            
            {/* Review Header with Headline */}
            <div className="mb-4">
               <h4 className="text-xl font-black text-gray-900 leading-tight mb-2">"{review.headline}"</h4>
               
               <div className="flex items-center gap-3 text-sm">
                 {/* Rating Badge */}
                 <div className={`px-2 py-0.5 rounded font-bold text-white text-xs ${
                   review.rating >= 4 ? 'bg-green-500' : review.rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                 }`}>
                   {review.rating ? review.rating.toFixed(1) : '-'} / 5.0
                 </div>
                 
                 {/* Stage Badge */}
                 {review.stage && (
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
                     Stage: {STAGES.find(s => s.id === review.stage)?.label || review.stage}
                   </span>
                 )}

                 <span className="text-gray-400 text-xs">
                   {review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
                 </span>
               </div>
            </div>

            {/* Matrix Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {review.tags && review.tags.map(tagId => {
                const tagDef = SCOOP_TAGS.find(t => t.id === tagId);
                return tagDef ? (
                  <span 
                    key={tagId} 
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                      tagDef.type === 'positive' 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    {tagDef.type === 'positive' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {tagDef.label}
                  </span>
                ) : null;
              })}
            </div>

            {/* Full Story */}
            {review.comment && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-gray-700 leading-relaxed font-light">
                  {review.comment}
                </p>
              </div>
            )}
            
            <button 
              onClick={() => handleFlagReview(review.id, review.flags)}
              className="absolute top-6 right-6 text-gray-300 hover:text-red-500"
              title="Report this scoop"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Scoops Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share intel on {selectedRecruiter.name.split(' ')[0]}.</p>
            {hasReviewed ? (
              <p className="text-green-600 font-bold">You've submitted the first scoop!</p>
            ) : (
              <button 
                onClick={() => setShowGuidelines(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                Submit a Scoop now
              </button>
            )}
          </div>
        )}
      </div>

      <GuidelinesModal 
        isOpen={showGuidelines} 
        onClose={() => setShowGuidelines(false)}
        onAccept={() => {
          setShowGuidelines(false);
          handleSetView('rate');
        }}
      />
    </div>
  );

  const renderSuccess = () => {
    if (!submittedReview) return null;

    const isPositive = submittedReview.rating >= 4;
    const isNegative = submittedReview.rating <= 2;
    // Rating 3 is Universal/Neutral

    let content = {
      headline: "Intel Received. 📂",
      emoji: "📂",
      body: "You're officially an insider. Thanks to you, the hiring market just got a little less opaque. We are processing your scoop now.",
      primaryBtn: "Share Intel on LinkedIn",
      shareText: `Just checked the intel on my recruiter at RecruiterScoop.com. Don't fly blind.`,
      secondaryLink: "Search for another recruiter"
    };

    if (isPositive) {
      content = {
        headline: "Scoop Secured.",
        emoji: "🚀",
        body: "Thanks for highlighting the good ones! The hiring industry needs more recruiters like that, and you just helped them stand out from the noise. Your scoop is now live.",
        primaryBtn: "Share the Love on LinkedIn",
        shareText: `Just gave my recruiter a glowing review on RecruiterScoop.com. Good recruiters deserve to be seen. Go check your grade!`,
        secondaryLink: "See who else is hiring"
      };
    } else if (isNegative) {
      content = {
        headline: "Loud and Clear.",
        emoji: "🛡️",
        body: "Thanks for speaking up. Transparency is the only way to fix broken hiring processes. Your scoop has been added to the database and will help future candidates dodge a bullet.",
        primaryBtn: "Warn Your Network (Anonymously)",
        shareText: `Hiring is tough enough without bad actors. I just dropped some honest intel on RecruiterScoop.com. Before you take that call, check the scoop.`,
        secondaryLink: "Read other horror stories"
      };
    }

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full text-center relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className={`absolute top-0 left-0 w-full h-3 ${isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-blue-600'}`}></div>
          
          <div className="text-6xl mb-6">{content.emoji}</div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">{content.headline}</h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {content.body}
          </p>

          {/* The Share Card - Visual Rep of the Scoop - Straightened by removing rotate class */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-10 text-left shadow-sm">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Scoop Confirmed</div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">"{submittedReview.headline}"</h3>
            <div className="text-gray-500 font-medium">
               Re: {submittedReview.recruiterName} <span className="text-gray-300 mx-2">|</span> {submittedReview.firm}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => copyToClipboard(content.shareText)}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 ${
                isPositive ? 'bg-green-600 hover:bg-green-700' : 
                isNegative ? 'bg-red-600 hover:bg-red-700' : 
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Share2 className="w-5 h-5" />
              {content.primaryBtn}
            </button>
            <button 
              onClick={() => { handleSetView('home'); setSearchQuery(''); }}
              className="text-gray-500 font-bold hover:text-gray-900 py-2"
            >
              {content.secondaryLink}
            </button>
          </div>

          {/* The Loop Section */}
          <div className="mt-12 pt-8 border-t border-gray-100">
             <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">While you're here...</div>
             <div className="grid md:grid-cols-2 gap-4">
                <button 
                   onClick={() => { handleSetView('home'); setSearchQuery(''); }}
                   className="p-4 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-left group"
                >
                   <div className="font-bold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                     Search Previous Recruiter <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="text-xs text-gray-500 mt-1">Leave another scoop</div>
                </button>
                <button 
                   onClick={() => { handleSetView('headlines'); }}
                   className="p-4 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-left group"
                >
                   <div className="font-bold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                     See Top Rated <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="text-xs text-gray-500 mt-1">In your industry</div>
                </button>
             </div>
          </div>

        </div>
      </div>
    );
  };

  const renderRateForm = () => {
    const MAX_WORDS = 300;
    const wordCount = rateForm.comment.trim() ? rateForm.comment.trim().split(/\s+/).length : 0;
    
    return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => handleSetView('recruiter')} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ChevronRight className="w-4 h-4 rotate-180" /> Cancel
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="mb-10 border-b pb-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-blue-100 p-2 rounded-lg"><Newspaper className="w-6 h-6 text-blue-600" /></div>
             <h2 className="text-3xl font-black text-gray-900">Submit a Scoop</h2>
          </div>
          <p className="text-gray-500 text-lg">You are investigating <span className="font-bold text-gray-900">{selectedRecruiter.name}</span> at {selectedRecruiter.firm}</p>
        </div>

        {/* Question 1: Relationship Check */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-900 mb-1">1. The Relationship Check</h3>
          <p className="text-sm text-gray-500 mb-4">How deep did you get with this recruiter?</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {STAGES.map(stage => (
              <button
                key={stage.id}
                onClick={() => setRateForm({...rateForm, stage: stage.id})}
                className={`p-3 rounded-xl border text-left transition-all hover:shadow-md ${
                  rateForm.stage === stage.id
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-1'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className={`font-bold text-sm mb-1 ${rateForm.stage === stage.id ? 'text-blue-700' : 'text-gray-900'}`}>{stage.label}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{stage.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: The Scoop Score (Matrix) */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-900 mb-1">2. The Scoop Score</h3>
          <p className="text-sm text-gray-500 mb-4">Give us the intel. Which of these are true? (Select all that apply)</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* The Good */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase tracking-wider mb-2">
                 <ThumbsUp className="w-4 h-4" /> The Good
               </div>
               {SCOOP_TAGS.filter(t => t.type === 'positive').map(tag => (
                 <button
                   key={tag.id}
                   onClick={() => toggleTag(tag.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                     rateForm.tags.includes(tag.id)
                       ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-[1.02]'
                       : 'bg-white border-gray-200 text-gray-600 hover:bg-green-50'
                   }`}
                 >
                   <div className="text-left">
                     <div className="font-bold text-sm">{tag.label}</div>
                     <div className={`text-xs ${rateForm.tags.includes(tag.id) ? 'text-green-100' : 'text-gray-400'}`}>{tag.desc}</div>
                   </div>
                   {rateForm.tags.includes(tag.id) && <Check className="w-5 h-5" />}
                 </button>
               ))}
            </div>

            {/* The Bad */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider mb-2">
                 <ThumbsDown className="w-4 h-4" /> The Bad
               </div>
               {SCOOP_TAGS.filter(t => t.type === 'negative').map(tag => (
                 <button
                   key={tag.id}
                   onClick={() => toggleTag(tag.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                     rateForm.tags.includes(tag.id)
                       ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-[1.02]'
                       : 'bg-white border-gray-200 text-gray-600 hover:bg-red-50'
                   }`}
                 >
                   <div className="text-left">
                     <div className="font-bold text-sm">{tag.label}</div>
                     <div className={`text-xs ${rateForm.tags.includes(tag.id) ? 'text-red-100' : 'text-gray-400'}`}>{tag.desc}</div>
                   </div>
                   {rateForm.tags.includes(tag.id) && <X className="w-5 h-5" />}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Question 3: The Headline */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-900 mb-1">3. The Headline</h3>
          <p className="text-sm text-gray-500 mb-4">Summarize your experience in one sentence.</p>
          
          <input 
            className="w-full text-xl font-bold p-4 border-b-2 border-gray-200 focus:border-black outline-none bg-transparent placeholder-gray-300 mb-6 transition-colors"
            placeholder="e.g., Got me my dream job in 2 weeks!"
            value={rateForm.headline}
            onChange={e => setRateForm({...rateForm, headline: e.target.value})}
          />
          
          <div className="flex justify-between items-end mb-2">
             <label className="text-xs font-bold text-gray-400 uppercase">Full Story (Optional)</label>
             <span className={`text-xs font-medium ${wordCount > MAX_WORDS ? 'text-red-500' : 'text-gray-400'}`}>
               {wordCount} / {MAX_WORDS} words
             </span>
          </div>
          <textarea 
            rows={4}
            className={`w-full p-4 bg-gray-50 rounded-xl border focus:bg-white focus:ring-2 outline-none transition-all ${
              wordCount > MAX_WORDS 
                ? 'border-red-300 focus:ring-red-200' 
                : 'border-gray-200 focus:ring-blue-500'
            }`}
            placeholder="Want to spill the full story? Add details here..."
            value={rateForm.comment}
            onChange={e => setRateForm({...rateForm, comment: e.target.value})}
          />
        </div>

        {/* The Verdict (Overall Rating) */}
        <div className="mb-10 bg-gray-900 p-6 rounded-xl text-center text-white">
          <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">One Final Click: The Verdict</label>
          <div className="flex justify-center mb-2">
            <StarRating rating={rateForm.rating} setRating={(r) => setRateForm({...rateForm, rating: r})} size="lg" />
          </div>
          <div className="h-6 font-bold text-yellow-400">
            {rateForm.rating === 1 && "Avoid at all costs"}
            {rateForm.rating === 2 && "Not great"}
            {rateForm.rating === 3 && "Average"}
            {rateForm.rating === 4 && "Solid choice"}
            {rateForm.rating === 5 && "Hiring Hero"}
          </div>
        </div>

        <Captcha onVerify={setCaptchaVerified} />

        <div className="mb-8 mt-6 bg-blue-50 p-4 rounded-lg flex gap-3 items-start border border-blue-100">
          <input 
            type="checkbox" 
            id="legal-check" 
            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            checked={rateForm.agreed}
            onChange={e => setRateForm({...rateForm, agreed: e.target.checked})}
          />
          <label htmlFor="legal-check" className="text-sm text-gray-700">
            I certify that this scoop is based on my own genuine experience.
          </label>
        </div>

        <button 
          onClick={handleSubmitReview}
          disabled={!rateForm.stage || !rateForm.headline || rateForm.rating === 0 || !rateForm.agreed || wordCount > MAX_WORDS || !captchaVerified}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 ${
            rateForm.stage && rateForm.headline && rateForm.rating > 0 && rateForm.agreed && wordCount <= MAX_WORDS && captchaVerified
              ? 'bg-black text-white hover:bg-gray-900 shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Publish Intel
        </button>
      </div>
    </div>
  );
  };

  const renderAddRecruiter = () => (
    <div className="max-w-xl mx-auto px-4 py-8">
       <button onClick={() => handleSetView('home')} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back
      </button>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          Add Profile
        </h2>
        <form onSubmit={handleAddRecruiter} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input 
                required
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={addRecruiterForm.firstName}
                onChange={e => setAddRecruiterForm({...addRecruiterForm, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input 
                required
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={addRecruiterForm.lastName}
                onChange={e => setAddRecruiterForm({...addRecruiterForm, lastName: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Firm / Agency <span className="text-red-500">*</span></label>
            <input 
              required
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={addRecruiterForm.firm}
              onChange={e => setAddRecruiterForm({...addRecruiterForm, firm: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location (City, State)</label>
            <input 
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={addRecruiterForm.location}
              onChange={e => setAddRecruiterForm({...addRecruiterForm, location: e.target.value})}
            />
          </div>

          <p className="text-xs text-gray-400 mt-2">
            By adding this profile, you assist others in finding the right intel.
          </p>
          <button 
            type="submit"
            disabled={!addRecruiterForm.firstName || !addRecruiterForm.lastName || !addRecruiterForm.firm}
            className={`w-full font-bold py-4 rounded-xl transition-colors mt-6 ${
              addRecruiterForm.firstName && addRecruiterForm.lastName && addRecruiterForm.firm
                ? 'bg-black text-white hover:bg-gray-900 shadow-lg' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next: Write Review
          </button>
        </form>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            onClick={() => { handleSetView('home'); setSearchQuery(''); setSelectedRecruiter(null); }}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Logo />
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
            <button onClick={() => { handleSetView('home'); setSearchQuery(''); }} className="hover:text-black">Headline Recruiters</button>
            <button onClick={() => handleSetView('blog')} className="hover:text-black">Intel Blog</button>
            <button 
              onClick={() => handleSetView('add')}
              className="text-black hover:text-blue-600"
            >
              Add Profile
            </button>
            <button className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200/50">
              Access Intel
            </button>
          </div>
          
          {/* Mobile Nav Toggle */}
          <button 
            className="md:hidden text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 p-4 shadow-xl flex flex-col gap-4 text-center">
            <button onClick={() => handleSetView('home')} className="font-bold text-gray-900 py-2">Headlines</button>
            <button onClick={() => handleSetView('blog')} className="font-bold text-gray-900 py-2">Blog</button>
            <button onClick={() => handleSetView('add')} className="font-bold text-blue-600 py-2">Add Profile</button>
          </div>
        )}
      </nav>

      <main className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {(view === 'home' || view === 'headlines') && renderHome()}
            {view === 'recruiter' && selectedRecruiter && renderRecruiterProfile()}
            {view === 'rate' && selectedRecruiter && renderRateForm()}
            {view === 'add' && renderAddRecruiter()}
            {view === 'success' && renderSuccess()}
            {view === 'blog' && renderBlog()}
            {view === 'privacy' && renderLegal('privacy')}
            {view === 'terms' && renderLegal('terms')}
          </>
        )}
      </main>

      <footer className="bg-black text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-sm">
          <div className="col-span-1 lg:col-span-2 pr-8">
            <div className="mb-6">
               <Logo className="w-6 h-6" textClassName="text-white text-2xl" />
            </div>
            <p className="leading-relaxed mb-6 text-gray-400">
              <strong className="text-white block mb-2">Don't fly blind. Get the Scoop.</strong>
              RecruiterScoop is the community-driven intelligence layer for the hiring world. We exist to replace the black box of recruiting with transparency. Whether sharing a horror story or praising a hiring hero, your intel helps others navigate their career path safely.
            </p>
            <div className="flex gap-4">
               <span className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Unfiltered</span>
               <span className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Balanced</span>
               <span className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Anonymous</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Intel</h4>
            <ul className="space-y-4">
              <li><button onClick={() => { handleSetView('home'); setSearchQuery(''); }} className="hover:text-white transition-colors text-left">Find Intel</button></li>
              <li><button onClick={() => handleSetView('add')} className="hover:text-white transition-colors text-left">Submit a Scoop</button></li>
              <li><button onClick={() => handleSetView('home')} className="hover:text-white transition-colors text-left">Headline Recruiters</button></li>
              <li><button onClick={() => handleSetView('blog')} className="hover:text-white transition-colors text-left">Intel Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Legal & Trust</h4>
            <ul className="space-y-4">
              <li><button onClick={() => handleSetView('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => handleSetView('terms')} className="hover:text-white transition-colors text-left">Terms of Use</button></li>
              <li><button onClick={() => handleSetView('terms')} className="hover:text-white transition-colors text-left">DMCA Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2024 RecruiterScoop. All Rights Reserved.</p>
          <p className="mt-2 md:mt-0">Recruiting is a relationship. Know who you're getting into a relationship with.</p>
        </div>
      </footer>
    </div>
  );
}