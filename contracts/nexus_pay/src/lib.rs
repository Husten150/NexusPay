#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, BytesN, Env, IntoVal,
    String, Symbol, Val, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidTimeRange = 5,
    StreamNotFound = 6,
    StreamInactive = 7,
    InsufficientStreamBalance = 8,
    InvoiceNotFound = 9,
    InvoiceAlreadyPaid = 10,
    InvoiceCancelled = 11,
    UserAlreadyRegistered = 12,
    UserNotFound = 13,
    StakeNotFound = 14,
    StakeLocked = 15,
    StakeAlreadyWithdrawn = 16,
    RemittanceNotFound = 17,
    RemittanceAlreadyProcessed = 18,
    InsufficientTreasuryBalance = 19,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Initialized,
    TreasuryName,
    User(Address),
    UserCount,
    Stream(u64),
    StreamCount,
    Invoice(u64),
    InvoiceCount,
    Stake(u64),
    StakeCount,
    Remittance(u64),
    RemittanceCount,
    TreasuryBalance(Address), // token address -> balance
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserProfile {
    pub address: Address,
    pub username: String,
    pub email: String,
    pub country: String,
    pub kyc_verified: bool,
    pub kyc_id_hash: BytesN<32>,
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentStream {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub rate_per_second: i128,
    pub start_time: u64,
    pub stop_time: u64,
    pub total_deposit: i128,
    pub withdrawn_amount: i128,
    pub category: u32, // 1: Payroll, 2: Freelancer, 3: SaaS, 4: Grant
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Invoice {
    pub id: u64,
    pub merchant: Address,
    pub client: Address,
    pub token: Address,
    pub total_amount: i128,
    pub due_date: u64,
    pub created_at: u64,
    pub is_paid: bool,
    pub is_escrow_released: bool,
    pub is_cancelled: bool,
    pub memo: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StakePosition {
    pub id: u64,
    pub owner: Address,
    pub token: Address,
    pub staked_amount: i128,
    pub apy_basis_points: u32, // e.g. 850 = 8.5%
    pub start_timestamp: u64,
    pub lock_period_seconds: u64,
    pub last_claimed_timestamp: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RemittanceOrder {
    pub id: u64,
    pub sender: Address,
    pub recipient_name: String,
    pub recipient_account: String,
    pub target_country: String,
    pub target_currency: String,
    pub token: Address,
    pub source_amount: i128,
    pub fee_amount: i128,
    pub expected_payout_minor: i128,
    pub created_at: u64,
    pub is_completed: bool,
    pub payout_reference: String,
}

#[contract]
pub struct NexusPayContract;

#[contractimpl]
impl NexusPayContract {
    /// Initialize the NexusPay Treasury & Streaming Smart Contract
    pub fn init(env: Env, admin: Address, treasury_name: String) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);
        env.storage().instance().set(&DataKey::TreasuryName, &treasury_name);
        env.storage().instance().set(&DataKey::UserCount, &0u64);
        env.storage().instance().set(&DataKey::StreamCount, &0u64);
        env.storage().instance().set(&DataKey::InvoiceCount, &0u64);
        env.storage().instance().set(&DataKey::StakeCount, &0u64);
        env.storage().instance().set(&DataKey::RemittanceCount, &0u64);

        Ok(())
    }

    /// Register a user profile on-chain
    pub fn register_user(
        env: Env,
        caller: Address,
        username: String,
        email: String,
        country: String,
    ) -> Result<UserProfile, Error> {
        caller.require_auth();

        let key = DataKey::User(caller.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::UserAlreadyRegistered);
        }

        let default_hash = BytesN::from_array(&env, &[0u8; 32]);
        let user = UserProfile {
            address: caller.clone(),
            username,
            email,
            country,
            kyc_verified: false,
            kyc_id_hash: default_hash,
            registered_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&key, &user);

        let count: u64 = env.storage().instance().get(&DataKey::UserCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::UserCount, &(count + 1));

        Ok(user)
    }

    /// Verify KYC status for an authenticated user with document & biometric hash
    pub fn verify_kyc(
        env: Env,
        caller: Address,
        id_hash: BytesN<32>,
    ) -> Result<UserProfile, Error> {
        caller.require_auth();

        let key = DataKey::User(caller.clone());
        let mut user: UserProfile = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::UserNotFound)?;

        user.kyc_verified = true;
        user.kyc_id_hash = id_hash;

        env.storage().persistent().set(&key, &user);
        Ok(user)
    }

    /// Query user profile by Address
    pub fn get_user(env: Env, user: Address) -> Option<UserProfile> {
        env.storage().persistent().get(&DataKey::User(user))
    }

    /// Create a real-time continuous payment stream (e.g. Payroll / Subscriptions)
    pub fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        rate_per_second: i128,
        start_time: u64,
        stop_time: u64,
        category: u32,
    ) -> Result<u64, Error> {
        sender.require_auth();

        if stop_time <= start_time || rate_per_second <= 0 {
            return Err(Error::InvalidTimeRange);
        }

        let duration = (stop_time - start_time) as i128;
        let total_deposit = rate_per_second
            .checked_mul(duration)
            .ok_or(Error::InvalidAmount)?;

        // Transfer funds from sender to contract
        let client = token::Client::new(&env, &token);
        client.transfer(&sender, &env.current_contract_address(), &total_deposit);

        let stream_count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::StreamCount)
            .unwrap_or(0)
            + 1;

        let stream = PaymentStream {
            id: stream_count,
            sender,
            recipient,
            token,
            rate_per_second,
            start_time,
            stop_time,
            total_deposit,
            withdrawn_amount: 0,
            category,
            is_active: true,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Stream(stream_count), &stream);
        env.storage()
            .instance()
            .set(&DataKey::StreamCount, &stream_count);

        Ok(stream_count)
    }

    /// Calculate unlocked vested balance of a stream
    pub fn get_stream_vested_amount(env: Env, stream_id: u64) -> Result<i128, Error> {
        let stream: PaymentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(Error::StreamNotFound)?;

        let now = env.ledger().timestamp();
        if now <= stream.start_time {
            return Ok(0);
        }

        if now >= stream.stop_time || !stream.is_active {
            return Ok(stream.total_deposit);
        }

        let elapsed = (now - stream.start_time) as i128;
        let vested = stream.rate_per_second * elapsed;
        if vested > stream.total_deposit {
            Ok(stream.total_deposit)
        } else {
            Ok(vested)
        }
    }

    /// Withdraw unlocked funds from a payment stream
    pub fn withdraw_from_stream(
        env: Env,
        stream_id: u64,
        recipient: Address,
        amount: i128,
    ) -> Result<i128, Error> {
        recipient.require_auth();

        let mut stream: PaymentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(Error::StreamNotFound)?;

        if stream.recipient != recipient {
            return Err(Error::Unauthorized);
        }

        let vested = Self::get_stream_vested_amount(env.clone(), stream_id)?;
        let available = vested - stream.withdrawn_amount;

        if amount <= 0 || amount > available {
            return Err(Error::InsufficientStreamBalance);
        }

        stream.withdrawn_amount += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Stream(stream_id), &stream);

        // Transfer tokens to recipient
        let client = token::Client::new(&env, &stream.token);
        client.transfer(&env.current_contract_address(), &recipient, &amount);

        Ok(amount)
    }

    /// Cancel a stream, returning unvested tokens to sender and vested tokens to recipient
    pub fn cancel_stream(env: Env, stream_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut stream: PaymentStream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(Error::StreamNotFound)?;

        if stream.sender != caller && stream.recipient != caller {
            return Err(Error::Unauthorized);
        }

        if !stream.is_active {
            return Err(Error::StreamInactive);
        }

        let vested = Self::get_stream_vested_amount(env.clone(), stream_id)?;
        let recipient_payout = vested - stream.withdrawn_amount;
        let refund_to_sender = stream.total_deposit - vested;

        stream.is_active = false;
        stream.withdrawn_amount = vested;

        env.storage()
            .persistent()
            .set(&DataKey::Stream(stream_id), &stream);

        let client = token::Client::new(&env, &stream.token);
        if recipient_payout > 0 {
            client.transfer(
                &env.current_contract_address(),
                &stream.recipient,
                &recipient_payout,
            );
        }
        if refund_to_sender > 0 {
            client.transfer(
                &env.current_contract_address(),
                &stream.sender,
                &refund_to_sender,
            );
        }

        Ok(())
    }

    /// Get stream details
    pub fn get_stream(env: Env, stream_id: u64) -> Option<PaymentStream> {
        env.storage().persistent().get(&DataKey::Stream(stream_id))
    }

    /// Create an on-chain cryptographic merchant invoice
    pub fn create_invoice(
        env: Env,
        merchant: Address,
        client: Address,
        token: Address,
        total_amount: i128,
        due_date: u64,
        memo: String,
    ) -> Result<u64, Error> {
        merchant.require_auth();

        if total_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::InvoiceCount)
            .unwrap_or(0)
            + 1;

        let invoice = Invoice {
            id: count,
            merchant,
            client,
            token,
            total_amount,
            due_date,
            created_at: env.ledger().timestamp(),
            is_paid: false,
            is_escrow_released: false,
            is_cancelled: false,
            memo,
        };

        env.storage().persistent().set(&DataKey::Invoice(count), &invoice);
        env.storage().instance().set(&DataKey::InvoiceCount, &count);

        Ok(count)
    }

    /// Pay an invoice on-chain
    pub fn pay_invoice(env: Env, invoice_id: u64, payer: Address) -> Result<bool, Error> {
        payer.require_auth();

        let mut invoice: Invoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .ok_or(Error::InvoiceNotFound)?;

        if invoice.is_paid {
            return Err(Error::InvoiceAlreadyPaid);
        }
        if invoice.is_cancelled {
            return Err(Error::InvoiceCancelled);
        }

        // Direct payment or escrow into contract
        let client = token::Client::new(&env, &invoice.token);
        client.transfer(&payer, &invoice.merchant, &invoice.total_amount);

        invoice.is_paid = true;
        invoice.is_escrow_released = true;

        env.storage().persistent().set(&DataKey::Invoice(invoice_id), &invoice);

        Ok(true)
    }

    /// Cancel an unpaid invoice
    pub fn cancel_invoice(env: Env, invoice_id: u64, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        let mut invoice: Invoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .ok_or(Error::InvoiceNotFound)?;

        if invoice.merchant != caller && invoice.client != caller {
            return Err(Error::Unauthorized);
        }
        if invoice.is_paid {
            return Err(Error::InvoiceAlreadyPaid);
        }

        invoice.is_cancelled = true;
        env.storage().persistent().set(&DataKey::Invoice(invoice_id), &invoice);

        Ok(())
    }

    /// Get invoice details
    pub fn get_invoice(env: Env, invoice_id: u64) -> Option<Invoice> {
        env.storage().persistent().get(&DataKey::Invoice(invoice_id))
    }

    /// Deposit tokens into treasury
    pub fn deposit_treasury(
        env: Env,
        sender: Address,
        token: Address,
        amount: i128,
    ) -> Result<i128, Error> {
        sender.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let client = token::Client::new(&env, &token);
        client.transfer(&sender, &env.current_contract_address(), &amount);

        let key = DataKey::TreasuryBalance(token.clone());
        let current_balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&key, &new_balance);

        Ok(new_balance)
    }

    /// Execute transfer from treasury
    pub fn transfer_treasury(
        env: Env,
        caller: Address,
        recipient: Address,
        token: Address,
        amount: i128,
    ) -> Result<i128, Error> {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        if caller != admin {
            return Err(Error::Unauthorized);
        }

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::TreasuryBalance(token.clone());
        let current_balance: i128 = env.storage().persistent().get(&key).unwrap_or(0);

        if current_balance < amount {
            return Err(Error::InsufficientTreasuryBalance);
        }

        let new_balance = current_balance - amount;
        env.storage().persistent().set(&key, &new_balance);

        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &recipient, &amount);

        Ok(new_balance)
    }

    /// Get treasury balance for a token
    pub fn get_treasury_balance(env: Env, token: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::TreasuryBalance(token))
            .unwrap_or(0)
    }

    /// Stake tokens in DeFi yield vault
    pub fn stake_tokens(
        env: Env,
        owner: Address,
        token: Address,
        amount: i128,
        lock_period_days: u32,
    ) -> Result<u64, Error> {
        owner.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let client = token::Client::new(&env, &token);
        client.transfer(&owner, &env.current_contract_address(), &amount);

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::StakeCount)
            .unwrap_or(0)
            + 1;

        let apy_basis_points: u32 = if lock_period_days >= 30 { 850 } else { 520 };
        let lock_seconds = (lock_period_days as u64) * 86400;
        let now = env.ledger().timestamp();

        let stake = StakePosition {
            id: count,
            owner,
            token,
            staked_amount: amount,
            apy_basis_points,
            start_timestamp: now,
            lock_period_seconds: lock_seconds,
            last_claimed_timestamp: now,
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Stake(count), &stake);
        env.storage().instance().set(&DataKey::StakeCount, &count);

        Ok(count)
    }

    /// Calculate earned yield on a stake position
    pub fn calculate_pending_yield(env: Env, position_id: u64) -> Result<i128, Error> {
        let stake: StakePosition = env
            .storage()
            .persistent()
            .get(&DataKey::Stake(position_id))
            .ok_or(Error::StakeNotFound)?;

        if !stake.is_active {
            return Ok(0);
        }

        let now = env.ledger().timestamp();
        let elapsed_seconds = now.saturating_sub(stake.last_claimed_timestamp) as i128;
        let seconds_in_year: i128 = 31536000;

        // yield = (staked * apy_bps * elapsed) / (10000 * seconds_in_year)
        let interest = (stake.staked_amount * (stake.apy_basis_points as i128) * elapsed_seconds)
            / (10000 * seconds_in_year);

        Ok(interest)
    }

    /// Claim accumulated yield from staking
    pub fn claim_yield(env: Env, position_id: u64, caller: Address) -> Result<i128, Error> {
        caller.require_auth();

        let mut stake: StakePosition = env
            .storage()
            .persistent()
            .get(&DataKey::Stake(position_id))
            .ok_or(Error::StakeNotFound)?;

        if stake.owner != caller {
            return Err(Error::Unauthorized);
        }

        let pending_yield = Self::calculate_pending_yield(env.clone(), position_id)?;
        if pending_yield <= 0 {
            return Ok(0);
        }

        stake.last_claimed_timestamp = env.ledger().timestamp();
        env.storage()
            .persistent()
            .set(&DataKey::Stake(position_id), &stake);

        let client = token::Client::new(&env, &stake.token);
        client.transfer(&env.current_contract_address(), &caller, &pending_yield);

        Ok(pending_yield)
    }

    /// Unstake tokens once lock period expires
    pub fn unstake_tokens(env: Env, position_id: u64, caller: Address) -> Result<i128, Error> {
        caller.require_auth();

        let mut stake: StakePosition = env
            .storage()
            .persistent()
            .get(&DataKey::Stake(position_id))
            .ok_or(Error::StakeNotFound)?;

        if stake.owner != caller {
            return Err(Error::Unauthorized);
        }

        if !stake.is_active {
            return Err(Error::StakeAlreadyWithdrawn);
        }

        let now = env.ledger().timestamp();
        if now < stake.start_timestamp + stake.lock_period_seconds {
            return Err(Error::StakeLocked);
        }

        let pending_yield = Self::calculate_pending_yield(env.clone(), position_id)?;
        let total_return = stake.staked_amount + pending_yield;

        stake.is_active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Stake(position_id), &stake);

        let client = token::Client::new(&env, &stake.token);
        client.transfer(&env.current_contract_address(), &caller, &total_return);

        Ok(total_return)
    }

    /// Get stake position
    pub fn get_stake_position(env: Env, position_id: u64) -> Option<StakePosition> {
        env.storage().persistent().get(&DataKey::Stake(position_id))
    }

    /// Initiate cross-border remittance order on-chain
    pub fn initiate_remittance(
        env: Env,
        sender: Address,
        recipient_name: String,
        recipient_account: String,
        target_country: String,
        target_currency: String,
        token: Address,
        source_amount: i128,
        fee_amount: i128,
        expected_payout_minor: i128,
    ) -> Result<u64, Error> {
        sender.require_auth();

        if source_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let total_charge = source_amount + fee_amount;
        let client = token::Client::new(&env, &token);
        client.transfer(&sender, &env.current_contract_address(), &total_charge);

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::RemittanceCount)
            .unwrap_or(0)
            + 1;

        let empty_ref = String::from_str(&env, "PENDING_LOCAL_SETTLEMENT");

        let order = RemittanceOrder {
            id: count,
            sender,
            recipient_name,
            recipient_account,
            target_country,
            target_currency,
            token,
            source_amount,
            fee_amount,
            expected_payout_minor,
            created_at: env.ledger().timestamp(),
            is_completed: false,
            payout_reference: empty_ref,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Remittance(count), &order);
        env.storage()
            .instance()
            .set(&DataKey::RemittanceCount, &count);

        Ok(count)
    }

    /// Confirm fiat remittance payout with banking reference
    pub fn confirm_remittance_payout(
        env: Env,
        caller: Address,
        remittance_id: u64,
        payout_reference: String,
    ) -> Result<(), Error> {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        if caller != admin {
            return Err(Error::Unauthorized);
        }

        let mut order: RemittanceOrder = env
            .storage()
            .persistent()
            .get(&DataKey::Remittance(remittance_id))
            .ok_or(Error::RemittanceNotFound)?;

        if order.is_completed {
            return Err(Error::RemittanceAlreadyProcessed);
        }

        order.is_completed = true;
        order.payout_reference = payout_reference;

        env.storage()
            .persistent()
            .set(&DataKey::Remittance(remittance_id), &order);

        Ok(())
    }

    /// Get remittance order details
    pub fn get_remittance(env: Env, remittance_id: u64) -> Option<RemittanceOrder> {
        env.storage()
            .persistent()
            .get(&DataKey::Remittance(remittance_id))
    }

    /// Version query
    pub fn get_version(env: Env) -> String {
        String::from_str(&env, "NexusPay Soroban v2.1.0-stellar")
    }
}

#[cfg(test)]
mod test;
