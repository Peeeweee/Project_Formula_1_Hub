import React from 'react';

function SearchBar({ placeholder, onSearch }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        onChange={(e) => onSearch && onSearch(e.target.value)}
        className="w-full bg-[#07070a] border border-f1-border text-f1-light placeholder-f1-muted text-sm px-4 py-2.5 rounded-md focus:ring-2 focus:ring-f1-red focus:border-transparent outline-none transition duration-300"
      />
    </div>
  );
}

export default SearchBar;
