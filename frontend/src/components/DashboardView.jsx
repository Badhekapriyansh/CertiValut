import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  CheckCircle2,
  Ban,
  Search,
  PlusCircle,
  Building,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function DashboardView() {
  const { credentials, activities, setActiveTab, setInspectCredential } = useApp();

  const activeCount = credentials.filter((c) => c.status === 1).length;
  const revokedCount = credentials.filter((c) => c.status === 2).length;

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* Top Welcome Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="tech-tag tech-tag-cyan" style={{ fontSize: '0.68rem' }}>
              <Building size={11} /> ACCREDITED REGISTRAR PORTAL
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Institutional Operations Center
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
            Live credential activity overview, registrar issuance quotas, and audit stream on Arbitrum Stylus.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveTab('issue')}
            className="btn btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.84rem' }}
          >
            <PlusCircle size={15} /> Issue Credential
          </button>
          <button
            onClick={() => setActiveTab('revoke')}
            className="btn btn-secondary"
            style={{ padding: '10px 16px', fontSize: '0.84rem' }}
          >
            <Ban size={15} color="var(--danger)" /> Revoke Record
          </button>
        </div>
      </div>

      {/* 4 KPI Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            TOTAL REGISTERED
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {credentials.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: 4 }}>
            Degrees & Attestations on Stylus
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            ACTIVE & VERIFIED
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: 4 }}>
            Valid & verified credentials
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            PERMANENTLY REVOKED
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>
            {revokedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: 4 }}>
            Invalidated by admin
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            PUBLIC QUERIES
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            1,428
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: 4 }}>
            Employer background checks
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Credentials & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Recent Credentials Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              Recently Issued Credentials
            </h2>
            <button
              onClick={() => setActiveTab('credentials')}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              View all →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {credentials.slice(0, 4).map((cred) => (
              <div
                key={cred.id}
                onClick={() => setInspectCredential(cred)}
                className="card-interactive"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {cred.studentName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                    {cred.degree}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${cred.status === 1 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                    {cred.status === 1 ? 'Active' : 'Revoked'}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {new Date(cred.issuedAt * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Log Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              Audit & Verification Activity
            </h2>
            <button
              onClick={() => setActiveTab('activity')}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Full timeline →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.slice(0, 4).map((act, index) => (
              <div
                key={index}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {act.type === 'CREDENTIAL_ISSUED' ? 'Credential Issued' : act.type === 'CREDENTIAL_REVOKED' ? 'Credential Revoked' : 'Issuer Accredited'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    {act.issuerName || act.issuer}
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(act.timestamp * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
