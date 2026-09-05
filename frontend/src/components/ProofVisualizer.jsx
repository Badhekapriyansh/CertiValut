import React, { useState } from 'react';
import { FileText, KeyRound, Cpu, ShieldCheck, ArrowRight, CheckCircle2, Lock, EyeOff, Sparkles, Layers } from 'lucide-react';

export default function ProofVisualizer({ activeStep = 4, compact = false }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const pipelineStages = [
    {
      id: 1,
      name: 'Off-Chain Record',
      subtitle: 'Recipient PII & Details',
      tag: 'OFF-CHAIN PRIVACY',
      tagColor: 'var(--text-sub)',
      icon: FileText,
      color: '#38bdf8',
      desc: 'Official credential document, certificate, or organization record. Stored locally by the recipient and issuing authority. Zero personal data touches the public blockchain.',
      techSpec: 'PDF / JSON / X.509',
    },
    {
      id: 2,
      name: 'Cryptographic Digest',
      subtitle: 'Dual-Hash Pipeline',
      tag: 'SHA-256 + KECCAK',
      tagColor: 'var(--accent-purple)',
      icon: KeyRound,
      color: '#818cf8',
      desc: 'Mathematical one-way fingerprint generated in browser memory. Even a 1-character alteration changes the entire 256-bit digest.',
      techSpec: '32-byte Root Hash',
    },
    {
      id: 3,
      name: 'Holder Commitment',
      subtitle: 'ZKP Salt Privacy',
      tag: 'EIP-712 COMPLIANT',
      tagColor: '#ec4899',
      icon: Lock,
      color: '#f472b6',
      desc: 'Blinds the recipient identity with a unique salt commitment. Prevents on-chain correlation of credential records across organizations.',
      techSpec: 'keccak256(Secret || Salt)',
    },
    {
      id: 4,
      name: 'Arbitrum Stylus Engine',
      subtitle: 'Rust WASM (0x71)',
      tag: 'NITRO ARBWASM',
      tagColor: 'var(--primary)',
      icon: Cpu,
      color: 'var(--primary)',
      desc: 'Compiled Rust contract executed at native speed via Arbitrum ArbWasm precompile. 90% cheaper gas and sub-second finality.',
      techSpec: '68.7 KB WASM Module',
    },
    {
      id: 5,
      name: 'Verified Proof',
      subtitle: 'Instant Public Trust',
      tag: 'IMMUTABLE STATE',
      tagColor: 'var(--success)',
      icon: ShieldCheck,
      color: 'var(--success)',
      desc: 'Employers, verifiers, and third parties verify credentials instantaneously with 0 gas and no wallet connection required.',
      techSpec: 'Dual-Key Lookup',
    },
  ];

  return (
    <div className="glass-card" style={{
      padding: compact ? '20px' : '32px',
      background: 'linear-gradient(180deg, rgba(13, 19, 32, 0.95) 0%, rgba(5, 7, 12, 0.98) 100%)',
      border: '1px solid var(--border-tech)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? 16 : 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="tech-tag tech-tag-purple">
              <Sparkles size={11} /> SIGNATURE ARCHITECTURE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ARBITRUM NITRO PIPELINE
            </span>
          </div>
          <h3 style={{ fontSize: compact ? '1.1rem' : '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Cryptographic Credential & Verification Lifecycle
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--success)', background: 'var(--success-bg)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(0,255,135,0.2)' }}>
          <EyeOff size={13} /> 100% Off-Chain PII Protection Guarantee
        </div>
      </div>

      {/* Interactive Nodes Pipeline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        alignItems: 'stretch',
        position: 'relative',
        marginBottom: 20
      }}>
        {pipelineStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrentOrPassed = stage.id <= activeStep;
          const isHovered = hoveredNode === stage.id;

          return (
            <div
              key={stage.id}
              onMouseEnter={() => setHoveredNode(stage.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                background: isHovered
                  ? 'rgba(255, 255, 255, 0.06)'
                  : isCurrentOrPassed
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${isHovered ? stage.color : isCurrentOrPassed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 12,
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered ? `0 8px 24px ${stage.color}25` : 'none',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${stage.color}18`,
                    border: `1px solid ${stage.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stage.color
                  }}>
                    <Icon size={16} />
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: stage.tagColor,
                    fontWeight: 700,
                    background: 'rgba(0,0,0,0.3)',
                    padding: '2px 6px',
                    borderRadius: 4
                  }}>
                    STEP 0{stage.id}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: 2 }}>
                  {stage.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: 8 }}>
                  {stage.subtitle}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-glass)',
                paddingTop: 8,
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: stage.color,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <Sparkles size={10} /> {stage.techSpec}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explainer Detail Strip */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-glass)',
        borderRadius: 10,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Layers size={16} color="var(--primary)" />
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
            {hoveredNode
              ? pipelineStages.find((s) => s.id === hoveredNode)?.desc
              : 'Hover over any pipeline node to inspect technical cryptographic operations.'}
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
          Stylus WASM Gas: ~24k | EVM Equivalent: ~210k (-88.5%)
        </div>
      </div>
    </div>
  );
}
