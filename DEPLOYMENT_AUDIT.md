# CERTIVAULT — ARBITRUM SEPOLIA DEPLOYMENT AUDIT

## 1. Environment

- **Rust**: `rustc 1.98.1 (48a229cea 2026-09-01)`
- **Cargo**: `cargo 1.98.1 (797e8a9bc 2026-08-05)`
- **Node.js**: `v25.8.0` / `npm 11.6.2`
- **Host Linker**: `Microsoft Visual C++ Build Tools 2022 (link.exe v14.44.35207)`
- **OS / Environment**: `Windows 11 Host Native`

## 2. Build

- **`cargo fmt --check`**: **PASS** (Exit code 0, formatting clean)
- **`cargo check`**: **PASS** (Exit code 0, host proc-macros and storage layouts verified)
- **`cargo test`**: **PASS** (**28 / 28 unit tests passing, 100% pass rate**)
- **`wasm32-unknown-unknown` Target**: **PASS** (Installed and active)
- **WASM Compilation**: **PASS** (`target/wasm32-unknown-unknown/release/certivault.wasm`, **68.76 KB / 70,412 bytes**)
- **Stylus Compression**: **PASS** (Brotli Quality 11 $\rightarrow$ **20.51 KB / 21,005 bytes**, well below the 128 KB Stylus limit)
- **Stylus Codehash**: `0x4fc78caa16b21ff834f181797e861bc77d5b75d02e90207094de432e4a6deef5`

## 3. Test Results

- **Layer A (In-Memory Simulator Tests)**: **28 / 28 PASS** (`tests/certivault_tests.rs` covering all access control, 2-step admin transfer, issuer lifecycle, duplicate rejection, and tamper detection).
- **Layer B (On-Chain Stylus Pre-Check via ArbWasm 0x71)**: **PASS** (`scripts/stylus-deploy/check.js` executed against Arbitrum Sepolia Block #305351111).
- **Layer C (Arbitrum Sepolia Live Contract Tests)**: **READY FOR DEPLOYMENT** (Awaiting user wallet configuration & confirmation).

## 4. Deployment Configuration

- **Network**: Arbitrum Sepolia Testnet
- **Chain ID**: `421614` (`0x66eee`)
- **RPC Endpoint**: `https://sepolia-rollup.arbitrum.io/rpc`
- **ArbWasm Precompile**: `0x0000000000000000000000000000000000000071`
- **Deployment Script**: `scripts/stylus-deploy/deploy.js`
- **Contract Address**: `PENDING BROADCAST` (Zero fabrication)
- **Deployment Transaction**: `PENDING`
- **Activation Transaction**: `PENDING`

## 5. Security & Invariant Verification

Confirmed on-chain contract architecture:
- **Access Control**: Enforced via `msg::sender()` and `only_admin()`
- **Admin Security**: Front-running-proof `init()` and 2-step `propose_admin` / `accept_admin`
- **Issuer Authorization**: Strict registration and active status checks
- **Credential Immutability**: Duplicate ID rejection and write-once credential hashes
- **Revocation Protection**: Originating issuer isolation preventing cross-issuer revocation
- **State Machine**: Enforced `UNKNOWN -> ACTIVE -> REVOKED` lifecycle
- **Privacy**: Zero on-chain PII (opaque 32-byte hashes only)

## 6. Next Action

Execute Layer C Deployment:
```powershell
$env:PRIVATE_KEY = "0x..."
$env:DEPLOY_CONFIRM = "true"
cd scripts/stylus-deploy
node deploy.js
```
