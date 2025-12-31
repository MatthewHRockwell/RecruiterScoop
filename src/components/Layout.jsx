import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { HeaderLogo, FooterLogo } from './Logos';
import ComingSoonButton from './ComingSoonButton';

const Layout = ({ children, setView, setSearchQuery, setSelectedRecruiter }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    setView('home');
    setSearchQuery('');
    setSelectedRecruiter(null);
  };

  const navLinks = (
    <>
      <button onClick={() => setView('eviews')} className="hover:text-black">Individual eViews</button>
      <button onClick={() => setView('teams')} className="hover:text-black">Team eViews</button>
      <button onClick={() => setView('add')} className="text-black hover:text-blue-600">Add Profile</button>
    </>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <HeaderLogo onClick={handleLogoClick} />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
            {navLinks}
            <div className="flex gap-2">
               <ComingSoonButton label="eView" popupText="eView coming soon" />
               <ComingSoonButton label="eView Teams" popupText="eView Teams coming soon" />
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 p-4 shadow-xl flex flex-col gap-4 text-center">
             {navLinks}
             <button onClick={() => setView('blog')} className="font-bold text-gray-900 py-2">Blog</button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-sm">
          <div className="col-span-1 bm-6 lg:col-span-2 pr-8">
            <div className="mb-0"><FooterLogo /></div>
            <p className="leading-relaxed mb-6 text-gray-400"><strong className="text-white block mb-2">The Professional Accountability Utility.</strong>eView is the industry standard for process transparency.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Utility</h4>
            <ul className="space-y-4">
              <li><button onClick={handleLogoClick} className="hover:text-white transition-colors text-left">PreView Check</button></li>
              <li><button onClick={() => setView('blog')} className="hover:text-white transition-colors text-left">Intel Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Governance</h4>
            <ul className="space-y-4">
              <li><button onClick={() => setView('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => setView('terms')} className="hover:text-white transition-colors text-left">Terms of Use</button></li>
              <li><button onClick={() => setView('contact')} className="hover:text-white transition-colors text-left">Contact Us</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2025 Rockwell Industries LLC. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;