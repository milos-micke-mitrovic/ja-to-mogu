'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui';
import { useDestinations } from '@/hooks/use-destinations';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DestinationSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onCustomDestinationChange?: (value: string) => void;
  customDestination?: string;
  placeholder?: string;
  disabled?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function DestinationSelect({
  value,
  onValueChange,
  onCustomDestinationChange,
  customDestination = '',
  placeholder = 'Pretražite ili unesite destinaciju',
  disabled = false,
  showAllOption = false,
  allOptionLabel = 'Sve destinacije',
}: DestinationSelectProps) {
  const { countries, cities, isLoading } = useDestinations();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display text for the selected value
  const getDisplayText = () => {
    if (customDestination) return customDestination;
    if (value) {
      const city = cities.find((c) => c.id === value);
      return city ? city.name : value;
    }
    return '';
  };

  const displayText = getDisplayText();

  // Filter cities based on search (show all when search is empty)
  const filteredCountries = search.trim()
    ? countries.map((country) => ({
        ...country,
        regions: country.regions.map((region) => ({
          ...region,
          cities: region.cities.filter((city) =>
            city.name.toLowerCase().includes(search.toLowerCase())
          ),
        })).filter((region) => region.cities.length > 0),
      })).filter((country) => country.regions.length > 0)
    : countries;

  const hasResults = filteredCountries.some((c) => c.regions.some((r) => r.cities.length > 0));

  const handleSelect = (cityId: string) => {
    onValueChange(cityId);
    onCustomDestinationChange?.('');
    setSearch('');
    setIsOpen(false);
  };

  const handleCustomInput = () => {
    if (search.trim().length >= 2) {
      onValueChange('');
      onCustomDestinationChange?.(search.trim());
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onValueChange('');
    onCustomDestinationChange?.('');
    setSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (!isOpen) setIsOpen(true);
    // If the user is typing, treat it as custom destination in real-time
    if (val.trim()) {
      onValueChange('');
      onCustomDestinationChange?.(val.trim());
    } else {
      onCustomDestinationChange?.('');
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    // If there's a selected value, populate search with the display text for editing
    if (displayText && !search) {
      setSearch(displayText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomInput();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-10 items-center rounded-md border border-border bg-background px-3 text-sm text-foreground-muted">
        Učitavanje destinacija...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <Input
          ref={inputRef}
          value={isOpen ? search : displayText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-16"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {(value || customDestination) && (
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer rounded p-0.5 text-foreground-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={cn('h-4 w-4 text-foreground-muted transition-transform', isOpen && 'rotate-180')} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg">
          {showAllOption && (
            <button
              type="button"
              onClick={() => handleSelect('all')}
              className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-muted"
            >
              {allOptionLabel}
            </button>
          )}

          {filteredCountries.map((country) =>
            country.regions.map((region) => (
              <div key={region.id}>
                <div className="sticky top-0 bg-muted/80 px-3 py-1.5 text-xs font-semibold text-foreground-muted backdrop-blur-sm">
                  {countries.length > 1
                    ? `${country.name} - ${region.name}`
                    : region.name}
                </div>
                {region.cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(city.id)}
                    className={cn(
                      'w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-muted',
                      value === city.id && 'bg-primary/10 font-medium text-primary'
                    )}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            ))
          )}

          {/* Free text option */}
          {search.trim().length >= 2 && !hasResults && (
            <button
              type="button"
              onClick={handleCustomInput}
              className="w-full cursor-pointer px-3 py-2 text-left text-sm text-primary hover:bg-muted"
            >
              Koristi: &quot;{search.trim()}&quot;
            </button>
          )}

          {search.trim().length >= 2 && hasResults && (
            <div className="border-t border-border">
              <button
                type="button"
                onClick={handleCustomInput}
                className="w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground-muted hover:bg-muted"
              >
                Ili unesite: &quot;{search.trim()}&quot;
              </button>
            </div>
          )}

          {!hasResults && search.trim().length > 0 && (
            <div className="px-3 py-2 text-sm text-foreground-muted">
              Nema rezultata za &quot;{search.trim()}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
