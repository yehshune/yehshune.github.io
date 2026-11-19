// 在 <head> 同步載入，預設套用深炭黑工坊主題，並支援淺色切換與記住偏好。
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
  root.dataset.theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';

  const current = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const updateLabels = (btn) => {
    const next = current() === 'dark' ? '淺色' : '深色';
    btn.setAttribute('aria-label', `切換為${next}模式`);
    btn.setAttribute('aria-pressed', String(current() === 'light'));
    btn.title = `切換為${next}模式`;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    buttons.forEach((btn) => {
      updateLabels(btn);
      btn.addEventListener('click', () => {
        const next = current() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        write(next);
        buttons.forEach(updateLabels);
      });
    });
  });
})();
