require('dotenv').config();
const { ethers } = require('ethers');

// Exact Solidity ABI corresponding to Stylus camelCase exports
const CERTIVAULT_ABI = [
  'function init() external',
  'function getAdmin() external view returns (address)',
  'function getPendingAdmin() external view returns (address)',
  'function proposeAdmin(address newAdmin) external',
  'function acceptAdmin() external',
  'function cancelAdminProposal() external',
  'function registerIssuer(address issuer, bytes32 nameHash) external',
  'function suspendIssuer(address issuer) external',
  'function unsuspendIssuer(address issuer) external',
  'function getIssuer(address issuer) external view returns (bool isRegistered, bool isSuspended, uint64 registeredAt, bytes32 nameHash)',
  'function isActiveIssuer(address issuer) external view returns (bool)',
  'function issueCredential(bytes32 credentialId, bytes32 holderCommitment, bytes32 credentialHash) external',
  'function revokeCredential(bytes32 credentialId) external',
  'function getCredential(bytes32 credentialId) external view returns (bool exists, address issuer, bytes32 holderCommitment, bytes32 credentialHash, uint64 issuedAt, uint64 revocationAt, uint8 status)',
  'function verifyCredential(bytes32 credentialId, bytes32 expectedHash) external view returns (bool isValid, bool exists, bool issuerAuthorized, bool hashMatches, uint8 status, address issuer, uint64 issuedAt, uint8 statusCode)'
];

const CONTRACT_ADDRESS = '0xA8a54058659c3f11DF09BF4752e77c823fEF71F0';

async function runSmokeTests() {
  console.log('====================================================');
  console.log('  CERTIVAULT — LIVE ARBITRUM SEPOLIA SMOKE TESTS     ');
  console.log('====================================================\n');

  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CERTIVAULT_ABI, wallet);

  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('Deployer Wallet: ', wallet.address);

  // 1. Verify Admin
  console.log('\n[1/6] Verifying Admin State...');
  const admin = await contract.getAdmin();
  console.log('      Admin Address:', admin);
  if (admin.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error('Admin address does not match deployer');
  }
  console.log('      ✅ PASS');

  // 2. Register Issuer (Register the deployer wallet as an authorized issuer)
  console.log('\n[2/6] Registering Deployer as Accredited Issuer...');
  const nameHash = ethers.id('STANFORD_UNIVERSITY_ENGINEERING');
  const regTx = await contract.registerIssuer(wallet.address, nameHash);
  console.log('      Register Issuer Tx Sent:', regTx.hash);
  const regReceipt = await regTx.wait();
  console.log('      Confirmed in Block:', regReceipt.blockNumber);
  
  const isActive = await contract.isActiveIssuer(wallet.address);
  const issuerInfo = await contract.getIssuer(wallet.address);
  console.log('      Issuer Active Status:', isActive);
  console.log('      Issuer Record:', {
    isRegistered: issuerInfo[0],
    isSuspended: issuerInfo[1],
    registeredAt: Number(issuerInfo[2]),
    nameHash: issuerInfo[3]
  });
  if (!isActive) throw new Error('Issuer is not active after registration');
  console.log('      ✅ PASS');

  // 3. Issue Credential
  console.log('\n[3/6] Issuing Live Verifiable Credential...');
  const credId = ethers.id('CRED_STANFORD_CS_2026_001');
  const holderCommitment = ethers.id('HOLDER_SECRET_SALT_COMMITMENT_123');
  const credHash = ethers.id('OFFICIAL_CERTIFICATE_DOCUMENT_HASH_V1');

  const issueTx = await contract.issueCredential(credId, holderCommitment, credHash);
  console.log('      Issue Credential Tx Sent:', issueTx.hash);
  const issueReceipt = await issueTx.wait();
  console.log('      Confirmed in Block:', issueReceipt.blockNumber);

  const credRecord = await contract.getCredential(credId);
  console.log('      Credential On-Chain Record:', {
    exists: credRecord[0],
    issuer: credRecord[1],
    holderCommitment: credRecord[2],
    credentialHash: credRecord[3],
    issuedAt: Number(credRecord[4]),
    revocationAt: Number(credRecord[5]),
    status: Number(credRecord[6])
  });
  if (!credRecord[0] || Number(credRecord[6]) !== 1) {
    throw new Error('Credential not properly recorded as ACTIVE');
  }
  console.log('      ✅ PASS');

  // 4. Verify Valid Credential
  console.log('\n[4/6] Verifying Credential with Valid Hash...');
  const verifyResult = await contract.verifyCredential(credId, credHash);
  console.log('      Verification Result:', {
    isValid: verifyResult[0],
    exists: verifyResult[1],
    issuerAuthorized: verifyResult[2],
    hashMatches: verifyResult[3],
    status: Number(verifyResult[4]),
    issuer: verifyResult[5],
    issuedAt: Number(verifyResult[6]),
    statusCode: Number(verifyResult[7])
  });
  if (!verifyResult[0] || Number(verifyResult[7]) !== 0) {
    throw new Error('Expected verification to succeed with code 0');
  }
  console.log('      ✅ PASS (VERIFY_SUCCESS = 0)');

  // 5. Verify Tampered Hash (Tamper Detection)
  console.log('\n[5/6] Verifying Tampered/Altered Credential Hash...');
  const tamperedHash = ethers.id('TAMPERED_MODIFIED_DOCUMENT_HASH');
  const verifyTampered = await contract.verifyCredential(credId, tamperedHash);
  console.log('      Tampered Verification Result:', {
    isValid: verifyTampered[0],
    statusCode: Number(verifyTampered[7])
  });
  if (verifyTampered[0] || Number(verifyTampered[7]) !== 4) {
    throw new Error('Expected verification to detect hash mismatch with code 4');
  }
  console.log('      ✅ PASS (VERIFY_HASH_MISMATCH = 4)');

  // 6. Revoke Credential & Verify Revocation
  console.log('\n[6/6] Revoking Credential & Verifying Revoked Status...');
  const revokeTx = await contract.revokeCredential(credId);
  console.log('      Revoke Credential Tx Sent:', revokeTx.hash);
  const revokeReceipt = await revokeTx.wait();
  console.log('      Confirmed in Block:', revokeReceipt.blockNumber);

  const verifyRevoked = await contract.verifyCredential(credId, credHash);
  console.log('      Revoked Verification Result:', {
    isValid: verifyRevoked[0],
    status: Number(verifyRevoked[4]),
    statusCode: Number(verifyRevoked[7])
  });
  if (verifyRevoked[0] || Number(verifyRevoked[7]) !== 5) {
    throw new Error('Expected verification to return VERIFY_CREDENTIAL_REVOKED (5)');
  }
  console.log('      ✅ PASS (VERIFY_CREDENTIAL_REVOKED = 5)');

  // Final Balance
  const finalBal = await provider.getBalance(wallet.address);
  console.log('\n====================================================');
  console.log('  ALL LIVE SMOKE TESTS COMPLETED SUCCESSFULLY!       ');
  console.log('====================================================');
  console.log('  Contract Address:       ', CONTRACT_ADDRESS);
  console.log('  Deployment Tx:           0xc10f9d541c392de6239ff6944f9eb3269dfccb603635ee982fd20e0a2b9d9865');
  console.log('  Activation Tx:           0xd2148666fd90018a0aac576e4d8f8293b9bbd211af8f6cc176a04707a2e13c20');
  console.log('  Init Tx:                 0xf17e65b8b868137e8259bc26d036aeffb17334f3742ebc2e574f432fe9570e81');
  console.log('  Register Issuer Tx:     ', regTx.hash);
  console.log('  Issue Credential Tx:    ', issueTx.hash);
  console.log('  Revoke Credential Tx:   ', revokeTx.hash);
  console.log('  Final Wallet Balance:   ', ethers.formatEther(finalBal), 'ETH');
  console.log('====================================================\n');
}

runSmokeTests().catch((err) => {
  console.error('\n❌ Smoke Tests Failed:', err);
  process.exit(1);
});
