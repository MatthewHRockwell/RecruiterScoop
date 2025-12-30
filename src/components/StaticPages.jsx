import React from 'react';

export const ContactPage = () => (
  <div className="max-w-2xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-black mb-6">Contact Us</h1>
    <p className="text-gray-600 mb-8">We are here to help. Reach out with questions or feedback.</p>
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-4">
       <div>
         <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
         <input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" placeholder="Your Name" />
       </div>
       <div>
         <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
         <input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" placeholder="you@example.com" />
       </div>
       <div>
         <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
         <input className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" placeholder="(555) 555-5555" />
       </div>
       <div>
         <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
         <textarea className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 h-32" placeholder="How can we help?" />
       </div>
       <a href="mailto:contact@RevieweReView.com" className="block text-center w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
         Send Message via Email
       </a>
    </div>
  </div>
);

export const BlogPage = () => (
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

export const LegalPage = ({ type }) => (
  <div className="max-w-3xl mx-auto px-4 py-12 prose prose-blue">
    <h1 className="text-2xl md:text-3xl font-black mb-6">{type === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}</h1>
    <p className="lead text-lg md:text-xl text-gray-600 mb-8">Last Updated: December 2025.</p>
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-500">
      This is a placeholder legal document for the prototype.
    </div>
  </div>
);