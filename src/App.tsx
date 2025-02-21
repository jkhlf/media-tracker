import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import React from 'react';
import NavBar from './components/NavBar';
import { Footer } from './components/Footer';
import AnimeDetailsPage from './pages/AnimeDetailsPage';
import Library from './pages/Library';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
              <Route path="/library" element={<Library />} />
              <Route path="/anime/:animeId" element={<AnimeDetailsPage />} />
            </Routes>
            <Footer />
          </main>
          <ToastContainer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
