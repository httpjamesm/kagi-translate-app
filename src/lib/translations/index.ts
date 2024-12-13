import i18n from "sveltekit-i18n";

/** @type {import('sveltekit-i18n').Config} */
const config = {
  loaders: [
    {
      locale: "fr",
      key: "common",
      loader: async () => (await import("./fr/common.json")).default,
    },
    // ar, da, de, en, es, fi, fr, hi, it, ja, ko, nl, no, pt, ru, sv, th, tr, vi, zh
    {
      locale: "ar",
      key: "common",
      loader: async () => (await import("./ar/common.json")).default,
    },
    {
      locale: "da",
      key: "common",
      loader: async () => (await import("./da/common.json")).default,
    },
    {
      locale: "de",
      key: "common",
      loader: async () => (await import("./de/common.json")).default,
    },
    {
      locale: "en",
      key: "common",
      loader: async () => (await import("./en/common.json")).default,
    },
    {
      locale: "es",
      key: "common",
      loader: async () => (await import("./es/common.json")).default,
    },
    {
      locale: "fi",
      key: "common",
      loader: async () => (await import("./fi/common.json")).default,
    },
    {
      locale: "hi",
      key: "common",
      loader: async () => (await import("./hi/common.json")).default,
    },
    {
      locale: "it",
      key: "common",
      loader: async () => (await import("./it/common.json")).default,
    },
    {
      locale: "ja",
      key: "common",
      loader: async () => (await import("./ja/common.json")).default,
    },
    {
      locale: "ko",
      key: "common",
      loader: async () => (await import("./ko/common.json")).default,
    },
    {
      locale: "nl",
      key: "common",
      loader: async () => (await import("./nl/common.json")).default,
    },
    {
      locale: "no",
      key: "common",
      loader: async () => (await import("./no/common.json")).default,
    },
    {
      locale: "pt",
      key: "common",
      loader: async () => (await import("./pt/common.json")).default,
    },
    {
      locale: "ru",
      key: "common",
      loader: async () => (await import("./ru/common.json")).default,
    },
    {
      locale: "sv",
      key: "common",
      loader: async () => (await import("./sv/common.json")).default,
    },
    {
      locale: "th",
      key: "common",
      loader: async () => (await import("./th/common.json")).default,
    },
    {
      locale: "tr",
      key: "common",
      loader: async () => (await import("./tr/common.json")).default,
    },
    {
      locale: "vi",
      key: "common",
      loader: async () => (await import("./vi/common.json")).default,
    },
    {
      locale: "zh",
      key: "common",
      loader: async () => (await import("./zh/common.json")).default,
    },
  ],
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(
  config
);
