import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  badgeNumber: string;
  clearanceLevel: string;
  role: string;
  agencyDivision: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  action:
    | "PROFILE_UPDATED"
    | "USER_LOGIN"
    | "USER_LOGOUT"
    | "DOSSIER_ACCESSED"
    | "EVIDENCE_VERIFIED"
    | "CLUE_CREATED"
    | "CLUE_UPDATED"
    | "CLUE_DELETED"
    | "CLUE_CONNECTED"
    | "AI_ANALYSIS_INITIATED"
    | "AI_ANALYSIS_COMPLETED"
    | "GEOSPATIAL_ACCESSED"
    | (string & {});
  userId: string;
  userName: string;
  field?: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit-logs.json");

export const DEFAULT_CLASSIFIED_PASSWORD = "cipher-classified-pass";

export const DEFAULT_USER: UserRecord = {
  id: "usr-0142-sharma",
  email: "analyst.sharma@cipher.intel",
  name: "Amit Sharma",
  badgeNumber: "BADGE-4892",
  clearanceLevel: "L3",
  role: "INVESTIGATOR",
  agencyDivision: "Organized Cybercrime & Transnational Contraband Taskforce",
  createdAt: "2026-01-15T08:00:00.000Z",
  updatedAt: "2026-09-08T08:00:00.000Z",
};

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: "aud-001",
    action: "DOSSIER_ACCESSED",
    userId: "usr-0142-sharma",
    userName: "Amit Sharma",
    details: "Accessed Case #INV-2026-0142 (Operation Nexus)",
    timestamp: "2026-05-21T19:25:01.000Z",
  },
  {
    id: "aud-002",
    action: "EVIDENCE_VERIFIED",
    userId: "usr-0142-sharma",
    userName: "Amit Sharma",
    details: "Verified SHA-256 evidence integrity token EVD-0142-01",
    timestamp: "2026-05-21T19:30:12.000Z",
  },
];

let cachedUsers: UserRecord[] | null = null;
let cachedUsersMtime: number = 0;

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([DEFAULT_USER], null, 2), "utf-8");
  }

  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(INITIAL_AUDIT_LOGS, null, 2), "utf-8");
  }
}

export function readUsers(): UserRecord[] {
  try {
    ensureDataFiles();
    const stats = fs.statSync(USERS_FILE);
    if (cachedUsers && stats.mtimeMs === cachedUsersMtime) {
      return cachedUsers;
    }
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    cachedUsers = Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_USER];
    cachedUsersMtime = stats.mtimeMs;
    return cachedUsers;
  } catch (err) {
    console.error("[CIPHER DB] Error reading users file:", err);
    if (cachedUsers) return cachedUsers;
    return [DEFAULT_USER];
  }
}

export function writeUsers(users: UserRecord[]): void {
  ensureDataFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  cachedUsers = users;
  try {
    const stats = fs.statSync(USERS_FILE);
    cachedUsersMtime = stats.mtimeMs;
  } catch (_) {}
}

export function verifyPassword(expectedPassword: string, inputPassword: string): boolean {
  if (!expectedPassword || !inputPassword) return false;
  // Constant-time comparison using sha256 digests
  const expectedBuf = crypto.createHash("sha256").update(expectedPassword).digest();
  const inputBuf = crypto.createHash("sha256").update(inputPassword).digest();
  return crypto.timingSafeEqual(expectedBuf, inputBuf);
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; agencyDivision?: string }
): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  // 1. Validation
  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (!trimmed) {
      return { success: false, error: "Name is required." };
    }
    if (trimmed.length < 2) {
      return { success: false, error: "Name must be at least 2 characters long." };
    }
    if (trimmed.length > 60) {
      return { success: false, error: "Name cannot exceed 60 characters." };
    }
  }

  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, error: "User not found." };
  }

  const prevUser = users[index];
  const prevName = prevUser.name;
  const newName = updates.name ? updates.name.trim() : prevName;
  const newDivision = updates.agencyDivision ? updates.agencyDivision.trim() : prevUser.agencyDivision;

  const updatedUser: UserRecord = {
    ...prevUser,
    name: newName,
    agencyDivision: newDivision,
    updatedAt: new Date().toISOString(),
  };

  users[index] = updatedUser;
  writeUsers(users);

  // 2. Audit Trail Logging if name changed
  if (prevName !== newName) {
    await recordAuditEvent({
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      action: "PROFILE_UPDATED",
      userId: updatedUser.id,
      userName: updatedUser.name,
      field: "name",
      previousValue: prevName,
      newValue: newName,
      details: `Profile name updated from '${prevName}' to '${newName}'`,
      timestamp: new Date().toISOString(),
    });
  }

  return { success: true, user: updatedUser };
}

export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(AUDIT_FILE, "utf-8");
    const logs: AuditEvent[] = JSON.parse(data);
    logs.unshift(event);
    // Keep last 100 audit events
    if (logs.length > 100) {
      logs.length = 100;
    }
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("[CIPHER DB] Error recording audit event:", err);
  }
}

export async function getAuditLogs(): Promise<AuditEvent[]> {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(AUDIT_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("[CIPHER DB] Error reading audit logs:", err);
    return INITIAL_AUDIT_LOGS;
  }
}
