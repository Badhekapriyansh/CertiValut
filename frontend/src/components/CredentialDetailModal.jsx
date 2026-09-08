import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
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
  Cpu,
  FileText,
  Award,
  Clock,
  Sparkles,
  QrCode,
  Building2
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function CredentialDetailModal() {
  const { inspectCredential, setInspectCredential, showToast, openIssuerProfile, setQrModalData } = useApp();
  const [showTechnicalProof, setShowTechnicalProof] = useState(false);

  if (!inspectCredential) return null;

  // Derive exact verification status
  const code = inspectCredential.verificationStatusCode !== undefined
    ? inspectCredential.verificationStatusCode
    : (inspectCredential.status === 2 ? 5 : (inspectCredential.status === 1 ? 0 : 0));

  const getVerificationState = (statusCode) => {
    switch (statusCode) {
      case 0:
        return {
          statusLabel: 'VERIFIED',
          badgeText: 'VERIFIED ON-CHAIN',
          badgeClass: 'badge-success',
          color: 'var(--success)',
          bg: 'rgba(0, 255, 135, 0.08)',
          border: 'rgba(0, 255, 135, 0.3)',
          icon: <CheckCircle2 size={24} color="var(--success)" />,
          reason: null,
          details: [
            { label: 'Issuer Authority', value: 'Authorized & Accredited' },
            { label: 'Document Match', value: 'Cryptographic Root Matched' },
            { label: 'Credential Status', value: 'Active On-Chain' }
          ]
        };
      case 4:
        return {
          statusLabel: 'NOT VERIFIED',
          badgeText: 'ALTERATION DETECTED',
          badgeClass: 'badge-danger',
          color: 'var(--danger)',
          bg: 'rgba(255, 71, 87, 0.08)',
          border: 'rgba(255, 71, 87, 0.3)',
          icon: <XCircle size={24} color="var(--danger)" />,
          reason: 'Document Hash Mismatch',
          explanation: 'The submitted document/data does not match the cryptographic fingerprint registered on Arbitrum Stylus for this credential.'
        };
      case 5:
        return {
          statusLabel: 'REVOKED',
          badgeText: 'PERMANENTLY REVOKED',
          badgeClass: 'badge-danger',
          color: 'var(--danger)',
          bg: 'rgba(255, 71, 87, 0.08)',
          border: 'rgba(255, 71, 87, 0.3)',
          icon: <AlertTriangle size={24} color="var(--danger)" />,
          reason: 'Credential Revoked by Issuer',
          explanation: 'This credential was previously issued but has been permanently revoked by the authorized issuing organization.'
        };
      case 1:
        return {
          statusLabel: 'NOT VERIFIED',
          badgeText: 'RECORD NOT FOUND',
          badgeClass: 'badge-danger',
          color: 'var(--danger)',
          bg: 'rgba(255, 71, 87, 0.08)',
          border: 'rgba(255, 71, 87, 0.3)',
          icon: <XCircle size={24} color="var(--danger)" />,
          reason: 'Credential Not Found',
          explanation: 'No matching record exists on the Arbitrum Stylus immutable ledger for this Credential ID.'
        };
      case 2:
        return {
          statusLabel: 'NOT VERIFIED',
          badgeText: 'ISSUER NOT ACCREDITED',
          badgeClass: 'badge-warning',
          color: 'var(--warning)',
          bg: 'rgba(245, 158, 11, 0.08)',
          border: 'rgba(245, 158, 11, 0.3)',
          icon: <AlertTriangle size={24} color="var(--warning)" />,
          reason: 'Issuer Inactive / Not Accredited',
          explanation: 'The issuing entity is not accredited in the protocol governance trust root.'
        };
      case 3:
        return {
          statusLabel: 'NOT VERIFIED',
          badgeText: 'ISSUER SUSPENDED',
          badgeClass: 'badge-warning',
          color: 'var(--warning)',
          bg: 'rgba(245, 158, 11, 0.08)',
          border: 'rgba(245, 158, 11, 0.3)',
          icon: <AlertTriangle size={24} color="var(--warning)" />,
          reason: 'Issuer Inactive / Suspended',
          explanation: 'The issuing organization currently has its verification privileges suspended.'
        };
      default:
        return {
          statusLabel: 'NOT VERIFIED',
          badgeText: 'UNKNOWN STATUS',
          badgeClass: 'badge-warning',
          color: 'var(--warning)',
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          icon: <AlertCircle size={24} color="var(--warning)" />,
          reason: 'Unverified State',
          explanation: 'The credential state could not be confirmed.'
        };
    }
  };

  const vState = getVerificationState(code);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`, 'info');
  };

  return (
    <div className="modal-backdrop print-modal-backdrop" onClick={() => setInspectCredential(null)}>
      <div
        className="glass-card printable-credential-document"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: 36,
          position: 'relative',
          background: '#0a0e17',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Close Button (Hidden in Print) */}
        <button
          onClick={() => setInspectCredential(null)}
          className="no-print"
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

        {/* Certificate Header Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 16,
          marginBottom: 20
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              CERTIVAULT PROTOCOL
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', letterSpacing: '-0.3px', margin: '2px 0 0' }}>
              VERIFIABLE CREDENTIAL ATTESTATION
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
              ARBITRUM STYLUS (WASM)
            </span>
          </div>
        </div>

        {/* Title & Organization Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 20
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: vState.bg,
            border: `1px solid ${vState.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {vState.icon}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-blue">
                {inspectCredential.credentialType || 'Credential'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff', lineHeight: 1.2 }}>
              {inspectCredential.title || inspectCredential.degree || 'Verifiable Credential'}
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Building size={14} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>
                  {inspectCredential.organization || inspectCredential.institution || inspectCredential.issuerAddress || 'Accredited Authority'}
                </span>
              </span>
              <button
                onClick={() => {
                  setInspectCredential(null);
                  openIssuerProfile(inspectCredential.issuerAddress || inspectCredential.issuer || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
                }}
                className="no-print"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'underline'
                }}
              >
                <Building2 size={11} /> View Issuer Trust Profile
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Verification Status Section */}
        <div style={{
          background: vState.bg,
          border: `1px solid ${vState.border}`,
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 22
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
                VERIFICATION STATUS
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: vState.color, letterSpacing: '0.5px' }}>
                STATUS: {vState.statusLabel}
              </div>
            </div>

            <span className={`badge ${vState.badgeClass}`} style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              {vState.badgeText}
            </span>
          </div>

          {vState.reason && (
            <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: vState.color }}>
                Reason: {vState.reason}
              </div>
              {vState.explanation && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  {vState.explanation}
                </div>
              )}
            </div>
          )}

          {vState.details && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
              {vState.details.map((d, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{d.label}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{d.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Core Credential Metadata Grid */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          padding: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 22
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RECIPIENT / HOLDER</div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.98rem', marginTop: 2 }}>
              {inspectCredential.recipientName || inspectCredential.studentName || 'Recipient'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RECIPIENT ID / REFERENCE</div>
            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              {inspectCredential.recipientId || inspectCredential.studentId || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CREDENTIAL TYPE</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginTop: 2 }}>
              {inspectCredential.credentialType || 'Verifiable Credential'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ISSUE DATE</div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', marginTop: 2 }}>
              {inspectCredential.issueDate || (inspectCredential.issuedAt > 0
                ? new Date(inspectCredential.issuedAt * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : 'N/A')}
            </div>
          </div>

          {(inspectCredential.description || inspectCredential.honors) && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DESCRIPTION / DETAILS</div>
              <div style={{ color: 'var(--text-main)', fontSize: '0.86rem', marginTop: 2, lineHeight: 1.4 }}>
                {inspectCredential.description || inspectCredential.honors}
              </div>
            </div>
          )}
        </div>

        {/* Cryptographic Identifiers */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 20
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
              CREDENTIAL ID (KECCAK-256)
            </div>
            <div className="mono-block" style={{ fontSize: '0.76rem' }}>
              {inspectCredential.id || inspectCredential.credId || 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
              DOCUMENT FINGERPRINT HASH (SHA-256)
            </div>
            <div className="mono-block" style={{ fontSize: '0.76rem' }}>
              {inspectCredential.credentialHash || inspectCredential.credHash || 'N/A'}
            </div>
          </div>

          {inspectCredential.holderCommitment && (
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                HOLDER COMMITMENT (ZKP PRIVACY)
              </div>
              <div className="mono-block" style={{ fontSize: '0.76rem' }}>
                {inspectCredential.holderCommitment}
              </div>
            </div>
          )}
        </div>

        {/* On-Chain Ledger Proof for Print (Always visible in Print) */}
        <div className="print-only" style={{
          borderTop: '1px solid #cbd5e1',
          paddingTop: 14,
          marginBottom: 16
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0f172a', marginBottom: 8, textTransform: 'uppercase' }}>
            ON-CHAIN LEDGER PROOF
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>ISSUER WALLET ADDRESS</div>
              <div className="mono-block" style={{ fontSize: '0.75rem' }}>
                {inspectCredential.issuerAddress || inspectCredential.issuer || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>BLOCKCHAIN RUNTIME</div>
              <div className="mono-block" style={{ fontSize: '0.75rem' }}>
                Arbitrum Stylus Nitro (Chain ID: 421614 Sepolia)
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer Stamp */}
        <div className="print-only" style={{
          borderTop: '2px solid #0f172a',
          paddingTop: 12,
          marginTop: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#475569',
          fontFamily: 'var(--font-mono)'
        }}>
          <div>
            <strong>CERTIVAULT PROTOCOL</strong> • Verifiable Credential Record
          </div>
          <div>
            Arbitrum Stylus / Arbitrum Sepolia
          </div>
        </div>

        {/* Technical Proof Dropdown (Interactive on Screen) */}
        <div className="no-print" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
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
            <span>{showTechnicalProof ? 'Hide Cryptographic Proof' : 'View On-Chain Ledger Proof'}</span>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>ISSUER ADDRESS</div>
                  <div className="mono-block">{inspectCredential.issuerAddress || inspectCredential.issuer || '0x...'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>ARBITRUM STYLUS LEDGER</div>
                  <div className="mono-block">Chain ID: 421614 (Sepolia)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions (Hidden in Print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setQrModalData(inspectCredential);
            }}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <QrCode size={14} /> Share / View QR
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <Printer size={14} /> Print Credential
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

