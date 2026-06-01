"use strict";

const crypto = require("node:crypto");
const { normalize, validateComment } = require("../lib/validation");

class CommentService {
  constructor(repository, { cooldownMs = 60_000, maxComments = 500 } = {}) {
    this.repository = repository;
    this.cooldownMs = cooldownMs;
    this.maxComments = maxComments;
    this.lastSubmissionByIp = new Map();
  }

  async list() {
    return (await this.repository.read())
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  }

  async create(input, ipAddress) {
    const validation = validateComment(input);
    if (!validation.ok) throw Object.assign(new Error(validation.message), { statusCode: 422 });

    const lastSubmission = this.lastSubmissionByIp.get(ipAddress) || 0;
    if (Date.now() - lastSubmission < this.cooldownMs) {
      throw Object.assign(new Error("Aguarde um minuto antes de publicar outra mensagem."), { statusCode: 429 });
    }

    const comments = await this.repository.read();
    const duplicate = comments.some((comment) =>
      normalize(comment.name) === normalize(validation.value.name) &&
      normalize(comment.message) === normalize(validation.value.message)
    );
    if (duplicate) throw Object.assign(new Error("Esta mensagem já foi publicada."), { statusCode: 409 });

    const comment = {
      id: crypto.randomUUID(),
      ...validation.value,
      createdAt: new Date().toISOString()
    };
    comments.push(comment);
    await this.repository.write(comments.slice(-this.maxComments));
    this.lastSubmissionByIp.set(ipAddress, Date.now());
    return comment;
  }

  async delete(id) {
    const comments = await this.repository.read();
    const filtered = comments.filter((comment) => comment.id !== id);
    if (filtered.length === comments.length) {
      throw Object.assign(new Error("Mensagem não encontrada."), { statusCode: 404 });
    }
    await this.repository.write(filtered);
  }
}

module.exports = { CommentService };
