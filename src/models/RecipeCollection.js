import { getRecipeTimeMinutes } from "../utils/normalizeRecipe";

const normalizeSearchValue = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

export class RecipeCollection {
  constructor(recipes = []) {
    this.recipes = recipes;
  }

  filterBySearch(searchQuery) {
    const normalizedSearchQuery = normalizeSearchValue(searchQuery);

    if (!normalizedSearchQuery) {
      return new RecipeCollection(this.recipes);
    }

    const filteredRecipes = this.recipes.filter((recipe) => {
      const searchableValues = [
        recipe.title,
        recipe.ingredients,
        recipe.area,
        recipe.category,
        ...(recipe.categories || []),
      ];

      return searchableValues.some((value) =>
        normalizeSearchValue(value).includes(normalizedSearchQuery),
      );
    });

    return new RecipeCollection(filteredRecipes);
  }

  filterByCategories(categories = []) {
    if (!categories.length) {
      return new RecipeCollection(this.recipes);
    }

    const filteredRecipes = this.recipes.filter((recipe) => {
      const currentRecipeCategories = recipe.categories || [];

      return currentRecipeCategories.some((category) =>
        categories.includes(category),
      );
    });

    return new RecipeCollection(filteredRecipes);
  }

  filterByTime(minTimeMinutes = 0, maxTimeMinutes = Infinity) {
    const filteredRecipes = this.recipes.filter((recipe) => {
      const recipeTimeMinutes =
        typeof recipe.timeMinutes === "number"
          ? recipe.timeMinutes
          : getRecipeTimeMinutes(recipe.time);

      return (
        recipeTimeMinutes >= minTimeMinutes &&
        recipeTimeMinutes <= maxTimeMinutes
      );
    });

    return new RecipeCollection(filteredRecipes);
  }

  sortByLikesDescending() {
    return new RecipeCollection(
      [...this.recipes].sort(
        (firstRecipe, secondRecipe) =>
          (secondRecipe.likes || 0) - (firstRecipe.likes || 0),
      ),
    );
  }

  paginate(page, pageSize) {
    const startIndex = page * pageSize;

    return this.recipes.slice(startIndex, startIndex + pageSize);
  }

  toArray() {
    return this.recipes;
  }
}
