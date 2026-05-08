import { translateText } from "../services/translateApi";
import { splitRecipeText } from "./normalizeRecipe";

const translateLines = async (text) => {
  const lines = splitRecipeText(text);

  if (lines.length === 0) {
    return "";
  }

  const translatedLines = await Promise.all(
    lines.map((line) => translateText(line)),
  );

  return translatedLines.join("\n");
};

export const getLocalizedRecipeField = (recipe, fieldName, language) => {
  if (!recipe) return "";

  if (language === "ru") {
    return recipe.translations?.ru?.[fieldName] || recipe[fieldName] || "";
  }

  return recipe[fieldName] || "";
};

export const translateRecipeToRussian = async (recipe) => {
  if (!recipe) {
    return recipe;
  }

  if (recipe.source !== "api") {
    return recipe;
  }

  if (
    recipe.translations?.ru?.title &&
    recipe.translations?.ru?.ingredients &&
    recipe.translations?.ru?.steps
  ) {
    return recipe;
  }

  const [translatedTitle, translatedIngredients, translatedSteps] =
    await Promise.all([
      translateText(recipe.title),
      translateLines(recipe.ingredients),
      translateLines(recipe.steps),
    ]);

  return {
    ...recipe,

    translations: {
      ...recipe.translations,
      ru: {
        title: translatedTitle,
        ingredients: translatedIngredients,
        steps: translatedSteps,
      },
    },
  };
};
