import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSplitImageCategory } from '@/redux/splitImageCategorySlice';

const SplitDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const [splitValue, setSplitValue] = useState(useSelector((state) => state.imageCategory.splitImageCategory));

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelection = (value) => {
    setSplitValue(value);
    setIsOpen(false);
    dispatch(setSplitImageCategory(value));
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
    <div className="relative inline-block text-left " ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex justify-center w-full rounded-md bg-gray-700 text-white px-4 py-1 border border-green-600 text-sm font-medium"
      >
        {splitValue}
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
        <div className="absolute mt-2 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1 text-sm text-gray-300">
            <button
              onClick={() => handleSelection('all')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              All
            </button>
            <button
              onClick={() => handleSelection('train')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Train
            </button>
            <button
              onClick={() => handleSelection('validation')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Valid
            </button>
            <button
              onClick={() => handleSelection('test')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitDropdown;
