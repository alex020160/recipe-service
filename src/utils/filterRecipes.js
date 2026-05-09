import { RecipeCollection } from "../models/RecipeCollection";

export const filterRecipes = (recipes, activeSearchQuery, activeFilters) => {
  return new RecipeCollection(recipes)
    .filterBySearch(activeSearchQuery)
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
