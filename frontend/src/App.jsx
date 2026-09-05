import React, { Component } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WalletProvider } from './context/WalletContext';
import ModeBanner from './components/ModeBanner';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import VerifyView from './components/VerifyView';
import DashboardView from './components/DashboardView';
import CredentialsView from './components/CredentialsView';
import IssueWorkflowView from './components/IssueWorkflowView';
import RevokeView from './components/RevokeView';
import ActivityView from './components/ActivityView';
import AdminView from './components/AdminView';
import SettingsView from './components/SettingsView';
import CredentialDetailModal from './components/CredentialDetailModal';
import { CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CertiVault UI ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: '#ffffff',
          padding: 24,
          fontFamily: 'var(--font-sans)'
        }}>
          <div className="glass-card" style={{ maxWidth: 540, padding: 32, textAlign: 'center' }}>
            <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
              UI Diagnostic Notice
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: 20, wordBreak: 'break-word', fontFamily: 'var(--font-mono)' }}>
              {this.state.error?.message || String(this.state.error)}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} /> Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainLayout() {
  const { activeTab, toast } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Demo Simulation / Live RPC Mode Bar */}
      <ModeBanner />

      {/* Primary Sticky Header */}
      <Navbar />

      {/* Global Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 88,
          right: 24,
          zIndex: 300,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 8,
          padding: '10px 16px',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--text-primary)',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.15s ease'
        }}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={15} color="var(--success)" />
          ) : toast.type === 'error' ? (
            <AlertCircle size={15} color="var(--danger)" />
          ) : (
            <Info size={15} color="var(--primary)" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main View Router */}
      <main style={{ flex: 1, padding: '36px 20px 60px', maxWidth: 1240, width: '100%', margin: '0 auto' }}>
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'verify' && <VerifyView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'credentials' && <CredentialsView />}
        {activeTab === 'issue' && <IssueWorkflowView />}
        {activeTab === 'revoke' && <RevokeView />}
        {activeTab === 'activity' && <ActivityView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modal Inspection Preview */}
      <CredentialDetailModal />

      {/* Enterprise Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-app)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CertiVault</span>
            <span>—</span>
            <span>Blockchain-verified academic credentials</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Arbitrum Stylus (Rust WASM)</span>
            <span>•</span>
            <span>Sepolia Testnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}
