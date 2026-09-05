# CertiVault — Institution-Issued Verifiable Academic Credentials

> **Trust-Critical Smart Contract Layer on Arbitrum Stylus (Rust/WASM)**

CertiVault provides a tamper-resistant, public verification infrastructure for academic credentials issued by authorized educational institutions. Built with **Arbitrum Stylus** and high-performance **Rust smart contracts**, CertiVault allows employers and third-party verifiers to independently confirm the validity, authenticity, issuer authorization, and lifecycle status of university-issued degrees without relying on central databases, manual emails, or proprietary vendor silos.

---

## 1. Problem Statement

Academic credential fraud and manual verification overhead are widespread global challenges:
- **Centralized Silos**: Universities maintain disparate, proprietary databases that require costly manual API integrations or email verification.
- **Credential Tampering**: Physical or PDF certificates are easily falsified using modern editing software.
- **Privacy Vulnerabilities**: Traditional verification systems often expose raw Personally Identifiable Information (PII) to third parties.
- **Lack of Independent Revocation**: When an institution revokes a credential due to academic misconduct or administrative error, verifiers rarely receive real-time updates.

---

## 2. The CertiVault Solution

CertiVault replaces centralized verification databases with a high-throughput, low-cost Arbitrum Stylus smart contract layer:

```text
  [ University / Issuer ]
            │
            ▼ (issues credential commitment)
┌─────────────────────────────────────────────────────────────┐
│             Arbitrum Stylus Smart Contract                   │
│  - Issuer Registry (Admin trust root)                        │
│  - Credential Lifecycle (ACTIVE / REVOKED)                  │
│  - Privacy-preserving cryptographic commitments (bytes32)   │
│  - Two-Step Admin Governance (propose_admin / accept_admin) │
└─────────────────────────────────────────────────────────────┘
            ▲
            │ (verifies independently via read-only call)
  [ Verifier / Employer ]
```

---

## 3. Core Actors

| Actor | Role | Key Capabilities |
|---|---|---|
| **Admin / Trust Root** | Contract Governance | Registers & suspends/unsuspends educational institutions; manages 2-step admin transfer (`propose_admin` / `accept_admin`). |
| **University / Issuer** | Authorized Issuer | Issues cryptographic credential commitments; revokes credentials it legitimately issued. |
| **Verifier / Employer** | Public Consumer | Performs instant, permissionless, read-only credential verification. |
| **Student / Holder** | Credential Recipient | Receives off-chain certificate; presents hash & credential ID to verifiers. |

---

## 4. Honest Trust Model

> [!IMPORTANT]
> **What Blockchain DOES Provide**:
> - Tamper-resistant, immutable record of credential commitments and timestamps.
> - Trustless, permissionless public verification accessible 24/7 without API fees or permission.
> - Smart-contract-enforced access control, two-step admin transfer, and credential lifecycle state transitions.
> - Auditable log of institution registration and credential revocations.
>
> **What Blockchain DOES NOT Provide**:
> - Proof that a university is legally accredited (issuer authorization is explicitly handled via the Admin / Trust Root).
> - Real-world Identity / KYC of student holders.
> - Protection against compromised university private keys (mitigated by admin suspension capabilities).
> - Automatic privacy (achieved by storing zero PII on-chain).

---

## 5. Privacy Guarantees & Off-Chain Commitment Generation

The smart contract stores only opaque 32-byte (`bytes32` / `B256`) digests and performs **zero on-chain PII storage**:

> [!WARNING]
> **Holder Commitment Privacy Notice**:
> The smart contract does **not** generate or mathematically validate holder commitments on-chain.
> The off-chain university portal / frontend **must** generate a privacy-preserving commitment using high entropy:
> 
> $$\text{holder\_commitment} = \text{Keccak256}(\text{StudentIdentifier} \parallel \text{HighEntropySecretSalt})$$
>
> Do **NOT** hash unsalted, low-entropy student IDs (e.g. roll numbers or national IDs), as attackers could precompute rainbow tables to de-anonymize holders.

| Data Element | Storage Location | Representation | Privacy Impact |
|---|---|---|---|
| **Student Name, DOB, Email** | Off-Chain | Retained in university records / student wallet | 100% Private (Zero PII on-chain) |
| **Full Transcript & PDF** | Off-Chain | Rendered in local frontend / client | Zero raw documents on-chain |
| **Holder Commitment** | **On-Chain** | `bytes32` (Cryptographic Hash of Student ID + Salt) | Pseudonymous / Zero-Knowledge ready |
| **Credential Hash** | **On-Chain** | `bytes32` (Opaque 32-byte digest of degree attributes) | Non-invertible cryptographic commitment |
| **Issuer Address** | **On-Chain** | `address` (Authenticated wallet address) | Publicly auditable |
| **Lifecycle Status** | **On-Chain** | `uint8` (`1 = ACTIVE`, `2 = REVOKED`) | Public state machine |
| **Issue Timestamp** | **On-Chain** | `uint64` (Block timestamp) | Immutable event log |

---

## 6. Hash Algorithm Neutrality

> [!NOTE]
> The smart contract does **not** enforce a specific hash algorithm (such as SHA-256 or Keccak-256) on-chain; `credential_hash` is an **opaque 32-byte (`B256`) slot**. The off-chain protocol and canonicalization schema dictate the chosen 256-bit hashing algorithm.

---

## 7. Suspended Issuer Semantics

The contract explicitly defines the following behavior for suspended institutions:
1. **Issuance Block**: A suspended issuer cannot issue new credentials (`issue_credential` reverts with `IssuerSuspended`).
2. **Revocation Block**: A suspended issuer cannot revoke existing credentials (`revoke_credential` reverts with `IssuerSuspended`).
3. **Verification Invalidation**: When an issuer is suspended by the Trust Root admin, all credentials previously issued by that institution fail verification with code `VERIFY_ISSUER_SUSPENDED (3)` and `is_valid == false`.
4. **Restoration**: If the Trust Root unsuspends the issuer via `unsuspend_issuer()`, all active credentials issued by that institution immediately become valid again.

---

## 8. Smart Contract Architecture & Functions

### Governance & Initialization
- `init()`: Binds initial admin directly to `msg::sender()` (deployer). Callable only once when `admin == Address::ZERO`.
- `init_with_admin(initial_admin: Address)`: Binds initial admin to specified address. Callable only once.
- `propose_admin(new_admin: Address)`: Proposes a new admin (Step 1 of 2-step transfer).
- `accept_admin()`: Designee accepts admin role (Step 2 of 2-step transfer).
- `cancel_admin_proposal()`: Admin cancels pending proposal.
- `get_admin()` & `get_pending_admin()`: Reads governance addresses.

### Issuer Registry Functions
- `register_issuer(issuer: Address, name_hash: B256)`: Admin-only university registration.
- `suspend_issuer(issuer: Address)`: Admin-only institution suspension.
- `unsuspend_issuer(issuer: Address)`: Admin-only institution reinstatement.
- `get_issuer(issuer: Address)` & `is_active_issuer(issuer: Address)`: Public query functions.

### Credential Lifecycle Functions
- `issue_credential(credential_id: B256, holder_commitment: B256, credential_hash: B256)`: Issues new credential (Active issuer only, caller is bound as issuer).
- `revoke_credential(credential_id: B256)`: Revokes issued credential (Original issuing university only).

### Verification & Query Functions
- `get_credential(credential_id: B256)`: Returns raw tuple `(exists, issuer, holder_commitment, credential_hash, issued_at, revocation_at, status)`.
- `verify_credential(credential_id: B256, expected_hash: B256)`: Read-only query returning `(is_valid, exists, issuer_authorized, hash_matches, status, issuer, issued_at, verification_code)`.

---

## 9. Alignment with W3C Verifiable Credentials

CertiVault is an **on-chain credential commitment, status, and revocation registry** designed to support future W3C Verifiable Credential integration:
- Acts as a decentralized **StatusList / Status Registry** for off-chain W3C VC JSON-LD documents.
- `credential_hash` maps to the canonical SHA-256 / Keccak-256 digest of the off-chain credential payload.
- `holder_commitment` maps to the holder's decentralized identifier (DID) commitment.

---

## 10. Automated Testing Hierarchy

- **Layer A (In-Memory Simulator)**: 28 automated test scenarios in [`tests/certivault_tests.rs`](file:///d:/CollageStuff/Arbitrum%20project/tests/certivault_tests.rs) testing storage models, state machine transitions, access control, and edge cases.
- **Layer B (Stylus Local Testbed)**: Local WASM compilation and Stylus VM check.
- **Layer C (Arbitrum Sepolia On-Chain)**: Live contract testing post-deployment.
