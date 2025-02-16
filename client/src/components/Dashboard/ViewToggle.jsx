import React from 'react';

const ViewToggle = ({ view, setView }) => {

  const handleToggle = (view) => {
    setView(view);
  };

  return (
    <div className="flex space-x-2 border border-green-300 rounded-xl px-3 py-1">
      {/* List View Button */}
      <button
        onClick={() => handleToggle('list')}
        className={`flex items-center justify-center w-6 h-6 text-sm rounded-md  ${
          view === 'list' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400'
        } focus:outline-none`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* Grid View Button */}
      <button
        onClick={() => handleToggle('grid')}
        className={`flex items-center justify-center w-6 h-6 text-sm rounded-md ${
          view === 'grid' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400'
        } focus:outline-none`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6H4z"
          />
        </svg>
      </button>
    </div>
  );
};

export default ViewToggle;
