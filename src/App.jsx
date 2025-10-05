import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomepageStyled from './components/HomepageStyled';
import ConsumerLogin from './components/ConsumerLogin';
import CustomerDashboard from './components/CustomerDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

import DetailedCharts from './components/DetailedCharts';
import BillsPage from './components/BillsPage';
import EventsAlerts from './components/EventsAlerts';
import SettingsConfig from './components/SettingsConfig';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomepageStyled />} />
        <Route path="/consumer-login" element={<ConsumerLogin />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/detailed-charts" element={<DetailedCharts />} />
    <Route path="/bills" element={<BillsPage />} />
    <Route path="/events-alerts" element={<EventsAlerts />} />
    <Route path="/settings" element={<SettingsConfig />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
