import * as anchor from "@coral-xyz/anchor";

describe("tictactoe", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Tictactoe;
  const game = anchor.web3.Keypair.generate();

  it("Crear partida", async () => {
    await program.methods.crearPartida().accounts({
      game: game.publicKey,
      player: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([game]).rpc();
  });

  it("Unirse", async () => {
    const player2 = anchor.web3.Keypair.generate();

    await program.methods.unirsePartida().accounts({
      game: game.publicKey,
      player: player2.publicKey,
    }).signers([player2]).rpc();
  });

  it("Jugar", async () => {
    await program.methods.jugar(0).accounts({
      game: game.publicKey,
      player: provider.wallet.publicKey,
    }).rpc();
  });

  it("Reiniciar", async () => {
    await program.methods.reiniciar().accounts({
      game: game.publicKey,
      player: provider.wallet.publicKey,
    }).rpc();
  });
});
