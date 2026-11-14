import crypto from "crypto";

export function generateMatchCode() {
  const random = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 5);
  return `MAID-${random}`;
}