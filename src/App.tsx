import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import React from 'react';
import NavBar from './components/NavBar';
import { Footer } from './components/Footer';
import AnimeDetailsPage from './pages/AnimeDetailsPage';
import Library from './pages/Library';
import Statistics from './pages/Statistics';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <NavBar />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/anime/:animeId" element={<AnimeDetailsPage />} />
                <Route path="/statistics" element={<Statistics />} />
              </Routes>
              <Footer />
            </main>
            <ToastContainer />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
