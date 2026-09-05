import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NETWORK_CONFIG, CERTIVAULT_CONTRACT_ADDRESS } from '../config/contracts';
import {
  Settings,
  Activity,
  Database,
  RefreshCw,
  Trash2,
  Cpu,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function SettingsView() {
  const { isDemoMode, setIsDemoMode, showToast, refreshData } = useApp();
  const [rpcLatency, setRpcLatency] = useState(null);
  const [testingRpc, setTestingRpc] = useState(false);

  const testRpcPing = async () => {
    setTestingRpc(true);
    const start = performance.now();
    try {
      const res = await fetch(NETWORK_CONFIG.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
      });
      await res.json();
      const latency = Math.round(performance.now() - start);
      setRpcLatency(`${latency} ms`);
    } catch (e) {
      setRpcLatency('Error pinging node');
    } finally {
      setTestingRpc(false);
    }
  };

  useEffect(() => {
    testRpcPing();
  }, []);

  const handleResetCache = () => {
    localStorage.clear();
    refreshData();
    showToast('Demo data cache reset to default preset', 'info');
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
            <Sliders size={11} /> PROTOCOL DIAGNOSTICS
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
          Network & Protocol Settings
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
          Real-time RPC health, Arbitrum Nitro Stylus precompile status, and runtime environment controls.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Node & RPC Diagnostics Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="var(--primary)" />
              <span>Arbitrum Sepolia Node Diagnostic</span>
            </h2>
            <button onClick={testRpcPing} disabled={testingRpc} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              <RefreshCw size={12} className={testingRpc ? 'animate-spin' : ''} /> Ping Node
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CHAIN ID</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>{NETWORK_CONFIG.chainId} (0x66eee)</div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RPC LATENCY</div>
              <div style={{ fontWeight: 600, color: 'var(--success)', marginTop: 2 }}>{rpcLatency || 'Measuring...'}</div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>STYLUS PRECOMPILE</div>
              <div style={{ fontWeight: 600, color: 'var(--primary)', marginTop: 2 }}>0x0000...0071 (ArbWasm)</div>
            </div>
          </div>
        </div>

        {/* Contract Config Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            Stylus Contract Address
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: 12 }}>
            Configured in <code style={{ color: 'var(--primary)' }}>frontend/.env</code> via <code style={{ color: 'var(--primary)' }}>VITE_CERTIVAULT_CONTRACT_ADDRESS</code>.
          </p>
          <div className="mono-block">
            {CERTIVAULT_CONTRACT_ADDRESS || 'Deployment Pending — Set address in .env once Layer C deployment is funded.'}
          </div>
        </div>

        {/* Runtime Mode Selection Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            Data Source & Testing Environment
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: 16 }}>
            Toggle between local testing simulator mode and live Arbitrum Sepolia RPC transactions.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setIsDemoMode(true); showToast('Simulator mode enabled', 'info'); }}
              className={`btn ${isDemoMode ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              Testing Simulator Mode (Active)
            </button>
            <button
              onClick={() => { setIsDemoMode(false); showToast('Live Arbitrum Sepolia RPC enabled', 'info'); }}
              className={`btn ${!isDemoMode ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              Live Arbitrum Sepolia RPC
            </button>
          </div>
        </div>

        {/* Cache Reset */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            Reset Local Storage
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: 14 }}>
            Restore mock credentials, sample issuers, and activity logs to original defaults.
          </p>
          <button
            onClick={handleResetCache}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Trash2 size={13} /> Reset Demo Data Cache
          </button>
        </div>
      </div>
    </div>
  );
}
