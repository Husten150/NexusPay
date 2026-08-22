#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, Client as TokenClient},
    Address, BytesN, Env, String,
};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let contract_address = e.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(e, &contract_address.address()),
        StellarAssetClient::new(e, &contract_address.address()),
    )
}

#[test]
fn test_init_and_version() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NexusPayContract, ());
    let client = NexusPayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury_name = String::from_str(&env, "NexusPay Enterprise Treasury");

    client.init(&admin, &treasury_name);

    let version = client.get_version();
    assert_eq!(version, String::from_str(&env, "NexusPay Soroban v2.1.0-stellar"));
}

#[test]
fn test_user_registration_and_kyc() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NexusPayContract, ());
    let client = NexusPayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin, &String::from_str(&env, "NexusPay"));

    let user_addr = Address::generate(&env);
    let username = String::from_str(&env, "alex_vance");
    let email = String::from_str(&env, "alex@nexuspay.io");
    let country = String::from_str(&env, "US");

    let registered = client.register_user(&user_addr, &username, &email, &country);
    assert_eq!(registered.username, username);
    assert_eq!(registered.kyc_verified, false);

    // Verify KYC
    let id_hash = BytesN::from_array(&env, &[1u8; 32]);
    let verified = client.verify_kyc(&user_addr, &id_hash);
    assert_eq!(verified.kyc_verified, true);
    assert_eq!(verified.kyc_id_hash, id_hash);

    let fetched = client.get_user(&user_addr).unwrap();
    assert_eq!(fetched.kyc_verified, true);
}

#[test]
fn test_payment_stream_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NexusPayContract, ());
    let client = NexusPayContractClient::new(&env, &contract_id);

    let token_admin = Address::generate(&env);
    let (token_client, token_admin_client) = create_token_contract(&env, &token_admin);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Mint tokens to sender
    token_admin_client.mint(&sender, &10_000_000_000); // 1,000 tokens (7 decimals)

    let start_time = 1_000u64;
    let stop_time = 2_000u64; // 1,000 seconds
    let rate_per_second = 10_000i128; // 10,000 units/sec -> total 10_000_000

    env.ledger().set_timestamp(start_time);

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &token_client.address,
        &rate_per_second,
        &start_time,
        &stop_time,
        &1u32, // Payroll
    );

    assert_eq!(stream_id, 1);

    // Advance time by 500 seconds
    env.ledger().set_timestamp(start_time + 500);

    let vested = client.get_stream_vested_amount(&stream_id);
    assert_eq!(vested, 5_000_000);

    // Withdraw vested amount
    let withdrawn = client.withdraw_from_stream(&stream_id, &recipient, &2_000_000);
    assert_eq!(withdrawn, 2_000_000);
    assert_eq!(token_client.balance(&recipient), 2_000_000);

    // Check remaining stream
    let stream = client.get_stream(&stream_id).unwrap();
    assert_eq!(stream.withdrawn_amount, 2_000_000);
    assert_eq!(stream.is_active, true);
}

#[test]
fn test_invoice_creation_and_payment() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NexusPayContract, ());
    let client = NexusPayContractClient::new(&env, &contract_id);

    let token_admin = Address::generate(&env);
    let (token_client, token_admin_client) = create_token_contract(&env, &token_admin);

    let merchant = Address::generate(&env);
    let client_addr = Address::generate(&env);

    token_admin_client.mint(&client_addr, &5_000_000_000);

    let invoice_id = client.create_invoice(
        &merchant,
        &client_addr,
        &token_client.address,
        &1_500_000_000,
        &1_700_000_000,
        &String::from_str(&env, "Q3 Infrastructure Retainer"),
    );

    assert_eq!(invoice_id, 1);

    let paid = client.pay_invoice(&invoice_id, &client_addr);
    assert_eq!(paid, true);
    assert_eq!(token_client.balance(&merchant), 1_500_000_000);

    let invoice = client.get_invoice(&invoice_id).unwrap();
    assert_eq!(invoice.is_paid, true);
}

#[test]
fn test_staking_and_yield_calculation() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NexusPayContract, ());
    let client = NexusPayContractClient::new(&env, &contract_id);

    let token_admin = Address::generate(&env);
    let (token_client, token_admin_client) = create_token_contract(&env, &token_admin);

    let user = Address::generate(&env);
    token_admin_client.mint(&user, &10_000_000_000);
    // Mint extra to contract for yield payouts
    token_admin_client.mint(&contract_id, &10_000_000_000);

    env.ledger().set_timestamp(1_000_000);

    let stake_id = client.stake_tokens(&user, &token_client.address, &5_000_000_000, &30u32);
    assert_eq!(stake_id, 1);

    // Fast forward 1 year (31,536,000 seconds)
    env.ledger().set_timestamp(1_000_000 + 31_536_000);

    let pending = client.calculate_pending_yield(&stake_id);
    // 5_000_000_000 * 850 / 10000 = 425_000_000 (8.5%)
    assert_eq!(pending, 425_000_000);

    let claimed = client.claim_yield(&stake_id, &user);
    assert_eq!(claimed, 425_000_000);
}

#[test]
fn test_cross_border_remittance_order() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NexusPayContract, ());
    let client = NexusPayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin, &String::from_str(&env, "NexusPay"));

    let token_admin = Address::generate(&env);
    let (token_client, token_admin_client) = create_token_contract(&env, &token_admin);

    let sender = Address::generate(&env);
    token_admin_client.mint(&sender, &1_000_000_000);

    let remittance_id = client.initiate_remittance(
        &sender,
        &String::from_str(&env, "Amina Mwangi"),
        &String::from_str(&env, "+254712345678"),
        &String::from_str(&env, "Kenya"),
        &String::from_str(&env, "KES"),
        &token_client.address,
        &500_000_000,
        &1_500_000,
        &65_000_000,
    );

    assert_eq!(remittance_id, 1);

    let order = client.get_remittance(&remittance_id).unwrap();
    assert_eq!(order.is_completed, false);
    assert_eq!(order.target_currency, String::from_str(&env, "KES"));

    client.confirm_remittance_payout(
        &admin,
        &remittance_id,
        &String::from_str(&env, "MPESA-REF-984021948"),
    );

    let completed_order = client.get_remittance(&remittance_id).unwrap();
    assert_eq!(completed_order.is_completed, true);
    assert_eq!(completed_order.payout_reference, String::from_str(&env, "MPESA-REF-984021948"));
}
