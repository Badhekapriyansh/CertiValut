import React from 'react';
import { CERTIVAULT_CONTRACT_ADDRESS, IS_CONTRACT_CONFIGURED, NETWORK_CONFIG } from '../config/contracts';
import { ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';

export default function StatusBanner() {
  if (IS_CONTRACT_CONFIGURED) {
    return (
      <div style={{
        background: 'rgba(52, 211, 153, 0.08)',
        borderBottom: '1px solid rgba(52, 211, 153, 0.2)',
        padding: '10px 24px',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--success)'
      }}>
        <CheckCircle2 size={16} />
        <span>Connected to Live Contract: <strong style={{ fontFamily: 'monospace' }}>{CERTIVAULT_CONTRACT_ADDRESS}</strong></span>
        <a
          href={`${NETWORK_CONFIG.blockExplorerUrl}/address/${CERTIVAULT_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
        >
          View on Arbiscan <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(251, 191, 36, 0.08)',
      borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
      padding: '12px 24px',
      fontSize: '0.85rem',
      color: 'var(--warning)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      textAlign: 'center'
    }}>
      <ShieldAlert size={18} />
      <span>
        <strong>Smart Contract Deployment Pending:</strong> Frontend is prepared in staging mode. Set <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>VITE_CERTIVAULT_CONTRACT_ADDRESS</code> in <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>frontend/.env</code> once deployed.
      </span>
    </div>
  );
}
