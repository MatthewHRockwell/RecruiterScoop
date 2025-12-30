import React, { useState } from 'react';
import { Lock, Shield } from 'lucide-react';

const Captcha = ({ onVerify }) => {
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [val, setVal] = useState('');

  const handleChange = (e) => {
    const input = e.target.value;
    if (!/^\d*$/.test(input)) return; // Only allow numbers
    
    setVal(input);
    
    if (parseInt(input) === num1 + num2) { 
        onVerify(true); 
    } else { 
        onVerify(false); 
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Human Check</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-300 font-mono font-bold text-gray-800 select-none shadow-sm">
            {num1} + {num2} = ?
        </div>
        
        <input 
            type="text" 
            inputMode="numeric" 
            value={val} 
            onChange={handleChange} 
            placeholder="Sum" 
            className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-gray-800" 
        />
        
        {parseInt(val) === num1 + num2 && (
            <Shield className="w-6 h-6 text-green-500 animate-bounce" />
        )}
      </div>
    </div>
  );
};

export default Captcha;