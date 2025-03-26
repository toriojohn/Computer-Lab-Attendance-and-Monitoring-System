import React, { useState, useEffect } from 'react';

// Define the props type
interface MultiSelectDropdownProps {
  options: string[];
  onChange: (selectedOptions: string[]) => void;
  defaultValue?: string[]; // Add defaultValue prop
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  onChange,
  defaultValue = [], // Default to an empty array if no defaultValue is provided
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValue); // Initialize with defaultValue
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Update selectedOptions when defaultValue changes
  useEffect(() => {
    setSelectedOptions(defaultValue);
  }, [defaultValue]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: string) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option) // Deselect if already selected
      : [...selectedOptions, option]; // Select if not already selected

    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions); // Notify parent component of the change
  };

  return (
    <div className="relative w-64">
      {/* Dropdown Header */}
      <div
        className="flex justify-between items-center p-2 border border-gray-300 rounded cursor-pointer bg-white"
        onClick={toggleDropdown}
      >
        <span className="truncate">
          {selectedOptions.length > 0
            ? selectedOptions.join(', ')
            : 'Select options'}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute mt-1 w-full border border-gray-300 rounded bg-white shadow-lg z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedOptions.includes(option) ? 'bg-gray-200' : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;