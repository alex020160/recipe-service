import PopularRecipes from "../popular-recipes/PopularRecipes";

function RecipesBoard({
  language,
  activeSearchQuery,
  isRecipesLoading,
  recipesLoadingError,
  visiblePopularRecipes,
  hasNextPopularRecipes,
  hasPrevPopularRecipes,
  onNextPopularRecipes,
  onPrevPopularRecipes,
  onOpenRecipe,
}) {
  return (
    <section className="recipes-board">
      <PopularRecipes
        language={language}
        activeSearchQuery={activeSearchQuery}
        isRecipesLoading={isRecipesLoading}
        recipesLoadingError={recipesLoadingError}
        visibleRecipes={visiblePopularRecipes}
        hasNextRecipes={hasNextPopularRecipes}
        hasPrevRecipes={hasPrevPopularRecipes}
        onNext={onNextPopularRecipes}
        onPrev={onPrevPopularRecipes}
        onOpenRecipe={onOpenRecipe}
      />
    </section>
  );
}

export default RecipesBoard;
