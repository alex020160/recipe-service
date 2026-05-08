import { useState, useRef, useEffect } from "react";
import { uiText } from "./constants/uiText";
import {
  getLocalizedRecipeField,
  translateRecipeToRussian,
} from "./utils/translateRecipe";

import {
  bagIcon,
  closeIcon,
  editIcon,
  filterIcon,
  heartIcon,
  plusIcon,
  searchIcon,
  clockIcon,
  arrowRightIcon,
  buttonApplyIcon,
  createButtonIcon,
} from "./assets/icons";

import { recipeCategories } from "./constants/recipeCategories";

import defaultRecipeImage from "./assets/images/defaultRecipeImage.svg";

import {
  createLocalRecipe,
  getRecipeTimeMinutes,
  splitRecipeText,
} from "./utils/normalizeRecipe";

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

import { getBrowserLanguage, getLocalizedText } from "./utils/getLocalizedText";
import { getLocalizedCategory } from "./constants/categoryTranslations";

const DEFAULT_POPULAR_PAGE_SIZE = 3;
const TABLET_POPULAR_PAGE_SIZE = 4;
const COLLECTION_PAGE_SIZE = 4;

const getPopularPageSize = () => {
  if (typeof window === "undefined") return DEFAULT_POPULAR_PAGE_SIZE;

  return window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches
    ? TABLET_POPULAR_PAGE_SIZE
    : DEFAULT_POPULAR_PAGE_SIZE;
};

const normalizeSearchValue = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const doesRecipeMatchSearch = (recipe, searchQuery) => {
  const normalizedSearchQuery = normalizeSearchValue(searchQuery);

  if (!normalizedSearchQuery) {
    return true;
  }

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
};

const getLocalizedRecipeTime = (recipe, language) => {
  const timeMinutes =
    typeof recipe.timeMinutes === "number"
      ? recipe.timeMinutes
      : getRecipeTimeMinutes(recipe.time);

  if (!timeMinutes) return "—";

  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;

  if (language === "ru") {
    if (hours > 0 && minutes > 0) {
      return `${hours} ч ${minutes} мин`;
    }

    if (hours > 0) {
      return `${hours} ч`;
    }

    return `${minutes} мин`;
  }

  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}min`;
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
  const [recipes, setRecipes] = useState(() => getStoredRecipes());
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

  const filteredRecipes = recipes.filter((recipe) => {
    const hasSelectedCategories = activeFilters.categories.length > 0;

    const currentRecipeCategories = recipe.categories || [];

    const matchesSearch = doesRecipeMatchSearch(recipe, activeSearchQuery);

    const matchesCategory =
      !hasSelectedCategories ||
      currentRecipeCategories.some((category) =>
        activeFilters.categories.includes(category),
      );

    const recipeTimeMinutes =
      typeof recipe.timeMinutes === "number"
        ? recipe.timeMinutes
        : getRecipeTimeMinutes(recipe.time);

    const matchesTime =
      recipeTimeMinutes >= activeFilters.minTimeMinutes &&
      recipeTimeMinutes <= activeFilters.maxTimeMinutes;

    return matchesSearch && matchesCategory && matchesTime;
  });

  const popularRecipes = [...filteredRecipes].sort(
    (firstRecipe, secondRecipe) => secondRecipe.likes - firstRecipe.likes,
  );

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
              isLiked: isFavorite,
            };
          }

          return {
            ...apiRecipe,

            likes: savedRecipe.likes || 0,
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

  const visiblePopularRecipes = popularRecipes.slice(
    popularStartIndex,
    popularStartIndex + popularPageSize,
  );

  const hasNextPopularRecipes =
    popularStartIndex + popularPageSize < popularRecipes.length;

  const hasPrevPopularRecipes = popularPage > 0;

  const showNextPopularRecipes = () => {
    if (hasNextPopularRecipes) {
      setPopularPage((currentPage) => currentPage + 1);
    }
  };

  useEffect(() => {
    saveStoredRecipes(recipes);
  }, [recipes]);

  useEffect(() => {
    saveStoredFavoriteRecipeIds(favoriteRecipeIds);
  }, [favoriteRecipeIds]);

  useEffect(() => {
    saveStoredMyRecipeIds(myRecipeIds);
  }, [myRecipeIds]);

  useEffect(() => {
    const tabletMediaQuery = window.matchMedia(
      "(min-width: 768px) and (max-width: 1024px)",
    );

    const updatePopularPageSize = () => {
      setPopularPageSize(
        tabletMediaQuery.matches
          ? TABLET_POPULAR_PAGE_SIZE
          : DEFAULT_POPULAR_PAGE_SIZE,
      );

      setPopularPage(0);
    };

    updatePopularPageSize();

    tabletMediaQuery.addEventListener("change", updatePopularPageSize);

    return () => {
      tabletMediaQuery.removeEventListener("change", updatePopularPageSize);
    };
  }, []);

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

  const toggleRecipeFavorite = (recipeId) => {
    const isAlreadyFavorite = favoriteRecipeIds.includes(recipeId);

    setFavoriteRecipeIds((currentFavoriteIds) => {
      if (isAlreadyFavorite) {
        return currentFavoriteIds.filter(
          (favoriteId) => favoriteId !== recipeId,
        );
      }

      return [...currentFavoriteIds, recipeId];
    });

    setRecipes((currentRecipes) =>
      currentRecipes.map((recipe) => {
        if (recipe.id !== recipeId) return recipe;

        const nextLikes = isAlreadyFavorite
          ? Math.max((recipe.likes || 0) - 1, 0)
          : (recipe.likes || 0) + 1;

        return {
          ...recipe,
          isLiked: !isAlreadyFavorite,
          likes: nextLikes,
        };
      }),
    );

    setSelectedRecipe((currentRecipe) => {
      if (!currentRecipe || currentRecipe.id !== recipeId) {
        return currentRecipe;
      }

      const nextLikes = isAlreadyFavorite
        ? Math.max((currentRecipe.likes || 0) - 1, 0)
        : (currentRecipe.likes || 0) + 1;

      return {
        ...currentRecipe,
        isLiked: !isAlreadyFavorite,
        likes: nextLikes,
      };
    });

    setHistoryRecipes((currentHistory) =>
      currentHistory.map((recipe) => {
        if (recipe.id !== recipeId) return recipe;

        const nextLikes = isAlreadyFavorite
          ? Math.max((recipe.likes || 0) - 1, 0)
          : (recipe.likes || 0) + 1;

        return {
          ...recipe,
          isLiked: !isAlreadyFavorite,
          likes: nextLikes,
        };
      }),
    );
  };

  const createRecipe = (recipeData) => {
    const newRecipe = createLocalRecipe(recipeData);

    setRecipes((currentRecipes) => [newRecipe, ...currentRecipes]);

    setMyRecipeIds((currentRecipeIds) => [newRecipe.id, ...currentRecipeIds]);

    setPopularPage(0);
    setActiveModal(null);
  };

  const deleteRecipe = (recipeId) => {
    const recipeToDelete = recipes.find((recipe) => recipe.id === recipeId);

    if (!recipeToDelete || !recipeToDelete.isUserCreated) {
      return;
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
  };

  const openRecipe = async (recipe) => {
    setSelectedRecipe(recipe);
    setActiveModal("recipe");
    setRecipeDetailsError("");
    addRecipeToHistory(recipe);

    const isApiRecipe = recipe.source === "api";

    if (!isApiRecipe) {
      return;
    }

    try {
      setIsRecipeDetailsLoading(true);

      const hasFullRecipeData = Boolean(recipe.ingredients || recipe.steps);

      const fullRecipe = hasFullRecipeData
        ? recipe
        : await getRecipeById(recipe.id);

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
      if (recipes.length > 0) return;

      try {
        setIsRecipesLoading(true);
        setRecipesLoadingError("");

        const categoriesToLoad = [
          "Chicken",
          "Dessert",
          "Pasta",
          "Seafood",
          "Vegetarian",
        ];

        const recipesByCategories = await Promise.all(
          categoriesToLoad.map((category) => getRecipesByCategory(category)),
        );

        const loadedRecipes = recipesByCategories
          .map((categoryRecipes) =>
            categoryRecipes.filter((recipe) => recipe.image).slice(0, 4),
          )
          .flat();

        setRecipes(loadedRecipes);
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
    <div className={`page ${isDarkTheme ? "page--dark" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar__overlay">
          <h1 className="sidebar__title">
            YOUR
            <br />
            FOOD,
            <br />
            YOUR
            <br />
            MOOD
          </h1>

          <nav className="sidebar__nav" aria-label="Main actions">
            <button
              className="sidebar__button"
              type="button"
              onClick={() => setActiveModal("create")}
            >
              {t(uiText.createRecipe)}
            </button>

            <button
              className="sidebar__button"
              type="button"
              onClick={() => setActiveModal("favorites")}
            >
              {t(uiText.favorites)}
            </button>

            <button
              className="sidebar__button"
              type="button"
              onClick={() => setActiveModal("myRecipes")}
            >
              {t(uiText.yourRecipes)}
            </button>
          </nav>
        </div>
      </aside>

      <main className="main">
        <section className="search">
          <form className="search__form" onSubmit={handleSearchSubmit}>
            <input
              className="search__input"
              id="recipe-search"
              name="search"
              type="search"
              aria-label="Search recipes"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button
              className="search__submit"
              type="submit"
              aria-label="Search"
            >
              <img
                className="search__icon"
                src={searchIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
            <button
              className="search__filter"
              type="button"
              aria-label="Open filters"
              onClick={() => setActiveModal("filter")}
            >
              <img
                className="search__filter-icon"
                src={filterIcon}
                alt=""
                aria-hidden="true"
              />
            </button>

            <button
              className="search__theme-toggle"
              type="button"
              aria-label={
                isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
              }
              onClick={() => setIsDarkTheme((currentValue) => !currentValue)}
            >
              {isDarkTheme ? "☀" : "☾"}
            </button>
          </form>
        </section>

        <div className="main__content">
          <section className="recipes-board">
            <div className="popular">
              <h2 className="popular__title">
                {activeSearchQuery
                  ? t(uiText.searchResults)
                  : t(uiText.popularRecipes)}
              </h2>

              <div className="popular__content">
                <div className="popular__list">
                  {isRecipesLoading && (
                    <p className="popular__empty">{t(uiText.loadingRecipes)}</p>
                  )}

                  {!isRecipesLoading && recipesLoadingError && (
                    <p className="popular__empty">
                      {recipesLoadingError || t(uiText.loadingError)}
                    </p>
                  )}

                  {!isRecipesLoading &&
                    !recipesLoadingError &&
                    visiblePopularRecipes.length === 0 && (
                      <p className="popular__empty">{t(uiText.noRecipes)}</p>
                    )}

                  {!isRecipesLoading &&
                    !recipesLoadingError &&
                    visiblePopularRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        language={currentLanguage}
                        onOpen={() => openRecipe(recipe)}
                      />
                    ))}
                </div>

                <div className="popular__controls">
                  {hasNextPopularRecipes && (
                    <button
                      className="popular__nav-button popular__nav-button--next"
                      type="button"
                      aria-label="Show next popular recipes"
                      onClick={showNextPopularRecipes}
                    >
                      <img
                        className="popular__nav-icon"
                        src={arrowRightIcon}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  {hasPrevPopularRecipes && (
                    <button
                      className="popular__nav-button popular__nav-button--prev"
                      type="button"
                      aria-label="Show previous popular recipes"
                      onClick={showPrevPopularRecipes}
                    >
                      <img
                        className="popular__nav-icon popular__nav-icon--prev"
                        src={arrowRightIcon}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <HistoryPanel
            recipes={historyRecipes}
            language={currentLanguage}
            onOpen={openRecipe}
          />
        </div>
      </main>

      {activeModal && (
        <div className="modal-layer">
          <div className="modal-layer__backdrop" onClick={closeModal}></div>

          {activeModal === "filter" && (
            <FilterModal
              activeFilters={activeFilters}
              language={currentLanguage}
              onApplyFilters={applyFilters}
              onClose={closeModal}
            />
          )}

          {activeModal === "recipe" && (
            <RecipeModal
              recipe={selectedRecipe}
              language={currentLanguage}
              isLoading={isRecipeDetailsLoading}
              error={recipeDetailsError}
              onClose={closeModal}
              onOpenPhoto={openPhotoPreview}
              onToggleFavorite={toggleRecipeFavorite}
            />
          )}

          {activeModal === "create" && (
            <CreateRecipeModal
              language={currentLanguage}
              onCreateRecipe={createRecipe}
              onClose={closeModal}
            />
          )}

          {activeModal === "favorites" && (
            <RecipeCollectionModal
              title={t(uiText.favorites)}
              subtitle={t(uiText.favoritesSubtitle)}
              actionLabel={t(uiText.removeFromFavorites)}
              recipes={recipes.filter((recipe) =>
                favoriteRecipeIds.includes(recipe.id),
              )}
              language={currentLanguage}
              onClose={closeModal}
              onOpen={openRecipe}
              onAction={toggleRecipeFavorite}
            />
          )}

          {activeModal === "myRecipes" && (
            <RecipeCollectionModal
              title={t(uiText.yourRecipes)}
              subtitle={t(uiText.yourRecipesSubtitle)}
              actionLabel={t(uiText.delete)}
              recipes={recipes.filter((recipe) =>
                myRecipeIds.includes(recipe.id),
              )}
              language={currentLanguage}
              onClose={closeModal}
              onOpen={openRecipe}
              onAction={deleteRecipe}
            />
          )}
        </div>
      )}
      {previewPhoto && (
        <div className="photo-preview" onClick={closePhotoPreview}>
          <button
            className="photo-preview__close"
            type="button"
            aria-label="Close photo preview"
            onClick={closePhotoPreview}
          >
            <img
              className="photo-preview__close-icon"
              src={closeIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <img
            className="photo-preview__image"
            src={previewPhoto}
            alt="Cooking photo preview"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe, language, onOpen }) {
  const localizedTitle = getLocalizedRecipeField(recipe, "title", language);

  return (
    <article className="recipe-card">
      <button className="recipe-card__button" type="button" onClick={onOpen}>
        <img
          className="recipe-card__image"
          src={recipe.image || defaultRecipeImage}
          alt={localizedTitle}
        />

        <div className="recipe-card__body">
          <div className="recipe-card__info">
            <h3 className="recipe-card__title">{localizedTitle}</h3>

            <p className="recipe-card__time">
              <img
                className="recipe-card__icon"
                src={clockIcon}
                alt=""
                aria-hidden="true"
              />
              <span className="recipe-card__time-text">
                {getLocalizedRecipeTime(recipe, language)}
              </span>
            </p>
          </div>

          <ul className="recipe-card__categories">
            {(recipe.categories || []).map((category, index) => (
              <li className="recipe-card__category" key={index}>
                {getLocalizedCategory(category, language)}
              </li>
            ))}
          </ul>

          <p className="recipe-card__likes">
            {recipe.likes}{" "}
            <img
              className="recipe-card__icon"
              src={heartIcon}
              alt=""
              aria-hidden="true"
            />
          </p>
        </div>
      </button>
    </article>
  );
}

function HistoryPanel({ recipes, language, onOpen }) {
  const t = (text) => getLocalizedText(text, language);

  return (
    <aside className="history">
      <h2 className="history__title">{t(uiText.history)}</h2>

      <ul className="history__list">
        {recipes.map((recipe) => (
          <li className="history__item" key={recipe.id}>
            <button
              className="history__button"
              type="button"
              onClick={() => onOpen(recipe)}
            >
              {getLocalizedRecipeField(recipe, "title", language)}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FilterModal({ activeFilters, language, onApplyFilters, onClose }) {
  const t = (text) => getLocalizedText(text, language);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const selectedCategories = formData.getAll("categories");

    const minHours = Number(formData.get("minHours") || 0);
    const minMinutes = Number(formData.get("minMinutes") || 0);

    const maxHoursValue = formData.get("maxHours");
    const maxMinutesValue = formData.get("maxMinutes");

    const hasMaxTime = maxHoursValue !== "" || maxMinutesValue !== "";

    const maxHours = Number(maxHoursValue || 0);
    const maxMinutes = Number(maxMinutesValue || 0);

    const minTimeMinutes = minHours * 60 + minMinutes;
    const maxTimeMinutes = hasMaxTime ? maxHours * 60 + maxMinutes : Infinity;

    onApplyFilters({
      categories: selectedCategories,
      minTimeMinutes,
      maxTimeMinutes,
    });

    onClose();
  };

  return (
    <section className="modal modal--filter" role="dialog" aria-modal="true">
      <button className="modal__close" type="button" onClick={onClose}>
        <img
          className="modal__close-icon"
          src={closeIcon}
          alt=""
          aria-hidden="true"
        />
      </button>

      <h2 className="modal__title">{t(uiText.filterTitle)}</h2>

      <form className="filter-form" onSubmit={handleSubmit}>
        <fieldset className="filter-form__group">
          <legend className="filter-form__legend">
            {t(uiText.categories)}
          </legend>

          <div className="filter-form__categories">
            {recipeCategories.map((category) => (
              <label className="filter-form__checkbox" key={category}>
                <input
                  className="filter-form__checkbox-input"
                  type="checkbox"
                  name="categories"
                  value={category}
                  defaultChecked={activeFilters.categories.includes(category)}
                />
                <span className="filter-form__checkbox-text">
                  {getLocalizedCategory(category, language)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-form__group filter-form__group--time">
          <legend className="filter-form__legend">{t(uiText.time)}</legend>

          <div className="filter-form__time-row">
            <span className="filter-form__time-caption">
              {t(uiText.minimum)}
            </span>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="minHours"
                min="0"
                max="24"
                step="1"
                defaultValue={Math.floor(activeFilters.minTimeMinutes / 60)}
              />
              {language === "ru" ? "ч" : "h"}
            </label>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="minMinutes"
                min="0"
                max="59"
                step="1"
                defaultValue={activeFilters.minTimeMinutes % 60}
              />
              {language === "ru" ? "мин" : "min"}
            </label>
          </div>

          <div className="filter-form__time-row">
            <span className="filter-form__time-caption">
              {t(uiText.maximum)}
            </span>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="maxHours"
                min="0"
                max="24"
                step="1"
                defaultValue={
                  activeFilters.maxTimeMinutes === Infinity
                    ? ""
                    : Math.floor(activeFilters.maxTimeMinutes / 60)
                }
              />
              {language === "ru" ? "ч" : "h"}
            </label>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="maxMinutes"
                min="0"
                max="59"
                step="1"
                defaultValue={
                  activeFilters.maxTimeMinutes === Infinity
                    ? ""
                    : activeFilters.maxTimeMinutes % 60
                }
              />
              {language === "ru" ? "мин" : "min"}
            </label>
          </div>

          <button
            className="filter-form__submit"
            type="submit"
            aria-label={t(uiText.applyFilters)}
          >
            <img
              className="filter-form__submit-image"
              src={buttonApplyIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </fieldset>
      </form>
    </section>
  );
}

function RecipeModal({
  recipe,
  language,
  isLoading,
  error,
  onClose,
  onOpenPhoto,
  onToggleFavorite,
}) {
  const [areCookingPhotosExpanded, setAreCookingPhotosExpanded] =
    useState(false);
  if (!recipe) return null;

  const recipePhotos = recipe.photos?.filter(Boolean).slice(0, 6) || [];

  const cookingPhotos = recipe.photos?.filter(Boolean).slice(0, 6) || [];

  const visibleCookingPhotos = areCookingPhotosExpanded
    ? cookingPhotos
    : cookingPhotos.slice(0, 2);

  const hasCookingPhotos = cookingPhotos.length > 0;
  const hasHiddenCookingPhotos = cookingPhotos.length > 2;
  const t = (text) => getLocalizedText(text, language);
  const localizedIngredients = getLocalizedRecipeField(
    recipe,
    "ingredients",
    language,
  );
  const ingredientItems = splitRecipeText(localizedIngredients);
  const localizedSteps = getLocalizedRecipeField(recipe, "steps", language);

  const stepItems = splitRecipeText(localizedSteps);
  return (
    <section className="modal modal--recipe" role="dialog" aria-modal="true">
      <button className="modal__close" type="button" onClick={onClose}>
        <img
          className="modal__close-icon"
          src={closeIcon}
          alt=""
          aria-hidden="true"
        />
      </button>

      <div className="recipe-modal">
        <div className="recipe-modal__media">
          <button
            className="recipe-modal__favorite"
            type="button"
            onClick={() => onToggleFavorite(recipe.id)}
          >
            {recipe.isLiked
              ? t(uiText.removeFromFavorites)
              : t(uiText.addToFavorites)}
          </button>

          <img
            className="recipe-modal__image"
            src={recipe.image || defaultRecipeImage}
            alt={recipe.title}
          />
        </div>

        <div className="recipe-modal__header">
          <h2 className="recipe-modal__title">
            {getLocalizedRecipeField(recipe, "title", language)}
          </h2>

          <div className="recipe-modal__meta">
            <span className="recipe-modal__time">
              <img
                className="recipe-card__icon"
                src={clockIcon}
                alt=""
                aria-hidden="true"
              />
              {getLocalizedRecipeTime(recipe, language)}
            </span>
            <span className="recipe-modal__likes">
              <img
                className="recipe-card__icon"
                src={heartIcon}
                alt=""
                aria-hidden="true"
              />
              {recipe.likes}
            </span>
          </div>
        </div>

        <div className="recipe-modal__ingredients">
          <div className="recipe-modal__ingredients-content">
            <h3 className="recipe-modal__subtitle">{t(uiText.ingredients)}</h3>

            {isLoading && (
              <p className="recipe-modal__empty">{t(uiText.detailsLoading)}</p>
            )}

            {!isLoading && error && (
              <p className="recipe-modal__empty">{error}</p>
            )}

            {!isLoading && !error && (
              <ul className="recipe-modal__list">
                {ingredientItems.length > 0 ? (
                  ingredientItems.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))
                ) : (
                  <li>{t(uiText.ingredientsEmpty)}</li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="recipe-modal__categories">
          <h3 className="recipe-modal__subtitle">{t(uiText.categories)}</h3>

          <ul className="recipe-modal__list">
            {(recipe.categories || []).map((category, index) => (
              <li key={index}>{getLocalizedCategory(category, language)}</li>
            ))}
          </ul>
        </div>

        <div className="recipe-modal__steps">
          <div className="recipe-modal__steps-content">
            <h3 className="recipe-modal__subtitle">{t(uiText.steps)}</h3>

            {isLoading && (
              <p className="recipe-modal__empty">{t(uiText.stepsLoading)}</p>
            )}

            {!isLoading && error && (
              <p className="recipe-modal__empty">{error}</p>
            )}

            {!isLoading && !error && (
              <ol className="recipe-modal__steps-list">
                {stepItems.length > 0 ? (
                  stepItems.map((step, index) => <li key={index}>{step}</li>)
                ) : (
                  <li>{t(uiText.stepsEmpty)}</li>
                )}
              </ol>
            )}
          </div>
        </div>

        <div className="recipe-modal__photos">
          <h3 className="recipe-modal__subtitle">{t(uiText.cookingPhotos)}</h3>

          {hasCookingPhotos ? (
            <>
              <div className="recipe-modal__photo-list">
                {visibleCookingPhotos.map((photo, index) => (
                  <img
                    className="recipe-modal__photo"
                    src={photo}
                    alt={`Cooking step ${index + 1}`}
                    key={`${photo}-${index}`}
                    onClick={() => onOpenPhoto(photo)}
                  />
                ))}
              </div>

              {hasHiddenCookingPhotos && (
                <button
                  className={`recipe-modal__photos-toggle ${
                    areCookingPhotosExpanded
                      ? "recipe-modal__photos-toggle--open"
                      : ""
                  }`}
                  type="button"
                  aria-label={
                    areCookingPhotosExpanded
                      ? "Hide cooking photos"
                      : "Show more cooking photos"
                  }
                  onClick={() =>
                    setAreCookingPhotosExpanded((currentValue) => !currentValue)
                  }
                >
                  <img
                    className="recipe-modal__photos-toggle-icon"
                    src={arrowRightIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              )}
            </>
          ) : (
            <p className="recipe-modal__empty">
              {language === "ru"
                ? "Фото приготовления не добавлены"
                : "Cooking photos have not been added"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

function CreateRecipeModal({ language, onCreateRecipe, onClose }) {
  const t = (text) => getLocalizedText(text, language);
  const [avatarPreview, setAvatarPreview] = useState(defaultRecipeImage);
  const [avatarImage, setAvatarImage] = useState("");
  const [cookingPhotos, setCookingPhotos] = useState(Array(6).fill(null));
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  const avatarInputRef = useRef(null);
  const photosInputRef = useRef(null);

  const openAvatarFileDialog = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const temporaryImageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = async () => {
      const isValidAvatarSize =
        image.naturalWidth >= 427 && image.naturalHeight >= 80;

      URL.revokeObjectURL(temporaryImageUrl);

      if (!isValidAvatarSize) {
        event.target.value = "";
        alert("Avatar image must be at least 427px wide and 80px high.");
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);

        setAvatarPreview(dataUrl);
        setAvatarImage(dataUrl);
      } catch {
        event.target.value = "";
        alert("Could not read this image.");
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(temporaryImageUrl);
      event.target.value = "";
      alert("Could not load this image.");
    };

    image.src = temporaryImageUrl;
  };

  const openPhotoFileDialog = (index = null) => {
    const firstEmptyIndex = cookingPhotos.findIndex((photo) => photo === null);
    const targetIndex = index ?? (firstEmptyIndex === -1 ? 0 : firstEmptyIndex);

    setActivePhotoIndex(targetIndex);
    photosInputRef.current?.click();
  };

  const handleCookingPhotoChange = async (event) => {
    const file = event.target.files[0];

    if (!file || activePhotoIndex === null) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setCookingPhotos((currentPhotos) =>
        currentPhotos.map((photo, index) =>
          index === activePhotoIndex ? dataUrl : photo,
        ),
      );
    } catch {
      alert("Could not read this image.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const title = formData.get("recipeName")?.trim();
    const ingredients = formData.get("ingredients")?.trim();

    const steps = [...formData.entries()]
      .filter(([name]) => name.startsWith("step-"))
      .map(([, value]) => String(value).trim())
      .filter(Boolean)
      .join("\n");

    const categories = formData.getAll("categories");

    const hours = formData.get("hours");
    const minutes = formData.get("minutes");

    const photos = cookingPhotos.filter(Boolean);

    if (!title || !ingredients || !steps) {
      alert("Please fill in recipe name, ingredients and steps.");
      return;
    }

    onCreateRecipe({
      title,
      ingredients,
      steps,
      categories,
      image: avatarImage || defaultRecipeImage,
      photos,
      hours,
      minutes,
    });
  };

  return (
    <section className="modal modal--create" role="dialog" aria-modal="true">
      <button className="modal__close" type="button" onClick={onClose}>
        <img
          className="modal__close-icon"
          src={closeIcon}
          alt=""
          aria-hidden="true"
        />
      </button>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="create-form__header">
          <span className="create-form__name">{t(uiText.nameRecipe)}</span>

          <label className="create-form__name-field" htmlFor="recipe-name">
            <input
              className="create-form__name-input"
              id="recipe-name"
              type="text"
              name="recipeName"
              required
            />
          </label>
        </div>

        <div className="create-form__ingredients">
          <h2 className="create-form__title">
            {t(uiText.addIngredientsFirstLine)}
            <br />
            {t(uiText.addIngredientsSecondLine)}
          </h2>

          <div className="create-form__ingredients-paper">
            <textarea
              className="create-form__textarea create-form__textarea--ingredients"
              name="ingredients"
              aria-label="Recipe ingredients"
              required
            ></textarea>
          </div>
        </div>

        <div className="create-form__steps">
          <h2 className="create-form__title">
            {t(uiText.addStepsFirstLine)}
            <br />
            {t(uiText.addStepsSecondLine)}
          </h2>

          <div className="create-form__steps-editor-wrapper">
            <StepsEditor />
          </div>
        </div>

        <div className="create-form__avatar">
          <input
            ref={avatarInputRef}
            className="create-form__file"
            id="recipe-avatar"
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
          />

          <button
            className="create-form__avatar-preview"
            type="button"
            aria-label="Change recipe avatar"
            onClick={openAvatarFileDialog}
          >
            <img
              className="create-form__avatar-image"
              src={avatarPreview}
              alt="Recipe avatar preview"
            />
          </button>

          <button
            className="create-form__avatar-label"
            type="button"
            onClick={openAvatarFileDialog}
          >
            <span>{t(uiText.changeRecipeAvatar)}</span>
            <img
              className="create-form__edit-icon"
              src={editIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>

        <fieldset className="create-form__categories">
          <legend className="create-form__categories-title">
            {t(uiText.addCategories)}
          </legend>

          {recipeCategories.map((category) => (
            <label className="create-form__category" key={category}>
              <input type="checkbox" name="categories" value={category} />
              <span>{getLocalizedCategory(category, language)}</span>
            </label>
          ))}
        </fieldset>

        <div className="create-form__photos">
          <p className="create-form__photos-title">
            {t(uiText.addCookingPhotoFirstLine)}
            <br />
            {t(uiText.addCookingPhotoSecondLine)}
          </p>

          <input
            ref={photosInputRef}
            className="create-form__file"
            type="file"
            name="photos"
            accept="image/*"
            onChange={handleCookingPhotoChange}
          />

          <button
            className="create-form__add-photo"
            type="button"
            aria-label="Add cooking photo"
            onClick={() => openPhotoFileDialog()}
          >
            <img
              className="create-form__add-photo-icon"
              src={plusIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <div className="create-form__photo-grid">
            {cookingPhotos.map((photo, index) => (
              <button
                className="create-form__photo-cell"
                type="button"
                key={index}
                aria-label={`Add or change cooking photo ${index + 1}`}
                onClick={() => openPhotoFileDialog(index)}
              >
                {photo && (
                  <img
                    className="create-form__photo-image"
                    src={photo}
                    alt={`Cooking photo ${index + 1}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="create-form__time">
          <legend className="create-form__time-title">
            {t(uiText.addTimeFirstLine)}
            <br />
            {t(uiText.addTimeSecondLine)}
          </legend>

          <label className="create-form__time-label">
            <input
              className="create-form__time-input"
              type="number"
              name="hours"
              min="0"
              required
            />
            {t(uiText.timeHours)}
          </label>

          <label className="create-form__time-label">
            <input
              className="create-form__time-input"
              type="number"
              name="minutes"
              min="0"
              max="59"
              required
            />
            {t(uiText.timeMinutes)}
          </label>
        </fieldset>

        <button
          className="create-form__submit"
          type="submit"
          aria-label="Create recipe"
        >
          <img
            className="create-form__submit-image"
            src={createButtonIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </form>
    </section>
  );
}

function RecipeCollectionModal({
  title,
  subtitle,
  actionLabel,
  recipes,
  language,
  onClose,
  onOpen,
  onAction,
}) {
  const [collectionPage, setCollectionPage] = useState(0);

  const collectionStartIndex = collectionPage * COLLECTION_PAGE_SIZE;
  const visibleCollectionRecipes = recipes.slice(
    collectionStartIndex,
    collectionStartIndex + COLLECTION_PAGE_SIZE,
  );

  const hasNextCollectionRecipes =
    collectionStartIndex + COLLECTION_PAGE_SIZE < recipes.length;

  const hasPrevCollectionRecipes = collectionPage > 0;

  useEffect(() => {
    if (collectionPage > 0 && collectionStartIndex >= recipes.length) {
      setCollectionPage((currentPage) => Math.max(currentPage - 1, 0));
    }
  }, [collectionPage, collectionStartIndex, recipes.length]);

  const showNextCollectionRecipes = () => {
    if (hasNextCollectionRecipes) {
      setCollectionPage((currentPage) => currentPage + 1);
    }
  };

  const showPrevCollectionRecipes = () => {
    if (hasPrevCollectionRecipes) {
      setCollectionPage((currentPage) => currentPage - 1);
    }
  };
  const t = (text) => getLocalizedText(text, language);

  return (
    <section
      className="modal modal--collection"
      role="dialog"
      aria-modal="true"
    >
      <button className="modal__close" type="button" onClick={onClose}>
        <img
          className="modal__close-icon"
          src={closeIcon}
          alt=""
          aria-hidden="true"
        />
      </button>

      <div className="collection">
        <header className="collection__header">
          <h2 className="collection__title">{title}</h2>
          <p className="collection__subtitle">{subtitle}</p>
        </header>

        <div className="collection__grid">
          {visibleCollectionRecipes.length > 0 ? (
            visibleCollectionRecipes.map((recipe) => (
              <div className="collection__item" key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  language={language}
                  onOpen={() => onOpen(recipe)}
                />

                <button
                  className="collection__action"
                  type="button"
                  onClick={() => onAction?.(recipe.id)}
                >
                  <span className="collection__action-icon-wrap">
                    <img
                      className="collection__action-icon"
                      src={bagIcon}
                      alt=""
                      aria-hidden="true"
                    />
                  </span>
                  {actionLabel}
                </button>
              </div>
            ))
          ) : (
            <p className="collection__empty">{t(uiText.noRecipes)}</p>
          )}
        </div>

        <div className="collection__controls">
          {hasNextCollectionRecipes && (
            <button
              className="collection__nav-button collection__nav-button--next"
              type="button"
              aria-label="Show next recipes"
              onClick={showNextCollectionRecipes}
            >
              <img
                className="collection__nav-icon"
                src={arrowRightIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
          )}

          {hasPrevCollectionRecipes && (
            <button
              className="collection__nav-button collection__nav-button--prev"
              type="button"
              aria-label="Show previous recipes"
              onClick={showPrevCollectionRecipes}
            >
              <img
                className="collection__nav-icon collection__nav-icon--prev"
                src={arrowRightIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function StepsEditor() {
  const [steps, setSteps] = useState([{ id: 1, text: "" }]);
  const textareaRefs = useRef({});

  const focusLastStep = () => {
    const lastStep = steps[steps.length - 1];
    const textarea = textareaRefs.current[lastStep.id];

    if (textarea) {
      textarea.focus();
      const textLength = textarea.value.length;
      textarea.setSelectionRange(textLength, textLength);
    }
  };

  const handleEditorClick = (event) => {
    if (event.target.tagName.toLowerCase() === "textarea") return;

    focusLastStep();
  };

  const handleChange = (id, value) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, text: value } : step)),
    );
  };

  const handleKeyDown = (event, index, id) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const textarea = textareaRefs.current[id];
      const cursorPosition = textarea.selectionStart;
      const currentValue = steps[index].text;

      const beforeCursor = currentValue.slice(0, cursorPosition);
      const afterCursor = currentValue.slice(cursorPosition);

      const newStep = {
        id: Date.now(),
        text: afterCursor,
      };

      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], text: beforeCursor };
      updatedSteps.splice(index + 1, 0, newStep);

      setSteps(updatedSteps);

      setTimeout(() => {
        const nextTextarea = textareaRefs.current[newStep.id];

        if (nextTextarea) {
          nextTextarea.focus();
          nextTextarea.setSelectionRange(0, 0);
          autoResize(nextTextarea);
        }
      }, 0);
    }

    if (
      event.key === "Backspace" &&
      steps[index].text === "" &&
      steps.length > 1
    ) {
      event.preventDefault();

      const previousStepId = steps[index - 1]?.id;
      const updatedSteps = steps.filter((step) => step.id !== id);

      setSteps(updatedSteps);

      setTimeout(() => {
        const prevTextarea = textareaRefs.current[previousStepId];

        if (prevTextarea) {
          prevTextarea.focus();
          const len = prevTextarea.value.length;
          prevTextarea.setSelectionRange(len, len);
          autoResize(prevTextarea);
        }
      }, 0);
    }
  };

  const autoResize = (textarea) => {
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    steps.forEach((step) => {
      const textarea = textareaRefs.current[step.id];

      if (textarea) autoResize(textarea);
    });
  }, [steps]);

  return (
    <div className="steps-editor" onClick={handleEditorClick}>
      {steps.map((step, index) => (
        <div className="steps-editor__item" key={step.id}>
          <span className="steps-editor__bullet">•</span>

          <textarea
            ref={(el) => {
              textareaRefs.current[step.id] = el;
            }}
            className="steps-editor__textarea"
            name={`step-${index + 1}`}
            value={step.text}
            onChange={(event) => handleChange(step.id, event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, index, step.id)}
            rows={1}
            placeholder=""
          />
        </div>
      ))}
    </div>
  );
}

export default App;
