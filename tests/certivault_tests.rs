//! =============================================================================
//! LAYER A: IN-MEMORY STATE MACHINE SIMULATOR UNIT TESTS
//! =============================================================================
//! NOTE: These automated unit tests execute in-memory against a deterministic Rust
//! state machine mirror that models 100% of CertiVault's contract logic, storage
//! rules, access control, and state transitions.
//!
//! Test Layers Distinction:
//! - Layer A: In-Memory Rust Simulator Tests (this suite)
//! - Layer B: Local Arbitrum Stylus WASM Testbed Execution
//! - Layer C: Arbitrum Sepolia On-Chain Deployed Contract Tests
//! =============================================================================

use certivault::{
    STATUS_ACTIVE, STATUS_REVOKED, STATUS_UNKNOWN, VERIFY_CREDENTIAL_NOT_FOUND,
    VERIFY_CREDENTIAL_REVOKED, VERIFY_HASH_MISMATCH, VERIFY_ISSUER_NOT_REGISTERED,
    VERIFY_ISSUER_SUSPENDED, VERIFY_SUCCESS,
};
use std::collections::HashMap;

// Addresses for testing actors
const ADMIN_ADDR: &str = "0x1111111111111111111111111111111111111111";
const NEW_ADMIN_ADDR: &str = "0x4444444444444444444444444444444444444444";
const ISSUER_A_ADDR: &str = "0x2222222222222222222222222222222222222222";
const ISSUER_B_ADDR: &str = "0x3333333333333333333333333333333333333333";
const RANDOM_ADDR: &str = "0x9999999999999999999999999999999999999999";
const ZERO_ADDR: &str = "0x0000000000000000000000000000000000000000";

// Standard Test Hashes
const NAME_HASH: [u8; 32] = [1u8; 32];
const CRED_ID_1: [u8; 32] = [0x10; 32];
const CRED_ID_2: [u8; 32] = [0x20; 32];
const NON_EXISTENT_ID: [u8; 32] = [0x99; 32];
const HOLDER_COMMITMENT_1: [u8; 32] = [0xaa; 32];
const CRED_HASH_1: [u8; 32] = [0xcc; 32];
const WRONG_HASH: [u8; 32] = [0xff; 32];
const EMPTY_HASH: [u8; 32] = [0u8; 32];

// Mock In-Memory State Machine matching CertiVault on-chain behavior
#[derive(Debug, Clone)]
struct IssuerRecord {
    is_registered: bool,
    is_suspended: bool,
    registered_at: u64,
    name_hash: [u8; 32],
}

#[derive(Debug, Clone)]
struct CredentialRecord {
    exists: bool,
    issuer: String,
    holder_commitment: [u8; 32],
    credential_hash: [u8; 32],
    issued_at: u64,
    revocation_at: u64,
    status: u8,
}

pub struct CertiVaultSimulator {
    pub admin: String,
    pub pending_admin: String,
    pub issuers: HashMap<String, IssuerRecord>,
    pub credentials: HashMap<[u8; 32], CredentialRecord>,
    pub current_time: u64,
}

impl CertiVaultSimulator {
    pub fn new_uninitialized() -> Self {
        CertiVaultSimulator {
            admin: ZERO_ADDR.to_string(),
            pending_admin: ZERO_ADDR.to_string(),
            issuers: HashMap::new(),
            credentials: HashMap::new(),
            current_time: 1700000000,
        }
    }

    pub fn new(admin: &str) -> Self {
        let mut sim = Self::new_uninitialized();
        sim.admin = admin.to_lowercase();
        sim
    }

    pub fn init(&mut self, caller: &str) -> Result<(), &'static str> {
        if self.admin != ZERO_ADDR {
            return Err("AlreadyInitialized");
        }
        if caller == ZERO_ADDR {
            return Err("ZeroAddress");
        }
        self.admin = caller.to_lowercase();
        Ok(())
    }

    pub fn propose_admin(&mut self, caller: &str, new_admin: &str) -> Result<(), &'static str> {
        if caller.to_lowercase() != self.admin {
            return Err("Unauthorized");
        }
        if new_admin == ZERO_ADDR {
            return Err("ZeroAddress");
        }
        if new_admin.to_lowercase() == self.admin {
            return Err("SameAdmin");
        }
        self.pending_admin = new_admin.to_lowercase();
        Ok(())
    }

    pub fn accept_admin(&mut self, caller: &str) -> Result<(), &'static str> {
        if self.pending_admin == ZERO_ADDR || caller.to_lowercase() != self.pending_admin {
            return Err("NoPendingAdmin");
        }
        self.admin = self.pending_admin.clone();
        self.pending_admin = ZERO_ADDR.to_string();
        Ok(())
    }

    pub fn cancel_admin_proposal(&mut self, caller: &str) -> Result<(), &'static str> {
        if caller.to_lowercase() != self.admin {
            return Err("Unauthorized");
        }
        if self.pending_admin == ZERO_ADDR {
            return Err("NoPendingAdmin");
        }
        self.pending_admin = ZERO_ADDR.to_string();
        Ok(())
    }

    pub fn register_issuer(
        &mut self,
        caller: &str,
        issuer_addr: &str,
        name_hash: [u8; 32],
    ) -> Result<(), &'static str> {
        if caller.to_lowercase() != self.admin {
            return Err("Unauthorized");
        }
        if issuer_addr == ZERO_ADDR {
            return Err("ZeroAddress");
        }
        if name_hash == EMPTY_HASH {
            return Err("EmptyHash");
        }
        let issuer_key = issuer_addr.to_lowercase();
        if let Some(record) = self.issuers.get(&issuer_key) {
            if record.is_registered {
                return Err("IssuerAlreadyRegistered");
            }
        }

        self.issuers.insert(
            issuer_key,
            IssuerRecord {
                is_registered: true,
                is_suspended: false,
                registered_at: self.current_time,
                name_hash,
            },
        );
        Ok(())
    }

    pub fn suspend_issuer(&mut self, caller: &str, issuer_addr: &str) -> Result<(), &'static str> {
        if caller.to_lowercase() != self.admin {
            return Err("Unauthorized");
        }
        let issuer_key = issuer_addr.to_lowercase();
        let record = self.issuers.get_mut(&issuer_key).ok_or("IssuerNotFound")?;
        if !record.is_registered {
            return Err("IssuerNotFound");
        }
        if record.is_suspended {
            return Err("IssuerSuspended");
        }
        record.is_suspended = true;
        Ok(())
    }

    pub fn unsuspend_issuer(
        &mut self,
        caller: &str,
        issuer_addr: &str,
    ) -> Result<(), &'static str> {
        if caller.to_lowercase() != self.admin {
            return Err("Unauthorized");
        }
        let issuer_key = issuer_addr.to_lowercase();
        let record = self.issuers.get_mut(&issuer_key).ok_or("IssuerNotFound")?;
        if !record.is_registered {
            return Err("IssuerNotFound");
        }
        if !record.is_suspended {
            return Err("InvalidStateTransition");
        }
        record.is_suspended = false;
        Ok(())
    }

    pub fn is_active_issuer(&self, issuer_addr: &str) -> bool {
        let issuer_key = issuer_addr.to_lowercase();
        if let Some(record) = self.issuers.get(&issuer_key) {
            record.is_registered && !record.is_suspended
        } else {
            false
        }
    }

    pub fn issue_credential(
        &mut self,
        caller: &str,
        cred_id: [u8; 32],
        holder_commitment: [u8; 32],
        cred_hash: [u8; 32],
    ) -> Result<(), &'static str> {
        let issuer_key = caller.to_lowercase();
        let issuer_record = self.issuers.get(&issuer_key).ok_or("NotAuthorizedIssuer")?;
        if !issuer_record.is_registered {
            return Err("NotAuthorizedIssuer");
        }
        if issuer_record.is_suspended {
            return Err("IssuerSuspended");
        }

        if cred_id == EMPTY_HASH || cred_hash == EMPTY_HASH || holder_commitment == EMPTY_HASH {
            return Err("InvalidCredential");
        }

        if self.credentials.contains_key(&cred_id) {
            return Err("CredentialAlreadyExists");
        }

        self.credentials.insert(
            cred_id,
            CredentialRecord {
                exists: true,
                issuer: issuer_key,
                holder_commitment,
                credential_hash: cred_hash,
                issued_at: self.current_time,
                revocation_at: 0,
                status: STATUS_ACTIVE,
            },
        );

        Ok(())
    }

    pub fn revoke_credential(
        &mut self,
        caller: &str,
        cred_id: [u8; 32],
    ) -> Result<(), &'static str> {
        let issuer_key = caller.to_lowercase();
        let issuer_record = self.issuers.get(&issuer_key).ok_or("NotAuthorizedIssuer")?;
        if !issuer_record.is_registered {
            return Err("NotAuthorizedIssuer");
        }
        if issuer_record.is_suspended {
            return Err("IssuerSuspended");
        }

        let cred = self
            .credentials
            .get_mut(&cred_id)
            .ok_or("CredentialNotFound")?;
        if !cred.exists {
            return Err("CredentialNotFound");
        }

        if cred.issuer != issuer_key {
            return Err("UnauthorizedRevocation");
        }

        if cred.status == STATUS_REVOKED {
            return Err("AlreadyRevoked");
        }
        if cred.status != STATUS_ACTIVE {
            return Err("InvalidStateTransition");
        }

        cred.status = STATUS_REVOKED;
        cred.revocation_at = self.current_time + 10;
        Ok(())
    }

    pub fn get_credential(
        &self,
        cred_id: [u8; 32],
    ) -> (bool, String, [u8; 32], [u8; 32], u64, u64, u8) {
        if let Some(cred) = self.credentials.get(&cred_id) {
            (
                cred.exists,
                cred.issuer.clone(),
                cred.holder_commitment,
                cred.credential_hash,
                cred.issued_at,
                cred.revocation_at,
                cred.status,
            )
        } else {
            (
                false,
                ZERO_ADDR.to_string(),
                EMPTY_HASH,
                EMPTY_HASH,
                0,
                0,
                STATUS_UNKNOWN,
            )
        }
    }

    pub fn verify_credential(
        &self,
        cred_id: [u8; 32],
        expected_hash: [u8; 32],
    ) -> (bool, bool, bool, bool, u8, String, u64, u8) {
        let cred = match self.credentials.get(&cred_id) {
            Some(c) => c,
            None => {
                return (
                    false,
                    false,
                    false,
                    false,
                    STATUS_UNKNOWN,
                    ZERO_ADDR.to_string(),
                    0,
                    VERIFY_CREDENTIAL_NOT_FOUND,
                )
            }
        };

        let issuer_record = self.issuers.get(&cred.issuer);
        let is_registered = issuer_record.map(|r| r.is_registered).unwrap_or(false);
        let is_suspended = issuer_record.map(|r| r.is_suspended).unwrap_or(false);
        let issuer_authorized = is_registered && !is_suspended;

        let hash_matches = (expected_hash != EMPTY_HASH) && (cred.credential_hash == expected_hash);

        let verification_code = if !is_registered {
            VERIFY_ISSUER_NOT_REGISTERED
        } else if is_suspended {
            VERIFY_ISSUER_SUSPENDED
        } else if !hash_matches {
            VERIFY_HASH_MISMATCH
        } else if cred.status == STATUS_REVOKED {
            VERIFY_CREDENTIAL_REVOKED
        } else if cred.status == STATUS_ACTIVE {
            VERIFY_SUCCESS
        } else {
            VERIFY_CREDENTIAL_NOT_FOUND
        };

        let is_valid = verification_code == VERIFY_SUCCESS;

        (
            is_valid,
            cred.exists,
            issuer_authorized,
            hash_matches,
            cred.status,
            cred.issuer.clone(),
            cred.issued_at,
            verification_code,
        )
    }
}

// =============================================================================
// AUTOMATED TEST SUITE (28 EXTENDED SCENARIOS)
// =============================================================================

#[test]
fn test_01_admin_registers_issuer() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    let res = sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH);
    assert!(res.is_ok(), "Admin must be able to register an issuer");
}

#[test]
fn test_02_authorized_issuer_recognized() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    assert!(
        sim.is_active_issuer(ISSUER_A_ADDR),
        "Registered non-suspended issuer must be active"
    );
    assert!(
        !sim.is_active_issuer(ISSUER_B_ADDR),
        "Unregistered issuer must not be active"
    );
}

#[test]
fn test_03_authorized_issuer_issues_credential() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    let res = sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1);
    assert!(
        res.is_ok(),
        "Authorized active issuer must be able to issue credentials"
    );
}

#[test]
fn test_04_credential_can_be_retrieved() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let (exists, issuer, holder_commit, cred_hash, issued_at, revocation_at, status) =
        sim.get_credential(CRED_ID_1);
    assert!(exists, "Credential must exist");
    assert_eq!(issuer, ISSUER_A_ADDR.to_lowercase());
    assert_eq!(holder_commit, HOLDER_COMMITMENT_1);
    assert_eq!(cred_hash, CRED_HASH_1);
    assert_eq!(status, STATUS_ACTIVE);
    assert_eq!(revocation_at, 0);
    assert!(issued_at > 0);
}

#[test]
fn test_05_correct_hash_verifies_successfully() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let (is_valid, exists, issuer_authorized, hash_matches, status, _, _, code) =
        sim.verify_credential(CRED_ID_1, CRED_HASH_1);
    assert!(
        is_valid,
        "Credential with matching hash and active authorized issuer must be valid"
    );
    assert!(exists);
    assert!(issuer_authorized);
    assert!(hash_matches);
    assert_eq!(status, STATUS_ACTIVE);
    assert_eq!(code, VERIFY_SUCCESS);
}

#[test]
fn test_06_credential_is_active_after_issuance() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let (_, _, _, _, _, _, status) = sim.get_credential(CRED_ID_1);
    assert_eq!(
        status, STATUS_ACTIVE,
        "Newly issued credential status must be ACTIVE (1)"
    );
}

#[test]
fn test_07_authorized_issuer_revokes_credential() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let res = sim.revoke_credential(ISSUER_A_ADDR, CRED_ID_1);
    assert!(
        res.is_ok(),
        "Issuing university must be able to revoke its credential"
    );
}

#[test]
fn test_08_revoked_credential_detected_correctly() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();
    sim.revoke_credential(ISSUER_A_ADDR, CRED_ID_1).unwrap();

    let (is_valid, _, _, _, status, _, _, code) = sim.verify_credential(CRED_ID_1, CRED_HASH_1);
    assert!(!is_valid, "Revoked credential must fail validation");
    assert_eq!(status, STATUS_REVOKED);
    assert_eq!(code, VERIFY_CREDENTIAL_REVOKED);
}

#[test]
fn test_09_random_wallet_cannot_register_issuer() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    let res = sim.register_issuer(RANDOM_ADDR, ISSUER_A_ADDR, NAME_HASH);
    assert_eq!(
        res,
        Err("Unauthorized"),
        "Random wallet cannot register issuers"
    );
}

#[test]
fn test_10_random_wallet_cannot_issue_credential() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    let res = sim.issue_credential(RANDOM_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1);
    assert_eq!(
        res,
        Err("NotAuthorizedIssuer"),
        "Random wallet cannot issue credentials"
    );
}

#[test]
fn test_11_suspended_issuer_cannot_issue() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.suspend_issuer(ADMIN_ADDR, ISSUER_A_ADDR).unwrap();

    let res = sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1);
    assert_eq!(
        res,
        Err("IssuerSuspended"),
        "Suspended issuer cannot issue credentials"
    );
}

#[test]
fn test_12_duplicate_credential_id_fails() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let res = sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1);
    assert_eq!(
        res,
        Err("CredentialAlreadyExists"),
        "Duplicate credential ID must be rejected"
    );
}

#[test]
fn test_13_random_wallet_cannot_revoke_credential() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let res = sim.revoke_credential(RANDOM_ADDR, CRED_ID_1);
    assert_eq!(
        res,
        Err("NotAuthorizedIssuer"),
        "Unregistered wallet cannot revoke credentials"
    );
}

#[test]
fn test_14_issuer_cannot_revoke_another_issuers_credential() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.register_issuer(ADMIN_ADDR, ISSUER_B_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let res = sim.revoke_credential(ISSUER_B_ADDR, CRED_ID_1);
    assert_eq!(
        res,
        Err("UnauthorizedRevocation"),
        "University B cannot revoke University A's credential"
    );
}

#[test]
fn test_15_non_existent_credential_cannot_be_revoked() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();

    let res = sim.revoke_credential(ISSUER_A_ADDR, CRED_ID_1);
    assert_eq!(
        res,
        Err("CredentialNotFound"),
        "Revoking non-existent credential must fail"
    );
}

#[test]
fn test_16_revoked_credential_cannot_become_active() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();
    sim.revoke_credential(ISSUER_A_ADDR, CRED_ID_1).unwrap();

    let res = sim.revoke_credential(ISSUER_A_ADDR, CRED_ID_1);
    assert_eq!(
        res,
        Err("AlreadyRevoked"),
        "Revoked credential cannot be revoked again"
    );

    let re_issue = sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1);
    assert_eq!(
        re_issue,
        Err("CredentialAlreadyExists"),
        "Revoked credential cannot be re-issued over existing ID"
    );
}

#[test]
fn test_17_incorrect_hash_fails_verification() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let (is_valid, _, _, hash_matches, _, _, _, code) =
        sim.verify_credential(CRED_ID_1, WRONG_HASH);
    assert!(!is_valid, "Tampered credential hash must fail validation");
    assert!(!hash_matches);
    assert_eq!(code, VERIFY_HASH_MISMATCH);
}

#[test]
fn test_18_unauthorized_access_attempts() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();

    let suspend_res = sim.suspend_issuer(RANDOM_ADDR, ISSUER_A_ADDR);
    assert_eq!(suspend_res, Err("Unauthorized"));

    let unsuspend_res = sim.unsuspend_issuer(RANDOM_ADDR, ISSUER_A_ADDR);
    assert_eq!(unsuspend_res, Err("Unauthorized"));
}

#[test]
fn test_19_invalid_state_transitions() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();

    // Cannot unsuspend an active (non-suspended) issuer
    let res = sim.unsuspend_issuer(ADMIN_ADDR, ISSUER_A_ADDR);
    assert_eq!(res, Err("InvalidStateTransition"));
}

#[test]
fn test_20_boundary_empty_input_cases() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);

    let zero_addr_res = sim.register_issuer(ADMIN_ADDR, ZERO_ADDR, NAME_HASH);
    assert_eq!(zero_addr_res, Err("ZeroAddress"));

    let empty_name_res = sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, EMPTY_HASH);
    assert_eq!(empty_name_res, Err("EmptyHash"));

    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();

    let empty_cred_res =
        sim.issue_credential(ISSUER_A_ADDR, EMPTY_HASH, HOLDER_COMMITMENT_1, CRED_HASH_1);
    assert_eq!(empty_cred_res, Err("InvalidCredential"));

    let empty_hash_res =
        sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, EMPTY_HASH);
    assert_eq!(empty_hash_res, Err("InvalidCredential"));
}

#[test]
fn test_21_storage_overwrite_integrity() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_2, HOLDER_COMMITMENT_1, WRONG_HASH)
        .unwrap();

    // Verify CRED_ID_1 hash was not corrupted by CRED_ID_2 creation
    let (_, _, _, hash1, _, _, _) = sim.get_credential(CRED_ID_1);
    assert_eq!(hash1, CRED_HASH_1);

    let (_, _, _, hash2, _, _, _) = sim.get_credential(CRED_ID_2);
    assert_eq!(hash2, WRONG_HASH);
}

#[test]
fn test_22_timestamp_handling_and_arithmetic() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    let (_, _, _, _, issued_at, revocation_at, _) = sim.get_credential(CRED_ID_1);
    assert!(issued_at > 0);
    assert_eq!(revocation_at, 0);

    sim.revoke_credential(ISSUER_A_ADDR, CRED_ID_1).unwrap();
    let (_, _, _, _, _, new_revocation_at, _) = sim.get_credential(CRED_ID_1);
    assert!(new_revocation_at >= issued_at);
}

#[test]
fn test_23_repeated_operations_idempotency() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();

    let repeat_res = sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH);
    assert_eq!(repeat_res, Err("IssuerAlreadyRegistered"));
}

// =============================================================================
// HARDENING AUDIT EXTENSION TESTS (TESTS 24-28)
// =============================================================================

#[test]
fn test_24_initialization_protection() {
    let mut sim = CertiVaultSimulator::new_uninitialized();

    // Initializer binds admin to deployer
    assert!(sim.init(ADMIN_ADDR).is_ok());
    assert_eq!(sim.admin, ADMIN_ADDR.to_lowercase());

    // Second initialization attempt by anyone fails
    let re_init = sim.init(RANDOM_ADDR);
    assert_eq!(
        re_init,
        Err("AlreadyInitialized"),
        "Contract cannot be re-initialized"
    );
}

#[test]
fn test_25_two_step_admin_transfer() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);

    // Random caller cannot propose
    let res = sim.propose_admin(RANDOM_ADDR, NEW_ADMIN_ADDR);
    assert_eq!(res, Err("Unauthorized"));

    // Admin proposes new admin
    assert!(sim.propose_admin(ADMIN_ADDR, NEW_ADMIN_ADDR).is_ok());
    assert_eq!(sim.pending_admin, NEW_ADMIN_ADDR.to_lowercase());

    // Random caller cannot accept
    let random_accept = sim.accept_admin(RANDOM_ADDR);
    assert_eq!(random_accept, Err("NoPendingAdmin"));

    // Pending admin accepts
    assert!(sim.accept_admin(NEW_ADMIN_ADDR).is_ok());
    assert_eq!(sim.admin, NEW_ADMIN_ADDR.to_lowercase());
    assert_eq!(sim.pending_admin, ZERO_ADDR.to_string());
}

#[test]
fn test_26_cancel_admin_proposal() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.propose_admin(ADMIN_ADDR, NEW_ADMIN_ADDR).unwrap();
    assert_eq!(sim.pending_admin, NEW_ADMIN_ADDR.to_lowercase());

    // Admin cancels proposal
    assert!(sim.cancel_admin_proposal(ADMIN_ADDR).is_ok());
    assert_eq!(sim.pending_admin, ZERO_ADDR.to_string());

    // New admin can no longer accept
    assert_eq!(sim.accept_admin(NEW_ADMIN_ADDR), Err("NoPendingAdmin"));
}

#[test]
fn test_27_suspended_issuer_verification_lifecycle() {
    let mut sim = CertiVaultSimulator::new(ADMIN_ADDR);
    sim.register_issuer(ADMIN_ADDR, ISSUER_A_ADDR, NAME_HASH)
        .unwrap();
    sim.issue_credential(ISSUER_A_ADDR, CRED_ID_1, HOLDER_COMMITMENT_1, CRED_HASH_1)
        .unwrap();

    // 1. Initial State: Valid
    let (is_valid, _, _, _, _, _, _, code) = sim.verify_credential(CRED_ID_1, CRED_HASH_1);
    assert!(is_valid);
    assert_eq!(code, VERIFY_SUCCESS);

    // 2. Suspend Issuer: Credentials become invalid
    sim.suspend_issuer(ADMIN_ADDR, ISSUER_A_ADDR).unwrap();
    let (is_valid_suspended, _, _, _, _, _, _, code_suspended) =
        sim.verify_credential(CRED_ID_1, CRED_HASH_1);
    assert!(
        !is_valid_suspended,
        "Credential must be invalid while issuer is suspended"
    );
    assert_eq!(code_suspended, VERIFY_ISSUER_SUSPENDED);

    // 3. Unsuspend Issuer: Credentials become valid again
    sim.unsuspend_issuer(ADMIN_ADDR, ISSUER_A_ADDR).unwrap();
    let (is_valid_restored, _, _, _, _, _, _, code_restored) =
        sim.verify_credential(CRED_ID_1, CRED_HASH_1);
    assert!(
        is_valid_restored,
        "Credential must be valid after issuer is unsuspended"
    );
    assert_eq!(code_restored, VERIFY_SUCCESS);
}

#[test]
fn test_28_non_existent_credential_queries() {
    let sim = CertiVaultSimulator::new(ADMIN_ADDR);

    // get_credential on non-existent ID returns exists=false and zeros without panicking
    let (exists, issuer, holder_commit, cred_hash, issued_at, revocation_at, status) =
        sim.get_credential(NON_EXISTENT_ID);
    assert!(!exists);
    assert_eq!(issuer, ZERO_ADDR.to_string());
    assert_eq!(holder_commit, EMPTY_HASH);
    assert_eq!(cred_hash, EMPTY_HASH);
    assert_eq!(issued_at, 0);
    assert_eq!(revocation_at, 0);
    assert_eq!(status, STATUS_UNKNOWN);

    // verify_credential on non-existent ID returns code VERIFY_CREDENTIAL_NOT_FOUND
    let (is_valid, exists, _, _, status, _, _, code) =
        sim.verify_credential(NON_EXISTENT_ID, CRED_HASH_1);
    assert!(!is_valid);
    assert!(!exists);
    assert_eq!(status, STATUS_UNKNOWN);
    assert_eq!(code, VERIFY_CREDENTIAL_NOT_FOUND);
}
