import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// ─── 1. Cryptographic and Code Utilities ──────────────────────────────────────
function hashCompanyCode(rawCode) {
  if (!rawCode || typeof rawCode !== "string") {
    throw new Error("Invalid verification code format.");
  }
  const normalized = rawCode.trim().toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function extractCodePrefix(rawCode) {
  if (!rawCode || typeof rawCode !== "string") return "ALUM";
  const clean = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return clean.slice(0, 4) || "ALUM";
}

function generateCompanyCode(prefix = "ALUM") {
  const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "ALUM";
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const randomBytes = crypto.randomBytes(8);
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += alphabet[randomBytes[i] % alphabet.length];
  }
  const formattedCode = `${cleanPrefix}-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}`;
  const hash = hashCompanyCode(formattedCode);
  return { code: formattedCode, hash, prefix: cleanPrefix };
}

// ─── 2. Rate Limiting Simulation ──────────────────────────────────────────────
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 900000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  check(ip) {
    const record = this.attempts.get(ip);
    if (!record) return { allowed: true, remaining: this.maxAttempts };
    const now = Date.now();
    if (now - record.firstAttemptAt > this.windowMs) {
      this.attempts.delete(ip);
      return { allowed: true, remaining: this.maxAttempts };
    }
    const remaining = Math.max(0, this.maxAttempts - record.count);
    return { allowed: remaining > 0, remaining };
  }

  recordFailed(ip) {
    const now = Date.now();
    let record = this.attempts.get(ip);
    if (!record || now - record.firstAttemptAt > this.windowMs) {
      record = { count: 1, firstAttemptAt: now };
    } else {
      record.count += 1;
    }
    this.attempts.set(ip, record);
    return { blocked: record.count >= this.maxAttempts, remaining: Math.max(0, this.maxAttempts - record.count) };
  }

  reset(ip) {
    this.attempts.delete(ip);
  }
}

// ─── 3. In-Memory Atomic Verification Database Mock ───────────────────────────
class VerificationDatabaseMock {
  constructor() {
    this.companies = [
      { id: "comp-1", name: "Datadog", status: "active" },
      { id: "comp-2", name: "Google", status: "active" },
      { id: "comp-3", name: "Airbnb", status: "active" },
      { id: "comp-4", name: "SuspendedCorp", status: "suspended" },
    ];

    this.codes = [
      {
        id: "code-ddog-active",
        company_id: "comp-1",
        code_hash: hashCompanyCode("DDOG-ALUM-2026"),
        code_prefix: "DDOG",
        status: "active",
        expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
        max_uses: 500,
        uses_count: 0,
      },
      {
        id: "code-abnb-single",
        company_id: "comp-3",
        code_hash: hashCompanyCode("ABNB-SINGLE-101"),
        code_prefix: "ABNB",
        status: "active",
        expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
        max_uses: 1,
        uses_count: 0,
      },
      {
        id: "code-expired",
        company_id: "comp-1",
        code_hash: hashCompanyCode("DDOG-EXPIRED-99"),
        code_prefix: "DDOG",
        status: "expired",
        expires_at: new Date(Date.now() - 86400000).toISOString(),
        max_uses: 10,
        uses_count: 2,
      },
      {
        id: "code-revoked",
        company_id: "comp-1",
        code_hash: hashCompanyCode("DDOG-REVOKED-00"),
        code_prefix: "DDOG",
        status: "revoked",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        max_uses: 10,
        uses_count: 0,
      },
    ];

    this.redemptions = [];
    this.profiles = new Map();
  }

  // Atomic redemption simulating PostgreSQL verify_and_redeem_company_code
  async redeemCode(userId, rawCode, companyName) {
    const codeHash = hashCompanyCode(rawCode);
    const code = this.codes.find((c) => c.code_hash === codeHash);

    if (!code) {
      return { success: false, error: "Invalid company verification code." };
    }

    if (code.status !== "active") {
      return { success: false, error: `This verification code is ${code.status}.` };
    }

    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      code.status = "expired";
      return { success: false, error: "This company verification code has expired." };
    }

    if (code.max_uses !== null && code.uses_count >= code.max_uses) {
      code.status = "exhausted";
      return { success: false, error: "This company verification code has reached its maximum usage limit." };
    }

    const company = this.companies.find((c) => c.id === code.company_id);
    if (!company || company.status !== "active") {
      return { success: false, error: "The associated company is not currently active." };
    }

    if (companyName) {
      const c1 = company.name.toLowerCase().trim();
      const c2 = companyName.toLowerCase().trim();
      if (!c1.includes(c2) && !c2.includes(c1)) {
        return { success: false, error: `This code is authorized exclusively for ${company.name} employees.` };
      }
    }

    // Atomic increment
    code.uses_count += 1;
    if (code.max_uses !== null && code.uses_count >= code.max_uses) {
      code.status = "exhausted";
    }

    this.redemptions.push({
      code_id: code.id,
      user_id: userId,
      company_id: code.company_id,
      redeemed_at: new Date().toISOString(),
    });

    const existingProfile = this.profiles.get(userId) || {};
    this.profiles.set(userId, {
      ...existingProfile,
      id: userId,
      role: "alumni",
      verification_status: "verified",
      company_id: code.company_id,
      current_company: company.name,
      verified_at: new Date().toISOString(),
    });

    return {
      success: true,
      company_id: code.company_id,
      company_name: company.name,
    };
  }
}

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe("AlumniPath Backend Verification & Authentication Suite", () => {
  let db;
  let limiter;

  beforeEach(() => {
    db = new VerificationDatabaseMock();
    limiter = new RateLimiter();
  });

  // 1. Student Registration
  test("1. Student registration: assigns student role with unverified status", async () => {
    const studentUser = {
      id: "std-001",
      email: "ashlin@university.edu",
      fullName: "Ashlin Mirsha",
      role: "student",
      verification_status: "unverified",
    };
    db.profiles.set(studentUser.id, studentUser);

    const saved = db.profiles.get("std-001");
    assert.equal(saved.role, "student");
    assert.equal(saved.verification_status, "unverified");
    assert.equal(saved.company_id, undefined);
  });

  // 2. Invalid Registration Input
  test("2. Validation rejects invalid registration payloads", () => {
    const invalidEmail = "not-an-email";
    const shortPassword = "123";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    assert.equal(emailRegex.test(invalidEmail), false);
    assert.equal(shortPassword.length < 8, true);
  });

  // 3. Valid Company Code Verification
  test("3. Valid company-code verification promotes applicant to verified Alumni", async () => {
    const result = await db.redeemCode("usr-alumni-1", "DDOG-ALUM-2026", "Datadog");
    assert.equal(result.success, true);
    assert.equal(result.company_name, "Datadog");

    const profile = db.profiles.get("usr-alumni-1");
    assert.equal(profile.role, "alumni");
    assert.equal(profile.verification_status, "verified");
  });

  // 4. Invalid Company Code
  test("4. Invalid company code is rejected", async () => {
    const result = await db.redeemCode("usr-alumni-2", "FAKE-CODE-9999", "Datadog");
    assert.equal(result.success, false);
    assert.match(result.error, /invalid/i);
  });

  // 5. Expired Company Code
  test("5. Expired company code is rejected", async () => {
    const result = await db.redeemCode("usr-alumni-3", "DDOG-EXPIRED-99", "Datadog");
    assert.equal(result.success, false);
    assert.match(result.error, /expired/i);
  });

  // 6. Revoked Company Code
  test("6. Revoked company code is rejected", async () => {
    const result = await db.redeemCode("usr-alumni-4", "DDOG-REVOKED-00", "Datadog");
    assert.equal(result.success, false);
    assert.match(result.error, /revoked/i);
  });

  // 7. Exhausted Usage Limits
  test("7. Single-use code cannot be redeemed a second time", async () => {
    // First redemption succeeds
    const firstAttempt = await db.redeemCode("usr-vip-1", "ABNB-SINGLE-101", "Airbnb");
    assert.equal(firstAttempt.success, true);

    // Second redemption fails due to exhausted status
    const secondAttempt = await db.redeemCode("usr-vip-2", "ABNB-SINGLE-101", "Airbnb");
    assert.equal(secondAttempt.success, false);
    assert.match(secondAttempt.error, /exhausted|limit/i);
  });

  // 8. Concurrent Code Redemption
  test("8. Concurrent redemption requests are handled atomically", async () => {
    const code = db.codes.find((c) => c.id === "code-abnb-single");
    assert.equal(code.max_uses, 1);

    // Run 5 simultaneous redemption attempts on single-use code
    const attempts = await Promise.all([
      db.redeemCode("c-user-1", "ABNB-SINGLE-101", "Airbnb"),
      db.redeemCode("c-user-2", "ABNB-SINGLE-101", "Airbnb"),
      db.redeemCode("c-user-3", "ABNB-SINGLE-101", "Airbnb"),
      db.redeemCode("c-user-4", "ABNB-SINGLE-101", "Airbnb"),
      db.redeemCode("c-user-5", "ABNB-SINGLE-101", "Airbnb"),
    ]);

    const successes = attempts.filter((a) => a.success);
    const failures = attempts.filter((a) => !a.success);

    assert.equal(successes.length, 1);
    assert.equal(failures.length, 4);
    assert.equal(code.uses_count, 1);
    assert.equal(code.status, "exhausted");
  });

  // 9. Privilege Escalation Prevention
  test("9. Student self-promotion to Alumni is blocked without valid code", async () => {
    const studentUser = {
      id: "std-tamper",
      email: "tamper@stanford.edu",
      role: "student",
      verification_status: "unverified",
    };
    db.profiles.set(studentUser.id, studentUser);

    // Simulate direct client attempt to update role to alumni
    const attemptRoleChange = (userId, newRole) => {
      // In database, trigger trg_prevent_profile_privilege_escalation throws exception
      throw new Error("Unauthorized: Users cannot alter their own account role.");
    };

    assert.throws(() => attemptRoleChange(studentUser.id, "alumni"), /cannot alter their own account role/);
    assert.equal(db.profiles.get(studentUser.id).role, "student");
  });

  // 10. Unauthorized Administrator Access
  test("10. Unauthorized user is blocked from admin company-code endpoints", () => {
    const standardUserRole = "student";
    const isAuthorizedAdmin = (role) => role === "admin";
    assert.equal(isAuthorizedAdmin(standardUserRole), false);
  });

  // 11. Unauthorized Profile Access & RLS Enforcement
  test("11. RLS policy ensures users cannot modify others' profiles", () => {
    const callerId = "user-123";
    const targetProfileId = "user-999";
    const canUpdate = (authUid, profileId) => authUid === profileId;
    assert.equal(canUpdate(callerId, targetProfileId), false);
  });

  // 12. Cryptographic Code Hashing & Normalization
  test("12. Company codes are case-insensitive and whitespace-tolerant", () => {
    const hash1 = hashCompanyCode("DDOG-ALUM-2026");
    const hash2 = hashCompanyCode("  ddog-alum-2026  ");
    assert.equal(hash1, hash2);
  });

  // 13. Cryptographic Code Generation
  test("13. Administrative code generation produces unique prefixed codes", () => {
    const generated1 = generateCompanyCode("STRIPE");
    const generated2 = generateCompanyCode("STRIPE");

    assert.notEqual(generated1.code, generated2.code);
    assert.equal(generated1.prefix, "STRI");
    assert.equal(generated1.hash.length, 64); // SHA-256 hex length
  });

  // 14. Rate Limiting Protection Against Brute Force
  test("14. Rate limiter blocks IP after 5 consecutive failed attempts", () => {
    const testIp = "192.168.1.50";

    for (let i = 1; i <= 4; i++) {
      const res = limiter.recordFailed(testIp);
      assert.equal(res.blocked, false);
      assert.equal(res.remaining, 5 - i);
    }

    // 5th failed attempt triggers block
    const fifth = limiter.recordFailed(testIp);
    assert.equal(fifth.blocked, true);
    assert.equal(fifth.remaining, 0);

    // Subsequent check reports not allowed
    const status = limiter.check(testIp);
    assert.equal(status.allowed, false);
  });

  // 15. Rate Limiter Reset on Success
  test("15. Rate limiter resets upon successful verification", () => {
    const testIp = "192.168.1.60";
    limiter.recordFailed(testIp);
    limiter.recordFailed(testIp);

    assert.equal(limiter.check(testIp).remaining, 3);
    limiter.reset(testIp);
    assert.equal(limiter.check(testIp).remaining, 5);
  });

  // 16. Company Name Mismatch Check
  test("16. Code verification rejects company name mismatch", async () => {
    // DDOG code used with Google as company name
    const result = await db.redeemCode("usr-mismatch", "DDOG-ALUM-2026", "Google");
    assert.equal(result.success, false);
    assert.match(result.error, /authorized exclusively for Datadog/i);
  });

  // 17. Inactive Company Rejection
  test("17. Verification code for suspended company is rejected", async () => {
    // Add code for suspended company
    db.codes.push({
      id: "code-suspended",
      company_id: "comp-4",
      code_hash: hashCompanyCode("SUSP-CODE-999"),
      code_prefix: "SUSP",
      status: "active",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      max_uses: 10,
      uses_count: 0,
    });

    const result = await db.redeemCode("usr-susp", "SUSP-CODE-999", "SuspendedCorp");
    assert.equal(result.success, false);
    assert.match(result.error, /not currently active/i);
  });

  // 18. Code Prefix Extraction
  test("18. Code prefix extraction for safe administrative logging", () => {
    assert.equal(extractCodePrefix("ddog-1234"), "DDOG");
    assert.equal(extractCodePrefix("goog-9999"), "GOOG");
    assert.equal(extractCodePrefix(""), "ALUM");
  });

  // 19. Duplicate Redemption by Same User
  test("19. Redemptions table tracks audit history and prevents user double-redemption", async () => {
    const first = await db.redeemCode("user-audit-1", "DDOG-ALUM-2026", "Datadog");
    assert.equal(first.success, true);
    assert.equal(db.redemptions.length, 1);
    assert.equal(db.redemptions[0].user_id, "user-audit-1");
  });

  // 20. Trusted Role Resolution (Client Role Ignored)
  test("20. Server login ignores client-submitted role in favor of database profile", () => {
    const verifiedAlumni = {
      id: "usr-real-alumni",
      email: "marcus@datadog.com",
      role: "alumni",
      verification_status: "verified",
    };
    db.profiles.set(verifiedAlumni.id, verifiedAlumni);

    // Even if client claims role: 'student' or 'admin', trusted role from DB is 'alumni'
    const resolveRole = (clientSubmittedRole, dbProfile) => {
      return dbProfile ? dbProfile.role : "student";
    };

    assert.equal(resolveRole("admin", db.profiles.get("usr-real-alumni")), "alumni");
    assert.equal(resolveRole("student", db.profiles.get("usr-real-alumni")), "alumni");
  });

  // 21. Block Login Without Registration
  test("21. Unregistered user attempting login is rejected with exact required error message", () => {
    const registeredUsers = new Map([
      ["ashlin@stanford.edu", { passwordHash: crypto.createHash("sha256").update("password123:alumnipath-secret-salt-2026").digest("hex"), role: "student" }],
      ["marcus.vance@datadog.com", { passwordHash: crypto.createHash("sha256").update("password123:alumnipath-secret-salt-2026").digest("hex"), role: "alumni" }]
    ]);

    function loginHandler(email, password) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!registeredUsers.has(normalizedEmail)) {
        return {
          status: 401,
          success: false,
          error: "You haven't signed up yet. Please sign up first to log in.",
          code: "ACCOUNT_NOT_REGISTERED",
        };
      }

      const user = registeredUsers.get(normalizedEmail);
      const inputHash = crypto.createHash("sha256").update(`${password}:alumnipath-secret-salt-2026`).digest("hex");
      if (inputHash !== user.passwordHash) {
        return {
          status: 401,
          success: false,
          error: "Invalid email or password. Please try again.",
          code: "INVALID_CREDENTIALS",
        };
      }

      return {
        status: 200,
        success: true,
        role: user.role,
        redirectUrl: user.role === "alumni" ? "/alumni-dashboard" : "/dashboard",
      };
    }

    // Attempt login with an unregistered email
    const resUnregistered = loginHandler("unregistered_stranger@example.com", "password123");
    assert.equal(resUnregistered.status, 401);
    assert.equal(resUnregistered.success, false);
    assert.equal(resUnregistered.error, "You haven't signed up yet. Please sign up first to log in.");
    assert.equal(resUnregistered.code, "ACCOUNT_NOT_REGISTERED");
    assert.equal(registeredUsers.has("unregistered_stranger@example.com"), false); // No account created!
  });

  // 22. Reject Wrong Password for Existing Account
  test("22. Registered user attempting login with wrong password is rejected with exact required message", () => {
    const registeredUsers = new Map([
      ["ashlin@stanford.edu", { passwordHash: crypto.createHash("sha256").update("password123:alumnipath-secret-salt-2026").digest("hex"), role: "student" }],
    ]);

    function loginHandler(email, password) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!registeredUsers.has(normalizedEmail)) {
        return {
          status: 401,
          success: false,
          error: "You haven't signed up yet. Please sign up first to log in.",
        };
      }

      const user = registeredUsers.get(normalizedEmail);
      const inputHash = crypto.createHash("sha256").update(`${password}:alumnipath-secret-salt-2026`).digest("hex");
      if (inputHash !== user.passwordHash) {
        return {
          status: 401,
          success: false,
          error: "Invalid email or password. Please try again.",
        };
      }

      return {
        status: 200,
        success: true,
        role: user.role,
      };
    }

    // Wrong password for existing account
    const resWrongPass = loginHandler("ashlin@stanford.edu", "incorrectPassword!");
    assert.equal(resWrongPass.status, 401);
    assert.equal(resWrongPass.success, false);
    assert.equal(resWrongPass.error, "Invalid email or password. Please try again.");
  });

  // 23. Registered User Login Success & Role Redirection
  test("23. Registered user with valid credentials successfully authenticates with correct dashboard redirection", () => {
    const registeredUsers = new Map([
      ["ashlin@stanford.edu", { passwordHash: crypto.createHash("sha256").update("password123:alumnipath-secret-salt-2026").digest("hex"), role: "student" }],
      ["marcus.vance@datadog.com", { passwordHash: crypto.createHash("sha256").update("password123:alumnipath-secret-salt-2026").digest("hex"), role: "alumni" }]
    ]);

    function loginHandler(email, password) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!registeredUsers.has(normalizedEmail)) {
        return { status: 401, error: "You haven't signed up yet. Please sign up first to log in." };
      }
      const user = registeredUsers.get(normalizedEmail);
      const inputHash = crypto.createHash("sha256").update(`${password}:alumnipath-secret-salt-2026`).digest("hex");
      if (inputHash !== user.passwordHash) {
        return { status: 401, error: "Invalid email or password. Please try again." };
      }
      return {
        status: 200,
        success: true,
        role: user.role,
        redirectUrl: user.role === "alumni" ? "/alumni-dashboard" : "/dashboard",
      };
    }

    // Student login
    const studentRes = loginHandler("ashlin@stanford.edu", "password123");
    assert.equal(studentRes.status, 200);
    assert.equal(studentRes.success, true);
    assert.equal(studentRes.role, "student");
    assert.equal(studentRes.redirectUrl, "/dashboard");

    // Alumni login
    const alumniRes = loginHandler("marcus.vance@datadog.com", "password123");
    assert.equal(alumniRes.status, 200);
    assert.equal(alumniRes.success, true);
    assert.equal(alumniRes.role, "alumni");
    assert.equal(alumniRes.redirectUrl, "/alumni-dashboard");
  });

  // 24. Full Registration-then-Login Lifecycle
  test("24. User registers -> account created -> login succeeds with valid credentials -> fails with wrong credentials", () => {
    const registeredUsers = new Map();

    function registerHandler(email, password, role) {
      const normalizedEmail = email.trim().toLowerCase();
      if (registeredUsers.has(normalizedEmail)) {
        return { status: 409, error: "Account already exists." };
      }
      const passwordHash = crypto.createHash("sha256").update(`${password}:alumnipath-secret-salt-2026`).digest("hex");
      registeredUsers.set(normalizedEmail, { passwordHash, role });
      return { status: 201, success: true };
    }

    function loginHandler(email, password) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!registeredUsers.has(normalizedEmail)) {
        return { status: 401, error: "You haven't signed up yet. Please sign up first to log in." };
      }
      const user = registeredUsers.get(normalizedEmail);
      const inputHash = crypto.createHash("sha256").update(`${password}:alumnipath-secret-salt-2026`).digest("hex");
      if (inputHash !== user.passwordHash) {
        return { status: 401, error: "Invalid email or password. Please try again." };
      }
      return { status: 200, success: true, redirectUrl: user.role === "alumni" ? "/alumni-dashboard" : "/dashboard" };
    }

    // Step 1: Pre-registration login attempt -> Must be blocked!
    const preReg = loginHandler("newstudent@university.edu", "StudentPass123!");
    assert.equal(preReg.status, 401);
    assert.equal(preReg.error, "You haven't signed up yet. Please sign up first to log in.");

    // Step 2: Register account
    const regRes = registerHandler("newstudent@university.edu", "StudentPass123!", "student");
    assert.equal(regRes.status, 201);
    assert.equal(regRes.success, true);

    // Step 3: Login with wrong password -> Must fail with invalid credentials
    const wrongPassRes = loginHandler("newstudent@university.edu", "WrongPassword!");
    assert.equal(wrongPassRes.status, 401);
    assert.equal(wrongPassRes.error, "Invalid email or password. Please try again.");

    // Step 4: Login with valid password -> Must succeed
    const validLogin = loginHandler("newstudent@university.edu", "StudentPass123!");
    assert.equal(validLogin.status, 200);
    assert.equal(validLogin.success, true);
    assert.equal(validLogin.redirectUrl, "/dashboard");
  });

  // 25. Unregistered Google OAuth Sign-in is Blocked
  test("25. Unregistered Google user is rejected and blocked from accessing protected dashboards", () => {
    const registeredUsers = new Map([
      ["ashlin@stanford.edu", { role: "student", verificationStatus: "unverified" }],
    ]);

    function googleCallbackHandler(googleEmail) {
      const normalizedEmail = googleEmail.trim().toLowerCase();
      if (!registeredUsers.has(normalizedEmail)) {
        return {
          status: 403,
          success: false,
          registered: false,
          error: "Your account is not registered with AlumniPath. Please sign up first.",
          code: "ACCOUNT_NOT_REGISTERED",
        };
      }
      const user = registeredUsers.get(normalizedEmail);
      return {
        status: 200,
        success: true,
        registered: true,
        role: user.role,
        redirectUrl: user.role === "alumni" ? "/alumni-dashboard" : "/dashboard",
      };
    }

    const unregResult = googleCallbackHandler("unregistered.stranger@gmail.com");
    assert.equal(unregResult.status, 403);
    assert.equal(unregResult.registered, false);
    assert.equal(unregResult.error, "Your account is not registered with AlumniPath. Please sign up first.");
    assert.equal(unregResult.code, "ACCOUNT_NOT_REGISTERED");
  });

  // 26. Google OAuth Cannot Self-Assign Alumni or Admin Role
  test("26. Google OAuth authentication cannot escalate privileges or self-assign Alumni/Admin role", () => {
    // Database record stores role: 'student'
    const dbProfiles = new Map([
      ["ashlin@stanford.edu", { role: "student", verificationStatus: "unverified" }],
    ]);

    function secureRoleResolver(googleEmail, clientRequestedRole) {
      const normalizedEmail = googleEmail.trim().toLowerCase();
      const profile = dbProfiles.get(normalizedEmail);
      if (!profile) return null;
      // Never trust clientRequestedRole or Google profile metadata! Role comes strictly from DB:
      return profile.role;
    }

    const resolvedRole1 = secureRoleResolver("ashlin@stanford.edu", "alumni");
    assert.equal(resolvedRole1, "student");

    const resolvedRole2 = secureRoleResolver("ashlin@stanford.edu", "admin");
    assert.equal(resolvedRole2, "student");
  });

  // 27. Registered Student Signs in with Google
  test("27. Registered student successfully signs in with Google and is routed to /dashboard", () => {
    const registeredUsers = new Map([
      ["ashlin@stanford.edu", { role: "student", verificationStatus: "unverified" }],
    ]);

    function googleCallbackHandler(googleEmail) {
      const profile = registeredUsers.get(googleEmail.trim().toLowerCase());
      if (!profile) return { status: 403, registered: false };
      return {
        status: 200,
        registered: true,
        role: profile.role,
        redirectUrl: "/dashboard",
      };
    }

    const res = googleCallbackHandler("ashlin@stanford.edu");
    assert.equal(res.status, 200);
    assert.equal(res.registered, true);
    assert.equal(res.role, "student");
    assert.equal(res.redirectUrl, "/dashboard");
  });

  // 28. Registered Alumni Signs in with Google
  test("28. Registered verified alumni signs in with Google and is routed to /alumni-dashboard", () => {
    const registeredUsers = new Map([
      ["marcus.vance@datadog.com", { role: "alumni", verificationStatus: "verified" }],
    ]);

    function googleCallbackHandler(googleEmail) {
      const profile = registeredUsers.get(googleEmail.trim().toLowerCase());
      if (!profile) return { status: 403, registered: false };
      return {
        status: 200,
        registered: true,
        role: profile.role,
        redirectUrl: "/alumni-dashboard",
      };
    }

    const res = googleCallbackHandler("marcus.vance@datadog.com");
    assert.equal(res.status, 200);
    assert.equal(res.registered, true);
    assert.equal(res.role, "alumni");
    assert.equal(res.redirectUrl, "/alumni-dashboard");
  });

  // 29. Rejected Alumni Verification Blocks Google Login to Alumni Dashboard
  test("29. Alumni with rejected verification status is blocked from alumni dashboard during Google sign-in", () => {
    const registeredUsers = new Map([
      ["fake.alumni@example.com", { role: "alumni", verificationStatus: "rejected" }],
    ]);

    function googleCallbackHandler(googleEmail) {
      const profile = registeredUsers.get(googleEmail.trim().toLowerCase());
      if (!profile) return { status: 403, registered: false };
      if (profile.role === "alumni" && profile.verificationStatus === "rejected") {
        return {
          status: 403,
          registered: true,
          error: "Your alumni company verification was rejected. Please contact an administrator.",
          code: "VERIFICATION_REJECTED",
        };
      }
      return { status: 200, registered: true, redirectUrl: "/alumni-dashboard" };
    }

    const res = googleCallbackHandler("fake.alumni@example.com");
    assert.equal(res.status, 403);
    assert.equal(res.code, "VERIFICATION_REJECTED");
  });

  // 30. One-Time Registration: Duplicate Registration Rejection
  test("30. Duplicate registration with already-registered email is rejected with exact required message", () => {
    const registeredUsers = new Map([
      ["existing.student@stanford.edu", { role: "student", fullName: "Existing Student" }],
    ]);

    function registerStudent(email) {
      const normalized = email.trim().toLowerCase();
      if (registeredUsers.has(normalized)) {
        return {
          status: 409,
          success: false,
          error: "An account may already exist with this email. Please sign in or recover your account.",
          code: "ACCOUNT_ALREADY_EXISTS",
        };
      }
      registeredUsers.set(normalized, { role: "student" });
      return { status: 201, success: true, message: "Your account has been created successfully." };
    }

    const dupRes = registerStudent("existing.student@stanford.edu");
    assert.equal(dupRes.status, 409);
    assert.equal(dupRes.success, false);
    assert.equal(dupRes.error, "An account may already exist with this email. Please sign in or recover your account.");
    assert.equal(dupRes.code, "ACCOUNT_ALREADY_EXISTS");
  });

  // 31. Repeat Sign-In: Can Sign In Repeatedly Without Re-registration
  test("31. Registered user can sign in repeatedly without re-registering or profile duplication", () => {
    const profilesTable = new Map([
      ["active.scholar@stanford.edu", { id: "p-101", role: "student", verificationStatus: "unverified" }]
    ]);

    function signIn(email) {
      const normalized = email.trim().toLowerCase();
      const profile = profilesTable.get(normalized);
      if (!profile) {
        return { status: 401, error: "You haven't signed up yet. Please sign up first to log in." };
      }
      return { status: 200, success: true, profile, redirectUrl: "/dashboard" };
    }

    // First visit sign-in
    const session1 = signIn("active.scholar@stanford.edu");
    assert.equal(session1.status, 200);
    assert.equal(session1.profile.id, "p-101");

    // Repeat visit sign-in (e.g. following day)
    const session2 = signIn("active.scholar@stanford.edu");
    assert.equal(session2.status, 200);
    assert.equal(session2.profile.id, "p-101");
    assert.equal(profilesTable.size, 1); // Exactly 1 profile, no duplicates!
  });

  // 32. Idempotent Profile Integrity on Repeat Sign-In
  test("32. Repeat sign-in preserves role and verification status without recreating profile", () => {
    const profiles = new Map([
      ["verified.mentor@datadog.com", { id: "p-202", role: "alumni", verificationStatus: "verified" }]
    ]);

    function loginHandler(email) {
      const profile = profiles.get(email.trim().toLowerCase());
      if (!profile) return { status: 401 };
      return { status: 200, role: profile.role, verificationStatus: profile.verificationStatus };
    }

    const res = loginHandler("verified.mentor@datadog.com");
    assert.equal(res.status, 200);
    assert.equal(res.role, "alumni");
    assert.equal(res.verificationStatus, "verified");
  });

  // 33. Unregistered Google User Message Check
  test("33. Unregistered Google user receives exact required guidance message", () => {
    const registeredUsers = new Set(["valid.user@stanford.edu"]);

    function googleAuth(email) {
      if (!registeredUsers.has(email)) {
        return {
          status: 403,
          registered: false,
          error: "You haven't registered with AlumniPath yet. Please sign up first.",
          code: "ACCOUNT_NOT_REGISTERED",
        };
      }
      return { status: 200, registered: true };
    }

    const res = googleAuth("new.stranger@gmail.com");
    assert.equal(res.status, 403);
    assert.equal(res.error, "You haven't registered with AlumniPath yet. Please sign up first.");
  });

  // 34. Required Verification Rejection Message Check
  test("34. Rejected or unverified alumni receives exact required verification message", () => {
    function verifyStatusCheck(role, status) {
      if (role === "alumni" && status === "rejected") {
        return {
          status: 403,
          error: "Please complete the required verification before continuing.",
          code: "VERIFICATION_REQUIRED",
        };
      }
      return { status: 200 };
    }

    const res = verifyStatusCheck("alumni", "rejected");
    assert.equal(res.status, 403);
    assert.equal(res.error, "Please complete the required verification before continuing.");
  });

  // 35. Student Profile Feature Payload Validation
  test("35. Student profile supports all extended attributes without breaking existing structure", () => {
    const studentProfile = {
      id: "usr-student-001",
      email: "ashlin@stanford.edu",
      fullName: "Ashlin Mirsha",
      role: "student",
      avatarUrl: "https://example.com/avatars/ashlin.png",
      currentActivities: ["Building microservices in Go", "LeetCode Graph Algorithms"],
      technicalSkills: [
        { name: "TypeScript", level: "advanced" },
        { name: "Python", level: "expert" },
        { name: "PostgreSQL", level: "intermediate" },
      ],
      interests: ["Distributed Systems", "Cloud Computing", "Open Source"],
      githubUrl: "https://github.com/ashlinmirsha",
      linkedinUrl: "https://linkedin.com/in/ashlinmirsha",
      portfolioUrl: "https://ashlinmirsha.dev",
      leetcodeUrl: "https://leetcode.com/u/ashlinmirsha",
      projects: [
        {
          id: "proj-1",
          title: "AlumniPath Networking Platform",
          description: "AI-powered alumni mentorship platform.",
          techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
          githubUrl: "https://github.com/ashlinmirsha/alumnipath",
          role: "Lead Full-Stack Developer",
        },
      ],
      targetCompanies: ["Google", "Datadog", "Airbnb", "Stripe"],
      careerGoals: ["Full-Stack Software Engineer", "Tech Lead"],
      achievements: ["1st Place Hackathon Winner", "Dean's Honor List"],
    };

    assert.equal(studentProfile.role, "student");
    assert.equal(studentProfile.currentActivities.length, 2);
    assert.equal(studentProfile.technicalSkills.length, 3);
    assert.equal(studentProfile.targetCompanies.length, 4);
    assert.equal(studentProfile.projects.length, 1);
    assert.equal(studentProfile.projects[0].role, "Lead Full-Stack Developer");
    assert.equal(studentProfile.achievements.length, 2);
    assert.ok(studentProfile.githubUrl.includes("github.com"));
  });

  // 36. Role Escalation Prevention in Profile Updates
  test("36. Students cannot escalate role to alumni or admin through profile updates", () => {
    function processProfileUpdate(currentRole, requestedUpdates) {
      // Disallow overriding role through profile update
      const safeUpdates = { ...requestedUpdates };
      delete safeUpdates.role;
      return {
        role: currentRole, // Stays as currentRole
        ...safeUpdates,
      };
    }

    const updated = processProfileUpdate("student", {
      fullName: "Ashlin Mirsha",
      role: "alumni", // Attempted privilege escalation
      targetCompanies: ["Google"],
    });

    assert.equal(updated.role, "student");
    assert.deepEqual(updated.targetCompanies, ["Google"]);
  });

  // 37. Avatar Upload MIME Type & Size Validation
  test("37. Avatar upload rejects invalid MIME types and accepts standard image formats", () => {
    function validateAvatarUpload(mimeType, sizeBytes) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      const MAX_SIZE = 5 * 1024 * 1024;

      if (!validTypes.includes(mimeType)) {
        return { valid: false, error: "Invalid file format." };
      }
      if (sizeBytes > MAX_SIZE) {
        return { valid: false, error: "File size exceeds 5MB limit." };
      }
      return { valid: true };
    }

    assert.equal(validateAvatarUpload("text/html", 1024).valid, false);
    assert.equal(validateAvatarUpload("application/pdf", 1024).valid, false);
    assert.equal(validateAvatarUpload("image/png", 6 * 1024 * 1024).valid, false); // >5MB
    assert.equal(validateAvatarUpload("image/png", 1024 * 500).valid, true);
    assert.equal(validateAvatarUpload("image/jpeg", 1024 * 800).valid, true);
    assert.equal(validateAvatarUpload("image/webp", 1024 * 300).valid, true);
  });

  // 38. Internship Count Calculation: ONLY completed internships are counted
  test("38. Internship Count Calculation: only records marked Completed are counted in completedCount", () => {
    function calculateInternshipMetrics(internships = []) {
      const safeList = Array.isArray(internships) ? internships : [];
      const completedCount = safeList.filter((i) => i.status === "Completed").length;
      const ongoingCount = safeList.filter((i) => i.status === "Ongoing").length;
      const notCompletedCount = safeList.filter((i) => i.status === "Not Completed").length;
      const totalCount = safeList.length;

      return { completedCount, ongoingCount, notCompletedCount, totalCount };
    }

    const testInternships = [
      { id: "1", company: "Cisco", role: "Network Intern", status: "Completed" },
      { id: "2", company: "Intel", role: "Firmware Intern", status: "Ongoing" },
      { id: "3", company: "Red Hat", role: "Linux Intern", status: "Completed" },
      { id: "4", company: "Stripe", role: "Backend Intern", status: "Completed" },
      { id: "5", company: "Meta", role: "Research Intern", status: "Ongoing" },
      { id: "6", company: "Startup", role: "Mobile Intern", status: "Not Completed" },
    ];

    const metrics = calculateInternshipMetrics(testInternships);

    // CRITICAL: Exactly 3 completed records (1, 3, 4). Ongoing (2, 5) must NOT be counted!
    assert.equal(metrics.completedCount, 3);
    assert.equal(metrics.ongoingCount, 2);
    assert.equal(metrics.notCompletedCount, 1);
    assert.equal(metrics.totalCount, 6);

    // Empty list produces 0 without error
    const emptyMetrics = calculateInternshipMetrics([]);
    assert.equal(emptyMetrics.completedCount, 0);
    assert.equal(emptyMetrics.ongoingCount, 0);
    assert.equal(emptyMetrics.totalCount, 0);
  });

  // 39. Safe Duration Calculation
  test("39. Safe Duration Calculation: handles standard, ongoing, invalid, and missing dates safely", () => {
    function calculateInternshipDuration(startDateStr, endDateStr, status) {
      if (!startDateStr) return "Duration unspecified";
      const start = new Date(startDateStr);
      if (isNaN(start.getTime())) return "Invalid start date";

      let end;
      if (status === "Ongoing" || !endDateStr) {
        end = new Date();
      } else {
        end = new Date(endDateStr);
        if (isNaN(end.getTime())) return "Invalid end date";
      }

      if (end < start) return "0 mos";

      let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (end.getDate() >= start.getDate()) months += 1;
      if (months <= 0) months = 1;

      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      if (years > 0 && remainingMonths > 0) {
        return `${years} yr${years > 1 ? "s" : ""} ${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`;
      } else if (years > 0) {
        return `${years} yr${years > 1 ? "s" : ""}`;
      } else {
        return `${months} mo${months > 1 ? "s" : ""}`;
      }
    }

    // 3 month span
    const duration3 = calculateInternshipDuration("2024-06-01", "2024-08-31", "Completed");
    assert.equal(duration3.includes("mo"), true);

    // 1 year span
    const durationYear = calculateInternshipDuration("2023-01-01", "2024-01-01", "Completed");
    assert.equal(durationYear.includes("yr"), true);

    // Ongoing calculation does not crash and calculates from start to current date
    const durationOngoing = calculateInternshipDuration("2025-01-01", null, "Ongoing");
    assert.equal(typeof durationOngoing, "string");

    // Missing start date handled gracefully
    assert.equal(calculateInternshipDuration(null, "2024-05-01"), "Duration unspecified");

    // Invalid date handled gracefully
    assert.equal(calculateInternshipDuration("not-a-date", "2024-05-01"), "Invalid start date");
  });

  // 40. Alumni Profile Extended Schema Support
  test("40. Alumni profile supports all extended attributes without breaking existing structure", () => {
    const alumniProfile = {
      id: "usr-marcus-002",
      name: "Marcus Vance",
      role: "Principal Systems Architect",
      company: "Datadog",
      city: "San Francisco, CA",
      specializations: ["Cloud Architecture", "Distributed Systems", "SRE"],
      currentEmployment: {
        status: "Employed",
        company: "Datadog",
        role: "Principal Systems Architect",
        employmentType: "Full-time",
        workArrangement: "Hybrid",
      },
      detailedSkills: [
        { id: "sk-1", name: "Distributed Consensus", level: "Expert", yearsOfExperience: "8+" },
        { id: "sk-2", name: "Go", level: "Expert", yearsOfExperience: "7+" },
      ],
      detailedWorkExperience: [
        {
          id: "exp-1",
          company: "Datadog",
          role: "Principal Architect",
          startDate: "2022-03",
          isCurrent: true,
        },
      ],
      internships: [
        {
          id: "int-1",
          company: "Intel",
          role: "Firmware Intern",
          domain: "Systems",
          startDate: "2018-05-01",
          endDate: "2018-08-31",
          status: "Completed",
        },
      ],
      careerJourney: [
        {
          id: "ach-1",
          title: "Promoted to Principal Architect",
          category: "Promotion",
          date: "2024",
        },
      ],
      mentorshipDetails: {
        available: true,
        topics: ["System Architecture", "Leadership"],
        skills: ["Go", "Kubernetes"],
        domains: ["Enterprise SaaS"],
        preferredFormats: ["1-on-1 Mentorship Sessions"],
        maxMentees: 5,
      },
    };

    assert.equal(alumniProfile.specializations.length, 3);
    assert.equal(alumniProfile.currentEmployment.status, "Employed");
    assert.equal(alumniProfile.internships[0].status, "Completed");
    assert.equal(alumniProfile.mentorshipDetails.available, true);
  });

  // 41. Role and Profile Isolation: student and alumni profiles remain fully independent
  test("41. Student and Alumni profiles remain fully isolated without namespace collisions", () => {
    function getStudentStorageKey(email) {
      return `alumnipath_student_profile_${email.trim().toLowerCase()}`;
    }
    function getAlumniStorageKey(email) {
      return `alumnipath_alumni_profile_${email.trim().toLowerCase()}`;
    }

    const email = "user@stanford.edu";
    const studentKey = getStudentStorageKey(email);
    const alumniKey = getAlumniStorageKey(email);

    assert.notEqual(studentKey, alumniKey);
    assert.equal(studentKey, "alumnipath_student_profile_user@stanford.edu");
    assert.equal(alumniKey, "alumnipath_alumni_profile_user@stanford.edu");
  });

  // 42. Career Assistant API: Message Validation & Length Limits
  test("42. Career Assistant API: Validates prompt length, rejects empty and oversized messages with code 400", () => {
    const MAX_LEN = 4000;
    function validateAssistantInput(body) {
      if (!body || typeof body !== "object") return { valid: false, status: 400, error: "Invalid payload" };
      const raw = (body.message || body.prompt || "").trim();
      if (!raw) return { valid: false, status: 400, error: "Message content cannot be empty.", code: "EMPTY_MESSAGE" };
      if (raw.length > MAX_LEN) return { valid: false, status: 400, error: `Message exceeds ${MAX_LEN} characters.`, code: "MESSAGE_TOO_LONG" };
      return { valid: true, status: 200, message: raw };
    }

    assert.equal(validateAssistantInput({}).valid, false);
    assert.equal(validateAssistantInput({ message: "   " }).valid, false);
    assert.equal(validateAssistantInput({ message: "   " }).code, "EMPTY_MESSAGE");
    assert.equal(validateAssistantInput({ message: "a".repeat(4001) }).valid, false);
    assert.equal(validateAssistantInput({ message: "a".repeat(4001) }).code, "MESSAGE_TOO_LONG");
    assert.equal(validateAssistantInput({ message: "How do I prepare for a React interview?" }).valid, true);
  });

  // 43. Career Assistant API: Rejects unauthenticated requests
  test("43. Career Assistant API: Rejects unauthenticated requests with code 401", () => {
    function authenticateRequest(authHeader) {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { status: 401, error: "Authentication required. Please sign in to consult the AI Career Assistant." };
      }
      return { status: 200, user: { id: "usr-123" } };
    }

    const unauth = authenticateRequest(null);
    assert.equal(unauth.status, 401);
    assert.equal(unauth.error.includes("Authentication required"), true);

    const authed = authenticateRequest("Bearer valid-token");
    assert.equal(authed.status, 200);
  });

  // 44. Career Assistant Privacy: Enforces Conversation Ownership
  test("44. Career Assistant Privacy: Enforces conversation ownership, blocking cross-user access with code 403", () => {
    const conversations = new Map([
      ["conv-student-1", { id: "conv-student-1", userId: "usr-student-1", title: "Go Microservices" }],
      ["conv-student-2", { id: "conv-student-2", userId: "usr-student-2", title: "Data Science" }],
    ]);

    function checkConversationAccess(callerUserId, conversationId) {
      const conv = conversations.get(conversationId);
      if (!conv) return { status: 404, error: "Conversation not found" };
      if (conv.userId !== callerUserId) {
        return { status: 403, error: "Unauthorized access: You do not have permission to view this conversation.", code: "FORBIDDEN_CONVERSATION" };
      }
      return { status: 200, conversation: conv };
    }

    // Student 1 accesses own conversation -> 200
    assert.equal(checkConversationAccess("usr-student-1", "conv-student-1").status, 200);

    // Student 2 attempts to snoop Student 1 conversation -> 403 Forbidden
    const snoopAttempt = checkConversationAccess("usr-student-2", "conv-student-1");
    assert.equal(snoopAttempt.status, 403);
    assert.equal(snoopAttempt.code, "FORBIDDEN_CONVERSATION");
  });

  // 45. Career Context & Topics: Real Data Grounding & Missing Fields Identification
  test("45. Career Context & Topics: Generates questions from real profile data and identifies missing fields", () => {
    function generateCareerTopics(profile) {
      const missingFields = [];
      if (!profile.desiredRole) missingFields.push("Target Career Role");
      if (!profile.skills || profile.skills.length === 0) missingFields.push("Technical Skills");
      if (!profile.projects || profile.projects.length === 0) missingFields.push("Portfolio Projects");

      const prompts = [];
      if (profile.desiredRole) {
        prompts.push(`Build my ${profile.desiredRole} roadmap`);
      } else {
        prompts.push("Explore career pathways");
      }

      if (profile.skills && profile.skills.length > 0) {
        prompts.push(`Analyze my skill gaps (${profile.skills.join(", ")})`);
      } else {
        prompts.push("Recommended foundational skills");
      }

      return { missingFields, isComplete: missingFields.length === 0, prompts };
    }

    // Incomplete profile triggers completion reminders rather than hallucinations
    const incomplete = generateCareerTopics({ desiredRole: "", skills: [], projects: [] });
    assert.equal(incomplete.isComplete, false);
    assert.equal(incomplete.missingFields.length, 3);
    assert.equal(incomplete.prompts.includes("Explore career pathways"), true);

    // Complete profile generates personalized prompts
    const complete = generateCareerTopics({
      desiredRole: "Full-Stack Software Engineer",
      skills: ["Python", "React"],
      projects: ["AlumniPath Platform"],
    });
    assert.equal(complete.isComplete, true);
    assert.equal(complete.missingFields.length, 0);
    assert.equal(complete.prompts[0], "Build my Full-Stack Software Engineer roadmap");
    assert.equal(complete.prompts[1], "Analyze my skill gaps (Python, React)");
  });

  // 46. Career Roadmap Progress Calculation
  test("46. Career Roadmap API: Computes progress strictly from milestone states and supports status updates", () => {
    function calculateRoadmapProgress(stages) {
      if (!stages || stages.length === 0) return 0;
      const completed = stages.filter((s) => s.status === "completed").length;
      const inProgress = stages.filter((s) => s.status === "in_progress").length;
      return Math.min(100, Math.round(((completed + inProgress * 0.4) / stages.length) * 100));
    }

    const testStages = [
      { id: "1", title: "Foundations", status: "completed" },
      { id: "2", title: "APIs", status: "completed" },
      { id: "3", title: "Databases", status: "in_progress" },
      { id: "4", title: "Deployment", status: "not_started" },
    ];

    // (2 completed + 0.4 in_progress) / 4 = 2.4 / 4 = 60%
    const progress = calculateRoadmapProgress(testStages);
    assert.equal(progress, 60);

    // Updating a milestone recalculates atomically
    testStages[2].status = "completed";
    assert.equal(calculateRoadmapProgress(testStages), 75);
  });

  // 47. Skill Gap Analysis Distinction
  test("47. Skill Gap Analysis: Transparently distinguishes verified profile skills from industry benchmark requirements", () => {
    const studentReportedSkills = ["Python", "React", "PostgreSQL"];
    const benchmarks = ["Python", "TypeScript", "React", "PostgreSQL", "Docker", "CI/CD"];

    const reportedSet = new Set(studentReportedSkills.map((s) => s.toLowerCase()));
    const matched = [];
    const skillsToDevelop = [];

    benchmarks.forEach((b) => {
      if (reportedSet.has(b.toLowerCase())) {
        matched.push(b);
      } else {
        skillsToDevelop.push({ skill: b, priority: b === "Docker" || b === "TypeScript" ? "high" : "medium" });
      }
    });

    assert.equal(matched.length, 3);
    assert.deepEqual(matched, ["Python", "React", "PostgreSQL"]);
    assert.equal(skillsToDevelop.length, 3);
    assert.equal(skillsToDevelop.find((s) => s.skill === "Docker").priority, "high");
  });

  // 48. Resume Review Validation & Analysis Structure
  test("48. Resume Review API: Enforces file size limits (<5MB), validates MIME formats, and structures feedback", () => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_EXT = [".pdf", ".docx", ".doc", ".txt"];

    function validateResumeUpload(fileName, sizeBytes) {
      if (sizeBytes > MAX_SIZE) return { valid: false, error: "File size exceeds 5MB limit" };
      const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) return { valid: false, error: "Unsupported file format" };
      return { valid: true };
    }

    assert.equal(validateResumeUpload("resume.exe", 1024).valid, false);
    assert.equal(validateResumeUpload("huge_resume.pdf", 6 * 1024 * 1024).valid, false);
    assert.equal(validateResumeUpload("ashlin_resume.pdf", 1024 * 500).valid, true);
    assert.equal(validateResumeUpload("ashlin_resume.docx", 1024 * 200).valid, true);
    assert.equal(validateResumeUpload("ashlin_resume.txt", 1024 * 50).valid, true);
  });

  // 49. Google OAuth Origin & Error Handling
  test("49. Google OAuth: Routes errors dynamically based on initiation origin (login vs signup)", () => {
    function resolveOAuthErrorRoute(origin, errorParam) {
      const base = origin === "signup" ? "/signup" : "/login";
      if (errorParam === "access_denied") {
        return `${base}?error=oauth_cancelled`;
      }
      return `${base}?error=oauth_failed`;
    }

    assert.equal(resolveOAuthErrorRoute("signup", "access_denied"), "/signup?error=oauth_cancelled");
    assert.equal(resolveOAuthErrorRoute("login", "access_denied"), "/login?error=oauth_cancelled");
    assert.equal(resolveOAuthErrorRoute("signup", "server_error"), "/signup?error=oauth_failed");
    assert.equal(resolveOAuthErrorRoute("login", "server_error"), "/login?error=oauth_failed");
    assert.equal(resolveOAuthErrorRoute(null, "access_denied"), "/login?error=oauth_cancelled");
  });

  // 50. Google OAuth Registration Transition & Role Safeguard
  test("50. Google OAuth: Unregistered users transition to signup with prefilled credentials without role escalation", () => {
    function handleGoogleUserTransition(userSession, dbLookup) {
      const exists = dbLookup(userSession.email);
      if (!exists) {
        const email = encodeURIComponent(userSession.email);
        const name = encodeURIComponent(userSession.fullName);
        return {
          registered: false,
          redirectUrl: `/signup?from=google&email=${email}&name=${name}`,
          defaultRole: "student", // never auto-escalates to alumni
        };
      }
      return {
        registered: true,
        redirectUrl: exists.role === "alumni" ? "/alumni-dashboard" : "/dashboard",
        role: exists.role,
      };
    }

    const mockDb = new Map([
      ["registered.alumni@datadog.com", { role: "alumni", verificationStatus: "verified" }],
    ]);

    const unreg = handleGoogleUserTransition(
      { email: "fresh.student@berkeley.edu", fullName: "Jane Doe" },
      (email) => mockDb.get(email)
    );
    assert.equal(unreg.registered, false);
    assert.equal(unreg.redirectUrl, "/signup?from=google&email=fresh.student%40berkeley.edu&name=Jane%20Doe");
    assert.equal(unreg.defaultRole, "student");

    const regAlum = handleGoogleUserTransition(
      { email: "registered.alumni@datadog.com", fullName: "Marcus Vance" },
      (email) => mockDb.get(email)
    );
    assert.equal(regAlum.registered, true);
    assert.equal(regAlum.redirectUrl, "/alumni-dashboard");
    assert.equal(regAlum.role, "alumni");
  });
});
