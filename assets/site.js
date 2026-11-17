// 捲動淡入與教學頁目錄高亮；瀏覽器不支援 IntersectionObserver 時內容照常顯示。
(() => {
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js');

  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((el) => revealObserver.observe(el));

  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length === 0) return;
  const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const tocObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      tocLinks.forEach((a) => a.classList.remove('active'));
      byId.get(entry.target.id)?.classList.add('active');
    }
  }, { rootMargin: '-80px 0px -70% 0px' });
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) tocObserver.observe(section);
  });
})();
