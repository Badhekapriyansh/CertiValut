import { ethers } from 'ethers';
import {
  NETWORK_CONFIG,
  CERTIVAULT_CONTRACT_ADDRESS,
  IS_CONTRACT_CONFIGURED,
  CERTIVAULT_ABI,
} from '../config/contracts';

// Fallback Read-Only Provider (Allows public verification with NO wallet connected!)
const readOnlyProvider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);

function getReadOnlyContract() {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error('CertiVault contract address is not configured. Please set VITE_CERTIVAULT_CONTRACT_ADDRESS.');
  }
  return new ethers.Contract(CERTIVAULT_CONTRACT_ADDRESS, CERTIVAULT_ABI, readOnlyProvider);
}

function getSignerContract(signer) {
  if (!IS_CONTRACT_CONFIGURED) {
    throw new Error('CertiVault contract address is not configured. Please set VITE_CERTIVAULT_CONTRACT_ADDRESS.');
  }
  if (!signer) {
    throw new Error('Wallet signer is required for this transaction.');
  }
  return new ethers.Contract(CERTIVAULT_CONTRACT_ADDRESS, CERTIVAULT_ABI, signer);
}

// ==========================================
// 1. READ-ONLY OPERATIONS (Public Queries)
// ==========================================

export async function getAdmin() {
  const contract = getReadOnlyContract();
  return await contract.admin();
}

export async function getPendingAdmin() {
  const contract = getReadOnlyContract();
  return await contract.pendingAdmin();
}

export async function getIssuer(issuerAddress) {
  const contract = getReadOnlyContract();
  const res = await contract.getIssuer(issuerAddress);
  return {
    exists: res[0],
    isSuspended: res[1],
    registeredAt: Number(res[2]),
    nameHash: res[3],
  };
}

export async function isIssuerActive(issuerAddress) {
  const contract = getReadOnlyContract();
  return await contract.isIssuerActive(issuerAddress);
}

export async function getCredential(credId) {
  const contract = getReadOnlyContract();
  const res = await contract.getCredential(credId);
  return {
    exists: res[0],
    issuer: res[1],
    holderCommitment: res[2],
    credentialHash: res[3],
    issuedAt: Number(res[4]),
    revocationAt: Number(res[5]),
    status: Number(res[6]), // 0: Unknown, 1: Active, 2: Revoked
  };
}

export async function verifyCredential(credId, credHash) {
  const contract = getReadOnlyContract();
  const res = await contract.verifyCredential(credId, credHash);
  return {
    statusCode: Number(res[0]), // 0: Success, 1: NotFound, 2: IssuerNotReg, 3: IssuerSuspended, 4: HashMismatch, 5: Revoked
    credentialStatus: Number(res[1]),
    issuer: res[2],
    issuedAt: Number(res[3]),
    revocationAt: Number(res[4]),
  };
}

// ==========================================
// 2. TRANSACTION OPERATIONS (Requires Wallet)
// ==========================================

export async function registerIssuer(signer, issuerAddress, nameHash) {
  const contract = getSignerContract(signer);
  const tx = await contract.registerIssuer(issuerAddress, nameHash);
  return await tx.wait();
}

export async function suspendIssuer(signer, issuerAddress) {
  const contract = getSignerContract(signer);
  const tx = await contract.suspendIssuer(issuerAddress);
  return await tx.wait();
}

export async function unsuspendIssuer(signer, issuerAddress) {
  const contract = getSignerContract(signer);
  const tx = await contract.unsuspendIssuer(issuerAddress);
  return await tx.wait();
}

export async function proposeAdmin(signer, newAdminAddress) {
  const contract = getSignerContract(signer);
  const tx = await contract.proposeAdmin(newAdminAddress);
  return await tx.wait();
}

export async function acceptAdmin(signer) {
  const contract = getSignerContract(signer);
  const tx = await contract.acceptAdmin();
  return await tx.wait();
}

export async function cancelAdminProposal(signer) {
  const contract = getSignerContract(signer);
  const tx = await contract.cancelAdminProposal();
  return await tx.wait();
}

export async function issueCredential(signer, credId, holderCommitment, credHash) {
  const contract = getSignerContract(signer);
  const tx = await contract.issueCredential(credId, holderCommitment, credHash);
  return await tx.wait();
}

export async function revokeCredential(signer, credId) {
  const contract = getSignerContract(signer);
  const tx = await contract.revokeCredential(credId);
  return await tx.wait();
}

// ==========================================
// 3. CRYPTOGRAPHIC HELPERS
// ==========================================

export function computeSha256(data) {
  return ethers.sha256(typeof data === 'string' ? ethers.toUtf8Bytes(data) : data);
}

export function computeKeccak256(data) {
  return ethers.keccak256(typeof data === 'string' ? ethers.toUtf8Bytes(data) : data);
}

export function generateCredentialId(institutionId, studentIdentifier, degreeName, year) {
  const rawString = `${institutionId.toLowerCase()}:${studentIdentifier.toLowerCase()}:${degreeName.toLowerCase()}:${year}`;
  return ethers.keccak256(ethers.toUtf8Bytes(rawString));
}

export function generateHolderCommitment(studentSecret, studentSalt) {
  const rawString = `${studentSecret}:${studentSalt}`;
  return ethers.keccak256(ethers.toUtf8Bytes(rawString));
}
