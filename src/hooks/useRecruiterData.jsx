import { useMemo } from 'react';

export const useRecruiterData = (recruiters, searchQuery, userLocation) => {
  
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
    if (searchQuery) return { candidates: [], interviewers: [], recruiters: [], teams: [] };
    
    const isCriticalProfile = (r) => {
      const total = r.reviewCount || 0;
      if (total === 0) return false;
      return (r.criticalFlagCount || 0) / total >= 0.10;
    };

    const ranker = (a, b) => {
       const aBad = isCriticalProfile(a); const bBad = isCriticalProfile(b);
       if (aBad && !bBad) return 1; if (!aBad && bBad) return -1;
       if (userLocation) {
         const aLoc = (a.location || '').toLowerCase(); const bLoc = (b.location || '').toLowerCase(); 
         const loc = userLocation.toLowerCase();
         if (aLoc.includes(loc) && !bLoc.includes(loc)) return -1; 
         if (!aLoc.includes(loc) && bLoc.includes(loc)) return 1;
       }
       const scoreA = (a.rating || 0) * Math.log((a.reviewCount || 0) + 1);
       const scoreB = (b.rating || 0) * Math.log((b.reviewCount || 0) + 1);
       return scoreB - scoreA;
    };

    const allNamed = recruiters.filter(r => r.name && r.name.trim() !== '');
    
    // --- 4-WAY SPLIT LOGIC ---
    
    // 1. Candidates
    const candidates = allNamed.filter(r => r.type === 'candidate' || r.isCandidate === true);
    
    // 2. Recruiters (Agency/External)
    const recruitersList = allNamed.filter(r => r.type === 'recruiter');
    
    // 3. Interviewers (Hiring Managers / Internal)
    // Fallback: If no type specified and not isCandidate, assume Interviewer (Legacy Default)
    const interviewers = allNamed.filter(r => r.type === 'interviewer' || (!r.type && !r.isCandidate));
    
    // 4. Hiring Teams (No name)
    const hiringTeams = recruiters.filter(r => !r.name || r.name.trim() === '');
    
    return { 
        candidates: candidates.sort(ranker),
        recruiters: recruitersList.sort(ranker),
        interviewers: interviewers.sort(ranker), 
        teams: hiringTeams.sort(ranker) 
    };
  }, [recruiters, userLocation, searchQuery]);

  const showAutoAddProfile = searchQuery.length > 0 && filteredRecruiters.length === 0;

  const bestMatch = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    const searchLower = searchQuery.toLowerCase();
    const matches = recruiters.filter(r => r.name?.toLowerCase().startsWith(searchLower));
    if (matches.length === 0) return null;
    return matches.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0];
}, [recruiters, searchQuery]);

  return { filteredRecruiters, dashboardData, showAutoAddProfile, bestMatch };
};