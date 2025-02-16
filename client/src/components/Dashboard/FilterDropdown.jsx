import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ selectedItems, setSelectedItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleToggleAll = () => {
    if (selectedItems.length === 5) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems(['antenna', 'chimney', 'null', 'power-lines', 'wind-turbine']); // Select all
    }
  };

  const handleClearAll = () => {
    setSelectedItems([]); // Clear all selections
  };

  const toggleItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
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
        className="inline-flex justify-center w-full rounded-md dark:bg-gray-700 border border-green-600 text-gray-700 dark:text-white px-4 py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Select
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
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-2 px-4 text-sm text-gray-300">
            <div className="flex justify-between items-center mb-2">
              <button onClick={handleToggleAll} className="text-green-500">
                Select All
              </button>
              <button onClick={handleClearAll} className="text-red-500">
                Clear All
              </button>
            </div>
            {['antenna', 'chimney', 'null', 'power-lines', 'wind-turbine'].map((item) => (
              <div
                key={item}
                className="flex items-center space-x-2 py-1 cursor-pointer"
                onClick={() => toggleItem(item)}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item)}
                  readOnly
                  className="form-checkbox text-teal-500"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
