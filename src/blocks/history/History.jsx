import { uiText } from "../../constants/uiText";
import { getLocalizedText } from "../../utils/getLocalizedText";
import { getLocalizedRecipeField } from "../../utils/translateRecipe";

function History({ recipes, language, onOpen }) {
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

export default History;
