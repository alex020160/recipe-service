import { getRecipeTimeMinutes } from "./normalizeRecipe";

export const getLocalizedRecipeTime = (recipe, language) => {
  const timeMinutes =
    typeof recipe.timeMinutes === "number"
      ? recipe.timeMinutes
      : getRecipeTimeMinutes(recipe.time);

  if (!timeMinutes) return "—";

  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;

  if (language === "ru") {
    if (hours > 0 && minutes > 0) {
      return `${hours} ч ${minutes} мин`;
    }

    if (hours > 0) {
      return `${hours} ч`;
    }

    return `${minutes} мин`;
  }

  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}min`;
};
