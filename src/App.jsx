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

const categories = [
  "breakfast",
  "lunch",
  "supper",
  "snack",
  "soup",
  "salads",
  "drinks",
  "dessert",
  "main dish",
  "popular",
  "seafood",
];

const recipes = [
  {
    id: 1,
    title: "Test recipe",
    time: "1h30min",
    likes: 100,
    categories: ["main dish", "popular"],
    image: "",
  },
];

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setActiveModal("recipe");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRecipe(null);
  };

  return (
    <div className="page">
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
            /*
            <label className="search__label" htmlFor="recipe-search">
              Search recipes
            </label>
            */
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
          </form>
        </section>

        <section className="recipes-board">
          <div className="popular">
            <h2 className="popular__title">POPULAR RECIPES</h2>

            <div className="popular__content">
              <div className="popular__list">
                {recipes.length > 0 ? (
                  recipes.map((recipe) => (
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

              <button
                className="popular__next"
                type="button"
                aria-label="Show next popular recipes"
              >
                <img
                  className="popular__next-icon"
                  src={arrowRightIcon}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <HistoryPanel recipes={recipes} onOpen={openRecipe} />
        </section>
      </main>

      {activeModal && (
        <div className="modal-layer">
          <div className="modal-layer__backdrop" onClick={closeModal}></div>

          {activeModal === "filter" && <FilterModal onClose={closeModal} />}

          {activeModal === "recipe" && (
            <RecipeModal recipe={selectedRecipe} onClose={closeModal} />
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
        {recipes.concat(recipes).map((recipe, index) => (
          <li className="history__item" key={`${recipe.id}-${index}`}>
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

function FilterModal({ onClose }) {
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

      <form
        className="filter-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className="filter-form__group">
          <legend className="filter-form__legend">Categories:</legend>

          <div className="filter-form__categories">
            {categories.map((category) => (
              <label className="filter-form__checkbox" key={category}>
                <input
                  className="filter-form__checkbox-input"
                  type="checkbox"
                  name="categories"
                  value={category}
                />
                <span className="filter-form__checkbox-text">{category}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-form__group filter-form__group--time">
          <legend className="filter-form__legend">Time:</legend>

          <label className="filter-form__time">
            Minimum:
            <input
              className="filter-form__time-input"
              type="text"
              name="minTime"
              defaultValue="10 min"
            />
          </label>

          <label className="filter-form__time">
            Maximum:
            <input
              className="filter-form__time-input"
              type="text"
              name="maxTime"
              defaultValue="2h30min"
            />
          </label>

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

function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

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
          <h3 className="recipe-modal__subtitle">Ingredients:</h3>

          <ul className="recipe-modal__list">
            <li>bolognese sauce</li>
            <li>pasta</li>
            <li>vegetables</li>
            <li>tomatos</li>
          </ul>
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
          <h3 className="recipe-modal__subtitle">STEPS:</h3>

          <ol className="recipe-modal__steps-list">
            <li>Prepare all ingredients.</li>
            <li>Boil pasta until ready.</li>
            <li>Cook sauce and vegetables.</li>
            <li>Mix ingredients together.</li>
            <li>Serve the dish.</li>
          </ol>
        </div>

        <div className="recipe-modal__photos">
          <h3 className="recipe-modal__subtitle">COOKING PHOTOS:</h3>

          <img
            className="recipe-modal__photo"
            src={defaultRecipeImage}
            alt="Cooking step 1"
          />

          <img
            className="recipe-modal__photo"
            src={defaultRecipeImage}
            alt="Cooking step 2"
          />
        </div>
      </div>
    </section>
  );
}

function CreateRecipeModal({ onClose }) {
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
          <label className="create-form__name">
            Name your recipe:
            <input
              className="create-form__name-input"
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

          <textarea
            className="create-form__textarea create-form__textarea--ingredients"
            name="ingredients"
            aria-label="Recipe ingredients"
            required
          ></textarea>
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
          <div className="create-form__avatar-preview">
            <img
              className="create-form__avatar-icon"
              src={defaultRecipeImage}
              alt=""
              aria-hidden="true"
            />
          </div>

          <label className="create-form__avatar-label">
            <span>Change recipe avatar</span>
            <img
              className="create-form__edit-icon"
              src={editIcon}
              alt=""
              aria-hidden="true"
            />
            <input
              className="create-form__file"
              type="file"
              name="avatar"
              accept="image/*"
            />
          </label>
        </div>

        <fieldset className="create-form__categories">
          <legend className="create-form__categories-title">
            Add categories:
          </legend>

          {categories.map((category) => (
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

          <label className="create-form__add-photo">
            <img
              className="create-form__add-photo-icon"
              src={plusIcon}
              alt=""
              aria-hidden="true"
            />
            <input
              className="create-form__file"
              type="file"
              name="photos"
              accept="image/*"
              multiple
            />
          </label>

          <div className="create-form__photo-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="create-form__photo-cell" key={index}></div>
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
          {recipes.concat(recipes.slice(0, 1)).map((recipe, index) => (
            <div className="collection__item" key={`${recipe.id}-${index}`}>
              <RecipeCard recipe={recipe} onOpen={() => onOpen(recipe)} />

              <button className="collection__action" type="button">
                <img
                  className="collection__action-icon"
                  src={bagIcon}
                  alt=""
                  aria-hidden="true"
                />
                {actionLabel}
              </button>
            </div>
          ))}
        </div>

        <button
          className="collection__next"
          type="button"
          aria-label="Show next recipes"
        >
          <img
            className="collection__next-icon"
            src={arrowRightIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}

function StepsEditor() {
  const [steps, setSteps] = useState([{ id: 1, text: "" }]);
  const textareaRefs = useRef({});

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
    <div className="steps-editor">
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
            onChange={(e) => handleChange(step.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index, step.id)}
            rows={1}
            placeholder=""
          />
        </div>
      ))}
    </div>
  );
}

export default App;
