import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  CheckCircle2,
  Ban,
  Building,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  UserPlus
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function ActivityView() {
  const { activities, credentials, setInspectCredential } = useApp();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getActionBadge = (type) => {
    switch (type) {
      case 'CREDENTIAL_ISSUED':
        return <span className="badge badge-success">Issued</span>;
      case 'CREDENTIAL_REVOKED':
        return <span className="badge badge-danger">Revoked</span>;
      case 'ISSUER_REGISTERED':
        return <span className="badge badge-blue">Accredited</span>;
      default:
        return <span className="badge badge-neutral">Event</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
            <Activity size={11} /> ON-CHAIN AUDIT LOG
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
          Activity & Transaction Timeline
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
          Verifiable stream of credential issuances, revocations, and organization authorizations on Arbitrum Stylus.
        </p>
      </div>

      {/* Activity Timeline List */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activities.map((act, index) => {
            const isExpanded = expandedIndex === index;
            const matchedCred = act.credId
              ? credentials.find((c) => c.id.toLowerCase() === act.credId.toLowerCase())
              : null;

            return (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: '16px 20px',
                  background: isExpanded ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {act.type === 'CREDENTIAL_ISSUED' ? (
                        <CheckCircle2 size={18} color="var(--success)" />
                      ) : act.type === 'CREDENTIAL_REVOKED' ? (
                        <Ban size={18} color="var(--danger)" />
                      ) : (
                        <UserPlus size={18} color="var(--primary)" />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {act.type === 'CREDENTIAL_ISSUED'
                            ? 'Credential Issued'
                            : act.type === 'CREDENTIAL_REVOKED'
                            ? 'Credential Revoked'
                            : 'Organization Accredited'}
                        </span>
                        {getActionBadge(act.type)}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>
                        {act.issuerName || act.issuer}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <div>{new Date(act.timestamp * 1000).toLocaleTimeString()}</div>
                      <div>{new Date(act.timestamp * 1000).toLocaleDateString()}</div>
                    </div>

                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Blockchain Details */}
                {isExpanded && (
                  <div style={{
                    marginTop: 14,
                    padding: 16,
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: '0.8rem'
                  }}>
                    {act.credId && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                          CREDENTIAL ID:
                        </div>
                        <div className="mono-block">{act.credId}</div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>TRANSACTION HASH: </span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                          {act.txHash ? `${act.txHash.slice(0, 16)}...` : 'On-Chain Attestation'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        {matchedCred && (
                          <button
                            onClick={() => setInspectCredential(matchedCred)}
                            className="btn btn-primary"
                            style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                          >
                            View Attestation
                          </button>
                        )}

                        {act.txHash && (
                          <a
                            href={`${NETWORK_CONFIG.blockExplorerUrl}/tx/${act.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', textDecoration: 'none' }}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
