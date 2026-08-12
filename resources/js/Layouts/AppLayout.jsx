import { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { Toaster } from "react-hot-toast";

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const profil = user.ustadz || user.santri;
    const initial = profil?.nama_lengkap?.charAt(0) || "A";

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem("sidebarCollapsed") === "true";
    });

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem("sidebarCollapsed", newState);
    };

    const menuUtama = [
        {
            label: "Dashboard",
            path: "/",
            icon: "fa-home",
            roles: ["admin", "ustadz", "santri"],
        },
        {
            label: "QR Code",
            path: "/qr",
            icon: "fa-qrcode",
            roles: ["admin", "ustadz", "santri"],
        },
        {
            label: "Timeline",
            path: "/timeline",
            icon: "fa-timeline",
            roles: ["admin", "ustadz", "santri"],
        },
    ];

    const menuData = [
        {
            label: "Santri",
            path: "/santri",
            icon: "fa-user-graduate",
            roles: ["admin"],
        },
        {
            label: "Ustadz",
            path: "/ustadz",
            icon: "fa-chalkboard-user",
            roles: ["admin"],
        },
        {
            label: "PSB",
            path: "/psb/verifikasi",
            icon: "fa-file-signature",
            roles: ["admin"],
        },
        {
            label: "Surat",
            path: "/surat",
            icon: "fa-envelope",
            roles: ["admin"],
        },
        {
            label: "Export EMIS",
            path: "/export",
            icon: "fa-file-export",
            roles: ["admin"],
        },
    ];

    const menuKeuangan = [
        {
            label: "Pembayaran",
            path: "/pembayaran",
            icon: "fa-money-bill-wave",
            roles: ["admin"],
        },
        {
            label: "Rekap",
            path: "/rekap",
            icon: "fa-chart-bar",
            roles: ["admin"],
        },
        {
            label: "Tagihan",
            path: "/tagihan",
            icon: "fa-file-invoice",
            roles: ["santri"],
        },
    ];

    const menuKegiatan = [
        {
            label: "Presensi Ustadz",
            path: "/presensi",
            icon: "fa-clipboard-list",
            roles: ["admin", "ustadz"],
        },
        {
            label: "Presensi Santri",
            path: "/presensi-santri",
            icon: "fa-clipboard-check",
            roles: ["admin"],
        },
        {
            label: "Pinjam Gedung",
            path: "/pinjam-gedung",
            icon: "fa-building",
            roles: ["admin"],
        },
        {
            label: "Inventaris",
            path: "/inventaris",
            icon: "fa-box",
            roles: ["admin"],
        },
    ];

    const filterMenu = (menu) =>
        menu.filter((m) => m.roles.includes(user.role));

    const bottomNavByRole = {
        admin: [
            { label: "Beranda", path: "/", icon: "fa-home" },
            { label: "Bayar", path: "/pembayaran", icon: "fa-money-bill-wave" },
            { label: "QR", path: "/qr", icon: "fa-qrcode", isCenter: true },
            { label: "Rekap", path: "/rekap", icon: "fa-chart-bar" },
            { label: "Presensi", path: "/presensi", icon: "fa-clipboard-list" },
        ],
        ustadz: [
            { label: "Beranda", path: "/", icon: "fa-home" },
            { label: "Timeline", path: "/timeline", icon: "fa-timeline" },
            { label: "QR", path: "/qr", icon: "fa-qrcode", isCenter: true },
            { label: "Presensi", path: "/presensi", icon: "fa-clipboard-list" },
            { label: "Profil", path: "/profil", icon: "fa-user" },
        ],
        santri: [
            { label: "Beranda", path: "/", icon: "fa-home" },
            { label: "Timeline", path: "/timeline", icon: "fa-timeline" },
            { label: "QR", path: "/qr", icon: "fa-qrcode", isCenter: true },
            { label: "Tagihan", path: "/tagihan", icon: "fa-file-invoice" },
            { label: "Profil", path: "/profil", icon: "fa-user" },
        ],
    };

    const bottomNav = bottomNavByRole[user.role] || [];
    const currentPath = usePage().url;
    const handleLogout = () => {
        router.post("/logout");
    };
    const isActive = (path) => currentPath === path;
    const activeClass = "bg-[#3D7ABA]/10 text-[#3D7ABA] font-semibold";
    const inactiveClass = "text-slate-600 hover:bg-[#3D7ABA]/5";

    const CategoryTitle = ({ children, collapsed }) => {
        if (collapsed) return null;
        return (
            <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2 mb-0.5">
                {children}
            </p>
        );
    };

    return (
        <div className="min-h-screen bg-[#EEF8FD]">
            <Toaster position="top-right" />

            {/* Header Mobile */}
            <header className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] sticky top-0 z-30 shadow-lg md:hidden">
                <div className="flex flex-col items-center py-2 relative">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
                    >
                        <i className="fa-solid fa-bars text-lg"></i>
                    </button>
                    <img
                        src="/images/logo-alamanah.png"
                        alt="Logo"
                        className="h-10 w-auto"
                    />
                    <span className="text-[11px] font-semibold text-white/90 mt-0.5 tracking-wide">
                        Al-Amanah Mobile
                    </span>
                </div>
            </header>

            {/* Sidebar Mobile */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${sidebarOpen ? "visible" : "invisible"}`}
            >
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setSidebarOpen(false)}
                ></div>
                <div
                    className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl rounded-r-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="p-4 flex items-center gap-3">
                        <img
                            src="/images/logo-alamanah.png"
                            alt="Logo"
                            className="h-8 w-auto"
                        />
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto text-slate-400"
                        >
                            &times;
                        </button>
                    </div>
                    <nav className="p-2 flex-1 overflow-y-auto">
                        <CategoryTitle collapsed={false}>Utama</CategoryTitle>
                        {filterMenu(menuUtama).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <i
                                    className={`fa-solid ${m.icon} w-5 text-center`}
                                ></i>
                                {m.label}
                            </Link>
                        ))}
                        {filterMenu(menuData).length > 0 && (
                            <CategoryTitle collapsed={false}>
                                Data
                            </CategoryTitle>
                        )}
                        {filterMenu(menuData).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <i
                                    className={`fa-solid ${m.icon} w-5 text-center`}
                                ></i>
                                {m.label}
                            </Link>
                        ))}
                        {filterMenu(menuKeuangan).length > 0 && (
                            <CategoryTitle collapsed={false}>
                                Keuangan
                            </CategoryTitle>
                        )}
                        {filterMenu(menuKeuangan).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <i
                                    className={`fa-solid ${m.icon} w-5 text-center`}
                                ></i>
                                {m.label}
                            </Link>
                        ))}
                        {filterMenu(menuKegiatan).length > 0 && (
                            <CategoryTitle collapsed={false}>
                                Kegiatan
                            </CategoryTitle>
                        )}
                        {filterMenu(menuKegiatan).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <i
                                    className={`fa-solid ${m.icon} w-5 text-center`}
                                ></i>
                                {m.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="bg-slate-50/50 py-2">
                        <Link
                            href="/profil"
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-6 py-2.5 text-sm ${isActive("/profil") ? activeClass : inactiveClass}`}
                        >
                            <div className="w-5 h-5 rounded-full bg-[#3D7ABA] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {initial}
                            </div>
                            Profil
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-6 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50"
                        >
                            <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Desktop */}
            <aside
                className={`hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-full md:bg-white md:shadow-xl z-20 transition-all duration-300 rounded-r-3xl ${sidebarCollapsed ? "w-20" : "w-60"}`}
            >
                <div className="p-4 flex items-center justify-center">
                    <img
                        src={
                            sidebarCollapsed
                                ? "/images/icon-amanah.png"
                                : "/images/logo-alamanah.png"
                        }
                        alt="Logo"
                        className={
                            sidebarCollapsed ? "h-7 w-auto" : "h-10 w-auto"
                        }
                    />
                </div>
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-[#3D7ABA]"
                >
                    <i
                        className={`fa-solid ${sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}
                    ></i>
                </button>
                <nav className="px-2 flex-1 space-y-0 overflow-y-auto">
                    <CategoryTitle collapsed={sidebarCollapsed}>
                        Utama
                    </CategoryTitle>
                    {filterMenu(menuUtama).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <i
                                className={`fa-solid ${m.icon} w-4 text-center text-base`}
                            ></i>
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    {filterMenu(menuData).length > 0 && (
                        <CategoryTitle collapsed={sidebarCollapsed}>
                            Data
                        </CategoryTitle>
                    )}
                    {filterMenu(menuData).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <i
                                className={`fa-solid ${m.icon} w-4 text-center text-base`}
                            ></i>
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    {filterMenu(menuKeuangan).length > 0 && (
                        <CategoryTitle collapsed={sidebarCollapsed}>
                            Keuangan
                        </CategoryTitle>
                    )}
                    {filterMenu(menuKeuangan).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <i
                                className={`fa-solid ${m.icon} w-4 text-center text-base`}
                            ></i>
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    {filterMenu(menuKegiatan).length > 0 && (
                        <CategoryTitle collapsed={sidebarCollapsed}>
                            Kegiatan
                        </CategoryTitle>
                    )}
                    {filterMenu(menuKegiatan).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <i
                                className={`fa-solid ${m.icon} w-4 text-center text-base`}
                            ></i>
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-3 space-y-0.5 bg-slate-50/50">
                    <Link
                        href="/profil"
                        className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive("/profil") ? activeClass : inactiveClass}`}
                        title={sidebarCollapsed ? "Profil" : ""}
                    >
                        <div className="w-5 h-5 rounded-full bg-[#3D7ABA] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {initial}
                        </div>
                        {!sidebarCollapsed && "Profil"}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={`text-red-500 text-xs font-medium hover:bg-red-50 rounded-xl px-3 py-1.5 ${sidebarCollapsed ? "w-full justify-center flex" : "w-full text-left flex items-center gap-3"}`}
                    >
                        <i className="fa-solid fa-right-from-bracket text-sm"></i>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`pb-28 md:pb-6 transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-60"}`}
            >
                <div className="p-4 md:p-6">{children}</div>
            </main>

            {/* Bottom Nav Mobile */}
            <nav className="fixed bottom-3 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 z-30 md:hidden">
                <div className="flex items-end justify-around px-1 py-1 relative">
                    {bottomNav.map((b) =>
                        b.isCenter ? (
                            <Link
                                key={b.path}
                                href={b.path}
                                className="flex flex-col items-center -mt-6 relative z-10"
                            >
                                <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all ${isActive(b.path) ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] scale-110" : "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8]"}`}
                                >
                                    <i
                                        className={`fa-solid ${b.icon} text-white text-lg`}
                                    ></i>
                                </div>
                                <span
                                    className={`text-[9px] font-bold mt-0.5 ${isActive(b.path) ? "text-[#3D7ABA]" : "text-slate-400"}`}
                                >
                                    {b.label}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                key={b.path}
                                href={b.path}
                                className={`flex flex-col items-center py-1.5 px-1 min-w-[52px] transition-all ${isActive(b.path) ? "text-[#3D7ABA] scale-110" : "text-slate-400 hover:text-[#20B5E8]"}`}
                            >
                                <div
                                    className={`p-1.5 rounded-full transition-all ${isActive(b.path) ? "bg-[#3D7ABA]/10" : ""}`}
                                >
                                    <i
                                        className={`fa-solid ${b.icon} text-base`}
                                    ></i>
                                </div>
                                <span className="text-[9px] font-bold mt-0.5">
                                    {b.label}
                                </span>
                            </Link>
                        ),
                    )}
                </div>
            </nav>
        </div>
    );
}
