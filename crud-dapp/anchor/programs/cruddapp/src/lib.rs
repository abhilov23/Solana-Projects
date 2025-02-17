#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("KFsvLXCXXrm1PuSYGbnqHDcoUt19aX5nh6bAD6pVfK1");

#[program]
pub mod cruddapp {
    use super::*;


    pub fn create_entry(
      ctx: Context<CreateEntry>,
      title: String,
      message: String,
    ) -> Result<()>{
    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.owner = ctx.accounts.owner.key();
    journal_entry.title = title;
    journal_entry.message = message;

    Ok(())
    }

    pub fn update_entry(
      ctx: Context<UpdateEntry>,
      _title: String,
      new_message: String,
    ) -> Result<()>{
      let journal_entry = &mut ctx.accounts.journal_entry;
      journal_entry.message = new_message;
      Ok(())
    }

    pub fn delete_entry(
      _ctx: Context<DeleteEntry>,
      _title: String,
    ) -> Result<()>{
    Ok(())
    }
 
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState{
  pub owner:Pubkey,
  #[max_len(20)]
  pub title: String,
  #[max_len(20)]
  pub message: String,
  pub entry_id: u64,
}

#[derive(Accounts)]
#[instruction(title:String)] //as we are pulling the data from the instruction ie: title
pub struct CreateEntry<'info> {
  #[account(init,
   seeds = [title.as_bytes(), owner.key().as_ref()],
   bump,
   payer=owner,
   space = 8 + JournalEntryState::INIT_SPACE,
)]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(title:String, message:String)]
pub struct UpdateEntry<'info> {
  #[account(mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE, //redefining the data space
    realloc::payer=owner,
    realloc::zero=true,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,    
  } 


  #[derive(Accounts)]
  #[instruction(title:String, message:String)]
pub struct DeleteEntry<'info> {
  #[account(mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    close=owner, //if the owner runs this instruction then the entry will be deleted automatically.
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,    
  } 