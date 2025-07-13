import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import OrderForm from './pages/OrderForm';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MarketerDashboard from './pages/MarketerDashboard';
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import OfflineIndicator from './components/OfflineIndicator';

// Services
import { initializeDatabase } from './services/indexedDB';
import { setupServiceWorker } from './services/serviceWorker';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        // Initialize IndexedDB
        await initializeDatabase();
        
        // Setup service worker for offline capabilities
        if ('serviceWorker' in navigator) {
          setupServiceWorker();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
          <h2>Loading Astro-BSM Portal...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!isOnline && <OfflineIndicator />}
        
        <Header isOnline={isOnline} />
        
        <main style={{ minHeight: 'calc(100vh - 140px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<OrderForm />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/marketer-dashboard" element={<MarketerDashboard />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegistration />} />
          </Routes>
        </main>
        
        <Footer />
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
