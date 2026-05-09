export const validateRecipeForm = ({ title, ingredients, steps }) => {
  const errors = [];

  if (!title?.trim()) {
    errors.push("Please fill in recipe name.");
  }

  if (!ingredients?.trim()) {
    errors.push("Please fill in ingredients.");
  }

  if (!steps?.trim()) {
    errors.push("Please fill in steps.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
