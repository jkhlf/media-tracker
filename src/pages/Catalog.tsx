import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterSidebar } from '../components/FilterSidebar';
import { AnimeGrid } from '../components/AnimeGrid';
import { getAnimeWithFilters, AnimeFilters } from '../lib/api';
import { Loader, Menu } from 'lucide-react';

export function Catalog() {
  const [filters, setFilters] = useState<AnimeFilters>({
    genres: [],
    status: '',
    rating: '',
    year: '',
    season: '',
    type: '',
    page: 1
  });
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Update filters when page changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: currentPage }));
  }, [currentPage]);
  
  // Query anime with current filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['animeFilters', filters],
    queryFn: () => getAnimeWithFilters(filters),
    staleTime: 5000,
  });
  
  const handleFilterChange = (newFilters: AnimeFilters) => {
    console.log('Received new filters:', newFilters); // Debug log
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setFilters({ ...newFilters, page: 1 });
  };
  
  const handleNextPage = () => {
    if (data?.pagination && currentPage < data.pagination.last_visible_page) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  // Generate an array of page numbers to show in pagination
  const getPageNumbers = () => {
    if (!data?.pagination) return [];
    
    const lastPage = data.pagination.last_visible_page;
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (lastPage <= maxVisiblePages) {
      // Show all pages if there are few of them
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate range of pages to show around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(lastPage - 1, currentPage + 1);
      
      // Handle edge cases
      if (currentPage <= 2) {
        endPage = Math.min(4, lastPage - 1);
      } else if (currentPage >= lastPage - 2) {
        startPage = Math.max(2, lastPage - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < lastPage - 1) {
        pages.push('...');
      }
      
      // Always include last page if there's more than one page
      if (lastPage > 1) {
        pages.push(lastPage);
      }
    }
    
    return pages;
  };

  // Create active filter count for mobile display
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.genres && filters.genres.length > 0) count += filters.genres.length;
    if (filters.status) count++;
    if (filters.rating) count++;
    if (filters.year) count++;
    if (filters.season) count++;
    if (filters.type) count++;
    return count;
  };
  
  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <div className="flex mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Anime Catalog</h1>
        
        {/* Mobile filter toggle */}
        <button 
          className="ml-auto md:hidden flex items-center gap-1 px-3 py-1 bg-blue-600 rounded-md"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <Menu className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-white text-blue-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters */}
        <FilterSidebar 
          onFilterChange={handleFilterChange}
          isMobileOpen={isMobileFilterOpen}
          setIsMobileOpen={setIsMobileFilterOpen}
        />
        
        {/* Main content area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading results</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-4 text-gray-400 ml-5">
                <p>Showing {data?.data.length} of {data?.pagination.items.total} results</p>
                
                {/* Active filters summary */}
                {activeFilterCount > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filters.genres && filters.genres.map(genre => (
                      <span key={genre} className="px-2 py-1 bg-blue-900 text-white rounded-md text-xs">
                        {genre}
                      </span>
                    ))}
                    {filters.status && (
                      <span className="px-2 py-1 bg-green-900 text-white rounded-md text-xs">
                        {filters.status}
                      </span>
                    )}
                    {filters.year && (
                      <span className="px-2 py-1 bg-purple-900 text-white rounded-md text-xs">
                        {filters.year}
                      </span>
                    )}
                    {filters.type && (
                      <span className="px-2 py-1 bg-yellow-900 text-white rounded-md text-xs">
                        {filters.type}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Results grid */}
              {data?.data && data.data.length > 0 ? (
                <AnimeGrid items={data.data} />
              ) : (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                  <p className="text-xl">No results found</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                </div>
              )}
              
              {/* Pagination */}
              {data?.pagination && data.pagination.last_visible_page > 1 && (
                <div className="flex justify-center mt-8 mb-4">
                  <nav className="inline-flex rounded-md shadow">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-l-md dark:bg-[#121212] text-gray-900 dark:text-gray-100 bg-gray-400 text-sm font-medium
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        disabled={page === '...' || page === currentPage}
                        className={`
                          px-3 py-2 bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100 text-sm font-medium
                          ${currentPage === page ? ' text-black dark:text-white' : 'bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100'}
                          ${typeof page !== 'number' ? 'cursor-default' : ''}
                        `}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === data.pagination.last_visible_page}
                      className="px-3 py-2 rounded-r-md border bg-gray-300 dark:bg-[#121212] text-gray-900 dark:text-gray-100 text-sm font-medium
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
