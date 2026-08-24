import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/auth.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ username: '', email: '', password: '' });
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
      await register(formValues);
      navigate('/campgrounds', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
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
                <div className="auth-illustration-icon" aria-hidden="true">🌄</div>
                <h2 className="fw-semibold">Join the community</h2>
                <p className="mb-0">Create an account to share your adventures and discover new destinations.</p>
              </div>
              <div className="col-lg-7 bg-white">
                <div className="auth-form">
                  <h1 className="h3 fw-bold mb-3 text-center">Create your account</h1>
                  <p className="text-muted text-center mb-4">Start your next camping adventure with CampVenture.</p>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="register-username" className="form-label">
                        Username
                      </label>
                      <input
                        id="register-username"
                        name="username"
                        className="form-control form-control-lg"
                        placeholder="Choose a username"
                        value={formValues.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="register-email" className="form-label">
                        Email
                      </label>
                      <input
                        id="register-email"
                        type="email"
                        name="email"
                        className="form-control form-control-lg"
                        placeholder="you@example.com"
                        value={formValues.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="register-password" className="form-label">
                        Password
                      </label>
                      <input
                        id="register-password"
                        type="password"
                        name="password"
                        className="form-control form-control-lg"
                        placeholder="Create a strong password"
                        value={formValues.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100 btn-lg" disabled={submitting}>
                      {submitting ? 'Creating account…' : 'Sign up'}
                    </button>
                  </form>

                  <p className="text-center text-muted mt-4 mb-0">
                    Already have an account? <Link to="/login">Sign in</Link>
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

export default RegisterPage;
