/** Utilitaires pour gérer le thème avec les cookies. */

const THEME_COOKIE_NAME = 'theme';
const COOKIE_MAX_AGE = 31536000; // 1 an en secondes

/**
 * Lit le thème depuis le cookie, sinon "light" par défaut (on ignore la préférence système).
 */
function getStoredTheme(): 'dark' | 'light' {
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${THEME_COOKIE_NAME}=`))
    ?.split('=')[1];

  if (cookieValue === 'dark' || cookieValue === 'light') {
    return cookieValue;
  }
  // Fallback: toujours light (pas de préférence système)
  return 'light';
}

/**
 * Définit le cookie de thème avec une durée de 1 an.
 */
function setThemeCookie(theme: 'dark' | 'light'): void {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Applique le thème stocké le plus tôt possible, avant le rendu Webflow.
 * À appeler AVANT window.Webflow.push().
 */
export function applyStoredThemeEarly(): void {
  const theme = getStoredTheme();
  if (theme === 'dark') {
    document.body.classList.add('body-dark-mode');
  } else {
    document.body.classList.remove('body-dark-mode');
  }
}

/**
 * Active les boutons de switch de thème et persiste le choix en cookie.
 * À appeler dans setupDarkMode() depuis index.ts.
 */
export function setupDarkMode(): void {
  const lightBtn = document.getElementById('light-mode');
  const darkBtn = document.getElementById('dark-mode');

  if (!lightBtn || !darkBtn) return;

  lightBtn.addEventListener('click', () => {
    document.body.classList.remove('body-dark-mode');
    setThemeCookie('light');
  });

  darkBtn.addEventListener('click', () => {
    document.body.classList.add('body-dark-mode');
    setThemeCookie('dark');
  });
}
