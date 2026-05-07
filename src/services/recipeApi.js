import { normalizeMealDbRecipe } from "../utils/normalizeRecipe";

const MEAL_DB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const checkResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

export const getRecipesBySearch = async (query) => {
  const response = await fetch(
    `${MEAL_DB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`,
  );

  const data = await checkResponse(response);

  return data.meals ? data.meals.map(normalizeMealDbRecipe) : [];
};

export const getRandomRecipe = async () => {
  const response = await fetch(`${MEAL_DB_BASE_URL}/random.php`);
  const data = await checkResponse(response);

  const meal = data.meals?.[0];

  return meal ? normalizeMealDbRecipe(meal) : null;
};

export const getRecipesByCategory = async (category) => {
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
};

export const getRecipeById = async (id) => {
  const cleanId = String(id).replace("api-", "");

  const response = await fetch(`${MEAL_DB_BASE_URL}/lookup.php?i=${cleanId}`);
  const data = await checkResponse(response);

  const meal = data.meals?.[0];

  return meal ? normalizeMealDbRecipe(meal) : null;
};
