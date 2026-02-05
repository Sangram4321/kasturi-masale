import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [checkingRedirect, setCheckingRedirect] = useState(true);

    // Helper: Detect Mobile
    const isMobile = () => {
        if (typeof window === "undefined") return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Handle Redirect Result (RUNS ON MOUNT)
    useEffect(() => {
        const handleRedirect = async () => {
            // Avoid running if already logged in? No, let it run to catch the redirect result.
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("Redirect Auth Success:", result.user.uid);
                    await handleAuthSuccess(result.user);
                    return; // Don't turn off loading if success, as we redirect away
                }
            } catch (err) {
                console.error("Redirect Result Error:", err);
                setError(err.message);
            } finally {
                setCheckingRedirect(false);
            }
        };
        handleRedirect();
    }, []);

    // IMPORTANT: ensure no header renders here
    useEffect(() => {
        document.body.style.overflow = "auto";
    }, []);

    const handleAuthSuccess = async (user) => {
        const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            phone: user.phoneNumber
        };

        // 1. Sync User with Backend to get Token
        try {
            const res = await fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem('token', data.token); // Store Backend Token
            }
        } catch (err) {
            console.error("Sync failed", err);
        }

        // 2. Local Storage Setup
        localStorage.setItem('auth', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event("auth-change"));

        // Redirect Logic - Wait a tick to ensure storage is set
        await new Promise(r => setTimeout(r, 100));

        const redirect = router.query.redirect;
        if (redirect && redirect !== '/login') {
            router.push(redirect);
        } else {
            router.push('/');
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            handleAuthSuccess(result.user);
        } catch (err) {
            setError("Invalid email or password.");
        }
    };

    /* 📱 SMART AUTH HANDLERS */
    const handleGoogle = async (e) => {
        e.preventDefault();
        setError("");
        const provider = new GoogleAuthProvider();

        // Try Popup First (Works on Desktop & Modern Mobile)
        try {
            const result = await signInWithPopup(auth, provider);
            handleAuthSuccess(result.user);
        } catch (err) {
            console.warn("Popup failed/closed, trying redirect fallback...", err.code);
            // Fallback to Redirect (Best for some mobile browsers / in-app browsers)
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectErr) {
                console.error("Redirect failed", redirectErr);
                setError(redirectErr.message);
            }
        }
    };

    const handleFacebook = async (e) => {
        e.preventDefault();
        setError("");
        const provider = new FacebookAuthProvider();

        // Try Popup First
        try {
            const result = await signInWithPopup(auth, provider);
            handleAuthSuccess(result.user);
        } catch (err) {
            console.warn("Popup failed/closed, trying redirect fallback...", err.code);
            // Fallback to Redirect
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectErr) {
                console.error("Redirect failed", redirectErr);
                setError(redirectErr.message);
            }
        }
    };

    if (checkingRedirect) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '3px solid #333', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-overlay" />

            <div className="login-card">
                <h1 className="login-title">Login</h1>

                {error && <div style={{ color: '#ff6666', marginBottom: '15px', textAlign: 'center', fontSize: '14px', background: 'rgba(255,0,0,0.1)', padding: '8px', borderRadius: '4px' }}>{error}</div>}

                <form className="login-form" onSubmit={handleEmailLogin}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="login-row">
                        <label className="remember">
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <button
                            type="button"
                            className="link-btn"
                            onClick={() => router.push("/forgot-password")}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="login-btn">
                        Log In
                    </button>
                </form>

                <p className="register-text">
                    Don&apos;t have an account?{" "}
                    <span onClick={() => router.push("/signup")}>Register</span>
                </p>

                <div className="divider">
                    <span>OR</span>
                </div>

                {/* OAuth buttons MUST be type="button" */}
                <button
                    type="button"
                    className="oauth-btn"
                    onClick={handleGoogle}
                >
                    Continue with Google
                </button>

                <button
                    type="button"
                    className="oauth-btn"
                    onClick={handleFacebook}
                >
                    Continue with Facebook
                </button>
            </div>

            <style jsx>{`
        /* PAGE */
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url("/images/login/hero-bg.jpg") center/cover no-repeat;
          position: relative;
        }

        .login-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
        }

        /* CARD */
        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
          padding: 32px 28px;
          background: rgba(0, 0, 0, 0.0); /* More transparent */
          backdrop-filter: blur(10px) saturate(160%); /* Minimal glass effect */
          -webkit-backdrop-filter: blur(10px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.15); /* Subtle border */
          border-radius: 16px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          color: white;
        }

        /* TEXT */
        .login-title {
          text-align: center;
          font-size: 28px;
          margin-bottom: 24px;
        }

        label {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
        }

        /* INPUTS */
        input[type="email"],
        input[type="password"] {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.3);
          padding: 12px 4px;
          margin-bottom: 24px;
          color: white;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        input:focus {
          outline: none;
          border-bottom-color: #fff;
          background: linear-gradient(to right, rgba(255,255,255,0.05), transparent);
          padding-left: 10px; /* Subtle slide */
        }

        /* ROW */
        .login-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin-bottom: 30px;
          color: rgba(255,255,255,0.8);
        }

        .remember {
          display: flex;
          gap: 8px;
          align-items: center;
          cursor: pointer;
        }
        
        input[type="checkbox"] {
          accent-color: #fff;
          width: 16px; 
          height: 16px;
          cursor: pointer;
        }

        .link-btn {
          background: none;
          border: none;
          color: #e0e0e0;
          cursor: pointer;
          transition: 0.2s;
        }
        .link-btn:hover { color: #fff; text-decoration: underline; }

        /* MAIN BUTTON */
        .login-btn {
          width: 100%;
          padding: 14px;
          background: #fff;
          color: #000;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
          letter-spacing: 0.5px;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.25);
        }

        .login-btn:active {
          transform: scale(0.96);
          box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
        }

        /* REGISTER */
        .register-text {
          text-align: center;
          margin: 24px 0;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
        }

        .register-text span {
          font-weight: 600;
          cursor: pointer;
          color: #fff;
          margin-left: 5px;
          transition: 0.2s;
        }
        .register-text span:hover { text-decoration: underline; }

        /* DIVIDER */
        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
        }
        
        .divider::before {
             content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: rgba(255,255,255,0.15);
        }

        .divider span {
          background: rgba(0,0,0,0.4); /* Match transparent darkening */
          padding: 0 10px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          position: relative;
          z-index: 2;
          border-radius: 10px;
        }

        /* OAUTH */
        .oauth-btn {
          width: 100%;
          padding: 12px;
          margin-top: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        .oauth-btn:hover {
            background: rgba(255,255,255,0.1);
            border-color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .oauth-btn:active {
            transform: scale(0.98);
            background: rgba(255,255,255,0.15);
        }

        /* MOBILE */
        @media (max-width: 480px) {
          .login-card {
            margin: 16px;
            padding: 28px 22px;
          }
        }
      `}</style>
        </div>
    );
}
