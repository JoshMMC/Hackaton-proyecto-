use anchor_lang::prelude::*;

declare_id!("GhM2RdKCmvbc1q5mlw63yd2u2cn0hs6jnzf2gljhr486u3dkgm2y");

#[program]
pub mod tictactoe {
    use super::*;

    pub fn crear_partida(ctx: Context<CrearPartida>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        game.player1 = ctx.accounts.player.key();
        game.player2 = Pubkey::default();

        game.board = [0; 9];
        game.turn = 1;
        game.status = 0;

        Ok(())
    }

    pub fn unirse_partida(ctx: Context<UnirsePartida>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        require!(game.player2 == Pubkey::default(), ErrorCode::PartidaLlena);
        game.player2 = ctx.accounts.player.key();

        Ok(())
    }

    pub fn jugar(ctx: Context<Jugar>, posicion: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let player = ctx.accounts.player.key();

        require!(game.status == 0, ErrorCode::JuegoTerminado);
        require!(posicion < 9, ErrorCode::MovimientoInvalido);
        require!(game.board[posicion as usize] == 0, ErrorCode::CasillaOcupada);

        if game.turn == 1 {
            require!(player == game.player1, ErrorCode::NoEsTuTurno);
            game.board[posicion as usize] = 1;
            game.turn = 2;
        } else {
            require!(player == game.player2, ErrorCode::NoEsTuTurno);
            game.board[posicion as usize] = 2;
            game.turn = 1;
        }

        if check_winner(&game.board) {
            game.status = 1;
            return Ok(());
        }

        if board_full(&game.board) {
            game.status = 2;
        }

        Ok(())
    }

    pub fn reiniciar(ctx: Context<Reiniciar>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        require!(ctx.accounts.player.key() == game.player1, ErrorCode::NoAutorizado);

        game.board = [0; 9];
        game.turn = 1;
        game.status = 0;

        Ok(())
    }
}

fn check_winner(board: &[u8; 9]) -> bool {
    let wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for combo in wins.iter() {
        let [a, b, c] = *combo;
        if board[a] != 0 && board[a] == board[b] && board[b] == board[c] {
            return true;
        }
    }
    false
}

fn board_full(board: &[u8; 9]) -> bool {
    board.iter().all(|&cell| cell != 0)
}

#[derive(Accounts)]
pub struct CrearPartida<'info> {
    #[account(init, payer = player, space = 8 + 200)]
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
pub struct Jugar<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct Reiniciar<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[account]
pub struct Game {
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub board: [u8; 9],
    pub turn: u8,
    pub status: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("No es tu turno")]
    NoEsTuTurno,
    #[msg("La partida ya esta llena")]
    PartidaLlena,
    #[msg("Juego terminado")]
    JuegoTerminado,
    #[msg("Movimiento invalido")]
    MovimientoInvalido,
    #[msg("Casilla ocupada")]
    CasillaOcupada,
    #[msg("No autorizado")]
    NoAutorizado,
}
