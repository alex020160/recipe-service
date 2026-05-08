export const categoryTranslations = {
  Beef: {
    en: "Beef",
    ru: "Говядина",
  },
  Breakfast: {
    en: "Breakfast",
    ru: "Завтраки",
  },
  Chicken: {
    en: "Chicken",
    ru: "Курица",
  },
  Dessert: {
    en: "Dessert",
    ru: "Десерты",
  },
  Goat: {
    en: "Goat",
    ru: "Козлятина",
  },
  Lamb: {
    en: "Lamb",
    ru: "Баранина",
  },
  Miscellaneous: {
    en: "Miscellaneous",
    ru: "Разное",
  },
  Pasta: {
    en: "Pasta",
    ru: "Паста",
  },
  Pork: {
    en: "Pork",
    ru: "Свинина",
  },
  Seafood: {
    en: "Seafood",
    ru: "Морепродукты",
  },
  Side: {
    en: "Side",
    ru: "Гарниры",
  },
  Starter: {
    en: "Starter",
    ru: "Закуски",
  },
  Vegan: {
    en: "Vegan",
    ru: "Веганские",
  },
  Vegetarian: {
    en: "Vegetarian",
    ru: "Вегетарианские",
  },
};

export const getLocalizedCategory = (category, language) => {
  return categoryTranslations[category]?.[language] || category;
};
