import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Download,
  PlusCircle,
  Building,
  CheckCircle2,
  Ban,
  FileCheck,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function CredentialsView() {
  const { credentials, setInspectCredential, setActiveTab, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const total = credentials.length;
  const activeCount = credentials.filter((c) => c.status === 1).length;
  const revokedCount = credentials.filter((c) => c.status === 2).length;

  const filtered = credentials.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ACTIVE') return matchesSearch && c.status === 1;
    if (statusFilter === 'REVOKED') return matchesSearch && c.status === 2;
    return matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = 'Credential ID,Recipient,Degree,Institution,Status,Issued Date,Holder Commitment,Hash\n';
    const rows = filtered
      .map(
        (c) =>
          `"${c.id}","${c.studentName}","${c.degree}","${c.institution}","${
            c.status === 1 ? 'Active' : 'Revoked'
          }","${new Date(c.issuedAt * 1000).toISOString()}","${c.holderCommitment}","${c.credentialHash}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certivault-credentials-${Date.now()}.csv`;
    a.click();
    showToast('Exported credentials CSV successfully', 'info');
  };

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="tech-tag tech-tag-purple" style={{ fontSize: '0.68rem' }}>
              REGISTRY DIRECTORY
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Academic Credentials Directory
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
            Filter, search, and inspect verifiable credentials issued across accredited universities.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <PlusCircle size={14} /> Issue Credential
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            TOTAL CREDENTIALS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {total}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Registered on Stylus WASM
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            ACTIVE & VALID
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Valid & verifiable
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            REVOKED
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>
            {revokedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Invalidated records
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            INTEGRITY RATE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            {((activeCount / (total || 1)) * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Cryptographic match pass
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by student, degree, or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 36, padding: '8px 12px 8px 36px', fontSize: '0.86rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`btn ${statusFilter === 'ALL' ? 'btn-cyan' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
          >
            All ({total})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`btn ${statusFilter === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('REVOKED')}
            className={`btn ${statusFilter === 'REVOKED' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
          >
            Revoked ({revokedCount})
          </button>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Credential</th>
                <th>Recipient</th>
                <th>Institution</th>
                <th>Issued Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cred) => (
                <tr
                  key={cred.id}
                  onClick={() => setInspectCredential(cred)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{cred.degree}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {cred.id.slice(0, 10)}...{cred.id.slice(-6)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{cred.studentName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{cred.studentId}</div>
                  </td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--text-sub)' }}>
                    {cred.institution}
                  </td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--text-sub)' }}>
                    {new Date(cred.issuedAt * 1000).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${cred.status === 1 ? 'badge-success' : 'badge-danger'}`}>
                      {cred.status === 1 ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                      Inspect Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
