import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import {
    CalendarHeart,
    Clock,
    AlertCircle,
    CheckCircle2,
    Plus,
    Check,
    Trash2,
    Search,
    BookOpen,
    Info,
    Sparkles,
    Calendar,
    Users,
    UserCheck,
} from "lucide-react";

export default function Index() {
    const {
        isAdmin,
        santri,
        activeRecord,
        activeHariKe,
        isIstihadhah,
        masaSuciHari,
        riwayat,
        haidAktif,
        santriPutriList,
        filters,
    } = usePage().props;

    // State Admin
    const [adminTab, setAdminTab] = useState("aktif"); // 'aktif' | 'riwayat'
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");

    // Modal States
    const [showMulaiModal, setShowMulaiModal] = useState(false);
    const [showSelesaiModal, setShowSelesaiModal] = useState(false);
    const [targetRecord, setTargetRecord] = useState(null);

    // Form Mulai
    const [formMulai, setFormMulai] = useState({
        santri_id: "",
        tgl_mulai: new Date().toISOString().slice(0, 16),
        warna_darah: "Merah",
        catatan: "",
    });

    // Form Selesai
    const [formSelesai, setFormSelesai] = useState({
        tgl_selesai: new Date().toISOString().slice(0, 16),
    });

    // Format Tanggal
    const formatTanggal = (dt) => {
        if (!dt) return "-";
        return new Date(dt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatTglSingkat = (dt) => {
        if (!dt) return "-";
        return new Date(dt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Submit Mulai Haid
    const handleMulai = (e) => {
        e.preventDefault();
        router.post("/haid/mulai", formMulai, {
            onSuccess: () => {
                toast.success("Catatan mulai haid berhasil disimpan.");
                setShowMulaiModal(false);
                setFormMulai({
                    santri_id: "",
                    tgl_mulai: new Date().toISOString().slice(0, 16),
                    warna_darah: "Merah",
                    catatan: "",
                });
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || "Gagal menyimpan.";
                toast.error(msg);
            },
        });
    };

    // Submit Selesai Haid
    const handleSelesai = (e) => {
        e.preventDefault();
        if (!targetRecord) return;
        router.put(`/haid/${targetRecord.id}/selesai`, formSelesai, {
            onSuccess: () => {
                toast.success("Catatan selesai haid disimpan. Alhamdulillah!");
                setShowSelesaiModal(false);
                setTargetRecord(null);
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || "Gagal menyimpan.";
                toast.error(msg);
            },
        });
    };

    // Hapus Catatan
    const handleHapus = (id) => {
        if (confirm("Hapus catatan haid ini?")) {
            router.delete(`/haid/${id}`, {
                onSuccess: () => toast.success("Catatan berhasil dihapus."),
                onError: () => toast.error("Gagal menghapus."),
            });
        }
    };

    // Cari Santri (Admin)
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/haid",
            { search: searchQuery },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* ========================================= */}
                {/* 1. TAMPILAN KHUSUS SANTRI PUTRI           */}
                {/* ========================================= */}
                {!isAdmin && (
                    <div className="space-y-6">
                        {/* Header Santri */}
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-2 border border-rose-100">
                                <CalendarHeart className="w-3.5 h-3.5" />
                                <span>Buku Haid Santri Putri</span>
                            </div>
                            <h1 className="text-xl font-extrabold text-slate-800">
                                Catatan Siklus & Ibadah
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Pantau masa suci, durasi haid, dan ketertiban
                                bersuci sesuai tuntunan syariat.
                            </p>
                        </div>

                        {/* STATUS HERO CARD */}
                        {activeRecord ? (
                            /* SEDANG HAID CARD */
                            <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                            Sedang Berhalangan
                                        </span>
                                        <span className="text-xs text-white/80">
                                            Mulai:{" "}
                                            {formatTanggal(
                                                activeRecord.tgl_mulai
                                            )}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs text-rose-100 font-medium">
                                            Durasi Haid Berjalan
                                        </p>
                                        <p className="text-3xl font-extrabold tracking-tight mt-0.5">
                                            Hari ke-{activeHariKe}
                                        </p>
                                    </div>

                                    {/* Peringatan Istihadhah jika > 15 hari */}
                                    {isIstihadhah ? (
                                        <div className="rounded-2xl bg-amber-500/30 backdrop-blur-md border border-amber-300/40 p-3.5 text-xs text-amber-50 space-y-1">
                                            <div className="flex items-center gap-2 font-bold text-amber-200">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <span>Peringatan Fiqih: Darah Istihadhah</span>
                                            </div>
                                            <p className="leading-relaxed text-[11px] text-amber-100">
                                                Darah telah melampaui 15 hari (batas maksimal haid Madzhab Syafi'i).
                                                Darah setelah hari ke-15 terhitung <strong>Istihadhah</strong>.
                                                Santriwati wajib mandi besar dan kembali melaksanakan sholat.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-rose-100 leading-relaxed">
                                            Maksimal haid adalah 15 hari 15 malam. Segera mandi wajib begitu darah berhenti.
                                        </p>
                                    )}

                                    {/* Action Selesai Mandi */}
                                    <button
                                        onClick={() => {
                                            setTargetRecord(activeRecord);
                                            setShowSelesaiModal(true);
                                        }}
                                        className="w-full py-3 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-bold text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Sudah Suci (Catat Mandi Wajib)</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* SEDANG SUCI CARD */
                            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20">
                                            <span className="w-2 h-2 rounded-full bg-white"></span>
                                            Masa Suci
                                        </span>
                                        {masaSuciHari !== null && (
                                            <span className="text-xs text-emerald-100">
                                                Suci sejak {masaSuciHari} hari lalu
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs text-emerald-100 font-medium">
                                            Status Ibadah
                                        </p>
                                        <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                                            Wajib Sholat & Puasa
                                        </p>
                                        <p className="text-xs text-emerald-100 mt-1">
                                            Masa suci minimal antara dua haid adalah 15 hari.
                                        </p>
                                    </div>

                                    {/* Action Mulai Haid */}
                                    <button
                                        onClick={() => setShowMulaiModal(true)}
                                        className="w-full py-3 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                                    >
                                        <CalendarHeart className="w-4 h-4 text-rose-500" />
                                        <span>Mulai Haid (Darah Keluar)</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* RINGKASAN FIQIH RINGKAS */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Minimal Haid
                                </p>
                                <p className="text-sm font-bold text-slate-700 mt-0.5">
                                    24 Jam
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    1 hari 1 malam
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Maksimal Haid
                                </p>
                                <p className="text-sm font-bold text-rose-600 mt-0.5">
                                    15 Hari
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    15 hari 15 malam
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Minimal Suci
                                </p>
                                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                                    15 Hari
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    Antar dua haid
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Lebih 15 Hari
                                </p>
                                <p className="text-sm font-bold text-amber-600 mt-0.5">
                                    Istihadhah
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    Wajib mandi & sholat
                                </p>
                            </div>
                        </div>

                        {/* RIWAYAT SIKLUS SAYA */}
                        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-800">
                                    Riwayat Siklus Saya
                                </h3>
                                <span className="text-xs text-slate-400">
                                    {riwayat?.length || 0} Catatan
                                </span>
                            </div>

                            {riwayat?.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-10">
                                    Belum ada riwayat catatan haid.
                                </p>
                            ) : (
                                <div className="space-y-2.5">
                                    {riwayat?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-100 p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            item.status ===
                                                            "istihadhah"
                                                                ? "bg-amber-100 text-amber-700"
                                                                : item.tgl_selesai
                                                                  ? "bg-emerald-100 text-emerald-700"
                                                                  : "bg-rose-100 text-rose-700"
                                                        }`}
                                                    >
                                                        {item.status ===
                                                        "istihadhah"
                                                            ? "Istihadhah"
                                                            : item.tgl_selesai
                                                              ? "Selesai (Suci)"
                                                              : "Sedang Berlangsung"}
                                                    </span>
                                                    {item.durasi_hari && (
                                                        <span className="text-xs font-bold text-slate-700">
                                                            {item.durasi_hari}{" "}
                                                            Hari
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600">
                                                    {formatTglSingkat(
                                                        item.tgl_mulai
                                                    )}{" "}
                                                    s/d{" "}
                                                    {item.tgl_selesai
                                                        ? formatTglSingkat(
                                                              item.tgl_selesai
                                                          )
                                                        : "Sekarang"}
                                                </p>
                                                {item.catatan && (
                                                    <p className="text-[11px] text-slate-400 italic">
                                                        "{item.catatan}"
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleHapus(item.id)
                                                }
                                                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================= */}
                {/* 2. TAMPILAN KHUSUS ADMIN                  */}
                {/* ========================================= */}
                {isAdmin && (
                    <div className="space-y-6">
                        {/* Header Admin */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-1 border border-rose-100">
                                    <CalendarHeart className="w-3.5 h-3.5" />
                                    <span>Panel Pengurus / Admin</span>
                                </div>
                                <h1 className="text-xl font-extrabold text-slate-800">
                                    Buku Haid Santri Putri
                                </h1>
                                <p className="text-xs text-slate-400">
                                    Rekapitulasi santri berhalangan untuk
                                    ketertiban presensi sholat & puasa.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setFormMulai({
                                        santri_id:
                                            santriPutriList?.[0]?.id || "",
                                        tgl_mulai: new Date()
                                            .toISOString()
                                            .slice(0, 16),
                                        warna_darah: "Merah",
                                        catatan: "",
                                    });
                                    setShowMulaiModal(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold shadow-sm hover:opacity-95 active:scale-95 transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Input Catatan Santri</span>
                            </button>
                        </div>

                        {/* TAB NAVIGASI ADMIN */}
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <button
                                onClick={() => setAdminTab("aktif")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                    adminTab === "aktif"
                                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                                        : "text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Sedang Haid Hari Ini</span>
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
                                    {haidAktif?.length || 0}
                                </span>
                            </button>

                            <button
                                onClick={() => setAdminTab("riwayat")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                    adminTab === "riwayat"
                                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                                        : "text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Semua Riwayat</span>
                            </button>
                        </div>

                        {/* TAB 1: SANTRI SEDANG HAID HARI INI */}
                        {adminTab === "aktif" && (
                            <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-slate-800">
                                        Santri Putri Berhalangan Saat Ini
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        Total: {haidAktif?.length || 0} Santri
                                    </span>
                                </div>

                                {haidAktif?.length === 0 ? (
                                    <div className="text-center py-12 space-y-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                                        <p className="text-xs text-slate-500 font-semibold">
                                            Tidak ada santriwati yang tercatat sedang haid hari ini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {haidAktif?.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`rounded-2xl border p-4 transition space-y-3 ${
                                                    item.is_istihadhah
                                                        ? "border-amber-200 bg-amber-50/40"
                                                        : "border-rose-100 bg-rose-50/30"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-800">
                                                            {
                                                                item.santri
                                                                    ?.nama_lengkap
                                                            }
                                                        </h4>
                                                        <p className="text-[11px] text-slate-400 font-mono">
                                                            NIS:{" "}
                                                            {item.santri?.nis} •
                                                            Kamar:{" "}
                                                            {item.santri
                                                                ?.kamar || "-"}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                                            item.is_istihadhah
                                                                ? "bg-amber-100 text-amber-800"
                                                                : "bg-rose-100 text-rose-700"
                                                        }`}
                                                    >
                                                        Hari ke-{item.hari_ke}
                                                    </span>
                                                </div>

                                                <div className="text-[11px] text-slate-500 space-y-0.5">
                                                    <p>
                                                        Mulai:{" "}
                                                        <strong>
                                                            {formatTanggal(
                                                                item.tgl_mulai
                                                            )}
                                                        </strong>
                                                    </p>
                                                    {item.catatan && (
                                                        <p className="italic">
                                                            Catatan: "
                                                            {item.catatan}"
                                                        </p>
                                                    )}
                                                </div>

                                                {item.is_istihadhah && (
                                                    <p className="text-[10px] text-amber-700 font-semibold bg-amber-100/60 p-2 rounded-xl">
                                                        ⚠️ Lewat 15 hari (Istihadhah). Santri wajib mandi & sholat.
                                                    </p>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setTargetRecord(item);
                                                        setShowSelesaiModal(
                                                            true
                                                        );
                                                    }}
                                                    className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>
                                                        Tutup / Catat Suci
                                                    </span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: SEMUA RIWAYAT */}
                        {adminTab === "riwayat" && (
                            <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-4">
                                {/* Search Bar */}
                                <form
                                    onSubmit={handleSearch}
                                    className="flex gap-2"
                                >
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari nama santri atau NIS..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-2xl text-xs outline-none focus:border-rose-400"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-slate-800 text-white rounded-2xl text-xs font-semibold hover:bg-slate-700"
                                    >
                                        Cari
                                    </button>
                                </form>

                                {/* Tabel Riwayat */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                                                <th className="py-2.5 px-3">
                                                    Santriwati
                                                </th>
                                                <th className="py-2.5 px-3">
                                                    Mulai
                                                </th>
                                                <th className="py-2.5 px-3">
                                                    Selesai
                                                </th>
                                                <th className="py-2.5 px-3">
                                                    Durasi
                                                </th>
                                                <th className="py-2.5 px-3">
                                                    Status
                                                </th>
                                                <th className="py-2.5 px-3 text-right">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {riwayat?.data?.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50/50"
                                                >
                                                    <td className="py-3 px-3">
                                                        <p className="font-bold text-slate-800">
                                                            {
                                                                item.santri
                                                                    ?.nama_lengkap
                                                            }
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-mono">
                                                            {item.santri?.nis}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600">
                                                        {formatTanggal(
                                                            item.tgl_mulai
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600">
                                                        {formatTanggal(
                                                            item.tgl_selesai
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 font-semibold text-slate-700">
                                                        {item.durasi_hari
                                                            ? `${item.durasi_hari} Hari`
                                                            : "Berjalan"}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                item.status ===
                                                                "istihadhah"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : item.tgl_selesai
                                                                      ? "bg-emerald-100 text-emerald-700"
                                                                      : "bg-rose-100 text-rose-700"
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        <button
                                                            onClick={() =>
                                                                handleHapus(
                                                                    item.id
                                                                )
                                                            }
                                                            className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {riwayat?.data?.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="text-center py-8 text-slate-400"
                                                    >
                                                        Tidak ada data riwayat.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================= */}
                {/* MODAL: MULAI HAID                         */}
                {/* ========================================= */}
                {showMulaiModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setShowMulaiModal(false)}
                        ></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-rose-100 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                    <CalendarHeart className="w-4 h-4 text-rose-500" />
                                    <span>Catat Mulai Keluar Darah</span>
                                </h3>
                                <button
                                    onClick={() => setShowMulaiModal(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleMulai} className="space-y-3.5">
                                {/* Pilihan Santri (Jika Admin) */}
                                {isAdmin && (
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                            Pilih Santriwati
                                        </label>
                                        <select
                                            value={formMulai.santri_id}
                                            onChange={(e) =>
                                                setFormMulai({
                                                    ...formMulai,
                                                    santri_id: e.target.value,
                                                })
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none bg-white"
                                            required
                                        >
                                            <option value="">-- Pilih Santri --</option>
                                            {santriPutriList?.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nama_lengkap} ({s.nis})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Tanggal & Jam Mulai Keluar Darah
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formMulai.tgl_mulai}
                                        onChange={(e) =>
                                            setFormMulai({
                                                ...formMulai,
                                                tgl_mulai: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Sifat / Warna Darah (Opsional)
                                    </label>
                                    <select
                                        value={formMulai.warna_darah}
                                        onChange={(e) =>
                                            setFormMulai({
                                                ...formMulai,
                                                warna_darah: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none bg-white"
                                    >
                                        <option value="Hitam">Hitam (Kuat)</option>
                                        <option value="Merah">Merah</option>
                                        <option value="Merah Muda">Merah Muda</option>
                                        <option value="Cokelat">Cokelat</option>
                                        <option value="Kuning/Keruh">Kuning / Keruh</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Catatan / Keluhan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Nyeri perut, darah sedikit, dll."
                                        value={formMulai.catatan}
                                        onChange={(e) =>
                                            setFormMulai({
                                                ...formMulai,
                                                catatan: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMulaiModal(false)}
                                        className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl text-xs font-semibold shadow-sm hover:opacity-95"
                                    >
                                        Simpan Catatan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================= */}
                {/* MODAL: SELESAI HAID                       */}
                {/* ========================================= */}
                {showSelesaiModal && targetRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setShowSelesaiModal(false)}
                        ></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-emerald-100 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Konfirmasi Mandi Wajib (Suci)</span>
                                </h3>
                                <button
                                    onClick={() => setShowSelesaiModal(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleSelesai} className="space-y-3.5">
                                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
                                    <p className="font-bold">
                                        Mulai Haid: {formatTanggal(targetRecord.tgl_mulai)}
                                    </p>
                                    <p className="text-[11px] text-emerald-700">
                                        Pastikan darah telah benar-benar berhenti (putih bersih/kering) sebelum mandi besar.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Tanggal & Jam Selesai Mandi Wajib
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formSelesai.tgl_selesai}
                                        onChange={(e) =>
                                            setFormSelesai({
                                                ...formSelesai,
                                                tgl_selesai: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSelesaiModal(false)}
                                        className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-xs font-semibold shadow-sm hover:opacity-95"
                                    >
                                        Simpan & Bersuci
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
