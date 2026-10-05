import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import { Plus, X, Search, Trash2, Check } from "lucide-react";

export default function Index() {
    const {
        isAdmin,
        activeRecord,
        activeHariKe,
        isIstihadhah,
        masaSuciHari,
        riwayat,
        haidAktif,
        santriPutriList,
        filters,
    } = usePage().props;

    const [adminTab, setAdminTab] = useState("aktif");
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");

    const [showMulaiModal, setShowMulaiModal] = useState(false);
    const [showSelesaiModal, setShowSelesaiModal] = useState(false);
    const [targetRecord, setTargetRecord] = useState(null);

    const [formMulai, setFormMulai] = useState({
        santri_id: "",
        tgl_mulai: new Date().toISOString().slice(0, 16),
        warna_darah: "Merah",
        catatan: "",
    });

    const [formSelesai, setFormSelesai] = useState({
        tgl_selesai: new Date().toISOString().slice(0, 16),
    });

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

    const handleHapus = (id) => {
        if (confirm("Hapus catatan haid ini?")) {
            router.delete(`/haid/${id}`, {
                onSuccess: () => toast.success("Catatan berhasil dihapus."),
                onError: () => toast.error("Gagal menghapus."),
            });
        }
    };

    const openMulaiModal = (santriId = "") => {
        setFormMulai({
            santri_id: santriId,
            tgl_mulai: new Date().toISOString().slice(0, 16),
            warna_darah: "Merah",
            catatan: "",
        });
        setShowMulaiModal(true);
    };

    const openSelesaiModal = (record) => {
        setTargetRecord(record);
        setFormSelesai({
            tgl_selesai: new Date().toISOString().slice(0, 16),
        });
        setShowSelesaiModal(true);
    };

    // Filter riwayat berdasarkan search
    const filteredRiwayat = (riwayat?.data || []).filter(
        (item) =>
            item.santri?.nama_lengkap
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            item.santri?.nis?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-5 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Buku Haid
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={() => openMulaiModal()}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            Input
                        </button>
                    )}
                </div>

                {/* ========================================= */}
                {/* 1. TAMPILAN SANTRI                        */}
                {/* ========================================= */}
                {!isAdmin && (
                    <>
                        {/* Status Hero Card */}
                        {activeRecord ? (
                            <div className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                        Sedang Berhalangan
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        Mulai:{" "}
                                        {formatTanggal(activeRecord.tgl_mulai)}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-[11px] text-slate-400">
                                        Durasi Haid Berjalan
                                    </p>
                                    <p className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
                                        Hari ke-{activeHariKe}
                                    </p>
                                </div>

                                {isIstihadhah ? (
                                    <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 space-y-1">
                                        <p className="font-bold">
                                            ⚠️ Peringatan Fiqih: Istihadhah
                                        </p>
                                        <p className="text-[11px] leading-relaxed">
                                            Darah telah melampaui 15 hari (batas
                                            maksimal haid Madzhab Syafi'i).
                                            Wajib mandi besar dan kembali
                                            sholat.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Maksimal haid adalah 15 hari 15 malam.
                                        Segera mandi wajib begitu darah
                                        berhenti.
                                    </p>
                                )}

                                <button
                                    onClick={() =>
                                        openSelesaiModal(activeRecord)
                                    }
                                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white font-semibold text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Sudah Suci (Catat Mandi Wajib)
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Masa Suci
                                    </span>
                                    {masaSuciHari !== null && (
                                        <span className="text-[11px] text-slate-400">
                                            Suci sejak {masaSuciHari} hari lalu
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[11px] text-slate-400">
                                        Status Ibadah
                                    </p>
                                    <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">
                                        Wajib Sholat & Puasa
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Masa suci minimal antara dua haid adalah
                                        15 hari.
                                    </p>
                                </div>

                                <button
                                    onClick={() => openMulaiModal()}
                                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                                >
                                    Input Haid
                                </button>
                            </div>
                        )}

                        {/* Ringkasan Fiqih */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
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

                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
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

                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
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

                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
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

                        {/* Riwayat Siklus Saya */}
                        <div className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-800">
                                    Riwayat Siklus Saya
                                </h3>
                                <span className="text-xs text-slate-400">
                                    {riwayat?.length || 0} Catatan
                                </span>
                            </div>

                            {riwayat?.length === 0 ? (
                                <div className="text-center py-10 space-y-2">
                                    <CalendarHeart className="w-10 h-10 text-slate-300 mx-auto" />
                                    <p className="text-xs text-slate-400 font-semibold">
                                        Belum ada riwayat catatan haid
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {riwayat?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-sky-100 p-4 flex items-start justify-between gap-3 hover:shadow-sm transition"
                                        >
                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                            item.status ===
                                                            "istihadhah"
                                                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                                : item.tgl_selesai
                                                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                  : "bg-rose-50 text-rose-600 border border-rose-100"
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

                                                <div className="text-[11px] text-slate-500 space-y-0.5">
                                                    <Row
                                                        label="Mulai"
                                                        value={formatTglSingkat(
                                                            item.tgl_mulai,
                                                        )}
                                                    />
                                                    <Row
                                                        label="Selesai"
                                                        value={
                                                            item.tgl_selesai
                                                                ? formatTglSingkat(
                                                                      item.tgl_selesai,
                                                                  )
                                                                : "Sekarang"
                                                        }
                                                    />
                                                    {item.catatan && (
                                                        <Row
                                                            label="Catatan"
                                                            value={item.catatan}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleHapus(item.id)
                                                }
                                                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition shrink-0"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ========================================= */}
                {/* 2. TAMPILAN ADMIN                         */}
                {/* ========================================= */}
                {isAdmin && (
                    <>
                        {/* Tab */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                onClick={() => setAdminTab("aktif")}
                                className={`py-2 rounded-full text-xs font-semibold transition ${
                                    adminTab === "aktif"
                                        ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg"
                                        : "bg-white border border-slate-200 text-slate-500"
                                }`}
                            >
                                Sedang Haid ({haidAktif?.length || 0})
                            </button>
                            <button
                                onClick={() => setAdminTab("riwayat")}
                                className={`py-2 rounded-full text-xs font-semibold transition ${
                                    adminTab === "riwayat"
                                        ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg"
                                        : "bg-white border border-slate-200 text-slate-500"
                                }`}
                            >
                                Semua Riwayat
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau NIS santri..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* TAB 1: SEDANG HAID */}
                        {adminTab === "aktif" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {haidAktif?.length === 0 && (
                                    <p className="text-center text-slate-400 py-10 md:col-span-2">
                                        Tidak ada yang haid hari ini
                                    </p>
                                )}
                                {haidAktif?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2 gap-2">
                                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                    {item.santri?.nama_lengkap?.charAt(
                                                        0,
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm break-words">
                                                        {
                                                            item.santri
                                                                ?.nama_lengkap
                                                        }
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {item.santri?.nis} •{" "}
                                                        {item.santri?.kamar ||
                                                            "-"}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${
                                                    item.is_istihadhah
                                                        ? "bg-amber-50 text-amber-600"
                                                        : "bg-rose-50 text-rose-600"
                                                }`}
                                            >
                                                Hari ke-{item.hari_ke}
                                            </span>
                                        </div>

                                        <div className="text-[11px] text-slate-500 space-y-0.5 mb-3">
                                            <Row
                                                label="Mulai"
                                                value={formatTanggal(
                                                    item.tgl_mulai,
                                                )}
                                            />
                                            {item.catatan && (
                                                <Row
                                                    label="Catatan"
                                                    value={item.catatan}
                                                />
                                            )}
                                        </div>

                                        {item.is_istihadhah && (
                                            <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-xl mb-3">
                                                ⚠️ Lewat 15 hari (Istihadhah).
                                                Santri wajib mandi & sholat.
                                            </div>
                                        )}

                                        <button
                                            onClick={() =>
                                                openSelesaiModal(item)
                                            }
                                            className="w-full py-2 rounded-xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-1.5 transition"
                                        >
                                            Sudah Suci
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TAB 2: SEMUA RIWAYAT */}
                        {adminTab === "riwayat" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredRiwayat.length === 0 && (
                                    <p className="text-center text-slate-400 py-10 md:col-span-2">
                                        Tidak ada data riwayat
                                    </p>
                                )}
                                {filteredRiwayat.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2 gap-2">
                                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                    {item.santri?.nama_lengkap?.charAt(
                                                        0,
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm break-words">
                                                        {
                                                            item.santri
                                                                ?.nama_lengkap
                                                        }
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {item.santri?.nis}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${
                                                    item.status === "istihadhah"
                                                        ? "bg-amber-50 text-amber-600"
                                                        : item.tgl_selesai
                                                          ? "bg-emerald-50 text-emerald-600"
                                                          : "bg-rose-50 text-rose-600"
                                                }`}
                                            >
                                                {item.status === "istihadhah"
                                                    ? "Istihadhah"
                                                    : item.tgl_selesai
                                                      ? "Selesai"
                                                      : "Berlangsung"}
                                            </span>
                                        </div>

                                        <div className="text-[11px] text-slate-500 space-y-0.5 mb-3">
                                            <Row
                                                label="Mulai"
                                                value={formatTglSingkat(
                                                    item.tgl_mulai,
                                                )}
                                            />
                                            <Row
                                                label="Selesai"
                                                value={
                                                    item.tgl_selesai
                                                        ? formatTglSingkat(
                                                              item.tgl_selesai,
                                                          )
                                                        : "-"
                                                }
                                            />
                                            <Row
                                                label="Durasi"
                                                value={
                                                    item.durasi_hari
                                                        ? `${item.durasi_hari} Hari`
                                                        : "Berjalan"
                                                }
                                            />
                                        </div>

                                        <div className="pt-3 border-t border-slate-100">
                                            <button
                                                onClick={() =>
                                                    handleHapus(item.id)
                                                }
                                                className="w-full py-1.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Hapus Catatan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ========================================= */}
                {/* MODAL: MULAI HAID                         */}
                {/* ========================================= */}
                {showMulaiModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowMulaiModal(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    Catat Mulai Haid
                                </h3>
                                <button
                                    onClick={() => setShowMulaiModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleMulai} className="space-y-3">
                                {isAdmin && (
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                            Pilih Santri
                                        </label>
                                        <select
                                            value={formMulai.santri_id}
                                            onChange={(e) =>
                                                setFormMulai({
                                                    ...formMulai,
                                                    santri_id: e.target.value,
                                                })
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                            required
                                        >
                                            <option value="">
                                                Pilih Santri
                                            </option>
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
                                        Tanggal & Jam Mulai
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
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Warna Darah (Opsional)
                                    </label>
                                    <select
                                        value={formMulai.warna_darah}
                                        onChange={(e) =>
                                            setFormMulai({
                                                ...formMulai,
                                                warna_darah: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    >
                                        <option value="Hitam">
                                            Hitam (Kuat)
                                        </option>
                                        <option value="Merah">Merah</option>
                                        <option value="Merah Muda">
                                            Merah Muda
                                        </option>
                                        <option value="Cokelat">Cokelat</option>
                                        <option value="Kuning/Keruh">
                                            Kuning / Keruh
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Catatan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nyeri perut, darah sedikit, dll."
                                        value={formMulai.catatan}
                                        onChange={(e) =>
                                            setFormMulai({
                                                ...formMulai,
                                                catatan: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMulaiModal(false)}
                                        className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        Simpan
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
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowSelesaiModal(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    Konfirmasi Suci
                                </h3>
                                <button
                                    onClick={() => setShowSelesaiModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSelesai}
                                className="space-y-3"
                            >
                                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-slate-700 space-y-1 text-center">
                                    <p className="font-bold text-[#3D7ABA]">
                                        Mulai Haid{" "}
                                        {formatTanggal(targetRecord.tgl_mulai)}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Pastikan darah telah benar-benar
                                        berhenti sebelum mandi besar.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Tanggal & Jam Selesai
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
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowSelesaiModal(false)
                                        }
                                        className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        Simpan
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

const Row = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-slate-400 shrink-0">{label}</span>
        <span className="font-medium text-slate-600 text-right ml-4">
            {value || "-"}
        </span>
    </div>
);
