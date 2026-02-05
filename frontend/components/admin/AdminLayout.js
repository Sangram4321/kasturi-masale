import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Responsive check
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("admin_auth");
        localStorage.removeItem("admin_auth_time");
        router.replace("/admin/login");
    };

    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
        { name: "Financials", icon: DollarSign, path: "/admin/financials" }, // 💰 NEW 
        { name: "Inventory", icon: Package, path: "/admin/inventory" }, // 📦 NEW
        { name: "Orders", icon: ShoppingBag, path: "/admin/orders" },
        // { name: "Products", icon: Package, path: "/admin/products" },
        // { name: "Customers", icon: Users, path: "/admin/customers" },
        { name: "Settings", icon: Settings, path: "/admin/settings" },
    ];

    return (
        <div className="admin-container">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        style={styles.overlay}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 280 : (isMobile ? 0 : 80),
                    x: isMobile && !isSidebarOpen ? -280 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={styles.sidebar}
            >
                <div style={styles.logoContainer}>
                    {isSidebarOpen ? (
                        <>
                            <img
                                src="/images/kasturi-logo.png"
                                alt="Kasturi Admin"
                                style={{
                                    height: 160,
                                    objectFit: 'contain',
                                    // Make logo white for dark theme (assuming original is dark/colored)
                                    // If original is already white, remove filter. Safe bet:
                                    filter: "brightness(0) invert(1)"
                                }}
                            />
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    style={styles.mobileCloseBtn}
                                >
                                    <X size={20} color="white" />
                                </button>
                            )}
                        </>
                    ) : (
                        <span style={styles.miniLogo}>K</span>
                    )}
                </div>

                <nav style={styles.nav}>
                    {navItems.map((item) => {
                        const isActive = item.path === "/admin"
                            ? router.pathname === item.path
                            : (router.pathname === item.path || router.pathname.startsWith(`${item.path}/`));
                        return (
                            <Link href={item.path} key={item.path} style={{ textDecoration: "none" }}>
                                <div
                                    style={{
                                        ...styles.navItem,
                                        ...(isActive ? styles.activeNavItem : {}),
                                        justifyContent: isSidebarOpen ? "flex-start" : "center"
                                    }}
                                    title={!isSidebarOpen ? item.name : ""}
                                >
                                    <item.icon size={20} color={isActive ? "#fff" : "#9CA3AF"} />
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={styles.navText}
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}

                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div style={styles.footer}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            width: '100%',
                            padding: '12px',
                            background: '#1E293B',
                            color: 'white',
                            border: '1px solid #334155',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main style={{
                ...styles.main,
                marginLeft: isMobile ? 0 : (isSidebarOpen ? 280 : 80)
            }}>
                {/* Header */}
                <header style={styles.header}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={styles.menuBtn}
                    >
                        {isSidebarOpen && !isMobile ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={styles.headerRight}>
                        {isMobile && (
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: '#EF4444',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: 8,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    marginRight: 8
                                }}
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                        <div style={styles.adminProfile}>
                            <img src="/images/admin-photo/me.jpeg" alt="Admin" style={{ ...styles.avatar, objectFit: 'cover', background: 'transparent' }} />
                            <span style={styles.adminName}>Admin User</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{
                    padding: isMobile ? "20px 16px" : "32px 40px",
                    maxWidth: 1600,
                    margin: "0 auto",
                    overflowX: 'hidden' // Prevent full page scroll
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Global Admin Styles */}
            <style jsx global>{`
        body {
          background-color: #0B0E14;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
        .admin-container {
          display: flex;
          min-height: 100vh;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
        </div>
    );
}

const styles = {
    // 🌌 SIDEBAR: Professional Dark (High Contrast)
    sidebar: {
        height: "100dvh", // Fixed 100vh issue on mobile

        background: "#0F172A", // Slate 900 - Solid & Deep
        color: "#94A3B8", // Slate 400 - Readable Grey
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: "1px solid #1E293B", // Slate 800
        width: 280,
        boxShadow: "4px 0 24px rgba(0,0,0,0.4)" // Stronger shadow
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: "blur(4px)",
        zIndex: 40,
    },
    logoContainer: {
        height: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid #1E293B",
        position: 'relative',
        background: "#0F172A"
    },
    mobileCloseBtn: {
        position: 'absolute',
        right: 16,
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 8,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: '0.2s',
    },
    nav: {
        flex: 1,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflowY: "auto"
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 8, // Sharper corners
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        color: "#94A3B8", // Slate 400
        gap: 12,
        whiteSpace: "nowrap",
        fontSize: 14,
        fontWeight: 500,
        border: "1px solid transparent",
    },
    // 🟣 ACTIVE STATE: High Contrast
    activeNavItem: {
        background: "#1E293B", // Slate 800
        color: "#F8FAFC", // Slate 50 (White)
        fontWeight: "600",
        border: "1px solid #334155", // Slate 700
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    navText: {
        fontSize: 14,
        fontWeight: 500,
    },
    footer: {
        padding: 16,
        borderTop: "1px solid #1E293B",
        background: "#0F172A"
    },

    // 🌑 MAIN CONTENT: Clean & Professional
    main: {
        flex: 1,
        minHeight: "100vh",
        transition: "margin-left 0.3s ease",
        width: "100%",
        background: "#020617", // Slate 950 (Start Dark)
        color: "#FFF"
    },
    header: {
        height: 64, // Reduced height for mobile/desktop parity or keep 80 if preferred, checking component usage
        background: "#0F172A", // Match sidebar
        borderBottom: "1px solid #1E293B",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px", // Reduced padding
        position: "sticky",
        top: 0,
        zIndex: 40,
    },
    menuBtn: {
        background: "#1E293B",
        border: "1px solid #334155",
        cursor: "pointer",
        padding: 8,
        borderRadius: 8,
        color: "#FFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: 16,
    },
    adminProfile: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 16px 6px 6px",
        background: "#1E293B",
        border: "1px solid #334155",
        borderRadius: 50,
        cursor: "default",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#6366F1", // Indigo 500
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
    },
    adminName: {
        fontSize: 14,
        fontWeight: 500,
        color: "#E2E8F0", // Slate 200
        marginRight: 4,
    },
};
