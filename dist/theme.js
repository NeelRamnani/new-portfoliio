(() => {
  const root = document.documentElement;
  const button = document.querySelector('#theme-toggle');
  const label = button.querySelector('.theme-label');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let explicit = null;
  try { const saved = localStorage.getItem('neel-theme'); if (saved === 'light' || saved === 'dark') explicit = saved; } catch {}
  const apply = theme => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const next = theme === 'dark' ? 'Light' : 'Dark';
    label.textContent = next + ' mode';
    button.setAttribute('aria-label', 'Switch to ' + next.toLowerCase() + ' mode');
    button.title = 'Switch to ' + next.toLowerCase() + ' mode';
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#090b16' : '#f8f9fc';
    document.dispatchEvent(new CustomEvent('neel:themechange', {detail:{theme}}));
  };
  button.addEventListener('click', () => {
    explicit = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('neel-theme', explicit); } catch {}
    apply(explicit);
  });
  preference.addEventListener('change', event => { if (!explicit) apply(event.matches ? 'dark' : 'light'); });
  window.addEventListener('storage', event => {
    if (event.key !== 'neel-theme') return;
    explicit = ['light','dark'].includes(event.newValue) ? event.newValue : null;
    apply(explicit || (preference.matches ? 'dark' : 'light'));
  });
  apply(explicit || (preference.matches ? 'dark' : 'light'));
})();
