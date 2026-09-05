import { ethers } from 'ethers';

// Initial pre-loaded verifiable credentials for competition judge testing
const DEFAULT_MOCK_CREDENTIALS = [
  {
    id: '0x8f14b62d3a985e78326a0b47124976cf0e817926b485671d15c1e289bf44901a',
    studentName: 'Elena Rostova',
    studentId: 'ST-2026-9901',
    degree: 'Master of Science in Distributed Systems & Cryptography',
    institution: 'Stanford University School of Engineering',
    issuerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    issuerName: 'Stanford Engineering Registrar',
    issuedAt: Math.floor(Date.now() / 1000) - 86400 * 42,
    revocationAt: 0,
    status: 1, // Active
    gpa: '3.94 / 4.0',
    honors: 'Summa Cum Laude',
    holderCommitment: '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b',
    credentialHash: '0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    txHash: '0x3c7e9a1b5d2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a',
    blockNumber: 14892041,
    gasUsed: '24,118 gas (Stylus WASM)',
  },
  {
    id: '0x4d2e8a7b1c9f0e3d5a6b8c7e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    studentName: 'Marcus Vance',
    studentId: 'MIT-EECS-8820',
    degree: 'Bachelor of Science in Computer Science & AI',
    institution: 'Massachusetts Institute of Technology (MIT)',
    issuerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    issuerName: 'MIT EECS Department',
    issuedAt: Math.floor(Date.now() / 1000) - 86400 * 120,
    revocationAt: 0,
    status: 1, // Active
    gpa: '4.0 / 4.0',
    honors: 'Departmental Distinction',
    holderCommitment: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    credentialHash: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
    txHash: '0x7e9a1b3c5d2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0b',
    blockNumber: 14751890,
    gasUsed: '23,904 gas (Stylus WASM)',
  },
  {
    id: '0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8b',
    studentName: 'Sarah Jenkins',
    studentId: 'OX-LAW-4402',
    degree: 'Bachelor of Civil Law (BCL)',
    institution: 'University of Oxford',
    issuerAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    issuerName: 'Oxford Academic Registrar',
    issuedAt: Math.floor(Date.now() / 1000) - 86400 * 300,
    revocationAt: Math.floor(Date.now() / 1000) - 86400 * 15,
    status: 2, // Revoked
    gpa: 'First Class Honours',
    honors: 'Revoked due to administrative reissuance',
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
    name: 'Massachusetts Institute of Technology (MIT)',
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
    issuerName: 'Stanford Engineering',
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
    issuerName: 'Massachusetts Institute of Technology (MIT)',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
    txHash: '0x5d7e2f8e4a6c0b9d7e1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0c9a1b3c',
    blockNumber: 14420910,
    status: 'ACCREDITED',
  },
];

const STORAGE_KEYS = {
  CREDENTIALS: 'certivault_mock_credentials_v1',
  ACTIVITIES: 'certivault_mock_activities_v1',
  ISSUERS: 'certivault_mock_issuers_v1',
};

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
  const updated = [cred, ...list];
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(updated));

  // Also log to activity
  addMockActivity({
    type: 'CREDENTIAL_ISSUED',
    credId: cred.id,
    issuer: cred.issuerAddress,
    issuerName: cred.institution,
    timestamp: Math.floor(Date.now() / 1000),
    txHash: cred.txHash,
    blockNumber: cred.blockNumber,
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
