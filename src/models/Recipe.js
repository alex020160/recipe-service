const ESTIMATED_RECIPE_TIME_BY_CATEGORY = {
  Beef: 75,
  Breakfast: 20,
  Chicken: 45,
  Dessert: 60,
  Goat: 90,
  Lamb: 90,
  Miscellaneous: 40,
  Pasta: 30,
  Pork: 70,
  Seafood: 25,
  Side: 25,
  Starter: 20,
  Vegan: 35,
  Vegetarian: 35,
};

export class Recipe {
  constructor({
    id,
    source,
    title,
    time,
    timeMinutes,
    likes = 0,
    isLiked = false,
    isUserCreated = false,
    category = "Miscellaneous",
    categories = ["Miscellaneous"],
    area = "",
    image = "",
    photos = [],
    ingredients = "",
    steps = "",
    translations = null,
    originalData = null,
  }) {
    this.id = id;
    this.source = source;
    this.title = title;
    this.time = time;
    this.timeMinutes = timeMinutes;

    this.likes = likes;
    this.isLiked = isLiked;
    this.isUserCreated = isUserCreated;

    this.category = category;
    this.categories = categories;
    this.area = area;

    this.image = image;
    this.photos = photos;

    this.ingredients = ingredients;
    this.steps = steps;

    this.translations = translations;
    this.originalData = originalData;
  }

  get isApiRecipe() {
    return this.source === "api";
  }

  get isLocalRecipe() {
    return this.source === "local";
  }

  get isCommunityRecipe() {
    return this.source === "community";
  }

  get hasPhotos() {
    return this.photos.length > 0;
  }

  get hasFullText() {
    return Boolean(this.ingredients || this.steps);
  }

  withLikes(likes) {
    return new Recipe({
      ...this.toObject(),
      likes,
    });
  }

  withFavoriteState(isLiked) {
    return new Recipe({
      ...this.toObject(),
      isLiked,
    });
  }

  toObject() {
    return {
      id: this.id,
      source: this.source,

      title: this.title,
      time: this.time,
      timeMinutes: this.timeMinutes,

      likes: this.likes,
      isLiked: this.isLiked,
      isUserCreated: this.isUserCreated,

      category: this.category,
      categories: this.categories,
      area: this.area,

      image: this.image,
      photos: this.photos,

      ingredients: this.ingredients,
      steps: this.steps,

      translations: this.translations,
      originalData: this.originalData,
    };
  }

  static formatTimeLabel(timeMinutes) {
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
  }

  static getTimeMinutesFromLabel(time) {
    if (!time || time === "—") return 0;

    const hoursMatch = time.match(/(\d+)\s*h/);
    const minutesMatch = time.match(/(\d+)\s*min/);

    const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

    return hours * 60 + minutes;
  }

  static getEstimatedTimeMinutes(category) {
    return ESTIMATED_RECIPE_TIME_BY_CATEGORY[category] || 40;
  }

  static splitText(text) {
    if (!text) return [];

    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  static fromMealDb(meal) {
    const ingredientLines = [];

    for (let index = 1; index <= 20; index += 1) {
      const ingredient = meal[`strIngredient${index}`]?.trim();
      const measure = meal[`strMeasure${index}`]?.trim();

      if (ingredient) {
        ingredientLines.push([measure, ingredient].filter(Boolean).join(" "));
      }
    }

    const category = meal.strCategory || "Miscellaneous";
    const timeMinutes = Recipe.getEstimatedTimeMinutes(category);

    return new Recipe({
      id: `api-${meal.idMeal}`,
      source: "api",

      title: meal.strMeal || "Untitled recipe",
      time: Recipe.formatTimeLabel(timeMinutes),
      timeMinutes,

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
    });
  }

  static fromUserInput({
    title,
    ingredients,
    steps,
    categories,
    image,
    photos,
    hours,
    minutes,
  }) {
    const timeMinutes = Number(hours || 0) * 60 + Number(minutes || 0);

    const selectedCategories =
      Array.isArray(categories) && categories.length > 0
        ? categories
        : ["Miscellaneous"];

    return new Recipe({
      id: `local-${Date.now()}`,
      source: "local",

      title: title.trim(),
      time: Recipe.formatTimeLabel(timeMinutes),
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
    });
  }
}
