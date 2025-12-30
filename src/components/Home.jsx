import React from 'react';
import { Search, UserPlus, Building, FileCheck, ArrowRight, Info } from 'lucide-react';
import { LandingLogo } from './Logos';
import RecruiterCard from './RecruiterCard';

const Home = ({ 
  searchQuery, setSearchQuery, bestMatch, handleSearchKeyDown, 
  filteredRecruiters, showAutoAddProfile, handleAddRecruiter, 
  addRecruiterForm, setAddRecruiterForm, dashboardData, 
  view, handleSetView, setSelectedRecruiter 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* 1. Hero Section */}
      <div className="text-center max-w-2xl">
        <LandingLogo />
        <p className="text-xl md:text-2xl text-gray-600 mb-2 font-bold">The Professional Accountability Utility.</p>
        <p className="text-sm text-gray-400 mb-10 font-medium tracking-wide uppercase">Gossip is noise. Data is power.</p>
        
        {/* Search Bar */}
        <div className="relative w-full max-w-xl mx-auto mb-16 shadow-2xl rounded-full bg-white group border border-gray-100">
          <div className="absolute inset-0 w-full h-16 pl-14 pr-6 rounded-full flex items-center pointer-events-none overflow-hidden text-lg">
             <span className="text-transparent whitespace-pre">{searchQuery}</span>
             {bestMatch && bestMatch.name.toLowerCase() !== searchQuery.toLowerCase() && (<span className="text-gray-300">{bestMatch.name.slice(searchQuery.length)}</span>)}
          </div>
          <input 
            type="text" 
            placeholder={bestMatch ? "" : "PreView, ReView, or leave an eView..."} 
            className="relative w-full h-16 pl-14 pr-6 rounded-full border-0 bg-transparent text-lg focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 z-10 placeholder-gray-400"
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            onKeyDown={handleSearchKeyDown} 
            spellCheck="false" 
            autoComplete="off" 
          />
          <Search className="absolute left-5 top-5 text-gray-400 w-6 h-6 z-20" />
          {bestMatch && bestMatch.name.toLowerCase() !== searchQuery.toLowerCase() && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none z-20 hidden md:block">Press <span className="border border-gray-200 bg-gray-50 rounded px-1.5 py-0.5 text-[10px]">TAB</span></div>
          )}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="w-full max-w-7xl">
        {searchQuery && (
          <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide flex items-center gap-2"><FileCheck className="w-5 h-5 text-blue-600" />{showAutoAddProfile ? 'Creating Profile' : 'Search Results'}</h2>
          </div>
        )}

        {showAutoAddProfile ? (
          /* Auto-Add Form */
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
          /* Search Results */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{filteredRecruiters.map(recruiter => <RecruiterCard key={recruiter.id} recruiter={recruiter} onClick={() => { setSelectedRecruiter(recruiter); handleSetView('recruiter'); }} />)}</div>
        ) : (
          /* Dashboard */
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
};

export default Home;