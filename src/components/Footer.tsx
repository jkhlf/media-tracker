import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-card text-card-foreground border-t border-border mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Media Tracker</h3>
            <p className="text-muted-foreground text-sm">
              Track your favorite anime, manage your watchlist, and discover new shows.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/library" className="hover:text-primary transition-colors">Library</Link></li>
              <li><Link to="/calendar" className="hover:text-primary transition-colors">Calendar</Link></li>
              <li><Link to="/statistics" className="hover:text-primary transition-colors">Statistics</Link></li>
              <li><Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Jikan API</a></li>
              <li><a href="https://myanimelist.net/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">MyAnimeList</a></li>
              <li><a href="https://anilist.co/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">AniList</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">About</h3>
            <p className="text-muted-foreground text-sm mb-2">
              This app was built as a personal project using React, TailwindCSS, and the Jikan API.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Media Tracker. All rights reserved.</p>
          <p className="mt-1">Data provided by Jikan API, an unofficial MyAnimeList API.</p>
        </div>
      </div>
    </footer>
  );
};
