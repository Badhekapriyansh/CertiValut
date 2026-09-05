# CertiVault — Arbitrum Stylus Deployment Guide

This guide details the requirements, toolchain configuration, environment setup, deployment steps, verification process, and contract interaction for deploying the **CertiVault** smart contract layer to the **Arbitrum Sepolia Testnet**.

---

## 1. Prerequisites & Toolchain Requirements

| Tool | Recommended Version | Purpose |
|---|---|---|
| **Rust Toolchain** | `1.98.1+` / `stable` | Contract compilation |
| **WASM Target** | `wasm32-unknown-unknown` | Compiling Rust smart contract to WebAssembly |
| **Cargo Stylus CLI** | `cargo-stylus 0.10.x+` | WASM size optimization, checking, and contract deployment |
| **Arbitrum Sepolia RPC** | `https://sepolia-rollup.arbitrum.io/rpc` | Network connectivity |
| **EVM Wallet** | Private key with Arbitrum Sepolia ETH | Deployment gas fees |

---

## 2. Environment Variables Setup

Create a `.env` file in the root directory (never commit private keys to version control):

```bash
# Arbitrum Sepolia RPC Endpoint
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Deployer Wallet Private Key (Hexadecimal, without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Arbiscan API Key for verification
ARBISCAN_API_KEY=your_arbiscan_api_key_here
```

---

## 3. Toolchain & Target Verification Commands

Before deploying, verify that your environment is properly configured:

```powershell
# 1. Verify Rust version
rustc --version

# 2. Add WASM target
rustup target add wasm32-unknown-unknown

# 3. Install cargo-stylus CLI (if not already installed)
cargo install cargo-stylus

# 4. Check Stylus toolchain availability
cargo stylus --version
```

---

## 4. Contract Checking & Optimization

Arbitrum Stylus requires WebAssembly binaries to adhere to strict WASM size limits (typically under 128 KB uncompressed) and valid Stylus entrypoints.

Run the Stylus check command:

```powershell
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

Expected output:
```text
Reading WASM file at target/wasm32-unknown-unknown/release/certivault.wasm
Contract size: 24.2 KB
Stylus check passed! Contract is valid and deployable to Arbitrum Stylus.
```

---

## 5. Contract Deployment Command

Deploy the WASM contract binary to Arbitrum Sepolia Testnet using `cargo stylus deploy`:

```powershell
cargo stylus deploy `
  --endpoint https://sepolia-rollup.arbitrum.io/rpc `
  --private-key $env:PRIVATE_KEY
```

### Expected Output & Address Capture:

```text
Deploying program to Arbitrum Sepolia...
Transaction hash: 0xa1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0
Contract deployed at address: 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
Activation transaction hash: 0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba
Contract successfully activated on Arbitrum Stylus!
```

---

## 6. Contract Initialization (Post-Deployment)

Once deployed, the trust root admin must be set by invoking `init(admin_address)`:

```powershell
# Initialize Admin using cast (Foundry toolchain) or scripts
cast send 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db "init(address)" 0xYourAdminAddress --rpc-url https://sepolia-rollup.arbitrum.io/rpc --private-key $env:PRIVATE_KEY
```

---

## 7. Contract Verification on Arbiscan

Verify contract source code on Arbitrum Sepolia Explorer ([sepolia.arbiscan.io](https://sepolia.arbiscan.io/)):

```powershell
cargo stylus verify `
  --endpoint https://sepolia-rollup.arbitrum.io/rpc `
  --deployment-address 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
```

---

## 8. Command Cheat Sheet

```powershell
# Build WASM binary
cargo build --target wasm32-unknown-unknown --release

# Run automated unit test suite (23 tests)
cargo test

# Validate Stylus WASM binary compatibility
cargo stylus check

# Deploy to Arbitrum Sepolia
cargo stylus deploy --endpoint https://sepolia-rollup.arbitrum.io/rpc --private-key YOUR_PRIVATE_KEY
```
