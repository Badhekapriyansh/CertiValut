import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import { revokeCredential } from '../services/contractService';
import { revokeMockCredential } from '../services/mockDataService';
import { IS_CONTRACT_CONFIGURED } from '../config/contracts';
import {
  Ban,
  AlertTriangle,
  CheckCircle2,
  Hash,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function RevokeView() {
  const { isDemoMode, credentials, refreshData, showToast } = useApp();
  const { account, signer, isCorrectNetwork } = useWallet();

  const [targetCredId, setTargetCredId] = useState('');
  const [revocationReason, setRevocationReason] = useState('Administrative Reissuance');
  const [confirmedRisk, setConfirmedRisk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const activeCredentials = credentials.filter((c) => c.status === 1);

  const handleExecuteRevoke = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!targetCredId) {
      setError('Please select or provide a Credential ID to revoke.');
      return;
    }

    if (!confirmedRisk) {
      setError('Please acknowledge the confirmation checkbox.');
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 800));
        revokeMockCredential(targetCredId.trim(), revocationReason);
        refreshData();
        setSuccessMsg(`Credential ${targetCredId.slice(0, 10)}... has been permanently revoked.`);
        showToast('Credential revoked successfully', 'info');
        setTargetCredId('');
        setConfirmedRisk(false);
      } else {
        if (!signer || !isCorrectNetwork) {
          throw new Error('Please connect your authorized issuer wallet on Arbitrum Sepolia.');
        }
        if (!IS_CONTRACT_CONFIGURED) {
          throw new Error('Contract address not configured in .env. Switch to Demo Mode in Settings to test.');
        }

        const receipt = await revokeCredential(signer, targetCredId.trim());
        revokeMockCredential(targetCredId.trim(), revocationReason);
        refreshData();
        setSuccessMsg(`Revocation confirmed on Arbitrum Sepolia in block ${receipt.blockNumber}!`);
        showToast('Revocation confirmed on-chain', 'info');
        setTargetCredId('');
        setConfirmedRisk(false);
      }
    } catch (err) {
      setError(err.reason || err.message || 'Revocation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span className="tech-tag tech-tag-danger" style={{ fontSize: '0.68rem' }}>
            <ShieldAlert size={11} /> ATTESTATION INVALIDATION
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
          Revoke Academic Credential
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
          Permanently invalidate an issued diploma or degree on Arbitrum Stylus registry.
        </p>
      </div>

      {/* Revoke Form Card */}
      <div className="glass-card" style={{ padding: 32 }}>
        <form onSubmit={handleExecuteRevoke}>
          {activeCredentials.length > 0 && (
            <div className="input-group">
              <label className="input-label">Select Active Credential</label>
              <select
                onChange={(e) => setTargetCredId(e.target.value)}
                value={targetCredId}
                className="input-field"
              >
                <option value="">-- Choose from active credentials --</option>
                {activeCredentials.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.studentName} — {c.degree} ({c.institution.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Credential ID (Storage Key)</label>
            <input
              type="text"
              placeholder="e.g. 0x8f14b62d3a985e78326a0b47124976cf0e817926b485671d15c1e289bf44901a"
              value={targetCredId}
              onChange={(e) => setTargetCredId(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Official Revocation Reason</label>
            <select
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              className="input-field"
            >
              <option value="Administrative Reissuance">Administrative Reissuance (Updated Curriculum / Grade Correction)</option>
              <option value="Academic Integrity Audit">Academic Integrity Audit / Plagiarism Determination</option>
              <option value="Institutional Disciplinary Action">Institutional Disciplinary Action</option>
              <option value="Erroneous Minting">Erroneous Minting (Clerical Data Entry Error)</option>
            </select>
          </div>

          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: '0.84rem',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <AlertTriangle size={18} />
            <span>Permanent action: Future public verification checks will return a Revoked status.</span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 24, fontSize: '0.86rem', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={confirmedRisk}
              onChange={(e) => setConfirmedRisk(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--danger)' }}
            />
            <span>I confirm that I am authorized to revoke this academic record on Arbitrum.</span>
          </label>

          <button
            type="submit"
            disabled={loading || !confirmedRisk}
            className="btn btn-danger"
            style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
          >
            <Ban size={15} />
            <span>{loading ? 'Submitting Revocation...' : 'Permanently Revoke Credential'}</span>
          </button>
        </form>

        {successMsg && (
          <div style={{ marginTop: 18, padding: 14, borderRadius: 8, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 18, padding: 14, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
