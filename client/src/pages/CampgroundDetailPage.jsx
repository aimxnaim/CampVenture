import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import CampgroundDetailMap from '../components/CampgroundDetailMap.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import ReviewList from '../components/ReviewList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FALLBACK_CAMPGROUND_IMAGE } from '../utils/placeholders.js';

const CampgroundDetailPage = () => {
  const { campgroundId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campground, setCampground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const isAuthor = useMemo(
    () => user && campground?.author?._id && user?._id === campground.author._id,
    [user, campground]
  );

  const fetchCampground = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const { data } = await apiClient.get(`/campgrounds/${campgroundId}`);
      setCampground(data.campground);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load campground details');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, [campgroundId]);

  useEffect(() => {
    fetchCampground();
  }, [fetchCampground]);

  const handleCampgroundDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campground?')) {
      return;
    }
    try {
      await apiClient.delete(`/campgrounds/${campgroundId}`);
      navigate('/campgrounds', { replace: true });
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to delete campground');
    }
  };

  const handleReviewSubmit = async ({ rating, body }) => {
    if (!user) {
      setActionMessage('You need to sign in to leave a review.');
      return;
    }
    try {
      setReviewSubmitting(true);
      await apiClient.post(`/campgrounds/${campgroundId}/reviews`, {
        review: { rating, body }
      });
      setActionMessage('Review submitted successfully!');
      await fetchCampground(false);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) {
      return;
    }
    try {
      await apiClient.delete(`/campgrounds/${campgroundId}/reviews/${reviewId}`);
      await fetchCampground(false);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to delete review.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/campgrounds" className="btn btn-primary">
          Back to campgrounds
        </Link>
      </div>
    );
  }

  if (!campground) {
    return null;
  }

  const coverImage = campground.image?.length ? campground.image[0].url : FALLBACK_CAMPGROUND_IMAGE;

  return (
    <div className="container py-4">
      {actionMessage && (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
          {actionMessage}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setActionMessage(null)} />
        </div>
      )}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <img src={coverImage} className="card-img-top" alt={campground.title} />
            <div className="card-body">
              <h2 className="h4 fw-bold">{campground.title}</h2>
              <p className="text-muted mb-2">{campground.location}</p>
              <p>{campground.description}</p>
            </div>
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">RM {campground.price} / night</span>
              <small className="text-muted">Last updated {new Date(campground.updatedAt).toLocaleString()}</small>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <CampgroundDetailMap campground={campground} />
          {isAuthor && (
            <div className="d-flex gap-3 mt-4">
              <Link to={`/campgrounds/${campground._id}/edit`} className="btn btn-outline-primary flex-grow-1">
                Edit Campground
              </Link>
              <button type="button" className="btn btn-outline-danger flex-grow-1" onClick={handleCampgroundDelete}>
                Delete Campground
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="mt-5">
        <div className="row g-4">
          <div className="col-lg-6">
            <h3 className="h5 mb-3">Reviews</h3>
            <ReviewList
              reviews={campground.reviews}
              currentUserId={user?._id}
              onDelete={handleReviewDelete}
            />
          </div>
          <div className="col-lg-6">
            {user ? (
              <ReviewForm onSubmit={handleReviewSubmit} submitting={reviewSubmitting} />
            ) : (
              <div className="card card-body border-0 shadow-sm">
                <h5 className="card-title">Sign in to review</h5>
                <p className="mb-0 text-muted">
                  <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to share your experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampgroundDetailPage;
