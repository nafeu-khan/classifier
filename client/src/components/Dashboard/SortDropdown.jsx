import React, { useState , useEffect , useRef, use } from 'react';

const SortDropdown = ({ sortOption, setSortOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (sortOption) => {
    setSortOption(sortOption);
    setIsOpen(false);
  };

  useEffect(() => { 
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex justify-center w-full rounded-md border border-green-600 text-gray-700 dark:bg-gray-700 dark:text-white px-4 py-1 text-sm font-medium"
      >
        <span className='font-bold mr-1'>
        Sort By :
        </span>
         {sortOption}
        <svg
          className={`w-5 h-5 ml-2 transition-transform transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-36 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1 text-sm text-gray-300">
            <button
              onClick={() => handleSelect('Newest')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Newest
            </button>
            <button
              onClick={() => handleSelect('Updated')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Updated
            </button>
            <button
              onClick={() => handleSelect('Filename')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Filename
            </button>
            <button
              onClick={() => handleSelect('Oldest')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Oldest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
