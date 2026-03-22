import * as anchor from "@coral-xyz/anchor";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Tictactoe;
const game = anchor.web3.Keypair.generate();

export const crearPartida = async () => {
  await program.methods.crearPartida().accounts({
    game: game.publicKey,
    player: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  }).signers([game]).rpc();

  console.log("Partida creada");
};

export const unirsePartida = async (player2: anchor.web3.Keypair) => {
  await program.methods.unirsePartida().accounts({
    game: game.publicKey,
    player: player2.publicKey,
  }).signers([player2]).rpc();
};

export const jugar = async (pos: number) => {
  await program.methods.jugar(pos).accounts({
    game: game.publicKey,
    player: provider.wallet.publicKey,
  }).rpc();

  console.log("Movimiento:", pos);
};

export const reiniciar = async () => {
  await program.methods.reiniciar().accounts({
    game: game.publicKey,
    player: provider.wallet.publicKey,
  }).rpc();

  console.log("Reiniciado");
};
