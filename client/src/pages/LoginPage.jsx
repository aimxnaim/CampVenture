import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/auth.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await login(formValues);
      const redirectTo = location.state?.from?.pathname ?? '/campgrounds';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            <div className="row g-0 auth-card">
              <div className="col-lg-5 d-flex flex-column align-items-center justify-content-center text-center auth-illustration p-4">
                <div className="auth-illustration-icon" aria-hidden="true">🧭</div>
                <h2 className="fw-semibold">Welcome back</h2>
                <p className="mb-0">Sign in to continue exploring and sharing breathtaking campgrounds.</p>
              </div>
              <div className="col-lg-7 bg-white">
                <div className="auth-form">
                  <h1 className="h3 fw-bold mb-3 text-center">Login to CampVenture</h1>
                  <p className="text-muted text-center mb-4">We&apos;re excited to see you again.</p>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        className="form-control form-control-lg"
                        placeholder="Your username"
                        value={formValues.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        className="form-control form-control-lg"
                        placeholder="Your password"
                        value={formValues.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={submitting}>
                      {submitting ? 'Signing in…' : 'Login'}
                    </button>
                  </form>

                  <p className="text-center text-muted mt-4 mb-0">
                    Don&apos;t have an account? <Link to="/register">Sign up</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
