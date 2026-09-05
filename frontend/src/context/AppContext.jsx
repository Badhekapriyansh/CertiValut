import React, { createContext, useContext, useState, useEffect } from 'react';
import { IS_CONTRACT_CONFIGURED } from '../config/contracts';
import { getMockCredentials, getMockActivities, getMockIssuers } from '../services/mockDataService';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation
  const [activeTab, setActiveTabState] = useState('home');

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {}
  };

  // Mode: Default to Demo Mode if contract is not configured, or if user prefers instant showcase testing
  const [isDemoMode, setIsDemoMode] = useState(!IS_CONTRACT_CONFIGURED);

  // Selected Credential for Deep Proof Modal
  const [inspectCredential, setInspectCredential] = useState(null);

  // Quick Preset Search for Verify View
  const [quickVerifyPreset, setQuickVerifyPreset] = useState(null);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  // App Data Cache - Pre-loaded with default mock credentials so presets are never undefined
  const [credentials, setCredentials] = useState(() => getMockCredentials());
  const [activities, setActivities] = useState(() => getMockActivities());
  const [issuers, setIssuers] = useState(() => getMockIssuers());

  const refreshData = () => {
    setCredentials(getMockCredentials());
    setActivities(getMockActivities());
    setIssuers(getMockIssuers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#00f0ff', '#00ff87', '#818cf8', '#ffffff'],
        disableForReducedMotion: true
      });
    } catch (e) {
      // ignore
    }
  };

  const launchVerifyWithPreset = (preset) => {
    setQuickVerifyPreset(preset);
    setActiveTab('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDemoMode,
        setIsDemoMode,
        inspectCredential,
        setInspectCredential,
        quickVerifyPreset,
        setQuickVerifyPreset,
        launchVerifyWithPreset,
        toast,
        showToast,
        triggerConfetti,
        credentials,
        activities,
        issuers,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
