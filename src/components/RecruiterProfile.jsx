import React, { useState } from 'react';
import { ChevronRight, Building, Briefcase, MapPin, Scale, Check, Flag, FileCheck, AlertTriangle, X, FileText } from 'lucide-react';
import { STAGES, SCOOP_TAGS } from '../constants/data';
import GuidelinesModal from './GuidelinesModal';

const RecruiterProfile = ({ 
  selectedRecruiter, handleSetView, hasReviewed, reviews, handleFlagReview 
}) => {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => handleSetView('home')} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </button>
      
      {/* Header Card */}
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

      {/* Action Bar */}
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

      {/* Reviews List */}
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
};

export default RecruiterProfile;