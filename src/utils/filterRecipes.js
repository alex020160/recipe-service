import { RecipeCollection } from "../models/RecipeCollection";

const normalizeSearchValue = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const getRecipeSearchText = (recipe) => {
  const ruTranslation = recipe.translations?.ru || {};

  return [
    recipe.title,
    recipe.ingredients,
    recipe.category,
    ...(recipe.categories || []),

    ruTranslation.title,
    ruTranslation.ingredients,
    ruTranslation.steps,
    ruTranslation.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const filterRecipesBySearch = (recipes, activeSearchQuery) => {
  const normalizedQuery = normalizeSearchValue(activeSearchQuery);

  if (!normalizedQuery) {
    return recipes;
  }

  return recipes.filter((recipe) => {
    return getRecipeSearchText(recipe).includes(normalizedQuery);
  });
};

export const filterRecipes = (recipes, activeSearchQuery, activeFilters) => {
  const recipesFilteredBySearch = filterRecipesBySearch(
    recipes,
    activeSearchQuery,
  );

  return new RecipeCollection(recipesFilteredBySearch)
    .filterByCategories(activeFilters.categories)
    .filterByTime(activeFilters.minTimeMinutes, activeFilters.maxTimeMinutes)
    .toArray();
};

export const sortRecipesByLikes = (recipes) => {
  return new RecipeCollection(recipes).sortByLikesDescending().toArray();
};

export const paginateRecipes = (recipes, page, pageSize) => {
  return new RecipeCollection(recipes).paginate(page, pageSize);
};
