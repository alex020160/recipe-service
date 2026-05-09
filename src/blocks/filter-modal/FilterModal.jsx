import { closeIcon, buttonApplyIcon } from "../../assets/icons";
import { recipeCategories } from "../../constants/recipeCategories";
import { uiText } from "../../constants/uiText";
import { getLocalizedCategory } from "../../constants/categoryTranslations";
import { getLocalizedText } from "../../utils/getLocalizedText";

function FilterModal({ activeFilters, language, onApplyFilters, onClose }) {
  const t = (text) => getLocalizedText(text, language);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const selectedCategories = formData.getAll("categories");

    const minHours = Number(formData.get("minHours") || 0);
    const minMinutes = Number(formData.get("minMinutes") || 0);

    const maxHoursValue = formData.get("maxHours");
    const maxMinutesValue = formData.get("maxMinutes");

    const hasMaxTime = maxHoursValue !== "" || maxMinutesValue !== "";

    const maxHours = Number(maxHoursValue || 0);
    const maxMinutes = Number(maxMinutesValue || 0);

    const minTimeMinutes = minHours * 60 + minMinutes;
    const maxTimeMinutes = hasMaxTime ? maxHours * 60 + maxMinutes : Infinity;

    onApplyFilters({
      categories: selectedCategories,
      minTimeMinutes,
      maxTimeMinutes,
    });

    onClose();
  };

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

      <h2 className="modal__title">{t(uiText.filterTitle)}</h2>

      <form className="filter-form" onSubmit={handleSubmit}>
        <fieldset className="filter-form__group">
          <legend className="filter-form__legend">
            {t(uiText.categories)}
          </legend>

          <div className="filter-form__categories">
            {recipeCategories.map((category) => (
              <label className="filter-form__checkbox" key={category}>
                <input
                  className="filter-form__checkbox-input"
                  type="checkbox"
                  name="categories"
                  value={category}
                  defaultChecked={activeFilters.categories.includes(category)}
                />
                <span className="filter-form__checkbox-text">
                  {getLocalizedCategory(category, language)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-form__group filter-form__group--time">
          <legend className="filter-form__legend">{t(uiText.time)}</legend>

          <div className="filter-form__time-row">
            <span className="filter-form__time-caption">
              {t(uiText.minimum)}
            </span>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="minHours"
                min="0"
                max="24"
                step="1"
                defaultValue={Math.floor(activeFilters.minTimeMinutes / 60)}
              />
              {language === "ru" ? "ч" : "h"}
            </label>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="minMinutes"
                min="0"
                max="59"
                step="1"
                defaultValue={activeFilters.minTimeMinutes % 60}
              />
              {language === "ru" ? "мин" : "min"}
            </label>
          </div>

          <div className="filter-form__time-row">
            <span className="filter-form__time-caption">
              {t(uiText.maximum)}
            </span>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="maxHours"
                min="0"
                max="24"
                step="1"
                defaultValue={
                  activeFilters.maxTimeMinutes === Infinity
                    ? ""
                    : Math.floor(activeFilters.maxTimeMinutes / 60)
                }
              />
              {language === "ru" ? "ч" : "h"}
            </label>

            <label className="filter-form__time-number">
              <input
                className="filter-form__time-input"
                type="number"
                name="maxMinutes"
                min="0"
                max="59"
                step="1"
                defaultValue={
                  activeFilters.maxTimeMinutes === Infinity
                    ? ""
                    : activeFilters.maxTimeMinutes % 60
                }
              />
              {language === "ru" ? "мин" : "min"}
            </label>
          </div>

          <button
            className="filter-form__submit"
            type="submit"
            aria-label={t(uiText.applyFilters)}
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

export default FilterModal;
