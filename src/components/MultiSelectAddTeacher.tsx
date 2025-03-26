// MultiSelectAddTeacher.tsx
import React, { useState } from 'react';

interface MultiSelectDropdownProps {
  options: string[];
  onChange: (selectedOptions: string[]) => void;
  defaultValue?: string[];
}

const MultiSelectAddTeacher: React.FC<MultiSelectDropdownProps> = ({
  options,
  onChange,
  defaultValue = [],
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: string) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];

    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

  return (
    <div className="relative w-full">
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

export default MultiSelectAddTeacher;