import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FightGame } from "../target/types/fight_game";

describe("fight_game", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FightGame as Program<FightGame>;

  let game = anchor.web3.Keypair.generate();

  it("Crear partida", async () => {
    await program.methods.crearPartida().accounts({
      game: game.publicKey,
      player: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([game]).rpc();

    const account = await program.account.game.fetch(game.publicKey);
    console.log("Vida jugador 1:", account.health1);
  });

  it("Unirse partida", async () => {
    const player2 = anchor.web3.Keypair.generate();

    await program.methods.unirsePartida().accounts({
      game: game.publicKey,
      player: player2.publicKey,
    }).signers([player2]).rpc();
  });

  it("Atacar", async () => {
    await program.methods.atacar().accounts({
      game: game.publicKey,
      player: provider.wallet.publicKey,
    }).rpc();

    const account = await program.account.game.fetch(game.publicKey);
    console.log("Vida jugador 2:", account.health2);
  });
});
