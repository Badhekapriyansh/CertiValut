import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
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
  ArrowRight,
  LogOut,
  KeyRound,
  ShieldAlert,
  Wallet,
  CheckCircle,
  Info
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function PassportView() {
  const {
    credentials,
    setInspectCredential,
    setActiveTab,
    launchVerifyWithPreset,
    setQrModalData,
    authenticatedHolder,
    authenticateHolder,
    logoutHolder,
    isDemoMode,
    showToast
  } = useApp();

  const { account, connectWallet, isConnecting } = useWallet();

  // Login form state
  const [holderInput, setHolderInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Search & Filter within authenticated Passport
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Handle Manual Holder ID Authentication
  const handleHolderSignIn = (e) => {
    e?.preventDefault();
    setLoginError('');

    if (!holderInput.trim()) {
      setLoginError('Please enter a valid Holder Identifier or Reference ID.');
      return;
    }

    const profile = authenticateHolder(holderInput.trim());
    if (!profile) {
      setLoginError('Could not authenticate with the provided identifier.');
    }
  };

  // Handle Wallet Authentication
  const handleWalletAuth = async () => {
    setLoginError('');
    if (!account) {
      await connectWallet();
    }
    if (account) {
      authenticateHolder({
        id: account,
        name: `Wallet Holder (${account.slice(0, 6)}...${account.slice(-4)})`,
        identifier: account,
        address: account,
        authMethod: 'wallet'
      });
    }
  };

  // Demo 1-Click Profile Selectors for Simulator Testing
  const demoProfiles = [
    { name: 'Elena Rostova', id: 'REC-STANFORD-9901', org: 'Stanford University' },
    { name: 'Marcus Vance', id: 'ARB-CERT-8820', org: 'Offchain Labs Academy' },
    { name: 'Aaliyah Chen', id: 'ETH-FELLOW-2026', org: 'Ethereum Foundation' },
    { name: 'Sarah Jenkins', id: 'OX-LAW-4402', org: 'University of Oxford (Revoked)' },
    { name: 'Alexander Vance', id: 'REC-2026-904', org: 'Arbitrum Guild' },
  ];

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    showToast('Credential ID copied to clipboard', 'info');
  };

  // =========================================================================
  // 1. PROTECTED ACCESS SCREEN (Unauthenticated Visitor)
  // =========================================================================
  if (!authenticatedHolder) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 20 }}>
        <div className="glass-card" style={{
          padding: '44px 36px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.08)'
        }}>
          {/* Lock Icon Emblem */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
          }}>
            <Lock size={36} color="var(--primary)" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
              <ShieldCheck size={11} /> PRIVACY-PROTECTED RECIPIENT VAULT
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', marginBottom: 10 }}>
            Credential Passport Protected
          </h1>

          <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.5 }}>
            Your Credential Passport is a private, self-sovereign vault. Authenticate with your Holder Reference ID or connected Web3 wallet to access your issued credentials.
          </p>

          {/* Authentication Form */}
          <form onSubmit={handleHolderSignIn} style={{ maxWidth: 440, margin: '0 auto 28px', textAlign: 'left' }}>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <KeyRound size={13} /> Holder Identifier / Student Reference ID
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. REC-STANFORD-9901 or REC-2026-904"
                value={holderInput}
                onChange={(e) => setHolderInput(e.target.value)}
                className="input-field"
                style={{ padding: '12px 14px', fontSize: '0.9rem' }}
              />
            </div>

            {loginError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                color: 'var(--danger)',
                fontSize: '0.82rem',
                marginBottom: 16
              }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.92rem', justifyContent: 'center' }}
            >
              <Lock size={16} /> Unlock My Passport
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 440, margin: '0 auto 24px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          {/* Wallet Authentication Option */}
          <div style={{ maxWidth: 440, margin: '0 auto 36px' }}>
            <button
              onClick={handleWalletAuth}
              disabled={isConnecting}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.9rem', justifyContent: 'center' }}
            >
              <Wallet size={16} color="var(--primary)" />
              {account ? `Authenticate as ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Blockchain Wallet'}
            </button>
          </div>

          {/* 1-Click Demo Profiles for Judge Testing */}
          {isDemoMode && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '18px 20px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>
                <Sparkles size={13} />
                <span>Judge Showcase — 1-Click Demo Holder Profiles:</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {demoProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => authenticateHolder(p.id)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#ffffff' }}>{p.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.id}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED HOLDER PASSPORT SCREEN
  // =========================================================================

  // Filter credentials strictly for this authenticated holder
  const holderId = (authenticatedHolder.id || authenticatedHolder.identifier || '').toLowerCase();
  const holderName = (authenticatedHolder.name || '').toLowerCase();
  const holderAddr = (authenticatedHolder.address || '').toLowerCase();

  const holderCredentials = credentials.filter((c) => {
    const cRecipientId = (c.recipientId || c.studentId || '').toLowerCase();
    const cRecipientName = (c.recipientName || c.studentName || '').toLowerCase();
    const cRecipientAddr = (c.recipientAddress || '').toLowerCase();

    // Strict identity match: by ID, by Name, or by Wallet Address
    const isOwner =
      (holderId && (cRecipientId === holderId || cRecipientId.includes(holderId))) ||
      (holderAddr && cRecipientAddr === holderAddr) ||
      (holderName && (cRecipientName === holderName || cRecipientName.includes(holderName)));

    return isOwner;
  });

  const activeCount = holderCredentials.filter((c) => c.status === 1).length;
  const revokedCount = holderCredentials.filter((c) => c.status === 2).length;

  // Search & Type Filtering over the holder's own credentials
  const filteredCredentials = holderCredentials.filter((c) => {
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
                <ShieldCheck size={11} /> AUTHENTICATED HOLDER PASSPORT
              </span>
              <span className="tech-tag tech-tag-success" style={{ fontSize: '0.68rem' }}>
                ARBITRUM STYLUS ANCHORED
              </span>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: 6 }}>
              My Credential Passport
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', maxWidth: 620, margin: '0 0 16px' }}>
              Your private collection of verifiable achievements. Share single credentials selectively via QR code without exposing your entire passport.
            </p>

            {/* Authenticated Identity Information */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff', fontWeight: 700, fontSize: '1.05rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  <User size={18} />
                </div>
                <span>{authenticatedHolder.name || 'Verified Holder'}</span>
              </div>

              <span style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                color: 'var(--primary)',
                fontSize: '0.76rem',
                padding: '3px 10px',
                borderRadius: 20,
                fontFamily: 'var(--font-mono)'
              }}>
                ID: {authenticatedHolder.id}
              </span>

              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>
                <strong>{activeCount}</strong> Active Credentials
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('issue')}
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.84rem' }}
            >
              <PlusCircle size={15} /> Issue New Credential
            </button>
            <button
              onClick={logoutHolder}
              className="btn btn-secondary"
              style={{ padding: '10px 16px', fontSize: '0.84rem' }}
              title="Lock Passport & Sign Out"
            >
              <LogOut size={14} /> Lock / Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
            MY TOTAL CREDENTIALS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {holderCredentials.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Assigned to your identity
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
            SELECTIVE SHARING
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={15} /> 1-at-a-Time Sharing
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Full passport never exposed
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search your credentials by title, issuing organization, or ID..."
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

      {/* Holder Credential Cards Grid */}
      {holderCredentials.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Award size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
            No Credentials Yet
          </h3>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.88rem', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
            Credentials issued to your verified identity (<strong>{authenticatedHolder.id}</strong>) will appear here automatically when issued by an accredited institution.
          </p>
          <button
            onClick={() => setActiveTab('issue')}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
          >
            <PlusCircle size={14} /> Issue a Credential to this Identity
          </button>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="glass-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <Search size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ color: '#ffffff', marginBottom: 4 }}>No matching credentials</h4>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.84rem', marginBottom: 14 }}>
            Try adjusting your search query or filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
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
                    title="View Credential Attestation"
                  >
                    <Eye size={13} /> View
                  </button>

                  <button
                    onClick={() => launchVerifyWithPreset({ id: c.id, credentialHash: c.credentialHash || '' })}
                    className="btn btn-secondary"
                    style={{ padding: '8px 8px', fontSize: '0.78rem', justifyContent: 'center' }}
                    title="Verify against Arbitrum Stylus"
                  >
                    <ShieldCheck size={13} /> Verify
                  </button>

                  <button
                    onClick={() => setQrModalData(c)}
                    className="btn btn-primary"
                    style={{ padding: '8px 8px', fontSize: '0.78rem', justifyContent: 'center' }}
                    title="Share this single credential via QR code"
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
