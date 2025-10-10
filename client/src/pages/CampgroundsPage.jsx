import { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import CampgroundCard from '../components/CampgroundCard.jsx';
import CampgroundMap from '../components/CampgroundMap.jsx';

const CampgroundsPage = () => {
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        const { data } = await apiClient.get('/campgrounds');
        setCampgrounds(data.campgrounds ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load campgrounds');
      } finally {
        setLoading(false);
      }
    };

    fetchCampgrounds();
  }, []);

  return (
    <div className="container py-4">
      <header className="text-center mb-4">
        <h1 className="fw-bold">Explore Campgrounds in Malaysia</h1>
        <p className="text-muted">Discover detailed information, plan your next adventure, and contribute your own camping experiences.</p>
      </header>

      <div className="mb-5">
        <CampgroundMap campgrounds={campgrounds} />
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" aria-hidden="true" />
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && campgrounds.length === 0 && (
        <p className="text-center text-muted">No campgrounds available yet. Be the first to add one!</p>
      )}

      {!loading && !error && campgrounds.length > 0 && (
        <div className="row g-4">
          {campgrounds.map((campground) => (
            <div className="col-md-6 col-lg-4" key={campground._id}>
              <CampgroundCard campground={campground} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampgroundsPage;
