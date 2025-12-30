import React from 'react';
import { Scale, Check, Shield } from 'lucide-react';

const GuidelinesModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border-t-4 border-blue-600">
        <div className="flex items-center gap-2 mb-4 text-gray-900">
            <Scale className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Review Standards</h2>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">eView is a professional accountability utility. To maintain data quality:</p>
        
        <ul className="space-y-3 mb-6 text-sm text-gray-700">
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-green-500 shrink-0" />
            <span><strong>Focus on Process:</strong> Rate based on milestones.</span>
          </li>
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-green-500 shrink-0" />
            <span><strong>Be Objective:</strong> Avoid emotional language.</span>
          </li>
          <li className="flex gap-2">
            <Shield className="w-4 h-4 text-blue-500 shrink-0" />
            <span><strong>Verifiable:</strong> You affirm you have evidence if requested.</span>
          </li>
        </ul>
        
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-md">Cancel</button>
          <button onClick={onAccept} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium">Accept Standards</button>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesModal;