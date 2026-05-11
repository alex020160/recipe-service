import { normalizeMealDbRecipe } from "../utils/normalizeRecipe";
import { fallbackRecipes } from "../data/fallbackRecipes";

const MEAL_DB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const checkResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

const getFallbackRecipesBySearch = (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return fallbackRecipes;
  }

  return fallbackRecipes.filter((recipe) => {
    const ruTranslation = recipe.translations?.ru || {};

    const searchText = [
      recipe.title,
      recipe.ingredients,
      recipe.steps,
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

    return searchText.includes(normalizedQuery);
  });
};

const getFallbackRecipesByCategory = (category) => {
  const normalizedCategory = category.trim().toLowerCase();

  return fallbackRecipes.filter((recipe) => {
    return recipe.category.toLowerCase() === normalizedCategory;
  });
};

const getFallbackRecipeById = (id) => {
  const cleanId = String(id).replace("api-", "");

  return (
    fallbackRecipes.find((recipe) => {
      return String(recipe.id).replace("api-", "") === cleanId;
    }) || null
  );
};

export const getRecipesBySearch = async (query) => {
  try {
    const response = await fetch(
      `${MEAL_DB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`,
    );

    const data = await checkResponse(response);

    return data.meals ? data.meals.map(normalizeMealDbRecipe) : [];
  } catch (error) {
    console.error(
      "TheMealDB search is unavailable. Fallback recipes are used.",
      error,
    );

    return getFallbackRecipesBySearch(query);
  }
};

export const getRandomRecipe = async () => {
  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/random.php`);
    const data = await checkResponse(response);

    const meal = data.meals?.[0];

    return meal ? normalizeMealDbRecipe(meal) : null;
  } catch (error) {
    console.error(
      "TheMealDB random recipe is unavailable. Fallback recipe is used.",
      error,
    );

    const randomIndex = Math.floor(Math.random() * fallbackRecipes.length);

    return fallbackRecipes[randomIndex] || null;
  }
};

export const getRecipesByCategory = async (category) => {
  try {
    const response = await fetch(
      `${MEAL_DB_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,
    );

    const data = await checkResponse(response);

    return data.meals
      ? data.meals.map((meal) =>
          normalizeMealDbRecipe({
            ...meal,
            strCategory: category,
          }),
        )
      : [];
  } catch (error) {
    console.error(
      "TheMealDB category request is unavailable. Fallback recipes are used.",
      error,
    );

    return getFallbackRecipesByCategory(category);
  }
};

export const getRecipeById = async (id) => {
  const cleanId = String(id).replace("api-", "");

  const fallbackRecipe = getFallbackRecipeById(cleanId);

  if (fallbackRecipe) {
    return fallbackRecipe;
  }

  try {
    const response = await fetch(`${MEAL_DB_BASE_URL}/lookup.php?i=${cleanId}`);
    const data = await checkResponse(response);

    const meal = data.meals?.[0];

    return meal ? normalizeMealDbRecipe(meal) : null;
  } catch (error) {
    console.error("TheMealDB recipe details are unavailable.", error);

    return null;
  }
};
