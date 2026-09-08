import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  QrCode,
  Search,
  Filter,
  Calendar,
  Building,
  User,
  Copy,
  PlusCircle,
  Eye,
  Check,
  Lock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function PassportView() {
  const {
    credentials,
    setInspectCredential,
    setActiveTab,
    launchVerifyWithPreset,
    setQrModalData,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Recipient Profile Name
  const defaultRecipientName = credentials[0]?.recipientName || credentials[0]?.studentName || 'Recipient Portfolio';

  const totalCount = credentials.length;
  const activeCount = credentials.filter((c) => c.status === 1).length;
  const revokedCount = credentials.filter((c) => c.status === 2).length;

  const filteredCredentials = credentials.filter((c) => {
    const term = searchTerm.toLowerCase();
    const title = (c.title || c.degree || '').toLowerCase();
    const org = (c.organization || c.institution || '').toLowerCase();
    const id = (c.id || '').toLowerCase();
    const type = (c.credentialType || '').toLowerCase();

    const matchesSearch = title.includes(term) || org.includes(term) || id.includes(term) || type.includes(term);

    const matchesType = typeFilter === 'ALL' || (c.credentialType || 'Certificate') === typeFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.status === 1) ||
      (statusFilter === 'REVOKED' && c.status === 2);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    showToast('Credential ID copied to clipboard', 'info');
  };

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* Passport Profile Banner */}
      <div className="glass-card" style={{
        padding: '36px 40px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(9, 13, 22, 0.95) 0%, rgba(13, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.1)'
      }}>
        {/* Glow Accent */}
        <div style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
                <ShieldCheck size={11} /> SELF-SOVEREIGN IDENTITY PASSPORT
              </span>
              <span className="tech-tag tech-tag-success" style={{ fontSize: '0.68rem' }}>
                ARBITRUM STYLUS VERIFIED
              </span>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: 6 }}>
              My Credential Passport
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', maxWidth: 620, margin: '0 0 16px' }}>
              Your collection of tamper-proof verifiable credentials and achievements, cryptographically secured by Arbitrum Stylus and zero-knowledge commitments.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  <User size={16} />
                </div>
                <span>{defaultRecipientName}</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>
                <strong>{activeCount}</strong> Verified Active Credentials
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('issue')}
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.84rem' }}
            >
              <PlusCircle size={15} /> Issue New Credential
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
            TOTAL CREDENTIALS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            In your passport vault
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
            VERIFIED & ACTIVE
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Cryptographically intact
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
            REVOKED RECORDS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: revokedCount > 0 ? 'var(--danger)' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            {revokedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Invalidated by issuer
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
            PRIVACY GUARANTEE
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={16} /> Salted Hashes
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Zero PII on public blockchain
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search credentials by title, issuing organization, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} color="var(--text-muted)" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
              style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
            >
              <option value="ALL">All Types</option>
              <option value="Certificate">Certificate</option>
              <option value="Degree">Degree</option>
              <option value="Diploma">Diploma</option>
              <option value="License">License</option>
              <option value="Training">Training</option>
              <option value="Award">Award</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="REVOKED">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* Credential Cards Grid */}
      {filteredCredentials.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Award size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
            No Credentials Found
          </h3>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.88rem', maxWidth: 400, margin: '0 auto 18px' }}>
            No credentials matched your current search filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {filteredCredentials.map((c) => {
            const isActive = c.status === 1;
            const isRevoked = c.status === 2;

            return (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isActive ? '1px solid var(--border-medium)' : '1px solid rgba(255, 71, 87, 0.3)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Top Badge Row */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                      {c.credentialType || 'Certificate'}
                    </span>
                    <span
                      className={`badge ${isActive ? 'badge-success' : (isRevoked ? 'badge-danger' : 'badge-warning')}`}
                      style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {isActive && <CheckCircle2 size={11} />}
                      {isRevoked && <AlertTriangle size={11} />}
                      {isActive ? 'VERIFIED • ACTIVE' : (isRevoked ? 'REVOKED' : 'UNCONFIRMED')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: '#ffffff',
                    lineHeight: 1.35,
                    marginBottom: 8
                  }}>
                    {c.title || c.degree}
                  </h3>

                  {/* Issuing Organization */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-sub)', fontSize: '0.84rem', marginBottom: 12 }}>
                    <Building size={14} color="var(--primary)" />
                    <span>Issued by: <strong>{c.organization || c.institution}</strong></span>
                  </div>

                  {/* Issue Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 16 }}>
                    <Calendar size={13} />
                    <span>
                      Issue Date: {c.issueDate || (c.issuedAt ? new Date(c.issuedAt * 1000).toLocaleDateString() : 'Official Attestation')}
                    </span>
                  </div>

                  {/* Short Credential ID Block */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20
                  }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        CREDENTIAL ID
                      </div>
                      <div className="mono-block" style={{ fontSize: '0.75rem' }}>
                        {c.id.slice(0, 10)}...{c.id.slice(-8)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyId(c.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 4 }}
                      title="Copy Credential ID"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Actions: [ View ] [ Verify ] [ Share QR ] */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 16
                }}>
                  <button
                    onClick={() => setInspectCredential(c)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 8px', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <Eye size={13} /> View
                  </button>

                  <button
                    onClick={() => launchVerifyWithPreset({ id: c.id, credentialHash: c.credentialHash || '' })}
                    className="btn btn-secondary"
                    style={{ padding: '8px 8px', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <ShieldCheck size={13} /> Verify
                  </button>

                  <button
                    onClick={() => setQrModalData(c)}
                    className="btn btn-primary"
                    style={{ padding: '8px 8px', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <QrCode size={13} /> Share QR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
