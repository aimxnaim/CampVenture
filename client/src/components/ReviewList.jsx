import clsx from 'clsx';

const renderStars = (rating) => {
  return Array.from({ length: 5 }).map((_, index) => (
    <i
      key={index}
      className={clsx('bi', index < rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary')}
      aria-hidden="true"
    />
  ));
};

const ReviewList = ({ reviews, onDelete, currentUserId }) => {
  if (!reviews?.length) {
    return <p className="text-muted">No reviews yet. Be the first to share your experience!</p>;
  }

  return (
    <div className="list-group list-group-flush">
      {reviews.map((review) => (
        <div key={review._id} className="list-group-item py-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="d-flex align-items-center gap-2">
                <strong>{review.author?.username ?? 'Anonymous camper'}</strong>
                <div>{renderStars(review.rating)}</div>
              </div>
              <p className="mb-1 text-muted small">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
              <p className="mb-0">{review.body}</p>
            </div>
            {currentUserId && review.author?._id === currentUserId && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(review._id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
