// src/components/ui/Input.tsx

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

const Input: React.FC<InputProps> = ({ label, name, ...rest }) => {
  return (
    <div className="mb-4"> {/* Add margin below the input for spacing */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        {...rest}
        // FIXES: Add h-10 for fixed height, increase p-y, and ensure appearance-none
        className="w-full h-10 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md 
                   focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 
                   appearance-none !box-border" // !box-border might help with height calculation
      />
    </div>
  );
};

export default Input;