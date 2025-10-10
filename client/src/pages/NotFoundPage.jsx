import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4 fw-bold mb-3">Page not found</h1>
      <p className="lead text-muted mb-4">The page you are looking for might have been removed or temporarily unavailable.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
