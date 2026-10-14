import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import {
    MessageSquareQuote,
    Send,
    User,
    UserX,
    Hourglass,
    CheckCircle2,
    Trash2,
    Search,
    MessageCircle,
    Inbox,
    X,
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
    const [statusFilter, setStatusFilter] = useState(
        filters?.status || "semua",
    );
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
                toast.success("Aspirasi Anda berhasil dikirim!");
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
                const msg =
                    Object.values(err)[0] || "Gagal memperbarui tanggapan.";
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
            { preserveState: true, replace: true },
        );
    };

    // Render Badge Status
    const renderBadgeStatus = (status) => {
        if (status === "diproses") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                    <Hourglass className="w-3 h-3" />
                    <span>Diproses</span>
                </span>
            );
        }
        if (status === "selesai") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Selesai</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#3D7ABA]/10 text-[#3D7ABA] border border-[#3D7ABA]/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Diterima</span>
            </span>
        );
    };

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-5 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Kotak Aspirasi
                    </h2>
                </div>

                {/* ================================================= */}
                {/* 1. TAMPILAN SANTRI                                */}
                {/* ================================================= */}
                {!isAdmin && (
                    <>
                        {/* Form Kirim Aspirasi */}
                        <div className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#3D7ABA] to-[#20B5E8] rounded-full flex items-center justify-center shadow-sm">
                                    <Send className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-800">
                                    Kirim Aspirasi / Masukan Anda
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Nama Pengirim */}
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
                                                    ? "Anonim (Nama Disamarkan)"
                                                    : santri?.nama_lengkap ||
                                                      "Santri"
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
                                            Kirim sebagai{" "}
                                            <strong>Anonim</strong>
                                        </span>
                                    </label>
                                </div>

                                {/* Pesan */}
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
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#20B5E8] transition leading-relaxed resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !form.pesan.trim()}
                                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white font-semibold text-xs shadow-lg hover:opacity-95 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>
                                        {submitting
                                            ? "Mengirim..."
                                            : "Kirim Aspirasi"}
                                    </span>
                                </button>
                            </form>
                        </div>

                        {/* Riwayat Aspirasi Saya */}
                        <div className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-slate-800">
                                    Riwayat Aspirasi Saya
                                </h3>
                                <span className="text-xs text-slate-400">
                                    {riwayat?.length || 0} Terkirim
                                </span>
                            </div>

                            {riwayat?.length === 0 ? (
                                <div className="text-center py-10 space-y-2">
                                    <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                                    <p className="text-xs text-slate-400 font-semibold">
                                        Anda belum pernah mengirim aspirasi
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {riwayat?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-slate-100 p-4 space-y-2.5 hover:shadow-sm transition"
                                        >
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {item.is_anonim
                                                        ? "Dikirim Anonim"
                                                        : item.nama_pengirim}
                                                </span>
                                                {renderBadgeStatus(item.status)}
                                            </div>

                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {item.pesan}
                                            </p>

                                            <p className="text-[10px] text-slate-400 font-mono">
                                                {formatTanggal(item.created_at)}
                                            </p>

                                            {item.tanggapan ? (
                                                <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs space-y-1">
                                                    <div className="flex items-center gap-1.5 font-bold text-[#3D7ABA] text-[11px]">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        <span>
                                                            Tanggapan Pengurus
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed pl-5 whitespace-pre-wrap">
                                                        {item.tanggapan}
                                                    </p>
                                                    {item.tgl_tanggapan && (
                                                        <p className="text-[10px] text-slate-400 pl-5">
                                                            Dibalas:{" "}
                                                            {formatTanggal(
                                                                item.tgl_tanggapan,
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-slate-400 italic">
                                                    Menunggu tindak lanjut...
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ================================================= */}
                {/* 2. TAMPILAN ADMIN                                 */}
                {/* ================================================= */}
                {isAdmin && (
                    <>
                        {/* Statistik */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Total
                                </p>
                                <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                                    {stats?.total || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Diterima
                                </p>
                                <p className="text-lg font-extrabold text-[#3D7ABA] mt-0.5">
                                    {stats?.diterima || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Diproses
                                </p>
                                <p className="text-lg font-extrabold text-amber-600 mt-0.5">
                                    {stats?.diproses || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    Selesai
                                </p>
                                <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                                    {stats?.selesai || 0}
                                </p>
                            </div>
                        </div>

                        {/* Filter Tab */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[
                                { key: "semua", label: "Semua" },
                                { key: "diterima", label: "Diterima" },
                                { key: "diproses", label: "Diproses" },
                                { key: "selesai", label: "Selesai" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleFilter(tab.key)}
                                    className={`py-2 rounded-full text-xs font-semibold transition ${
                                        statusFilter === tab.key
                                            ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg"
                                            : "bg-white border border-slate-200 text-slate-500"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari pesan atau nama pengirim..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            router.get(
                                                "/aspirasi",
                                                {
                                                    status:
                                                        statusFilter === "semua"
                                                            ? ""
                                                            : statusFilter,
                                                    search: searchQuery,
                                                },
                                                {
                                                    preserveState: true,
                                                    replace: true,
                                                },
                                            );
                                        }
                                    }}
                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#20B5E8]"
                                />
                            </div>
                        </div>

                        {/* Daftar Aspirasi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {aspirasiList?.data?.length === 0 && (
                                <div className="text-center py-16 md:col-span-2 space-y-2">
                                    <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                                    <p className="text-xs text-slate-400 font-semibold">
                                        Tidak ada aspirasi pada filter ini
                                    </p>
                                </div>
                            )}
                            {aspirasiList?.data?.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-gradient-to-br from-[#3D7ABA] to-[#20B5E8] rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                {item.is_anonim
                                                    ? "?"
                                                    : item.nama_pengirim?.charAt(
                                                          0,
                                                      )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-semibold text-sm break-words ${
                                                        item.is_anonim
                                                            ? "text-slate-500 italic"
                                                            : "text-slate-800"
                                                    }`}
                                                >
                                                    {item.nama_pengirim}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {formatTanggal(
                                                        item.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {renderBadgeStatus(item.status)}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        "{item.pesan}"
                                    </p>

                                    {item.tanggapan && (
                                        <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold text-[#3D7ABA] text-[11px]">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>Tanggapan Pengurus</span>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed pl-5 whitespace-pre-wrap">
                                                {item.tanggapan}
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedAspirasi(item);
                                                setFormTanggapan({
                                                    status: item.status,
                                                    tanggapan:
                                                        item.tanggapan || "",
                                                });
                                                setModalTanggapi(true);
                                            }}
                                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-1.5 transition"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>
                                                {item.tanggapan
                                                    ? "Edit Tanggapan"
                                                    : "Beri Tanggapan"}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleHapus(item.id)}
                                            className="px-3 py-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ================================================= */}
                {/* MODAL TANGGAPAN ADMIN                             */}
                {/* ================================================= */}
                {modalTanggapi && selectedAspirasi && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setModalTanggapi(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <MessageSquareQuote className="w-5 h-5 text-[#3D7ABA]" />
                                    Tindak Lanjut
                                </h3>
                                <button
                                    onClick={() => setModalTanggapi(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                                <p className="font-bold text-slate-700">
                                    Dari: {selectedAspirasi.nama_pengirim}
                                </p>
                                <p className="text-slate-600 italic">
                                    "{selectedAspirasi.pesan}"
                                </p>
                            </div>

                            <form
                                onSubmit={handleTanggapi}
                                className="space-y-3"
                            >
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
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none font-semibold"
                                    >
                                        <option value="diterima">
                                            Diterima
                                        </option>
                                        <option value="diproses">
                                            Diproses
                                        </option>
                                        <option value="selesai">Selesai</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                        Tanggapan / Solusi (Opsional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tuliskan respon resmi pengurus..."
                                        value={formTanggapan.tanggapan}
                                        onChange={(e) =>
                                            setFormTanggapan({
                                                ...formTanggapan,
                                                tanggapan: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-[#20B5E8] resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalTanggapi(false)}
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
