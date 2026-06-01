(function exposeValidation(global) {
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
    for (const character of compact) {
      counts.set(character, (counts.get(character) || 0) + 1);
    }
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

  function hasExcessiveUrls(message) {
    return (String(message).match(/(?:https?:\/\/|www\.)/gi) || []).length > 1;
  }

  function isLongAllCaps(message) {
    const letters = String(message).replace(/[^a-záàâãéèêíïóôõöúçñ]/gi, "");
    return letters.length >= 20 && letters === letters.toUpperCase();
  }

  function validateComment(input) {
    const name = String(input.name || "").trim();
    const message = String(input.message || "").trim();
    if (name.length < 2 || name.length > 60) {
      return { ok: false, message: "Informe um nome entre 2 e 60 caracteres." };
    }
    if (message.length < 3) {
      return { ok: false, message: "Escreva uma mensagem com pelo menos 3 caracteres." };
    }
    if (message.length > 400) {
      return { ok: false, message: "Sua mensagem pode ter no máximo 400 caracteres." };
    }
    if (!/[a-záàâãéèêíïóôõöúçñ]/i.test(message)) {
      return { ok: false, message: "Escreva uma mensagem com palavras, não apenas números ou símbolos." };
    }
    if (hasRepeatedCharacters(message)) {
      return { ok: false, message: "Evite repetir o mesmo caractere muitas vezes." };
    }
    if (hasRepeatedWords(message)) {
      return { ok: false, message: "Evite repetir a mesma palavra muitas vezes." };
    }
    if (hasExcessiveUrls(message)) {
      return { ok: false, message: "Envie no máximo um link por mensagem." };
    }
    if (isLongAllCaps(message)) {
      return { ok: false, message: "Evite mensagens longas escritas somente com letras maiúsculas." };
    }
    if (hasProfanity(`${name} ${message}`)) {
      return { ok: false, message: "Revise sua mensagem e remova palavras ofensivas antes de publicar." };
    }
    return { ok: true, value: { name, message } };
  }

  global.VoxdevValidation = Object.freeze({ normalize, validateComment });
})(window);
