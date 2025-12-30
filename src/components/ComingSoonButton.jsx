import React, { useState } from 'react';

const ComingSoonButton = ({ label, popupText, icon }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [timer, setTimer] = useState(null);

  const handleMouseEnter = () => {
    const t = setTimeout(() => setShowPopup(true), 50); 
    setTimer(t);
  };

  const handleMouseLeave = () => {
    clearTimeout(timer);
    setShowPopup(false);
  };

  return (
    <div className="relative">
      <button 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        className="bg-black text-white px-5 py-2 rounded-full cursor-not-allowed font-bold"
      >
        {label}
      </button>
      {showPopup && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-black text-white text-xs p-2 rounded shadow-lg z-50 text-center animate-in fade-in zoom-in duration-200">
          {popupText} <span className="text-lg">{icon}</span>
        </div>
      )}
    </div>
  );
};

export default ComingSoonButton;