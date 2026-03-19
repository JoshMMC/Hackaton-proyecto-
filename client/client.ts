async function runToDoList() {
  console.log("🚀 Iniciando Lista de Tareas...");

  // 1. Derivar la dirección de la PDA
  const [listaPDA] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("lista_tareas"), pg.wallet.publicKey.toBuffer()],
    pg.program.programId
  );

  try {
    // 2. CREAR LISTA
    const cuentaExistente = await pg.connection.getAccountInfo(listaPDA);
    if (!cuentaExistente) {
      console.log("📝 Creando nueva lista...");
      await pg.program.methods
        .crearLista("Mis Tareas de Solana")
        .accounts({
          owner: pg.wallet.publicKey,
          lista: listaPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } else {
      console.log("✅ La cuenta de la lista ya existe.");
    }

    // 3. AGREGAR TAREA
    console.log("➕ Agregando tarea: Estudiar Solana...");
    await pg.program.methods
      .agregarTarea("Estudiar Solana", 5) // descripcion, prioridad
      .accounts({
        owner: pg.wallet.publicKey,
        lista: listaPDA,
      })
      .rpc();

    // 4. VER TAREAS (Antes de actualizar)
    let datos = await pg.program.account.listaTareas.fetch(listaPDA);
    console.log("\n--- TAREAS RECIÉN AGREGADAS ---");
    datos.tareas.forEach((t, i) => {
      console.log(`${i + 1}. ${t.descripcion} | Prioridad: ${t.prioridad} | Hecho: ${t.completada}`);
    });

    // 5. ACTUALIZAR TAREA
    console.log("\n✏️ Actualizando tarea 'Estudiar Solana' a completada...");
    await pg.program.methods
      .actualizarTarea("Estudiar Solana", 10, true) // Aumentamos prioridad a 10 y completada a true
      .accounts({
        owner: pg.wallet.publicKey,
        lista: listaPDA,
      })
      .rpc();

    // 6. VER TAREAS (Después de actualizar)
    datos = await pg.program.account.listaTareas.fetch(listaPDA);
    console.log("\n--- TAREAS ACTUALIZADAS ---");
    datos.tareas.forEach((t, i) => {
      console.log(`${i + 1}. ${t.descripcion} | Prioridad: ${t.prioridad} | Hecho: ${t.completada}`);
    });

  } catch (error) {
    console.error("❌ Error en la ejecución:", error);
  }
}

runToDoList();
