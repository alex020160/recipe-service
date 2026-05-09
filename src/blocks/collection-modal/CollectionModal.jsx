import { useEffect, useState } from "react";
import { bagIcon, closeIcon, arrowRightIcon } from "../../assets/icons";
import { uiText } from "../../constants/uiText";
import { getLocalizedText } from "../../utils/getLocalizedText";
import RecipeCard from "../recipe-card/RecipeCard";

const COLLECTION_PAGE_SIZE = 4;

function CollectionModal({
  title,
  subtitle,
  actionLabel,
  recipes,
  language,
  onClose,
  onOpen,
  onAction,
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

  const t = (text) => getLocalizedText(text, language);

  useEffect(() => {
    if (collectionPage > 0 && collectionStartIndex >= recipes.length) {
      setCollectionPage((currentPage) => Math.max(currentPage - 1, 0));
    }
  }, [collectionPage, collectionStartIndex, recipes.length]);

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
                <RecipeCard
                  recipe={recipe}
                  language={language}
                  onOpen={() => onOpen(recipe)}
                />

                <button
                  className="collection__action"
                  type="button"
                  onClick={() => onAction?.(recipe.id)}
                >
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
            <p className="collection__empty">{t(uiText.noRecipes)}</p>
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

export default CollectionModal;
