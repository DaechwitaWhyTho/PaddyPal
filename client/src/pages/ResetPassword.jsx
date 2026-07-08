import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import "../styles/auth.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await resetPassword(form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>Password updated</h1>
          <p className="subtitle">You can log in with your new password now.</p>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/login")}>
            Go to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="leaf">🌱</span>
          <span>OnnoProhori</span>
        </div>
        <h1>Enter your code</h1>
        <p className="subtitle">Check your email for the 6-digit code.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="otp">Code</label>
            <input id="otp" name="otp" inputMode="numeric" maxLength={6} value={form.otp} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={6}
              value={form.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Updating…" : "Update password"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
