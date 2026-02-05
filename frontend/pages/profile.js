import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { User, Package, MapPin, LogOut, ArrowRight } from "lucide-react";

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Prevent hard reload loops by checking client-side only
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            router.replace("/login"); // Use replace to avoid history stack issues
        } else {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
    };

    if (!user) return null; // Avoid flicker

    return (
        <div style={styles.page}>
            <Head>
                <title>My Profile | Kasturi Masale</title>
            </Head>

            <div style={styles.container}>
                {/* HERO */}
                <div style={styles.hero}>
                    <div style={styles.avatar}>
                        {user.photo ? (
                            <img src={user.photo} style={styles.avatarImg} alt="Profile" />
                        ) : (
                            <User size={32} color="#fff" />
                        )}
                    </div>
                    <div>
                        <h1 style={styles.greeting}>Hello, {user.name}</h1>
                        <p style={styles.email}>{user.email}</p>
                    </div>
                </div>

                {/* MENU GRID */}
                <div style={styles.grid}>
                    {/* ORDERS */}
                    <Link href="/orders" passHref legacyBehavior>
                        <a style={styles.card}>
                            <div style={{ ...styles.iconBox, background: '#EFF6FF', color: '#2563EB' }}>
                                <Package size={24} />
                            </div>
                            <div style={styles.cardContent}>
                                <h3>My Orders</h3>
                                <p>Track, view, and manage your orders</p>
                            </div>
                            <ArrowRight size={20} color="#ccc" />
                        </a>
                    </Link>

                    {/* COINS */}
                    <Link href="/account/coins" passHref legacyBehavior>
                        <a style={styles.card}>
                            <div style={{ ...styles.iconBox, background: '#FFFBEB', color: '#D97706' }}>
                                <span style={{ fontSize: 24 }}>🪙</span>
                            </div>
                            <div style={styles.cardContent}>
                                <h3>Kasturi Coins</h3>
                                <p>Check balance and tier status</p>
                            </div>
                            <ArrowRight size={20} color="#ccc" />
                        </a>
                    </Link>

                    {/* ADDRESSES (Placeholder) */}
                    <Link href="/account/addresses" passHref legacyBehavior>
                        <a style={{ ...styles.card, opacity: 0.6, pointerEvents: 'none' }}>
                            <div style={{ ...styles.iconBox, background: '#F3F4F6', color: '#6B7280' }}>
                                <MapPin size={24} />
                            </div>
                            <div style={styles.cardContent}>
                                <h3>Saved Addresses</h3>
                                <p>Coming Soon</p>
                            </div>
                        </a>
                    </Link>
                </div>

                {/* LOGOUT */}
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F9FAFB",
        padding: "120px 20px 40px",
        fontFamily: "'Inter', sans-serif"
    },
    container: {
        maxWidth: 600,
        margin: "0 auto"
    },
    hero: {
        background: "#fff",
        borderRadius: 20,
        padding: 32,
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginBottom: 32,
        boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "#1F2937",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
    },
    avatarImg: {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        objectFit: "cover"
    },
    greeting: {
        fontSize: 24,
        fontWeight: 700,
        color: "#111827",
        margin: "0 0 4px 0"
    },
    email: {
        color: "#6B7280",
        margin: 0,
        fontSize: 15
    },
    grid: {
        display: "flex",
        flexDirection: "column",
        gap: 16
    },
    card: {
        background: "#fff",
        padding: 24,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        gap: 16,
        textDecoration: "none",
        color: "inherit",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        transition: "transform 0.2s, box-shadow 0.2s"
    },
    cardContent: {
        flex: 1
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    logoutBtn: {
        marginTop: 40,
        width: "100%",
        padding: 16,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        color: "#DC2626",
        fontSize: 15,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        transition: "background 0.2s"
    }
};
