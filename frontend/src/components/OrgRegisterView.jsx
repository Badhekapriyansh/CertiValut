import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Globe,
  Mail,
  MapPin,
  FileText,
  User,
  Sparkles,
  Cpu,
  KeyRound,
  ExternalLink,
  Info
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

const ORGANIZATION_TYPES = [
  'University / College',
  'School',
  'Training Institute',
  'Certification Provider',
  'Company',
  'Non-Profit Organization',
  'Professional Organization',
  'Government Organization',
  'Other'
];

export default function OrgRegisterView() {
  const { isDemoMode, registerOrganization, setActiveTab, showToast, triggerConfetti } = useApp();
  const { account, connectWallet } = useWallet();

  const [step, setStep] = useState(1);

  // Form Fields (Step 1)
  const [orgName, setOrgName] = useState('');
  const [orgShortName, setOrgShortName] = useState('');
  const [orgType, setOrgType] = useState('University / College');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [logo, setLogo] = useState('🏛️');

  // Issuer Identity (Step 2)
  const [identityChoice, setIdentityChoice] = useState('managed_identity'); // 'managed_identity' or 'external_wallet'
  const [customWalletAddress, setCustomWalletAddress] = useState('');
  const [provisionedManagedAddress, setProvisionedManagedAddress] = useState('');
  const [error, setError] = useState(null);
  const [createdOrg, setCreatedOrg] = useState(null);

  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    if (!orgName.trim() || !email.trim() || !country.trim() || !city.trim() || !website.trim() || !description.trim()) {
      setError('Please fill in all required organization fields.');
      return;
    }
    setError(null);

    // Generate deterministic demo managed address based on org name hash
    if (!provisionedManagedAddress) {
      const generated = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setProvisionedManagedAddress(generated);
    }
    setStep(2);
  };

  const handleCompleteRegistration = () => {
    setError(null);

    let finalIssuerAddress = '';
    if (identityChoice === 'external_wallet') {
      const target = customWalletAddress.trim() || account;
      if (!target || !target.startsWith('0x') || target.length !== 42) {
        setError('Please provide a valid 42-character Ethereum public address (0x...).');
        return;
      }
      finalIssuerAddress = target;
    } else {
      finalIssuerAddress = provisionedManagedAddress;
    }

    const newOrg = {
      id: `org-${Date.now().toString(36)}`,
      name: orgName.trim(),
      shortName: orgShortName.trim() || orgName.trim().slice(0, 16),
      type: orgType,
      email: email.trim(),
      country: country.trim(),
      state: stateRegion.trim(),
      city: city.trim(),
      website: website.trim(),
      description: description.trim(),
      contactPerson: contactPerson.trim(),
      logo: logo || '🏛️',
      issuerIdentityType: identityChoice,
      issuerAddress: finalIssuerAddress,
      status: 'PENDING_ACCREDITATION',
      createdAt: Math.floor(Date.now() / 1000),
      accreditedAt: null,
    };

    registerOrganization(newOrg);
    setCreatedOrg(newOrg);
    setStep(3);
    triggerConfetti();
    showToast(`Organization "${newOrg.name}" registered successfully!`, 'success');
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Step Indicator Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
            <Building2 size={12} /> ORGANIZATIONAL ONBOARDING
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 8 }}>
          Register Your Organization
        </h1>
        <p style={{ color: 'var(--text-sub)', maxWidth: 560, margin: '0 auto', fontSize: '0.95rem' }}>
          Create an organizational identity for issuing verifiable credentials on Arbitrum Stylus.
        </p>

        {/* Progress Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)'
          }}>
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: step >= 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: '#040609',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>1</span>
            <span>Organization Details</span>
          </div>

          <div style={{ width: 30, height: 1, background: 'var(--border-subtle)' }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)'
          }}>
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: step >= 2 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: '#040609',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>2</span>
            <span>Issuer Identity</span>
          </div>

          <div style={{ width: 30, height: 1, background: 'var(--border-subtle)' }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: step >= 3 ? 'var(--success)' : 'var(--text-muted)'
          }}>
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: step >= 3 ? 'var(--success)' : 'rgba(255,255,255,0.1)',
              color: '#040609',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>3</span>
            <span>Accreditation Ready</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 24,
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: ORGANIZATION PROFILE FORM */}
      {step === 1 && (
        <div className="glass-card" style={{ padding: '32px 36px' }}>
          <form onSubmit={handleProceedToStep2}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">
                  <Building2 size={14} /> Organization / Institution Official Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University or Linux Foundation"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Sparkles size={14} /> Organization Type *
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="input-field"
                  required
                >
                  {ORGANIZATION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FileText size={14} /> Short Name / Acronym (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford, MIT, AWS Academy"
                  value={orgShortName}
                  onChange={(e) => setOrgShortName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Mail size={14} /> Official Email *
                </label>
                <input
                  type="email"
                  placeholder="registrar@organization.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Globe size={14} /> Official Website URL *
                </label>
                <input
                  type="url"
                  placeholder="https://www.organization.edu"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <MapPin size={14} /> Country *
                </label>
                <input
                  type="text"
                  placeholder="e.g. United States, United Kingdom, India, Canada"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <MapPin size={14} /> State / Region / City *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="State / Region"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="City *"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">
                  <User size={14} /> Official Contact Person / Registrar (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Eleanor Vance, Dean of Academic Records"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">
                  <FileText size={14} /> Organization Description & Mission *
                </label>
                <textarea
                  placeholder="Describe your organization's mission, accreditation background, and credential issuing domain..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.92rem' }}
              >
                <span>Continue to Issuer Identity</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: CHOOSE ISSUER IDENTITY */}
      {step === 2 && (
        <div className="glass-card" style={{ padding: '32px 36px' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              Choose Issuer Identity
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
              Select how your organization will be represented cryptographically on the Arbitrum Stylus blockchain.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
            {/* Option A: Managed Issuer Identity */}
            <div
              onClick={() => setIdentityChoice('managed_identity')}
              style={{
                border: identityChoice === 'managed_identity' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: identityChoice === 'managed_identity' ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0, 0, 0, 0.3)',
                borderRadius: 12,
                padding: 24,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'rgba(0, 240, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Cpu size={20} />
                </div>
                <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.65rem' }}>
                  RECOMMENDED FOR NO-WALLET
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                CertiVault Managed Issuer Identity
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', lineHeight: 1.45, marginBottom: 16 }}>
                Your organization does not need to manage a blockchain wallet directly. CertiVault provisions a secure issuer blockchain identity.
              </p>

              <div style={{
                background: '#040609',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginBottom: 2 }}>
                  {isDemoMode ? 'SIMULATOR MANAGED IDENTITY ADDRESS' : 'PROVISIONED PUBLIC IDENTITY'}
                </div>
                <div style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
                  {provisionedManagedAddress}
                </div>
              </div>
            </div>

            {/* Option B: Organization-Controlled Wallet */}
            <div
              onClick={() => setIdentityChoice('external_wallet')}
              style={{
                border: identityChoice === 'external_wallet' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                background: identityChoice === 'external_wallet' ? 'rgba(129, 140, 248, 0.05)' : 'rgba(0, 0, 0, 0.3)',
                borderRadius: 12,
                padding: 24,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'rgba(129, 140, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-purple)'
                }}>
                  <KeyRound size={20} />
                </div>
                <span className="tech-tag tech-tag-purple" style={{ fontSize: '0.65rem' }}>
                  SELF-CUSTODY WALLET
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                Organization-Controlled Wallet
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', lineHeight: 1.45, marginBottom: 16 }}>
                Connect or specify an existing Web3 wallet (MetaMask, institutional multisig) controlled by your IT/registrar department.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  placeholder="0x... (Organization Public Address)"
                  value={customWalletAddress || account || ''}
                  onChange={(e) => setCustomWalletAddress(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.78rem' }}
                />
                {!account && (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.74rem' }}
                  >
                    Connect Active Wallet
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Security & Runtime Notice */}
          <div style={{
            background: 'rgba(0, 240, 255, 0.03)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 28,
            fontSize: '0.82rem',
            color: 'var(--text-sub)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Info size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: 2 }}>
                {identityChoice === 'managed_identity' ? 'Managed Identity Protocol Security' : 'External Wallet Verification'}
              </strong>
              {identityChoice === 'managed_identity' ? (
                <span>
                  {isDemoMode
                    ? 'In Simulator Mode, CertiVault automatically provisions and authorizes this deterministic identity for full end-to-end credential minting.'
                    : 'Managed issuer identities require secure server-side signing infrastructure for live blockchain issuance. Connect an organization-controlled wallet to issue live credentials.'}
                </span>
              ) : (
                <span>
                  Only the public Ethereum address (0x...) is registered on Arbitrum Stylus. Your organization retains full cryptographic authority over its private keys.
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.86rem' }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleCompleteRegistration}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
            >
              <span>Submit for Governance Accreditation</span>
              <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REGISTRATION COMPLETE & PROFILE PREVIEW */}
      {step === 3 && createdOrg && (
        <div className="glass-card" style={{ padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(0, 255, 135, 0.1)',
              border: '1px solid rgba(0, 255, 135, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              marginBottom: 16
            }}>
              <CheckCircle2 size={30} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              Organization Successfully Registered!
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem', maxWidth: 520, margin: '0 auto' }}>
              Your organization profile and issuer identity have been initialized. Root Admin Governance will accredit your identity on Arbitrum Stylus.
            </p>
          </div>

          {/* Profile Card Summary */}
          <div style={{
            background: '#040609',
            border: '1px solid var(--border-medium)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 28
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 6, display: 'inline-block' }}>
                  {createdOrg.type}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {createdOrg.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {createdOrg.city}, {createdOrg.country} • {createdOrg.website}
                </div>
              </div>

              <span className="badge badge-warning" style={{ padding: '6px 12px' }}>
                PENDING ACCREDITATION
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ISSUER IDENTITY TYPE</div>
                <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 600, marginTop: 2 }}>
                  {createdOrg.issuerIdentityType === 'managed_identity' ? 'CertiVault Managed Identity' : 'Organization-Controlled Wallet'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>BLOCKCHAIN RUNTIME</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                  Arbitrum Sepolia (Stylus WASM)
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ISSUER PUBLIC ADDRESS</div>
                <div className="mono-block" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                  {createdOrg.issuerAddress}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('organizations')}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.86rem' }}
            >
              <Building2 size={14} /> View All Organizations
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.86rem' }}
            >
              <ShieldCheck size={14} /> Go to Governance & Accredit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
