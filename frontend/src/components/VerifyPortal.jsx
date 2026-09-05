import React, { useState } from 'react';
import { verifyCredential, getCredential, computeSha256 } from '../services/contractService';
import { IS_CONTRACT_CONFIGURED, NETWORK_CONFIG } from '../config/contracts';
import { Search, CheckCircle2, XCircle, AlertCircle, FileText, Upload, Clock, Building, ShieldCheck, Hash } from 'lucide-react';

export default function VerifyPortal() {
  const [credId, setCredId] = useState('');
  const [credHash, setCredHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileHashCalculated, setFileHashCalculated] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const hash = computeSha256(bytes);
      setCredHash(hash);
      setFileHashCalculated(file.name);
    } catch (err) {
      setError('Failed to compute cryptographic hash from file.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!IS_CONTRACT_CONFIGURED) {
      setError('Contract address not configured yet. Layer C deployment is pending.');
      return;
    }

    if (!credId || !credHash) {
      setError('Please provide both Credential ID and Credential Hash.');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await verifyCredential(credId.trim(), credHash.trim());
      let fullCred = null;
      if (verifyRes.statusCode === 0 || verifyRes.statusCode === 5) {
        fullCred = await getCredential(credId.trim());
      }

      setResult({
        ...verifyRes,
        details: fullCred,
      });
    } catch (err) {
      setError(err.reason || err.message || 'Verification failed against Arbitrum Sepolia.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (code) => {
    switch (code) {
      case 0:
        return {
          title: 'VERIFIED AUTHENTIC',
          color: 'var(--success)',
          bg: 'rgba(52, 211, 153, 0.1)',
          border: 'rgba(52, 211, 153, 0.3)',
          icon: <CheckCircle2 size={36} color="var(--success)" />,
          description: 'This credential is authentic, cryptographically intact, and issued by an authorized university on Arbitrum Stylus.',
        };
      case 1:
        return {
          title: 'CREDENTIAL NOT FOUND',
          color: 'var(--danger)',
          bg: 'rgba(248, 113, 113, 0.1)',
          border: 'rgba(248, 113, 113, 0.3)',
          icon: <XCircle size={36} color="var(--danger)" />,
          description: 'The specified Credential ID does not exist in the CertiVault registry.',
        };
      case 2:
        return {
          title: 'ISSUER NOT REGISTERED',
          color: 'var(--warning)',
          bg: 'rgba(251, 191, 36, 0.1)',
          border: 'rgba(251, 191, 36, 0.3)',
          icon: <AlertCircle size={36} color="var(--warning)" />,
          description: 'The issuing entity is not recognized in the CertiVault governance registry.',
        };
      case 3:
        return {
          title: 'ISSUER SUSPENDED',
          color: 'var(--warning)',
          bg: 'rgba(251, 191, 36, 0.1)',
          border: 'rgba(251, 191, 36, 0.3)',
          icon: <AlertCircle size={36} color="var(--warning)" />,
          description: 'The issuing institution has been suspended by governance. Verification is flagged.',
        };
      case 4:
        return {
          title: 'HASH MISMATCH (TAMPERED)',
          color: 'var(--danger)',
          bg: 'rgba(248, 113, 113, 0.1)',
          border: 'rgba(248, 113, 113, 0.3)',
          icon: <XCircle size={36} color="var(--danger)" />,
          description: 'The provided document hash does not match the on-chain cryptographic commitment.',
        };
      case 5:
        return {
          title: 'CREDENTIAL REVOKED',
          color: 'var(--danger)',
          bg: 'rgba(248, 113, 113, 0.1)',
          border: 'rgba(248, 113, 113, 0.3)',
          icon: <XCircle size={36} color="var(--danger)" />,
          description: 'This credential was officially revoked by the issuing institution.',
        };
      default:
        return {
          title: 'UNKNOWN STATUS',
          color: 'var(--text-sub)',
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          icon: <AlertCircle size={36} color="var(--text-sub)" />,
          description: 'Unexpected response code from smart contract.',
        };
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div className="badge badge-info" style={{ marginBottom: 12 }}>
          Zero-Gas Public Verification
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 12 }}>
          Instant Credential Verification
        </h1>
        <p style={{ color: 'var(--text-sub)', maxWidth: 540, margin: '0 auto', fontSize: '1rem' }}>
          Employers and organizations can verify degrees, certificates, internships, and achievement credentials directly on Arbitrum Stylus without connecting a wallet.
        </p>
      </div>

      {/* Verification Form Card */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 28 }}>
        <form onSubmit={handleVerify}>
          <div className="input-group">
            <label className="input-label">
              <Hash size={16} /> Credential ID (bytes32 hex)
            </label>
            <input
              type="text"
              placeholder="0x1234... or 64-character hex"
              value={credId}
              onChange={(e) => setCredId(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} /> Document / Certificate Hash (bytes32 hex)
              </span>
              {fileHashCalculated && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                  Computed from {fileHashCalculated}
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="0xabcd... SHA-256 or Keccak-256 hash"
              value={credHash}
              onChange={(e) => setCredHash(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* File Upload to Auto-Hash */}
          <div style={{
            border: '1px dashed var(--border-glass)',
            borderRadius: 12,
            padding: 18,
            textAlign: 'center',
            marginBottom: 24,
            background: 'rgba(255,255,255,0.01)'
          }}>
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Upload size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                Upload Certificate PDF / Document to auto-compute hash
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Processed 100% client-side in your browser for zero-knowledge privacy
              </span>
              <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '1rem' }}
          >
            <Search size={18} />
            {loading ? 'Querying Arbitrum Sepolia Stylus Precompile...' : 'Verify Credential on Arbitrum'}
          </button>
        </form>
      </div>

      {/* Error Output */}
      {error && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.1)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: 12,
          padding: 18,
          marginBottom: 28,
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="glass-card" style={{
          padding: 32,
          background: getStatusDisplay(result.statusCode).bg,
          border: `1px solid ${getStatusDisplay(result.statusCode).border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
            {getStatusDisplay(result.statusCode).icon}
            <div>
              <div style={{
                color: getStatusDisplay(result.statusCode).color,
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                letterSpacing: '0.5px'
              }}>
                {getStatusDisplay(result.statusCode).title}
              </div>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: 4 }}>
                {getStatusDisplay(result.statusCode).description}
              </p>
            </div>
          </div>

          {/* Detailed Metadata if Found */}
          {result.details && (
            <div style={{
              borderTop: '1px solid var(--border-glass)',
              paddingTop: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building size={14} /> ISSUING INSTITUTION
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                  {result.details.issuer}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} /> ISSUED TIMESTAMP
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {result.details.issuedAt > 0
                    ? new Date(result.details.issuedAt * 1000).toLocaleString()
                    : 'N/A'}
                </div>
              </div>

              {result.details.revocationAt > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} /> REVOCATION TIMESTAMP
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>
                    {new Date(result.details.revocationAt * 1000).toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} /> HOLDER COMMITMENT (ZKP-Ready)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-sub)', wordBreak: 'break-all' }}>
                  {result.details.holderCommitment}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
