import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

const SuccessView = ({ submittedReview, onGoHome }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  if (!submittedReview) return null;

  const isPositive = submittedReview.rating >= 4;
  const isNegative = submittedReview.rating <= 2;

  let content = {
    headline: "Intel Received. 📂", 
    emoji: "📂",
    body: "You're officially an insider. Thanks to you, the hiring market just got a little less opaque.",
    primaryBtn: "Share Intel", 
    shareText: `Just checked the intel on my recruiter at RecruiterScoop.com. Don't fly blind.`, 
    secondaryLink: "Search for another recruiter"
  };

  if (isPositive) {
    content = {
      headline: "Review Secured.", 
      emoji: "🚀", 
      body: "Thanks for highlighting the good ones! Your review is now live.",
      primaryBtn: "Share the Love", 
      shareText: `Just gave my recruiter a glowing review on RecruiterScoop.com.`, 
      secondaryLink: "See who else is hiring"
    };
  } else if (isNegative) {
    content = {
      headline: "Loud and Clear.", 
      emoji: "🛡️", 
      body: "Thanks for speaking up. Your review has been added to the database.",
      primaryBtn: "Warn Your Network", 
      shareText: `Hiring is tough enough without bad actors. I just dropped some honest intel.`, 
      secondaryLink: "Read other horror stories"
    };
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full text-center relative overflow-hidden">
        {/* Sentiment Bar */}
        <div className={`absolute top-0 left-0 w-full h-3 ${isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-blue-600'}`}></div>
        
        <div className="text-6xl mb-6">{content.emoji}</div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">{content.headline}</h2>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">{content.body}</p>
        
        {/* Review Preview */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-10 text-left shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Review Confirmed</div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">"{submittedReview.headline}"</h3>
          <div className="text-gray-500 font-medium">Re: {submittedReview.recruiterName} <span className="text-gray-300 mx-2">|</span> {submittedReview.firm}</div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setShareModalOpen(true)} 
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 ${isPositive ? 'bg-green-600 hover:bg-green-700' : isNegative ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Share2 className="w-5 h-5" />{content.primaryBtn}
          </button>
          
          <button onClick={onGoHome} className="text-gray-500 font-bold hover:text-gray-900 py-2">
            {content.secondaryLink}
          </button>
        </div>

        <ShareModal 
            isOpen={shareModalOpen} 
            onClose={() => setShareModalOpen(false)} 
            shareText={content.shareText} 
            isPositive={isPositive} 
        />
      </div>
    </div>
  );
};

export default SuccessView;