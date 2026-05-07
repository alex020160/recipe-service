export const formatTimeLabel = (timeMinutes) => {
  if (!timeMinutes) return "—";

  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}min`;
};

export const getRecipeTimeMinutes = (time) => {
  if (!time || time === "—") return 0;

  const hoursMatch = time.match(/(\d+)\s*h/);
  const minutesMatch = time.match(/(\d+)\s*min/);

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  return hours * 60 + minutes;
};

export const splitRecipeText = (text) => {
  if (!text) return [];

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

export const normalizeMealDbRecipe = (meal) => {
  const ingredientLines = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measure = meal[`strMeasure${index}`]?.trim();

    if (ingredient) {
      ingredientLines.push([measure, ingredient].filter(Boolean).join(" "));
    }
  }

  const category = meal.strCategory || "Miscellaneous";

  return {
    id: `api-${meal.idMeal}`,
    source: "api",

    title: meal.strMeal || "Untitled recipe",
    time: "—",
    timeMinutes: 0,

    likes: 0,
    isLiked: false,
    isUserCreated: false,

    category,
    categories: [category],

    area: meal.strArea || "",

    image: meal.strMealThumb || "",
    photos: meal.strMealThumb ? [meal.strMealThumb] : [],

    ingredients: ingredientLines.join("\n"),
    steps: meal.strInstructions || "",

    originalData: meal,
  };
};

export const createLocalRecipe = ({
  title,
  ingredients,
  steps,
  categories,
  image,
  photos,
  hours,
  minutes,
}) => {
  const timeMinutes = Number(hours || 0) * 60 + Number(minutes || 0);
  const selectedCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : ["Miscellaneous"];

  return {
    id: `local-${Date.now()}`,
    source: "local",

    title: title.trim(),
    time: formatTimeLabel(timeMinutes),
    timeMinutes,

    likes: 0,
    isLiked: false,
    isUserCreated: true,

    category: selectedCategories[0],
    categories: selectedCategories,

    area: "",

    image,
    photos,

    ingredients: ingredients.trim(),
    steps: steps.trim(),

    originalData: null,
  };
};
