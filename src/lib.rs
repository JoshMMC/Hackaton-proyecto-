use anchor_lang::prelude::*;

declare_id!("4C4Gs5T8MFMvZeaS7cZy4siWzyT2W5AtuSFkU1EM6hVg");

#[program]
pub mod fight_game {
    use super::*;

    pub fn crear_partida(ctx: Context<CrearPartida>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        game.player1 = *ctx.accounts.player.key;
        game.player2 = Pubkey::default();

        game.health1 = 100;
        game.health2 = 100;

        game.energy1 = 50;
        game.energy2 = 50;

        game.turn = 1;
        game.status = 0;

        Ok(())
    }

    pub fn unirse_partida(ctx: Context<UnirsePartida>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.player2 == Pubkey::default(), ErrorCode::PartidaLlena);

        game.player2 = *ctx.accounts.player.key;
        Ok(())
    }

    pub fn atacar(ctx: Context<Accion>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.status == 0, ErrorCode::JuegoTerminado);

        let player = ctx.accounts.player.key();

        if game.turn == 1 {
            require!(player == game.player1, ErrorCode::NoEsTuTurno);

            let damage = 10;

            game.health2 = game.health2.saturating_sub(damage);
            game.turn = 2;
        } else {
            require!(player == game.player2, ErrorCode::NoEsTuTurno);

            let damage = 10;

            game.health1 = game.health1.saturating_sub(damage);
            game.turn = 1;
        }

        // verificar ganador
        if game.health1 == 0 || game.health2 == 0 {
            game.status = 1;
        }

        Ok(())
    }

    pub fn curarse(ctx: Context<Accion>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let player = ctx.accounts.player.key();

        if game.turn == 1 {
            require!(player == game.player1, ErrorCode::NoEsTuTurno);
            require!(game.energy1 >= 10, ErrorCode::SinEnergia);

            game.health1 += 10;
            game.energy1 -= 10;
            game.turn = 2;
        } else {
            require!(player == game.player2, ErrorCode::NoEsTuTurno);
            require!(game.energy2 >= 10, ErrorCode::SinEnergia);

            game.health2 += 10;
            game.energy2 -= 10;
            game.turn = 1;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CrearPartida<'info> {
    #[account(init, payer = player, space = 8 + 100)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnirsePartida<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct Accion<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[account]
pub struct Game {
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub health1: u8,
    pub health2: u8,
    pub energy1: u8,
    pub energy2: u8,
    pub turn: u8,
    pub status: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("No es tu turno")]
    NoEsTuTurno,
    #[msg("La partida ya tiene 2 jugadores")]
    PartidaLlena,
    #[msg("Juego terminado")]
    JuegoTerminado,
    #[msg("No tienes energia")]
    SinEnergia,
}
