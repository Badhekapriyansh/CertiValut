import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import {
  registerIssuer,
  suspendIssuer,
  unsuspendIssuer,
  computeKeccak256
} from '../services/contractService';
import {
  Shield,
  UserPlus,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Cpu,
  KeyRound,
  Sparkles,
  ExternalLink,
  Clock,
  Check
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function AdminView() {
  const { isDemoMode, showToast, issuers, organizations, accreditOrganization, suspendOrganization, setActiveTab } = useApp();
  const { account, signer, isCorrectNetwork, connectWallet } = useWallet();

  const [adminAddress] = useState('0x15bC467f505fCc71439B8c708FE168cA85AfC71F');

  // Governance Onboarding: Initial question choice (null, 'yes', 'no')
  const [hasWalletChoice, setHasWalletChoice] = useState('yes'); // 'yes' or 'no'

  // Register Form
  const [newIssuerAddr, setNewIssuerAddr] = useState('');
  const [issuerOrgName, setIssuerOrgName] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);
  const [regError, setRegError] = useState(null);

  // Suspend Form
  const [targetIssuerAddr, setTargetIssuerAddr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleRegisterIssuer = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const targetAddr = newIssuerAddr.trim() || account;
    if (!targetAddr || !targetAddr.startsWith('0x') || targetAddr.length !== 42) {
      setRegError('Please provide a valid 42-character Ethereum public address (0x...).');
      return;
    }
    if (!issuerOrgName.trim()) {
      setRegError('Please provide the official organization name.');
      return;
    }

    setRegLoading(true);
    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 800));
        accreditOrganization(targetAddr);
        setRegSuccess(`Institution "${issuerOrgName}" successfully accredited in governance registry.`);
        showToast(`Organization "${issuerOrgName}" accredited on Arbitrum Stylus`, 'success');
        setNewIssuerAddr('');
        setIssuerOrgName('');
      } else {
        if (!signer || !isCorrectNetwork) {
          throw new Error('Please connect your admin wallet on Arbitrum Sepolia.');
        }
        const nameHash = computeKeccak256(issuerOrgName.trim());
        const receipt = await registerIssuer(signer, targetAddr, nameHash);
        accreditOrganization(targetAddr);
        setRegSuccess(`Organization / Institution registered successfully! Tx: ${receipt.hash}`);
        showToast('Organization accredited on Arbitrum Stylus ledger', 'success');
        setNewIssuerAddr('');
        setIssuerOrgName('');
      }
    } catch (err) {
      setRegError(err.reason || err.message || 'Accreditation failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleAccreditOrgRow = async (org) => {
    try {
      if (isDemoMode) {
        accreditOrganization(org.id);
        showToast(`Accredited ${org.name} successfully`, 'success');
      } else {
        if (!signer || !isCorrectNetwork) {
          throw new Error('Please connect your admin wallet on Arbitrum Sepolia.');
        }
        const nameHash = computeKeccak256(org.name.trim());
        const receipt = await registerIssuer(signer, org.issuerAddress, nameHash);
        accreditOrganization(org.id);
        showToast(`Accredited ${org.name} on-chain! Tx: ${receipt.hash.slice(0, 10)}...`, 'success');
      }
    } catch (err) {
      showToast(err.reason || err.message || 'Accreditation failed', 'error');
    }
  };

  const handleSuspend = async (isSuspending) => {
    setActionError(null);
    setActionSuccess(null);

    if (!targetIssuerAddr) {
      setActionError('Please select a target organization.');
      return;
    }

    setActionLoading(true);
    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 700));
        if (isSuspending) {
          suspendOrganization(targetIssuerAddr.trim());
        } else {
          accreditOrganization(targetIssuerAddr.trim());
        }
        setActionSuccess(`Issuer status updated to ${isSuspending ? 'Suspended' : 'Active'}.`);
        showToast('Issuer status updated', 'info');
        setTargetIssuerAddr('');
      } else {
        if (!signer || !isCorrectNetwork) {
          throw new Error('Please connect your admin wallet on Arbitrum Sepolia.');
        }
        const receipt = isSuspending
          ? await suspendIssuer(signer, targetIssuerAddr.trim())
          : await unsuspendIssuer(signer, targetIssuerAddr.trim());
        if (isSuspending) {
          suspendOrganization(targetIssuerAddr.trim());
        } else {
          accreditOrganization(targetIssuerAddr.trim());
        }
        setActionSuccess(`Issuer status updated! Tx: ${receipt.hash}`);
        showToast('Issuer status updated on-chain', 'info');
        setTargetIssuerAddr('');
      }
    } catch (err) {
      setActionError(err.reason || err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span className="tech-tag tech-tag-purple" style={{ fontSize: '0.68rem' }}>
            <ShieldCheck size={11} /> PROTOCOL TRUST ROOT
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
          Governance & Accreditation
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
          Accredit authorized organizations and institutions, provision managed issuer identities, and enforce audit suspensions on Arbitrum Stylus.
        </p>
      </div>

      {/* Protocol Status Summary */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
            PROTOCOL ROOT ADMIN (GOVERNANCE TRUST ROOT)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--primary)' }}>
            {adminAddress}
          </div>
        </div>

        <div>
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> Stylus Protocol Operational
          </span>
        </div>
      </div>

      {/* Section 1: Governance Onboarding Questionnaire */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.65rem', marginBottom: 6 }}>
            STEP 1: ONBOARDING QUALIFICATION
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            Does this organization already have a blockchain wallet?
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.86rem', marginTop: 4 }}>
            CertiVault supports organizations with existing Web3 custody as well as organizations that prefer managed identity abstraction.
          </p>
        </div>

        {/* Binary Selectable Option Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* Option YES */}
          <div
            onClick={() => setHasWalletChoice('yes')}
            style={{
              border: hasWalletChoice === 'yes' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
              background: hasWalletChoice === 'yes' ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0, 0, 0, 0.3)',
              borderRadius: 12,
              padding: 20,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: hasWalletChoice === 'yes' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <Wallet size={18} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  Yes, we have a wallet
                </h3>
                {hasWalletChoice === 'yes' && <Check size={16} color="var(--primary)" />}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: 4, lineHeight: 1.4 }}>
                Use an organization-controlled blockchain wallet (MetaMask, institutional multisig) as the issuer identity.
              </p>
            </div>
          </div>

          {/* Option NO */}
          <div
            onClick={() => setHasWalletChoice('no')}
            style={{
              border: hasWalletChoice === 'no' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
              background: hasWalletChoice === 'no' ? 'rgba(129, 140, 248, 0.05)' : 'rgba(0, 0, 0, 0.3)',
              borderRadius: 12,
              padding: 20,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: hasWalletChoice === 'no' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
              flexShrink: 0
            }}>
              <Cpu size={18} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  No, we don't have a wallet
                </h3>
                {hasWalletChoice === 'no' && <Check size={16} color="var(--accent-purple)" />}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: 4, lineHeight: 1.4 }}>
                Register your organization and use a CertiVault Managed Issuer Identity without managing keys directly.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Branch Content */}
        {hasWalletChoice === 'yes' ? (
          /* YES: Existing Wallet Flow */
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-medium)',
            borderRadius: 10,
            padding: 24
          }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                Organization Issuer Wallet
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                Use an organization-controlled blockchain wallet as the issuer identity.
              </p>
            </div>

            <form onSubmit={handleRegisterIssuer}>
              <div className="input-group">
                <label className="input-label" style={{ justifyContent: 'space-between' }}>
                  <span>Issuer Public Address (0x...)</span>
                  {account && (
                    <span
                      onClick={() => setNewIssuerAddr(account)}
                      style={{ color: 'var(--primary)', cursor: 'pointer', textTransform: 'none', fontSize: '0.72rem' }}
                    >
                      Use connected: {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newIssuerAddr}
                    onChange={(e) => setNewIssuerAddr(e.target.value)}
                    className="input-field"
                    required
                  />
                  {!account && (
                    <button
                      type="button"
                      onClick={connectWallet}
                      className="btn btn-secondary"
                      style={{ padding: '0 16px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      <Wallet size={14} /> Connect Wallet
                    </button>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Organization / Institution Official Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University or Offchain Labs Academy"
                  value={issuerOrgName}
                  onChange={(e) => setIssuerOrgName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <UserPlus size={15} />
                <span>{regLoading ? 'Accrediting on Stylus...' : 'Accredit Organization'}</span>
              </button>
            </form>

            {regSuccess && (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.84rem' }}>
                {regSuccess}
              </div>
            )}
            {regError && (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', fontSize: '0.84rem' }}>
                {regError}
              </div>
            )}
          </div>
        ) : (
          /* NO: No-Wallet Managed Identity Flow */
          <div style={{
            background: 'rgba(129, 140, 248, 0.04)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
            borderRadius: 10,
            padding: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                CertiVault Managed Issuer Identity
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', maxWidth: 540, lineHeight: 1.45 }}>
                No problem. Register your organization and use a CertiVault Managed Issuer Identity. Organizations do not need prior Web3 experience or key management to join.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('org-register')}
              className="btn btn-primary"
              style={{ padding: '12px 22px', fontSize: '0.88rem' }}
            >
              <Building2 size={16} />
              <span>Register Organization</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Section 2: Onboarded Organizations Directory for Governance */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="tech-tag tech-tag-purple" style={{ fontSize: '0.65rem', marginBottom: 4 }}>
              REGISTRY AUDIT
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              Onboarded Organizations & Accreditation Roster
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('organizations')}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            Full Directory →
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Type</th>
                <th>Identity Type</th>
                <th>Issuer Public Address</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Governance Action</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{org.logo || '🏛️'}</span>
                      <span>{org.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                      {org.type}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                      {org.issuerIdentityType === 'managed_identity' ? 'Managed Identity' : 'Organization Wallet'}
                    </span>
                  </td>
                  <td>
                    <div className="mono-block" style={{ fontSize: '0.72rem', padding: '4px 8px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {org.issuerAddress}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      org.status === 'ACTIVE'
                        ? 'badge-success'
                        : org.status === 'SUSPENDED'
                          ? 'badge-danger'
                          : 'badge-warning'
                    }`} style={{ fontSize: '0.68rem' }}>
                      {org.status === 'ACTIVE' ? 'ACTIVE' : org.status === 'SUSPENDED' ? 'SUSPENDED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {org.status === 'PENDING_ACCREDITATION' ? (
                      <button
                        onClick={() => handleAccreditOrgRow(org)}
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                      >
                        <CheckCircle2 size={13} /> Accredit
                      </button>
                    ) : org.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          setTargetIssuerAddr(org.issuerAddress);
                          handleSuspend(true);
                        }}
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                      >
                        <UserX size={13} /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTargetIssuerAddr(org.issuerAddress);
                          handleSuspend(false);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                      >
                        <UserCheck size={13} /> Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Direct Issuer Status Control (Quick Suspend / Reactivate) */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
          Quick Issuer Status Control
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: 18 }}>
          Temporarily freeze or restore an accredited organization's credential issuing privileges on Arbitrum Stylus.
        </p>

        <div className="input-group">
          <label className="input-label">Select Accredited Organization / Institution</label>
          <select
            onChange={(e) => setTargetIssuerAddr(e.target.value)}
            value={targetIssuerAddr}
            className="input-field"
          >
            <option value="">-- Choose Organization --</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.issuerAddress}>
                {org.name} ({org.issuerAddress.slice(0, 8)}...) — [{org.status}]
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 360 }}>
          <button
            onClick={() => handleSuspend(true)}
            disabled={actionLoading}
            className="btn btn-danger"
            style={{ padding: '10px' }}
          >
            <UserX size={14} /> Suspend
          </button>
          <button
            onClick={() => handleSuspend(false)}
            disabled={actionLoading}
            className="btn btn-secondary"
            style={{ padding: '10px' }}
          >
            <UserCheck size={14} /> Reactivate
          </button>
        </div>

        {actionSuccess && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.84rem' }}>
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', fontSize: '0.84rem' }}>
            {actionError}
          </div>
        )}
      </div>
    </div>
  );
}
