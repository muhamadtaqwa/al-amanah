import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Plus, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Index() {
    const { izins, bulan, tahun, role, auth } = usePage().props;
    const [showPopup, setShowPopup] = useState(false);
    const [form, setForm] = useState({
        tanggal: new Date().toISOString().slice(0, 10),
        tanggal_selesai: new Date().toISOString().slice(0, 10),
        keterangan: "",
    });

    const isSantri = role === "santri";

    const hitungHari = (mulai, selesai) => {
        if (!mulai) return "Izin selama 1 hari";
        const end = selesai || mulai;
        const d1 = new Date(mulai + "T00:00:00");
        const d2 = new Date(end + "T00:00:00");
        const diffTime = d2 - d1;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const hari = Math.max(1, isNaN(diffDays) ? 1 : diffDays);
        return `Izin selama ${hari} hari`;
    };

    const namaBulan = new Date(tahun, bulan - 1).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    });

    const formatTanggal = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl + "T12:00:00").toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const openInput = () => {
        const today = new Date().toISOString().slice(0, 10);
        setForm({
            tanggal: today,
            tanggal_selesai: today,
            keterangan: "",
        });
        setShowPopup(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post("/izin-santri", form, {
            onSuccess: () => {
                setShowPopup(false);
                const today = new Date().toISOString().slice(0, 10);
                setForm({
                    tanggal: today,
                    tanggal_selesai: today,
                    keterangan: "",
                });
            },
            onError: (err) => {
                alert(err?.error || "Gagal mengajukan izin.");
            },
        });
    };

    const handleHapus = (id) => {
        if (confirm("Batalkan izin ini?")) {
            router.delete(`/izin-santri/${id}`);
        }
    };

    const bulanSebelumnya = () => {
        let b = bulan - 1;
        let t = tahun;
        if (b < 1) {
            b = 12;
            t--;
        }
        router.get(
            "/izin-santri",
            { bulan: b, tahun: t },
            { preserveState: true },
        );
    };

    const bulanBerikutnya = () => {
        let b = bulan + 1;
        let t = tahun;
        if (b > 12) {
            b = 1;
            t++;
        }
        router.get(
            "/izin-santri",
            { bulan: b, tahun: t },
            { preserveState: true },
        );
    };

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Izin Santri
                    </h2>
                    {isSantri && (
                        <button
                            onClick={openInput}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Ajukan Izin
                        </button>
                    )}
                </div>

                {/* Navigasi Bulan */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={bulanSebelumnya}
                        className="bg-white border border-slate-200 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-[#3D7ABA] transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-bold text-slate-700">
                        {namaBulan}
                    </p>
                    <button
                        onClick={bulanBerikutnya}
                        className="bg-white border border-slate-200 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-[#3D7ABA] transition"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Daftar Izin */}
                <div className="space-y-2">
                    {izins.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Belum ada izin bulan ini
                        </p>
                    )}
                    {izins.map((i) => (
                        <div
                            key={i.id}
                            className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        {i.nama?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">
                                            {i.nama}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {i.nis}
                                        </p>
                                    </div>
                                </div>
                                {isSantri && (
                                    <button
                                        onClick={() => handleHapus(i.id)}
                                        className="text-slate-400 hover:text-red-500 transition shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">
                                        Waktu Izin
                                    </span>
                                    <span className="font-medium text-slate-700 text-right">
                                        {i.tanggal_selesai && i.tanggal_selesai !== i.tanggal ? (
                                            <>
                                                {formatTanggal(i.tanggal)} – {formatTanggal(i.tanggal_selesai)}
                                            </>
                                        ) : (
                                            formatTanggal(i.tanggal)
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">
                                        Lama Izin
                                    </span>
                                    <span className="font-semibold text-[#3D7ABA] bg-sky-50 border border-sky-100/60 px-2 py-0.5 rounded-full">
                                        Izin selama {i.total_hari || 1} hari
                                    </span>
                                </div>
                                <div className="flex justify-between items-start text-[11px]">
                                    <span className="text-slate-400 shrink-0">
                                        Keterangan
                                    </span>
                                    <span className="font-medium text-slate-600 text-right ml-4">
                                        {i.keterangan}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Popup Input Izin */}
                {showPopup && isSantri && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowPopup(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    Ajukan Izin
                                </h3>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                            Dari Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            value={form.tanggal}
                                            onChange={(e) => {
                                                const newTgl = e.target.value;
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tanggal: newTgl,
                                                    tanggal_selesai:
                                                        !prev.tanggal_selesai ||
                                                        prev.tanggal_selesai < newTgl
                                                            ? newTgl
                                                            : prev.tanggal_selesai,
                                                }));
                                            }}
                                            className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm outline-none focus:border-[#20B5E8] focus:ring-2 focus:ring-sky-100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                            Sampai Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            min={form.tanggal}
                                            value={form.tanggal_selesai || form.tanggal}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tanggal_selesai: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm outline-none focus:border-[#20B5E8] focus:ring-2 focus:ring-sky-100"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-sky-50/80 border border-sky-100 rounded-2xl px-3.5 py-2 text-xs flex items-center justify-between">
                                    <span className="text-slate-500">Keterangan:</span>
                                    <span className="font-bold text-[#3D7ABA]">
                                        {hitungHari(form.tanggal, form.tanggal_selesai)}
                                    </span>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                        Keterangan / Alasan
                                    </label>
                                    <textarea
                                        value={form.keterangan}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                keterangan: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: Sakit, pulang ada keperluan keluarga..."
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-[#20B5E8] focus:ring-2 focus:ring-sky-100 resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPopup(false)}
                                        className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm font-medium hover:bg-slate-50 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold shadow-md hover:opacity-95 transition"
                                    >
                                        Ajukan Izin
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
