import { useMemo } from 'react';

export const useRecruiterData = (recruiters, searchQuery, userLocation) => {
  
  // 1. Filtered List Logic
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

  // 2. Dashboard Logic
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
         const aLoc = (a.location || '').toLowerCase(); 
         const bLoc = (b.location || '').toLowerCase(); 
         const loc = userLocation.toLowerCase();
         const aIsLocal = aLoc.includes(loc); 
         const bIsLocal = bLoc.includes(loc);
         if (aIsLocal && !bIsLocal) return -1; 
         if (!aIsLocal && bIsLocal) return 1;
       }
       
       const scoreA = (a.rating || 0) * Math.log((a.reviewCount || 0) + 1);
       const scoreB = (b.rating || 0) * Math.log((b.reviewCount || 0) + 1);
       return scoreB - scoreA;
    };

    const namedRecruiters = recruiters.filter(r => r.name && r.name.trim() !== '');
    const hiringTeams = recruiters.filter(r => !r.name || r.name.trim() === '');
    
    return { 
        recruiters: namedRecruiters.sort(ranker).slice(0, 8), 
        teams: hiringTeams.sort(ranker).slice(0, 8) 
    };
  }, [recruiters, userLocation, searchQuery]);

  // 3. Derived State
  const showAutoAddProfile = searchQuery.length > 0 && filteredRecruiters.length === 0;

  // 4. Best Match
  const bestMatch = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;
    const searchLower = searchQuery.toLowerCase();
    const matches = recruiters.filter(r => r.name?.toLowerCase().startsWith(searchLower));
    if (matches.length === 0) return null;
    return matches.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0];
}, [recruiters, searchQuery]);

  return { filteredRecruiters, dashboardData, showAutoAddProfile, bestMatch };
};