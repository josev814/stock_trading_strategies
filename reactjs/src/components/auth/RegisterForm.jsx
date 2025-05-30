
import PropTypes from "prop-types";
import { useNavigate } from 'react-router';

export default function RegisterForm({ formData, handleChange, handleSubmit, errorMessage }) {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <form name="registrationForm" className="form shadow" onSubmit={handleSubmit}>
      <div className="card px-5 py-2 rounded border-2 border-light">
        <div className="card-body">
          <h3 className="card-title text-center">Account Registration</h3>
          <div className="card-text text-center">
            <p>Already registered? <span role='link' className="link-primary" onClick={handleLoginRedirect}>Log In</span></p>
          </div>
          <div className="form-group mt-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control mt-1"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mt-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-control mt-1"
              placeholder="Enter password"
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="d-grid mt-3">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
          {errorMessage && (
            <div id="registration_errors" className="alert alert-danger mt-3" role="alert">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

RegisterForm.propTypes = {
  formData: PropTypes.object,
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  errorMessage: PropTypes.string,
}