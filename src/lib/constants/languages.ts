export interface Language {
  apiName: string; // iso name
  displayName: string; // Native name or commonly used name
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
  },
  {
    apiName: "om",
    displayName: "(Afan)/Oromoor/Oriya",
  },
  {
    apiName: "ab",
    displayName: "Abkhazian",
  },
  {
    apiName: "aa",
    displayName: "Afar",
  },
  {
    apiName: "af",
    displayName: "Afrikaans",
  },
  {
    apiName: "ak",
    displayName: "Akan",
  },
  {
    apiName: "sq",
    displayName: "Albanian",
  },
  {
    apiName: "am",
    displayName: "Amharic",
  },
  {
    apiName: "ar",
    displayName: "Arabic",
  },
  {
    apiName: "an",
    displayName: "Aragonese",
  },
  {
    apiName: "hy",
    displayName: "Armenian",
  },
  {
    apiName: "as",
    displayName: "Assamese",
  },
  {
    apiName: "av",
    displayName: "Avaric",
  },
  {
    apiName: "ae",
    displayName: "Avestan",
  },
  {
    apiName: "ay",
    displayName: "Aymara",
  },
  {
    apiName: "az",
    displayName: "Azeri",
  },
  {
    apiName: "bm",
    displayName: "Bambara",
  },
  {
    apiName: "ba",
    displayName: "Bashkir",
  },
  {
    apiName: "eu",
    displayName: "Basque",
  },
  {
    apiName: "be",
    displayName: "Belarusian",
  },
  {
    apiName: "bn",
    displayName: "Bengali",
  },
  {
    apiName: "dz",
    displayName: "Bhutani",
  },
  {
    apiName: "bh",
    displayName: "Bihari",
  },
  {
    apiName: "bi",
    displayName: "Bislama",
  },
  {
    apiName: "bs",
    displayName: "Bosnian",
  },
  {
    apiName: "br",
    displayName: "Breton",
  },
  {
    apiName: "bg",
    displayName: "Bulgarian",
  },
  {
    apiName: "my",
    displayName: "Burmese",
  },
  {
    apiName: "km",
    displayName: "Cambodian",
  },
  {
    apiName: "yue",
    displayName: "Cantonese",
  },
  {
    apiName: "ca",
    displayName: "Catalan",
  },
  {
    apiName: "ch",
    displayName: "Chamorro",
  },
  {
    apiName: "ce",
    displayName: "Chechen",
  },
  {
    apiName: "ny",
    displayName: "Chichewa",
  },
  {
    apiName: "zh",
    displayName: "Chinese",
  },
  {
    apiName: "zh_cn",
    displayName: "Chinese (Simplified)",
  },
  {
    apiName: "zh_tw",
    displayName: "Chinese (Traditional)",
  },
  {
    apiName: "cu",
    displayName: "Church Slavonic",
  },
  {
    apiName: "cv",
    displayName: "Chuvash",
  },
  {
    apiName: "kw",
    displayName: "Cornish",
  },
  {
    apiName: "co",
    displayName: "Corsican",
  },
  {
    apiName: "cr",
    displayName: "Cree",
  },
  {
    apiName: "hr",
    displayName: "Croatian",
  },
  {
    apiName: "hr_ba",
    displayName: "Croatian (Bosnia and Herzegovina)",
  },
  {
    apiName: "hr_hr",
    displayName: "Croatian (Croatia)",
  },
  {
    apiName: "cs",
    displayName: "Czech",
  },
  {
    apiName: "da",
    displayName: "Danish",
  },
  {
    apiName: "div",
    displayName: "Divehi",
  },
  {
    apiName: "dv",
    displayName: "Divehi",
  },
  {
    apiName: "nl",
    displayName: "Dutch",
  },
  {
    apiName: "nl_be",
    displayName: "Dutch (Belgium)",
  },
  {
    apiName: "nl_nl",
    displayName: "Dutch (Netherlands)",
  },
  {
    apiName: "elvish",
    displayName: "Elvish (Sindarin)",
  },
  {
    apiName: "emoji",
    displayName: "Emoji Speak",
  },
  {
    apiName: "en",
    displayName: "English",
  },
  {
    apiName: "eo",
    displayName: "Esperanto",
  },
  {
    apiName: "et",
    displayName: "Estonian",
  },
  {
    apiName: "ee",
    displayName: "Ewe",
  },
  {
    apiName: "fo",
    displayName: "Faroese",
  },
  {
    apiName: "fa",
    displayName: "Farsi",
  },
  {
    apiName: "fj",
    displayName: "Fiji",
  },
  {
    apiName: "fi",
    displayName: "Finnish",
  },
  {
    apiName: "fr",
    displayName: "French",
  },
  {
    apiName: "fy",
    displayName: "Frisian",
  },
  {
    apiName: "ff",
    displayName: "Fulah",
  },
  {
    apiName: "mk",
    displayName: "FYRO Macedonian",
  },
  {
    apiName: "gd",
    displayName: "Gaelic",
  },
  {
    apiName: "gl",
    displayName: "Galician",
  },
  {
    apiName: "lg",
    displayName: "Ganda",
  },
  {
    apiName: "ka",
    displayName: "Georgian",
  },
  {
    apiName: "de",
    displayName: "German",
  },
  {
    apiName: "de_at",
    displayName: "German (Austria)",
  },
  {
    apiName: "de_de",
    displayName: "German (Germany)",
  },
  {
    apiName: "de_li",
    displayName: "German (Liechtenstein)",
  },
  {
    apiName: "de_lu",
    displayName: "German (Luxembourg)",
  },
  {
    apiName: "de_ch",
    displayName: "German (Switzerland)",
  },
  {
    apiName: "el",
    displayName: "Greek",
  },
  {
    apiName: "kl",
    displayName: "Greenlandic",
  },
  {
    apiName: "gn",
    displayName: "Guarani",
  },
  {
    apiName: "gu",
    displayName: "Gujarati",
  },
  {
    apiName: "ht",
    displayName: "Haitian",
  },
  {
    apiName: "ha",
    displayName: "Hausa",
  },
  {
    apiName: "he",
    displayName: "Hebrew",
  },
  {
    apiName: "iw",
    displayName: "Hebrew",
  },
  {
    apiName: "hz",
    displayName: "Herero",
  },
  {
    apiName: "hi",
    displayName: "Hindi",
  },
  {
    apiName: "ho",
    displayName: "Hiri Motu",
  },
  {
    apiName: "hu",
    displayName: "Hungarian",
  },
  {
    apiName: "is",
    displayName: "Icelandic",
  },
  {
    apiName: "io",
    displayName: "Ido",
  },
  {
    apiName: "ig",
    displayName: "Igbo",
  },
  {
    apiName: "id",
    displayName: "Indonesian",
  },
  {
    apiName: "in",
    displayName: "Indonesian",
  },
  {
    apiName: "ia",
    displayName: "Interlingua",
  },
  {
    apiName: "ie",
    displayName: "Interlingue",
  },
  {
    apiName: "iu",
    displayName: "Inuktitut",
  },
  {
    apiName: "ik",
    displayName: "Inupiak",
  },
  {
    apiName: "ga",
    displayName: "Irish",
  },
  {
    apiName: "it",
    displayName: "Italian",
  },
  {
    apiName: "it_it",
    displayName: "Italian (Italy)",
  },
  {
    apiName: "it_ch",
    displayName: "Italian (Switzerland)",
  },
  {
    apiName: "ja",
    displayName: "Japanese",
  },
  {
    apiName: "jv",
    displayName: "Javanese",
  },
  {
    apiName: "jw",
    displayName: "Javanese",
  },
  {
    apiName: "kn",
    displayName: "Kannada",
  },
  {
    apiName: "kr",
    displayName: "Kanuri",
  },
  {
    apiName: "ks",
    displayName: "Kashmiri",
  },
  {
    apiName: "kk",
    displayName: "Kazakh",
  },
  {
    apiName: "ki",
    displayName: "Kikuyu",
  },
  {
    apiName: "rw",
    displayName: "Kinyarwanda",
  },
  {
    apiName: "ky",
    displayName: "Kirghiz",
  },
  {
    apiName: "rn",
    displayName: "Kirundi",
  },
  {
    apiName: "klingon",
    displayName: "Klingon",
  },
  {
    apiName: "kv",
    displayName: "Komi",
  },
  {
    apiName: "kg",
    displayName: "Kongo",
  },
  {
    apiName: "kok",
    displayName: "Konkani",
  },
  {
    apiName: "ko",
    displayName: "Korean",
  },
  {
    apiName: "kj",
    displayName: "Kuanyama",
  },
  {
    apiName: "ku",
    displayName: "Kurdish",
  },
  {
    apiName: "kz",
    displayName: "Kyrgyz",
  },
  {
    apiName: "lo",
    displayName: "Laothian",
  },
  {
    apiName: "la",
    displayName: "Latin",
  },
  {
    apiName: "lv",
    displayName: "Latvian",
  },
  {
    apiName: "li",
    displayName: "Limburgan",
  },
  {
    apiName: "ln",
    displayName: "Lingala",
  },
  {
    apiName: "lt",
    displayName: "Lithuanian",
  },
  {
    apiName: "lu",
    displayName: "Luba_Katanga",
  },
  {
    apiName: "lb",
    displayName: "Luxembourgish",
  },
  {
    apiName: "mg",
    displayName: "Malagasy",
  },
  {
    apiName: "ms",
    displayName: "Malay",
  },
  {
    apiName: "ms_bn",
    displayName: "Malay (Brunei Darussalam)",
  },
  {
    apiName: "ms_my",
    displayName: "Malay (Malaysia)",
  },
  {
    apiName: "ml",
    displayName: "Malayalam",
  },
  {
    apiName: "mt",
    displayName: "Maltese",
  },
  {
    apiName: "gv",
    displayName: "Manx",
  },
  {
    apiName: "mi",
    displayName: "Maori",
  },
  {
    apiName: "mr",
    displayName: "Marathi",
  },
  {
    apiName: "mh",
    displayName: "Marshallese",
  },
  {
    apiName: "middle_english",
    displayName: "Middle English",
  },
  {
    apiName: "mo",
    displayName: "Moldavian",
  },
  {
    apiName: "mn",
    displayName: "Mongolian",
  },
  {
    apiName: "na",
    displayName: "Nauru",
  },
  {
    apiName: "nv",
    displayName: "Navajo",
  },
  {
    apiName: "ng",
    displayName: "Ndonga",
  },
  {
    apiName: "ne",
    displayName: "Nepali (India)",
  },
  {
    apiName: "nd",
    displayName: "North Ndebele",
  },
  {
    apiName: "ns",
    displayName: "Northern Sotho",
  },
  {
    apiName: "no",
    displayName: "Norwegian",
  },
  {
    apiName: "nb",
    displayName: "Norwegian (Bokmal)",
  },
  {
    apiName: "nn",
    displayName: "Norwegian (Nynorsk)",
  },
  {
    apiName: "oc",
    displayName: "Occitan",
  },
  {
    apiName: "oj",
    displayName: "Ojibwa",
  },
  {
    apiName: "or",
    displayName: "Oriya",
  },
  {
    apiName: "os",
    displayName: "Ossetian",
  },
  {
    apiName: "pi",
    displayName: "Pali",
  },
  {
    apiName: "ps",
    displayName: "Pashto/Pushto",
  },
  {
    apiName: "pirate",
    displayName: "Pirate Speak",
  },
  {
    apiName: "pl",
    displayName: "Polish",
  },
  {
    apiName: "pt",
    displayName: "Portuguese",
  },
  {
    apiName: "pt_br",
    displayName: "Portuguese (Brazil)",
  },
  {
    apiName: "pt_pt",
    displayName: "Portuguese (Portugal)",
  },
  {
    apiName: "pa",
    displayName: "Punjabi",
  },
  {
    apiName: "qu",
    displayName: "Quechua",
  },
  {
    apiName: "qu_bo",
    displayName: "Quechua (Bolivia)",
  },
  {
    apiName: "qu_ec",
    displayName: "Quechua (Ecuador)",
  },
  {
    apiName: "qu_pe",
    displayName: "Quechua (Peru)",
  },
  {
    apiName: "rm",
    displayName: "Rhaeto_Romanic",
  },
  {
    apiName: "ro",
    displayName: "Romanian",
  },
  {
    apiName: "ru",
    displayName: "Russian",
  },
  {
    apiName: "se",
    displayName: "Sami",
  },
  {
    apiName: "se_fi",
    displayName: "Sami (Finland)",
  },
  {
    apiName: "se_no",
    displayName: "Sami (Norway)",
  },
  {
    apiName: "se_se",
    displayName: "Sami (Sweden)",
  },
  {
    apiName: "sm",
    displayName: "Samoan",
  },
  {
    apiName: "sg",
    displayName: "Sangro",
  },
  {
    apiName: "sa",
    displayName: "Sanskrit",
  },
  {
    apiName: "sc",
    displayName: "Sardinian",
  },
  {
    apiName: "sr",
    displayName: "Serbian",
  },
  {
    apiName: "sr_ba",
    displayName: "Serbian (Bosnia and Herzegovina)",
  },
  {
    apiName: "sr_sp",
    displayName: "Serbian (Serbia and Montenegro)",
  },
  {
    apiName: "sh",
    displayName: "Serbo_Croatian",
  },
  {
    apiName: "st",
    displayName: "Sesotho",
  },
  {
    apiName: "sn",
    displayName: "Shona",
  },
  {
    apiName: "ii",
    displayName: "Sichuan Yi",
  },
  {
    apiName: "sd",
    displayName: "Sindhi",
  },
  {
    apiName: "si",
    displayName: "Singhalese",
  },
  {
    apiName: "ss",
    displayName: "Siswati",
  },
  {
    apiName: "sk",
    displayName: "Slovak",
  },
  {
    apiName: "ls",
    displayName: "Slovenian",
  },
  {
    apiName: "sl",
    displayName: "Slovenian",
  },
  {
    apiName: "so",
    displayName: "Somali",
  },
  {
    apiName: "sb",
    displayName: "Sorbian",
  },
  {
    apiName: "nr",
    displayName: "South Ndebele",
  },
  {
    apiName: "es",
    displayName: "Spanish",
  },
  {
    apiName: "su",
    displayName: "Sundanese",
  },
  {
    apiName: "sx",
    displayName: "Sutu",
  },
  {
    apiName: "sw",
    displayName: "Swahili",
  },
  {
    apiName: "sv",
    displayName: "Swedish",
  },
  {
    apiName: "sv_fi",
    displayName: "Swedish (Finland)",
  },
  {
    apiName: "sv_se",
    displayName: "Swedish (Sweden)",
  },
  {
    apiName: "syr",
    displayName: "Syriac",
  },
  {
    apiName: "tl",
    displayName: "Tagalog",
  },
  {
    apiName: "ty",
    displayName: "Tahitian",
  },
  {
    apiName: "tg",
    displayName: "Tajik",
  },
  {
    apiName: "ta",
    displayName: "Tamil",
  },
  {
    apiName: "tt",
    displayName: "Tatar",
  },
  {
    apiName: "te",
    displayName: "Telugu",
  },
  {
    apiName: "th",
    displayName: "Thai",
  },
  {
    apiName: "bo",
    displayName: "Tibetan",
  },
  {
    apiName: "ti",
    displayName: "Tigrinya",
  },
  {
    apiName: "to",
    displayName: "Tonga",
  },
  {
    apiName: "ts",
    displayName: "Tsonga",
  },
  {
    apiName: "tn",
    displayName: "Tswana",
  },
  {
    apiName: "tr",
    displayName: "Turkish",
  },
  {
    apiName: "tk",
    displayName: "Turkmen",
  },
  {
    apiName: "tw",
    displayName: "Twi",
  },
  {
    apiName: "ug",
    displayName: "Uighur",
  },
  {
    apiName: "uk",
    displayName: "Ukrainian",
  },
  {
    apiName: "ur",
    displayName: "Urdu",
  },
  {
    apiName: "uz",
    displayName: "Uzbek",
  },
  {
    apiName: "ve",
    displayName: "Venda",
  },
  {
    apiName: "vi",
    displayName: "Vietnamese",
  },
  {
    apiName: "vo",
    displayName: "Volapuk",
  },
  {
    apiName: "wa",
    displayName: "Walloon",
  },
  {
    apiName: "cy",
    displayName: "Welsh",
  },
  {
    apiName: "wo",
    displayName: "Wolof",
  },
  {
    apiName: "xh",
    displayName: "Xhosa",
  },
  {
    apiName: "ji",
    displayName: "Yiddish",
  },
  {
    apiName: "yi",
    displayName: "Yiddish",
  },
  {
    apiName: "yo",
    displayName: "Yoruba",
  },
  {
    apiName: "za",
    displayName: "Zhuang",
  },
  {
    apiName: "zu",
    displayName: "Zulu",
  },
];
