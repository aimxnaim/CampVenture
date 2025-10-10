import { useEffect, useState } from 'react';

const defaultValues = {
  title: '',
  price: '',
  location: '',
  description: ''
};

const CampgroundForm = ({
  initialValues = defaultValues,
  onSubmit,
  submitting,
  submitLabel,
  heading,
  existingImages = [],
  deleteSelection = [],
  onToggleImage
}) => {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (event) => {
    setFiles(Array.from(event.target.files ?? []));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ values, files });
  };

  return (
    <form className="card border-0 shadow-sm" onSubmit={handleSubmit}>
      <div className="card-body p-4">
        {heading && <h2 className="h4 fw-semibold mb-4 text-center">{heading}</h2>}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="form-control"
            placeholder="Campground title"
            value={values.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Price (per night)
          </label>
          <div className="input-group">
            <span className="input-group-text">RM</span>
            <input
              id="price"
              type="number"
              min="0"
              name="price"
              className="form-control"
              value={values.price}
              onChange={handleChange}
              required
            />
            <span className="input-group-text">.00</span>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            className="form-control"
            placeholder="City, State"
            value={values.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="form-control"
            placeholder="Describe the campground"
            value={values.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="images" className="form-label">
            Upload photos
          </label>
          <input id="images" type="file" className="form-control" multiple onChange={handleFilesChange} />
          {files.length > 0 && <small className="text-muted">Selected {files.length} new image(s)</small>}
        </div>
        {existingImages.length > 0 && (
          <div className="mb-3">
            <p className="fw-semibold">Existing images</p>
            <div className="row g-3">
              {existingImages.map((image) => (
                <div className="col-6 col-md-4" key={image.filename}>
                  <div className="card h-100 border-0 shadow-sm">
                    <img src={image.url} className="card-img-top" alt={image.originalname ?? image.filename} style={{ height: 120, objectFit: 'cover' }} />
                    <div className="card-body py-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`remove-${image.filename}`}
                          checked={deleteSelection.includes(image.filename)}
                          onChange={() => onToggleImage?.(image.filename)}
                        />
                        <label className="form-check-label" htmlFor={`remove-${image.filename}`}>
                          Remove
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="card-footer bg-white d-flex justify-content-end gap-3">
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CampgroundForm;
