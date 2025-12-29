import React, { useState, useEffect, useMemo } from 'react';
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
  FileText,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  Link as LinkIcon,
  AlertTriangle,
  Building,
  Eye,
  FileCheck,
  Scale,
  Award,
  Clock,
  Phone
} from 'lucide-react';





// ---------------------------------------------------------------- Utilities --------------------------------------------------------------




const getBrowserFingerprint = () => {
  const { userAgent, language, pixelDepth, colorDepth } = navigator;
  const { width, height } = screen;
  const timezoneOffset = new Date().getTimezoneOffset();
  const data = `${userAgent}-${language}-${width}x${height}-${pixelDepth}-${colorDepth}-${timezoneOffset}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(16);
};




// ---------------------------------------------------------- Branding Components -----------------------------------------------------------




const HeaderLogo = ({ className = "h-20 w-auto" }) => (
  <img 
    src="/eView_Silhoutte.svg" 
    alt="eView" 
    className={`${className} select-none`}
  />
);

const LandingLogo = ({ className = "h-40 w-auto" }) => (
  <img 
    src="/eView_Silhoutte_Captioned_Unbolded.svg" 
    alt="eView Logo" 
    // CHANGE 'mb-4' to 'mb-0' or remove it entirely 👇
    className={`${className} select-none mb-0 mx-auto`}
  />
);

const FooterLogo = ({ className = "h-20 w-auto" }) => (
  <img 
    src="/eView_Silhoutte_Captioned_Inverted.svg" 
    alt="eView" 
    className={`${className} select-none bm-0 tm-0`}
  />
);





// ----------------------------------------------------------- Helper Components ------------------------------------------------------------





const ComingSoonButton = ({ label, popupText, icon }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [timer, setTimer] = useState(null);

  const handleMouseEnter = () => {
    const t = setTimeout(() => setShowPopup(true), 50); 
    setTimer(t);
  };

  const handleMouseLeave = () => {
    clearTimeout(timer);
    setShowPopup(false);
  };

  return (
    <div className="relative">
      <button 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        className="bg-black text-white px-5 py-2 rounded-full cursor-not-allowed font-bold"
      >
        {label}
      </button>
      {showPopup && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-black text-white text-xs p-2 rounded shadow-lg z-50 text-center animate-in fade-in zoom-in duration-200">
          {popupText} <span className="text-lg">{icon}</span>
        </div>
      )}
    </div>
  );
};

const ShareModal = ({ isOpen, onClose, shareText, isPositive }) => {
  if (!isOpen) return null;
  const url = "https://reviewereview.com"; 
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);
  const copyToClipboard = () => {
    const el = document.createElement('textarea'); el.value = shareText; document.body.appendChild(el);
    el.select(); document.execCommand('copy'); document.body.removeChild(el); alert("Text copied to clipboard!");
  };
  const shareLinks = [
    { name: "LinkedIn", icon: <Linkedin className="w-6 h-6 text-white" />, bg: "bg-[#0077b5]", href: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}` },
    { name: "X (Twitter)", icon: <Twitter className="w-6 h-6 text-white" />, bg: "bg-black", href: `https://twitter.com/intent/tweet?text=${encodedText}` },
    { name: "Facebook", icon: <Facebook className="w-6 h-6 text-white" />, bg: "bg-[#1877f2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "Email", icon: <Mail className="w-6 h-6 text-white" />, bg: "bg-gray-600", href: `mailto:?subject=Review on eView&body=${encodedText}` }
  ];
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
        <div className="text-center mb-8">
           <h2 className="text-2xl font-black text-gray-900">Share the eView</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {shareLinks.map((link) => (
            <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={`${link.bg} p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity group`}>
              <div className="group-hover:scale-110 transition-transform duration-200">{link.icon}</div><span className="text-white font-bold text-sm">{link.name}</span>
            </a>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 truncate">{url}</div>
          <button onClick={copyToClipboard} className="bg-gray-900 text-white px-4 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Copy</button>
        </div>
      </div>
    </div>
  );
};

const GuidelinesModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border-t-4 border-blue-600">
        <div className="flex items-center gap-2 mb-4 text-gray-900"><Scale className="w-6 h-6 text-blue-600" /><h2 className="text-xl font-bold">Review Standards</h2></div>
        <p className="text-gray-600 mb-4 text-sm">eView is a professional accountability utility. To maintain data quality:</p>
        <ul className="space-y-3 mb-6 text-sm text-gray-700">
          <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /><span><strong>Focus on Process:</strong> Rate based on milestones.</span></li>
          <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /><span><strong>Be Objective:</strong> Avoid emotional language.</span></li>
          <li className="flex gap-2"><Shield className="w-4 h-4 text-blue-500 shrink-0" /><span><strong>Verifiable:</strong> You affirm you have evidence if requested.</span></li>
        </ul>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-md">Cancel</button>
          <button onClick={onAccept} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium">Accept Standards</button>
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating, setRating, interactive = true, size = "md" }) => {
  const sizeClasses = size === "lg" ? "w-8 h-8" : "w-5 h-5";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={!interactive} onClick={() => interactive && setRating(star)} className={`focus:outline-none transition-transform ${interactive ? 'hover:scale-110' : 'cursor-default'}`}>
          <Star className={`${sizeClasses} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} fill={star <= rating ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
};

const Captcha = ({ onVerify }) => {
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [val, setVal] = useState('');
  const handleChange = (e) => {
    const input = e.target.value;
    if (!/^\d*$/.test(input)) return;
    setVal(input);
    if (parseInt(input) === num1 + num2) { onVerify(true); } else { onVerify(false); }
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
      <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400" /><span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Human Check</span></div>
      <div className="flex items-center gap-3">
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-300 font-mono font-bold text-gray-800 select-none shadow-sm">{num1} + {num2} = ?</div>
        <input type="text" inputMode="numeric" value={val} onChange={handleChange} placeholder="Sum" className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-gray-800" />
        {parseInt(val) === num1 + num2 && <Shield className="w-6 h-6 text-green-500 animate-bounce" />}
      </div>
    </div>
  );
};




// ---------------------------------------------------------- Reusable Card Component --------------------------------------------------------




const RecruiterCard = ({ recruiter, onClick }) => {
  const isVerified = (recruiter.rating >= 4.5) && (recruiter.reviewCount >= 5);
  // Flag Logic: >10% Critical Reviews
  const criticalCount = recruiter.criticalFlagCount || 0;
  const totalReviews = recruiter.reviewCount || 0;
  const isFlagged = totalReviews > 0 && (criticalCount / totalReviews) >= 0.10;

  const getDateString = () => {
    if (!recruiter.lastReviewed) return 'Recently';
    return new Date(recruiter.lastReviewed.seconds * 1000).toLocaleDateString();
  };

  const getRatingStyle = (r) => {
     if (r >= 4.0) return "bg-gradient-to-br from-green-300 to-green-500";
     if (r >= 3.0) return "bg-gradient-to-br from-yellow-300 to-yellow-500";
     return "bg-gradient-to-br from-red-300 to-red-500";
  };
  
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
        {isFlagged ? (
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg border border-red-200 shadow-sm flex items-center justify-center" title="High volume of safety flags reported">
            <AlertTriangle className="w-6 h-6" />
          </div>
        ) : (
          <div className={`text-black font-black text-xl w-12 h-12 flex items-center justify-center rounded-lg shadow-sm ${getRatingStyle(recruiter.rating || 0)}`}>
            {typeof recruiter.rating === 'number' ? recruiter.rating.toFixed(1) : '-'}
          </div>
        )}
        {isVerified && !isFlagged && <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Award className="w-3 h-3" /> VERIFIED</div>}
      </div>
      <div className="pr-16">
        <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{recruiter.name || "Hiring Team"}</h3>
        <div className="text-gray-500 text-sm flex items-center gap-2 mb-2"><Building className="w-3 h-3" /> {recruiter.firm}</div>
        <div className="flex flex-col gap-1">
            {recruiter.location && <div className="flex items-center gap-2 text-xs text-gray-400"><MapPin className="w-3 h-3" /> {recruiter.location}</div>}
            {recruiter.lastReviewed && <div className="flex items-center gap-2 text-xs text-gray-400"><Clock className="w-3 h-3" /> {getDateString()}</div>}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            {recruiter.roleTitle && <div className="flex items-center gap-2 text-xs font-bold text-blue-600"><Briefcase className="w-3 h-3" /> {recruiter.roleTitle}</div>}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider"><span>{recruiter.reviewCount || 0} {recruiter.reviewCount === 1 ? 'Review' : 'Reviews'}</span></div>
        </div>
      </div>
    </div>
  );
};




// --------------------------------------------------------------- Configuration ------------------------------------------------------------




const firebaseConfig = {
  apiKey: "AIzaSyDCmNjPM2avnmrw9qOGB_7S7zG4l0AuHqc",
  authDomain: "recruiterscoop.firebaseapp.com",
  projectId: "recruiterscoop",
  storageBucket: "recruiterscoop.firebasestorage.app",
  messagingSenderId: "850975692966",
  appId: "1:850975692966:web:3f5ca72035f508a8adbc67",
  measurementId: "G-8PD21B2XYQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const appId = 'recruiter-scoop';

const STAGES = [
  { id: 'initial', label: 'Initial Chat', desc: 'Screening call.' },
  { id: 'submitted', label: 'Submitted', desc: 'Resume passed to HM.' },
  { id: 'interviewed', label: 'Interviewed', desc: 'Met Hiring Manager.' },
  { id: 'assessment', label: 'Assessment', desc: 'Take-home/Technical.' },
  { id: 'offer', label: 'Offer Stage', desc: 'Salary/Terms negotiation.' }
];

const SCOOP_TAGS = [
  { id: 'salary_transparency', label: 'Salary Provided', type: 'positive', desc: 'Range disclosed in first interaction.' },
  { id: 'timely_feedback', label: 'Timely Feedback', type: 'positive', desc: 'Updates provided within 48h.' },
  { id: 'accurate_role', label: 'Accurate Role', type: 'positive', desc: 'Job matched description perfectly.' },
  { id: 'ghosted', label: 'Process Ghosting', type: 'negative', desc: 'Communication ceased without closure.' },
  { id: 'late_feedback', label: 'Delayed Feedback', type: 'negative', desc: 'Wait times exceeded promises.' },
  { id: 'misleading', label: 'Misleading Info', type: 'negative', desc: 'Role/Salary changed during process.' },
  { id: 'fake_listing', label: 'Ghost/Fake Job', type: 'critical', desc: 'Position does not exist.' },
  { id: 'pay_to_play', label: 'Pay to Play/MLM', type: 'critical', desc: 'Required payment or recruitment.' },
  { id: 'data_mining', label: 'Data Mining', type: 'critical', desc: 'Excessive PII requested early.' }
];




// ----------------------------------------------------------------- MAIN APP ------------------------------------------------------------




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





  // -------------------------------------------------- Render Functions (Internal) ---------------------------------------------------------


  

  const renderContact = () => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-6">Contact Us</h1>
      <p className="text-gray-600 mb-8">We are here to help. Reach out with questions or feedback.</p>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-4">
         <div><label className="block text-sm font-bold text-gray-700 mb-1">Name</label><input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" placeholder="Your Name" /></div>
         <div><label className="block text-sm font-bold text-gray-700 mb-1">Email</label><input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" placeholder="you@example.com" /></div>
         <div><label className="block text-sm font-bold text-gray-700 mb-1">Phone</label><input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" placeholder="(555) 555-5555" /></div>
         <div><label className="block text-sm font-bold text-gray-700 mb-1">Message</label><textarea className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 h-32" placeholder="How can we help?" /></div>
         <a href="mailto:contact@RevieweReView.com" className="block text-center w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Send Message via Email</a>
      </div>
    </div>
  );

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
      <p className="lead text-lg md:text-xl text-gray-600 mb-8">Last Updated: December 2025.</p>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-500">This is a placeholder legal document for the prototype.</div>
    </div>
  );

  const renderAddRecruiter = () => (
    <div className="max-w-xl mx-auto px-4 py-8">
       <button onClick={() => handleSetView('home')} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium"><ChevronRight className="w-4 h-4 rotate-180" /> Back</button>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2"><UserPlus className="w-6 h-6 text-blue-600" /> Add Profile</h2>
        <form onSubmit={handleAddRecruiter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reviewer First Name <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={addRecruiterForm.firstName} onChange={e => setAddRecruiterForm({...addRecruiterForm, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reviewer Last Name <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={addRecruiterForm.lastName} onChange={e => setAddRecruiterForm({...addRecruiterForm, lastName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Role Applied For <span className="text-red-500">*</span></label>
            <input required placeholder="e.g. Software Engineer..." className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={addRecruiterForm.roleTitle} onChange={e => setAddRecruiterForm({...addRecruiterForm, roleTitle: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
            <input required placeholder="e.g. Google, Amazon..." className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={addRecruiterForm.firm} onChange={e => setAddRecruiterForm({...addRecruiterForm, firm: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location (City, State)</label>
            <input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={addRecruiterForm.location} onChange={e => setAddRecruiterForm({...addRecruiterForm, location: e.target.value})} />
          </div>
          <button type="submit" disabled={!addRecruiterForm.firm || !addRecruiterForm.roleTitle}
            className={`w-full font-bold py-4 rounded-xl transition-colors mt-6 ${addRecruiterForm.firm && addRecruiterForm.roleTitle ? 'bg-black text-white hover:bg-gray-900 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            Next: Write Review
          </button>
        </form>
      </div>
    </div>
  );

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

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center max-w-2xl">
        <LandingLogo />
        <p className="text-xl md:text-2xl text-gray-600 mb-2 font-bold">The Professional Accountability Utility.</p>
        <p className="text-sm text-gray-400 mb-10 font-medium tracking-wide uppercase">Gossip is noise. Data is power.</p>
        <div className="relative w-full max-w-xl mx-auto mb-16 shadow-2xl rounded-full bg-white group border border-gray-100">
          <div className="absolute inset-0 w-full h-16 pl-14 pr-6 rounded-full flex items-center pointer-events-none overflow-hidden text-lg">
             <span className="text-transparent whitespace-pre">{searchQuery}</span>
             {bestMatch && bestMatch.name.toLowerCase() !== searchQuery.toLowerCase() && (<span className="text-gray-300">{bestMatch.name.slice(searchQuery.length)}</span>)}
          </div>
          <input type="text" placeholder={bestMatch ? "" : "PreView, ReView, or leave an eView..."} className="relative w-full h-16 pl-14 pr-6 rounded-full border-0 bg-transparent text-lg focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 z-10 placeholder-gray-400"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown} spellCheck="false" autoComplete="off" />
          <Search className="absolute left-5 top-5 text-gray-400 w-6 h-6 z-20" />
          {bestMatch && bestMatch.name.toLowerCase() !== searchQuery.toLowerCase() && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none z-20 hidden md:block">Press <span className="border border-gray-200 bg-gray-50 rounded px-1.5 py-0.5 text-[10px]">TAB</span></div>
          )}
        </div>
      </div>
      <div className="w-full max-w-7xl">
        {searchQuery && (
          <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide flex items-center gap-2"><FileCheck className="w-5 h-5 text-blue-600" />{showAutoAddProfile ? 'Creating Profile' : 'Search Results'}</h2>
          </div>
        )}
        {showAutoAddProfile ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-6 text-blue-600"><Info className="w-5 h-5" /><span className="font-bold">No data found. Initialize a new profile.</span></div>
            <form onSubmit={handleAddRecruiter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Reviewer First Name <span className="text-gray-400 font-normal">(Optional)</span></label><input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={addRecruiterForm.firstName} onChange={e => setAddRecruiterForm({...addRecruiterForm, firstName: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Reviewer Last Name <span className="text-gray-400 font-normal">(Optional)</span></label><input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={addRecruiterForm.lastName} onChange={e => setAddRecruiterForm({...addRecruiterForm, lastName: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Role Applied For <span className="text-red-500">*</span></label><input required placeholder="e.g. Software Engineer..." className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={addRecruiterForm.roleTitle} onChange={e => setAddRecruiterForm({...addRecruiterForm, roleTitle: e.target.value})} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Company <span className="text-red-500">*</span></label><input required placeholder="e.g. Google, Amazon..." className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={addRecruiterForm.firm} onChange={e => setAddRecruiterForm({...addRecruiterForm, firm: e.target.value})} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Location (City, State)</label><input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={addRecruiterForm.location} onChange={e => setAddRecruiterForm({...addRecruiterForm, location: e.target.value})} /></div>
              <button type="submit" disabled={!addRecruiterForm.firm || !addRecruiterForm.roleTitle} className={`w-full font-bold py-4 rounded-xl transition-colors mt-6 flex items-center justify-center gap-2 ${addRecruiterForm.firm && addRecruiterForm.roleTitle ? 'bg-black text-white hover:bg-gray-900 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Proceed to Verification <ArrowRight className="w-4 h-4" /></button>
            </form>
          </div>
        ) : searchQuery ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{filteredRecruiters.map(recruiter => <RecruiterCard key={recruiter.id} recruiter={recruiter} onClick={() => { setSelectedRecruiter(recruiter); handleSetView('recruiter'); }} />)}</div>
        ) : (
          <div className="space-y-12">
            {(view === 'home' || view === 'eviews') && dashboardData.recruiters.length > 0 && (
              <div>
                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2"><h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" /> Top Individual eViews</h2></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{dashboardData.recruiters.map(recruiter => <RecruiterCard key={recruiter.id} recruiter={recruiter} onClick={() => { setSelectedRecruiter(recruiter); handleSetView('recruiter'); }} />)}</div>
              </div>
            )}
            {(view === 'home' || view === 'teams') && dashboardData.teams.length > 0 && (
              <div>
                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2"><h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><Building className="w-5 h-5 text-blue-600" /> Top Team eViews</h2></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{dashboardData.teams.map(recruiter => <RecruiterCard key={recruiter.id} recruiter={recruiter} onClick={() => { setSelectedRecruiter(recruiter); handleSetView('recruiter'); }} />)}</div>
              </div>
            )}
            {dashboardData.recruiters.length === 0 && dashboardData.teams.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4 text-lg">No data available for this region.</p>
                <button onClick={() => handleSetView('add')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg">Submit the First Review</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderRecruiterProfile = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => handleSetView('home')} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{selectedRecruiter.name || "Hiring Team"}</h1>
            <div className="flex flex-col gap-2 text-lg text-gray-600">
              <span className="flex items-center gap-2"><Building className="w-5 h-5 text-gray-400" /> {selectedRecruiter.firm}</span>
              {selectedRecruiter.roleTitle && (
                <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-gray-400" /> {selectedRecruiter.roleTitle}</span>
              )}
              <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-400" /> {selectedRecruiter.location || 'Location Not Listed'}</span>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Overall Score</div>
                <div className="text-xs text-gray-400">Based on {selectedRecruiter.reviewCount || 0} {selectedRecruiter.reviewCount === 1 ? 'review' : 'reviews'}</div>
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
            <Scale className="w-5 h-5" />
            Process Reviews
          </h3>
        </div>
        {hasReviewed ? (
          <div className="bg-green-100 text-green-800 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm border border-green-200">
            <Check className="w-5 h-5" />
            Review Verified
          </div>
        ) : (
          <button 
            onClick={() => setShowGuidelines(true)}
            className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
          >
            <Flag className="w-4 h-4" />
            Submit a Review
          </button>
        )}
      </div>

      <div className="space-y-6">
        {reviews.length > 0 ? reviews.map(review => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="mb-4">
               <h4 className="text-xl font-black text-gray-900 leading-tight mb-2">"{review.headline}"</h4>
               <div className="flex items-center gap-3 text-sm">
                 <div className={`px-2 py-0.5 rounded font-bold text-white text-xs ${
                   review.rating >= 4 ? 'bg-green-500' : review.rating >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                 }`}>
                   {review.rating ? review.rating.toFixed(1) : '-'} / 5.0
                 </div>
                 {review.stage && (
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
                     Stage: {STAGES.find(s => s.id === review.stage)?.label || review.stage}
                   </span>
                 )}
                 {review.verified && (
                   <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 border border-blue-100">
                     <FileCheck className="w-3 h-3" /> Evidence Available
                   </span>
                 )}
               </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {review.tags && review.tags.map(tagId => {
                const tagDef = SCOOP_TAGS.find(t => t.id === tagId);
                return tagDef ? (
                  <span 
                    key={tagId} 
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                      tagDef.type === 'positive' 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : tagDef.type === 'critical'
                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    {tagDef.type === 'positive' ? <Check className="w-3 h-3" /> : tagDef.type === 'critical' ? <AlertTriangle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {tagDef.label}
                  </span>
                ) : null;
              })}
            </div>

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
              title="Flag for review"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-500 mb-6">Start the paper trail for this profile.</p>
            <button 
              onClick={() => setShowGuidelines(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              Initialize Review Process
            </button>
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
             <div className="bg-blue-100 p-2 rounded-lg"><Scale className="w-6 h-6 text-blue-600" /></div>
             <h2 className="text-3xl font-black text-gray-900">Process Review</h2>
          </div>
          <p className="text-gray-500 text-lg">You are reviewing the process for <span className="font-bold text-gray-900">{selectedRecruiter.name || "Hiring Team"}</span> at {selectedRecruiter.firm}</p>
        </div>

        {/* 1. Milestones */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-900 mb-1">1. Process Milestones</h3>
          <p className="text-sm text-gray-500 mb-4">Identify objective facts about the interaction.</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Wins */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase tracking-wider mb-2">
                 <ThumbsUp className="w-4 h-4" /> Process Wins
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

            {/* Gaps */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider mb-2">
                 <ThumbsDown className="w-4 h-4" /> Process Gaps
               </div>
               {SCOOP_TAGS.filter(t => t.type === 'negative').map(tag => (
                 <button
                   key={tag.id}
                   onClick={() => toggleTag(tag.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                     rateForm.tags.includes(tag.id)
                       ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-[1.02]'
                       : 'bg-white border-red-200 text-gray-600 hover:bg-red-50'
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

            {/* Critical */}
            <div className="space-y-3 col-span-full mt-4 pt-4 border-t border-gray-100">
               <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-wider mb-2">
                 <AlertTriangle className="w-4 h-4" /> Process Failures (Accountability)
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                 {SCOOP_TAGS.filter(t => t.type === 'critical').map(tag => (
                   <button
                     key={tag.id}
                     onClick={() => toggleTag(tag.id)}
                     className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                       rateForm.tags.includes(tag.id)
                         ? 'bg-red-600 text-white border-red-600 shadow-xl transform scale-[1.02]'
                         : 'bg-white border-red-200 text-gray-600 hover:bg-red-50'
                     }`}
                   >
                     <div className="text-left">
                       <div className="font-bold text-sm">{tag.label}</div>
                       <div className={`text-xs ${rateForm.tags.includes(tag.id) ? 'text-red-100' : 'text-gray-400'}`}>{tag.desc}</div>
                     </div>
                     {rateForm.tags.includes(tag.id) && <AlertTriangle className="w-5 h-5" />}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* 2. Headline & Context */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-gray-900 mb-4">2. Context</h3>
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {STAGES.map(stage => (
              <button
                key={stage.id}
                onClick={() => setRateForm({...rateForm, stage: stage.id})}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  rateForm.stage === stage.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          <input 
            className="w-full text-xl font-bold p-4 border-b-2 border-gray-200 focus:border-black outline-none bg-transparent placeholder-gray-300 mb-6 transition-colors"
            placeholder="Headline (e.g. Professional and transparent process)"
            value={rateForm.headline}
            onChange={e => setRateForm({...rateForm, headline: e.target.value})}
          />
          
          <textarea 
            rows={4}
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Detailed notes on the process (Optional)..."
            value={rateForm.comment}
            onChange={e => setRateForm({...rateForm, comment: e.target.value})}
          />
          <div className="flex justify-end mt-1">
             <span className={`text-xs font-medium ${wordCount > MAX_WORDS ? 'text-red-500' : 'text-gray-400'}`}>
               {wordCount} / {MAX_WORDS} words
             </span>
          </div>
        </div>

        {/* 3. Verification & Rating */}
        <div className="mb-10 bg-gray-900 p-6 rounded-xl text-center text-white">
          <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Final Verdict</label>
          <div className="flex justify-center mb-4">
            <StarRating rating={rateForm.rating} setRating={(r) => setRateForm({...rateForm, rating: r})} size="lg" />
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-800">
            <input 
              type="checkbox" 
              id="verified-check" 
              className="w-5 h-5 rounded text-blue-600 focus:ring-offset-gray-900"
              checked={rateForm.verified}
              onChange={e => setRateForm({...rateForm, verified: e.target.checked})}
            />
            <label htmlFor="verified-check" className="text-sm text-gray-300 text-left cursor-pointer">
              I can provide proof of interaction (email/screenshot) if requested.
            </label>
          </div>
        </div>

        <Captcha onVerify={setCaptchaVerified} />

        <div className="mb-8 mt-6 flex gap-3 items-start">
          <input 
            type="checkbox" 
            id="legal-check" 
            className="mt-1 w-5 h-5 text-blue-600 rounded"
            checked={rateForm.agreed}
            onChange={e => setRateForm({...rateForm, agreed: e.target.checked})}
          />
          <label htmlFor="legal-check" className="text-sm text-gray-600">
            I certify this review is based on a genuine interaction and adheres to eView standards.
          </label>
        </div>

        <button 
          onClick={handleSubmitReview}
          disabled={!rateForm.stage || !rateForm.headline || rateForm.rating === 0 || !rateForm.agreed || wordCount > MAX_WORDS || !captchaVerified}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 ${
            rateForm.stage && rateForm.headline && rateForm.rating > 0 && rateForm.agreed && wordCount <= MAX_WORDS && captchaVerified
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Verified Review
        </button>
      </div>
    </div>
  );
  };





  // ---------------------------------------------------------- Main Render -----------------------------------------------------------------





  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div onClick={() => { handleSetView('home'); setSearchQuery(''); setSelectedRecruiter(null); }} className="cursor-pointer hover:opacity-80 transition-opacity"><HeaderLogo /></div>
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
            <button onClick={() => { handleSetView('eviews'); }} className="hover:text-black">Individual eViews</button>
            <button onClick={() => { handleSetView('teams'); }} className="hover:text-black">Team eViews</button>
            <button onClick={() => handleSetView('add')} className="text-black hover:text-blue-600">Add Profile</button>
            <div className="flex gap-2">
               <ComingSoonButton label="eViewer" popupText="eViewer coming soon" icon="🤫" />
               <ComingSoonButton label="eViewer Teams" popupText="eViewer Teams coming soon" icon="🙄" />
            </div>
          </div>
          <button className="md:hidden text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 p-4 shadow-xl flex flex-col gap-4 text-center">
            <button onClick={() => handleSetView('home')} className="font-bold text-gray-900 py-2">Partners</button>
            <button onClick={() => handleSetView('blog')} className="font-bold text-gray-900 py-2">Blog</button>
            <button onClick={() => handleSetView('add')} className="font-bold text-blue-600 py-2">Add Profile</button>
          </div>
        )}
      </nav>
      <main className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>
        ) : (
          <>
            {(view === 'home' || view === 'eviews' || view === 'teams') && renderHome()}
            {view === 'recruiter' && selectedRecruiter && renderRecruiterProfile()}
            {view === 'rate' && selectedRecruiter && renderRateForm()}
            {view === 'add' && renderAddRecruiter()}
            {view === 'success' && renderSuccess()}
            {view === 'blog' && renderBlog()}
            {view === 'contact' && renderContact()}
            {view === 'privacy' && renderLegal('privacy')}
            {view === 'terms' && renderLegal('terms')}
          </>
        )}
      </main>
      <footer className="bg-black text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-sm">
          <div className="col-span-1 bm-6 lg:col-span-2 pr-8">
            <div className="mb-2"><FooterLogo /></div>
            <p className="leading-relaxed mb-6 text-gray-400"><strong className="text-white block mb-2">The Professional Accountability Utility.</strong>eView is the industry standard for process transparency. We replace gossip with governance, providing objective data to optimize the hiring ecosystem.</p>
            <div className="flex gap-4"><span className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Objective</span><span className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Verified</span><span className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Secure</span></div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Utility</h4>
            <ul className="space-y-4">
              <li><button onClick={() => { handleSetView('home'); setSearchQuery(''); }} className="hover:text-white transition-colors text-left">PreView Check</button></li>
              <li><button onClick={() => handleSetView('home')} className="hover:text-white transition-colors text-left">Verified Partners</button></li>
              <li><button onClick={() => handleSetView('blog')} className="hover:text-white transition-colors text-left">Process Blog</button></li>
              <li><button onClick={() => handleSetView('blog')} className="hover:text-black">Intel Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Governance</h4>
            <ul className="space-y-4">
              <li><button onClick={() => handleSetView('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => handleSetView('terms')} className="hover:text-white transition-colors text-left">Terms of Use</button></li>
              <li><button onClick={() => handleSetView('terms')} className="hover:text-white transition-colors text-left">Standards</button></li>
              <li><button onClick={() => handleSetView('contact')} className="hover:text-white transition-colors text-left">Contact Us</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2025 eView. All Rights Reserved.</p>
          <p className="mt-2 md:mt-0">We aren't here to burn bridges; we're here to light the way.</p>
        </div>
      </footer>
    </div>
  );
}
