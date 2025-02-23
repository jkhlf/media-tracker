import { HomeIcon, BookOpen, BarChart, Sun, Moon } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchAnime } from "../lib/api";
import { AnimeCard } from "./AnimeCard";
import { useTheme } from "../context/ThemeContext";

export function Navbar() {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
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

  const navItems = [
    { path: "/", label: "Home", icon: <HomeIcon className="w-6 h-6" /> },
    { path: "/library", label: "Library", icon: <BookOpen className="w-6 h-6" /> },
    { path: "/statistics", label: "Statistics", icon: <BarChart className="w-6 h-6" /> },
  ];

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800/90 backdrop-blur-sm shadow-md border-b border-gray-700">
        <nav className=" py-3 max-w-6xl mx-auto flex items-center justify-around">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            AnimeTracker
          </Link>

          {/* Search Input */}
          <div className="relative w-full max-w-md">
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
              className="w-full pl-12 pr-12 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                icon={icon}
                label={label}
                isActive={location.pathname === path}
              />
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-yellow-500" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Search Results Dropdown */}
      {isExpanded && query.length > 2 && (
        <div className="absolute top-14 left-0 right-0 bg-gray-900/95 z-40 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="text-center text-gray-400 bg-gray-800 mt-5 p-5">Searching...</div>
            ) : data?.data.length === 0 ? (
              <div className="text-center text-gray-400 bg-gray-800 mt-5 p-5">No results found</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 bg-gray-800 p-5">
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
        isActive ? "text-gray-200" : "text-gray-400 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;