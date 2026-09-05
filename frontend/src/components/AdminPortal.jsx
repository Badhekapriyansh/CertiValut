import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  getAdmin,
  getPendingAdmin,
  registerIssuer,
  suspendIssuer,
  unsuspendIssuer,
  proposeAdmin,
  acceptAdmin,
  cancelAdminProposal,
  computeKeccak256
} from '../services/contractService';
import { IS_CONTRACT_CONFIGURED } from '../config/contracts';
import { Shield, UserPlus, UserX, UserCheck, RefreshCw, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export default function AdminPortal() {
  const { account, signer, isCorrectNetwork, connectWallet } = useWallet();

  const [adminAddress, setAdminAddress] = useState('');
  const [pendingAdminAddress, setPendingAdminAddress] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Register Issuer Form
  const [newIssuerAddr, setNewIssuerAddr] = useState('');
  const [issuerOrgName, setIssuerOrgName] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);
  const [regError, setRegError] = useState(null);

  // Suspend/Unsuspend Form
  const [targetIssuerAddr, setTargetIssuerAddr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Governance Admin Transfer
  const [newAdminCandidate, setNewAdminCandidate] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(null);
  const [transferError, setTransferError] = useState(null);

  const fetchAdminInfo = async () => {
    if (!IS_CONTRACT_CONFIGURED) return;
    setLoadingInfo(true);
    try {
      const current = await getAdmin();
      const pending = await getPendingAdmin();
      setAdminAddress(current);
      setPendingAdminAddress(pending);
    } catch (err) {
      console.error('Failed to fetch admin state:', err);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const handleRegisterIssuer = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!signer || !isCorrectNetwork) {
      setRegError('Please connect wallet on Arbitrum Sepolia.');
      return;
    }

    setRegLoading(true);
    try {
      const nameHash = computeKeccak256(issuerOrgName.trim());
      const receipt = await registerIssuer(signer, newIssuerAddr.trim(), nameHash);
      setRegSuccess(`University registered successfully! Tx: ${receipt.hash}`);
      setNewIssuerAddr('');
      setIssuerOrgName('');
    } catch (err) {
      setRegError(err.reason || err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleSuspend = async (isSuspending) => {
    setActionError(null);
    setActionSuccess(null);

    if (!signer || !isCorrectNetwork) {
      setActionError('Please connect wallet on Arbitrum Sepolia.');
      return;
    }
    if (!targetIssuerAddr) {
      setActionError('Please provide target university address.');
      return;
    }

    setActionLoading(true);
    try {
      const receipt = isSuspending
        ? await suspendIssuer(signer, targetIssuerAddr.trim())
        : await unsuspendIssuer(signer, targetIssuerAddr.trim());
      setActionSuccess(`Issuer status updated successfully! Tx: ${receipt.hash}`);
      setTargetIssuerAddr('');
    } catch (err) {
      setActionError(err.reason || err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProposeAdmin = async (e) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    if (!signer || !isCorrectNetwork) {
      setTransferError('Please connect wallet on Arbitrum Sepolia.');
      return;
    }

    setTransferLoading(true);
    try {
      const receipt = await proposeAdmin(signer, newAdminCandidate.trim());
      setTransferSuccess(`Admin proposal initiated! Tx: ${receipt.hash}`);
      setNewAdminCandidate('');
      fetchAdminInfo();
    } catch (err) {
      setTransferError(err.reason || err.message || 'Proposal failed.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleAcceptAdmin = async () => {
    setTransferError(null);
    setTransferSuccess(null);

    if (!signer || !isCorrectNetwork) {
      setTransferError('Please connect wallet on Arbitrum Sepolia.');
      return;
    }

    setTransferLoading(true);
    try {
      const receipt = await acceptAdmin(signer);
      setTransferSuccess(`Admin role accepted successfully! Tx: ${receipt.hash}`);
      fetchAdminInfo();
    } catch (err) {
      setTransferError(err.reason || err.message || 'Acceptance failed.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCancelProposal = async () => {
    setTransferError(null);
    setTransferSuccess(null);

    if (!signer || !isCorrectNetwork) {
      setTransferError('Please connect wallet on Arbitrum Sepolia.');
      return;
    }

    setTransferLoading(true);
    try {
      const receipt = await cancelAdminProposal(signer);
      setTransferSuccess(`Proposal cancelled successfully! Tx: ${receipt.hash}`);
      fetchAdminInfo();
    } catch (err) {
      setTransferError(err.reason || err.message || 'Cancellation failed.');
    } finally {
      setTransferLoading(false);
    }
  };

  if (!account) {
    return (
      <div style={{ maxWidth: 640, margin: '60px auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40 }}>
          <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Governance Administration</h2>
          <p style={{ color: 'var(--text-sub)', marginBottom: 24 }}>
            Connect the authorized protocol admin wallet to manage trusted institutions and governance keys.
          </p>
          <button onClick={connectWallet} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
            Connect Admin Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Protocol Governance & Administration</h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem' }}>
          Manage trusted universities, accreditation statuses, and execute secure two-step admin transfers.
        </p>
      </div>

      {/* Admin Status Card */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>CURRENT PROTOCOL ADMIN</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
            {adminAddress || (IS_CONTRACT_CONFIGURED ? 'Loading...' : 'Pending Deployment')}
          </div>
        </div>

        {pendingAdminAddress && pendingAdminAddress !== '0x0000000000000000000000000000000000000000' && (
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: 4 }}>PENDING ADMIN CANDIDATE</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--warning)', wordBreak: 'break-all' }}>
              {pendingAdminAddress}
            </div>
          </div>
        )}

        <button onClick={fetchAdminInfo} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={loadingInfo ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Administration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>
        {/* Register Issuer */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <UserPlus size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Register University Issuer</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: 16 }}>
            Accredits an academic institution to issue verifiable on-chain diplomas and transcripts.
          </p>
          <form onSubmit={handleRegisterIssuer}>
            <div className="input-group">
              <label className="input-label">University Public Address (0x...)</label>
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
              <label className="input-label">Institution Name</label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
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
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              {regLoading ? 'Registering on Arbitrum Stylus...' : 'Accredit Institution'}
            </button>
          </form>

          {regSuccess && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6 }} /> {regSuccess}
            </div>
          )}
          {regError && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(248, 113, 113, 0.1)', color: 'var(--danger)', fontSize: '0.85rem' }}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: 6 }} /> {regError}
            </div>
          )}
        </div>

        {/* Suspend / Unsuspend */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <UserX size={22} color="var(--warning)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Issuer Status Control</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: 16 }}>
            Temporarily freeze or restore an institution's issuing privileges in case of audit or security review.
          </p>
          <div className="input-group">
            <label className="input-label">Target University Address (0x...)</label>
            <input
              type="text"
              placeholder="0x..."
              value={targetIssuerAddr}
              onChange={(e) => setTargetIssuerAddr(e.target.value)}
              className="input-field"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => handleSuspend(true)}
              disabled={actionLoading}
              className="btn btn-danger"
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              <UserX size={16} /> Suspend
            </button>
            <button
              onClick={() => handleSuspend(false)}
              disabled={actionLoading}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              <UserCheck size={16} /> Unsuspend
            </button>
          </div>

          {actionSuccess && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6 }} /> {actionSuccess}
            </div>
          )}
          {actionError && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(248, 113, 113, 0.1)', color: 'var(--danger)', fontSize: '0.85rem' }}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: 6 }} /> {actionError}
            </div>
          )}
        </div>

        {/* Two-Step Admin Transfer */}
        <div className="glass-card" style={{ padding: 28, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <KeyRound size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Two-Step Admin Transfer</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: 20 }}>
            Safeguards protocol ownership by requiring a proposal followed by explicit cryptographic claim by the nominee.
          </p>

          <form onSubmit={handleProposeAdmin} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Nominate New Admin Address (0x...)"
              value={newAdminCandidate}
              onChange={(e) => setNewAdminCandidate(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" disabled={transferLoading} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              Propose Nominee
            </button>
            <button type="button" onClick={handleCancelProposal} disabled={transferLoading} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
              Cancel Active Proposal
            </button>
          </form>

          {pendingAdminAddress && account?.toLowerCase() === pendingAdminAddress?.toLowerCase() && (
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <div>
                <strong>You are the nominated Admin!</strong> Click below to accept and claim ownership.
              </div>
              <button onClick={handleAcceptAdmin} disabled={transferLoading} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                Accept Admin Role
              </button>
            </div>
          )}

          {transferSuccess && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6 }} /> {transferSuccess}
            </div>
          )}
          {transferError && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(248, 113, 113, 0.1)', color: 'var(--danger)', fontSize: '0.85rem' }}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: 6 }} /> {transferError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
