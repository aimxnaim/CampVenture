import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampgroundForm from '../components/CampgroundForm.jsx';
import apiClient from '../utils/apiClient';

const NewCampgroundPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async ({ values, files }) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(`campground[${key}]`, value);
    });
    files.forEach((file) => formData.append('image', file));

    try {
      setSubmitting(true);
      setError(null);
      const { data } = await apiClient.post('/campgrounds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/campgrounds/${data.campground._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create campground');
    } finally {
      setSubmitting(false);
    }
  };

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
            heading="New Campground"
            submitLabel="Create Campground"
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default NewCampgroundPage;
