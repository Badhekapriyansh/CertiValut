import React from 'react';
import { useApp } from '../context/AppContext';
import { Zap } from 'lucide-react';

export default function ModeBanner() {
  const { isDemoMode, setIsDemoMode, showToast } = useApp();

  const handleToggle = () => {
    setIsDemoMode(!isDemoMode);
    showToast(
      isDemoMode
        ? 'Switched to Live Arbitrum Sepolia RPC Mode'
        : 'Switched to Demo Simulation Mode (1-Click Presets Ready)',
      'info'
    );
  };

  return (
    <div className="mode-banner-container">
      <div className="mode-banner-left">
        <span className={isDemoMode ? 'cyan-dot' : 'green-dot'} />
        <span style={{ color: isDemoMode ? 'var(--primary)' : 'var(--success)', fontWeight: 700 }}>
          {isDemoMode ? 'DEMO SIMULATION MODE' : 'LIVE RPC MODE'}
        </span>
        <span style={{ color: 'var(--text-sub)' }}>//</span>
        <span style={{ color: 'var(--text-sub)' }}>
          {isDemoMode
            ? 'Arbitrum Stylus Nitro Sandbox Active (Instant Attestation & Zero-Gas Verification)'
            : 'Arbitrum Sepolia Testnet RPC Connected (Chain ID: 421614)'}
        </span>
      </div>

      <button onClick={handleToggle} className="mode-banner-btn">
        <Zap size={13} />
        <span>{isDemoMode ? 'SWITCH TO RPC LIVE MODE' : 'SWITCH TO SIMULATOR'}</span>
      </button>
    </div>
  );
}
