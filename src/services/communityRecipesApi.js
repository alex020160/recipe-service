import { supabase } from "./supabaseClient";

const mapRecipeFromDatabase = (recipe) => {
  return {
    id: recipe.id,
    source: recipe.source || "community",

    title: recipe.title || "Untitled recipe",
    ingredients: recipe.ingredients || "",
    steps: recipe.steps || "",

    category: recipe.category || "Miscellaneous",
    categories: recipe.categories?.length
      ? recipe.categories
      : ["Miscellaneous"],

    image: recipe.image || "",
    photos: recipe.photos || [],

    time: recipe.time || "—",
    timeMinutes: recipe.time_minutes || 0,

    likes: recipe.likes || 0,
    isLiked: false,
    isUserCreated: false,

    translations: recipe.translations || null,
    originalData: null,
  };
};

const mapRecipeToDatabase = (recipe) => {
  return {
    title: recipe.title,
    ingredients: recipe.ingredients || "",
    steps: recipe.steps || "",

    category: recipe.category || "Miscellaneous",
    categories: recipe.categories?.length
      ? recipe.categories
      : ["Miscellaneous"],

    image: recipe.image || "",
    photos: recipe.photos || [],

    time: recipe.time || "—",
    time_minutes: recipe.timeMinutes || 0,

    likes: recipe.likes || 0,
    source: "community",

    translations: recipe.translations || null,
  };
};

export const getCommunityRecipes = async () => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("likes", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapRecipeFromDatabase);
};

export const createCommunityRecipe = async (recipe) => {
  const { data, error } = await supabase
    .from("recipes")
    .insert(mapRecipeToDatabase(recipe))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapRecipeFromDatabase(data);
};

export const changeCommunityRecipeLikes = async (recipeId, likesDelta) => {
  const { data, error } = await supabase
    .rpc("change_recipe_likes", {
      recipe_id: recipeId,
      likes_delta: likesDelta,
    })
    .single();

  if (error) {
    throw error;
  }

  return mapRecipeFromDatabase(data);
};

export const deleteCommunityRecipe = async (recipeId) => {
  const { error } = await supabase.from("recipes").delete().eq("id", recipeId);

  if (error) {
    throw error;
  }
};

export const subscribeToCommunityRecipesChanges = (onChange) => {
  const channel = supabase
    .channel("community-recipes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "recipes",
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getApiRecipeLikeCounts = async (recipeIds) => {
  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("api_recipe_likes")
    .select("recipe_id, likes")
    .in("recipe_id", recipeIds);

  if (error) {
    throw error;
  }

  return data.reduce((likesByRecipeId, item) => {
    likesByRecipeId[item.recipe_id] = item.likes || 0;
    return likesByRecipeId;
  }, {});
};

export const changeApiRecipeLikes = async (recipeId, likesDelta) => {
  const { data, error } = await supabase
    .rpc("change_api_recipe_likes", {
      target_recipe_id: recipeId,
      likes_delta: likesDelta,
    })
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.recipe_id,
    likes: data.likes || 0,
  };
};

export const subscribeToApiRecipeLikesChanges = (onChange) => {
  const channel = supabase
    .channel("api-recipe-likes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "api_recipe_likes",
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
