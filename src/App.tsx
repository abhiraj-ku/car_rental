import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OwnerDashboard from './pages/OwnerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CarDetailsPage from './pages/CarDetailsPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cars/:id" element={<CarDetailsPage />} />
              <Route 
                path="/owner/dashboard" 
                element={
                  <ProtectedRoute allowedRole="owner">
                    <OwnerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/dashboard" 
                element={
                  <ProtectedRoute allowedRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking/:carId" 
                element={
                  <ProtectedRoute allowedRole="customer">
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute allowedRole="customer">
                    <MyBookingsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;