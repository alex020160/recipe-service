import Sidebar from "../blocks/sidebar/Sidebar";
import Search from "../blocks/search/Search";
import RecipesBoard from "../blocks/recipes-board/RecipesBoard";
import History from "../blocks/history/History";

function HomePage({
  language,
  searchQuery,
  isDarkTheme,
  activeSearchQuery,
  historyRecipes,
  isRecipesLoading,
  recipesLoadingError,
  visiblePopularRecipes,
  hasNextPopularRecipes,
  hasPrevPopularRecipes,
  onSearchSubmit,
  onSearchQueryChange,
  onOpenFilters,
  onToggleTheme,
  onCreateRecipeClick,
  onFavoritesClick,
  onMyRecipesClick,
  onNextPopularRecipes,
  onPrevPopularRecipes,
  onOpenRecipe,
}) {
  return (
    <>
      <Sidebar
        language={language}
        onCreateRecipeClick={onCreateRecipeClick}
        onFavoritesClick={onFavoritesClick}
        onMyRecipesClick={onMyRecipesClick}
      />

      <main className="main">
        <Search
          language={language}
          searchQuery={searchQuery}
          isDarkTheme={isDarkTheme}
          onSearchSubmit={onSearchSubmit}
          onSearchQueryChange={onSearchQueryChange}
          onOpenFilters={onOpenFilters}
          onToggleTheme={onToggleTheme}
        />

        <div className="main__content">
          <RecipesBoard
            language={language}
            activeSearchQuery={activeSearchQuery}
            isRecipesLoading={isRecipesLoading}
            recipesLoadingError={recipesLoadingError}
            visiblePopularRecipes={visiblePopularRecipes}
            hasNextPopularRecipes={hasNextPopularRecipes}
            hasPrevPopularRecipes={hasPrevPopularRecipes}
            onNextPopularRecipes={onNextPopularRecipes}
            onPrevPopularRecipes={onPrevPopularRecipes}
            onOpenRecipe={onOpenRecipe}
          />

          <History
            recipes={historyRecipes}
            language={language}
            onOpen={onOpenRecipe}
          />
        </div>
      </main>
    </>
  );
}

export default HomePage;
