import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';

// Icons
const VoltageIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const CurrentIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);
const PowerIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
);
const EnergyIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const FrequencyIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
);
const PowerFactorIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
);
const AlertIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#dc2626' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.05 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
);
const WarningIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#f59e0b' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const InfoIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const DownloadIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#ffffff' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const UserIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const StatusIcon = ({ online }) => (
  online ? (
    <svg style={{ width: '12px', height: '12px', color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
  ) : (
    <svg style={{ width: '12px', height: '12px', color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
  )
);

// Responsive styles function
const getResponsiveStyles = (screenWidth, isTouchDevice = false) => {
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;
  return {
    container: {
      minHeight: '100vh',
      background: `linear-gradient(135deg, #fef7f0 0%, #f0f9ff 50%, #ecfeff 100%)`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 4px 20px 0 rgba(234, 88, 12, 0.2)',
      borderBottom: '2px solid #ea580c',
      backdropFilter: 'blur(20px)',
      padding: isMobile ? '0.75rem 0' : '1rem 0',
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isMobile ? '0 1rem' : '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '0',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '1rem',
    },
    logo: {
      height: isMobile ? '36px' : '48px',
      width: 'auto',
      objectFit: 'contain',
    },
    brandText: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
    },
    pageTitle: {
      fontSize: isMobile ? '1.5rem' : '1.8rem',
      fontWeight: 'bold',
      color: '#ea580c',
      margin: 0,
      textAlign: isMobile ? 'center' : 'left',
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '0.75rem',
      padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
      borderRadius: '0.75rem',
      border: '1px solid #f1f5f9',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    main: {
      maxWidth: isMobile ? 'none' : '1280px',
      margin: '0 auto',
      padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
    },
    section: {
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    sectionTitle: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: isMobile ? '0.75rem' : '1rem',
    },
    connectionStatus: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      padding: isMobile ? '0.75rem' : '1rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      flexDirection: isMobile ? 'column' : 'row',
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: '600',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isMobile ? '1rem' : '1.5rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    kpiCard: {
      backgroundColor: '#ffffff',
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
    },
    kpiHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isMobile ? '0.75rem' : '1rem',
    },
    kpiLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.375rem' : '0.5rem',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: '600',
      color: '#64748b',
    },
    kpiValue: {
      fontSize: isMobile ? '2rem' : isTablet ? '2.25rem' : '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: isMobile ? '0.375rem' : '0.5rem',
    },
    kpiUnit: {
      fontSize: isMobile ? '0.875rem' : '1rem',
      color: '#64748b',
      marginLeft: '0.25rem',
    },
    kpiRange: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      color: '#64748b',
    },
    alertsSection: {
      backgroundColor: '#ffffff',
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    alertItem: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.5rem' : '0.75rem',
      padding: isMobile ? '0.625rem' : '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      flexDirection: isMobile ? 'column' : 'row',
    },
    alertText: {
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      color: '#374151',
    },
    alertTime: {
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      color: '#9ca3af',
      marginLeft: isMobile ? '0' : 'auto',
    },
    navigationTabs: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.875rem' : '1rem',
      backgroundColor: '#ffffff',
      color: '#111827',
      borderRadius: '0.75rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: isMobile && isTouchDevice ? '48px' : 'auto',
    },
    downloadSection: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '1rem',
    },
    downloadButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.75rem 1.25rem' : '0.75rem 1.5rem',
      backgroundColor: '#ea580c',
      color: '#ffffff',
      borderRadius: '0.75rem',
      border: 'none',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: isMobile && isTouchDevice ? '48px' : 'auto',
    },
    footer: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      textAlign: 'center',
    },
    sparkline: {
      width: '100%',
      height: isMobile ? '30px' : '40px',
      marginTop: '0.5rem',
    },
  };
};

// Simple Sparkline Component
const Sparkline = ({ data, color = '#ea580c' }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" style={{ vectorEffect: 'non-scaling-stroke' }} />
    </svg>
  );
};

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isTouchDevice: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
  });
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isTouchDevice: 'ontouchstart' in window,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return screenSize;
};

const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [meterData, setMeterData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [deviceOnline, setDeviceOnline] = useState(true);
  const [hoveredButton, setHoveredButton] = useState(null);
  const navigate = useNavigate();
  const screenSize = useScreenSize();
  const isMobile = screenSize.width <= 768;
  const isTablet = screenSize.width > 768 && screenSize.width <= 1024;
  // Get responsive styles
  const responsiveStyles = getResponsiveStyles(screenSize.width, screenSize.isTouchDevice);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTimeout(() => {
        setMeterData({
          voltage: { current: 230.5, min: 228.2, max: 232.1, status: 'normal', history: [228, 229, 230, 231, 230, 229, 230, 231, 230, 229] },
          current: { current: 12.3, min: 10.5, max: 15.2, status: 'normal', history: [11, 12, 13, 12, 11, 12, 13, 14, 13, 12] },
          power: { current: 2834, min: 2410, max: 3512, status: 'warning', history: [2400, 2500, 2600, 2700, 2800, 2900, 3000, 2900, 2800, 2834] },
          energy: { current: 156.78, min: 0, max: 200, status: 'normal', history: [140, 145, 150, 152, 154, 156, 157, 156, 156, 156.78] },
          powerFactor: { current: 0.85, min: 0.80, max: 0.95, status: 'warning', history: [0.82, 0.83, 0.84, 0.85, 0.86, 0.85, 0.84, 0.85, 0.86, 0.85] },
          frequency: { current: 50.02, min: 49.8, max: 50.3, status: 'normal', history: [49.9, 50.0, 50.1, 50.0, 49.9, 50.0, 50.1, 50.2, 50.1, 50.02] }
        });
        setAlerts([
          { id: 1, type: 'warning', message: 'Power factor below optimal range', time: '2 minutes ago' },
          { id: 2, type: 'info', message: 'Monthly usage 75% of limit', time: '1 hour ago' },
          { id: 3, type: 'critical', message: 'Tamper event detected', time: '3 hours ago' }
        ]);
        setLastUpdate(new Date());
        setLoading(false);
      }, 1500);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return { borderLeft: '4px solid #10b981' };
      case 'warning': return { borderLeft: '4px solid #f59e0b' };
      case 'critical': return { borderLeft: '4px solid #ef4444' };
      default: return { borderLeft: '4px solid #10b981' };
    }
  };
  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical': return { backgroundColor: '#fef2f2', borderColor: '#fecaca' };
      case 'warning': return { backgroundColor: '#fffbeb', borderColor: '#fed7aa' };
      case 'info': return { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' };
      default: return { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' };
    }
  };
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };
  const handleDownload = (period) => {
    console.log(`Downloading ${period} days data...`);
  };
  const handleNavigation = (path) => {
    navigate(path);
  };
  if (loading) {
    return (
      <div style={responsiveStyles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontSize: '1rem', color: '#64748b' }}>
          <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px', marginRight: '0.5rem' }} viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading dashboard data...
        </div>
      </div>
    );
  }
  return (
    <div style={responsiveStyles.container}>
      {/* Header */}
      <header style={responsiveStyles.header}>
        <div style={responsiveStyles.headerContent}>
          <div style={responsiveStyles.logoSection}>
            <img src={Logo} alt="VoltSenseX Logo" style={responsiveStyles.logo} />
          </div>
          <h1 style={responsiveStyles.pageTitle}>Dashboard</h1>
          <div 
            style={responsiveStyles.userProfile}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(234, 88, 12, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <UserIcon />
            {!isMobile && <span style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', fontWeight: '600', color: '#111827' }}>Consumer</span>}
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main style={responsiveStyles.main}>
        {/* Connection Status */}
        <div style={responsiveStyles.connectionStatus}>
          <div style={{ ...responsiveStyles.statusBadge, ...(deviceOnline ? { backgroundColor: '#dcfce7', color: '#166534' } : { backgroundColor: '#fee2e2', color: '#991b1b' }) }}>
            <StatusIcon online={deviceOnline} />
            {deviceOnline ? 'Device Online' : 'Device Offline'}
          </div>
          <span style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#64748b' }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        {/* KPI Cards */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Live Meter Readings</h2>
          <div style={responsiveStyles.kpiGrid}>
            {/* Voltage Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(meterData?.voltage?.status) }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <VoltageIcon />
                  Voltage
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.voltage?.current?.toFixed(1)}
                <span style={responsiveStyles.kpiUnit}>V</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.voltage?.min}V</span>
                <span>Max: {meterData?.voltage?.max}V</span>
              </div>
              <Sparkline data={meterData?.voltage?.history} color="#ea580c" />
            </div>
            {/* Current Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(meterData?.current?.status) }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <CurrentIcon />
                  Current
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.current?.current?.toFixed(1)}
                <span style={responsiveStyles.kpiUnit}>A</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.current?.min}A</span>
                <span>Max: {meterData?.current?.max}A</span>
              </div>
              <Sparkline data={meterData?.current?.history} color="#0891b2" />
            </div>
            {/* Power Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(meterData?.power?.status) }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <PowerIcon />
                  Power
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.power?.current?.toLocaleString()}
                <span style={responsiveStyles.kpiUnit}>W</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.power?.min}W</span>
                <span>Max: {meterData?.power?.max}W</span>
              </div>
              <Sparkline data={meterData?.power?.history} color="#ea580c" />
            </div>
            {/* Energy Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(meterData?.energy?.status) }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <EnergyIcon />
                  Energy Consumed
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.energy?.current?.toFixed(2)}
                <span style={responsiveStyles.kpiUnit}>kWh</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Today</span>
                <span>Monthly: {meterData?.energy?.max}kWh</span>
              </div>
              <Sparkline data={meterData?.energy?.history} color="#0891b2" />
            </div>
            {/* Power Factor Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(meterData?.powerFactor?.status) }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <PowerFactorIcon />
                  Power Factor
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.powerFactor?.current?.toFixed(2)}
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.powerFactor?.min}</span>
                <span>Max: {meterData?.powerFactor?.max}</span>
              </div>
              <Sparkline data={meterData?.powerFactor?.history} color="#0891b2" />
            </div>
            {/* Frequency Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(meterData?.frequency?.status) }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <FrequencyIcon />
                  Frequency
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.frequency?.current?.toFixed(2)}
                <span style={responsiveStyles.kpiUnit}>Hz</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.frequency?.min}Hz</span>
                <span>Max: {meterData?.frequency?.max}Hz</span>
              </div>
              <Sparkline data={meterData?.frequency?.history} color="#ea580c" />
            </div>
          </div>
        </section>
        {/* Alerts Section */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Alerts & Notifications</h2>
          <div style={responsiveStyles.alertsSection}>
            {alerts.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', margin: 0, fontSize: isMobile ? '0.875rem' : '1rem' }}>No active alerts</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.map(alert => (
                  <div key={alert.id} style={{ ...responsiveStyles.alertItem, ...getAlertStyle(alert.type) }}>
                    {getAlertIcon(alert.type)}
                    <span style={responsiveStyles.alertText}>{alert.message}</span>
                    <span style={responsiveStyles.alertTime}>{alert.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        {/* Navigation Tabs */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Quick Actions</h2>
          <div style={responsiveStyles.navigationTabs}>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'charts' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('charts')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/analytics')}
            >
              Detailed Charts
            </button>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'billing' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('billing')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/billing')}
            >
              Billing & Reports
            </button>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'events' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('events')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/events')}
            >
              Events & Log
            </button>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'settings' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('settings')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/settings')}
            >
              Settings
            </button>
          </div>
        </section>
        {/* Download Section */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Export Data</h2>
          <div style={responsiveStyles.downloadSection}>
            <button
              style={responsiveStyles.downloadButton}
              onClick={() => handleDownload(7)}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ea580c';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <DownloadIcon />
              Download 7 Days CSV
            </button>
            <button
              style={responsiveStyles.downloadButton}
              onClick={() => handleDownload(30)}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ea580c';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <DownloadIcon />
              Download 30 Days CSV
            </button>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer style={responsiveStyles.footer}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
            Need help? Contact <a href="mailto:powerpulsepro.smartmetering@gmail.com" style={{ color: '#ea580c', textDecoration: 'underline' }}>PowerPulsePro Support</a>
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
            © 2025 PowerPulsePro Smart Energy Meter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDashboard;