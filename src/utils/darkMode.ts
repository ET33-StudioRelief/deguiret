/**
 * Dark mode toggle: adds/removes 'body-dark-mode' class on <body>
 */
export function setupDarkMode(): void {
  const lightBtn = document.getElementById('light-mode');
  const darkBtn = document.getElementById('dark-mode');

  if (!lightBtn || !darkBtn) return;

  lightBtn.addEventListener('click', () => {
    document.body.classList.remove('body-dark-mode');
    localStorage.setItem('theme', 'light');
  });

  darkBtn.addEventListener('click', () => {
    document.body.classList.add('body-dark-mode');
    localStorage.setItem('theme', 'dark');
  });

  // Initialize from localStorage or system preference
  const stored = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (systemPrefersDark ? 'dark' : 'light');

  if (theme === 'dark') {
    document.body.classList.add('body-dark-mode');
  }
}
