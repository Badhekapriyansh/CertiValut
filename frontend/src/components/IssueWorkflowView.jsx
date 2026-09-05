import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import {
  generateCredentialId,
  generateHolderCommitment,
  computeSha256,
  issueCredential
} from '../services/contractService';
import { saveMockCredential } from '../services/mockDataService';
import { IS_CONTRACT_CONFIGURED, NETWORK_CONFIG } from '../config/contracts';
import {
  PlusCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  FileText,
  User,
  Building,
  Calendar,
  Cpu,
  ShieldCheck,
  EyeOff,
  Copy,
  ExternalLink,
  Upload,
  Award
} from 'lucide-react';
import PrivacyBanner from './PrivacyBanner';

export default function IssueWorkflowView() {
  const { isDemoMode, refreshData, triggerConfetti, showToast, setActiveTab, setInspectCredential } = useApp();
  const { account, signer, isCorrectNetwork, connectWallet } = useWallet();

  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields (Step 1)
  const [recipientName, setRecipientName] = useState('Alexander Vance');
  const [recipientId, setRecipientId] = useState('REC-2026-904');
  const [credentialType, setCredentialType] = useState('Certificate');
  const [credentialTitle, setCredentialTitle] = useState('Certified Blockchain Solutions Architect');
  const [organization, setOrganization] = useState('Arbitrum Developer Guild');
  const [issueDate, setIssueDate] = useState('2026-06-15');
  const [description, setDescription] = useState('Completed advanced smart contract security and decentralized credential verification curriculum with distinction.');

  // Cryptographic Secrets & Hashes (Step 2)
  const [recipientSecret, setRecipientSecret] = useState('zk-recipient-secret-salt-8819');
  const [computedCredId, setComputedCredId] = useState('');
  const [computedHolderCommitment, setComputedHolderCommitment] = useState('');
  const [computedHash, setComputedHash] = useState('');

  // Execution State (Step 4 & 5)
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueResult, setIssueResult] = useState(null);
  const [error, setError] = useState(null);

  // Auto Generate Hashes on Transition to Step 2
  const handleProceedToStep2 = () => {
    if (!recipientName || !credentialTitle || !organization) {
      alert('Please fill out all required credential fields.');
      return;
    }

    const credId = generateCredentialId(organization, recipientId, credentialTitle, issueDate);
    const holderCommit = generateHolderCommitment(recipientSecret, 'certivault-v1');
    const docPayload = `${organization}|${recipientId}|${credentialType}|${credentialTitle}|${issueDate}|${description}`;
    const hash = computeSha256(docPayload);

    setComputedCredId(credId);
    setComputedHolderCommitment(holderCommit);
    setComputedHash(hash);
    setCurrentStep(2);
  };

  // Step 4: Execute Issuance
  const handleExecuteIssuance = async () => {
    setError(null);
    setIsIssuing(true);

    try {
      const issuedTimestamp = issueDate ? Math.floor(new Date(issueDate).getTime() / 1000) : Math.floor(Date.now() / 1000);

      if (isDemoMode) {
        // Fast instant simulator
        await new Promise((r) => setTimeout(r, 1200));

        const newRecord = {
          id: computedCredId,
          title: credentialTitle,
          degree: credentialTitle,
          credentialType,
          recipientName,
          studentName: recipientName,
          recipientId,
          studentId: recipientId,
          organization,
          institution: organization,
          issuerAddress: account || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          issuerName: organization,
          issuedAt: issuedTimestamp,
          issueDate,
          revocationAt: 0,
          status: 1, // Active
          description,
          honors: description,
          holderCommitment: computedHolderCommitment,
          credentialHash: computedHash,
          txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          blockNumber: 14899230,
          gasUsed: '24,118 gas (Stylus WASM)',
        };

        saveMockCredential(newRecord);
        refreshData();
        setIssueResult(newRecord);
        setCurrentStep(5);
        triggerConfetti();
        showToast('Credential minted successfully to Arbitrum Stylus!', 'success');
      } else {
        // Live On-Chain
        if (!signer || !isCorrectNetwork) {
          throw new Error('Please connect your authorized issuer wallet on Arbitrum Sepolia.');
        }
        if (!IS_CONTRACT_CONFIGURED) {
          throw new Error('Contract address not set in .env. Switch to Demo Mode above to test.');
        }

        const receipt = await issueCredential(signer, computedCredId, computedHolderCommitment, computedHash);

        const newRecord = {
          id: computedCredId,
          title: credentialTitle,
          degree: credentialTitle,
          credentialType,
          recipientName,
          studentName: recipientName,
          recipientId,
          studentId: recipientId,
          organization,
          institution: organization,
          issuerAddress: account,
          issuerName: organization,
          issuedAt: issuedTimestamp,
          issueDate,
          revocationAt: 0,
          status: 1,
          description,
          honors: description,
          holderCommitment: computedHolderCommitment,
          credentialHash: computedHash,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };

        saveMockCredential(newRecord);
        refreshData();
        setIssueResult(newRecord);
        setCurrentStep(5);
        triggerConfetti();
        showToast('Credential minted on-chain to Arbitrum Sepolia!', 'success');
      }
    } catch (err) {
      setError(err.reason || err.message || 'Issuance transaction failed.');
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span className="tech-tag tech-tag-purple">
            <Sparkles size={12} /> ENTERPRISE ISSUANCE WORKFLOW
          </span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 8 }}>
          Issue Verifiable Credential
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem' }}>
          5-Step Zero-Knowledge attestation pipeline executed on Arbitrum Stylus WASM.
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: 36,
        padding: '0 12px'
      }}>
        {[
          { num: 1, label: 'Metadata' },
          { num: 2, label: 'Commitment' },
          { num: 3, label: 'Privacy Audit' },
          { num: 4, label: 'Stylus Sign' },
          { num: 5, label: 'Success' },
        ].map((step) => {
          const isPassed = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: isCurrent ? 'var(--primary)' : isPassed ? 'var(--success)' : 'rgba(255, 255, 255, 0.05)',
                color: isCurrent || isPassed ? '#05070c' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isCurrent ? '0 0 20px var(--primary-glow)' : isPassed ? '0 0 16px var(--success-glow)' : 'none',
                border: isCurrent || isPassed ? 'none' : '1px solid var(--border-glass)',
                transition: 'all 0.2s ease'
              }}>
                {isPassed ? <CheckCircle2 size={18} strokeWidth={3} /> : step.num}
              </div>
              <span style={{
                fontSize: '0.74rem',
                marginTop: 6,
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? 'var(--primary)' : isPassed ? 'var(--text-main)' : 'var(--text-muted)'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}

        {/* Stepper Background Track */}
        <div style={{
          position: 'absolute',
          top: 19,
          left: 36,
          right: 36,
          height: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }} />
      </div>

      {/* Step 1: Credential Information */}
      {currentStep === 1 && (
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <FileText size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Step 1 — Credential Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="input-group">
              <label className="input-label"><Building size={14} /> Issuing Organization / Institution</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Arbitrum Foundation, MIT, Google, Stanford"
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label"><Award size={14} /> Credential Type</label>
              <select
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value)}
                className="input-field"
                style={{ background: '#0a0e17', color: '#ffffff' }}
              >
                <option value="Certificate">Certificate</option>
                <option value="Degree">Degree</option>
                <option value="Course">Course</option>
                <option value="Internship">Internship</option>
                <option value="Training">Training</option>
                <option value="Workshop">Workshop</option>
                <option value="Skill">Skill</option>
                <option value="Award">Award</option>
                <option value="License">License</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="input-group">
              <label className="input-label"><User size={14} /> Recipient Full Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Alexander Vance"
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label"><FileText size={14} /> Recipient ID / Reference ID</label>
              <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="e.g. REC-2026-904"
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label"><ShieldCheck size={14} /> Credential / Achievement Title</label>
            <input
              type="text"
              value={credentialTitle}
              onChange={(e) => setCredentialTitle(e.target.value)}
              placeholder="e.g. Certified Blockchain Solutions Architect, M.S. Computer Science"
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className="input-group">
              <label className="input-label"><Calendar size={14} /> Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="input-field"
                style={{ background: '#0a0e17', color: '#ffffff' }}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label"><Sparkles size={14} /> Description / Details</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Completed advanced curriculum with First Class distinction"
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button
              onClick={handleProceedToStep2}
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              Generate Cryptographic Hashes →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generate Cryptographic Commitment */}
      {currentStep === 2 && (
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Lock size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Step 2 — Cryptographic Commitment & Salt
            </h2>
          </div>

          <p style={{ color: 'var(--text-sub)', fontSize: '0.88rem', marginBottom: 20 }}>
            Mathematical hashes computed client-side to blind recipient PII and bind the credential to Arbitrum Stylus.
          </p>

          <div className="input-group">
            <label className="input-label"><Lock size={14} /> Recipient Secret Salt (Blinds Identity for ZKP)</label>
            <input
              type="text"
              value={recipientSecret}
              onChange={(e) => {
                setRecipientSecret(e.target.value);
                setComputedHolderCommitment(generateHolderCommitment(e.target.value, 'certivault-v1'));
              }}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                COMPUTED CREDENTIAL ID (STORAGE KEY)
              </div>
              <div className="mono-block">{computedCredId}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                DOCUMENT FINGERPRINT HASH (SHA-256)
              </div>
              <div className="mono-block">{computedHash}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                ZKP HOLDER COMMITMENT (KECCAK-256)
              </div>
              <div className="mono-block">{computedHolderCommitment}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setCurrentStep(3)} className="btn btn-primary">
              Review Privacy Boundary →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Privacy Audit & On-Chain / Off-Chain Boundary */}
      {currentStep === 3 && (
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <EyeOff size={22} color="var(--success)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Step 3 — Privacy Boundary Verification
            </h2>
          </div>

          <p style={{ color: 'var(--text-sub)', fontSize: '0.88rem', marginBottom: 24 }}>
            Confirm what is published to the public blockchain versus what remains 100% confidential.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* Left: Off-chain */}
            <div style={{ background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <EyeOff size={15} /> KEPT OFF-CHAIN (100% PRIVATE)
              </div>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.8, paddingLeft: 18 }}>
                <li>Recipient Name: <strong>{recipientName}</strong></li>
                <li>Recipient Reference ID: <strong>{recipientId}</strong></li>
                <li>Credential Type: <strong>{credentialType}</strong></li>
                <li>Credential Details & Description</li>
                <li>Recipient Secret Salt</li>
              </ul>
            </div>

            {/* Right: On-chain */}
            <div style={{ background: 'rgba(0, 255, 135, 0.04)', border: '1px solid rgba(0, 255, 135, 0.2)', borderRadius: 12, padding: 18 }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} /> PUBLISHED TO STYLUS (VERIFIABLE)
              </div>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.8, paddingLeft: 18 }}>
                <li>Credential ID: <code style={{ fontSize: '0.72rem' }}>{computedCredId.slice(0, 10)}...</code></li>
                <li>Holder Commitment: <code style={{ fontSize: '0.72rem' }}>{computedHolderCommitment.slice(0, 10)}...</code></li>
                <li>Credential Hash: <code style={{ fontSize: '0.72rem' }}>{computedHash.slice(0, 10)}...</code></li>
                <li>Issuance Block Timestamp</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setCurrentStep(4)} className="btn btn-primary">
              Proceed to Blockchain Issuance →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Blockchain Issuance */}
      {currentStep === 4 && (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Cpu size={32} color="var(--primary)" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            Step 4 — Sign & Publish Attestation
          </h2>

          <p style={{ color: 'var(--text-sub)', maxWidth: 520, margin: '0 auto 24px', fontSize: '0.9rem' }}>
            {isDemoMode
              ? 'Demo mode simulator will execute the issuance through the testnet Stylus runtime simulator.'
              : 'Sign the transaction in your EVM wallet to write the attestation to Arbitrum Sepolia.'}
          </p>

          {error && (
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255, 71, 87, 0.1)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button onClick={() => setCurrentStep(3)} disabled={isIssuing} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handleExecuteIssuance}
              disabled={isIssuing}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem' }}
            >
              <Sparkles size={18} />
              {isIssuing ? 'Compiling Proof to Arbitrum Stylus...' : 'Mint Credential On-Chain'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success & Verification Link */}
      {currentStep === 5 && issueResult && (
        <div className="glass-card" style={{ padding: 36, textAlign: 'center', border: '1px solid rgba(0, 255, 135, 0.4)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 255, 135, 0.15)', border: '1px solid rgba(0, 255, 135, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <CheckCircle2 size={36} color="var(--success)" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--success)', marginBottom: 8 }}>
            Credential Successfully Issued!
          </h2>

          <p style={{ color: 'var(--text-sub)', maxWidth: 540, margin: '0 auto 24px', fontSize: '0.92rem' }}>
            The immutable cryptographic attestation has been committed to the Arbitrum Stylus runtime.
          </p>

          <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--border-glass)', borderRadius: 12, padding: 20, textAlign: 'left', marginBottom: 28 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>CREDENTIAL ID</div>
            <div className="mono-block" style={{ marginBottom: 12 }}>{issueResult.id}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>TRANSACTION</div>
                <div className="mono-block">{issueResult.txHash.slice(0, 10)}...{issueResult.txHash.slice(-6)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>STYLUS GAS CONSUMED</div>
                <div className="mono-block" style={{ color: 'var(--success)' }}>24,118 Gas</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setInspectCredential(issueResult)}
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              <FileText size={16} /> View Official Attestation
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setIssueResult(null);
              }}
              className="btn btn-secondary"
              style={{ padding: '12px 20px' }}
            >
              <PlusCircle size={16} /> Issue Another Credential
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
