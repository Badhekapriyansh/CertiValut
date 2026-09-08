import React, { createContext, useContext, useState, useEffect } from 'react';
import { IS_CONTRACT_CONFIGURED } from '../config/contracts';
import {
  getMockCredentials,
  getMockActivities,
  getMockIssuers,
  getMockOrganizations,
  saveMockOrganization,
  updateOrganizationStatus
} from '../services/mockDataService';
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

  // Selected Organization for Profile Inspection
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Selected Issuer Address for Public Issuer Profile
  const [selectedIssuerAddress, setSelectedIssuerAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

  // Holder Authentication State (Protected Passport)
  const [authenticatedHolder, setAuthenticatedHolder] = useState(null);

  // QR Modal Active Credential
  const [qrModalData, setQrModalData] = useState(null);

  // Quick Preset Search for Verify View
  const [quickVerifyPreset, setQuickVerifyPreset] = useState(null);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  // App Data Cache - Pre-loaded with default mock credentials so presets are never undefined
  const [credentials, setCredentials] = useState(() => getMockCredentials());
  const [activities, setActivities] = useState(() => getMockActivities());
  const [issuers, setIssuers] = useState(() => getMockIssuers());
  const [organizations, setOrganizations] = useState(() => getMockOrganizations());

  const refreshData = () => {
    setCredentials(getMockCredentials());
    setActivities(getMockActivities());
    setIssuers(getMockIssuers());
    setOrganizations(getMockOrganizations());
  };

  const authenticateHolder = (identifierOrProfile) => {
    if (!identifierOrProfile) return null;
    let profile = null;
    if (typeof identifierOrProfile === 'string') {
      const trimmed = identifierOrProfile.trim();
      const matchedCred = credentials.find(
        (c) =>
          (c.recipientId && c.recipientId.toLowerCase() === trimmed.toLowerCase()) ||
          (c.studentId && c.studentId.toLowerCase() === trimmed.toLowerCase()) ||
          (c.recipientName && c.recipientName.toLowerCase() === trimmed.toLowerCase()) ||
          (c.studentName && c.studentName.toLowerCase() === trimmed.toLowerCase()) ||
          (c.recipientAddress && c.recipientAddress.toLowerCase() === trimmed.toLowerCase())
      );

      profile = {
        id: matchedCred?.recipientId || matchedCred?.studentId || trimmed,
        name: matchedCred?.recipientName || matchedCred?.studentName || trimmed,
        identifier: trimmed,
        address: matchedCred?.recipientAddress || (trimmed.startsWith('0x') ? trimmed : null),
        authMethod: trimmed.startsWith('0x') ? 'wallet' : 'holder_id',
      };
    } else if (typeof identifierOrProfile === 'object') {
      profile = identifierOrProfile;
    }

    setAuthenticatedHolder(profile);
    return profile;
  };

  const logoutHolder = () => {
    setAuthenticatedHolder(null);
  };

  // Parse URL Deep Links (e.g. ?id=0x... or ?tab=verify&id=0x... or ?tab=issuer-profile&address=0x...)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('id') || urlParams.get('credId');
      const urlTab = urlParams.get('tab');
      const urlAddress = urlParams.get('address') || urlParams.get('issuer');

      if (urlId) {
        setQuickVerifyPreset({ id: urlId });
        setActiveTabState('verify');
      } else if (urlTab) {
        if (urlTab === 'issuer-profile' && urlAddress) {
          setSelectedIssuerAddress(urlAddress);
        }
        setActiveTabState(urlTab);
      } else if (window.location.pathname.startsWith('/passport')) {
        setActiveTabState('passport');
      } else if (window.location.pathname.startsWith('/verify')) {
        setActiveTabState('verify');
      }
    } catch (e) {
      // ignore
    }
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

  const openIssuerProfile = (issuerAddress) => {
    if (issuerAddress) {
      setSelectedIssuerAddress(issuerAddress);
    }
    setActiveTab('issuer-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const registerOrganization = (orgData) => {
    const updated = saveMockOrganization(orgData);
    setOrganizations(updated);
    refreshData();
    return updated;
  };

  const accreditOrganization = (orgIdOrAddress) => {
    const updated = updateOrganizationStatus(orgIdOrAddress, 'ACTIVE');
    setOrganizations(updated);
    refreshData();
    return updated;
  };

  const suspendOrganization = (orgIdOrAddress) => {
    const updated = updateOrganizationStatus(orgIdOrAddress, 'SUSPENDED');
    setOrganizations(updated);
    refreshData();
    return updated;
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
        selectedOrg,
        setSelectedOrg,
        selectedIssuerAddress,
        setSelectedIssuerAddress,
        authenticatedHolder,
        setAuthenticatedHolder,
        authenticateHolder,
        logoutHolder,
        openIssuerProfile,
        qrModalData,
        setQrModalData,
        quickVerifyPreset,
        setQuickVerifyPreset,
        launchVerifyWithPreset,
        toast,
        showToast,
        triggerConfetti,
        credentials,
        activities,
        issuers,
        organizations,
        refreshData,
        registerOrganization,
        accreditOrganization,
        suspendOrganization,
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
