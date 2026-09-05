import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import {
  ShieldCheck,
  Home,
  Search,
  LayoutDashboard,
  Award,
  PlusCircle,
  Ban,
  Activity,
  ShieldAlert,
  Settings,
  Copy,
  ExternalLink,
  Power,
  ChevronDown,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function Navbar() {
  const { activeTab, setActiveTab, showToast } = useApp();
  const { account, isConnecting, isCorrectNetwork, connectWallet, switchNetwork, disconnectWallet } = useWallet();

  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const walletRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (walletRef.current && !walletRef.current.contains(event.target)) {
        setWalletDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'verify', label: 'Verify', icon: Search },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'credentials', label: 'Credentials', icon: Award },
    { id: 'issue', label: 'Issue', icon: PlusCircle },
    { id: 'revoke', label: 'Revoke', icon: Ban },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'admin', label: 'Governance', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      showToast('Wallet address copied to clipboard', 'info');
      setWalletDropdownOpen(false);
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-inner">
        {/* Left: CertiVault Logo */}
        <div className="nav-logo-group" onClick={() => setActiveTab('home')}>
          <div className="nav-logo-badge">
            <img
              src="/logo.png"
              alt="CertiVault Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div className="nav-logo-text">
            <div className="nav-logo-title">
              Certi<span style={{ color: 'var(--primary)' }}>Vault</span>
            </div>
            <div className="nav-logo-subtitle">
              ARBITRUM STYLUS PROTOCOL
            </div>
          </div>
        </div>

        {/* Center: Navigation Pill Capsule with Mouse-Wheel Horizontal Scroll Support */}
        <nav
          className="nav-capsule"
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Network & Wallet Button */}
        <div className="nav-right-group">
          <div className="network-pill">
            <span className="cyan-dot" />
            <span>Arb Sepolia</span>
          </div>

          {account ? (
            <div style={{ position: 'relative' }} ref={walletRef}>
              <button
                onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                className="wallet-pill"
              >
                <span className="green-dot" />
                <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                <ChevronDown size={13} color="var(--text-sub)" />
              </button>

              {walletDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 280,
                  background: '#0a0e17',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  padding: 18,
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                    CONNECTED WALLET
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ffffff', wordBreak: 'break-all', marginBottom: 12, lineHeight: 1.4 }}>
                    {account}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.74rem', color: 'var(--success)' }}>
                    <CheckCircle2 size={13} />
                    <span>Connected to Arb Sepolia</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      onClick={handleCopyAddress}
                      className="btn btn-outline"
                      style={{ width: '100%', fontSize: '0.76rem', padding: '8px 10px', justifyContent: 'flex-start' }}
                    >
                      <Copy size={13} /> Copy Address
                    </button>

                    <a
                      href={`${NETWORK_CONFIG.blockExplorerUrl}/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ width: '100%', fontSize: '0.76rem', padding: '8px 10px', justifyContent: 'flex-start' }}
                    >
                      <ExternalLink size={13} /> Arbiscan Explorer
                    </a>

                    {!isCorrectNetwork && (
                      <button
                        onClick={switchNetwork}
                        className="btn btn-danger"
                        style={{ width: '100%', fontSize: '0.76rem', padding: '8px 10px' }}
                      >
                        <AlertTriangle size={13} /> Switch to Sepolia
                      </button>
                    )}

                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

                    <button
                      onClick={() => { disconnectWallet(); setWalletDropdownOpen(false); }}
                      className="btn btn-danger"
                      style={{ width: '100%', fontSize: '0.76rem', padding: '8px 10px' }}
                    >
                      <Power size={13} /> Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn btn-cyan"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
