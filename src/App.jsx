import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomepageStyled from './components/HomepageStyled';
import ConsumerLogin from './components/ConsumerLogin';
import CustomerDashboard from './components/CustomerDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

import DetailedCharts from './components/DetailedCharts';
import BillsPage from './components/BillsPage';
import EventsAlerts from './components/EventsAlerts';
import SettingsConfig from './components/SettingsConfig';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/consumer-login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomepageStyled />} />
        <Route path="/consumer-login" element={<ConsumerLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Protected Consumer Routes */}
        <Route 
          path="/consumer-dashboard" 
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* Other Protected Routes */}
        <Route 
          path="/detailed-charts" 
          element={
            <ProtectedRoute>
              <DetailedCharts />
            </ProtectedRoute>
          } 
        />
        {/* Alternate path per user request */}
        <Route 
          path="/detailedcharts" 
          element={
            <ProtectedRoute>
              <DetailedCharts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bills" 
          element={
            <ProtectedRoute>
              <BillsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/billspage" 
          element={
            <ProtectedRoute>
              <BillsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events-alerts" 
          element={
            <ProtectedRoute>
              <EventsAlerts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/eventsAlerts" 
          element={
            <ProtectedRoute>
              <EventsAlerts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsConfig />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settingsconfig" 
          element={
            <ProtectedRoute>
              <SettingsConfig />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
