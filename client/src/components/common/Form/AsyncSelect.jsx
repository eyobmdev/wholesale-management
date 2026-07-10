import React, { useState, useEffect, useRef } from 'react';
import './Form.css';

export const AsyncSelect = ({
  value,
  onChange,
  loadOptions, // a function that takes search string and returns Promise resolving to [{label, value}]
  placeholder = 'Search...',
  className = '',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced load options
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await loadOptions(search);
        setOptions(results || []);
      } catch (err) {
        console.error('AsyncSelect loadOptions failed:', err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, isOpen, loadOptions]);

  // Initial load to resolve label if a value is pre-selected and we don't know the label yet
  useEffect(() => {
    if (value && !selectedLabel) {
      // Just fire a blank search and hopefully it's in the initial list, 
      // or we just show the ID. In a perfect world, we'd have a getOption(id)
      loadOptions('').then(res => {
        const opt = res.find(r => r.value.toString() === value.toString());
        if (opt) setSelectedLabel(opt.label);
      }).catch(() => {});
    } else if (!value) {
      setSelectedLabel('');
    }
  }, [value, loadOptions, selectedLabel]);

  const hasError = !!error;
  const selectClasses = [
    'common-input',
    'async-select-input',
    hasError ? 'has-error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-input-wrapper async-select-container" ref={containerRef} style={{ position: 'relative' }}>
      <div 
        className={selectClasses} 
        style={{ display: 'flex', alignItems: 'center', cursor: 'text', paddingRight: '30px' }}
        onClick={() => setIsOpen(true)}
      >
        {!isOpen && (
          <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: value ? 'inherit' : '#9ca3af' }}>
            {value ? selectedLabel || value : placeholder}
          </div>
        )}
        {isOpen && (
          <input
            autoFocus
            type="text"
            className="async-select-inner-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'inherit' }}
          />
        )}
        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
          {isLoading ? (
            <i className="ri-loader-4-line spinner-icon"></i>
          ) : (
            <i className={isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          )}
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--card-bg, #fff)',
          border: '1px solid var(--card-border, #e5e7eb)',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {/* Always provide a way to clear selection */}
          <div 
            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--card-border, #e5e7eb)', color: 'var(--text-muted)' }}
            onClick={() => {
              onChange('');
              setSelectedLabel('');
              setSearch('');
              setIsOpen(false);
            }}
          >
            <em>Clear Selection</em>
          </div>

          {options.length === 0 && !isLoading && (
            <div style={{ padding: '8px 12px', color: '#9ca3af', textAlign: 'center' }}>
              No results found
            </div>
          )}
          {options.map((opt) => (
            <div
              key={opt.value}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: value?.toString() === opt.value?.toString() ? 'var(--primary-color-light, #eff6ff)' : 'transparent',
                color: value?.toString() === opt.value?.toString() ? 'var(--primary-color, #2563eb)' : 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #f3f4f6)'}
              onMouseLeave={(e) => e.currentTarget.style.background = value?.toString() === opt.value?.toString() ? 'var(--primary-color-light, #eff6ff)' : 'transparent'}
              onClick={() => {
                onChange(opt.value);
                setSelectedLabel(opt.label);
                setSearch('');
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
