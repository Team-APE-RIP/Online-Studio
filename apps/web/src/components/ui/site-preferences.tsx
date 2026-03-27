"use client";

import { useEffect, useMemo, useState } from "react";

type ThemeMode = "dark" | "light";
type LocaleMode = "zh-CN" | "en-US";

const THEME_STORAGE_KEY = "ape-online-studio-theme";
const LOCALE_STORAGE_KEY = "ape-online-studio-locale";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&")}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return "dark";
}

function getInitialLocale(): LocaleMode {
  if (typeof window === "undefined") {
    return "zh-CN";
  }

  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (savedLocale === "zh-CN" || savedLocale === "en-US") {
    return savedLocale;
  }

  const cookieLocale = readCookie("locale");
  if (cookieLocale === "zh-CN" || cookieLocale === "en-US") {
    return cookieLocale;
  }

  return "zh-CN";
}

export function SitePreferences() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [locale, setLocale] = useState<LocaleMode>("zh-CN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nextTheme = getInitialTheme();
    const nextLocale = getInitialLocale();

    setTheme(nextTheme);
    setLocale(nextLocale);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.lang = nextLocale;
    setMounted(true);
  }, []);

  function handleThemeChange(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    setCookie("theme", nextTheme);
  }

  function handleLocaleChange(nextLocale: LocaleMode) {
    setLocale(nextLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
    setCookie("locale", nextLocale);
    window.location.reload();
  }

  const localeLabel = useMemo(() => {
    return locale === "zh-CN" ? "简中" : "EN";
  }, [locale]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="site-preferences">
      <div className="preference-group">
        <span className="preference-label">Theme</span>
        <div className="segmented-control">
          <button
            type="button"
            onClick={() => handleThemeChange("dark")}
            className={`segmented-control__item ${
              theme === "dark" ? "is-active" : ""
            }`}
          >
            暗紫
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange("light")}
            className={`segmented-control__item ${
              theme === "light" ? "is-active" : ""
            }`}
          >
            樱粉
          </button>
        </div>
      </div>

      <div className="preference-group">
        <span className="preference-label">Locale</span>
        <button
          type="button"
          className="locale-chip"
          onClick={() => handleLocaleChange(locale === "zh-CN" ? "en-US" : "zh-CN")}
        >
          {localeLabel}
        </button>
      </div>
    </div>
  );
}