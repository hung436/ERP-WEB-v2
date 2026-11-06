export const SESSION_KEY = 'erp-session';

export function getSessionToken(): string | null {
  const sharedToken = window.localStorage.getItem(SESSION_KEY);
  if (sharedToken) return sharedToken;

  // Chuyển phiên cũ sang bộ nhớ dùng chung giữa các tab.
  const legacyToken = window.sessionStorage.getItem(SESSION_KEY);
  if (legacyToken) {
    window.localStorage.setItem(SESSION_KEY, legacyToken);
    window.sessionStorage.removeItem(SESSION_KEY);
  }
  return legacyToken;
}

export function setSessionToken(token: string): void {
  window.localStorage.setItem(SESSION_KEY, token);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function clearSessionToken(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}
