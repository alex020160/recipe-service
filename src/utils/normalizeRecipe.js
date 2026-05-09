import { Recipe } from "../models/Recipe";

export const formatTimeLabel = (timeMinutes) => {
  return Recipe.formatTimeLabel(timeMinutes);
};

export const getRecipeTimeMinutes = (time) => {
  return Recipe.getTimeMinutesFromLabel(time);
};

export const splitRecipeText = (text) => {
  return Recipe.splitText(text);
};

export const normalizeMealDbRecipe = (meal) => {
  return Recipe.fromMealDb(meal).toObject();
};

export const createLocalRecipe = (recipeData) => {
  return Recipe.fromUserInput(recipeData).toObject();
};
