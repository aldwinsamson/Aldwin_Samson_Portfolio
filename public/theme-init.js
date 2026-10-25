(function () {
  try {
    var d = document.documentElement;
    d.classList.remove('no-js');
    var stored = localStorage.getItem('jas-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
    if (theme === 'dark') d.classList.add('dark');
    d.style.colorScheme = theme;
  } catch (e) {}
})();
