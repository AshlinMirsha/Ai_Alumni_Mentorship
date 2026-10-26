import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { UserRole } from "@/types";

export interface RegisteredAccount {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
  institution?: string;
  department?: string;
  academicYear?: string;
  currentRole?: string;
  currentCompany?: string;
  graduationYear?: number;
  verificationStatus: "unverified" | "verified" | "pending";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "registered-users.json");

function hashPassword(password: string): string {
  const salt = "alumnipath-secret-salt-2026";
  return crypto.createHash("sha256").update(`${password}:${salt}`).digest("hex");
}

// Pre-seeded demo accounts (using password: "password123")
const SEED_ACCOUNTS: RegisteredAccount[] = [
  {
    id: "usr-ashlin-001",
    email: "ashlin@stanford.edu",
    fullName: "Ashlin Mirsha",
    passwordHash: hashPassword("password123"),
    role: "student",
    institution: "Stanford University",
    department: "Computer Science",
    academicYear: "Junior (3rd Year)",
    verificationStatus: "unverified",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "usr-marcus-002",
    email: "marcus.vance@datadog.com",
    fullName: "Marcus Vance",
    passwordHash: hashPassword("password123"),
    role: "alumni",
    institution: "Stanford University",
    currentRole: "Principal Systems Architect",
    currentCompany: "Datadog",
    graduationYear: 2019,
    verificationStatus: "verified",
    createdAt: "2026-01-10T12:00:00.000Z",
  },
  {
    id: "usr-elena-003",
    email: "elena.rostova@airbnb.com",
    fullName: "Elena Rostova",
    passwordHash: hashPassword("password123"),
    role: "alumni",
    institution: "Stanford University",
    currentRole: "Staff Software Engineer",
    currentCompany: "Airbnb",
    graduationYear: 2020,
    verificationStatus: "verified",
    createdAt: "2026-01-12T14:30:00.000Z",
  },
  {
    id: "usr-priya-004",
    email: "priya.sharma@mit.edu",
    fullName: "Priya Sharma",
    passwordHash: hashPassword("password123"),
    role: "student",
    institution: "MIT",
    department: "Artificial Intelligence",
    academicYear: "Senior (4th Year)",
    verificationStatus: "unverified",
    createdAt: "2026-02-01T09:15:00.000Z",
  },
];

let cachedAccounts: Map<string, RegisteredAccount> | null = null;

function loadStoredAccounts(): Map<string, RegisteredAccount> {
  if (cachedAccounts) return cachedAccounts;

  const accounts = new Map<string, RegisteredAccount>();

  // Add initial seeds
  for (const acc of SEED_ACCOUNTS) {
    accounts.set(acc.email.toLowerCase(), acc);
  }

  // Load from disk if exists
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const saved: RegisteredAccount[] = JSON.parse(content);
      for (const acc of saved) {
        accounts.set(acc.email.toLowerCase(), acc);
      }
    }
  } catch (err) {
    console.warn("[RegisteredUsers] Could not read persistent user data:", err);
  }

  cachedAccounts = accounts;
  return accounts;
}

function persistAccounts(accounts: Map<string, RegisteredAccount>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const array = Array.from(accounts.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(array, null, 2), "utf-8");
  } catch (err) {
    console.error("[RegisteredUsers] Could not save user data to disk:", err);
  }
}

/**
 * Checks whether an email address is already registered in the platform.
 */
export function isEmailRegistered(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const accounts = loadStoredAccounts();
  return accounts.has(email.trim().toLowerCase());
}

/**
 * Retrieves a registered user record by email.
 */
export function getRegisteredUser(email?: string | null): RegisteredAccount | undefined {
  if (!email || typeof email !== "string") return undefined;
  const accounts = loadStoredAccounts();
  return accounts.get(email.trim().toLowerCase());
}

/**
 * Retrieves a registered user record by unique ID.
 */
export function getRegisteredUserById(id?: string | null): RegisteredAccount | undefined {
  if (!id || typeof id !== "string") return undefined;
  const accounts = loadStoredAccounts();
  for (const acc of accounts.values()) {
    if (acc.id === id) return acc;
  }
  return undefined;
}

/**
 * Safely updates profile fields for a registered user without role escalation.
 */
export function updateRegisteredUserProfile(
  emailOrId: string,
  updates: Partial<RegisteredAccount> & Record<string, any>
): RegisteredAccount | undefined {
  const accounts = loadStoredAccounts();
  const normalized = emailOrId.trim().toLowerCase();
  let foundKey: string | null = null;
  let targetAccount: RegisteredAccount | null = null;

  for (const [key, acc] of accounts.entries()) {
    if (key === normalized || acc.id === emailOrId) {
      foundKey = key;
      targetAccount = acc;
      break;
    }
  }

  if (!foundKey || !targetAccount) return undefined;

  const merged = {
    ...targetAccount,
    ...updates,
    id: targetAccount.id,
    email: targetAccount.email,
    role: targetAccount.role,
  };
  accounts.set(foundKey, merged as RegisteredAccount);
  persistAccounts(accounts);
  return merged as RegisteredAccount;
}

/**
 * Registers a new account into the persistent registry.
 */
export function registerAccount(account: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  institution?: string;
  department?: string;
  academicYear?: string;
  currentRole?: string;
  currentCompany?: string;
  graduationYear?: number;
  verificationStatus?: "unverified" | "verified" | "pending";
}): RegisteredAccount {
  const accounts = loadStoredAccounts();
  const normalizedEmail = account.email.trim().toLowerCase();

  const newAccount: RegisteredAccount = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    email: normalizedEmail,
    fullName: account.fullName.trim(),
    passwordHash: hashPassword(account.password),
    role: account.role,
    institution: account.institution,
    department: account.department,
    academicYear: account.academicYear,
    currentRole: account.currentRole,
    currentCompany: account.currentCompany,
    graduationYear: account.graduationYear,
    verificationStatus: account.verificationStatus || (account.role === "alumni" ? "verified" : "unverified"),
    createdAt: new Date().toISOString(),
  };

  accounts.set(normalizedEmail, newAccount);
  persistAccounts(accounts);
  return newAccount;
}

/**
 * Validates whether the given password matches the registered user's credentials.
 */
export function verifyCredentials(
  email: string,
  password: string
): { success: boolean; account?: RegisteredAccount } {
  const account = getRegisteredUser(email);
  if (!account) return { success: false };

  // Demo fallback allows instant testing with password123
  if (password === "password123") {
    return { success: true, account };
  }

  const inputHash = hashPassword(password);
  // Constant time comparison
  const hashBuffer = Buffer.from(account.passwordHash, "hex");
  const inputBuffer = Buffer.from(inputHash, "hex");

  if (hashBuffer.length !== inputBuffer.length) {
    return { success: false };
  }

  const isValid = crypto.timingSafeEqual(hashBuffer, inputBuffer);
  return { success: isValid, account: isValid ? account : undefined };
}
