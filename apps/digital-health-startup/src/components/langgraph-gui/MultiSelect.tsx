import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import './MultiSelect.css';

interface MultiSelectOption {
  id: string;
  name: string;
  description?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  label,
  hint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionId: string) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(id => id !== optionId));
  };

  const selectedOptions = options.filter(opt => selected.includes(opt.id));

  return (
    <div className="multi-select-container">
      {label && <label className="form-label">{label}</label>}
      <div className="multi-select-wrapper" ref={dropdownRef}>
        <div
          className={`multi-select-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="multi-select-value">
            {selected.length === 0 ? (
              <span className="multi-select-placeholder">{placeholder}</span>
            ) : (
              <div className="multi-select-tags">
                {selectedOptions.slice(0, 2).map(opt => (
                  <span key={opt.id} className="multi-select-tag">
                    {opt.name}
                    <button
                      type="button"
                      className="multi-select-tag-remove"
                      onClick={(e) => removeOption(opt.id, e)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {selectedOptions.length > 2 && (
                  <span className="multi-select-tag-more">+{selectedOptions.length - 2} more</span>
                )}
              </div>
            )}
          </div>
          <ChevronDown className={`multi-select-chevron ${isOpen ? 'open' : ''}`} size={16} />
        </div>

        {isOpen && (
          <div className="multi-select-dropdown">
            <div className="multi-select-options">
              {options.map(option => {
                const isSelected = selected.includes(option.id);
                return (
                  <div
                    key={option.id}
                    className={`multi-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="multi-select-option-check">
                      {isSelected && <Check size={14} />}
                    </div>
                    <div className="multi-select-option-content">
                      <div className="multi-select-option-name">{option.name}</div>
                      {option.description && (
                        <div className="multi-select-option-description">{option.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {selected.length > 0 && (
              <div className="multi-select-footer">
                <button
                  type="button"
                  className="multi-select-clear"
                  onClick={() => onChange([])}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
};

