import React from 'react';
import { 
  AlertTriangle, 
  Award, 
  Building, 
  MapPin, 
  Clock, 
  Briefcase 
} from 'lucide-react';

const RecruiterCard = ({ recruiter, onClick }) => {
  // 1. Helper Logic
  const isVerified = (recruiter.rating >= 4.5) && (recruiter.reviewCount >= 5);
  
  // Flag Logic: >10% Critical Reviews
  const criticalCount = recruiter.criticalFlagCount || 0;
  const totalReviews = recruiter.reviewCount || 0;
  const isFlagged = totalReviews > 0 && (criticalCount / totalReviews) >= 0.10;

  const getDateString = () => {
    if (!recruiter.lastReviewed) return 'Recently';
    // Handle Firebase Timestamp (seconds)
    return new Date(recruiter.lastReviewed.seconds * 1000).toLocaleDateString();
  };

  const getRatingStyle = (r) => {
     if (r >= 4.0) return "bg-gradient-to-br from-green-300 to-green-500";
     if (r >= 3.0) return "bg-gradient-to-br from-yellow-300 to-yellow-500";
     return "bg-gradient-to-br from-red-300 to-red-500";
  };

  // 2. The UI
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
      
      {/* Top Right: Rating Badge */}
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
        
        {isVerified && !isFlagged && (
          <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <Award className="w-3 h-3" /> VERIFIED
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="pr-16">
        <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{recruiter.name || "Hiring Team"}</h3>
        
        <div className="text-gray-500 text-sm flex items-center gap-2 mb-2">
          <Building className="w-3 h-3" /> {recruiter.firm}
        </div>
        
        <div className="flex flex-col gap-1">
            {recruiter.location && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="w-3 h-3" /> {recruiter.location}
              </div>
            )}
            {recruiter.lastReviewed && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" /> {getDateString()}
              </div>
            )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            {recruiter.roleTitle && (
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                <Briefcase className="w-3 h-3" /> {recruiter.roleTitle}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>{recruiter.reviewCount || 0} {recruiter.reviewCount === 1 ? 'Review' : 'Reviews'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterCard;