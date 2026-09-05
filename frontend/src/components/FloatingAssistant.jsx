import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, X, ShieldCheck, PlusCircle } from 'lucide-react';

export default function FloatingAssistant() {
  const { setActiveTab, launchVerifyWithPreset, credentials, isDemoMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Bottom-Right Stylus Engine Pill (From Screenshot) */}
      <div
        className="floating-stylus-pill"
        onClick={() => setIsOpen(!isOpen)}
        title="Stylus WASM Engine Telemetry"
      >
        <div style={{
          width: 28,
          height: 28,
          background: 'rgba(0, 240, 255, 0.15)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Cpu size={16} color="var(--primary)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>
            Stylus Engine
          </span>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className={isDemoMode ? 'cyan-dot' : 'green-dot'} />
            {isDemoMode ? 'SIMULATOR ACTIVE' : 'RPC LIVE'}
          </span>
        </div>
      </div>

      {/* Quick Telemetry Flyout */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 78,
          right: 24,
          width: 320,
          background: '#0a0e17',
          border: '1px solid var(--border-medium)',
          borderRadius: 8,
          padding: 18,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 160,
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
              STYLUS TELEMETRY
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
            Arbitrum Stylus Runtime
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginBottom: 14 }}>
            WASM Precompile: 0x71 (ArbWasm). Gas efficiency: ~24k per verification.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {credentials && credentials.slice(0, 2).map((cred) => (
              <button
                key={cred?.id || Math.random()}
                onClick={() => {
                  if (cred) {
                    launchVerifyWithPreset(cred);
                    setIsOpen(false);
                  }
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.74rem', padding: '8px 10px', justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <ShieldCheck size={13} color="var(--primary)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cred?.organization || cred?.institution ? (cred.organization || cred.institution).split(' ')[0] : 'Issuer'} ({cred?.recipientName || cred?.studentName || 'Recipient'})
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setActiveTab('issue');
              setIsOpen(false);
            }}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.78rem', padding: '10px' }}
          >
            <PlusCircle size={14} /> Issue Credential
          </button>
        </div>
      )}
    </>
  );
}
