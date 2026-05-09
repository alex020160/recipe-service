import { useState } from "react";
import {
  closeIcon,
  clockIcon,
  heartIcon,
  arrowRightIcon,
} from "../../assets/icons";
import defaultRecipeImage from "../../assets/images/defaultRecipeImage.svg";
import { uiText } from "../../constants/uiText";
import { getLocalizedCategory } from "../../constants/categoryTranslations";
import { getLocalizedText } from "../../utils/getLocalizedText";
import { getLocalizedRecipeField } from "../../utils/translateRecipe";
import { getLocalizedRecipeTime } from "../../utils/formatTime";
import { splitRecipeText } from "../../utils/normalizeRecipe";

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

export default RecipeModal;
