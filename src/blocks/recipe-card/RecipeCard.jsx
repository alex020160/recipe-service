import { heartIcon, clockIcon } from "../../assets/icons";
import defaultRecipeImage from "../../assets/images/defaultRecipeImage.svg";
import { getLocalizedCategory } from "../../constants/categoryTranslations";
import { getLocalizedRecipeField } from "../../utils/translateRecipe";
import { getLocalizedRecipeTime } from "../../utils/formatTime";

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

export default RecipeCard;
