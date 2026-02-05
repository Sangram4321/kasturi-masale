import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Signup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    // Google Login Logic
    const googleLogin = async () => {
        setGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Save State
            localStorage.setItem('auth', 'true');
            localStorage.setItem('user', JSON.stringify({
                uid: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                photo: result.user.photoURL
            }));

            // Sync Backend
            try {
                await fetch(`/api/user/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: result.user.uid,
                        name: result.user.displayName,
                        email: result.user.email,
                        photo: result.user.photoURL,
                        phone: result.user.phoneNumber
                    })
                });
            } catch (syncErr) {
                console.error("User sync failed:", syncErr);
            }

            router.push('/');
        } catch (error) {
            console.error("Login Error:", error);
            setGoogleLoading(false);
        }
    };

    // Validation Logic
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';

        if (!formData.email) {
            newErrors.email = 'Please enter your email address';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Please enter a password';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        try {
            const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            // Save State
            localStorage.setItem('auth', 'true');
            localStorage.setItem('user', JSON.stringify({
                uid: result.user.uid,
                name: formData.name, // Use name from form since firebase doesn't set it initially
                email: result.user.email,
                photo: null
            }));

            // Sync Backend
            try {
                await fetch(`/api/user/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: result.user.uid,
                        name: formData.name,
                        email: result.user.email,
                        photo: null,
                    })
                });
            } catch (syncErr) {
                console.error("User sync failed:", syncErr);
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            console.error("Signup Error:", error);
            if (error.code === 'auth/email-already-in-use') {
                setErrors({ email: 'Email is already present' });
            } else {
                setErrors({ general: 'Failed to create account. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Head>
                <title>Sign Up | Soft Minimalism</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </Head>

            <div className="soft-background">
                <div className="floating-shapes">
                    <div className="soft-blob blob-1"></div>
                    <div className="soft-blob blob-2"></div>
                </div>
            </div>

            <div className="login-container">
                <div className="soft-card">
                    {/* Header */}
                    <div className={`comfort-header ${success ? 'fade-out' : ''}`}>
                        <h1 className="comfort-title">Create Account</h1>
                        <p className="gentle-subtitle">Join us for a fresh experience</p>
                    </div>

                    {/* Form */}
                    {!success ? (
                        <form className="comfort-form" onSubmit={handleSubmit} noValidate>

                            {/* Name Field */}
                            <div className={`soft-field ${errors.name ? 'error' : ''}`}>
                                <div className="field-container">
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: null });
                                        }}
                                        placeholder=" "
                                        required
                                    />
                                    <label htmlFor="name">Full Name</label>
                                    <div className="field-accent"></div>
                                </div>
                                {errors.name && <span className="gentle-error show">{errors.name}</span>}
                            </div>

                            {/* Email Field */}
                            <div className={`soft-field ${errors.email ? 'error' : ''}`}>
                                <div className="field-container">
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            if (errors.email) setErrors({ ...errors, email: null });
                                        }}
                                        placeholder=" "
                                        required
                                    />
                                    <label htmlFor="email">Email address</label>
                                    <div className="field-accent"></div>
                                </div>
                                {errors.email && <span className="gentle-error show">{errors.email}</span>}
                            </div>

                            {/* Password Field */}
                            <div className={`soft-field ${errors.password ? 'error' : ''}`}>
                                <div className="field-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value });
                                            if (errors.password) setErrors({ ...errors, password: null });
                                        }}
                                        placeholder=" "
                                        required
                                    />
                                    <label htmlFor="password">Password</label>
                                    <button
                                        type="button"
                                        className={`gentle-toggle ${showPassword ? 'toggle-active' : ''}`}
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        <div className="toggle-icon">
                                            {showPassword ? (
                                                <svg className="eye-open" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M3 3l14 14M8.5 8.5a3 3 0 004 4m2.5-2.5C15 10 12.5 7 10 7c-.5 0-1 .1-1.5.3M10 13c-2.5 0-4.5-2-5-3 .3-.6.7-1.2 1.2-1.7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg className="eye-closed" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M10 3c-4.5 0-8.3 3.8-9 7 .7 3.2 4.5 7 9 7s8.3-3.8 9-7c-.7-3.2-4.5-7-9-7z" />
                                                    <circle cx="10" cy="10" r="3" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                    <div className="field-accent"></div>
                                </div>
                                {errors.password && <span className="gentle-error show">{errors.password}</span>}
                            </div>

                            {/* Confirm Password Field */}
                            <div className={`soft-field ${errors.confirmPassword ? 'error' : ''}`}>
                                <div className="field-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData({ ...formData, confirmPassword: e.target.value });
                                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                                        }}
                                        placeholder=" "
                                        required
                                    />
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className="field-accent"></div>
                                </div>
                                {errors.confirmPassword && <span className="gentle-error show">{errors.confirmPassword}</span>}
                            </div>

                            {errors.general && <div className="gentle-error show" style={{ marginBottom: '20px', textAlign: 'center' }}>{errors.general}</div>}

                            <button type="submit" className={`comfort-button ${loading ? 'loading' : ''}`} disabled={loading}>
                                <div className="button-background"></div>
                                <span className="button-text">Sign Up</span>
                                <div className="button-loader">
                                    <div className="gentle-spinner">
                                        <div className="spinner-circle"></div>
                                    </div>
                                </div>
                            </button>

                            <div className="gentle-divider">
                                <div className="divider-line"></div>
                                <span className="divider-text">or continue with</span>
                                <div className="divider-line"></div>
                            </div>

                            <div className="comfort-social">
                                <button
                                    type="button"
                                    className="social-soft"
                                    onClick={!googleLoading ? googleLogin : undefined}
                                >
                                    <div className="social-background"></div>
                                    {googleLoading ? (
                                        <div className="gentle-spinner" style={{ width: 18, height: 18 }}>
                                            <div className="spinner-circle"></div>
                                        </div>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <path d="M9 7.4v3.2h4.6c-.2 1-.8 1.8-1.6 2.4v2h2.6c1.5-1.4 2.4-3.4 2.4-5.8 0-.6 0-1.1-.1-1.6H9z" fill="#4285F4" />
                                            <path d="M9 17c2.2 0 4-0.7 5.4-1.9l-2.6-2c-.7.5-1.6.8-2.8.8-2.1 0-3.9-1.4-4.6-3.4H1.7v2.1C3.1 15.2 5.8 17 9 17z" fill="#34A853" />
                                            <path d="M4.4 10.5c-.2-.5-.2-1.1 0-1.6V6.8H1.7c-.6 1.2-.6 2.6 0 3.8l2.7-2.1z" fill="#FBBC04" />
                                            <path d="M9 4.2c1.2 0 2.3.4 3.1 1.2l2.3-2.3C12.9 1.8 11.1 1 9 1 5.8 1 3.1 2.8 1.7 5.4l2.7 2.1C5.1 5.6 6.9 4.2 9 4.2z" fill="#EA4335" />
                                        </svg>
                                    )}
                                    <span>Google</span>
                                </button>
                            </div>

                            <div className="comfort-signup">
                                <span className="signup-text">Already have an account?</span>
                                <Link href="/login" className="comfort-link signup-link">
                                    Log in
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className={`gentle-success ${success ? 'show' : ''}`}>
                            <div className="success-bloom">
                                <div className="bloom-rings">
                                    <div className="bloom-ring ring-1"></div>
                                    <div className="bloom-ring ring-2"></div>
                                </div>
                                <div className="logo-circle">
                                    <div className="comfort-icon">
                                        <img
                                            src="/images/logo-circle/kasturi-logo-red-circle.png"
                                            alt="Kasturi Masale"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                        />
                                    </div>
                                    <div className="gentle-glow"></div>
                                </div>
                            </div>
                            <h3 className="success-title">Account Created!</h3>
                            <p className="success-desc">Redirecting you to home...</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
        body {
          margin: 0;
          background: linear-gradient(135deg, #faf9f6 0%, #f5f3f0 50%, #f0ede8 100%);
        }
      `}</style>

            {/* Reusing the exact same styles as Login (copied and adapted) */}
            <style jsx>{`
        .page-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          line-height: 1.5;
          position: relative;
          overflow: hidden;
        }

        .soft-background {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 0; pointer-events: none;
        }
        .floating-shapes { position: absolute; width: 100%; height: 100%; }
        
        .soft-blob {
          position: absolute;
          border-radius: 50% 40% 60% 30%;
          background: linear-gradient(45deg, rgba(240, 206, 170, 0.4), rgba(224, 190, 156, 0.3));
          animation: softFloat 12s ease-in-out infinite;
          filter: blur(80px);
        }
        
        .blob-1 { width: 300px; height: 250px; top: -10%; left: -5%; animation-delay: 0s; }
        .blob-2 { width: 200px; height: 180px; bottom: 10%; right: -5%; animation-delay: -4s; background: linear-gradient(45deg, rgba(210, 180, 140, 0.3), rgba(195, 165, 125, 0.2)); }

        @keyframes softFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-20px, -30px) rotate(180deg) scale(0.9); }
        }

        .login-container { width: 100%; max-width: 420px; position: relative; z-index: 1; }
        
        .soft-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 48px 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.4);
          position: relative;
          overflow: hidden;
        }

        .comfort-header { text-align: center; margin-bottom: 40px; transition: opacity 0.3s ease; }
        .comfort-header.fade-out { opacity: 0; display: none; }
        .comfort-title { color: #8b6655; font-size: 2rem; font-weight: 600; margin-bottom: 8px; }
        .gentle-subtitle { color: rgba(139, 102, 85, 0.7); font-size: 15px; }

        .soft-field { position: relative; margin-bottom: 24px; }
        .field-container {
          position: relative; background: rgba(255, 255, 255, 0.7);
          border: 1.5px solid rgba(240, 206, 170, 0.3);
          border-radius: 16px; overflow: hidden; transition: all 0.3s ease;
        }
        .field-container:focus-within {
          border-color: #f0ceaa; background: rgba(255, 255, 255, 0.9);
        }
        .soft-field input {
          width: 100%; background: transparent; border: none; padding: 24px 16px 8px;
          color: #8b6655; font-size: 15px; outline: none; position: relative; z-index: 2;
          height: 56px;
        }
        .soft-field input::placeholder { color: transparent; }
        .soft-field label {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: rgba(139, 102, 85, 0.6); font-size: 15px;
          pointer-events: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 3;
        }
        .soft-field input:focus + label, .soft-field input:not(:placeholder-shown) + label {
          top: 8px; font-size: 11px; color: #8b6655; transform: translateY(0); font-weight: 600; letter-spacing: 0.5px;
        }
        .field-accent {
          position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
          background: linear-gradient(90deg, #f0ceaa, #e0be9c);
          transition: width 0.3s ease;
        }
        .field-container:focus-within .field-accent { width: 100%; }

        /* Error States */
        .gentle-error {
          color: #d97757; font-size: 13px; margin-top: 6px;
          opacity: 0; transform: translateY(-4px); transition: all 0.3s ease; display: block;
        }
        .gentle-error.show { opacity: 1; transform: translateY(0); }
        .soft-field.error .field-container { border-color: #d97757; background: rgba(217, 119, 87, 0.05); }

        .gentle-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; z-index: 4; padding: 8px;
        }
        .toggle-icon { width: 20px; height: 20px; color: rgba(139, 102, 85, 0.6); }

        .comfort-button {
          width: 100%; background: transparent; color: #8b6655; border: none;
          border-radius: 16px; padding: 0; cursor: pointer; font-size: 15px; font-weight: 500;
          position: relative; margin-bottom: 32px; min-height: 54px; display: flex; align-items: center; justify-content: center;
        }
        .button-background {
          position: absolute; inset: 0; background: linear-gradient(135deg, #f0ceaa 0%, #e0be9c 100%);
          transition: all 0.3s ease; border-radius: 16px;
        }
        .comfort-button:hover .button-background { background: linear-gradient(135deg, #ebc49a 0%, #dbb88c 100%); box-shadow: 0 8px 16px rgba(240, 206, 170, 0.4); }
        .comfort-button:hover { transform: translateY(-1px); }
        .button-text { position: relative; z-index: 2; }
        .button-loader { 
          position: absolute; 
          top: 50%; left: 50%; 
          transform: translate(-50%, -50%);
          z-index: 2; 
          opacity: 0; 
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .comfort-button.loading .button-text { opacity: 0; }
        .comfort-button.loading .button-loader { opacity: 1; visibility: visible; }
        .comfort-button:disabled { opacity: 0.8; cursor: not-allowed; }

        .gentle-divider { display: flex; align-items: center; margin: 32px 0; gap: 16px; }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(240, 206, 170, 0.4), transparent); }
        .divider-text { color: rgba(139, 102, 85, 0.6); font-size: 13px; }
        .comfort-icon { width: 100%; height: 100%; position: relative; z-index: 2; overflow: hidden; border-radius: 50%; }

        .comfort-social { display: flex; gap: 12px; margin-bottom: 32px; flex-direction: column; }
        .social-soft {
          width: 100%; background: transparent; color: #8b6655; border: 1.5px solid rgba(240, 206, 170, 0.3);
          border-radius: 12px; cursor: pointer; font-size: 14px; min-height: 48px;
          display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; overflow: hidden; transition: all 0.3s ease;
        }
        .social-background { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.7); transition: all 0.3s ease; }
        .social-soft:hover { border-color: #f0ceaa; transform: translateY(-1px); }
        .social-soft span, .social-soft svg { position: relative; z-index: 2; }

        .comfort-signup { text-align: center; font-size: 14px; color: rgba(139, 102, 85, 0.7); }
        .signup-text { margin-right: 6px; }
        .signup-link { font-weight: 500; color: #c19a82; text-decoration: none; }
        .signup-link:hover { color: #8b6655; }

        .gentle-success {
          text-align: center; padding: 40px 20px; opacity: 0; transform: translateY(20px); transition: all 0.4s ease; display: none;
        }
        .gentle-success.show { display: block; opacity: 1; transform: translateY(0); }
        .success-bloom { position: relative; width: 100px; height: 100px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
        .bloom-ring {
          position: absolute; border: 2px solid #f0ceaa; border-radius: 50%; animation: bloomExpand 1.2s ease-out forwards; opacity: 0;
        }
        .ring-1 { width: 60px; height: 60px; animation-delay: 0s; }
        .ring-2 { width: 80px; height: 80px; animation-delay: 0.2s; }
        @keyframes bloomExpand { 0% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.6; transform: scale(1); } }
        .success-icon { position: relative; z-index: 2; color: #8b6655; animation: iconBloom 0.6s ease-out 0.6s forwards; opacity: 0; }
        @keyframes iconBloom { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }
        
        .success-title { color: #8b6655; font-size: 1.25rem; font-weight: 600; margin-bottom: 8px; }
        .success-desc { color: rgba(139, 102, 85, 0.7); font-size: 14px; }
        
        .gentle-spinner { width: 20px; height: 20px; }
        .spinner-circle {
          width: 100%; height: 100%; border: 2px solid rgba(139, 102, 85, 0.2);
          border-top: 2px solid #8b6655; border-radius: 50%; animation: gentleSpin 1s linear infinite;
        }
        @keyframes gentleSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .soft-card { padding: 36px 28px; border-radius: 24px; }
          .comfort-title { font-size: 1.75rem; }
        }
      `}</style>
        </div>
    );
}
