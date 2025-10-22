/** Utilitaires pour gérer le thème avec les cookies. */

const THEME_COOKIE_NAME = 'theme';
const COOKIE_MAX_AGE = 31536000; // 1 an en secondes

/**
 * Définit le cookie de thème avec une durée de 1 an.
 */
function setThemeCookie(theme: 'dark' | 'light'): void {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
/**
 * Active les boutons de switch de thème et persiste le choix en cookie.
 * À appeler dans setupDarkMode() depuis index.ts.
 */
export function setupDarkMode(): void {
  const lightBtn = document.getElementById('light-mode');
  const darkBtn = document.getElementById('dark-mode');

  if (!lightBtn || !darkBtn) return;

  // Fonction pour appliquer le thème immédiatement
  function applyTheme(theme: 'dark' | 'light') {
    if (theme === 'dark') {
      document.body.classList.add('body-dark-mode');
    } else {
      document.body.classList.remove('body-dark-mode');
    }
    setThemeCookie(theme);
  }

  lightBtn.addEventListener('click', () => {
    applyTheme('light');
  });

  darkBtn.addEventListener('click', () => {
    applyTheme('dark');
  });
}
