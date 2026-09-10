import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Plus, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Index() {
    const { izins, bulan, tahun, role, auth } = usePage().props;
    const [showPopup, setShowPopup] = useState(false);
    const [form, setForm] = useState({
        tanggal: new Date().toISOString().slice(0, 10),
        keterangan: "",
    });

    const isSantri = role === "santri";

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
        setForm({
            tanggal: new Date().toISOString().slice(0, 10),
            keterangan: "",
        });
        setShowPopup(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post("/izin-santri", form, {
            onSuccess: () => {
                setShowPopup(false);
                setForm({ tanggal: "", keterangan: "" });
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
                            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-[11px] text-slate-400">
                                        Tanggal
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-600">
                                        {formatTanggal(i.tanggal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[11px] text-slate-400">
                                        Keterangan
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-600 text-right ml-4">
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
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">
                                        Tanggal Izin
                                    </label>
                                    <input
                                        type="date"
                                        value={form.tanggal}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                tanggal: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">
                                        Keterangan
                                    </label>
                                    <textarea
                                        value={form.keterangan}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                keterangan: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: Sakit, pulang, acara keluarga..."
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPopup(false)}
                                        className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        Ajukan
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
