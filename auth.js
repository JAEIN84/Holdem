/* ============================================================
   홀덤 리그 공통 로그인 모듈 (모든 페이지가 함께 사용)
   API_BASE: Cloudflare Worker 주소 (끝에 / 없이)
   ============================================================ */
const HOLDEM = {
  API_BASE: 'https://holdem-api.gyum0614.workers.dev',
  PAGES: { login: 'login.html', dashboard: 'index.html', record: 'record.html', admin: 'admin.html' }
};
const TOKEN_KEY = 'holdem_token', USER_KEY = 'holdem_user', SAVED_ID_KEY = 'holdem_saved_id';

/* 로그인 상태는 sessionStorage: 앱(탭)이 열려 있는 동안만 유지되고, 앱을 완전히 닫으면 다시 로그인 */
const Auth = {
  token: () => sessionStorage.getItem(TOKEN_KEY) || '',
  user: () => { try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch (e) { return null; } },
  set(token, user) { sessionStorage.setItem(TOKEN_KEY, token); sessionStorage.setItem(USER_KEY, JSON.stringify(user)); },
  clear() { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); },
  savedId: () => localStorage.getItem(SAVED_ID_KEY) || '',
  saveId(id) { id ? localStorage.setItem(SAVED_ID_KEY, id) : localStorage.removeItem(SAVED_ID_KEY); },
  toLogin() {
    const here = location.pathname.split('/').pop() || HOLDEM.PAGES.dashboard;
    location.replace(`${HOLDEM.PAGES.login}?next=${encodeURIComponent(here + location.search + location.hash)}`);
  },
  /* 페이지 진입 시 호출: 로그인 안 되어 있으면 로그인 화면으로, roles 지정 시 권한 확인 */
  require(roles) {
    const u = Auth.user();
    if (!Auth.token() || !u) { Auth.toLogin(); return null; }
    if (roles && !roles.includes(u.role)) return { ...u, denied: true };
    return u;
  },
  async logout() {
    try { await fetch(HOLDEM.API_BASE + '/api/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + Auth.token() } }); } catch (e) {}
    Auth.clear(); location.replace(HOLDEM.PAGES.login);
  }
};

async function api(method, path, body) {
  const r = await fetch(HOLDEM.API_BASE + path, {
    method, cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Auth.token() },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/api/login') { Auth.clear(); Auth.toLogin(); throw new Error(j.error || '다시 로그인하세요.'); }
  if (!r.ok) throw new Error(j.error || `요청 실패 (${r.status})`);
  return j;
}
