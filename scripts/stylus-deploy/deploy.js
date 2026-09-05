require('dotenv').config();
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { ethers } = require('ethers');
const { normalizeWasmFile } = require('./wasm-normalizer');

// Stylus & Network Constants
const ARBITRUM_SEPOLIA_CHAIN_ID = 421614n;
const ARBWASM_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000000071';
const STYLUS_MAGIC_HEADER = Buffer.from([0xef, 0xf0, 0x00, 0x00]);
const DEFAULT_RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';

// ArbWasm ABI
const ARBWASM_ABI = [
  'function activateProgram(address program) external payable returns (uint16 version, uint256 actualDataFee)',
  'function codehashVersion(bytes32 codehash) external view returns (uint16 version)',
  'function programVersion(address program) external view returns (uint16 version)'
];

// CertiVault Contract ABI for post-deployment smoke tests
const CERTIVAULT_ABI = [
  'function init() external',
  'function admin() external view returns (address)',
  'function pendingAdmin() external view returns (address)',
  'function registerIssuer(address issuer, bytes32 nameHash) external',
  'function suspendIssuer(address issuer) external',
  'function unsuspendIssuer(address issuer) external',
  'function getIssuer(address issuer) external view returns (bool exists, bool isSuspended, uint64 registeredAt, bytes32 nameHash)',
  'function isIssuerActive(address issuer) external view returns (bool)',
  'function issueCredential(bytes32 credId, bytes32 holderCommitment, bytes32 credHash) external',
  'function revokeCredential(bytes32 credId) external',
  'function getCredential(bytes32 credId) external view returns (bool exists, address issuer, bytes32 holderCommitment, bytes32 credHash, uint64 issuedAt, uint64 revocationAt, uint8 status)',
  'function verifyCredential(bytes32 credId, bytes32 credHash) external view returns (uint8 statusCode, uint8 credentialStatus, address issuer, uint64 issuedAt, uint64 revocationAt)'
];

async function main() {
  console.log('====================================================');
  console.log('  CERTIVAULT — ARBITRUM SEPOLIA STYLUS DEPLOYMENT   ');
  console.log('====================================================\n');

  const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL || DEFAULT_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable is missing.');
    console.error('Please set $env:PRIVATE_KEY or provide it in a local .env file.');
    process.exit(1);
  }

  // 1. Connect and validate network
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const network = await provider.getNetwork();
  console.log(`[1/6] Validating Network Connection...`);
  console.log(`      Network:       Arbitrum Sepolia`);
  console.log(`      Chain ID:      ${network.chainId}`);
  console.log(`      Deployer:      ${wallet.address}`);

  if (network.chainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
    console.error(`❌ ERROR: Connected to Chain ID ${network.chainId}. DEPLOYMENT ONLY PERMITTED ON ARBITRUM SEPOLIA (421614).`);
    process.exit(1);
  }

  const balance = await provider.getBalance(wallet.address);
  console.log(`      Wallet Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error('❌ ERROR: Deployer wallet has 0 ETH. Please fund your wallet with Arbitrum Sepolia testnet ETH.');
    process.exit(1);
  }

  // 2. Read and compress WASM
  const wasmPath = path.resolve(__dirname, '../../target/wasm32-unknown-unknown/release/certivault.wasm');
  if (!fs.existsSync(wasmPath)) {
    console.error(`❌ ERROR: WASM file not found at ${wasmPath}`);
    process.exit(1);
  }

  const rawWasm = normalizeWasmFile(wasmPath);
  const wasmSize = rawWasm.length;
  const wasmHash = '0x' + crypto.createHash('sha256').update(rawWasm).digest('hex');

  console.log(`\n[2/6] Preparing Stylus WASM Payload...`);
  console.log(`      Raw WASM Size:  ${(wasmSize / 1024).toFixed(2)} KB (${wasmSize} bytes)`);
  console.log(`      Raw WASM Hash:  ${wasmHash}`);

  const compressedWasm = zlib.brotliCompressSync(rawWasm, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC
    }
  });

  const stylusBytecode = Buffer.concat([STYLUS_MAGIC_HEADER, compressedWasm]);
  const compressedSize = stylusBytecode.length;
  const codehash = '0x' + crypto.createHash('sha256').update(stylusBytecode).digest('hex');

  console.log(`      Compressed Size: ${(compressedSize / 1024).toFixed(2)} KB (${compressedSize} bytes)`);
  console.log(`      Stylus Codehash: ${codehash}`);

  // 3. Safety Confirmation Gate
  console.log(`\n[3/6] Checking Deployment Confirmation Gate...`);
  if (process.env.DEPLOY_CONFIRM !== 'true') {
    console.log('⚠️  DEPLOY_CONFIRM is not set to "true".');
    console.log('    Pre-flight checks passed, but NO transactions were broadcast.');
    console.log('    To execute live deployment, run with: DEPLOY_CONFIRM=true node deploy.js');
    process.exit(0);
  }
  console.log('      Confirmation Gate: DEPLOY_CONFIRM=true ✅ Confirmed');

  // 4. Construct EVM creation bytecode & deploy
  console.log(`\n[4/6] Broadcasting Contract Creation Transaction to Arbitrum Sepolia...`);

  // Standard EVM constructor preamble that copies runtime bytecode to memory and returns it
  // Opcode sequence: PUSH2 len, PUSH1 0x0e, PUSH1 0x00, CODECOPY, PUSH2 len, PUSH1 0x00, RETURN
  const len = stylusBytecode.length;
  const lenHi = (len >> 8) & 0xff;
  const lenLo = len & 0xff;
  const preamble = Buffer.from([0x61, lenHi, lenLo, 0x60, 0x0e, 0x60, 0x00, 0x39, 0x61, lenHi, lenLo, 0x60, 0x00, 0xf3]);
  const initcode = Buffer.concat([preamble, stylusBytecode]);

  const deployTx = await wallet.sendTransaction({
    data: '0x' + initcode.toString('hex')
  });

  console.log(`      Deployment Tx Sent: ${deployTx.hash}`);
  console.log(`      Waiting for block confirmation...`);
  const deployReceipt = await deployTx.wait();

  const contractAddress = deployReceipt.contractAddress;
  console.log(`      ✅ Contract Created at: ${contractAddress}`);
  console.log(`      Block Number:           ${deployReceipt.blockNumber}`);
  console.log(`      Gas Used:               ${deployReceipt.gasUsed.toString()}`);

  // 5. Activate with ArbWasm precompile (0x71)
  console.log(`\n[5/6] Activating Stylus Program via ArbWasm Precompile (0x71)...`);
  const arbWasm = new ethers.Contract(ARBWASM_PRECOMPILE_ADDRESS, ARBWASM_ABI, wallet);

  const activateTx = await arbWasm.activateProgram(contractAddress, {
    value: ethers.parseEther('0.0002') // Data fee deposit (unused refunded)
  });

  console.log(`      Activation Tx Sent: ${activateTx.hash}`);
  console.log(`      Waiting for activation confirmation...`);
  const activateReceipt = await activateTx.wait();

  console.log(`      ✅ Activation Confirmed in Block: ${activateReceipt.blockNumber}`);

  // Verify activation version
  const programVersion = await arbWasm.programVersion(contractAddress);
  console.log(`      Stylus Program Version:           ${programVersion}`);

  // 6. Post-Deployment Smoke Tests (Synthetic Data Only)
  console.log(`\n[6/6] Executing Post-Deployment Smoke Tests (Synthetic Data Only)...`);
  const certivault = new ethers.Contract(contractAddress, CERTIVAULT_ABI, wallet);

  // Test 1: Admin Initialization & Check
  console.log(`      [Test 1] Initializing Contract Admin to Deployer: ${wallet.address}...`);
  const initTx = await certivault.init();
  await initTx.wait();
  const currentAdmin = await certivault.admin();
  console.log(`               Admin Address: ${currentAdmin} (Expected: ${wallet.address})`);
  if (currentAdmin.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Admin mismatch: expected ${wallet.address}, got ${currentAdmin}`);
  }
  console.log(`               ✅ PASS`);

  // Test 2: Register Synthetic Issuer
  const syntheticIssuer = ethers.Wallet.createRandom().address;
  const syntheticNameHash = ethers.id('SYNTHETIC_TEST_UNIVERSITY');
  console.log(`      [Test 2] Registering Synthetic Issuer: ${syntheticIssuer}...`);
  const regTx = await certivault.registerIssuer(syntheticIssuer, syntheticNameHash);
  await regTx.wait();
  const issuerActive = await certivault.isIssuerActive(syntheticIssuer);
  if (!issuerActive) throw new Error('Issuer registration failed to activate issuer');
  console.log(`               ✅ PASS (Issuer is Active)`);

  // Test 3: Synthetic Credential Issuance
  const syntheticCredId = ethers.id('SYNTHETIC_CRED_ID_001');
  const syntheticHolder = ethers.id('SYNTHETIC_HOLDER_COMMITMENT');
  const syntheticCredHash = ethers.id('SYNTHETIC_CERTIFICATE_HASH_VALID');
  console.log(`      [Test 3] Issuing Synthetic Credential: ${syntheticCredId.slice(0, 18)}...`);

  // Note: Only issuer can issue credentials; wallet is admin, let's register wallet as an issuer for test issuance
  const walletNameHash = ethers.id('DEPLOYER_TEST_ISSUER');
  const regWalletTx = await certivault.registerIssuer(wallet.address, walletNameHash);
  await regWalletTx.wait();

  const issueTx = await certivault.issueCredential(syntheticCredId, syntheticHolder, syntheticCredHash);
  await issueTx.wait();
  console.log(`               ✅ PASS (Credential Issued)`);

  // Test 4: Retrieve Credential
  const credRecord = await certivault.getCredential(syntheticCredId);
  if (!credRecord.exists || credRecord.status !== 1) {
    throw new Error('Credential record status is not ACTIVE');
  }
  console.log(`      [Test 4] Credential Record Retrieved (Status: ACTIVE=1)`);
  console.log(`               ✅ PASS`);

  // Test 5: Verify Valid Hash
  const verifyValid = await certivault.verifyCredential(syntheticCredId, syntheticCredHash);
  if (verifyValid.statusCode !== 0) {
    throw new Error(`Expected VERIFY_SUCCESS (0), got status code ${verifyValid.statusCode}`);
  }
  console.log(`      [Test 5] Valid Hash Verification (Result: VERIFY_SUCCESS=0)`);
  console.log(`               ✅ PASS`);

  // Test 6: Verify Invalid Hash (Tamper Detection)
  const bogusHash = ethers.id('TAMPERED_INVALID_HASH');
  const verifyInvalid = await certivault.verifyCredential(syntheticCredId, bogusHash);
  if (verifyInvalid.statusCode !== 4) {
    throw new Error(`Expected VERIFY_HASH_MISMATCH (4), got status code ${verifyInvalid.statusCode}`);
  }
  console.log(`      [Test 6] Tampered Hash Verification (Result: VERIFY_HASH_MISMATCH=4)`);
  console.log(`               ✅ PASS`);

  // Test 7: Revoke Credential
  const revokeTx = await certivault.revokeCredential(syntheticCredId);
  await revokeTx.wait();
  const verifyRevoked = await certivault.verifyCredential(syntheticCredId, syntheticCredHash);
  if (verifyRevoked.statusCode !== 5) {
    throw new Error(`Expected VERIFY_CREDENTIAL_REVOKED (5), got status code ${verifyRevoked.statusCode}`);
  }
  console.log(`      [Test 7] Revoked Credential Verification (Result: VERIFY_CREDENTIAL_REVOKED=5)`);
  console.log(`               ✅ PASS`);

  // Summary Report
  const summary = {
    network: 'Arbitrum Sepolia',
    chainId: Number(network.chainId),
    contractAddress,
    deployerAddress: wallet.address,
    adminAddress: currentAdmin,
    deploymentTxHash: deployReceipt.hash,
    activationTxHash: activateReceipt.hash,
    deploymentBlock: deployReceipt.blockNumber,
    activationBlock: activateReceipt.blockNumber,
    stylusProgramVersion: Number(programVersion),
    wasmSize,
    compressedSize,
    wasmHash,
    codehash,
    explorerUrl: `https://sepolia.arbiscan.io/address/${contractAddress}`,
    deployedAt: new Date().toISOString(),
    smokeTests: '7/7 PASSED'
  };

  const summaryPath = path.resolve(__dirname, 'deployment-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n====================================================');
  console.log('  CERTIVAULT DEPLOYMENT & SMOKE TESTS: SUCCESS       ');
  console.log('====================================================');
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Explorer Link:    https://sepolia.arbiscan.io/address/${contractAddress}`);
  console.log(`  Summary saved to: ${summaryPath}\n`);
}

main().catch((err) => {
  console.error('\n❌ Deployment Failed:', err);
  process.exit(1);
});
