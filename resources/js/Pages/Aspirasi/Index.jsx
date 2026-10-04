import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import {
    MessageSquareQuote,
    Send,
    User,
    UserX,
    Clock,
    CheckCircle2,
    Hourglass,
    Trash2,
    Search,
    MessageCircle,
    Inbox,
} from "lucide-react";

export default function Index() {
    const { isAdmin, santri, riwayat, aspirasiList, stats, filters } =
        usePage().props;

    // State Santri Form
    const [form, setForm] = useState({
        pesan: "",
        is_anonim: false,
    });
    const [submitting, setSubmitting] = useState(false);

    // State Admin
    const [statusFilter, setStatusFilter] = useState(filters?.status || "semua");
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [selectedAspirasi, setSelectedAspirasi] = useState(null);
    const [modalTanggapi, setModalTanggapi] = useState(false);
    const [formTanggapan, setFormTanggapan] = useState({
        status: "diterima",
        tanggapan: "",
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

    // Submit Santri
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post("/aspirasi", form, {
            onSuccess: () => {
                toast.success("Aspirasi Anda berhasil dikirim dan langsung diterima pengurus.");
                setForm({ pesan: "", is_anonim: false });
                setSubmitting(false);
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || "Gagal mengirim aspirasi.";
                toast.error(msg);
                setSubmitting(false);
            },
        });
    };

    // Submit Tanggapan Admin
    const handleTanggapi = (e) => {
        e.preventDefault();
        if (!selectedAspirasi) return;
        router.put(`/aspirasi/${selectedAspirasi.id}/tanggapi`, formTanggapan, {
            onSuccess: () => {
                toast.success("Tanggapan dan status berhasil diperbarui.");
                setModalTanggapi(false);
                setSelectedAspirasi(null);
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || "Gagal memperbarui tanggapan.";
                toast.error(msg);
            },
        });
    };

    // Hapus Aspirasi
    const handleHapus = (id) => {
        if (confirm("Hapus aspirasi ini?")) {
            router.delete(`/aspirasi/${id}`, {
                onSuccess: () => toast.success("Aspirasi berhasil dihapus."),
                onError: () => toast.error("Gagal menghapus."),
            });
        }
    };

    // Filter Admin
    const handleFilter = (status) => {
        setStatusFilter(status);
        router.get(
            "/aspirasi",
            { status: status === "semua" ? "" : status, search: searchQuery },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/aspirasi",
            { status: statusFilter === "semua" ? "" : statusFilter, search: searchQuery },
            { preserveState: true, replace: true }
        );
    };

    // Render Badge Status
    const renderBadgeStatus = (status) => {
        if (status === "diproses") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Hourglass className="w-3 h-3" />
                    <span>Sedang Diproses</span>
                </span>
            );
        }
        if (status === "selesai") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Selesai Ditangani</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#3D7ABA] border border-sky-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Langsung Diterima</span>
            </span>
        );
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* Header Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-[#3D7ABA] via-[#2A65A5] to-[#20B5E8] p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-2 border border-white/20">
                            <MessageSquareQuote className="w-3.5 h-3.5" />
                            <span>Kotak Suara Santri</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight">
                            Kotak Aspirasi & Masukan
                        </h1>
                        <p className="text-xs text-sky-100 max-w-md leading-relaxed">
                            Saluran resmi santri untuk menyampaikan saran, ide, kritik membangun,
                            dan keluhan demi kebaikan bersama di Pondok Pesantren Al-Amanah.
                        </p>
                    </div>
                </div>

                {/* ================================================= */}
                {/* 1. TAMPILAN SANTRI (FORM 2 KOLOM + ANONYMOUS)     */}
                {/* ================================================= */}
                {!isAdmin && (
                    <div className="space-y-6">
                        {/* FORM ASPIRASI SANTRI */}
                        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm space-y-4">
                            <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                <Send className="w-4 h-4 text-[#3D7ABA]" />
                                <span>Kirim Suara / Masukan Anda</span>
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Field 1: Nama Pengirim */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Nama Pengirim
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={
                                                form.is_anonim
                                                    ? "Anonim (Nama Anda Disamarkan)"
                                                    : santri?.nama_lengkap || "Santri"
                                            }
                                            className={`w-full border rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold select-none ${
                                                form.is_anonim
                                                    ? "bg-slate-100 text-slate-500 border-slate-200 italic"
                                                    : "bg-slate-50 text-slate-700 border-slate-200"
                                            }`}
                                        />
                                        <div className="absolute left-3 top-3 text-slate-400">
                                            {form.is_anonim ? (
                                                <UserX className="w-4 h-4 text-slate-500" />
                                            ) : (
                                                <User className="w-4 h-4 text-[#3D7ABA]" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Checkbox Anonim */}
                                    <label className="mt-2.5 inline-flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={form.is_anonim}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    is_anonim: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 rounded text-[#3D7ABA] focus:ring-[#3D7ABA] border-slate-300"
                                        />
                                        <span className="text-xs text-slate-600 font-medium">
                                            Kirim sebagai <strong>Anonim</strong> (Rahasiakan nama saya dari pengurus)
                                        </span>
                                    </label>
                                </div>

                                {/* Field 2: Pesan Aspirasi */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Pesan Aspirasi / Saran / Keluhan
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Tuliskan pesan Anda di sini secara santun dan jelas..."
                                        value={form.pesan}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                pesan: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#3D7ABA] transition leading-relaxed"
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting || !form.pesan.trim()}
                                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>
                                        {submitting
                                            ? "Mengirim..."
                                            : "Kirim Aspirasi (Langsung Diterima)"}
                                    </span>
                                </button>
                            </form>
                        </div>

                        {/* RIWAYAT ASPIRASI SAYA */}
                        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-800">
                                    Riwayat Suara Saya
                                </h3>
                                <span className="text-xs text-slate-400">
                                    {riwayat?.length || 0} Terkirim
                                </span>
                            </div>

                            {riwayat?.length === 0 ? (
                                <div className="text-center py-10 space-y-2">
                                    <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                                    <p className="text-xs text-slate-400">
                                        Anda belum pernah mengirim aspirasi.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {riwayat?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-100 p-4 space-y-2.5 hover:bg-slate-50/50 transition"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {item.is_anonim
                                                            ? "Dikirim Anonim"
                                                            : item.nama_pengirim}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        &bull; {formatTanggal(item.created_at)}
                                                    </span>
                                                </div>
                                                {renderBadgeStatus(item.status)}
                                            </div>

                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {item.pesan}
                                            </p>

                                            {/* Tanggapan Pengurus jika ada */}
                                            {item.tanggapan ? (
                                                <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs space-y-1">
                                                    <div className="flex items-center gap-1.5 font-bold text-[#3D7ABA] text-[11px]">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        <span>Tanggapan Pengurus:</span>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed pl-5 whitespace-pre-wrap">
                                                        {item.tanggapan}
                                                    </p>
                                                    {item.tgl_tanggapan && (
                                                        <p className="text-[10px] text-slate-400 pl-5">
                                                            Dibalas pada: {formatTanggal(item.tgl_tanggapan)}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-slate-400 italic">
                                                    Menunggu tindak lanjut dari pengurus...
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================================================= */}
                {/* 2. TAMPILAN ADMIN (MANAJEMEN KOTAK SUARA)         */}
                {/* ================================================= */}
                {isAdmin && (
                    <div className="space-y-6">
                        {/* KARTU STATISTIK ADMIN */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Total Aspirasi
                                </p>
                                <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                                    {stats?.total || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Diterima
                                </p>
                                <p className="text-lg font-extrabold text-[#3D7ABA] mt-0.5">
                                    {stats?.diterima || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Diproses
                                </p>
                                <p className="text-lg font-extrabold text-amber-600 mt-0.5">
                                    {stats?.diproses || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-xs">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Selesai
                                </p>
                                <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                                    {stats?.selesai || 0}
                                </p>
                            </div>
                        </div>

                        {/* FILTER & PENCARIAN */}
                        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                {/* Tabs Status Filter */}
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {[
                                        { key: "semua", label: "Semua" },
                                        { key: "diterima", label: "Diterima" },
                                        { key: "diproses", label: "Diproses" },
                                        { key: "selesai", label: "Selesai" },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleFilter(tab.key)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                                statusFilter === tab.key
                                                    ? "bg-[#3D7ABA] text-white shadow-xs"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Search Input */}
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative flex-1 sm:w-60">
                                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari pesan / nama..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3D7ABA]"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
                                    >
                                        Cari
                                    </button>
                                </form>
                            </div>

                            {/* DAFTAR ASPIRASI ADMIN */}
                            <div className="space-y-3 pt-2">
                                {aspirasiList?.data?.length === 0 ? (
                                    <div className="text-center py-12 space-y-2">
                                        <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                                        <p className="text-xs text-slate-400">
                                            Tidak ada aspirasi pada filter ini.
                                        </p>
                                    </div>
                                ) : (
                                    aspirasiList?.data?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-100 p-4 space-y-3 hover:bg-slate-50/50 transition"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`font-bold text-xs ${
                                                                item.is_anonim
                                                                    ? "text-slate-500 italic"
                                                                    : "text-slate-800"
                                                            }`}
                                                        >
                                                            {item.nama_pengirim}
                                                        </span>
                                                        {item.is_anonim && (
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                                                                Anonim
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            &bull; {formatTanggal(item.created_at)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {renderBadgeStatus(item.status)}
                                                    <button
                                                        onClick={() => handleHapus(item.id)}
                                                        className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Pesan Santri */}
                                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                                "{item.pesan}"
                                            </p>

                                            {/* Tanggapan Pengurus jika sudah ada */}
                                            {item.tanggapan && (
                                                <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs space-y-1">
                                                    <div className="flex items-center gap-1.5 font-bold text-[#3D7ABA] text-[11px]">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        <span>Tanggapan Resmi Pengurus:</span>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed pl-5 whitespace-pre-wrap">
                                                        {item.tanggapan}
                                                    </p>
                                                    {item.tgl_tanggapan && (
                                                        <p className="text-[10px] text-slate-400 pl-5">
                                                            Dibalas pada: {formatTanggal(item.tgl_tanggapan)}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Tombol Tanggapi / Update Status */}
                                            <div className="pt-1 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAspirasi(item);
                                                        setFormTanggapan({
                                                            status: item.status,
                                                            tanggapan: item.tanggapan || "",
                                                        });
                                                        setModalTanggapi(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5 text-[#3D7ABA]" />
                                                    <span>
                                                        {item.tanggapan
                                                            ? "Edit Tanggapan / Status"
                                                            : "Beri Tanggapan / Proses"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================================================= */}
                {/* MODAL TANGGAPAN ADMIN                             */}
                {/* ================================================= */}
                {modalTanggapi && selectedAspirasi && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setModalTanggapi(false)}
                        ></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-sky-100 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                    <MessageSquareQuote className="w-4 h-4 text-[#3D7ABA]" />
                                    <span>Tindak Lanjut Aspirasi</span>
                                </h3>
                                <button
                                    onClick={() => setModalTanggapi(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Ringkasan Aspirasi */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                                <p className="font-bold text-slate-700">
                                    Dari: {selectedAspirasi.nama_pengirim}
                                </p>
                                <p className="text-slate-600 italic">
                                    "{selectedAspirasi.pesan}"
                                </p>
                            </div>

                            <form onSubmit={handleTanggapi} className="space-y-3.5">
                                {/* Pilihan Status */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Perbarui Status
                                    </label>
                                    <select
                                        value={formTanggapan.status}
                                        onChange={(e) =>
                                            setFormTanggapan({
                                                ...formTanggapan,
                                                status: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none bg-white font-semibold"
                                    >
                                        <option value="diterima">Langsung Diterima</option>
                                        <option value="diproses">Sedang Diproses</option>
                                        <option value="selesai">Selesai Ditangani</option>
                                    </select>
                                </div>

                                {/* Textarea Balasan */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Pesan Balasan / Solusi Pengurus (Opsional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tuliskan respon resmi pengurus untuk santri..."
                                        value={formTanggapan.tanggapan}
                                        onChange={(e) =>
                                            setFormTanggapan({
                                                ...formTanggapan,
                                                tanggapan: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-[#3D7ABA] transition"
                                    ></textarea>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalTanggapi(false)}
                                        className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white rounded-2xl text-xs font-semibold shadow-sm hover:opacity-95"
                                    >
                                        Simpan Tanggapan
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
