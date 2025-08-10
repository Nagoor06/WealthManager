import React from 'react';

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      className="w-full md:w-72 border border-white/10 rounded-xl px-3 py-2 bg-transparent text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-700/40"
    />
  );
}
