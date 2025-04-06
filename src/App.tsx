import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import React, { useEffect } from 'react';
import NavBar from './components/NavBar';
import { Footer } from './components/Footer';
import AnimeDetailsPage from './pages/AnimeDetailsPage';
import Library from './pages/Library';
import Statistics from './pages/Statistics';
import CalendarPage from './pages/CalendarPage';
import CollectionPage from './pages/CollectionPage';
import CollectionEditor from './components/CollectionEditor';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import { initializeCollections } from './data/collections';

const queryClient = new QueryClient();

// Wrapper component to use hooks
const AppContent = () => {
  useEffect(() => {
    // Initialize collections with API data when app starts
    const loadCollections = async () => {
      try {
        await initializeCollections();
        console.log('Collections initialized successfully with API data');
      } catch (error) {
        console.error('Failed to initialize collections:', error);
        toast.error('Failed to load some collection data');
      }
    };

    loadCollections();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/anime/:animeId" element={<AnimeDetailsPage />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/collection/:slug" element={<CollectionPage />} />
          <Route path="/collections/create" element={<CollectionEditor />} />
          <Route path="/collection/:slug/edit" element={<CollectionEditor />} />
        </Routes>
        <Footer />
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
