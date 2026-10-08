// Theme: follow the system unless the user picks a theme, which is remembered.
const root = document.documentElement;
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const toggle = document.querySelector('.theme-toggle');

function applyTheme() {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches;
  root.classList.toggle('is-dark', dark);
  toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
}
toggle.addEventListener('click', () => {
  root.dataset.theme = root.classList.contains('is-dark') ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  applyTheme();
});
systemDark.addEventListener('change', applyTheme);
applyTheme();

// Reading progress bar.
const bar = document.querySelector('.progress__bar');
let ticking = false;
function updateProgress() {
  const max = root.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

// Table of contents: highlight the section being read; collapsible on mobile.
const tocDetails = document.querySelector('.toc__details');
const tocCurrent = document.querySelector('.toc__current');
const links = [...document.querySelectorAll('.toc__list a')];
const sections = links.map(a => document.querySelector(a.hash));
const mobile = matchMedia('(max-width: 899.98px)');

function syncTocOpen() { tocDetails.open = !mobile.matches; }
mobile.addEventListener('change', syncTocOpen);
syncTocOpen();

function setActive(i) {
  links.forEach((a, j) => i === j ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  tocCurrent.textContent = i >= 0 ? links[i].textContent : '';
}
function updateActive() {
  const line = innerHeight * 0.3;
  let i = -1;
  sections.forEach((s, j) => { if (s.getBoundingClientRect().top <= line) i = j; });
  setActive(i);
}
addEventListener('scroll', () => requestAnimationFrame(updateActive), { passive: true });
updateActive();

links.forEach(a => a.addEventListener('click', () => { if (mobile.matches) tocDetails.open = false; }));

// Reference previews on hover/focus of citation links.
const tip = Object.assign(document.createElement('div'), { className: 'ref-tip', hidden: true, role: 'tooltip', id: 'ref-tip' });
document.body.append(tip);
let hideTimer;
function showTip(a) {
  const ref = document.querySelector(a.hash);
  if (!ref) return;
  clearTimeout(hideTimer);
  tip.innerHTML = ref.innerHTML;
  tip.hidden = false;
  const r = a.getBoundingClientRect();
  const left = Math.max(12, Math.min(r.left + scrollX - 20, scrollX + innerWidth - tip.offsetWidth - 12));
  const above = r.top > tip.offsetHeight + 80;
  tip.style.left = `${left}px`;
  tip.style.top = `${(above ? r.top - tip.offsetHeight - 8 : r.bottom + 8) + scrollY}px`;
  a.setAttribute('aria-describedby', 'ref-tip');
}
function hideTip() { hideTimer = setTimeout(() => { tip.hidden = true; }, 150); }
document.querySelectorAll('sup.cite a').forEach(a => {
  a.addEventListener('mouseenter', () => showTip(a));
  a.addEventListener('focus', () => showTip(a));
  a.addEventListener('mouseleave', hideTip);
  a.addEventListener('blur', hideTip);
});
tip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
tip.addEventListener('mouseleave', hideTip);
addEventListener('keydown', e => { if (e.key === 'Escape') tip.hidden = true; });
