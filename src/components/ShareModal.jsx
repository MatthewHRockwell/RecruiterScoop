import React from 'react';
import { X, Link as LinkIcon, Mail, Linkedin, Twitter, Facebook } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, shareText, isPositive }) => {
  if (!isOpen) return null;

  const url = "https://reviewereview.com"; 
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const copyToClipboard = () => {
    const el = document.createElement('textarea'); 
    el.value = shareText; 
    document.body.appendChild(el);
    el.select(); 
    document.execCommand('copy'); 
    document.body.removeChild(el); 
    alert("Text copied to clipboard!");
  };

  const shareLinks = [
    { name: "LinkedIn", icon: <Linkedin className="w-6 h-6 text-white" />, bg: "bg-[#0077b5]", href: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}` },
    { name: "X (Twitter)", icon: <Twitter className="w-6 h-6 text-white" />, bg: "bg-black", href: `https://twitter.com/intent/tweet?text=${encodedText}` },
    { name: "Facebook", icon: <Facebook className="w-6 h-6 text-white" />, bg: "bg-[#1877f2]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "Email", icon: <Mail className="w-6 h-6 text-white" />, bg: "bg-gray-600", href: `mailto:?subject=Review on eView&body=${encodedText}` }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-8">
           <h2 className="text-2xl font-black text-gray-900">Share the eView</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {shareLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${link.bg} p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity group`}
            >
              <div className="group-hover:scale-110 transition-transform duration-200">{link.icon}</div>
              <span className="text-white font-bold text-sm">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 truncate">{url}</div>
          <button onClick={copyToClipboard} className="bg-gray-900 text-white px-4 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;