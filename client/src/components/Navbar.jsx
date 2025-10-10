import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/navbar.css';

const BrandMark = () => (
  <span className="brand-mark" aria-hidden="true">
    🏕️
  </span>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((prev) => !prev);
  const closeNav = () => setExpanded(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      closeNav();
    }
  };

  const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 px-3 px-lg-0">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center text-primary fw-semibold" to="/" onClick={closeNav}>
          <BrandMark />
          <span className="brand-text">CampVenture</span>
        </Link>
        <button
          className="navbar-toggler mobile-nav-toggle"
          type="button"
          aria-controls="primary-navbar"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={toggleExpanded}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse${expanded ? ' show' : ''}`} id="primary-navbar">
          <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-lg-3">
            <li className="nav-item">
              <NavLink to="/campgrounds" className={navLinkClass} onClick={closeNav}>
                All Campgrounds
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink to="/campgrounds/new" className={navLinkClass} onClick={closeNav}>
                  New Campground
                </NavLink>
              </li>
            )}
          </ul>
          <div className="navbar-actions ms-lg-3">
            {user ? (
              <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2">
                <span className="text-muted">
                  Hi, <strong>{user.username}</strong>
                </span>
                <button type="button" className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2">
                <Link className="btn btn-outline-primary" to="/register" onClick={closeNav}>
                  Sign up
                </Link>
                <Link className="btn btn-primary" to="/login" onClick={closeNav}>
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
