import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { usePage } from "@inertiajs/react";

export default function Dashboard() {
    const { auth, stats, aktivitas } = usePage().props;
    const user = auth.user;
    const [time, setTime] = useState(new Date());
    const [hijri, setHijri] = useState("");

    const nama =
        user.role === "admin"
            ? "Admin Pondok"
            : user.santri?.nama_lengkap || user.ustadz?.nama_lengkap || "User";

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const now = new Date();
        const today = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
        fetch(`https://api.aladhan.com/v1/gToH?date=${today}`)
            .then((res) => res.json())
            .then((data) => {
                const h = data.data?.hijri;
                if (h) setHijri(`${h.day} ${h.month.en} ${h.year}`);
            })
            .catch(() => setHijri(""));
    }, []);

    return (
        <AppLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] p-4 text-white shadow-lg">
                    <h1 className="text-lg font-bold">
                        Assalamu'alaikum, {nama}
                    </h1>
                    <p className="text-xs text-white/70 mt-0.5">
                        Selamat datang di Al-Amanah Mobile
                    </p>
                    <p className="text-xs text-white/50 mt-0.5 capitalize">
                        {user.role}
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/20 space-y-0.5">
                        <p className="text-xs text-white/80">
                            {time.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}{" "}
                            WIB
                        </p>
                        <p className="text-xs text-white/80">
                            {time.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        {hijri && (
                            <p className="text-xs text-white/80">{hijri} H</p>
                        )}
                    </div>
                </div>

                {/* ========== ADMIN ========== */}
                {user.role === "admin" && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Santri
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#3D7ABA]">
                                    {stats?.totalSantri || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Ustadz
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#20B5E8]">
                                    {stats?.totalUstadz || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Belum Bayar
                                </p>
                                <p className="mt-1 text-lg font-bold text-orange-500">
                                    {stats?.totalBelumBayar || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Pemasukan Bulan Ini
                                </p>
                                <p className="mt-1 text-base font-bold text-emerald-500 font-mono tracking-tight">
                                    Rp{" "}
                                    {(
                                        stats?.pemasukanBulanIni || 0
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    User Aktif
                                </p>
                                <p className="mt-1 text-lg font-bold text-indigo-500">
                                    {stats?.userAktif || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Jumlah User
                                </p>
                                <p className="mt-1 text-lg font-bold text-purple-500">
                                    {stats?.totalUser || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Kunjungan Hari Ini
                                </p>
                                <p className="mt-1 text-lg font-bold text-amber-600">
                                    {stats?.kunjunganHariIni || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Kunjungan
                                </p>
                                <p className="mt-1 text-lg font-bold text-pink-500">
                                    {stats?.totalKunjungan || 0}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-2">
                                Aktivitas Terbaru
                            </h2>
                            <div className="space-y-2">
                                {(!aktivitas || aktivitas.length === 0) && (
                                    <p className="text-xs text-slate-400">
                                        Belum ada aktivitas
                                    </p>
                                )}
                                {aktivitas &&
                                    aktivitas.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between text-xs text-slate-600"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#3D7ABA] shrink-0"></div>
                                                {item.teks}
                                            </div>
                                            <span className="text-slate-400 text-[10px] shrink-0 ml-2">
                                                {item.waktu}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ========== USTADZ ========== */}
                {user.role === "ustadz" && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    NIU
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#3D7ABA]">
                                    {user.ustadz?.niu}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Status
                                </p>
                                <p className="mt-1 text-sm font-bold text-emerald-500">
                                    {user.ustadz?.status
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        user.ustadz?.status?.slice(1)}
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-2">
                                Menu Cepat
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="/presensi"
                                    className="rounded-xl bg-[#3D7ABA]/10 p-3 text-center text-xs font-medium text-[#3D7ABA]"
                                >
                                    Presensi
                                </a>
                                <a
                                    href="/qr"
                                    className="rounded-xl bg-[#20B5E8]/10 p-3 text-center text-xs font-medium text-[#20B5E8]"
                                >
                                    QR Code
                                </a>
                                <a
                                    href="/profil"
                                    className="rounded-xl bg-slate-100 p-3 text-center text-xs font-medium text-slate-600"
                                >
                                    Profil
                                </a>
                            </div>
                        </div>
                    </>
                )}

                {/* ========== SANTRI ========== */}
                {user.role === "santri" && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    NIS
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#3D7ABA]">
                                    {user.santri?.nis}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Status
                                </p>
                                <p className="mt-1 text-sm font-bold text-emerald-500">
                                    {user.santri?.status
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        user.santri?.status?.slice(1)}
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-2">
                                Menu Cepat
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="/tagihan"
                                    className="rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-500"
                                >
                                    Tagihan
                                </a>
                                <a
                                    href="/timeline"
                                    className="rounded-xl bg-blue-50 p-3 text-center text-xs font-medium text-blue-500"
                                >
                                    Timeline
                                </a>
                                <a
                                    href="/qr"
                                    className="rounded-xl bg-[#20B5E8]/10 p-3 text-center text-xs font-medium text-[#20B5E8]"
                                >
                                    QR Code
                                </a>
                                <a
                                    href="/profil"
                                    className="rounded-xl bg-slate-100 p-3 text-center text-xs font-medium text-slate-600"
                                >
                                    Profil
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
