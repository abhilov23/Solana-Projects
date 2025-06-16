use solana_program::{ 
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};
use borsh::{BorshSerialize, BorshDeserialize};

#[derive(BorshSerialize, BorshDeserialize)]
enum InstructionType {
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshSerialize, BorshDeserialize)]
struct Counter {
    data: u32,
}

// Entry point macro
entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey, 
    accounts: &[AccountInfo], 
    instruction_data: &[u8],
) -> ProgramResult {
    let mut account_info_iter = accounts.iter();
    let account = next_account_info(&mut account_info_iter)?;

    // Deserialize instruction
    let instruction_type = InstructionType::try_from_slice(instruction_data)?;
    
    // Deserialize account data
    let mut counter_data = Counter::try_from_slice(&account.data.borrow())?;

    // Match and modify counter
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
