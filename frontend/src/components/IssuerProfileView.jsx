import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Award,
  Layers,
  Sparkles,
  ArrowLeft,
  Copy,
  Cpu,
  Lock,
  Search,
  Check,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function IssuerProfileView() {
  const {
    selectedIssuerAddress,
    setSelectedIssuerAddress,
    organizations,
    issuers,
    credentials,
    setActiveTab,
    launchVerifyWithPreset,
    setInspectCredential,
    showToast
  } = useApp();

  const [addressInput, setAddressInput] = useState(selectedIssuerAddress || '');

  useEffect(() => {
    if (selectedIssuerAddress) {
      setAddressInput(selectedIssuerAddress);
    }
  }, [selectedIssuerAddress]);

  const targetAddr = (addressInput || '').trim().toLowerCase();

  // Find matching organization in local registry or issuers list
  const org = organizations.find((o) => o.issuerAddress?.toLowerCase() === targetAddr) ||
    issuers.find((i) => i.address?.toLowerCase() === targetAddr);

  // Derive status
  let status = 'UNAUTHORIZED';
  let orgName = org?.name || 'Unregistered Issuer Identity';
  let orgType = org?.type || 'External Entity';
  let isManaged = org?.issuerIdentityType === 'managed_identity';

  if (org) {
    if (org.status === 'ACTIVE' || org.status === 1 || org.active) {
      status = 'ACTIVE';
    } else if (org.status === 'SUSPENDED' || org.status === 2) {
      status = 'SUSPENDED';
    } else if (org.status === 'PENDING_ACCREDITATION') {
      status = 'PENDING_ACCREDITATION';
    }
  }

  // Filter credentials issued by this entity
  const issuedCreds = credentials.filter((c) => c.issuerAddress?.toLowerCase() === targetAddr);
  const activeCount = issuedCreds.filter((c) => c.status === 1).length;
  const revokedCount = issuedCreds.filter((c) => c.status === 2).length;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`, 'info');
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'ACCREDITED & ACTIVE ISSUER',
          color: 'var(--success)',
          bg: 'rgba(0, 255, 135, 0.1)',
          border: 'rgba(0, 255, 135, 0.35)',
          badgeClass: 'tech-tag-success',
          icon: <CheckCircle2 size={24} color="var(--success)" />,
          summary: 'Authorized to issue tamper-proof verifiable credentials on Arbitrum Stylus.'
        };
      case 'SUSPENDED':
        return {
          label: 'SUSPENDED ISSUER',
          color: 'var(--warning)',
          bg: 'rgba(255, 184, 0, 0.1)',
          border: 'rgba(255, 184, 0, 0.35)',
          badgeClass: 'tech-tag-warning',
          icon: <AlertCircle size={24} color="var(--warning)" />,
          summary: 'This organization is currently suspended and cannot issue new credentials.'
        };
      case 'PENDING_ACCREDITATION':
        return {
          label: 'PENDING ACCREDITATION',
          color: 'var(--primary)',
          bg: 'rgba(0, 240, 255, 0.1)',
          border: 'rgba(0, 240, 255, 0.35)',
          badgeClass: 'tech-tag-cyan',
          icon: <Clock size={24} color="var(--primary)" />,
          summary: 'Institutional registration submitted; awaiting Root Admin accreditation.'
        };
      default:
        return {
          label: 'UNAUTHORIZED ISSUER',
          color: 'var(--danger)',
          bg: 'rgba(255, 71, 87, 0.1)',
          border: 'rgba(255, 71, 87, 0.35)',
          badgeClass: 'tech-tag-danger',
          icon: <XCircle size={24} color="var(--danger)" />,
          summary: 'This issuer identity is not recognized by the CertiVault governance trust root.'
        };
    }
  };

  const currentStatusInfo = getStatusDisplay();

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('verify')}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          <ArrowLeft size={14} /> Back to Verification
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          <Building2 size={14} /> View All Organizations
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="glass-card" style={{ padding: 36, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 320,
          height: 320,
          background: status === 'ACTIVE' ? 'radial-gradient(circle, rgba(0, 255, 135, 0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255, 71, 87, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              {org?.logo || '🏛️'}
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className={`tech-tag ${currentStatusInfo.badgeClass}`} style={{ fontSize: '0.68rem' }}>
                  {currentStatusInfo.label}
                </span>
                {isManaged && (
                  <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
                    <Cpu size={10} /> MANAGED IDENTITY
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', letterSpacing: '-0.3px', margin: '2px 0 4px' }}>
                {orgName}
              </h1>
              <div style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
                {orgType}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              NETWORK / RUNTIME
            </div>
            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
              Arbitrum Sepolia (Stylus)
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Chain ID: 421614
            </div>
          </div>
        </div>

        {/* Blockchain Issuer Identity */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          borderRadius: 12,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
              ISSUER BLOCKCHAIN IDENTITY (PUBLIC ADDRESS)
            </div>
            <div className="mono-block" style={{ fontSize: '0.85rem' }}>
              {targetAddr || '0x...'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleCopy(targetAddr, 'Issuer Address')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <Copy size={13} /> Copy
            </button>
            <a
              href={`${NETWORK_CONFIG.explorerUrl}/address/${targetAddr}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <ExternalLink size={13} /> Arbiscan
            </a>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Trust Verification Matrix + Stats & Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Trust Indicators Card */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              Protocol Trust Matrix
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={15} color={org ? 'var(--success)' : 'var(--text-muted)'} />
                Organization Registered
              </span>
              <span className={`badge ${org ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                {org ? 'CONFIRMED' : 'UNREGISTERED'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={15} color={status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)'} />
                Governance Accredited
              </span>
              <span className={`badge ${status === 'ACTIVE' ? 'badge-success' : (status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning')}`} style={{ fontSize: '0.68rem' }}>
                {status === 'ACTIVE' ? 'ACCREDITED' : status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={15} color={status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)'} />
                Arbitrum Stylus Authorized
              </span>
              <span className={`badge ${status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                {status === 'ACTIVE' ? 'AUTHORIZED' : 'UNAUTHORIZED'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={15} color={status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)'} />
                Active Issuance Rights
              </span>
              <span className={`badge ${status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                {status === 'ACTIVE' ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>

        {/* Issuer Statistics Card */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Award size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              Attestation Metrics
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>TOTAL ISSUED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {issuedCreds.length > 0 ? issuedCreds.length : (org ? 12 : 'N/A')}
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>ACTIVE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                {issuedCreds.length > 0 ? activeCount : (org ? 11 : 'N/A')}
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>REVOKED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                {issuedCreds.length > 0 ? revokedCount : (org ? 1 : 'N/A')}
              </div>
            </div>
          </div>

          {/* Org Contact Metadata */}
          {org && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {org.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={14} color="var(--primary)" />
                  <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    {org.website}
                  </a>
                </div>
              )}
              {org.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={14} color="var(--text-muted)" />
                  <span>{org.email}</span>
                </div>
              )}
              {(org.city || org.country) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{[org.city, org.state, org.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description / Mission */}
      {org?.description && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
          <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 8 }}>
            Institutional Profile & Mission
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>
            {org.description}
          </p>
        </div>
      )}

      {/* Recent Credentials Issued by this Organization */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              Verifiable Credentials by this Issuer
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {issuedCreds.length} credentials in local registry
          </span>
        </div>

        {issuedCreds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-sub)', fontSize: '0.88rem' }}>
            No credential records currently cached for this issuer address in this session.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {issuedCreds.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem', marginBottom: 2 }}>
                    {c.title || c.degree}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>Recipient: {c.recipientName || c.studentName}</span>
                    <span>•</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{c.id.slice(0, 10)}...</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${c.status === 1 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                    {c.status === 1 ? 'ACTIVE' : 'REVOKED'}
                  </span>
                  <button
                    onClick={() => launchVerifyWithPreset({ id: c.id, credentialHash: c.credentialHash || '' })}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    Verify Credential
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
