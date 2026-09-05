#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{
    alloy_primitives::{Address, B256, Uint},
    alloy_sol_types::sol,
    block, msg,
    prelude::*,
};


// Credential Lifecycle Status Constants
pub const STATUS_UNKNOWN: u8 = 0;
pub const STATUS_ACTIVE: u8 = 1;
pub const STATUS_REVOKED: u8 = 2;

// Verification Status Codes
pub const VERIFY_SUCCESS: u8 = 0;
pub const VERIFY_CREDENTIAL_NOT_FOUND: u8 = 1;
pub const VERIFY_ISSUER_NOT_REGISTERED: u8 = 2;
pub const VERIFY_ISSUER_SUSPENDED: u8 = 3;
pub const VERIFY_HASH_MISMATCH: u8 = 4;
pub const VERIFY_CREDENTIAL_REVOKED: u8 = 5;

// Solidity storage layout definition for Stylus
sol_storage! {
    #[entrypoint]
    pub struct CertiVault {
        /// Trust Root Admin wallet address
        address admin;

        /// Pending Admin address for 2-step ownership transfer
        address pending_admin;
        
        /// Issuer Registry: address => Issuer state
        mapping(address => Issuer) issuers;
        
        /// Credential Registry: bytes32 => Credential state
        mapping(bytes32 => Credential) credentials;
    }

    /// Educational Institution / Issuer record
    pub struct Issuer {
        bool is_registered;
        bool is_suspended;
        uint64 registered_at;
        bytes32 name_hash;
    }

    /// Academic Credential record (Privacy-preserving: stores hashes & commitments only)
    pub struct Credential {
        bool exists;
        address issuer;
        bytes32 holder_commitment;
        bytes32 credential_hash;
        uint64 issued_at;
        uint64 revocation_at;
        uint8 status;
    }
}

// Solidity Custom Error definitions
sol! {
    error Unauthorized();
    error NotAuthorizedIssuer();
    error IssuerIsSuspended();
    error IssuerAlreadyRegistered();
    error IssuerNotFound();
    error CredentialAlreadyExists();
    error CredentialNotFound();
    error InvalidCredential();
    error AlreadyRevoked();
    error InvalidStateTransition();
    error UnauthorizedRevocation();
    error ZeroAddress();
    error EmptyHash();
    error AlreadyInitialized();
    error NoPendingAdmin();
    error SameAdmin();
}

// Custom Error enum for Stylus execution
#[derive(SolidityError)]
pub enum CertiVaultError {
    Unauthorized(Unauthorized),
    NotAuthorizedIssuer(NotAuthorizedIssuer),
    IssuerIsSuspended(IssuerIsSuspended),
    IssuerAlreadyRegistered(IssuerAlreadyRegistered),
    IssuerNotFound(IssuerNotFound),
    CredentialAlreadyExists(CredentialAlreadyExists),
    CredentialNotFound(CredentialNotFound),
    InvalidCredential(InvalidCredential),
    AlreadyRevoked(AlreadyRevoked),
    InvalidStateTransition(InvalidStateTransition),
    UnauthorizedRevocation(UnauthorizedRevocation),
    ZeroAddress(ZeroAddress),
    EmptyHash(EmptyHash),
    AlreadyInitialized(AlreadyInitialized),
    NoPendingAdmin(NoPendingAdmin),
    SameAdmin(SameAdmin),
}

// Solidity Event definitions for EVM logging
sol! {
    event IssuerRegistered(address indexed issuer, bytes32 name_hash, uint64 timestamp);
    event IssuerSuspended(address indexed issuer, uint64 timestamp);
    event IssuerUnsuspended(address indexed issuer, uint64 timestamp);
    event CredentialIssued(bytes32 indexed credential_id, address indexed issuer, bytes32 holder_commitment, bytes32 credential_hash, uint64 timestamp);
    event CredentialRevoked(bytes32 indexed credential_id, address indexed issuer, uint64 timestamp);
    event AdminTransferred(address indexed old_admin, address indexed new_admin);
    event AdminProposed(address indexed current_admin, address indexed pending_admin);
    event AdminProposalCancelled(address indexed current_admin, address indexed cancelled_admin);
}

#[public]
impl CertiVault {
    // =========================================================================
    // 0. INITIALIZATION & GOVERNANCE
    // =========================================================================

    /// Initialize trust root admin directly to msg::sender()
    /// Can ONLY be called once when admin is Address::ZERO.
    /// Binds admin directly to the transaction sender (deployer), preventing front-running address spoofing.
    pub fn init(&mut self) -> Result<(), CertiVaultError> {
        let current_admin = self.admin.get();
        if current_admin != Address::ZERO {
            return Err(CertiVaultError::AlreadyInitialized(AlreadyInitialized {}));
        }
        
        let sender = msg::sender();
        if sender == Address::ZERO {
            return Err(CertiVaultError::ZeroAddress(ZeroAddress {}));
        }

        self.admin.set(sender);
        stylus_sdk::evm::log(AdminTransferred {
            old_admin: Address::ZERO,
            new_admin: sender,
        });
        Ok(())
    }

    /// Initialize with an explicit initial admin address (Single-call guard)
    pub fn init_with_admin(&mut self, initial_admin: Address) -> Result<(), CertiVaultError> {
        let current_admin = self.admin.get();
        if current_admin != Address::ZERO {
            return Err(CertiVaultError::AlreadyInitialized(AlreadyInitialized {}));
        }
        if initial_admin == Address::ZERO {
            return Err(CertiVaultError::ZeroAddress(ZeroAddress {}));
        }

        self.admin.set(initial_admin);
        stylus_sdk::evm::log(AdminTransferred {
            old_admin: Address::ZERO,
            new_admin: initial_admin,
        });
        Ok(())
    }

    /// Read trust root admin address
    pub fn get_admin(&self) -> Address {
        self.admin.get()
    }

    /// Read pending proposed admin address
    pub fn get_pending_admin(&self) -> Address {
        self.pending_admin.get()
    }

    /// Propose a new admin (Step 1 of 2-step ownership transfer to prevent accidental lockout)
    pub fn propose_admin(&mut self, new_admin: Address) -> Result<(), CertiVaultError> {
        self.only_admin()?;
        if new_admin == Address::ZERO {
            return Err(CertiVaultError::ZeroAddress(ZeroAddress {}));
        }
        if new_admin == self.admin.get() {
            return Err(CertiVaultError::SameAdmin(SameAdmin {}));
        }

        self.pending_admin.set(new_admin);
        stylus_sdk::evm::log(AdminProposed {
            current_admin: self.admin.get(),
            pending_admin: new_admin,
        });
        Ok(())
    }

    /// Accept admin role (Step 2 of 2-step ownership transfer)
    /// Must be invoked by the designated pending admin address
    pub fn accept_admin(&mut self) -> Result<(), CertiVaultError> {
        let sender = msg::sender();
        let pending = self.pending_admin.get();
        
        if pending == Address::ZERO || sender != pending {
            return Err(CertiVaultError::NoPendingAdmin(NoPendingAdmin {}));
        }

        let old_admin = self.admin.get();
        self.admin.set(sender);
        self.pending_admin.set(Address::ZERO);

        stylus_sdk::evm::log(AdminTransferred {
            old_admin,
            new_admin: sender,
        });
        Ok(())
    }

    /// Cancel a pending admin proposal (Admin only)
    pub fn cancel_admin_proposal(&mut self) -> Result<(), CertiVaultError> {
        self.only_admin()?;
        let pending = self.pending_admin.get();
        if pending == Address::ZERO {
            return Err(CertiVaultError::NoPendingAdmin(NoPendingAdmin {}));
        }

        self.pending_admin.set(Address::ZERO);
        stylus_sdk::evm::log(AdminProposalCancelled {
            current_admin: self.admin.get(),
            cancelled_admin: pending,
        });
        Ok(())
    }

    // =========================================================================
    // 1. ISSUER REGISTRY FUNCTIONS (ADMIN ONLY)
    // =========================================================================

    /// Register a new educational institution / issuer wallet
    pub fn register_issuer(
        &mut self,
        issuer_address: Address,
        name_hash: B256,
    ) -> Result<(), CertiVaultError> {
        self.only_admin()?;

        if issuer_address == Address::ZERO {
            return Err(CertiVaultError::ZeroAddress(ZeroAddress {}));
        }
        if name_hash == B256::ZERO {
            return Err(CertiVaultError::EmptyHash(EmptyHash {}));
        }

        let mut issuer = self.issuers.setter(issuer_address);
        if issuer.is_registered.get() {
            return Err(CertiVaultError::IssuerAlreadyRegistered(IssuerAlreadyRegistered {}));
        }

        let now = block::timestamp();
        issuer.is_registered.set(true);
        issuer.is_suspended.set(false);
        issuer.registered_at.set(Uint::from(now));
        issuer.name_hash.set(name_hash);

        stylus_sdk::evm::log(IssuerRegistered {
            issuer: issuer_address,
            name_hash,
            timestamp: now,
        });

        Ok(())
    }

    /// Suspend an authorized educational institution
    pub fn suspend_issuer(&mut self, issuer_address: Address) -> Result<(), CertiVaultError> {
        self.only_admin()?;

        let mut issuer = self.issuers.setter(issuer_address);
        if !issuer.is_registered.get() {
            return Err(CertiVaultError::IssuerNotFound(IssuerNotFound {}));
        }
        if issuer.is_suspended.get() {
            return Err(CertiVaultError::IssuerIsSuspended(IssuerIsSuspended {}));
        }

        issuer.is_suspended.set(true);
        let now = block::timestamp();

        stylus_sdk::evm::log(IssuerSuspended {
            issuer: issuer_address,
            timestamp: now,
        });

        Ok(())
    }

    /// Unsuspend a previously suspended educational institution
    pub fn unsuspend_issuer(&mut self, issuer_address: Address) -> Result<(), CertiVaultError> {
        self.only_admin()?;

        let mut issuer = self.issuers.setter(issuer_address);
        if !issuer.is_registered.get() {
            return Err(CertiVaultError::IssuerNotFound(IssuerNotFound {}));
        }
        if !issuer.is_suspended.get() {
            return Err(CertiVaultError::InvalidStateTransition(InvalidStateTransition {}));
        }

        issuer.is_suspended.set(false);
        let now = block::timestamp();

        stylus_sdk::evm::log(IssuerUnsuspended {
            issuer: issuer_address,
            timestamp: now,
        });

        Ok(())
    }

    /// Read issuer record: (is_registered, is_suspended, registered_at, name_hash)
    pub fn get_issuer(&self, issuer_address: Address) -> (bool, bool, u64, B256) {
        let issuer = self.issuers.get(issuer_address);
        (
            issuer.is_registered.get(),
            issuer.is_suspended.get(),
            issuer.registered_at.get().to::<u64>(),
            issuer.name_hash.get(),
        )
    }

    /// Check whether an address is an authorized active (registered & non-suspended) issuer
    pub fn is_active_issuer(&self, issuer_address: Address) -> bool {
        let issuer = self.issuers.get(issuer_address);
        issuer.is_registered.get() && !issuer.is_suspended.get()
    }

    // =========================================================================
    // 2. CREDENTIAL ISSUANCE FUNCTIONS (AUTHORIZED ACTIVE ISSUERS ONLY)
    // =========================================================================

    /// Issue an academic credential commitment
    /// - Only authorized, non-suspended issuers can call this function
    /// - `msg::sender()` is automatically bound as the issuer (impersonation impossible)
    /// - `credential_id` must be unique
    /// - `credential_hash` and `holder_commitment` must be non-empty
    pub fn issue_credential(
        &mut self,
        credential_id: B256,
        holder_commitment: B256,
        credential_hash: B256,
    ) -> Result<(), CertiVaultError> {
        let sender = msg::sender();
        
        // Verify sender is registered and active
        let issuer = self.issuers.get(sender);
        if !issuer.is_registered.get() {
            return Err(CertiVaultError::NotAuthorizedIssuer(NotAuthorizedIssuer {}));
        }
        if issuer.is_suspended.get() {
            return Err(CertiVaultError::IssuerIsSuspended(IssuerIsSuspended {}));
        }

        // Validate input parameters
        if credential_id == B256::ZERO || credential_hash == B256::ZERO || holder_commitment == B256::ZERO {
            return Err(CertiVaultError::InvalidCredential(InvalidCredential {}));
        }

        // Check duplicate credential ID
        let mut cred = self.credentials.setter(credential_id);
        if cred.exists.get() {
            return Err(CertiVaultError::CredentialAlreadyExists(CredentialAlreadyExists {}));
        }

        let now = block::timestamp();

        // Record credential state
        cred.exists.set(true);
        cred.issuer.set(sender);
        cred.holder_commitment.set(holder_commitment);
        cred.credential_hash.set(credential_hash);
        cred.issued_at.set(Uint::from(now));
        cred.revocation_at.set(Uint::from(0u64));
        cred.status.set(Uint::from(STATUS_ACTIVE));

        stylus_sdk::evm::log(CredentialIssued {
            credential_id,
            issuer: sender,
            holder_commitment,
            credential_hash,
            timestamp: now,
        });

        Ok(())
    }

    // =========================================================================
    // 3. CREDENTIAL REVOCATION FUNCTIONS (ISSUING UNIVERSITY ONLY)
    // =========================================================================

    /// Revoke an active academic credential
    /// - Only the original issuer wallet can revoke its issued credential
    /// - The issuing university must still be registered and not suspended
    /// - Enforces strict state machine transition: ACTIVE -> REVOKED
    pub fn revoke_credential(&mut self, credential_id: B256) -> Result<(), CertiVaultError> {
        let sender = msg::sender();

        // Verify sender is an active registered issuer
        let issuer = self.issuers.get(sender);
        if !issuer.is_registered.get() {
            return Err(CertiVaultError::NotAuthorizedIssuer(NotAuthorizedIssuer {}));
        }
        if issuer.is_suspended.get() {
            return Err(CertiVaultError::IssuerIsSuspended(IssuerIsSuspended {}));
        }

        // Verify credential exists
        let mut cred = self.credentials.setter(credential_id);
        if !cred.exists.get() {
            return Err(CertiVaultError::CredentialNotFound(CredentialNotFound {}));
        }

        // Verify sender is the exact original issuer (prevent cross-issuer revocation)
        if cred.issuer.get() != sender {
            return Err(CertiVaultError::UnauthorizedRevocation(UnauthorizedRevocation {}));
        }

        // Enforce state machine transition: ACTIVE -> REVOKED
        let current_status = cred.status.get().to::<u8>();
        if current_status == STATUS_REVOKED {
            return Err(CertiVaultError::AlreadyRevoked(AlreadyRevoked {}));
        }
        if current_status != STATUS_ACTIVE {
            return Err(CertiVaultError::InvalidStateTransition(InvalidStateTransition {}));
        }

        let now = block::timestamp();
        cred.status.set(Uint::from(STATUS_REVOKED));
        cred.revocation_at.set(Uint::from(now));

        stylus_sdk::evm::log(CredentialRevoked {
            credential_id,
            issuer: sender,
            timestamp: now,
        });

        Ok(())
    }

    // =========================================================================
    // 4. CREDENTIAL VERIFICATION & READ FUNCTIONS (PUBLIC)
    // =========================================================================

    /// Retrieve full on-chain credential state:
    /// (exists, issuer, holder_commitment, credential_hash, issued_at, revocation_at, status)
    pub fn get_credential(
        &self,
        credential_id: B256,
    ) -> (bool, Address, B256, B256, u64, u64, u8) {
        let cred = self.credentials.get(credential_id);
        (
            cred.exists.get(),
            cred.issuer.get(),
            cred.holder_commitment.get(),
            cred.credential_hash.get(),
            cred.issued_at.get().to::<u64>(),
            cred.revocation_at.get().to::<u64>(),
            cred.status.get().to::<u8>(),
        )
    }

    /// Read-only verification mechanism for external verifiers / frontends
    /// Returns structured tuple:
    /// (is_valid, exists, issuer_authorized, hash_matches, status, issuer, issued_at, verification_code)
    pub fn verify_credential(
        &self,
        credential_id: B256,
        expected_hash: B256,
    ) -> (bool, bool, bool, bool, u8, Address, u64, u8) {
        let cred = self.credentials.get(credential_id);
        let exists = cred.exists.get();

        if !exists {
            return (
                false,
                false,
                false,
                false,
                STATUS_UNKNOWN,
                Address::ZERO,
                0,
                VERIFY_CREDENTIAL_NOT_FOUND,
            );
        }

        let issuer_address = cred.issuer.get();
        let stored_hash = cred.credential_hash.get();
        let status = cred.status.get().to::<u8>();
        let issued_at = cred.issued_at.get().to::<u64>();

        let issuer_record = self.issuers.get(issuer_address);
        let is_registered = issuer_record.is_registered.get();
        let is_suspended = issuer_record.is_suspended.get();
        let issuer_authorized = is_registered && !is_suspended;

        let hash_matches = (expected_hash != B256::ZERO) && (stored_hash == expected_hash);

        // Determine verification code
        let verification_code = if !is_registered {
            VERIFY_ISSUER_NOT_REGISTERED
        } else if is_suspended {
            VERIFY_ISSUER_SUSPENDED
        } else if !hash_matches {
            VERIFY_HASH_MISMATCH
        } else if status == STATUS_REVOKED {
            VERIFY_CREDENTIAL_REVOKED
        } else if status == STATUS_ACTIVE {
            VERIFY_SUCCESS
        } else {
            VERIFY_CREDENTIAL_NOT_FOUND
        };

        let is_valid = verification_code == VERIFY_SUCCESS;

        (
            is_valid,
            exists,
            issuer_authorized,
            hash_matches,
            status,
            issuer_address,
            issued_at,
            verification_code,
        )
    }

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    /// Internal access control check for admin
    fn only_admin(&self) -> Result<(), CertiVaultError> {
        let admin = self.admin.get();
        if admin == Address::ZERO || msg::sender() != admin {
            return Err(CertiVaultError::Unauthorized(Unauthorized {}));
        }
        Ok(())
    }
}
