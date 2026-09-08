import { ethers } from 'ethers';

// Initial pre-loaded verifiable credentials for judge testing and general verification
const DEFAULT_MOCK_CREDENTIALS = [
  {
    id: '0x8f14b62d3a985e78326a0b47124976cf0e817926b485671d15c1e289bf44901a',
    title: 'Master of Science in Distributed Systems & Cryptography',
    degree: 'Master of Science in Distributed Systems & Cryptography',
    credentialType: 'Degree',
    recipientName: 'Elena Rostova',
    studentName: 'Elena Rostova',
    recipientId: 'REC-STANFORD-9901',
    studentId: 'REC-STANFORD-9901',
    organization: 'Stanford University School of Engineering',
    institution: 'Stanford University School of Engineering',
    issuerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    issuerName: 'Stanford University School of Engineering',
    issuedAt: Math.floor(Date.now() / 1000) - 86400 * 42,
    issueDate: '2026-05-18',
    revocationAt: 0,
    status: 1, // Active / Authentic
    description: 'Summa Cum Laude with Specialization in Zero-Knowledge Cryptography & Distributed Consensus.',
    honors: 'Summa Cum Laude with Specialization in Zero-Knowledge Cryptography & Distributed Consensus.',
    holderCommitment: '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b',
    credentialHash: '0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    txHash: '0x3c7e9a1b5d2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a',
    blockNumber: 14892041,
    gasUsed: '24,118 gas (Stylus WASM)',
  },
  {
    id: '0x4d2e8a7b1c9f0e3d5a6b8c7e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    title: 'Arbitrum Stylus Advanced Rust Developer Certification',
    degree: 'Arbitrum Stylus Advanced Rust Developer Certification',
    credentialType: 'Certificate',
    recipientName: 'Marcus Vance',
    studentName: 'Marcus Vance',
    recipientId: 'ARB-CERT-8820',
    studentId: 'ARB-CERT-8820',
    organization: 'Offchain Labs Developer Academy',
    institution: 'Offchain Labs Developer Academy',
    issuerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    issuerName: 'Offchain Labs Developer Academy',
    issuedAt: Math.floor(Date.now() / 1000) - 86400 * 120,
    issueDate: '2026-04-12',
    revocationAt: 0,
    status: 1, // Active / Authentic
    description: 'Validated mastery in memory-safe Stylus smart contracts, ArbWasm precompile invocation, and L2 gas optimization.',
    honors: 'Validated mastery in memory-safe Stylus smart contracts, ArbWasm precompile invocation, and L2 gas optimization.',
    holderCommitment: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    credentialHash: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
    txHash: '0x7e9a1b3c5d2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0b',
    blockNumber: 14751890,
    gasUsed: '23,904 gas (Stylus WASM)',
  },
  {
    id: '0x3b1e9a2c4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    title: 'Ethereum Core Protocol & L2 Rollup Fellowship',
    degree: 'Ethereum Core Protocol & L2 Rollup Fellowship',
    credentialType: 'Internship',
    recipientName: 'Aaliyah Chen',
    studentName: 'Aaliyah Chen',
    recipientId: 'ETH-FELLOW-2026',
    studentId: 'ETH-FELLOW-2026',
    organization: 'Ethereum Foundation',
    institution: 'Ethereum Foundation',
    issuerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    issuerName: 'Ethereum Foundation',
    issuedAt: Math.floor(Date.now() / 1000) - 86400 * 75,
    issueDate: '2026-03-01',
    revocationAt: 0,
    status: 1, // Active / Authentic
    description: '3-Month Intensive Core Engineering Fellowship focusing on decentralized sequencers and state fraud proofs.',
    honors: '3-Month Intensive Core Engineering Fellowship focusing on decentralized sequencers and state fraud proofs.',
    holderCommitment: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    credentialHash: '0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8c',
    txHash: '0x6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0b3c5d2f8e4a7e9a1b',
    blockNumber: 14682019,
    gasUsed: '24,050 gas (Stylus WASM)',
  },
  {
    id: '0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8b',
    title: 'Oxford Jurisprudence & Legal Innovation Prize',
    degree: 'Oxford Jurisprudence & Legal Innovation Prize',
    credentialType: 'Award',
    recipientName: 'Sarah Jenkins',
    studentName: 'Sarah Jenkins',
    recipientId: 'OX-LAW-4402',
    studentId: 'OX-LAW-4402',
    organization: 'University of Oxford Faculty of Law',
    institution: 'University of Oxford Faculty of Law',
    issuerAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    issuerName: 'University of Oxford Faculty of Law',
    issuedAt: Math.floor(Date.now() / 1000) - 86400 * 300,
    issueDate: '2026-01-20',
    revocationAt: Math.floor(Date.now() / 1000) - 86400 * 15,
    status: 2, // Revoked
    description: 'Revoked due to administrative reissuance and category re-classification under new governance bylaws.',
    honors: 'Revoked due to administrative reissuance and category re-classification under new governance bylaws.',
    holderCommitment: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    credentialHash: '0x3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d',
    txHash: '0x9a1b3c5d7e2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0c',
    blockNumber: 14512093,
    gasUsed: '24,310 gas (Stylus WASM)',
  }
];

const DEFAULT_MOCK_ISSUERS = [
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Stanford University School of Engineering',
    active: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 400,
    totalIssued: 1420,
    activeIssued: 1412,
    revoked: 8,
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    name: 'Offchain Labs Developer Academy',
    active: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 520,
    totalIssued: 2890,
    activeIssued: 2884,
    revoked: 6,
  },
  {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    name: 'University of Oxford',
    active: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 600,
    totalIssued: 980,
    activeIssued: 975,
    revoked: 5,
  },
];

const DEFAULT_MOCK_ACTIVITIES = [
  {
    type: 'CREDENTIAL_ISSUED',
    credId: '0x8f14b62d3a985e78326a0b47124976cf0e817926b485671d15c1e289bf44901a',
    issuer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    issuerName: 'Stanford University',
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 2,
    txHash: '0x3c7e9a1b5d2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a',
    blockNumber: 14892041,
    status: 'SUCCESS',
  },
  {
    type: 'CREDENTIAL_REVOKED',
    credId: '0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8b',
    issuer: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    issuerName: 'University of Oxford',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 15,
    txHash: '0x9a1b3c5d7e2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0c',
    blockNumber: 14512093,
    status: 'REVOKED',
  },
  {
    type: 'ISSUER_REGISTERED',
    credId: null,
    issuer: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    issuerName: 'Offchain Labs Developer Academy',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
    txHash: '0x5d7e2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0c9a1b3c',
    blockNumber: 14420910,
    status: 'ACCREDITED',
  },
];

const DEFAULT_MOCK_ORGANIZATIONS = [
  {
    id: 'org-stanford-01',
    name: 'Stanford University School of Engineering',
    shortName: 'Stanford Eng',
    type: 'University / College',
    email: 'accreditation@stanford.edu',
    country: 'United States',
    state: 'California',
    city: 'Stanford',
    website: 'https://engineering.stanford.edu',
    description: 'Premier academic institution dedicated to groundbreaking research and engineering education in computer science, distributed systems, and cryptography.',
    contactPerson: 'Dr. James Thorne',
    logo: '🏛️',
    issuerIdentityType: 'external_wallet',
    issuerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    status: 'ACTIVE',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 400,
    accreditedAt: Math.floor(Date.now() / 1000) - 86400 * 399,
  },
  {
    id: 'org-offchain-02',
    name: 'Offchain Labs Developer Academy',
    shortName: 'Offchain Academy',
    type: 'Certification Provider',
    email: 'education@offchainlabs.com',
    country: 'United States',
    state: 'New Jersey',
    city: 'Princeton',
    website: 'https://offchainlabs.com',
    description: 'Official training and certification provider for Arbitrum Nitro & Stylus smart contract engineering.',
    contactPerson: 'Rachel Miller',
    logo: '⚡',
    issuerIdentityType: 'external_wallet',
    issuerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    status: 'ACTIVE',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 520,
    accreditedAt: Math.floor(Date.now() / 1000) - 86400 * 519,
  },
  {
    id: 'org-oxford-03',
    name: 'University of Oxford',
    shortName: 'Oxford Law',
    type: 'University / College',
    email: 'law.credentials@ox.ac.uk',
    country: 'United Kingdom',
    state: 'Oxfordshire',
    city: 'Oxford',
    website: 'https://ox.ac.uk',
    description: 'Collegiate research university renowned for historical academic excellence and legal jurisprudence.',
    contactPerson: 'Prof. Alistair Finch',
    logo: '🎓',
    issuerIdentityType: 'external_wallet',
    issuerAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    status: 'ACTIVE',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 600,
    accreditedAt: Math.floor(Date.now() / 1000) - 86400 * 598,
  },
  {
    id: 'org-nova-tech-04',
    name: 'Nova Institute of Advanced Technology',
    shortName: 'Nova Tech',
    type: 'Training Institute',
    email: 'registrar@novatech.edu',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    website: 'https://novatech.example.edu',
    description: 'Global workforce training institute for AI, cybersecurity, and Web3 developers.',
    contactPerson: 'Dr. Karen Zhao',
    logo: '🚀',
    issuerIdentityType: 'managed_identity',
    issuerAddress: '0x7A91B3c5d7E2f8E4a6C0B9D7e1F3a5C7e9B242F8',
    status: 'PENDING_ACCREDITATION',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
    accreditedAt: null,
  }
];

const STORAGE_KEYS = {
  CREDENTIALS: 'certivault_mock_credentials_v2',
  ACTIVITIES: 'certivault_mock_activities_v2',
  ISSUERS: 'certivault_mock_issuers_v2',
  ORGANIZATIONS: 'certivault_mock_organizations_v2',
};

export function getMockOrganizations() {
  const cached = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(DEFAULT_MOCK_ORGANIZATIONS));
  return DEFAULT_MOCK_ORGANIZATIONS;
}

export function saveMockOrganization(org) {
  const list = getMockOrganizations();
  const newOrg = {
    ...org,
    id: org.id || `org-${Date.now().toString(36)}`,
    status: org.status || 'PENDING_ACCREDITATION',
    createdAt: org.createdAt || Math.floor(Date.now() / 1000),
    issuerIdentityType: org.issuerIdentityType || 'managed_identity',
    issuerAddress: org.issuerAddress || '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  };
  const updated = [newOrg, ...list.filter(o => o.id !== newOrg.id)];
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(updated));

  addMockActivity({
    type: 'ORGANIZATION_REGISTERED',
    credId: null,
    issuer: newOrg.issuerAddress,
    issuerName: newOrg.name,
    timestamp: Math.floor(Date.now() / 1000),
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    blockNumber: 14899300,
    status: 'REGISTERED',
  });

  return updated;
}

export function updateOrganizationStatus(orgId, status) {
  const list = getMockOrganizations();
  const updated = list.map((o) => {
    if (o.id === orgId || o.issuerAddress.toLowerCase() === orgId.toLowerCase()) {
      return {
        ...o,
        status,
        accreditedAt: status === 'ACTIVE' ? (o.accreditedAt || Math.floor(Date.now() / 1000)) : o.accreditedAt,
      };
    }
    return o;
  });
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(updated));

  // Also sync with issuers list if active
  const targetOrg = updated.find(o => o.id === orgId || o.issuerAddress.toLowerCase() === orgId.toLowerCase());
  if (targetOrg) {
    const issuers = getMockIssuers();
    const existingIssuer = issuers.find(i => i.address.toLowerCase() === targetOrg.issuerAddress.toLowerCase());
    let updatedIssuers;
    if (existingIssuer) {
      updatedIssuers = issuers.map(i => i.address.toLowerCase() === targetOrg.issuerAddress.toLowerCase() ? { ...i, active: status === 'ACTIVE' } : i);
    } else if (status === 'ACTIVE') {
      updatedIssuers = [{
        address: targetOrg.issuerAddress,
        name: targetOrg.name,
        active: true,
        registeredAt: Math.floor(Date.now() / 1000),
        totalIssued: 0,
        activeIssued: 0,
        revoked: 0
      }, ...issuers];
    } else {
      updatedIssuers = issuers;
    }
    localStorage.setItem(STORAGE_KEYS.ISSUERS, JSON.stringify(updatedIssuers));
  }

  return updated;
}

export function getMockCredentials() {
  const cached = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(DEFAULT_MOCK_CREDENTIALS));
  return DEFAULT_MOCK_CREDENTIALS;
}

export function saveMockCredential(cred) {
  const list = getMockCredentials();
  const standardizedCred = {
    ...cred,
    title: cred.title || cred.degree || 'Official Credential',
    degree: cred.title || cred.degree || 'Official Credential',
    recipientName: cred.recipientName || cred.studentName || 'Recipient',
    studentName: cred.recipientName || cred.studentName || 'Recipient',
    recipientId: cred.recipientId || cred.studentId || 'REC-ID',
    studentId: cred.recipientId || cred.studentId || 'REC-ID',
    organization: cred.organization || cred.institution || 'Issuing Organization',
    institution: cred.organization || cred.institution || 'Issuing Organization',
    credentialType: cred.credentialType || 'Certificate',
    issueDate: cred.issueDate || new Date((cred.issuedAt || Math.floor(Date.now() / 1000)) * 1000).toISOString().split('T')[0],
    description: cred.description || cred.honors || 'Validated Credential',
    honors: cred.description || cred.honors || 'Validated Credential',
  };
  const updated = [standardizedCred, ...list];
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(updated));

  // Also log to activity
  addMockActivity({
    type: 'CREDENTIAL_ISSUED',
    credId: standardizedCred.id,
    issuer: standardizedCred.issuerAddress,
    issuerName: standardizedCred.organization || standardizedCred.institution,
    timestamp: Math.floor(Date.now() / 1000),
    txHash: standardizedCred.txHash,
    blockNumber: standardizedCred.blockNumber,
    status: 'SUCCESS',
  });

  return updated;
}

export function revokeMockCredential(credId, reason) {
  const list = getMockCredentials();
  const updated = list.map((c) => {
    if (c.id.toLowerCase() === credId.toLowerCase()) {
      return {
        ...c,
        status: 2, // Revoked
        revocationAt: Math.floor(Date.now() / 1000),
        revocationReason: reason || 'Administrative Revocation',
      };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(updated));

  addMockActivity({
    type: 'CREDENTIAL_REVOKED',
    credId,
    issuer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    issuerName: 'Authorized Institution',
    timestamp: Math.floor(Date.now() / 1000),
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    blockNumber: 14899120,
    status: 'REVOKED',
  });

  return updated;
}

export function getMockActivities() {
  const cached = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(DEFAULT_MOCK_ACTIVITIES));
  return DEFAULT_MOCK_ACTIVITIES;
}

export function addMockActivity(activity) {
  const list = getMockActivities();
  const updated = [activity, ...list];
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
  return updated;
}

export function getMockIssuers() {
  const cached = localStorage.getItem(STORAGE_KEYS.ISSUERS);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.ISSUERS, JSON.stringify(DEFAULT_MOCK_ISSUERS));
  return DEFAULT_MOCK_ISSUERS;
}

export function verifyMockCredential(credId, credHash) {
  if (!credId || typeof credId !== 'string') {
    return {
      statusCode: 1, // NotFound
      credentialStatus: 0,
      issuer: ethers.ZeroAddress,
      issuedAt: 0,
      revocationAt: 0,
      details: null,
    };
  }

  const list = getMockCredentials();
  const safeId = credId.trim().toLowerCase();
  const match = list.find((c) => c && c.id && c.id.toLowerCase() === safeId);

  if (!match) {
    return {
      statusCode: 1, // NotFound
      credentialStatus: 0,
      issuer: ethers.ZeroAddress,
      issuedAt: 0,
      revocationAt: 0,
      details: null,
    };
  }

  // Check if hash matches
  if (credHash && typeof credHash === 'string' && credHash.trim() !== '') {
    const safeHash = credHash.trim().toLowerCase();
    if (match.credentialHash && match.credentialHash.toLowerCase() !== safeHash) {
      return {
        statusCode: 4, // HashMismatch
        credentialStatus: match.status,
        issuer: match.issuerAddress,
        issuedAt: match.issuedAt,
        revocationAt: match.revocationAt,
        details: match,
      };
    }
  }

  if (match.status === 2) {
    return {
      statusCode: 5, // Revoked
      credentialStatus: 2,
      issuer: match.issuerAddress,
      issuedAt: match.issuedAt,
      revocationAt: match.revocationAt,
      details: match,
    };
  }

  return {
    statusCode: 0, // Success / Authentic
    credentialStatus: 1,
    issuer: match.issuerAddress,
    issuedAt: match.issuedAt,
    revocationAt: 0,
    details: match,
  };
}
