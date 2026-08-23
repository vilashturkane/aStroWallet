#![cfg(test)]

use crate::{AstroToken, AstroTokenClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup(env: &Env, supply: i128) -> (AstroTokenClient<'_>, Address) {
    let admin = Address::generate(env);
    let contract_id = env.register(
        AstroToken,
        (
            &admin,
            7u32,
            String::from_str(env, "Astro Token"),
            String::from_str(env, "ASTRO"),
            String::from_str(env, "ipfs://QmTest"),
            supply,
        ),
    );
    (AstroTokenClient::new(env, &contract_id), admin)
}

#[test]
fn test_constructor_mints_initial_supply() {
    let env = Env::default();
    env.mock_all_auths();
    let (token, admin) = setup(&env, 1_000_0000000);

    assert_eq!(token.balance(&admin), 1_000_0000000);
    assert_eq!(token.total_supply(), 1_000_0000000);
    assert_eq!(token.decimals(), 7);
    assert_eq!(token.name(), String::from_str(&env, "Astro Token"));
    assert_eq!(token.symbol(), String::from_str(&env, "ASTRO"));
    assert_eq!(token.token_uri(), String::from_str(&env, "ipfs://QmTest"));
}

#[test]
fn test_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    let (token, admin) = setup(&env, 100);
    let user = Address::generate(&env);

    token.transfer(&admin, &user, &40);
    assert_eq!(token.balance(&admin), 60);
    assert_eq!(token.balance(&user), 40);
}

#[test]
fn test_mint_more() {
    let env = Env::default();
    env.mock_all_auths();
    let (token, _admin) = setup(&env, 0);
    let user = Address::generate(&env);

    token.mint(&user, &500);
    assert_eq!(token.balance(&user), 500);
    assert_eq!(token.total_supply(), 500);
}

#[test]
fn test_approve_and_transfer_from() {
    let env = Env::default();
    env.mock_all_auths();
    let (token, admin) = setup(&env, 100);
    let spender = Address::generate(&env);
    let receiver = Address::generate(&env);

    token.approve(&admin, &spender, &50, &(env.ledger().sequence() + 100));
    assert_eq!(token.allowance(&admin, &spender), 50);

    token.transfer_from(&spender, &admin, &receiver, &30);
    assert_eq!(token.balance(&receiver), 30);
    assert_eq!(token.allowance(&admin, &spender), 20);
}

#[test]
fn test_burn() {
    let env = Env::default();
    env.mock_all_auths();
    let (token, admin) = setup(&env, 100);

    token.burn(&admin, &40);
    assert_eq!(token.balance(&admin), 60);
    assert_eq!(token.total_supply(), 60);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_transfer_insufficient() {
    let env = Env::default();
    env.mock_all_auths();
    let (token, admin) = setup(&env, 10);
    let user = Address::generate(&env);
    token.transfer(&admin, &user, &100);
}
