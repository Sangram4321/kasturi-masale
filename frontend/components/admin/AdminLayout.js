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
    ChevronRight
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
                                    height: 64,
                                    objectFit: 'contain',
                                    filter: "brightness(0) saturate(100%) invert(23%) sepia(99%) saturate(4975%) hue-rotate(352deg) brightness(88%) contrast(110%)"
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
                        const isActive = router.pathname === item.path || router.pathname.startsWith(`${item.path}/`);
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
                                    {isSidebarOpen && isActive && (
                                        <motion.div layoutId="activeIndicator" style={styles.activeIndicator} />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div style={styles.footer}>
                    <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
                        <LogOut size={20} color="#EF4444" />
                        {isSidebarOpen && <span style={styles.logoutText}>Logout</span>}
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
                        <div style={styles.adminProfile}>
                            <div style={styles.avatar}>A</div>
                            <span style={styles.adminName}>Admin User</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: "32px 40px", maxWidth: 1600, margin: "0 auto" }}>
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
          background-color: #F3F4F6;
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
    sidebar: {
        height: "100vh", // Fallback
        height: "100dvh",
        background: "rgba(17, 24, 39, 0.95)", // High opacity dark glass
        backdropFilter: "blur(20px)",
        color: "white",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
        borderRight: "1px solid rgba(255,255,255,0.1)"
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: "blur(4px)",
        zIndex: 40,
    },
    logoContainer: {
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: 'relative'
    },
    mobileCloseBtn: {
        position: 'absolute',
        right: 16,
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        borderRadius: 8,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    logo: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: "-0.5px",
        margin: 0,
    },
    miniLogo: {
        fontSize: 24,
        fontWeight: "800",
        color: "#D97706",
    },
    nav: {
        flex: 1,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 16, // Softer rounding
        cursor: "pointer",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        color: "#9CA3AF",
        gap: 12,
        whiteSpace: "nowrap",
    },
    activeNavItem: {
        background: "rgba(255, 255, 255, 0.12)",
        color: "#fff",
        fontWeight: "600",
        backdropFilter: "blur(4px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    },
    navText: {
        fontSize: 14,
        fontWeight: 500,
    },
    footer: {
        padding: 16,
        borderTop: "1px solid rgba(255,255,255,0.08)",
    },
    logoutBtn: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "12px 16px",
        background: "transparent",
        border: "none",
        color: "#EF4444",
        cursor: "pointer",
        borderRadius: 12,
        transition: "all 0.2s",
        justifyContent: "flex-start",
    },
    main: {
        flex: 1,
        minHeight: "100vh",
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        width: "100%",
        background: "#F3F4F6", // Ensure robust background
    },
    header: {
        height: 80,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px) saturate(180%)", // High saturation glass
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
    },
    menuBtn: {
        background: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(0,0,0,0.05)",
        cursor: "pointer",
        padding: 8,
        borderRadius: 10,
        color: "#374151",
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
        padding: "6px 8px 6px 6px",
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(0,0,0,0.05)",
        borderRadius: 50,
        backdropFilter: "blur(8px)",
        transition: "all 0.2s",
        cursor: "default"
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    adminName: {
        fontSize: 14,
        fontWeight: 600,
        color: "#374151",
        marginRight: 8,
    },
};
