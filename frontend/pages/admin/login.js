import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

const API = "https://kasturi-masale-production.up.railway.app";

// --- Components ---

const FloatingInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  maxLength
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const active = isFocused || (value && value.length > 0);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`input-container ${active ? "active" : ""} ${error ? "error" : ""}`}>
      <div className="input-wrapper">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className="input-field"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder=" " // Required for CSS-only fallback if needed, though we use state
        />
        <label htmlFor={id} className="floating-label">
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-password"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <div id={`${id}-error`} className="field-error" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .input-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .input-wrapper {
          position: relative;
          background: #F3F4F6; /* Light grey background */
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .input-container.active .input-wrapper {
          background: #FFFFFF;
          border-color: #E5E7EB;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }

        .input-container:focus-within .input-wrapper {
          background: #FFFFFF;
          border-color: #111827; /* Dark focus ring for high contrast */
          box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
        }

        .input-container.error .input-wrapper {
          background: #FEF2F2;
          border-color: #FECACA;
        }
        .input-container.error:focus-within .input-wrapper {
          border-color: #DC2626;
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }

        .input-field {
          width: 100%;
          padding: 24px 16px 8px; /* Top padding for label space */
          border: none;
          background: transparent;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 16px;
          font-weight: 500;
          color: #111827;
          border-radius: 12px;
          outline: none;
        }
        
        /* Floating Label Logic */
        .floating-label {
          position: absolute;
          left: 16px;
          top: 18px; /* Center naturally */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 16px;
          color: #6B7280;
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: left top;
        }

        .input-container.active .floating-label {
          transform: translateY(-10px) scale(0.85); /* Move up and scale down */
          color: #4B5563;
          font-weight: 600;
        }
        
        .input-container:focus-within .floating-label {
          color: #111827;
        }
        .input-container.error .floating-label {
          color: #DC2626;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .toggle-password:hover {
          background: rgba(0,0,0,0.05);
          color: #374151;
        }

        .field-error {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #DC2626;
          font-size: 13px;
          font-weight: 500;
          margin-left: 4px;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};


export default function AdminLogin() {
  const router = useRouter();

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [show2FA, setShow2FA] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time Validation
  useEffect(() => {
    const newErrors = {};
    if (show2FA) {
      if (token && token.length < 6) newErrors.token = "Code must be 6 digits";
    } else {
      // Only validate length if user has started typing to avoid aggressive errors
      if (password && password.length > 0 && password.length < 4) newErrors.password = "Password is too short";
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, [username, password, token, show2FA]);

  const validate = () => {
    const newErrors = {};
    if (!show2FA) {
      if (!username.trim()) newErrors.username = "Username is required";
      if (!password) newErrors.password = "Password is required";
    } else {
      if (!token || token.length < 6) newErrors.token = "Please enter a valid 6-digit code";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = { username, password };
      if (show2FA) payload.token = token;

      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("admin_auth", "true");
        localStorage.setItem("admin_auth_time", Date.now());
        if (data.token) localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.data));
        router.replace("/admin");
      } else {
        if (data.require2FA) {
          setShow2FA(true);
          setGlobalError("");
        } else {
          setGlobalError(data.message || "Invalid credentials");
        }
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      setGlobalError("Unable to connect. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Head>
        <title>Sign In | Admin Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="login-wrapper">
        {/* 1. Ambient Glow */}
        <div className="ambient-glow" style={{ zIndex: 0 }} />
        {/* 2. Contrast Patch */}
        <div className="glass-contrast" style={{ zIndex: 1 }} />

        <main className="login-card">
          {/* Header */}
          <div className="header">
            <img
              src="/images/logo-circle/kasturi-logo-red-circle.png"
              alt="Kasturi Masale"
              className="logo"
            />
            <h1 className="title">
              {show2FA ? "Security Check" : "Admin Portal"}
            </h1>
            <p className="subtitle">
              {show2FA
                ? "Enter the 2FA code from your authenticator app"
                : "Sign in to manage your dashboard"
              }
            </p>
          </div>

          {/* Global Error */}
          {globalError && (
            <div className="global-error" role="alert">
              <AlertCircle size={18} />
              <span>{globalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="form-stack" noValidate>
            {!show2FA ? (
              <>
                <FloatingInput
                  id="username"
                  label="Username"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: null }));
                  }}
                  error={errors.username}
                  disabled={loading}
                  autoFocus
                />
                <FloatingInput
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                  }}
                  error={errors.password}
                  disabled={loading}
                />
              </>
            ) : (
              <FloatingInput
                id="token"
                label="Authenticator Code"
                value={token}
                onChange={e => {
                  if (/^\d*$/.test(e.target.value)) {
                    setToken(e.target.value);
                    if (errors.token) setErrors(prev => ({ ...prev, token: null }));
                  }
                }}
                maxLength={6}
                error={errors.token}
                disabled={loading}
                autoFocus
                type="tel"
              />
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading && <Loader2 size={18} className="spin" />}
              <span>
                {loading ? "Signing in..." : (show2FA ? "Verify Code" : "Sign In")}
              </span>
            </button>
          </form>

          <div className="footer">
            <p>Protected by secure 256-bit encryption</p>
          </div>
        </main>
      </div>

      <style jsx>{`
        /* SYSTEM FONTS & RESET */
        .page-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F9FAFB;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .login-wrapper {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .login-card {
          width: 100%;
          /* Glassmorphism applied via class */
          background: var(--glass-bg) !important;
          backdrop-filter: var(--glass-backdrop) !important;
          -webkit-backdrop-filter: var(--glass-backdrop) !important;
          border: var(--glass-border) !important;
          box-shadow: var(--glass-shadow) !important;
          
          padding: 48px 40px;
          border-radius: 20px;
          
          position: relative;
          z-index: 10; /* Top layer */
        }
        
        :global(.glass-contrast) {
            border-radius: 20px;
        }

        /* HEADER */
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 40px;
        }

        .logo {
          height: 80px; /* Balanced size */
          width: auto;
          object-fit: contain;
          margin-bottom: 24px;
        }

        .title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px;
          letter-spacing: -0.025em;
        }

        .subtitle {
          font-size: 15px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }

        /* GLOBAL ERROR */
        .global-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #991B1B;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        /* FORM */
        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .submit-btn {
          margin-top: 12px;
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: #111827; /* Dark elegant black */
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #000000;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .submit-btn:focus-visible {
           outline: 2px solid #111827;
           outline-offset: 2px;
        }

        .submit-btn:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
          transform: none;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* FOOTER */
        .footer {
          margin-top: 32px;
          text-align: center;
          border-top: 1px solid rgba(0,0,0,0.05);
          padding-top: 24px;
        }
        .footer p {
          font-size: 12px;
          color: #9CA3AF;
          margin: 0;
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 640px) {
           .page-container {
             align-items: flex-start;
             padding-top: 60px;
           }
           .login-card {
             padding: 32px 24px;
             /* Keep glass style even on mobile? Yes per strict instructions */
           }
           .logo { height: 72px; }
           .title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
