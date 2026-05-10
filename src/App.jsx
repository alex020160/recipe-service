import { useCallback, useState, useEffect } from "react";
import { translateRecipeToRussian } from "./utils/translateRecipe";

import { createLocalRecipe } from "./utils/normalizeRecipe";

import {
  INITIAL_RECIPE_CATEGORIES,
  INITIAL_RECIPES_PER_CATEGORY,
} from "./data/initialRecipes";

import {
  filterRecipes,
  paginateRecipes,
  sortRecipesByLikes,
} from "./utils/filterRecipes";

import { getLocalizedRecipeTime } from "./utils/formatTime";

import {
  getStoredFavoriteRecipeIds,
  getStoredMyRecipeIds,
  getStoredRecipes,
  saveStoredFavoriteRecipeIds,
  saveStoredMyRecipeIds,
  saveStoredRecipes,
} from "./services/recipeStorage";

import {
  getRecipeById,
  getRecipesByCategory,
  getRecipesBySearch,
} from "./services/recipeApi";

import { getBrowserLanguage } from "./utils/getLocalizedText";
import {
  createCommunityRecipe,
  deleteCommunityRecipe,
  getCommunityRecipes,
  subscribeToCommunityRecipesChanges,
  changeCommunityRecipeLikes,
  getApiRecipeLikeCounts,
  changeApiRecipeLikes,
  subscribeToApiRecipeLikesChanges,
} from "./services/communityRecipesApi";

import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import ModalLayer from "./components/ModalLayer";
import PhotoPreview from "./components/PhotoPreview";

const DEFAULT_POPULAR_PAGE_SIZE = 3;
const TABLET_POPULAR_PAGE_SIZE = 4;

const getPopularPageSize = () => {
  if (typeof window === "undefined") return DEFAULT_POPULAR_PAGE_SIZE;

  return window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches
    ? TABLET_POPULAR_PAGE_SIZE
    : DEFAULT_POPULAR_PAGE_SIZE;
};

function App() {
  const currentLanguage = getBrowserLanguage();

  const t = (text) => getLocalizedText(text, currentLanguage);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [popularPage, setPopularPage] = useState(0);
  const [popularPageSize, setPopularPageSize] = useState(getPopularPageSize);
  const [historyRecipes, setHistoryRecipes] = useState([]);
  const [recipes, setRecipes] = useState(() =>
    getStoredRecipes().filter(
      (recipe) => recipe.source !== "community" && recipe.source !== "api",
    ),
  );
  const [isRecipesLoading, setIsRecipesLoading] = useState(false);
  const [isRecipeDetailsLoading, setIsRecipeDetailsLoading] = useState(false);
  const [recipeDetailsError, setRecipeDetailsError] = useState("");
  const [recipesLoadingError, setRecipesLoadingError] = useState("");
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(() =>
    getStoredFavoriteRecipeIds(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [myRecipeIds, setMyRecipeIds] = useState(() => getStoredMyRecipeIds());
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    minTimeMinutes: 0,
    maxTimeMinutes: Infinity,
  });
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("recipeTheme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const filteredRecipes = filterRecipes(
    recipes,
    activeSearchQuery,
    activeFilters,
  );

  const popularRecipes = sortRecipesByLikes(filteredRecipes);

  const applyFilters = (nextFilters) => {
    setActiveFilters(nextFilters);
    setPopularPage(0);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    const trimmedSearchQuery = searchQuery.trim();

    setPopularPage(0);
    setRecipesLoadingError("");

    if (!trimmedSearchQuery) {
      setActiveSearchQuery("");
      setSearchQuery("");
      return;
    }

    setActiveSearchQuery(trimmedSearchQuery);

    try {
      setIsRecipesLoading(true);

      const apiRecipes = await getRecipesBySearch(trimmedSearchQuery);

      const apiRecipeLikes = await getApiRecipeLikeCounts(
        apiRecipes.map((recipe) => recipe.id),
      );

      setRecipes((currentRecipes) => {
        const currentRecipesById = new Map(
          currentRecipes.map((recipe) => [recipe.id, recipe]),
        );

        const mergedApiRecipes = apiRecipes.map((apiRecipe) => {
          const savedRecipe = currentRecipesById.get(apiRecipe.id);
          const isFavorite = favoriteRecipeIds.includes(apiRecipe.id);

          if (!savedRecipe) {
            return {
              ...apiRecipe,
              likes: apiRecipeLikes[apiRecipe.id] || 0,
              isLiked: isFavorite,
            };
          }

          return {
            ...apiRecipe,

            likes: apiRecipeLikes[apiRecipe.id] ?? savedRecipe.likes ?? 0,
            isLiked: isFavorite,
            isUserCreated: savedRecipe.isUserCreated,

            translations: savedRecipe.translations,

            ingredients: savedRecipe.ingredients || apiRecipe.ingredients,
            steps: savedRecipe.steps || apiRecipe.steps,

            photos: apiRecipe.photos?.length
              ? apiRecipe.photos
              : savedRecipe.photos,

            image: apiRecipe.image || savedRecipe.image,
          };
        });

        const newApiRecipes = mergedApiRecipes.filter(
          (apiRecipe) => !currentRecipesById.has(apiRecipe.id),
        );

        const updatedCurrentRecipes = currentRecipes.map((currentRecipe) => {
          const updatedApiRecipe = mergedApiRecipes.find(
            (apiRecipe) => apiRecipe.id === currentRecipe.id,
          );

          return updatedApiRecipe || currentRecipe;
        });

        return [...newApiRecipes, ...updatedCurrentRecipes];
      });
    } catch (error) {
      console.error(error);
      setRecipesLoadingError("Failed to search recipes");
    } finally {
      setIsRecipesLoading(false);
    }
  };

  const popularStartIndex = popularPage * popularPageSize;

  const visiblePopularRecipes = paginateRecipes(
    popularRecipes,
    popularPage,
    popularPageSize,
  );

  const hasNextPopularRecipes =
    popularStartIndex + popularPageSize < popularRecipes.length;

  const hasPrevPopularRecipes = popularPage > 0;

  const showNextPopularRecipes = () => {
    if (hasNextPopularRecipes) {
      setPopularPage((currentPage) => currentPage + 1);
    }
  };

  const loadCommunityRecipes = useCallback(async () => {
    try {
      const communityRecipes = await getCommunityRecipes();

      setRecipes((currentRecipes) => {
        const currentRecipesWithoutCommunity = currentRecipes.filter(
          (recipe) => recipe.source !== "community",
        );

        const communityRecipesWithState = communityRecipes.map((recipe) => ({
          ...recipe,
          isUserCreated: myRecipeIds.includes(recipe.id),
        }));

        return [
          ...communityRecipesWithState,
          ...currentRecipesWithoutCommunity,
        ];
      });
    } catch (error) {
      console.error(error);
    }
  }, [myRecipeIds]);

  const applyApiRecipeLikes = useCallback((recipeId, likes) => {
    const updateRecipeLikes = (recipe) => {
      if (!recipe || recipe.id !== recipeId) return recipe;

      return {
        ...recipe,
        likes,
      };
    };

    setRecipes((currentRecipes) =>
      currentRecipes.map((recipe) => updateRecipeLikes(recipe)),
    );

    setSelectedRecipe((currentRecipe) => updateRecipeLikes(currentRecipe));

    setHistoryRecipes((currentHistory) =>
      currentHistory.map((recipe) => updateRecipeLikes(recipe)),
    );
  }, []);

  const apiRecipeIdsKey = recipes
    .filter((recipe) => recipe.source === "api")
    .map((recipe) => recipe.id)
    .sort()
    .join("|");

  const loadApiRecipeLikes = useCallback(async () => {
    try {
      const apiRecipeIds = apiRecipeIdsKey.split("|").filter(Boolean);

      if (apiRecipeIds.length === 0) return;

      const likesByRecipeId = await getApiRecipeLikeCounts(apiRecipeIds);

      setRecipes((currentRecipes) =>
        currentRecipes.map((recipe) => {
          if (recipe.source !== "api") return recipe;

          return {
            ...recipe,
            likes: likesByRecipeId[recipe.id] || 0,
          };
        }),
      );

      setSelectedRecipe((currentRecipe) => {
        if (!currentRecipe || currentRecipe.source !== "api") {
          return currentRecipe;
        }

        return {
          ...currentRecipe,
          likes: likesByRecipeId[currentRecipe.id] || 0,
        };
      });

      setHistoryRecipes((currentHistory) =>
        currentHistory.map((recipe) => {
          if (recipe.source !== "api") return recipe;

          return {
            ...recipe,
            likes: likesByRecipeId[recipe.id] || 0,
          };
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }, [apiRecipeIdsKey]);

  useEffect(() => {
    const recipesForStorage = recipes.filter(
      (recipe) => recipe.source !== "community" && recipe.source !== "api",
    );

    saveStoredRecipes(recipesForStorage);
  }, [recipes]);

  useEffect(() => {
    saveStoredFavoriteRecipeIds(favoriteRecipeIds);
  }, [favoriteRecipeIds]);

  useEffect(() => {
    const applyFavoriteState = (recipe) => {
      if (!recipe) return recipe;

      return {
        ...recipe,
        isLiked: favoriteRecipeIds.includes(recipe.id),
      };
    };

    setRecipes((currentRecipes) => currentRecipes.map(applyFavoriteState));

    setSelectedRecipe((currentRecipe) => applyFavoriteState(currentRecipe));

    setHistoryRecipes((currentHistory) =>
      currentHistory.map(applyFavoriteState),
    );
  }, [favoriteRecipeIds]);

  useEffect(() => {
    saveStoredMyRecipeIds(myRecipeIds);
  }, [myRecipeIds]);

  useEffect(() => {
    loadCommunityRecipes();
  }, [loadCommunityRecipes]);

  useEffect(() => {
    loadApiRecipeLikes();
  }, [loadApiRecipeLikes]);

  useEffect(() => {
    const unsubscribe = subscribeToCommunityRecipesChanges(() => {
      loadCommunityRecipes();
    });

    return unsubscribe;
  }, [loadCommunityRecipes]);

  useEffect(() => {
    const unsubscribe = subscribeToApiRecipeLikesChanges((payload) => {
      const changedRecipeId = payload.new?.recipe_id;
      const changedLikes = payload.new?.likes;

      if (!changedRecipeId || typeof changedLikes !== "number") return;

      applyApiRecipeLikes(changedRecipeId, changedLikes);
    });

    return unsubscribe;
  }, [applyApiRecipeLikes]);

  const showPrevPopularRecipes = () => {
    if (hasPrevPopularRecipes) {
      setPopularPage((currentPage) => currentPage - 1);
    }
  };

  const addRecipeToHistory = (recipe) => {
    setHistoryRecipes((currentHistory) => {
      const historyWithoutCurrentRecipe = currentHistory.filter(
        (historyRecipe) => historyRecipe.id !== recipe.id,
      );

      return [recipe, ...historyWithoutCurrentRecipe].slice(0, 7);
    });
  };

  const toggleRecipeFavorite = async (recipeId) => {
    const recipeToUpdate = recipes.find((recipe) => recipe.id === recipeId);

    if (!recipeToUpdate) return;

    const isAlreadyFavorite = favoriteRecipeIds.includes(recipeId);

    const likesDelta = isAlreadyFavorite ? -1 : 1;
    const nextIsLiked = !isAlreadyFavorite;

    const nextFavoriteRecipeIds = isAlreadyFavorite
      ? favoriteRecipeIds.filter((favoriteId) => favoriteId !== recipeId)
      : [...new Set([...favoriteRecipeIds, recipeId])];

    const optimisticLikes = Math.max(
      (recipeToUpdate.likes || 0) + likesDelta,
      0,
    );

    setFavoriteRecipeIds(nextFavoriteRecipeIds);

    const applyOptimisticRecipeState = (recipe) => {
      if (!recipe || recipe.id !== recipeId) return recipe;

      return {
        ...recipe,
        isLiked: nextIsLiked,
        likes: optimisticLikes,
      };
    };

    setRecipes((currentRecipes) =>
      currentRecipes.map((recipe) => applyOptimisticRecipeState(recipe)),
    );

    setSelectedRecipe((currentRecipe) =>
      applyOptimisticRecipeState(currentRecipe),
    );

    setHistoryRecipes((currentHistory) =>
      currentHistory.map((recipe) => applyOptimisticRecipeState(recipe)),
    );

    const shouldSyncLikes =
      recipeToUpdate.source === "community" || recipeToUpdate.source === "api";

    if (!shouldSyncLikes) {
      return;
    }

    try {
      const updatedRecipe =
        recipeToUpdate.source === "community"
          ? await changeCommunityRecipeLikes(recipeId, likesDelta)
          : await changeApiRecipeLikes(recipeId, likesDelta);

      const applyUpdatedRecipeState = (recipe) => {
        if (!recipe || recipe.id !== recipeId) return recipe;

        return {
          ...recipe,
          likes: updatedRecipe.likes,
          isLiked: nextIsLiked,
        };
      };

      setRecipes((currentRecipes) =>
        currentRecipes.map((recipe) => applyUpdatedRecipeState(recipe)),
      );

      setSelectedRecipe((currentRecipe) =>
        applyUpdatedRecipeState(currentRecipe),
      );

      setHistoryRecipes((currentHistory) =>
        currentHistory.map((recipe) => applyUpdatedRecipeState(recipe)),
      );
    } catch (error) {
      console.error(error);

      setFavoriteRecipeIds(favoriteRecipeIds);

      setRecipes((currentRecipes) =>
        currentRecipes.map((recipe) =>
          recipe.id === recipeId ? recipeToUpdate : recipe,
        ),
      );

      setSelectedRecipe((currentRecipe) => {
        if (!currentRecipe || currentRecipe.id !== recipeId) {
          return currentRecipe;
        }

        return recipeToUpdate;
      });

      setHistoryRecipes((currentHistory) =>
        currentHistory.map((recipe) =>
          recipe.id === recipeId ? recipeToUpdate : recipe,
        ),
      );

      alert("Could not update likes.");
    }
  };

  const createRecipe = async (recipeData) => {
    try {
      const localRecipe = createLocalRecipe(recipeData);

      let recipeToSave = localRecipe;

      if (currentLanguage === "ru") {
        recipeToSave = await translateRecipeToRussian(localRecipe);
      }

      const communityRecipe = await createCommunityRecipe(recipeToSave);

      const communityRecipeWithState = {
        ...communityRecipe,
        isUserCreated: true,
        isLiked: false,
      };

      setRecipes((currentRecipes) => [
        communityRecipeWithState,
        ...currentRecipes,
      ]);

      setMyRecipeIds((currentRecipeIds) => [
        ...new Set([communityRecipe.id, ...currentRecipeIds]),
      ]);

      setPopularPage(0);
      setActiveModal(null);
    } catch (error) {
      console.error(error);
      alert("Could not create recipe.");
    }
  };

  const deleteRecipe = async (recipeId) => {
    const recipeToDelete = recipes.find((recipe) => recipe.id === recipeId);

    if (!recipeToDelete || !recipeToDelete.isUserCreated) {
      return;
    }

    try {
      if (recipeToDelete.source === "community") {
        await deleteCommunityRecipe(recipeId);
      }

      setRecipes((currentRecipes) =>
        currentRecipes.filter((recipe) => recipe.id !== recipeId),
      );

      setMyRecipeIds((currentRecipeIds) =>
        currentRecipeIds.filter((id) => id !== recipeId),
      );

      setFavoriteRecipeIds((currentFavoriteIds) =>
        currentFavoriteIds.filter((id) => id !== recipeId),
      );

      setHistoryRecipes((currentHistory) =>
        currentHistory.filter((recipe) => recipe.id !== recipeId),
      );

      setSelectedRecipe((currentRecipe) => {
        if (currentRecipe?.id === recipeId) {
          return null;
        }

        return currentRecipe;
      });

      if (selectedRecipe?.id === recipeId) {
        setActiveModal(null);
      }

      setPopularPage(0);
    } catch (error) {
      console.error(error);
      alert("Could not delete recipe.");
    }
  };

  const openRecipe = async (recipe) => {
    setSelectedRecipe(recipe);
    setActiveModal("recipe");
    setRecipeDetailsError("");
    addRecipeToHistory(recipe);

    try {
      setIsRecipeDetailsLoading(true);

      const isApiRecipe = recipe.source === "api";
      const hasFullRecipeData = Boolean(recipe.ingredients || recipe.steps);

      const fullRecipe =
        isApiRecipe && !hasFullRecipeData
          ? await getRecipeById(recipe.id)
          : recipe;

      if (!fullRecipe) {
        throw new Error("Recipe was not found");
      }

      const isFavorite = favoriteRecipeIds.includes(recipe.id);

      const fullRecipeWithSavedState = {
        ...fullRecipe,

        likes: recipe.likes || 0,
        isLiked: isFavorite,
        isUserCreated: recipe.isUserCreated,

        category: fullRecipe.category || recipe.category,
        categories: fullRecipe.categories?.length
          ? fullRecipe.categories
          : recipe.categories,

        photos: fullRecipe.photos?.length ? fullRecipe.photos : recipe.photos,
      };

      let recipeForCurrentLanguage = fullRecipeWithSavedState;

      if (currentLanguage === "ru") {
        try {
          recipeForCurrentLanguage = await translateRecipeToRussian(
            fullRecipeWithSavedState,
          );
        } catch (error) {
          console.error(error);
        }
      }

      setRecipes((currentRecipes) =>
        currentRecipes.map((currentRecipe) =>
          currentRecipe.id === recipe.id
            ? recipeForCurrentLanguage
            : currentRecipe,
        ),
      );

      setSelectedRecipe(recipeForCurrentLanguage);
      addRecipeToHistory(recipeForCurrentLanguage);
    } catch (error) {
      console.error(error);
      setRecipeDetailsError(t(uiText.detailsError));
    } finally {
      setIsRecipeDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRecipe(null);
  };

  const openPhotoPreview = (photo) => {
    setPreviewPhoto(photo);
  };

  const closePhotoPreview = () => {
    setPreviewPhoto(null);
  };

  useEffect(() => {
    localStorage.setItem("recipeTheme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  useEffect(() => {
    const loadInitialRecipes = async () => {
      const hasApiRecipes = recipes.some((recipe) => recipe.source === "api");

      if (hasApiRecipes) return;

      try {
        setIsRecipesLoading(true);
        setRecipesLoadingError("");

        const recipesByCategories = await Promise.all(
          INITIAL_RECIPE_CATEGORIES.map((category) =>
            getRecipesByCategory(category),
          ),
        );

        const loadedRecipes = recipesByCategories
          .map((categoryRecipes) =>
            categoryRecipes
              .filter((recipe) => recipe.image)
              .slice(0, INITIAL_RECIPES_PER_CATEGORY),
          )
          .flat();

        const apiRecipeLikes = await getApiRecipeLikeCounts(
          loadedRecipes.map((recipe) => recipe.id),
        );

        const loadedRecipesWithLikes = loadedRecipes.map((recipe) => ({
          ...recipe,
          likes: apiRecipeLikes[recipe.id] || 0,
          isLiked: favoriteRecipeIds.includes(recipe.id),
        }));

        setRecipes((currentRecipes) => {
          const currentRecipeIds = new Set(
            currentRecipes.map((recipe) => recipe.id),
          );

          const newLoadedRecipes = loadedRecipesWithLikes.filter(
            (recipe) => !currentRecipeIds.has(recipe.id),
          );

          return [...currentRecipes, ...newLoadedRecipes];
        });
      } catch (error) {
        console.error(error);
        setRecipesLoadingError("Failed to load recipes");
      } finally {
        setIsRecipesLoading(false);
      }
    };

    loadInitialRecipes();
  }, [recipes.length]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key !== "Escape") return;

      if (previewPhoto) {
        closePhotoPreview();
        return;
      }

      if (activeModal) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [activeModal, previewPhoto]);

  return (
    <AppLayout isDarkTheme={isDarkTheme}>
      <HomePage
        language={currentLanguage}
        searchQuery={searchQuery}
        isDarkTheme={isDarkTheme}
        activeSearchQuery={activeSearchQuery}
        historyRecipes={historyRecipes}
        isRecipesLoading={isRecipesLoading}
        recipesLoadingError={recipesLoadingError}
        visiblePopularRecipes={visiblePopularRecipes}
        hasNextPopularRecipes={hasNextPopularRecipes}
        hasPrevPopularRecipes={hasPrevPopularRecipes}
        onSearchSubmit={handleSearchSubmit}
        onSearchQueryChange={setSearchQuery}
        onOpenFilters={() => setActiveModal("filter")}
        onToggleTheme={() => setIsDarkTheme((currentValue) => !currentValue)}
        onCreateRecipeClick={() => setActiveModal("create")}
        onFavoritesClick={() => setActiveModal("favorites")}
        onMyRecipesClick={() => setActiveModal("myRecipes")}
        onNextPopularRecipes={showNextPopularRecipes}
        onPrevPopularRecipes={showPrevPopularRecipes}
        onOpenRecipe={openRecipe}
      />

      <ModalLayer
        activeModal={activeModal}
        language={currentLanguage}
        activeFilters={activeFilters}
        selectedRecipe={selectedRecipe}
        isRecipeDetailsLoading={isRecipeDetailsLoading}
        recipeDetailsError={recipeDetailsError}
        recipes={recipes}
        favoriteRecipeIds={favoriteRecipeIds}
        myRecipeIds={myRecipeIds}
        onClose={closeModal}
        onApplyFilters={applyFilters}
        onOpenPhoto={openPhotoPreview}
        onToggleFavorite={toggleRecipeFavorite}
        onCreateRecipe={createRecipe}
        onOpenRecipe={openRecipe}
        onDeleteRecipe={deleteRecipe}
      />

      <PhotoPreview photo={previewPhoto} onClose={closePhotoPreview} />
    </AppLayout>
  );
}

export default App;
