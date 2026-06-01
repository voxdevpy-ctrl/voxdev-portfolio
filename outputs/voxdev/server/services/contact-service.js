"use strict";

const { validateContacts } = require("../lib/validation");

const defaultContacts = Object.freeze({
  instagram: { label: "Instagram", value: "", url: "" },
  whatsapp: {
    label: "WhatsApp",
    value: "",
    number: "",
    message: "Olá, VoxDev! Quero conversar sobre um site para o meu negócio."
  },
  email: { label: "E-mail", value: "", address: "", subject: "Quero conversar sobre um projeto" }
});

class ContactService {
  constructor(repository) {
    this.repository = repository;
  }

  async get() {
    return mergeContacts(await this.repository.read());
  }

  async update(input) {
    const validation = validateContacts(input, defaultContacts);
    if (!validation.ok) throw Object.assign(new Error(validation.message), { statusCode: 422 });
    await this.repository.write(validation.value);
    return validation.value;
  }
}

function mergeContacts(saved) {
  return {
    instagram: { ...defaultContacts.instagram, ...saved.instagram },
    whatsapp: { ...defaultContacts.whatsapp, ...saved.whatsapp },
    email: { ...defaultContacts.email, ...saved.email }
  };
}

module.exports = { ContactService, defaultContacts };
