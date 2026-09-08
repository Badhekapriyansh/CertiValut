import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Search,
  Filter,
  Cpu,
  KeyRound,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { NETWORK_CONFIG } from '../config/contracts';

export default function OrganizationsView() {
  const { organizations, credentials, setActiveTab, setSelectedOrg, accreditOrganization, showToast, openIssuerProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeModalOrg, setActiveModalOrg] = useState(null);

  const filteredOrgs = organizations.filter((org) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      org.name.toLowerCase().includes(term) ||
      (org.shortName && org.shortName.toLowerCase().includes(term)) ||
      org.type.toLowerCase().includes(term) ||
      org.city.toLowerCase().includes(term) ||
      org.country.toLowerCase().includes(term) ||
      org.issuerAddress.toLowerCase().includes(term);

    if (typeFilter === 'ALL') return matchesSearch;
    return matchesSearch && org.type === typeFilter;
  });

  const getOrgCredentials = (issuerAddr) => {
    return credentials.filter((c) => c.issuerAddress?.toLowerCase() === issuerAddr?.toLowerCase());
  };

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* Header */}
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
              <Building2 size={11} /> ISSUER IDENTITY DIRECTORY
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Accredited Organizations & Issuers
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem' }}>
            Explore verified educational institutions, academies, and enterprises with cryptographic issuing authority on Arbitrum Stylus.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('org-register')}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.84rem' }}
        >
          <PlusCircle size={15} /> Register Organization
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            TOTAL ORGANIZATIONS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {organizations.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Registered on protocol
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            ACCREDITED & ACTIVE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
            {organizations.filter(o => o.status === 'ACTIVE').length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Authorized to issue on Stylus
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            MANAGED IDENTITIES
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            {organizations.filter(o => o.issuerIdentityType === 'managed_identity').length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Abstracted Web3 identities
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            PENDING ACCREDITATION
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', fontFamily: 'var(--font-display)' }}>
            {organizations.filter(o => o.status === 'PENDING_ACCREDITATION').length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
            Awaiting Root Admin approval
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by organization name, city, type, or issuer address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 36, padding: '8px 12px 8px 36px', fontSize: '0.86rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', 'University / College', 'Certification Provider', 'Training Institute', 'Company'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`btn ${typeFilter === type ? 'btn-cyan' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.76rem' }}
            >
              {type === 'ALL' ? 'All Types' : type.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {filteredOrgs.map((org) => {
          const orgCreds = getOrgCredentials(org.issuerAddress);
          const activeCreds = orgCreds.filter(c => c.status === 1).length;
          const revokedCreds = orgCreds.filter(c => c.status === 2).length;

          return (
            <div
              key={org.id}
              className="glass-card"
              style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem'
                    }}>
                      {org.logo || '🏛️'}
                    </div>
                    <div>
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                        {org.type}
                      </span>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginTop: 2 }}>
                        {org.name}
                      </h2>
                    </div>
                  </div>

                  <span className={`badge ${
                    org.status === 'ACTIVE'
                      ? 'badge-success'
                      : org.status === 'SUSPENDED'
                        ? 'badge-danger'
                        : 'badge-warning'
                  }`} style={{ fontSize: '0.68rem', padding: '4px 8px' }}>
                    {org.status === 'ACTIVE' ? 'ACTIVE' : org.status === 'SUSPENDED' ? 'SUSPENDED' : 'PENDING'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-sub)', fontSize: '0.82rem', lineHeight: 1.4, marginBottom: 14, minHeight: 36 }}>
                  {org.description?.length > 110 ? `${org.description.slice(0, 110)}...` : org.description}
                </p>

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} color="var(--primary)" />
                    <span>{org.city}, {org.country}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Globe size={13} color="var(--primary)" />
                    <a href={org.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {org.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {org.issuerIdentityType === 'managed_identity' ? (
                      <>
                        <Cpu size={13} color="var(--primary)" />
                        <span style={{ color: 'var(--primary)' }}>CertiVault Managed Identity</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={13} color="var(--accent-purple)" />
                        <span style={{ color: 'var(--accent-purple)' }}>Organization Wallet</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Storage Key */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                    ISSUER PUBLIC ADDRESS
                  </div>
                  <div className="mono-block" style={{ fontSize: '0.72rem', padding: '6px 8px' }}>
                    {org.issuerAddress}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{orgCreds.length}</span> credentials
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openIssuerProfile(org.issuerAddress)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.74rem' }}
                  >
                    <ExternalLink size={12} /> Profile
                  </button>
                  <button
                    onClick={() => setActiveModalOrg(org)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.74rem' }}
                  >
                    <ShieldCheck size={12} /> Audit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Profile Modal */}
      {activeModalOrg && (
        <div className="modal-backdrop" onClick={() => setActiveModalOrg(null)}>
          <div
            className="glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 32,
              background: '#0a0e17',
              border: '1px solid var(--border-medium)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '2rem' }}>{activeModalOrg.logo || '🏛️'}</div>
                <div>
                  <span className="badge badge-blue" style={{ marginBottom: 4 }}>
                    {activeModalOrg.type}
                  </span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                    {activeModalOrg.name}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    {activeModalOrg.city}, {activeModalOrg.country} • {activeModalOrg.website}
                  </div>
                </div>
              </div>

              <span className={`badge ${activeModalOrg.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                {activeModalOrg.status}
              </span>
            </div>

            {/* Trust Profile Verification Checklist */}
            <div style={{
              background: 'rgba(0, 240, 255, 0.03)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: 10,
              padding: 18,
              marginBottom: 20
            }}>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 12 }}>
                // ISSUER TRUST PROFILE & ACCREDITATION AUDIT
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
                  <CheckCircle2 size={16} /> <span>Organization Registered</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
                  <CheckCircle2 size={16} /> <span>Issuer Identity Provisioned</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeModalOrg.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)' }}>
                  {activeModalOrg.status === 'ACTIVE' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  <span>Issuer Accredited</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeModalOrg.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)' }}>
                  {activeModalOrg.status === 'ACTIVE' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  <span>Stylus WASM Authorized</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeModalOrg.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)', gridColumn: '1 / -1' }}>
                  {activeModalOrg.status === 'ACTIVE' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  <span>Active Minting Privileges on Arbitrum Sepolia</span>
                </div>
              </div>
            </div>

            {/* Metadata Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ISSUER IDENTITY TYPE</div>
                <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.86rem', marginTop: 2 }}>
                  {activeModalOrg.issuerIdentityType === 'managed_identity' ? 'CertiVault Managed Identity' : 'Organization-Controlled Wallet'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>REGISTRATION DATE</div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.86rem', marginTop: 2 }}>
                  {new Date(activeModalOrg.createdAt * 1000).toLocaleDateString()}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ISSUER PUBLIC ADDRESS</div>
                <div className="mono-block" style={{ fontSize: '0.76rem', marginTop: 2 }}>
                  {activeModalOrg.issuerAddress}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              {activeModalOrg.status !== 'ACTIVE' && (
                <button
                  onClick={() => {
                    accreditOrganization(activeModalOrg.id);
                    setActiveModalOrg({ ...activeModalOrg, status: 'ACTIVE' });
                    showToast(`Accredited ${activeModalOrg.name}`, 'success');
                  }}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <CheckCircle2 size={14} /> Accredit in Governance
                </button>
              )}

              <button
                onClick={() => setActiveModalOrg(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
