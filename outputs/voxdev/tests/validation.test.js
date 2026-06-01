"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateComment, validateContacts } = require("../server/lib/validation");
const { defaultContacts } = require("../server/services/contact-service");

test("aceita um comentário válido", () => {
  const result = validateComment({ name: "Maria", message: "Gostei muito da proposta do site." });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { name: "Maria", message: "Gostei muito da proposta do site." });
});

test("remove marcação HTML antes de salvar", () => {
  const result = validateComment({ name: "<b>João</b>", message: "<script>alert(1)</script> Site muito bom!" });
  assert.equal(result.ok, true);
  assert.equal(result.value.name, "bJoão/b");
  assert.equal(result.value.message, "scriptalert(1)/script Site muito bom!");
});

test("bloqueia mensagens formadas apenas por símbolos", () => {
  const result = validateComment({ name: "João", message: "!!!!!!!!!!!!" });
  assert.equal(result.ok, false);
});

test("bloqueia repetição excessiva de caracteres", () => {
  const result = validateComment({ name: "João", message: "aaaaaaaaaaaaaaaaaaa legal" });
  assert.equal(result.ok, false);
});

test("bloqueia repetição excessiva de palavras", () => {
  const result = validateComment({ name: "João", message: "site site site site site" });
  assert.equal(result.ok, false);
});

test("bloqueia mais de um endereço na mensagem", () => {
  const result = validateComment({ name: "João", message: "Acesse https://exemplo.com e https://outro.com" });
  assert.equal(result.ok, false);
});

test("bloqueia linguagem ofensiva", () => {
  const result = validateComment({ name: "João", message: "Esse conteúdo é uma merda." });
  assert.equal(result.ok, false);
});

test("aceita contatos vazios antes da configuração", () => {
  const result = validateContacts({}, defaultContacts);
  assert.equal(result.ok, true);
  assert.equal(result.value.whatsapp.number, "");
});

test("aceita canais de contato válidos", () => {
  const result = validateContacts({
    instagram: { value: "@voxdev", url: "https://instagram.com/voxdev" },
    whatsapp: { value: "(47) 99999-9999", number: "5547999999999" },
    email: { value: "contato@voxdev.com.br", address: "contato@voxdev.com.br" }
  }, defaultContacts);
  assert.equal(result.ok, true);
  assert.equal(result.value.whatsapp.number, "5547999999999");
});

test("rejeita endereço de Instagram fora do domínio permitido", () => {
  const result = validateContacts({
    instagram: { value: "Instagram", url: "https://exemplo.com/perfil" }
  }, defaultContacts);
  assert.equal(result.ok, false);
});
