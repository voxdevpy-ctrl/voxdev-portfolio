"use strict";

const profanity = [
  "arrombado", "buceta", "caralho", "cunt", "fdp", "foda-se", "fuck",
  "merda", "otario", "otária", "otario", "porra", "puta", "shit", "viado"
];

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sanitizeText(value, { multiline = false } = {}) {
  const linePattern = multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return String(value || "")
    .replace(linePattern, "")
    .replace(/[<>]/g, "")
    .trim();
}

function hasProfanity(message) {
  const normalized = ` ${normalize(message)} `;
  return profanity.some((word) => {
    const candidate = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\s)${candidate}(?=\\s|$|[.,!?])`, "i").test(normalized);
  });
}

function hasRepeatedCharacters(message) {
  const compact = normalize(message).replace(/\s/g, "");
  if (compact.length < 10) return false;
  const counts = new Map();
  for (const character of compact) counts.set(character, (counts.get(character) || 0) + 1);
  return Math.max(...counts.values()) / compact.length >= 0.8;
}

function hasRepeatedWords(message) {
  const words = normalize(message).match(/[a-z0-9]+/g) || [];
  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
    if (counts.get(word) >= 5) return true;
  }
  return false;
}

function validateComment(input = {}) {
  const name = sanitizeText(input.name);
  const message = sanitizeText(input.message, { multiline: true });
  if (name.length < 2 || name.length > 60) return { ok: false, message: "Informe um nome entre 2 e 60 caracteres." };
  if (message.length < 3) return { ok: false, message: "Escreva uma mensagem com pelo menos 3 caracteres." };
  if (message.length > 400) return { ok: false, message: "Sua mensagem pode ter no máximo 400 caracteres." };
  if (!/[a-záàâãéèêíïóôõöúçñ]/i.test(message)) return { ok: false, message: "Escreva uma mensagem com palavras, não apenas números ou símbolos." };
  if (hasRepeatedCharacters(message)) return { ok: false, message: "Evite repetir o mesmo caractere muitas vezes." };
  if (hasRepeatedWords(message)) return { ok: false, message: "Evite repetir a mesma palavra muitas vezes." };
  if ((message.match(/(?:https?:\/\/|www\.)/gi) || []).length > 1) return { ok: false, message: "Envie no máximo um link por mensagem." };
  const letters = message.replace(/[^a-záàâãéèêíïóôõöúçñ]/gi, "");
  if (letters.length >= 20 && letters === letters.toUpperCase()) return { ok: false, message: "Evite mensagens longas escritas somente com letras maiúsculas." };
  if (hasProfanity(`${name} ${message}`)) return { ok: false, message: "Revise sua mensagem e remova palavras ofensivas antes de publicar." };
  return { ok: true, value: { name, message } };
}

function validateContacts(input = {}, defaults) {
  const instagramValue = sanitizeText(input.instagram?.value).slice(0, 80);
  const instagramUrl = sanitizeText(input.instagram?.url).slice(0, 240);
  const whatsappValue = sanitizeText(input.whatsapp?.value).slice(0, 80);
  const whatsappNumber = sanitizeText(input.whatsapp?.number).replace(/\D/g, "").slice(0, 16);
  const emailValue = sanitizeText(input.email?.value).slice(0, 120);
  const emailAddress = sanitizeText(input.email?.address).slice(0, 160);
  if (instagramUrl && !/^https:\/\/(?:www\.)?instagram\.com\/[a-z0-9._/-]+$/i.test(instagramUrl)) {
    return { ok: false, message: "Informe um endereço válido do Instagram começando com https://instagram.com/." };
  }
  if (whatsappNumber && whatsappNumber.length < 10) {
    return { ok: false, message: "Informe o número do WhatsApp com DDD e DDI." };
  }
  if (emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
    return { ok: false, message: "Informe um endereço de e-mail válido." };
  }
  return {
    ok: true,
    value: {
      instagram: { ...defaults.instagram, value: instagramValue, url: instagramUrl },
      whatsapp: { ...defaults.whatsapp, value: whatsappValue, number: whatsappNumber },
      email: { ...defaults.email, value: emailValue, address: emailAddress }
    }
  };
}

module.exports = { normalize, sanitizeText, validateComment, validateContacts };
