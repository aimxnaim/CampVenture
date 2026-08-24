import { useState } from 'react';

const ReviewForm = ({ onSubmit, submitting }) => {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ rating, body });
    setBody('');
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} className="card card-body border-0 shadow-sm">
      <h5 className="card-title">Share your experience</h5>
      <div className="mb-3">
        <label htmlFor="rating" className="form-label">
          Rating
        </label>
        <select
          id="rating"
          className="form-select"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          required
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value === 1 ? '' : 's'}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="review" className="form-label">
          Review
        </label>
        <textarea
          id="review"
          className="form-control"
          rows={4}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-success" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Post review'}
      </button>
    </form>
  );
};

export default ReviewForm;
