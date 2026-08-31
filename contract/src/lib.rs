//! aStroToken — a SEP-41 compatible fungible token for the Stellar network.
//!
//! Works like an SPL token on Solana: deploy one instance per token.
//! The constructor sets metadata (name, symbol, decimals, uri) and mints
//! the initial supply to the admin in the SAME transaction.
#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

// ~1 day of ledgers (5s each)
const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_TTL: u32 = 90 * DAY_IN_LEDGERS;
const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_TTL - DAY_IN_LEDGERS;
const BALANCE_TTL: u32 = 90 * DAY_IN_LEDGERS;
const BALANCE_TTL_THRESHOLD: u32 = BALANCE_TTL - DAY_IN_LEDGERS;

#[contracttype]
#[derive(Clone)]
pub struct AllowanceKey {
    pub from: Address,
    pub spender: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct AllowanceValue {
    pub amount: i128,
    pub expiration_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Decimals,
    Name,
    Symbol,
    Uri,
    TotalSupply,
    Balance(Address),
    Allowance(AllowanceKey),
}

#[contract]
pub struct AstroToken;

// ---------- internal helpers ----------

fn read_balance(env: &Env, addr: &Address) -> i128 {
    let key = DataKey::Balance(addr.clone());
    if let Some(balance) = env.storage().persistent().get::<_, i128>(&key) {
        env.storage()
            .persistent()
            .extend_ttl(&key, BALANCE_TTL_THRESHOLD, BALANCE_TTL);
        balance
    } else {
        0
    }
}

fn write_balance(env: &Env, addr: &Address, amount: i128) {
    let key = DataKey::Balance(addr.clone());
    env.storage().persistent().set(&key, &amount);
    env.storage()
        .persistent()
        .extend_ttl(&key, BALANCE_TTL_THRESHOLD, BALANCE_TTL);
}

fn read_total_supply(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&DataKey::TotalSupply)
        .unwrap_or(0)
}

fn write_total_supply(env: &Env, amount: i128) {
    env.storage().instance().set(&DataKey::TotalSupply, &amount);
}

fn read_admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

fn check_nonnegative(amount: i128) {
    if amount < 0 {
        panic!("negative amount is not allowed");
    }
}

fn spend_balance(env: &Env, from: &Address, amount: i128) {
    let balance = read_balance(env, from);
    if balance < amount {
        panic!("insufficient balance");
    }
    write_balance(env, from, balance - amount);
}

fn receive_balance(env: &Env, to: &Address, amount: i128) {
    let balance = read_balance(env, to);
    write_balance(env, to, balance + amount);
}

fn read_allowance(env: &Env, from: &Address, spender: &Address) -> AllowanceValue {
    let key = DataKey::Allowance(AllowanceKey {
        from: from.clone(),
        spender: spender.clone(),
    });
    if let Some(allowance) = env.storage().temporary().get::<_, AllowanceValue>(&key) {
        if allowance.expiration_ledger < env.ledger().sequence() {
            AllowanceValue {
                amount: 0,
                expiration_ledger: allowance.expiration_ledger,
            }
        } else {
            allowance
        }
    } else {
        AllowanceValue {
            amount: 0,
            expiration_ledger: 0,
        }
    }
}

fn write_allowance(
    env: &Env,
    from: &Address,
    spender: &Address,
    amount: i128,
    expiration_ledger: u32,
) {
    if amount > 0 && expiration_ledger < env.ledger().sequence() {
        panic!("expiration_ledger is less than ledger seq when amount > 0");
    }
    let key = DataKey::Allowance(AllowanceKey {
        from: from.clone(),
        spender: spender.clone(),
    });
    env.storage().temporary().set(
        &key,
        &AllowanceValue {
            amount,
            expiration_ledger,
        },
    );
    if amount > 0 {
        let live_for = expiration_ledger
            .checked_sub(env.ledger().sequence())
            .unwrap();
        env.storage()
            .temporary()
            .extend_ttl(&key, live_for, live_for);
    }
}

fn spend_allowance(env: &Env, from: &Address, spender: &Address, amount: i128) {
    let allowance = read_allowance(env, from, spender);
    if allowance.amount < amount {
        panic!("insufficient allowance");
    }
    if amount > 0 {
        write_allowance(
            env,
            from,
            spender,
            allowance.amount - amount,
            allowance.expiration_ledger,
        );
    }
}

fn mint_internal(env: &Env, to: &Address, amount: i128) {
    check_nonnegative(amount);
    receive_balance(env, to, amount);
    write_total_supply(env, read_total_supply(env) + amount);
    env.events()
        .publish((symbol_short!("mint"), read_admin(env), to.clone()), amount);
}

fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL);
}

// ---------- contract interface ----------

#[contractimpl]
impl AstroToken {
    /// Deploy-time constructor: sets metadata and mints `initial_supply`
    /// (already scaled by decimals) to the admin — one-shot, like SPL mint.
    pub fn __constructor(
        env: Env,
        admin: Address,
        decimal: u32,
        name: String,
        symbol: String,
        uri: String,
        initial_supply: i128,
    ) {
        if decimal > 18 {
            panic!("decimal must not exceed 18");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimal);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Uri, &uri);
        if initial_supply > 0 {
            mint_internal(&env, &admin, initial_supply);
        }
        extend_instance(&env);
    }

    /// Admin-only: mint more supply later.
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin = read_admin(&env);
        admin.require_auth();
        mint_internal(&env, &to, amount);
        extend_instance(&env);
    }

    /// Admin-only: transfer admin role.
    pub fn set_admin(env: Env, new_admin: Address) {
        let admin = read_admin(&env);
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        env.events()
            .publish((symbol_short!("set_admin"), admin), new_admin);
        extend_instance(&env);
    }

    /// Returns the current admin address.
    pub fn admin(env: Env) -> Address {
        read_admin(&env)
    }

    // ----- SEP-41 token interface -----

    /// Returns the approved spending allowance for `spender` on behalf of `from`.
    /// Returns 0 if no allowance exists or if it has already expired.
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        read_allowance(&env, &from, &spender).amount
    }

    /// Grants `spender` permission to spend up to `amount` from `from`'s balance
    /// until `expiration_ledger`. Setting `amount` to 0 revokes the allowance.
    /// Requires `from`'s auth.
    pub fn approve(
        env: Env,
        from: Address,
        spender: Address,
        amount: i128,
        expiration_ledger: u32,
    ) {
        from.require_auth();
        check_nonnegative(amount);
        write_allowance(&env, &from, &spender, amount, expiration_ledger);
        env.events().publish(
            (symbol_short!("approve"), from, spender),
            (amount, expiration_ledger),
        );
        extend_instance(&env);
    }

    /// Returns the token balance of `id`. Returns 0 for unknown addresses.
    pub fn balance(env: Env, id: Address) -> i128 {
        read_balance(&env, &id)
    }

    /// Transfers `amount` tokens from `from` to `to`.
    /// Requires `from`'s auth. Panics on insufficient balance.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        check_nonnegative(amount);
        spend_balance(&env, &from, amount);
        receive_balance(&env, &to, amount);
        env.events()
            .publish((symbol_short!("transfer"), from, to), amount);
        extend_instance(&env);
    }

    /// Transfers `amount` tokens from `from` to `to` using a pre-approved allowance.
    /// Requires `spender`'s auth. Panics if allowance is insufficient.
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative(amount);
        spend_allowance(&env, &from, &spender, amount);
        spend_balance(&env, &from, amount);
        receive_balance(&env, &to, amount);
        env.events()
            .publish((symbol_short!("transfer"), from, to), amount);
        extend_instance(&env);
    }

    /// Permanently destroys `amount` tokens from `from`'s balance,
    /// reducing total supply. Requires `from`'s auth.
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        check_nonnegative(amount);
        spend_balance(&env, &from, amount);
        write_total_supply(&env, read_total_supply(&env) - amount);
        env.events().publish((symbol_short!("burn"), from), amount);
        extend_instance(&env);
    }

    /// Burns `amount` tokens on behalf of `from` using a pre-approved allowance.
    /// Requires `spender`'s auth.
    pub fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative(amount);
        spend_allowance(&env, &from, &spender, amount);
        spend_balance(&env, &from, amount);
        write_total_supply(&env, read_total_supply(&env) - amount);
        env.events().publish((symbol_short!("burn"), from), amount);
        extend_instance(&env);
    }

    /// Returns the number of decimal places for this token (max 18).
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }

    /// Returns the human-readable token name (e.g. "Astro Token").
    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    /// Returns the token ticker symbol (e.g. "ASTRO").
    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    /// IPFS metadata URI (image etc.) — like Metaplex metadata on Solana.
    pub fn token_uri(env: Env) -> String {
        env.storage().instance().get(&DataKey::Uri).unwrap()
    }

    /// Returns the current total circulating supply (sum of all balances).
    pub fn total_supply(env: Env) -> i128 {
        read_total_supply(&env)
    }
}

#[cfg(test)]
mod test;
