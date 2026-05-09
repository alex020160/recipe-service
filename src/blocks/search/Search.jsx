import { filterIcon, searchIcon } from "../../assets/icons";
import { uiText } from "../../constants/uiText";
import { getLocalizedText } from "../../utils/getLocalizedText";

function Search({
  language,
  searchQuery,
  isDarkTheme,
  onSearchSubmit,
  onSearchQueryChange,
  onOpenFilters,
  onToggleTheme,
}) {
  const t = (text) => getLocalizedText(text, language);

  return (
    <section className="search">
      <form className="search__form" onSubmit={onSearchSubmit}>
        <input
          className="search__input"
          id="recipe-search"
          name="search"
          type="search"
          aria-label={t(uiText.searchLabel)}
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />

        <button className="search__submit" type="submit" aria-label="Search">
          <img
            className="search__icon"
            src={searchIcon}
            alt=""
            aria-hidden="true"
          />
        </button>

        <button
          className="search__filter"
          type="button"
          aria-label="Open filters"
          onClick={onOpenFilters}
        >
          <img
            className="search__filter-icon"
            src={filterIcon}
            alt=""
            aria-hidden="true"
          />
        </button>

        <button
          className="search__theme-toggle"
          type="button"
          aria-label={
            isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
          }
          onClick={onToggleTheme}
        >
          {isDarkTheme ? "☀" : "☾"}
        </button>
      </form>
    </section>
  );
}

export default Search;
