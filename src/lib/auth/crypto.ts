import crypto from "crypto";

/**
 * Normalizes and hashes a raw company verification code using SHA-256.
 * All codes are normalized to uppercase and trimmed before hashing.
 */
export function hashCompanyCode(rawCode: string): string {
  if (!rawCode || typeof rawCode !== "string") {
    throw new Error("Invalid verification code format.");
  }
  const normalized = rawCode.trim().toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Extracts a safe 4-letter prefix from a raw code for administrative logging.
 */
export function extractCodePrefix(rawCode: string): string {
  if (!rawCode || typeof rawCode !== "string") return "ALUM";
  const clean = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return clean.slice(0, 4) || "ALUM";
}

/**
 * Generates a cryptographically secure company verification code.
 * Example format: DDOG-8X9K-M2P4
 */
export function generateCompanyCode(prefix: string = "ALUM"): {
  code: string;
  hash: string;
  prefix: string;
} {
  const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "ALUM";
  // Generate 8 cryptographically random alphanumeric characters (Crockford base32 alphabet)
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const randomBytes = crypto.randomBytes(8);
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += alphabet[randomBytes[i] % alphabet.length];
  }

  const formattedCode = `${cleanPrefix}-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}`;
  const hash = hashCompanyCode(formattedCode);

  return {
    code: formattedCode,
    hash,
    prefix: cleanPrefix,
  };
}

/**
 * Hashes an IP address using SHA-256 to protect user privacy in audit logs.
 */
export function hashIp(ip?: string | null): string {
  const target = (ip || "127.0.0.1").trim();
  const salt = process.env.AUDIT_IP_SALT || "alumnipath-audit-salt-v1";
  return crypto.createHash("sha256").update(`${target}:${salt}`).digest("hex");
}
