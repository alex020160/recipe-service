import { useRef, useState } from "react";
import {
  closeIcon,
  editIcon,
  plusIcon,
  createButtonIcon,
} from "../../assets/icons";
import defaultRecipeImage from "../../assets/images/defaultRecipeImage.svg";
import { recipeCategories } from "../../constants/recipeCategories";
import { uiText } from "../../constants/uiText";
import { getLocalizedCategory } from "../../constants/categoryTranslations";
import { getLocalizedText } from "../../utils/getLocalizedText";
import { validateRecipeForm } from "../../utils/validateRecipeForm";
import StepsEditor from "./StepsEditor";

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

function CreateRecipeModal({ language, onCreateRecipe, onClose }) {
  const t = (text) => getLocalizedText(text, language);

  const [avatarPreview, setAvatarPreview] = useState(defaultRecipeImage);
  const [avatarImage, setAvatarImage] = useState("");
  const [cookingPhotos, setCookingPhotos] = useState(Array(6).fill(null));
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  const avatarInputRef = useRef(null);
  const photosInputRef = useRef(null);

  const openAvatarFileDialog = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const temporaryImageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = async () => {
      const isValidAvatarSize =
        image.naturalWidth >= 427 && image.naturalHeight >= 80;

      URL.revokeObjectURL(temporaryImageUrl);

      if (!isValidAvatarSize) {
        event.target.value = "";
        alert("Avatar image must be at least 427px wide and 80px high.");
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);

        setAvatarPreview(dataUrl);
        setAvatarImage(dataUrl);
      } catch {
        event.target.value = "";
        alert("Could not read this image.");
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(temporaryImageUrl);
      event.target.value = "";
      alert("Could not load this image.");
    };

    image.src = temporaryImageUrl;
  };

  const openPhotoFileDialog = (index = null) => {
    const firstEmptyIndex = cookingPhotos.findIndex((photo) => photo === null);
    const targetIndex = index ?? (firstEmptyIndex === -1 ? 0 : firstEmptyIndex);

    setActivePhotoIndex(targetIndex);
    photosInputRef.current?.click();
  };

  const handleCookingPhotoChange = async (event) => {
    const file = event.target.files[0];

    if (!file || activePhotoIndex === null) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setCookingPhotos((currentPhotos) =>
        currentPhotos.map((photo, index) =>
          index === activePhotoIndex ? dataUrl : photo,
        ),
      );
    } catch {
      alert("Could not read this image.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const title = formData.get("recipeName")?.trim();
    const ingredients = formData.get("ingredients")?.trim();

    const steps = [...formData.entries()]
      .filter(([name]) => name.startsWith("step-"))
      .map(([, value]) => String(value).trim())
      .filter(Boolean)
      .join("\n");

    const categories = formData.getAll("categories");

    const hours = formData.get("hours");
    const minutes = formData.get("minutes");

    const photos = cookingPhotos.filter(Boolean);

    const validation = validateRecipeForm({
      title,
      ingredients,
      steps,
    });

    if (!validation.isValid) {
      alert(validation.errors.join("\n"));
      return;
    }

    onCreateRecipe({
      title,
      ingredients,
      steps,
      categories,
      image: avatarImage,
      photos,
      hours,
      minutes,
    });
  };

  return (
    <section className="modal modal--create" role="dialog" aria-modal="true">
      <button className="modal__close" type="button" onClick={onClose}>
        <img
          className="modal__close-icon"
          src={closeIcon}
          alt=""
          aria-hidden="true"
        />
      </button>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="create-form__header">
          <span className="create-form__name">{t(uiText.nameRecipe)}</span>

          <label className="create-form__name-field" htmlFor="recipe-name">
            <input
              className="create-form__name-input"
              id="recipe-name"
              type="text"
              name="recipeName"
              required
            />
          </label>
        </div>

        <div className="create-form__ingredients">
          <h2 className="create-form__title">
            {t(uiText.addIngredientsFirstLine)}
            <br />
            {t(uiText.addIngredientsSecondLine)}
          </h2>

          <div className="create-form__ingredients-paper">
            <textarea
              className="create-form__textarea create-form__textarea--ingredients"
              name="ingredients"
              aria-label="Recipe ingredients"
              required
            ></textarea>
          </div>
        </div>

        <div className="create-form__steps">
          <h2 className="create-form__title">
            {t(uiText.addStepsFirstLine)}
            <br />
            {t(uiText.addStepsSecondLine)}
          </h2>

          <div className="create-form__steps-editor-wrapper">
            <StepsEditor />
          </div>
        </div>

        <div className="create-form__avatar">
          <input
            ref={avatarInputRef}
            className="create-form__file"
            id="recipe-avatar"
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
          />

          <button
            className="create-form__avatar-preview"
            type="button"
            aria-label="Change recipe avatar"
            onClick={openAvatarFileDialog}
          >
            <img
              className="create-form__avatar-image"
              src={avatarPreview}
              alt="Recipe avatar preview"
            />
          </button>

          <button
            className="create-form__avatar-label"
            type="button"
            onClick={openAvatarFileDialog}
          >
            <span>{t(uiText.changeRecipeAvatar)}</span>
            <img
              className="create-form__edit-icon"
              src={editIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>

        <fieldset className="create-form__categories">
          <legend className="create-form__categories-title">
            {t(uiText.addCategories)}
          </legend>

          {recipeCategories.map((category) => (
            <label className="create-form__category" key={category}>
              <input type="checkbox" name="categories" value={category} />
              <span>{getLocalizedCategory(category, language)}</span>
            </label>
          ))}
        </fieldset>

        <div className="create-form__photos">
          <p className="create-form__photos-title">
            {t(uiText.addCookingPhotoFirstLine)}
            <br />
            {t(uiText.addCookingPhotoSecondLine)}
          </p>

          <input
            ref={photosInputRef}
            className="create-form__file"
            type="file"
            name="photos"
            accept="image/*"
            onChange={handleCookingPhotoChange}
          />

          <button
            className="create-form__add-photo"
            type="button"
            aria-label="Add cooking photo"
            onClick={() => openPhotoFileDialog()}
          >
            <img
              className="create-form__add-photo-icon"
              src={plusIcon}
              alt=""
              aria-hidden="true"
            />
          </button>

          <div className="create-form__photo-grid">
            {cookingPhotos.map((photo, index) => (
              <button
                className="create-form__photo-cell"
                type="button"
                key={index}
                aria-label={`Add or change cooking photo ${index + 1}`}
                onClick={() => openPhotoFileDialog(index)}
              >
                {photo && (
                  <img
                    className="create-form__photo-image"
                    src={photo}
                    alt={`Cooking photo ${index + 1}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="create-form__time">
          <legend className="create-form__time-title">
            {t(uiText.addTimeFirstLine)}
            <br />
            {t(uiText.addTimeSecondLine)}
          </legend>

          <label className="create-form__time-label">
            <input
              className="create-form__time-input"
              type="number"
              name="hours"
              min="0"
              required
            />
            {t(uiText.timeHours)}
          </label>

          <label className="create-form__time-label">
            <input
              className="create-form__time-input"
              type="number"
              name="minutes"
              min="0"
              max="59"
              required
            />
            {t(uiText.timeMinutes)}
          </label>
        </fieldset>

        <button
          className="create-form__submit"
          type="submit"
          aria-label="Create recipe"
        >
          <img
            className="create-form__submit-image"
            src={createButtonIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </form>
    </section>
  );
}

export default CreateRecipeModal;
