"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { CommentService } = require("../server/services/comment-service");

class MemoryRepository {
  constructor() {
    this.items = [];
  }

  async read() {
    return structuredClone(this.items);
  }

  async write(items) {
    this.items = structuredClone(items);
  }
}

test("salva e lista comentários públicos", async () => {
  const service = new CommentService(new MemoryRepository(), { cooldownMs: 0 });
  const created = await service.create({ name: "Ana", message: "Quero conhecer melhor o trabalho." }, "127.0.0.1");
  const comments = await service.list();
  assert.equal(comments.length, 1);
  assert.equal(comments[0].id, created.id);
});

test("bloqueia comentários idênticos", async () => {
  const service = new CommentService(new MemoryRepository(), { cooldownMs: 0 });
  const payload = { name: "Ana", message: "Mensagem repetida para validar o filtro." };
  await service.create(payload, "127.0.0.1");
  await assert.rejects(() => service.create(payload, "127.0.0.2"), /já foi publicada/i);
});

test("aplica intervalo mínimo entre publicações do mesmo IP", async () => {
  const service = new CommentService(new MemoryRepository(), { cooldownMs: 60_000 });
  await service.create({ name: "Ana", message: "Primeira mensagem válida." }, "127.0.0.1");
  await assert.rejects(
    () => service.create({ name: "Ana", message: "Segunda mensagem válida." }, "127.0.0.1"),
    /Aguarde um minuto/i
  );
});

test("exclui comentário por identificador", async () => {
  const service = new CommentService(new MemoryRepository(), { cooldownMs: 0 });
  const created = await service.create({ name: "Ana", message: "Mensagem que será excluída." }, "127.0.0.1");
  await service.delete(created.id);
  assert.deepEqual(await service.list(), []);
});
