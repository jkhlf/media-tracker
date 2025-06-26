import { useQuery } from "@tanstack/react-query";
import { BarChart, BookOpen, CalendarIcon, GalleryHorizontal, HomeIcon, Menu, Search, SearchIcon, X } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { searchAnime } from "../lib/api";
import { AnimeCard } from "./AnimeCard";
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchAnime(query),
    enabled: query.length > 2,
  });

  const handleClear = () => {
    setQuery("");
    setIsExpanded(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: "/", label: "Home", icon: <HomeIcon className="w-6 h-6" /> },
    { path: "/catalog", label: "Catalog", icon: <SearchIcon className="w-6 h-6" /> },
    { path: "/library", label: "Library", icon: <BookOpen className="w-6 h-6" /> },
    { path: "/statistics", label: "Statistics", icon: <BarChart className="w-6 h-6" /> },
    { path: "/calendar", label: "Calendar", icon: <CalendarIcon className="w-6 h-6" /> },
    { path: "/collections/create", label: "Collections", icon: <GalleryHorizontal className="w-6 h-6" /> },
  ];

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-md border-b dark:border-gray-800">
        <nav className="py-3 px-4 max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200">
            AnimeTracker
          </Link>

          {/* Desktop Search Input */}
          <div className="relative w-full max-w-md mx-4 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsExpanded(true);
              }}
              onFocus={() => setIsExpanded(true)}
              className="w-full pl-12 pr-12 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                icon={icon}
                label={label}
                isActive={location.pathname === path}
              />
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsExpanded(true);
              }}
              onFocus={() => setIsExpanded(true)}
              className="w-full pl-12 pr-12 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    location.pathname === path
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isExpanded && query.length > 2 && (
        <div className="absolute top-20 md:top-14 left-0 right-0 bg-white dark:bg-gray-900 z-40 overflow-y-auto shadow-lg max-h-96">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="text-center py-5 text-gray-700 dark:text-gray-300">Searching...</div>
            ) : data?.data.length === 0 ? (
              <div className="text-center py-5 text-gray-700 dark:text-gray-300">No results found</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 p-3 md:p-5">
                {data?.data.slice(0, 10).map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  to,
  icon,
  label,
  isActive,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 text-sm transition-colors ${
        isActive
          ? "text-blue-600 dark:text-blue-400 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;
