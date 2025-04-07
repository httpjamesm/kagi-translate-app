export interface Language {
  apiName: string; // iso name
  displayName: string; // Native name or commonly used name
  isoCode: string; // ISO 639-1 or 639-2 code
}

// Languages that use non-Latin scripts and benefit from romanization
const LANGUAGES_NEEDING_ROMANIZATION = new Set([
  "Japanese",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Korean",
  "Thai",
  "Vietnamese",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Arabic",
  "Persian",
  "Urdu",
  "Hebrew",
  "Russian",
  "Ukrainian",
  "Belarusian",
  "Bulgarian",
  "Georgian",
  "Armenian",
  "Mongolian",
  "Myanmar (Burmese)",
  "Khmer",
  "Lao",
  "Tibetan",
  "Nepali",
  "Sinhala",
  "Gujarati",
  "Punjabi (Gurmukhi)",
  "Punjabi (Shahmukhi)",
  "Marathi",
  "Sanskrit",
  "Odia (Oriya)",
  "Greek",
]);

export const needsRomanization = (language: Language): boolean => {
  return LANGUAGES_NEEDING_ROMANIZATION.has(language.apiName);
};

export const languages: Language[] = [
  {
    apiName: "Automatic",
    displayName: "Automatic",
    isoCode: "auto",
  },
  {
    apiName: "om",
    displayName: "(Afan)/Oromoor/Oriya",
    isoCode: "om",
  },
  {
    apiName: "ab",
    displayName: "Abkhazian",
    isoCode: "ab",
  },
  {
    apiName: "aa",
    displayName: "Afar",
    isoCode: "aa",
  },
  {
    apiName: "af",
    displayName: "Afrikaans",
    isoCode: "af",
  },
  {
    apiName: "ak",
    displayName: "Akan",
    isoCode: "ak",
  },
  {
    apiName: "sq",
    displayName: "Albanian",
    isoCode: "sq",
  },
  {
    apiName: "am",
    displayName: "Amharic",
    isoCode: "am",
  },
  {
    apiName: "ar",
    displayName: "Arabic",
    isoCode: "ar",
  },
  {
    apiName: "an",
    displayName: "Aragonese",
    isoCode: "an",
  },
  {
    apiName: "hy",
    displayName: "Armenian",
    isoCode: "hy",
  },
  {
    apiName: "as",
    displayName: "Assamese",
    isoCode: "as",
  },
  {
    apiName: "av",
    displayName: "Avaric",
    isoCode: "av",
  },
  {
    apiName: "ae",
    displayName: "Avestan",
    isoCode: "ae",
  },
  {
    apiName: "ay",
    displayName: "Aymara",
    isoCode: "ay",
  },
  {
    apiName: "az",
    displayName: "Azeri",
    isoCode: "az",
  },
  {
    apiName: "bm",
    displayName: "Bambara",
    isoCode: "bm",
  },
  {
    apiName: "ba",
    displayName: "Bashkir",
    isoCode: "ba",
  },
  {
    apiName: "eu",
    displayName: "Basque",
    isoCode: "eu",
  },
  {
    apiName: "be",
    displayName: "Belarusian",
    isoCode: "be",
  },
  {
    apiName: "bn",
    displayName: "Bengali",
    isoCode: "bn",
  },
  {
    apiName: "dz",
    displayName: "Bhutani",
    isoCode: "dz",
  },
  {
    apiName: "bh",
    displayName: "Bihari",
    isoCode: "bh",
  },
  {
    apiName: "bi",
    displayName: "Bislama",
    isoCode: "bi",
  },
  {
    apiName: "bs",
    displayName: "Bosnian",
    isoCode: "bs",
  },
  {
    apiName: "br",
    displayName: "Breton",
    isoCode: "br",
  },
  {
    apiName: "bg",
    displayName: "Bulgarian",
    isoCode: "bg",
  },
  {
    apiName: "my",
    displayName: "Burmese",
    isoCode: "my",
  },
  {
    apiName: "km",
    displayName: "Cambodian",
    isoCode: "km",
  },
  {
    apiName: "yue",
    displayName: "Cantonese",
    isoCode: "yue",
  },
  {
    apiName: "ca",
    displayName: "Catalan",
    isoCode: "ca",
  },
  {
    apiName: "ch",
    displayName: "Chamorro",
    isoCode: "ch",
  },
  {
    apiName: "ce",
    displayName: "Chechen",
    isoCode: "ce",
  },
  {
    apiName: "ny",
    displayName: "Chichewa",
    isoCode: "ny",
  },
  {
    apiName: "zh",
    displayName: "Chinese",
    isoCode: "zh",
  },
  {
    apiName: "zh_cn",
    displayName: "Chinese (Simplified)",
    isoCode: "zh-CN",
  },
  {
    apiName: "zh_tw",
    displayName: "Chinese (Traditional)",
    isoCode: "zh-TW",
  },
  {
    apiName: "cu",
    displayName: "Church Slavonic",
    isoCode: "cu",
  },
  {
    apiName: "cv",
    displayName: "Chuvash",
    isoCode: "cv",
  },
  {
    apiName: "kw",
    displayName: "Cornish",
    isoCode: "kw",
  },
  {
    apiName: "co",
    displayName: "Corsican",
    isoCode: "co",
  },
  {
    apiName: "cr",
    displayName: "Cree",
    isoCode: "cr",
  },
  {
    apiName: "hr",
    displayName: "Croatian",
    isoCode: "hr",
  },
  {
    apiName: "hr_ba",
    displayName: "Croatian (Bosnia and Herzegovina)",
    isoCode: "hr-BA",
  },
  {
    apiName: "hr_hr",
    displayName: "Croatian (Croatia)",
    isoCode: "hr-HR",
  },
  {
    apiName: "cs",
    displayName: "Czech",
    isoCode: "cs",
  },
  {
    apiName: "da",
    displayName: "Danish",
    isoCode: "da",
  },
  {
    apiName: "div",
    displayName: "Divehi",
    isoCode: "dv",
  },
  {
    apiName: "dv",
    displayName: "Divehi",
    isoCode: "dv",
  },
  {
    apiName: "nl",
    displayName: "Dutch",
    isoCode: "nl",
  },
  {
    apiName: "nl_be",
    displayName: "Dutch (Belgium)",
    isoCode: "nl-BE",
  },
  {
    apiName: "nl_nl",
    displayName: "Dutch (Netherlands)",
    isoCode: "nl-NL",
  },
  {
    apiName: "elvish",
    displayName: "Elvish (Sindarin)",
    isoCode: "elv",
  },
  {
    apiName: "emoji",
    displayName: "Emoji Speak",
    isoCode: "emj",
  },
  {
    apiName: "en",
    displayName: "English",
    isoCode: "en",
  },
  {
    apiName: "eo",
    displayName: "Esperanto",
    isoCode: "eo",
  },
  {
    apiName: "et",
    displayName: "Estonian",
    isoCode: "et",
  },
  {
    apiName: "ee",
    displayName: "Ewe",
    isoCode: "ee",
  },
  {
    apiName: "fo",
    displayName: "Faroese",
    isoCode: "fo",
  },
  {
    apiName: "fa",
    displayName: "Farsi",
    isoCode: "fa",
  },
  {
    apiName: "fj",
    displayName: "Fiji",
    isoCode: "fj",
  },
  {
    apiName: "fi",
    displayName: "Finnish",
    isoCode: "fi",
  },
  {
    apiName: "fr",
    displayName: "French",
    isoCode: "fr",
  },
  {
    apiName: "fy",
    displayName: "Frisian",
    isoCode: "fy",
  },
  {
    apiName: "ff",
    displayName: "Fulah",
    isoCode: "ff",
  },
  {
    apiName: "mk",
    displayName: "FYRO Macedonian",
    isoCode: "mk",
  },
  {
    apiName: "gd",
    displayName: "Gaelic",
    isoCode: "gd",
  },
  {
    apiName: "gl",
    displayName: "Galician",
    isoCode: "gl",
  },
  {
    apiName: "lg",
    displayName: "Ganda",
    isoCode: "lg",
  },
  {
    apiName: "ka",
    displayName: "Georgian",
    isoCode: "ka",
  },
  {
    apiName: "de",
    displayName: "German",
    isoCode: "de",
  },
  {
    apiName: "de_at",
    displayName: "German (Austria)",
    isoCode: "de-AT",
  },
  {
    apiName: "de_de",
    displayName: "German (Germany)",
    isoCode: "de-DE",
  },
  {
    apiName: "de_li",
    displayName: "German (Liechtenstein)",
    isoCode: "de-LI",
  },
  {
    apiName: "de_lu",
    displayName: "German (Luxembourg)",
    isoCode: "de-LU",
  },
  {
    apiName: "de_ch",
    displayName: "German (Switzerland)",
    isoCode: "de-CH",
  },
  {
    apiName: "el",
    displayName: "Greek",
    isoCode: "el",
  },
  {
    apiName: "kl",
    displayName: "Greenlandic",
    isoCode: "kl",
  },
  {
    apiName: "gn",
    displayName: "Guarani",
    isoCode: "gn",
  },
  {
    apiName: "gu",
    displayName: "Gujarati",
    isoCode: "gu",
  },
  {
    apiName: "ht",
    displayName: "Haitian",
    isoCode: "ht",
  },
  {
    apiName: "ha",
    displayName: "Hausa",
    isoCode: "ha",
  },
  {
    apiName: "he",
    displayName: "Hebrew",
    isoCode: "he",
  },
  {
    apiName: "iw",
    displayName: "Hebrew",
    isoCode: "iw",
  },
  {
    apiName: "hz",
    displayName: "Herero",
    isoCode: "hz",
  },
  {
    apiName: "hi",
    displayName: "Hindi",
    isoCode: "hi",
  },
  {
    apiName: "ho",
    displayName: "Hiri Motu",
    isoCode: "ho",
  },
  {
    apiName: "hu",
    displayName: "Hungarian",
    isoCode: "hu",
  },
  {
    apiName: "is",
    displayName: "Icelandic",
    isoCode: "is",
  },
  {
    apiName: "io",
    displayName: "Ido",
    isoCode: "io",
  },
  {
    apiName: "ig",
    displayName: "Igbo",
    isoCode: "ig",
  },
  {
    apiName: "id",
    displayName: "Indonesian",
    isoCode: "id",
  },
  {
    apiName: "in",
    displayName: "Indonesian",
    isoCode: "in",
  },
  {
    apiName: "ia",
    displayName: "Interlingua",
    isoCode: "ia",
  },
  {
    apiName: "ie",
    displayName: "Interlingue",
    isoCode: "ie",
  },
  {
    apiName: "iu",
    displayName: "Inuktitut",
    isoCode: "iu",
  },
  {
    apiName: "ik",
    displayName: "Inupiak",
    isoCode: "ik",
  },
  {
    apiName: "ga",
    displayName: "Irish",
    isoCode: "ga",
  },
  {
    apiName: "it",
    displayName: "Italian",
    isoCode: "it",
  },
  {
    apiName: "it_it",
    displayName: "Italian (Italy)",
    isoCode: "it-IT",
  },
  {
    apiName: "it_ch",
    displayName: "Italian (Switzerland)",
    isoCode: "it-CH",
  },
  {
    apiName: "ja",
    displayName: "Japanese",
    isoCode: "ja",
  },
  {
    apiName: "jv",
    displayName: "Javanese",
    isoCode: "jv",
  },
  {
    apiName: "jw",
    displayName: "Javanese",
    isoCode: "jw",
  },
  {
    apiName: "kn",
    displayName: "Kannada",
    isoCode: "kn",
  },
  {
    apiName: "kr",
    displayName: "Kanuri",
    isoCode: "kr",
  },
  {
    apiName: "ks",
    displayName: "Kashmiri",
    isoCode: "ks",
  },
  {
    apiName: "kk",
    displayName: "Kazakh",
    isoCode: "kk",
  },
  {
    apiName: "ki",
    displayName: "Kikuyu",
    isoCode: "ki",
  },
  {
    apiName: "rw",
    displayName: "Kinyarwanda",
    isoCode: "rw",
  },
  {
    apiName: "ky",
    displayName: "Kirghiz",
    isoCode: "ky",
  },
  {
    apiName: "rn",
    displayName: "Kirundi",
    isoCode: "rn",
  },
  {
    apiName: "klingon",
    displayName: "Klingon",
    isoCode: "tlh",
  },
  {
    apiName: "kv",
    displayName: "Komi",
    isoCode: "kv",
  },
  {
    apiName: "kg",
    displayName: "Kongo",
    isoCode: "kg",
  },
  {
    apiName: "kok",
    displayName: "Konkani",
    isoCode: "kok",
  },
  {
    apiName: "ko",
    displayName: "Korean",
    isoCode: "ko",
  },
  {
    apiName: "kj",
    displayName: "Kuanyama",
    isoCode: "kj",
  },
  {
    apiName: "ku",
    displayName: "Kurdish",
    isoCode: "ku",
  },
  {
    apiName: "kz",
    displayName: "Kyrgyz",
    isoCode: "ky",
  },
  {
    apiName: "lo",
    displayName: "Laothian",
    isoCode: "lo",
  },
  {
    apiName: "la",
    displayName: "Latin",
    isoCode: "la",
  },
  {
    apiName: "lv",
    displayName: "Latvian",
    isoCode: "lv",
  },
  {
    apiName: "li",
    displayName: "Limburgan",
    isoCode: "li",
  },
  {
    apiName: "ln",
    displayName: "Lingala",
    isoCode: "ln",
  },
  {
    apiName: "lt",
    displayName: "Lithuanian",
    isoCode: "lt",
  },
  {
    apiName: "lu",
    displayName: "Luba_Katanga",
    isoCode: "lu",
  },
  {
    apiName: "lb",
    displayName: "Luxembourgish",
    isoCode: "lb",
  },
  {
    apiName: "mg",
    displayName: "Malagasy",
    isoCode: "mg",
  },
  {
    apiName: "ms",
    displayName: "Malay",
    isoCode: "ms",
  },
  {
    apiName: "ms_bn",
    displayName: "Malay (Brunei Darussalam)",
    isoCode: "ms-BN",
  },
  {
    apiName: "ms_my",
    displayName: "Malay (Malaysia)",
    isoCode: "ms-MY",
  },
  {
    apiName: "ml",
    displayName: "Malayalam",
    isoCode: "ml",
  },
  {
    apiName: "mt",
    displayName: "Maltese",
    isoCode: "mt",
  },
  {
    apiName: "gv",
    displayName: "Manx",
    isoCode: "gv",
  },
  {
    apiName: "mi",
    displayName: "Maori",
    isoCode: "mi",
  },
  {
    apiName: "mr",
    displayName: "Marathi",
    isoCode: "mr",
  },
  {
    apiName: "mh",
    displayName: "Marshallese",
    isoCode: "mh",
  },
  {
    apiName: "middle_english",
    displayName: "Middle English",
    isoCode: "en-GB",
  },
  {
    apiName: "mo",
    displayName: "Moldavian",
    isoCode: "mo",
  },
  {
    apiName: "mn",
    displayName: "Mongolian",
    isoCode: "mn",
  },
  {
    apiName: "na",
    displayName: "Nauru",
    isoCode: "na",
  },
  {
    apiName: "nv",
    displayName: "Navajo",
    isoCode: "nv",
  },
  {
    apiName: "ng",
    displayName: "Ndonga",
    isoCode: "ng",
  },
  {
    apiName: "ne",
    displayName: "Nepali (India)",
    isoCode: "ne",
  },
  {
    apiName: "nd",
    displayName: "North Ndebele",
    isoCode: "nd",
  },
  {
    apiName: "ns",
    displayName: "Northern Sotho",
    isoCode: "ns",
  },
  {
    apiName: "no",
    displayName: "Norwegian",
    isoCode: "no",
  },
  {
    apiName: "nb",
    displayName: "Norwegian (Bokmal)",
    isoCode: "nb",
  },
  {
    apiName: "nn",
    displayName: "Norwegian (Nynorsk)",
    isoCode: "nn",
  },
  {
    apiName: "oc",
    displayName: "Occitan",
    isoCode: "oc",
  },
  {
    apiName: "oj",
    displayName: "Ojibwa",
    isoCode: "oj",
  },
  {
    apiName: "or",
    displayName: "Oriya",
    isoCode: "or",
  },
  {
    apiName: "os",
    displayName: "Ossetian",
    isoCode: "os",
  },
  {
    apiName: "pi",
    displayName: "Pali",
    isoCode: "pi",
  },
  {
    apiName: "ps",
    displayName: "Pashto/Pushto",
    isoCode: "ps",
  },
  {
    apiName: "pirate",
    displayName: "Pirate Speak",
    isoCode: "prt",
  },
  {
    apiName: "pl",
    displayName: "Polish",
    isoCode: "pl",
  },
  {
    apiName: "pt",
    displayName: "Portuguese",
    isoCode: "pt",
  },
  {
    apiName: "pt_br",
    displayName: "Portuguese (Brazil)",
    isoCode: "pt-BR",
  },
  {
    apiName: "pt_pt",
    displayName: "Portuguese (Portugal)",
    isoCode: "pt-PT",
  },
  {
    apiName: "pa",
    displayName: "Punjabi",
    isoCode: "pa",
  },
  {
    apiName: "qu",
    displayName: "Quechua",
    isoCode: "qu",
  },
  {
    apiName: "qu_bo",
    displayName: "Quechua (Bolivia)",
    isoCode: "qu-BO",
  },
  {
    apiName: "qu_ec",
    displayName: "Quechua (Ecuador)",
    isoCode: "qu-EC",
  },
  {
    apiName: "qu_pe",
    displayName: "Quechua (Peru)",
    isoCode: "qu-PE",
  },
  {
    apiName: "rm",
    displayName: "Rhaeto_Romanic",
    isoCode: "rm",
  },
  {
    apiName: "ro",
    displayName: "Romanian",
    isoCode: "ro",
  },
  {
    apiName: "ru",
    displayName: "Russian",
    isoCode: "ru",
  },
  {
    apiName: "se",
    displayName: "Sami",
    isoCode: "se",
  },
  {
    apiName: "se_fi",
    displayName: "Sami (Finland)",
    isoCode: "se-FI",
  },
  {
    apiName: "se_no",
    displayName: "Sami (Norway)",
    isoCode: "se-NO",
  },
  {
    apiName: "se_se",
    displayName: "Sami (Sweden)",
    isoCode: "se-SE",
  },
  {
    apiName: "sm",
    displayName: "Samoan",
    isoCode: "sm",
  },
  {
    apiName: "sg",
    displayName: "Sangro",
    isoCode: "sg",
  },
  {
    apiName: "sa",
    displayName: "Sanskrit",
    isoCode: "sa",
  },
  {
    apiName: "sc",
    displayName: "Sardinian",
    isoCode: "sc",
  },
  {
    apiName: "sr",
    displayName: "Serbian",
    isoCode: "sr",
  },
  {
    apiName: "sr_ba",
    displayName: "Serbian (Bosnia and Herzegovina)",
    isoCode: "sr-BA",
  },
  {
    apiName: "sr_sp",
    displayName: "Serbian (Serbia and Montenegro)",
    isoCode: "sr-SP",
  },
  {
    apiName: "sh",
    displayName: "Serbo_Croatian",
    isoCode: "sh",
  },
  {
    apiName: "st",
    displayName: "Sesotho",
    isoCode: "st",
  },
  {
    apiName: "sn",
    displayName: "Shona",
    isoCode: "sn",
  },
  {
    apiName: "ii",
    displayName: "Sichuan Yi",
    isoCode: "ii",
  },
  {
    apiName: "sd",
    displayName: "Sindhi",
    isoCode: "sd",
  },
  {
    apiName: "si",
    displayName: "Singhalese",
    isoCode: "si",
  },
  {
    apiName: "ss",
    displayName: "Siswati",
    isoCode: "ss",
  },
  {
    apiName: "sk",
    displayName: "Slovak",
    isoCode: "sk",
  },
  {
    apiName: "ls",
    displayName: "Slovenian",
    isoCode: "sl",
  },
  {
    apiName: "sl",
    displayName: "Slovenian",
    isoCode: "sl",
  },
  {
    apiName: "so",
    displayName: "Somali",
    isoCode: "so",
  },
  {
    apiName: "sb",
    displayName: "Sorbian",
    isoCode: "sb",
  },
  {
    apiName: "nr",
    displayName: "South Ndebele",
    isoCode: "nr",
  },
  {
    apiName: "es",
    displayName: "Spanish",
    isoCode: "es",
  },
  {
    apiName: "su",
    displayName: "Sundanese",
    isoCode: "su",
  },
  {
    apiName: "sx",
    displayName: "Sutu",
    isoCode: "sx",
  },
  {
    apiName: "sw",
    displayName: "Swahili",
    isoCode: "sw",
  },
  {
    apiName: "sv",
    displayName: "Swedish",
    isoCode: "sv",
  },
  {
    apiName: "sv_fi",
    displayName: "Swedish (Finland)",
    isoCode: "sv-FI",
  },
  {
    apiName: "sv_se",
    displayName: "Swedish (Sweden)",
    isoCode: "sv-SE",
  },
  {
    apiName: "syr",
    displayName: "Syriac",
    isoCode: "syr",
  },
  {
    apiName: "tl",
    displayName: "Tagalog",
    isoCode: "tl",
  },
  {
    apiName: "ty",
    displayName: "Tahitian",
    isoCode: "ty",
  },
  {
    apiName: "tg",
    displayName: "Tajik",
    isoCode: "tg",
  },
  {
    apiName: "ta",
    displayName: "Tamil",
    isoCode: "ta",
  },
  {
    apiName: "tt",
    displayName: "Tatar",
    isoCode: "tt",
  },
  {
    apiName: "te",
    displayName: "Telugu",
    isoCode: "te",
  },
  {
    apiName: "th",
    displayName: "Thai",
    isoCode: "th",
  },
  {
    apiName: "bo",
    displayName: "Tibetan",
    isoCode: "bo",
  },
  {
    apiName: "ti",
    displayName: "Tigrinya",
    isoCode: "ti",
  },
  {
    apiName: "to",
    displayName: "Tonga",
    isoCode: "to",
  },
  {
    apiName: "ts",
    displayName: "Tsonga",
    isoCode: "ts",
  },
  {
    apiName: "tn",
    displayName: "Tswana",
    isoCode: "tn",
  },
  {
    apiName: "tr",
    displayName: "Turkish",
    isoCode: "tr",
  },
  {
    apiName: "tk",
    displayName: "Turkmen",
    isoCode: "tk",
  },
  {
    apiName: "tw",
    displayName: "Twi",
    isoCode: "tw",
  },
  {
    apiName: "ug",
    displayName: "Uighur",
    isoCode: "ug",
  },
  {
    apiName: "uk",
    displayName: "Ukrainian",
    isoCode: "uk",
  },
  {
    apiName: "ur",
    displayName: "Urdu",
    isoCode: "ur",
  },
  {
    apiName: "uz",
    displayName: "Uzbek",
    isoCode: "uz",
  },
  {
    apiName: "ve",
    displayName: "Venda",
    isoCode: "ve",
  },
  {
    apiName: "vi",
    displayName: "Vietnamese",
    isoCode: "vi",
  },
  {
    apiName: "vo",
    displayName: "Volapuk",
    isoCode: "vo",
  },
  {
    apiName: "wa",
    displayName: "Walloon",
    isoCode: "wa",
  },
  {
    apiName: "cy",
    displayName: "Welsh",
    isoCode: "cy",
  },
  {
    apiName: "wo",
    displayName: "Wolof",
    isoCode: "wo",
  },
  {
    apiName: "xh",
    displayName: "Xhosa",
    isoCode: "xh",
  },
  {
    apiName: "ji",
    displayName: "Yiddish",
    isoCode: "yi",
  },
  {
    apiName: "yi",
    displayName: "Yiddish",
    isoCode: "yi",
  },
  {
    apiName: "yo",
    displayName: "Yoruba",
    isoCode: "yo",
  },
  {
    apiName: "za",
    displayName: "Zhuang",
    isoCode: "za",
  },
  {
    apiName: "zu",
    displayName: "Zulu",
    isoCode: "zu",
  },
];
