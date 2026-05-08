const TRANSLATION_API_URL = "https://api.mymemory.translated.net/get";

export const translateText = async (text) => {
  if (!text || !text.trim()) return "";

  try {
    const url = new URL(TRANSLATION_API_URL);

    url.searchParams.set("q", text);
    url.searchParams.set("langpair", "en|ru");
    url.searchParams.set("de", "grekova578@mail.ru");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Translation failed");
    }

    const data = await response.json();

    if (data.responseStatus && data.responseStatus !== 200) {
      throw new Error(data.responseDetails || "Translation failed");
    }

    return data.responseData?.translatedText || text;
  } catch (error) {
    console.error(error);
    return text;
  }
};
