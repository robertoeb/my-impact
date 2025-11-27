import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import enUS from "../locales/en-US.json";
import ptBR from "../locales/pt-BR.json";

type Theme = "system" | "light" | "dark";
type Locale = "en-US" | "pt-BR";

interface Translations {
  [key: string]: string | Translations;
}

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const locales: Record<Locale, Translations> = {
  "en-US": enUS,
  "pt-BR": ptBR,
};

const localeNames: Record<Locale, string> = {
  "en-US": "English (US)",
  "pt-BR": "Português (Brasil)",
};

function getNestedTranslation(obj: Translations, path: string): string {
  const keys = path.split(".");
  let current: Translations | string = obj;

  for (const key of keys) {
    if (typeof current === "object" && current !== null && key in current) {
      current = current[key] as Translations | string;
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof current === "string" ? current : path;
}

function getSystemLocale(): Locale {
  const browserLocale = navigator.language;

  if (browserLocale in locales) {
    return browserLocale as Locale;
  }

  const langPrefix = browserLocale.split("-")[0];
  if (langPrefix === "pt") return "pt-BR";
  if (langPrefix === "en") return "en-US";

  return "en-US";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [locale, setLocaleState] = useState<Locale>("en-US");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("myimpact-theme") as Theme | null;
    const savedLocale = localStorage.getItem(
      "myimpact-locale"
    ) as Locale | null;

    if (savedTheme) {
      setThemeState(savedTheme);
    }

    if (savedLocale && savedLocale in locales) {
      setLocaleState(savedLocale);
    } else {
      setLocaleState(getSystemLocale());
    }
  }, []);

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("myimpact-theme", newTheme);
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("myimpact-locale", newLocale);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(locales[locale], key);

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }

    return translation;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        locale,
        setLocale,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export { localeNames };
export type { Theme, Locale };
