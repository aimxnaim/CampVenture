import { Link } from 'react-router-dom';
import { FALLBACK_CAMPGROUND_IMAGE } from '../utils/placeholders.js';

const CampgroundCard = ({ campground }) => {
  const coverImage = campground?.image?.length ? campground.image[0].url : FALLBACK_CAMPGROUND_IMAGE;

  return (
    <div className="card h-100 shadow-sm border-0">
      <img
        src={coverImage}
        className="card-img-top"
        alt={`Image of ${campground.title}`}
        style={{ height: 220, objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{campground.title}</h5>
        <p className="card-text text-muted">{campground.location}</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-semibold">RM {campground.price}/night</span>
          <Link to={`/campgrounds/${campground._id}`} className="btn btn-outline-primary btn-sm">
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampgroundCard;
