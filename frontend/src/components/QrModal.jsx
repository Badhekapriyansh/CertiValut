import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function QrModal({ credential, onClose }) {
  const { showToast, launchVerifyWithPreset } = useApp();

  if (!credential) return null;

  const credId = typeof credential === 'string' ? credential : (credential.id || credential.credId || '');
  const title = credential.title || credential.degree || 'Verifiable Credential';
  const org = credential.organization || credential.institution || credential.issuerName || 'Accredited Issuer';
  const status = credential.status;

  // Build the public verification URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const verifyUrl = `${baseUrl}/?tab=verify&id=${encodeURIComponent(credId)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    showToast('Verification URL copied to clipboard', 'info');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(credId);
    showToast('Credential ID copied to clipboard', 'info');
  };

  const handleOpenVerify = () => {
    onClose();
    launchVerifyWithPreset({ id: credId, credentialHash: credential.credentialHash || credential.credHash || '' });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 350 }}>
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          padding: 32,
          position: 'relative',
          background: '#090d16',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.15)',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
            <ShieldCheck size={11} /> SELECTIVE CREDENTIAL SHARING
          </span>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
          Share This Credential
        </h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.84rem', maxWidth: 360, margin: '0 auto 20px' }}>
          Anyone can scan this QR code to independently verify this specific credential on Arbitrum Stylus without gaining access to your passport.
        </p>

        {/* High-Contrast QR Code Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: 22,
          display: 'inline-block',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          marginBottom: 20
        }}>
          <QRCodeSVG
            value={verifyUrl}
            size={200}
            level="H"
            includeMargin={false}
            fgColor="#0a0f1d"
            bgColor="#ffffff"
          />
        </div>

        {/* Credential Summary */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '14px 16px',
          textAlign: 'left',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              CREDENTIAL ID
            </span>
            <button
              onClick={handleCopyId}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Copy size={11} /> Copy ID
            </button>
          </div>
          <div className="mono-block" style={{ fontSize: '0.72rem', wordBreak: 'break-all', marginBottom: 8 }}>
            {credId}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-sub)' }}>{org}</span>
            <span style={{
              color: status === 2 ? 'var(--danger)' : 'var(--success)',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {status === 2 ? '● REVOKED' : '● ACTIVE ON-CHAIN'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <Copy size={14} /> Copy Verification Link
          </button>
          <button
            onClick={handleOpenVerify}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
          >
            <ExternalLink size={14} /> Verify Now
          </button>
        </div>

        {/* Privacy Note */}
        <div style={{
          marginTop: 18,
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <Lock size={11} color="var(--primary)" />
          <span>Zero private keys or sensitive salts are encoded in this QR code.</span>
        </div>
      </div>
    </div>
  );
}
