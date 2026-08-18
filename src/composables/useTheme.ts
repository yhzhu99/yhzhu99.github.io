import { computed, ref } from "vue";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";
const LIGHT_THEME_COLOR = "#005bac";
const DARK_THEME_COLOR = "#121214";

const mediaQuery =
  typeof window !== "undefined" && "matchMedia" in window
    ? window.matchMedia(DARK_MODE_QUERY)
    : null;

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return mediaQuery?.matches ? "dark" : "light";
}

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode, privacy settings, etc.).
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  themeColor?.setAttribute(
    "content",
    theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
  );
}

let explicitTheme = readStoredTheme();
const theme = ref<Theme>(explicitTheme ?? systemTheme());
let initialized = false;

function handleSystemThemeChange(event: MediaQueryListEvent) {
  if (explicitTheme !== null) {
    return;
  }

  theme.value = event.matches ? "dark" : "light";
  applyTheme(theme.value);
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  explicitTheme =
    event.newValue === "light" || event.newValue === "dark"
      ? event.newValue
      : null;
  theme.value = explicitTheme ?? systemTheme();
  applyTheme(theme.value);
}

function initialize() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;
  applyTheme(theme.value);

  if (mediaQuery?.addEventListener) {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  } else if (mediaQuery?.addListener) {
    mediaQuery.addListener(handleSystemThemeChange);
  }

  window.addEventListener("storage", handleStorageChange);
}

export function useTheme() {
  initialize();

  const isDark = computed(() => theme.value === "dark");

  function setTheme(nextTheme: Theme) {
    explicitTheme = nextTheme;
    persistTheme(nextTheme);
    theme.value = nextTheme;
    applyTheme(nextTheme);
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
