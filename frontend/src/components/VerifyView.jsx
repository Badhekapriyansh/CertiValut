import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { verifyCredential, getCredential, computeSha256 } from '../services/contractService';
import { verifyMockCredential } from '../services/mockDataService';
import { IS_CONTRACT_CONFIGURED, NETWORK_CONFIG } from '../config/contracts';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Upload,
  Clock,
  Building,
  ShieldCheck,
  Hash,
  Sparkles,
  ExternalLink,
  Lock,
  Cpu,
  ChevronDown,
  ChevronUp,
  Award,
  Copy,
  Printer
} from 'lucide-react';

export default function VerifyView() {
  const { isDemoMode, quickVerifyPreset, setQuickVerifyPreset, triggerConfetti, showToast } = useApp();

  const [credId, setCredId] = useState('');
  const [credHash, setCredHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileHashCalculated, setFileHashCalculated] = useState('');
  const [showTechnicalDrawer, setShowTechnicalDrawer] = useState(false);
  const resultRef = useRef(null);

  // Auto-fill if redirected with preset from Home or Floating Assistant
  useEffect(() => {
    if (quickVerifyPreset && quickVerifyPreset.id) {
      const targetId = String(quickVerifyPreset.id);
      const targetHash = quickVerifyPreset.credentialHash ? String(quickVerifyPreset.credentialHash) : '';
      setCredId(targetId);
      setCredHash(targetHash);
      handleExecuteVerification(targetId, targetHash);
      setQuickVerifyPreset(null);
    }
  }, [quickVerifyPreset]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const hash = computeSha256(bytes);
      setCredHash(hash);
      setFileHashCalculated(file.name);
      showToast(`Computed SHA-256 fingerprint from ${file.name}`, 'info');
    } catch (err) {
      setError('Failed to compute cryptographic hash from file.');
    }
  };

  const handleExecuteVerification = async (targetId, targetHash) => {
    setError(null);
    setResult(null);

    const rawId = targetId !== undefined ? targetId : credId;
    const rawHash = targetHash !== undefined ? targetHash : credHash;

    const idToQuery = rawId ? String(rawId).trim() : '';
    const hashToQuery = rawHash ? String(rawHash).trim() : '';

    if (!idToQuery) {
      setError('Please provide a Credential ID or Verification Code.');
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        // Fast instant simulator
        await new Promise((r) => setTimeout(r, 400));
        const res = verifyMockCredential(idToQuery, hashToQuery);
        setResult(res);
        if (res && res.statusCode === 0) {
          triggerConfetti();
        }
        setTimeout(() => {
          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 60);
      } else {
        // Live Arbitrum Sepolia RPC
        if (!IS_CONTRACT_CONFIGURED) {
          throw new Error('Contract address not set in .env. Switch to Demo Mode above to test.');
        }
        const verifyRes = await verifyCredential(idToQuery, hashToQuery || '0x0000000000000000000000000000000000000000000000000000000000000000');
        let fullCred = null;
        if (verifyRes && (verifyRes.statusCode === 0 || verifyRes.statusCode === 5)) {
          fullCred = await getCredential(idToQuery);
        }
        setResult({
          ...verifyRes,
          details: fullCred,
        });
        if (verifyRes && verifyRes.statusCode === 0) {
          triggerConfetti();
        }
        setTimeout(() => {
          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 60);
      }
    } catch (err) {
      setError(err.reason || err.message || 'Verification query failed against Arbitrum Stylus.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (code) => {
    switch (code) {
      case 0:
        return {
          title: 'OFFICIALLY VERIFIED & AUTHENTIC',
          badgeText: 'VERIFIED ON-CHAIN',
          badgeClass: 'tech-tag-success',
          color: 'var(--success)',
          bg: 'rgba(0, 255, 135, 0.05)',
          border: 'rgba(0, 255, 135, 0.3)',
          icon: <CheckCircle2 size={44} color="var(--success)" />,
          description: 'This academic credential has been cryptographically validated against the Arbitrum Stylus immutable ledger. The issuing institution is in good standing and the content is unaltered.',
        };
      case 1:
        return {
          title: 'CREDENTIAL RECORD NOT FOUND',
          badgeText: 'NOT FOUND',
          badgeClass: 'tech-tag-danger',
          color: 'var(--danger)',
          bg: 'rgba(255, 71, 87, 0.05)',
          border: 'rgba(255, 71, 87, 0.3)',
          icon: <XCircle size={44} color="var(--danger)" />,
          description: 'The specified Credential ID does not exist in the CertiVault registry.',
        };
      case 2:
        return {
          title: 'ISSUING INSTITUTION NOT ACCREDITED',
          badgeText: 'UNAUTHORIZED ISSUER',
          badgeClass: 'tech-tag-warning',
          color: 'var(--warning)',
          bg: 'rgba(255, 184, 0, 0.05)',
          border: 'rgba(255, 184, 0, 0.3)',
          icon: <AlertCircle size={44} color="var(--warning)" />,
          description: 'The entity that minted this record is not an accredited university in the governance trust root.',
        };
      case 3:
        return {
          title: 'ISSUING INSTITUTION SUSPENDED',
          badgeText: 'ISSUER SUSPENDED',
          badgeClass: 'tech-tag-warning',
          color: 'var(--warning)',
          bg: 'rgba(255, 184, 0, 0.05)',
          border: 'rgba(255, 184, 0, 0.3)',
          icon: <AlertCircle size={44} color="var(--warning)" />,
          description: 'The issuing university currently has its verification privileges suspended pending administrative review.',
        };
      case 4:
        return {
          title: 'CRYPTOGRAPHIC HASH MISMATCH (TAMPERED)',
          badgeText: 'ALTERATION DETECTED',
          badgeClass: 'tech-tag-danger',
          color: 'var(--danger)',
          bg: 'rgba(255, 71, 87, 0.05)',
          border: 'rgba(255, 71, 87, 0.3)',
          icon: <XCircle size={44} color="var(--danger)" />,
          description: 'The document or transcript hash provided does not match the immutable cryptographic root stored on Arbitrum Stylus.',
        };
      case 5:
        return {
          title: 'CREDENTIAL PERMANENTLY REVOKED',
          badgeText: 'REVOKED ATTESTATION',
          badgeClass: 'tech-tag-danger',
          color: 'var(--danger)',
          bg: 'rgba(255, 71, 87, 0.05)',
          border: 'rgba(255, 71, 87, 0.3)',
          icon: <AlertCircle size={44} color="var(--danger)" />,
          description: 'This credential was officially revoked by the issuing institution. It is no longer valid for professional or academic standing.',
        };
      default:
        return {
          title: 'UNKNOWN VERIFICATION STATE',
          badgeText: 'UNKNOWN',
          badgeClass: 'tech-tag',
          color: 'var(--text-sub)',
          bg: 'rgba(255, 255, 255, 0.02)',
          border: 'rgba(255, 255, 255, 0.1)',
          icon: <AlertCircle size={44} color="var(--text-sub)" />,
          description: 'Unexpected response code from the smart contract.',
        };
    }
  };

  return (
    <div style={{ maxWidth: 940, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span className="tech-tag tech-tag-success">
            <ShieldCheck size={12} /> PUBLIC EMPLOYER & INSTITUTION PORTAL
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 12 }}>
          Instant Credential Verification
        </h1>
        <p style={{ color: 'var(--text-sub)', maxWidth: 620, margin: '0 auto', fontSize: '1rem' }}>
          Verify academic diplomas, professional degrees, and transcripts on Arbitrum Stylus. Zero gas fees, zero wallet connection required.
        </p>
      </div>

      {/* Verification Query Card */}
      <div className="glass-card" style={{ padding: '32px 36px', marginBottom: 32 }}>
        <form onSubmit={(e) => { e.preventDefault(); handleExecuteVerification(); }}>
          <div className="input-group">
            <label className="input-label" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Hash size={14} /> Credential ID / Verification Identifier
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                bytes32 Hex
              </span>
            </label>
            <input
              type="text"
              placeholder="0x8f14b62d3a985e78326a0b47124976cf0e817926b485671d15c1e289bf44901a"
              value={credId}
              onChange={(e) => setCredId(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> Document Hash (Optional for strict tamper-proofing)
              </span>
              {fileHashCalculated && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                  Computed from {fileHashCalculated}
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d (SHA-256)"
              value={credHash}
              onChange={(e) => setCredHash(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Drag & Drop File Hashing Area */}
          <div style={{
            border: '1px dashed rgba(0, 240, 255, 0.25)',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center',
            marginBottom: 24,
            background: 'rgba(0, 240, 255, 0.02)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Upload size={22} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Upload Certificate PDF to verify digital fingerprint
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Computed client-side in RAM • Your document is never uploaded to any server or blockchain
              </span>
              <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', justifyContent: 'center' }}
          >
            <Search size={18} />
            {loading ? 'Evaluating Stylus ArbWasm Precompile...' : 'Verify Credential on Arbitrum'}
          </button>
        </form>
      </div>

      {/* Error Output */}
      {error && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid rgba(255, 71, 87, 0.3)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 28,
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertCircle size={22} />
          <span style={{ fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      {/* Verification Result Showcase Card */}
      {result && (
        <div ref={resultRef} className="glass-card" style={{
          padding: '36px',
          background: getStatusDisplay(result.statusCode).bg,
          border: `1px solid ${getStatusDisplay(result.statusCode).border}`,
          marginBottom: 32,
          position: 'relative'
        }}>
          {/* Top Stamp / Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: 24,
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {getStatusDisplay(result.statusCode).icon}
              <div>
                <span className={`tech-tag ${getStatusDisplay(result.statusCode).badgeClass}`} style={{ marginBottom: 6 }}>
                  {getStatusDisplay(result.statusCode).badgeText}
                </span>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: getStatusDisplay(result.statusCode).color,
                  letterSpacing: '-0.3px'
                }}>
                  {getStatusDisplay(result.statusCode).title}
                </h2>
              </div>
            </div>

            {/* Print / Export Receipt Button */}
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            >
              <Printer size={14} /> Print Verification Receipt
            </button>
          </div>

          <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 24 }}>
            {getStatusDisplay(result.statusCode).description}
          </p>

          {/* Institutional Credential Information (for Employers) */}
          {result.details && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-glass)',
              borderRadius: 14,
              padding: 24,
              marginBottom: 24
            }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                // ACADEMIC ATTESTATION RECORD
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building size={13} /> ISSUING UNIVERSITY
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                    {result.details.institution || 'Accredited Institution'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={13} /> DEGREE / QUALIFICATION
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                    {result.details.degree || 'Official Credential'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} /> ISSUED TIMESTAMP
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {result.details.issuedAt > 0
                      ? new Date(result.details.issuedAt * 1000).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>

                {result.details.studentName && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileCheck size={13} /> CANDIDATE NAME (VERIFIED MATCH)
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                      {result.details.studentName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Proof Drawer (Expandable for Developers & Technical Auditors) */}
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 16 }}>
            <button
              onClick={() => setShowTechnicalDrawer(!showTechnicalDrawer)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-mono)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={15} /> View Blockchain & Cryptographic Proof
              </span>
              {showTechnicalDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTechnicalDrawer && (
              <div style={{
                marginTop: 14,
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: 12,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    CREDENTIAL ID (STORAGE KEY)
                  </div>
                  <div className="mono-block">{credId}</div>
                </div>

                {result.details?.holderCommitment && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      ZERO-KNOWLEDGE STUDENT COMMITMENT (SALTED)
                    </div>
                    <div className="mono-block">{result.details.holderCommitment}</div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      ISSUER WALLET ADDRESS
                    </div>
                    <div className="mono-block">{result.issuer || result.details?.issuerAddress || 'N/A'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      BLOCKCHAIN RUNTIME
                    </div>
                    <div className="mono-block">Arbitrum Sepolia (Stylus Nitro)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
