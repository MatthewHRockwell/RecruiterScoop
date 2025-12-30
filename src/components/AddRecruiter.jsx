import React from 'react';
import { UserPlus, ArrowRight, ChevronRight } from 'lucide-react';

const AddRecruiter = ({ form, setForm, onSubmit, onCancel }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={onCancel} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back
      </button>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" /> Add Profile
        </h2>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reviewer First Name <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input 
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={form.firstName} 
                onChange={e => setForm({...form, firstName: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reviewer Last Name <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input 
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={form.lastName} 
                onChange={e => setForm({...form, lastName: e.target.value})} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Role Applied For <span className="text-red-500">*</span></label>
            <input 
                required 
                placeholder="e.g. Software Engineer..." 
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={form.roleTitle} 
                onChange={e => setForm({...form, roleTitle: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
            <input 
                required 
                placeholder="e.g. Google, Amazon..." 
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={form.firm} 
                onChange={e => setForm({...form, firm: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location (City, State)</label>
            <input 
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!form.firm || !form.roleTitle}
            className={`w-full font-bold py-4 rounded-xl transition-colors mt-6 flex items-center justify-center gap-2 ${form.firm && form.roleTitle ? 'bg-black text-white hover:bg-gray-900 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Next: Write Review <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecruiter;