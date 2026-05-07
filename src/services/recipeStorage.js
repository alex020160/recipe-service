const RECIPES_STORAGE_KEY = "recipes";
const FAVORITE_RECIPE_IDS_STORAGE_KEY = "favoriteRecipeIds";
const MY_RECIPE_IDS_STORAGE_KEY = "myRecipeIds";

const parseStoredValue = (value, fallbackValue) => {
  try {
    return value ? JSON.parse(value) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

export const getStoredRecipes = () => {
  return parseStoredValue(localStorage.getItem(RECIPES_STORAGE_KEY), []);
};

export const saveStoredRecipes = (recipes) => {
  localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
};

export const getStoredFavoriteRecipeIds = () => {
  return parseStoredValue(
    localStorage.getItem(FAVORITE_RECIPE_IDS_STORAGE_KEY),
    [],
  );
};

export const saveStoredFavoriteRecipeIds = (ids) => {
  localStorage.setItem(FAVORITE_RECIPE_IDS_STORAGE_KEY, JSON.stringify(ids));
};

export const getStoredMyRecipeIds = () => {
  return parseStoredValue(localStorage.getItem(MY_RECIPE_IDS_STORAGE_KEY), []);
};

export const saveStoredMyRecipeIds = (ids) => {
  localStorage.setItem(MY_RECIPE_IDS_STORAGE_KEY, JSON.stringify(ids));
};
