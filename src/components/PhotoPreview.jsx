import { closeIcon } from "../assets/icons";

function PhotoPreview({ photo, onClose }) {
  if (!photo) return null;

  return (
    <div className="photo-preview" onClick={onClose}>
      <button
        className="photo-preview__close"
        type="button"
        aria-label="Close photo preview"
        onClick={onClose}
      >
        <img
          className="photo-preview__close-icon"
          src={closeIcon}
          alt=""
          aria-hidden="true"
        />
      </button>

      <img
        className="photo-preview__image"
        src={photo}
        alt="Cooking photo preview"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export default PhotoPreview;
