// 在 <head> 同步載入，先套用記住的主題，避免頁面閃一下。
// 按鈕：<button class="theme-toggle" data-theme-toggle>，點擊在淺色／深色間切換並記住。
(() => {
  const KEY = 'theme';
  const root = document.documentElement;

  const read = () => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  };
  const write = (value) => {
    try { localStorage.setItem(KEY, value); } catch { /* 無法儲存時本次仍可切換 */ }
  };

  const saved = read();
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;

  const current = () => root.dataset.theme
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const label = (btn) => {
    const next = current() === 'dark' ? '淺色' : '深色';
    btn.setAttribute('aria-label', `切換為${next}模式`);
    btn.title = `切換為${next}模式`;
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      label(btn);
      btn.addEventListener('click', () => {
        const next = current() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        write(next);
        label(btn);
      });
    });
  });
})();
