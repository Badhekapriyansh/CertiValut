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
  Building,
  ShieldCheck
} from 'lucide-react';

export default function AdminView() {
  const { isDemoMode, showToast, issuers } = useApp();
  const { account, signer, isCorrectNetwork } = useWallet();

  const [adminAddress] = useState('0x15bC467f505fCc71439B8c708FE168cA85AfC71F');

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

    setRegLoading(true);
    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 800));
        setRegSuccess(`Institution "${issuerOrgName}" successfully accredited in governance registry.`);
        showToast(`Organization ${issuerOrgName} accredited`, 'success');
        setNewIssuerAddr('');
        setIssuerOrgName('');
      } else {
        if (!signer || !isCorrectNetwork) {
          throw new Error('Please connect your admin wallet on Arbitrum Sepolia.');
        }
        const nameHash = computeKeccak256(issuerOrgName.trim());
        const receipt = await registerIssuer(signer, newIssuerAddr.trim(), nameHash);
        setRegSuccess(`Organization / Institution registered successfully! Tx: ${receipt.hash}`);
        showToast('Organization registered on-chain', 'success');
        setNewIssuerAddr('');
        setIssuerOrgName('');
      }
    } catch (err) {
      setRegError(err.reason || err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
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
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
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
          Accredit authorized organizations and institutions, enforce audit suspensions, and manage Stylus contract trust roots.
        </p>
      </div>

      {/* Protocol Status Summary */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 2 }}>
            PROTOCOL ROOT ADMIN
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

      {/* Grid: Accredit & Status Control */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Accredit Institution */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            Accredit Organization / Institution
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: 16 }}>
            Authorize an organizational public key to issue cryptographic verifiable credentials.
          </p>

          <form onSubmit={handleRegisterIssuer}>
            <div className="input-group">
              <label className="input-label">Issuer Public Address (0x...)</label>
              <input
                type="text"
                placeholder="0x..."
                value={newIssuerAddr}
                onChange={(e) => setNewIssuerAddr(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Organization / Institution Official Name</label>
              <input
                type="text"
                placeholder="e.g. Stanford University or Linux Foundation"
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
              style={{ width: '100%', padding: '10px' }}
            >
              <UserPlus size={15} />
              <span>{regLoading ? 'Accrediting...' : 'Accredit Organization'}</span>
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

        {/* Suspend / Reactivate */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            Issuer Status Control
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: 16 }}>
            Temporarily freeze or restore an organization's credential issuing privileges.
          </p>

          <div className="input-group">
            <label className="input-label">Select Accredited Organization / Institution</label>
            <select
              onChange={(e) => setTargetIssuerAddr(e.target.value)}
              value={targetIssuerAddr}
              className="input-field"
            >
              <option value="">-- Choose Organization --</option>
              {issuers.map((iss) => (
                <option key={iss.address} value={iss.address}>
                  {iss.name} ({iss.address.slice(0, 8)}...)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
    </div>
  );
}
