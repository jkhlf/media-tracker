import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import { Watchlist } from './pages/Watchlist';
import { Watched } from './pages/Watched';
import React from 'react';
import NavBar from './components/NavBar';
import { Footer } from './components/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <NavBar />
          <main className="pt-20">  
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/watched" element={<Watched />} />
            </Routes>
            <Footer />
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
