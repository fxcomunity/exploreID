/**
 * Cookie Helper for Admin Session (7 Days Expiration)
 */
export const ADMIN_COOKIE_NAME = 'wm_admin_session';

export function setAdminCookie(token: string, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
  localStorage.setItem('wm_admin_user', 'admin@jack-ai.my.id');
}

export function getAdminCookie(): string | null {
  const name = `${ADMIN_COOKIE_NAME}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

export function removeAdminCookie() {
  document.cookie = `${ADMIN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`;
  localStorage.removeItem('wm_admin_user');
  sessionStorage.removeItem('wm_admin_token');
  sessionStorage.removeItem('wm_admin_user');
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminCookie() || sessionStorage.getItem('wm_admin_token'));
}
