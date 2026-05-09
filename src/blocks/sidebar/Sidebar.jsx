import { uiText } from "../../constants/uiText";
import { getLocalizedText } from "../../utils/getLocalizedText";

function Sidebar({
  language,
  onCreateRecipeClick,
  onFavoritesClick,
  onMyRecipesClick,
}) {
  const t = (text) => getLocalizedText(text, language);

  return (
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
            onClick={onCreateRecipeClick}
          >
            {t(uiText.createRecipe)}
          </button>

          <button
            className="sidebar__button"
            type="button"
            onClick={onFavoritesClick}
          >
            {t(uiText.favorites)}
          </button>

          <button
            className="sidebar__button"
            type="button"
            onClick={onMyRecipesClick}
          >
            {t(uiText.yourRecipes)}
          </button>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
