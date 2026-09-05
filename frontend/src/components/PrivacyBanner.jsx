import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, ArrowRight, Database, CheckCircle2 } from 'lucide-react';

export default function PrivacyBanner({ compact = false }) {
  return (
    <div className="glass-card" style={{
      padding: compact ? '16px 20px' : '24px 28px',
      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.04) 0%, rgba(129, 140, 248, 0.04) 100%)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      marginBottom: '28px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        {/* Left Explanation */}
        <div style={{ flex: '1 1 340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="tech-tag tech-tag-success" style={{ fontSize: '0.68rem' }}>
              <Lock size={10} /> ZERO-KNOWLEDGE PRIVACY
            </span>
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Your Personal Information Never Goes On-Chain
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
            CertiVault stores only non-invertible 256-bit cryptographic fingerprints. Student names, student IDs, GPA, and transcripts remain 100% off-chain.
          </p>
        </div>

        {/* Right Flow Visualization */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-glass)',
          padding: '10px 16px',
          borderRadius: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#94a3b8' }}>
            <FileText size={15} color="#38bdf8" />
            <span>Academic Document</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--success)', background: 'rgba(0,255,135,0.1)', padding: '1px 5px', borderRadius: 4 }}>
              (Off-Chain)
            </span>
          </div>

          <ArrowRight size={14} color="var(--text-muted)" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#818cf8' }}>
            <Lock size={15} />
            <span>256-bit Hash</span>
          </div>

          <ArrowRight size={14} color="var(--text-muted)" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#00f0ff' }}>
            <Database size={15} />
            <span>Arbitrum Stylus</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', background: 'rgba(0,240,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>
              (Immutable)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
