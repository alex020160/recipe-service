const RECIPES_STORAGE_KEY = "recipes";
const FAVORITES_STORAGE_KEY = "favoriteRecipeIds";

export const getStoredRecipes = () => {
  const storedRecipes = localStorage.getItem(RECIPES_STORAGE_KEY);
  return storedRecipes ? JSON.parse(storedRecipes) : [];
};

export const saveStoredRecipes = (recipes) => {
  localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
};

export const getStoredFavoriteIds = () => {
  const storedIds = localStorage.getItem(FAVORITES_STORAGE_KEY);
  return storedIds ? JSON.parse(storedIds) : [];
};

export const saveStoredFavoriteIds = (ids) => {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
};
