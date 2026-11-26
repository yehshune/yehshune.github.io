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
  const isZhHans = () => /^zh-(Hans|CN)/i.test(root.lang || '');

  const updateLabels = (btn) => {
    const label = isZhHans()
      ? (current() === 'dark' ? '切换为浅色模式' : '切换为深色模式')
      : (current() === 'dark' ? '切換為淺色模式' : '切換為深色模式');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-pressed', String(current() === 'light'));
    btn.title = label;
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
