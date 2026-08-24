import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CampgroundForm from '../components/CampgroundForm.jsx';
import apiClient from '../utils/apiClient';

const EditCampgroundPage = () => {
  const { campgroundId } = useParams();
  const navigate = useNavigate();
  const [campground, setCampground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deleteSelection, setDeleteSelection] = useState([]);

  useEffect(() => {
    const fetchCampground = async () => {
      try {
        const { data } = await apiClient.get(`/campgrounds/${campgroundId}`);
        setCampground(data.campground);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load campground');
      } finally {
        setLoading(false);
      }
    };

    fetchCampground();
  }, [campgroundId]);

  const handleSubmit = async ({ values, files }) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(`campground[${key}]`, value);
    });
    files.forEach((file) => formData.append('image', file));
    deleteSelection.forEach((filename) => formData.append('deleteImages', filename));

    try {
      setSubmitting(true);
      setError(null);
      const { data } = await apiClient.put(`/campgrounds/${campgroundId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/campgrounds/${data.campground._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update campground');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDeleteSelection = (filename) => {
    setDeleteSelection((current) =>
      current.includes(filename) ? current.filter((item) => item !== filename) : [...current, filename]
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      </div>
    );
  }

  if (!campground) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error || 'Campground not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <CampgroundForm
            heading={`Edit ${campground.title}`}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            submitting={submitting}
            initialValues={{
              title: campground.title,
              price: campground.price,
              location: campground.location,
              description: campground.description
            }}
            existingImages={campground.image}
            deleteSelection={deleteSelection}
            onToggleImage={toggleDeleteSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCampgroundPage;
