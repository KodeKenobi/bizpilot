// Store last ITN attempt in memory (for debugging only)
// In production, you'd want to use a database or cache
let lastITNAttempt: {
  timestamp: string;
  requestId: string;
  data: any;
  errors: string[];
  status: "success" | "failed";
} | null = null;

export function setLastITNAttempt(attempt: typeof lastITNAttempt) {
  lastITNAttempt = attempt;
}

export function getLastITNAttempt() {
  return lastITNAttempt;
}

