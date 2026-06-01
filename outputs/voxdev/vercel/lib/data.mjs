import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { normalize, validateComment, validateContacts } = require("../../server/lib/validation");
const { defaultContacts } = require("../../server/services/contact-service");

export { defaultContacts, normalize, validateComment, validateContacts };

export function mergeContacts(saved = {}) {
  return {
    instagram: { ...defaultContacts.instagram, ...saved.instagram },
    whatsapp: { ...defaultContacts.whatsapp, ...saved.whatsapp },
    email: { ...defaultContacts.email, ...saved.email }
  };
}

export function mapComment(comment) {
  return {
    id: comment.id,
    name: comment.name,
    message: comment.message,
    createdAt: comment.created_at
  };
}
