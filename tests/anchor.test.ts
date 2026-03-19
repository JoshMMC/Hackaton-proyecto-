describe("Pruebas de Lista de Tareas", () => {
  // 1. Configuramos el cliente usando el objeto global 'pg' directamente
  const program = pg.program;
  const workspace = pg.workspace; // Esto ayuda a Playground a encontrar las cuentas

  it("Crea una lista y agrega una tarea", async () => {
    // Derivamos la PDA
    const [listaPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("lista_tareas"), pg.wallet.publicKey.toBuffer()],
      program.programId
    );

    // 2. Intentamos crear la lista (usamos un try/catch silencioso)
    try {
      await program.methods
        .crearLista("Lista de Pruebas")
        .accounts({
          owner: pg.wallet.publicKey,
          lista: listaPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      // Si falla es probablemente porque ya existe
    }

    // 3. Agregamos una tarea aleatoria
    const desc = "Tarea " + Math.floor(Math.random() * 100);
    await program.methods
      .agregarTarea(desc, 1)
      .accounts({
        owner: pg.wallet.publicKey,
        lista: listaPDA,
      })
      .rpc();

    // 4. Verificación manual para evitar errores de 'chai'
    const cuenta: any = await program.account.listaTareas.fetch(listaPDA);
    const existe = cuenta.tareas.some((t: any) => t.descripcion === desc);

    if (existe) {
      console.log("✅ Prueba superada: La tarea se guardó correctamente.");
    } else {
      throw new Error("❌ La tarea no se encontró en la cuenta.");
    }
  });
});
