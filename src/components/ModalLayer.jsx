import { uiText } from "../constants/uiText";
import { getLocalizedText } from "../utils/getLocalizedText";

import FilterModal from "../blocks/filter-modal/FilterModal";
import RecipeModal from "../blocks/recipe-modal/RecipeModal";
import CreateRecipeModal from "../blocks/create-recipe-modal/CreateRecipeModal";
import CollectionModal from "../blocks/collection-modal/CollectionModal";

function ModalLayer({
  activeModal,
  language,
  activeFilters,
  selectedRecipe,
  isRecipeDetailsLoading,
  recipeDetailsError,
  recipes,
  favoriteRecipeIds,
  myRecipeIds,
  onClose,
  onApplyFilters,
  onOpenPhoto,
  onToggleFavorite,
  onCreateRecipe,
  onOpenRecipe,
  onDeleteRecipe,
}) {
  if (!activeModal) return null;

  const t = (text) => getLocalizedText(text, language);

  const favoriteRecipes = recipes.filter((recipe) =>
    favoriteRecipeIds.includes(recipe.id),
  );

  const myRecipes = recipes.filter((recipe) => myRecipeIds.includes(recipe.id));

  return (
    <div className="modal-layer">
      <div className="modal-layer__backdrop" onClick={onClose}></div>

      {activeModal === "filter" && (
        <FilterModal
          activeFilters={activeFilters}
          language={language}
          onApplyFilters={onApplyFilters}
          onClose={onClose}
        />
      )}

      {activeModal === "recipe" && (
        <RecipeModal
          recipe={selectedRecipe}
          language={language}
          isLoading={isRecipeDetailsLoading}
          error={recipeDetailsError}
          onClose={onClose}
          onOpenPhoto={onOpenPhoto}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {activeModal === "create" && (
        <CreateRecipeModal
          language={language}
          onCreateRecipe={onCreateRecipe}
          onClose={onClose}
        />
      )}

      {activeModal === "favorites" && (
        <CollectionModal
          title={t(uiText.favorites)}
          subtitle={t(uiText.favoritesSubtitle)}
          actionLabel={t(uiText.removeFromFavoritesList)}
          recipes={favoriteRecipes}
          language={language}
          onClose={onClose}
          onOpen={onOpenRecipe}
          onAction={onToggleFavorite}
        />
      )}

      {activeModal === "myRecipes" && (
        <CollectionModal
          title={t(uiText.yourRecipes)}
          subtitle={t(uiText.yourRecipesSubtitle)}
          actionLabel={t(uiText.delete)}
          recipes={myRecipes}
          language={language}
          onClose={onClose}
          onOpen={onOpenRecipe}
          onAction={onDeleteRecipe}
        />
      )}
    </div>
  );
}

export default ModalLayer;
