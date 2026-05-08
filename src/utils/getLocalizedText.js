export const getBrowserLanguage = () => {
  return navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "en";
};

export const getLocalizedText = (value, language = getBrowserLanguage()) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value[language] || value.en || value.ru || "";
};
