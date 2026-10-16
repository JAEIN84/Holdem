/* =====================================================================
   Tri-City Hold'em 공통 기능 (대시보드·기록·관리자·로그인 페이지가 함께 사용)
   금액 표시, 글자 안전 처리, 날짜 형식, 알림 등을 한곳에서 관리합니다.
   ===================================================================== */
const $ = s => document.querySelector(s);
// 사용자 입력을 화면에 넣을 때 HTML로 해석되지 않도록 바꿔 줌
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* 금액: 단위는 만원. signed는 화면용(작은 '만' 포함), signedT는 숫자만(그래프 눈금·알림 문구용) */
const signedT = v => v > 0 ? '+' + v.toLocaleString('ko-KR') : v < 0 ? '−' + Math.abs(v).toLocaleString('ko-KR') : '0';
const UNIT = '<span class="u">만</span>';
const signed = v => signedT(v) + UNIT;
const tone = v => v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero';
const pct = v => (v * 100).toFixed(1) + '%';
const sum = a => a.reduce((x, y) => x + y, 0);

/* 날짜 */
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const D = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const ymd = s => s.slice(2).replace(/-/g, '.');
const ym = s => s.slice(0, 7);
const ymLabel = k => `${k.slice(0, 4)}년 ${Number(k.slice(5))}월`;
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const when = iso => { if (!iso) return '-'; const d = new Date(iso); return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${d.toTimeString().slice(0, 5)}`; };

/* 화면 부품 */
const chip = c => `<span class="chip" style="--c:${c}" aria-hidden="true"></span>`;
const toast = msg => {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2000);
};
