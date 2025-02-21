import React from "react";
import { Facebook, Instagram, Twitter, Github } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Grid principal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Coluna 1: Sobre */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">About</h2>
            <p className="text-sm">
              This is a fan-made application inspired by MyAnimeList, designed to help anime fans
              discover and track their favorite shows and movies.
            </p>
          </div>

          {/* Coluna 2: Links úteis */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-white transition-colors">
                  Library
                </Link>
              </li>
              <li>
                <a
                  href="https://myanimelist.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  MyAnimeList
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Redes sociais */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Follow Us</h2>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Divisão */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} AnimeApp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
