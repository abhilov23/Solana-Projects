use solana_program::{ 
    account_info::{AccountInfo, next_account_info}, //Working with Solana account references. You loop through them using next_account_info.
    entrypoint, //defines the entrypoint of the program as a macro
    entrypoint::ProgramResult, //defines return type (Result<(), ProgramError>)
    msg, //logs messages on-chain for debugging
    pubkey::Pubkey, //pubkey is used to identify accounts on the programs
};


//borsh brings serilization and deserilization
use borsh::{BorshSerialize, BorshDeserialize};

#[derive(BorshSerialize, BorshDeserialize)]
enum InstructionType { //defines the actions the program will perform.
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshSerialize, BorshDeserialize)] // needed to allow this struct to be stored inside an account's .data field using Borsh.
struct Counter {
    data: u32,
}

// Entry point macro
entrypoint!(process_instruction); //this will receive and handle instructions when someone interacts with the program.

pub fn process_instruction(
    _program_id: &Pubkey,  //defines the ID of your smart contract
    accounts: &[AccountInfo], //defines the accounts the program has access to
    instruction_data: &[u8],  //defines the instruction data (binary data) sent by the client
) -> ProgramResult {
    let mut account_info_iter = accounts.iter(); //these two lines are grabbing the first account of the array
    let account = next_account_info(&mut account_info_iter)?;

    // Deserialize instruction: Turns the incoming binary instruction_data into our Rust InstructionType enum.
    let instruction_type = InstructionType::try_from_slice(instruction_data)?;
    
    // Deserialize account data: Reads the raw binary in the account’s .data field.
    let mut counter_data = Counter::try_from_slice(&account.data.borrow())?;

    // Match and modify counter: matches the enum and updates the counter.
    match instruction_type {
        InstructionType::Increment(value) => {
            counter_data.data += value;
        },
        InstructionType::Decrement(value) => {
            counter_data.data -= value;
        }
    }

    // Serialize back updated data
    counter_data.serialize(&mut *account.data.borrow_mut())?;

    msg!("Contract succeeded. New value: {}", counter_data.data);

    Ok(())
}
