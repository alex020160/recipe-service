import { arrowRightIcon } from "../../assets/icons";
import { uiText } from "../../constants/uiText";
import { getLocalizedText } from "../../utils/getLocalizedText";
import RecipeCard from "../recipe-card/RecipeCard";

function PopularRecipes({
  language,
  activeSearchQuery,
  isRecipesLoading,
  recipesLoadingError,
  visibleRecipes,
  hasNextRecipes,
  hasPrevRecipes,
  onNext,
  onPrev,
  onOpenRecipe,
}) {
  const t = (text) => getLocalizedText(text, language);

  return (
    <div className="popular">
      <h2 className="popular__title">
        {activeSearchQuery ? t(uiText.searchResults) : t(uiText.popularRecipes)}
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
            visibleRecipes.length === 0 && (
              <p className="popular__empty">{t(uiText.noRecipes)}</p>
            )}

          {!isRecipesLoading &&
            !recipesLoadingError &&
            visibleRecipes.map((recipe, index) => (
              <RecipeCard
                key={`${recipe.id}-${index}`}
                recipe={recipe}
                language={language}
                onOpen={() => onOpenRecipe(recipe)}
              />
            ))}
        </div>

        <div className="popular__controls">
          {hasNextRecipes && (
            <button
              className="popular__nav-button popular__nav-button--next"
              type="button"
              aria-label="Show next popular recipes"
              onClick={onNext}
            >
              <img
                className="popular__nav-icon"
                src={arrowRightIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
          )}

          {hasPrevRecipes && (
            <button
              className="popular__nav-button popular__nav-button--prev"
              type="button"
              aria-label="Show previous popular recipes"
              onClick={onPrev}
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
  );
}

export default PopularRecipes;
