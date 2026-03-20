import * as anchor from "@coral-xyz/anchor";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.FightGame;

const game = anchor.web3.Keypair.generate();

export const crearPartida = async () => {
  await program.methods.crearPartida().accounts({
    game: game.publicKey,
    player: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  }).signers([game]).rpc();

  console.log("Partida creada:", game.publicKey.toBase58());
};

export const atacar = async () => {
  await program.methods.atacar().accounts({
    game: game.publicKey,
    player: provider.wallet.publicKey,
  }).rpc();

  console.log("Ataque realizado");
};
