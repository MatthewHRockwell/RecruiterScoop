import React from 'react';
import { Scale, ThumbsUp, ThumbsDown, AlertTriangle, Check, X, ChevronRight } from 'lucide-react';
import StarRating from './StarRating';
import Captcha from './Captcha';
import { STAGES, SCOOP_TAGS } from '../constants/data';

const RateForm = ({ 
  selectedRecruiter, 
  rateForm, 
  setRateForm, 
  captchaVerified, 
  setCaptchaVerified, 
  onSubmit, 
  onCancel 
}) => {
  
  // Helper logic moved here to clean up App.jsx
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

  const MAX_WORDS = 300;
  const wordCount = rateForm.comment.trim() ? rateForm.comment.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={onCancel} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
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
          onClick={onSubmit}
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

export default RateForm;