import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Printer,
  Copy,
  FileCheck,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function CredentialDetailModal() {
  const { inspectCredential, setInspectCredential, showToast } = useApp();
  const [showTechnicalProof, setShowTechnicalProof] = useState(false);

  if (!inspectCredential) return null;

  const isRevoked = inspectCredential.status === 2;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`, 'info');
  };

  return (
    <div className="modal-backdrop" onClick={() => setInspectCredential(null)}>
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 32,
          position: 'relative',
          background: '#0a0e17',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setInspectCredential(null)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 20,
          marginBottom: 20
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: isRevoked ? 'var(--danger-bg)' : 'var(--success-bg)',
            border: `1px solid ${isRevoked ? 'var(--danger-border)' : 'var(--success-border)'}`,
            color: isRevoked ? 'var(--danger)' : 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isRevoked ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-blue">
                {inspectCredential.credentialType || 'Credential'}
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
              {inspectCredential.title || inspectCredential.degree}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Building size={13} color="var(--primary)" />
              <span>{inspectCredential.organization || inspectCredential.institution}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: 20 }}>
          <span className={`badge ${isRevoked ? 'badge-danger' : 'badge-success'}`}>
            {isRevoked ? 'Permanently Revoked' : 'Active & Cryptographically Verified on Arbitrum Stylus'}
          </span>
        </div>

        {/* Core Metadata */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RECIPIENT / HOLDER</div>
            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.92rem' }}>{inspectCredential.recipientName || inspectCredential.studentName}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RECIPIENT / REFERENCE ID</div>
            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.92rem' }}>{inspectCredential.recipientId || inspectCredential.studentId}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ISSUE DATE</div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
              {inspectCredential.issueDate || (inspectCredential.issuedAt > 0
                ? new Date(inspectCredential.issuedAt * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : 'N/A')}
            </div>
          </div>

          {(inspectCredential.description || inspectCredential.honors) && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DESCRIPTION / DETAILS</div>
              <div style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>{inspectCredential.description || inspectCredential.honors}</div>
            </div>
          )}
        </div>

        {/* Technical Proof Dropdown */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <button
            onClick={() => setShowTechnicalProof(!showTechnicalProof)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: 0
            }}
          >
            <Cpu size={14} />
            <span>{showTechnicalProof ? 'Hide Cryptographic Proof' : 'View Cryptographic Proof'}</span>
            {showTechnicalProof ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showTechnicalProof && (
            <div style={{
              marginTop: 12,
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>CREDENTIAL ID</div>
                <div className="mono-block">{inspectCredential.id}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>DOCUMENT HASH (SHA-256)</div>
                <div className="mono-block">{inspectCredential.credentialHash}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>HOLDER COMMITMENT (ZKP)</div>
                <div className="mono-block">{inspectCredential.holderCommitment}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>ISSUER ADDRESS</div>
                  <div className="mono-block">{inspectCredential.issuerAddress.slice(0, 10)}...</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>TRANSACTION</div>
                  <a
                    href={`${NETWORK_CONFIG.blockExplorerUrl}/tx/${inspectCredential.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono-block"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'var(--primary)' }}
                  >
                    <span>{inspectCredential.txHash.slice(0, 8)}...</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            <Printer size={14} /> Print Certificate
          </button>
          <button
            onClick={() => setInspectCredential(null)}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.84rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
