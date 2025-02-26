import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { AnimeFilters } from '../lib/api';

interface FilterSection {
  title: string;
  content: JSX.Element;
}

interface FilterSidebarProps {
  onFilterChange: (filters: AnimeFilters) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export function FilterSidebar({ onFilterChange, isMobileOpen, setIsMobileOpen }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Genres': true,
    'Status': true,
    'Rating': true,
    'Year': true,
    'Season': true,
    'Type': true,
  });
  
  const [filters, setFilters] = useState<AnimeFilters>({
    genres: [],
    status: '',
    rating: '',
    year: '',
    season: '',
    type: '',
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleFilterChange = (category: string, value: any) => {
    let updatedFilters: AnimeFilters;
    
    if (category === 'genres') {
      // Handle genres as an array
      if (filters.genres?.includes(value)) {
        updatedFilters = {
          ...filters,
          genres: filters.genres.filter(genre => genre !== value)
        };
      } else {
        updatedFilters = {
          ...filters,
          genres: [...(filters.genres || []), value]
        };
      }
    } else {
      // Handle other filters as single values
      updatedFilters = {
        ...filters,
        [category]: value
      };
    }
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: AnimeFilters = {
      genres: [],
      status: '',
      rating: '',
      year: '',
      season: '',
      type: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // For debugging - log filter changes
  useEffect(() => {
    console.log('Current filters:', filters);
  }, [filters]);

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Thriller', 'Supernatural'
  ];

  const statuses = ['Airing', 'Complete', 'Upcoming'];
  const ratings = ['G', 'PG', 'PG-13', 'R', 'R+', 'Rx'];
  const years = Array.from({ length: 24 }, (_, i) => (2024 - i).toString());
  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
  const types = ['TV', 'Movie', 'OVA', 'Special', 'ONA', 'Music'];

  const filterSections: FilterSection[] = [
    {
      title: 'Genres',
      content: (
        <div className="grid grid-cols-2 gap-2">
          {genres.map(genre => (
            <div key={genre} className="flex items-center">
              <input
                type="checkbox"
                id={genre}
                checked={filters.genres?.includes(genre) || false}
                onChange={() => handleFilterChange('genres', genre)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={genre} className="text-sm">{genre}</label>
            </div>
          ))}
        </div>
      )
    },
    // ...other filter sections remain the same
    {
      title: 'Status',
      content: (
        <div className="space-y-2">
          {statuses.map(status => (
            <div key={status} className="flex items-center">
              <input
                type="radio"
                id={status}
                name="status"
                value={status}
                checked={filters.status === status}
                onChange={() => handleFilterChange('status', status)}
                className="mr-2 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={status} className="text-sm">{status}</label>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Rating',
      content: (
        <div className="space-y-2">
          {ratings.map(rating => (
            <div key={rating} className="flex items-center">
              <input
                type="radio"
                id={rating}
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={() => handleFilterChange('rating', rating)}
                className="mr-2 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={rating} className="text-sm">{rating}</label>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Year',
      content: (
        <select
          value={filters.year || ''}
          onChange={(e) => handleFilterChange('year', e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          <option value="">Any Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      )
    },
    {
      title: 'Season',
      content: (
        <div className="space-y-2">
          {seasons.map(season => (
            <div key={season} className="flex items-center">
              <input
                type="radio"
                id={season}
                name="season"
                value={season}
                checked={filters.season === season}
                onChange={() => handleFilterChange('season', season)}
                className="mr-2 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={season} className="text-sm">{season}</label>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Type',
      content: (
        <div className="space-y-2">
          {types.map(type => (
            <div key={type} className="flex items-center">
              <input
                type="radio"
                id={type}
                name="type"
                value={type}
                checked={filters.type === type}
                onChange={() => handleFilterChange('type', type)}
                className="mr-2 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={type} className="text-sm">{type}</label>
            </div>
          ))}
        </div>
      )
    }
  ];

  const sidebarClasses = `
    md:block
    ${isMobileOpen ? 'fixed inset-0 z-50 bg-gray-900 p-4' : 'hidden'}
    md:relative md:w-64 md:min-w-64 md:p-4 md:bg-transparent
    border-r border-gray-700
  `;

  return (
    <div className={sidebarClasses}>
      {/* Mobile Close Button */}
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-xl font-bold">Filters</h2>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Filter Sections */}
        {filterSections.map(section => (
          <div key={section.title} className="border-b border-gray-700 pb-4">
            <button 
              className="w-full flex justify-between items-center py-2 text-left font-medium"
              onClick={() => toggleSection(section.title)}
            >
              {section.title}
              {expandedSections[section.title] ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            {expandedSections[section.title] && (
              <div className="mt-2">
                {section.content}
              </div>
            )}
          </div>
        ))}

        {/* Reset Button */}
        <button
          onClick={handleResetFilters}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
