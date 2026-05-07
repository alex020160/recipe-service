import { useState, useRef, useEffect } from "react";

import {
  bagIcon,
  closeIcon,
  editIcon,
  filterIcon,
  heartIcon,
  plusIcon,
  searchIcon,
  //tickIcon,
  clockIcon,
  arrowRightIcon,
  buttonApplyIcon,
  createButtonIcon,
} from "./assets/icons";

import defaultRecipeImage from "./assets/images/defaultRecipeImage.svg";

const recipeCategories = [
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Goat",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
];

const filterSortOptions = ["popular"];

/*const recipes = [
  {
    id: 1,
    title: "Test recipe",
    time: "1h30min",
    likes: 100,
    categories: ["main dish", "popular"],
    image: "",
  },
  {
    id: 2,
    title: "Test recipe",
    time: "1h",
    likes: 10,
    categories: ["main dish", "popular"],
    image: "",
  },
  {
    id: 3,
    title: "Test recipe",
    time: "1h",
    likes: 1000,
    categories: ["main dish", "popular"],
    image: "",
  },
  {
    id: 4,
    title: "Test recipe",
    time: "30min",
    likes: 1176,
    categories: ["main dish", "popular"],
    image: "",
  },
  {
    id: 5,
    title: "Test recipe",
    time: "30min",
    likes: 1176,
    categories: ["main dish", "popular"],
    image: "",
  },
];*/

const [recipes, setRecipes] = useState([]);
const [favoriteRecipeIds, setFavoriteRecipeIds] = useState([]);
const [myRecipeIds, setMyRecipeIds] = useState([]);

const DEFAULT_POPULAR_PAGE_SIZE = 3;
const TABLET_POPULAR_PAGE_SIZE = 4;
const COLLECTION_PAGE_SIZE = 4;

const getPopularPageSize = () => {
  if (typeof window === "undefined") return DEFAULT_POPULAR_PAGE_SIZE;

  return window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches
    ? TABLET_POPULAR_PAGE_SIZE
    : DEFAULT_POPULAR_PAGE_SIZE;
};

const getRecipeTimeMinutes = (time) => {
  const hoursMatch = time.match(/(\d+)\s*h/);
  const minutesMatch = time.match(/(\d+)\s*min/);

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  return hours * 60 + minutes;
};

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [popularPage, setPopularPage] = useState(0);
  const [popularPageSize, setPopularPageSize] = useState(getPopularPageSize);
  const [historyRecipes, setHistoryRecipes] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    isPopularSortEnabled: false,
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

  const filteredRecipes = recipes
    .filter((recipe) => {
      const hasSelectedCategories = activeFilters.categories.length > 0;

      const matchesCategory =
        !hasSelectedCategories ||
        recipe.categories.some((category) =>
          activeFilters.categories.includes(category),
        );

      const recipeTimeMinutes = getRecipeTimeMinutes(recipe.time);

      const matchesTime =
        recipeTimeMinutes >= activeFilters.minTimeMinutes &&
        recipeTimeMinutes <= activeFilters.maxTimeMinutes;

      return matchesCategory && matchesTime;
    })
    .sort((firstRecipe, secondRecipe) => {
      if (!activeFilters.isPopularSortEnabled) return 0;

      return secondRecipe.likes - firstRecipe.likes;
    });

  const popularRecipes = [...filteredRecipes].sort(
    (firstRecipe, secondRecipe) => secondRecipe.likes - firstRecipe.likes,
  );

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

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setActiveModal("recipe");

    setHistoryRecipes((currentHistory) => {
      const historyWithoutCurrentRecipe = currentHistory.filter(
        (historyRecipe) => historyRecipe.id !== recipe.id,
      );

      return [recipe, ...historyWithoutCurrentRecipe].slice(0, 7);
    });
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
              Create a recipe
            </button>

            <button
              className="sidebar__button"
              type="button"
              onClick={() => setActiveModal("favorites")}
            >
              Favorites
            </button>

            <button
              className="sidebar__button"
              type="button"
              onClick={() => setActiveModal("myRecipes")}
            >
              Your recipes
            </button>
          </nav>
        </div>
      </aside>

      <main className="main">
        <section className="search">
          <form
            className="search__form"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              className="search__input"
              id="recipe-search"
              name="search"
              type="search"
              aria-label="Search recipes"
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
              <h2 className="popular__title">POPULAR RECIPES</h2>

              <div className="popular__content">
                <div className="popular__list">
                  {visiblePopularRecipes.length > 0 ? (
                    visiblePopularRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onOpen={() => openRecipe(recipe)}
                      />
                    ))
                  ) : (
                    <p className="popular__empty">No recipes yet</p>
                  )}
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

          <HistoryPanel recipes={historyRecipes} onOpen={openRecipe} />
        </div>
      </main>

      {activeModal && (
        <div className="modal-layer">
          <div className="modal-layer__backdrop" onClick={closeModal}></div>

          {activeModal === "filter" && (
            <FilterModal
              activeFilters={activeFilters}
              onApplyFilters={setActiveFilters}
              onClose={closeModal}
            />
          )}

          {activeModal === "recipe" && (
            <RecipeModal
              recipe={selectedRecipe}
              onClose={closeModal}
              onOpenPhoto={openPhotoPreview}
            />
          )}

          {activeModal === "create" && (
            <CreateRecipeModal onClose={closeModal} />
          )}

          {activeModal === "favorites" && (
            <RecipeCollectionModal
              title="FAVORITES"
              subtitle="all recipes that you like!"
              actionLabel="UNLIKE"
              recipes={recipes}
              onClose={closeModal}
              onOpen={openRecipe}
            />
          )}

          {activeModal === "myRecipes" && (
            <RecipeCollectionModal
              title="YOUR RECIPES"
              subtitle="all recipes that you had created"
              actionLabel="DELETE"
              recipes={recipes}
              onClose={closeModal}
              onOpen={openRecipe}
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

function RecipeCard({ recipe, onOpen }) {
  return (
    <article className="recipe-card">
      <button className="recipe-card__button" type="button" onClick={onOpen}>
        <img
          className="recipe-card__image"
          src={recipe.image || defaultRecipeImage}
          alt={recipe.title}
        />

        <div className="recipe-card__body">
          <div className="recipe-card__info">
            <h3 className="recipe-card__title">{recipe.title}</h3>
            <p className="recipe-card__time">
              <img
                className="recipe-card__icon"
                src={clockIcon}
                alt=""
                aria-hidden="true"
              />
              {recipe.time}
            </p>
          </div>

          <ul className="recipe-card__categories">
            {recipe.categories.map((category, index) => (
              <li className="recipe-card__category" key={index}>
                {category}
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

function HistoryPanel({ recipes, onOpen }) {
  return (
    <aside className="history">
      <h2 className="history__title">HISTORY</h2>

      <ul className="history__list">
        {recipes.map((recipe) => (
          <li className="history__item" key={recipe.id}>
            <button
              className="history__button"
              type="button"
              onClick={() => onOpen(recipe)}
            >
              {recipe.title}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FilterModal({ activeFilters, onApplyFilters, onClose }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const selectedCategories = formData.getAll("categories");
    const isPopularSortEnabled = formData.get("sort") === "popular";

    const minHours = Number(formData.get("minHours") || 0);
    const minMinutes = Number(formData.get("minMinutes") || 0);
    const maxHours = Number(formData.get("maxHours") || 0);
    const maxMinutes = Number(formData.get("maxMinutes") || 0);

    const minTimeMinutes = minHours * 60 + minMinutes;
    const maxTimeMinutes = maxHours * 60 + maxMinutes;

    onApplyFilters({
      categories: selectedCategories,
      isPopularSortEnabled,
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

      <h2 className="modal__title">What recipe do you want?</h2>

      <form className="filter-form" onSubmit={handleSubmit}>
        <fieldset className="filter-form__group">
          <legend className="filter-form__legend">Categories:</legend>

          <div className="filter-form__categories">
            {filterCategories.map((category) => (
              <label className="filter-form__checkbox" key={category}>
                <input
                  className="filter-form__checkbox-input"
                  type="checkbox"
                  name="categories"
                  value={category}
                  defaultChecked={activeFilters.categories.includes(category)}
                />
                <span className="filter-form__checkbox-text">{category}</span>
              </label>
            ))}
          </div>

          <legend className="filter-form__legend">Sort:</legend>

          <div className="filter-form__categories">
            {filterSortOptions.map((sortOption) => (
              <label className="filter-form__checkbox" key={sortOption}>
                <input
                  className="filter-form__checkbox-input"
                  type="checkbox"
                  name="sort"
                  value={sortOption}
                  defaultChecked={activeFilters.isPopularSortEnabled}
                />
                <span className="filter-form__checkbox-text">{sortOption}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-form__group filter-form__group--time">
          <legend className="filter-form__legend">Time:</legend>

          <div className="filter-form__time-row">
            <span className="filter-form__time-caption">Minimum:</span>

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
              h
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
              min
            </label>
          </div>

          <div className="filter-form__time-row">
            <span className="filter-form__time-caption">Maximum:</span>

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
                    ? 2
                    : Math.floor(activeFilters.maxTimeMinutes / 60)
                }
              />
              h
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
                    ? 30
                    : activeFilters.maxTimeMinutes % 60
                }
              />
              min
            </label>
          </div>

          <button
            className="filter-form__submit"
            type="submit"
            aria-label="Apply filters"
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

function RecipeModal({ recipe, onClose, onOpenPhoto }) {
  const [areCookingPhotosExpanded, setAreCookingPhotosExpanded] =
    useState(false);
  if (!recipe) return null;

  const cookingPhotos =
    recipe.photos?.filter(Boolean).slice(0, 6) ??
    Array.from({ length: 6 }, () => defaultRecipeImage);

  const visibleCookingPhotos = areCookingPhotosExpanded
    ? cookingPhotos
    : cookingPhotos.slice(0, 2);

  const hasHiddenCookingPhotos = cookingPhotos.length > 2;

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
          <button className="recipe-modal__favorite" type="button">
            ADD TO FAVORITES
          </button>

          <img
            className="recipe-modal__image"
            src="/src/assets/images/detail-recipe.jpg"
            alt={recipe.title}
          />
        </div>

        <div className="recipe-modal__header">
          <h2 className="recipe-modal__title">{recipe.title}</h2>

          <div className="recipe-modal__meta">
            <span className="recipe-modal__time">
              <img
                className="recipe-card__icon"
                src={clockIcon}
                alt=""
                aria-hidden="true"
              />
              {recipe.time}
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
            <h3 className="recipe-modal__subtitle">Ingredients:</h3>

            <ul className="recipe-modal__list">
              <li>bolognese sauce</li>
              <li>pasta</li>
              <li>vegetables</li>
              <li>tomatos</li>
            </ul>
          </div>
        </div>

        <div className="recipe-modal__categories">
          <h3 className="recipe-modal__subtitle">Categories:</h3>

          <ul className="recipe-modal__list">
            <li>Main dish</li>
            <li>Dinner</li>
            <li>Popular</li>
          </ul>
        </div>

        <div className="recipe-modal__steps">
          <div className="recipe-modal__steps-content">
            <h3 className="recipe-modal__subtitle">STEPS:</h3>

            <ol className="recipe-modal__steps-list">
              <li>Prepare all ingredients.</li>
              <li>Boil pasta until ready.</li>
              <li>Cook sauce and vegetables.</li>
              <li>Mix ingredients together.</li>
              <li>Serve the dish.</li>
            </ol>
          </div>
        </div>

        <div className="recipe-modal__photos">
          <h3 className="recipe-modal__subtitle">COOKING PHOTOS:</h3>

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
        </div>
      </div>
    </section>
  );
}

function CreateRecipeModal({ onClose }) {
  const [avatarPreview, setAvatarPreview] = useState(defaultRecipeImage);
  const [cookingPhotos, setCookingPhotos] = useState(Array(6).fill(null));
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  const avatarInputRef = useRef(null);
  const photosInputRef = useRef(null);

  const openAvatarFileDialog = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const temporaryImageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const isValidAvatarSize =
        image.naturalWidth >= 427 && image.naturalHeight >= 80;

      if (!isValidAvatarSize) {
        URL.revokeObjectURL(temporaryImageUrl);
        event.target.value = "";
        alert("Avatar image must be at least 427px wide and 80px high.");
        return;
      }

      setAvatarPreview(temporaryImageUrl);
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

  const handleCookingPhotoChange = (event) => {
    const file = event.target.files[0];

    if (!file || activePhotoIndex === null) return;

    const temporaryImageUrl = URL.createObjectURL(file);

    setCookingPhotos((currentPhotos) =>
      currentPhotos.map((photo, index) =>
        index === activePhotoIndex ? temporaryImageUrl : photo,
      ),
    );

    event.target.value = "";
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

      <form
        className="create-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="create-form__header">
          <span className="create-form__name">Name your recipe:</span>

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
            Add
            <br />
            ingredients
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
            Add some
            <br />
            steps
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
            <span>Change recipe avatar</span>
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
            Add categories:
          </legend>

          {recipeCategories.map((category) => (
            <label className="create-form__category" key={category}>
              <input type="checkbox" name="categories" value={category} />
              <span>{category}</span>
            </label>
          ))}
        </fieldset>

        <div className="create-form__photos">
          <p className="create-form__photos-title">
            You can add
            <br />
            steps/other photos
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
            How long does
            <br />
            cooking take?
          </legend>

          <label className="create-form__time-label">
            <input
              className="create-form__time-input"
              type="number"
              name="hours"
              min="0"
              required
            />
            hours
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
            min
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
  onClose,
  onOpen,
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
                <RecipeCard recipe={recipe} onOpen={() => onOpen(recipe)} />

                <button className="collection__action" type="button">
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
            <p className="collection__empty">No recipes yet</p>
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
