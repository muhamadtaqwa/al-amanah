import { useState } from "react";
import { usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Santri() {
    const { santris } = usePage().props;
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    const sortedSantris = [...santris].sort((a, b) =>
        a.nis.localeCompare(b.nis),
    );

    const handleLihat = async (nis) => {
        setShowPopup(true);
        setLoading(true);
        try {
            const res = await fetch(`/api/rekap/santri/${nis}`, {
                headers: { Accept: "application/json" },
            });
            const data = await res.json();
            setSelected(data.santri);
            setDetail(data.rekap);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const filtered = sortedSantris.filter(
        (s) =>
            s.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
            s.nis?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Rekap Per Santri
                </h2>

                <input
                    type="text"
                    placeholder="Cari nama atau NIS..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none mb-4"
                />

                <div className="space-y-1.5">
                    {filtered.map((s) => (
                        <div
                            key={s.nis}
                            className="w-full rounded-2xl p-4 flex items-center gap-3 bg-white border border-slate-100 shadow-sm"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                                {s.nama_lengkap?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">
                                    {s.nama_lengkap}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {s.nis}
                                </p>
                            </div>
                            <button
                                onClick={() => handleLihat(s.nis)}
                                className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-3 py-1.5 rounded-full font-medium hover:bg-[#3D7ABA]/20 transition"
                            >
                                Lihat
                            </button>
                        </div>
                    ))}
                </div>

                {/* Popup */}
                {showPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowPopup(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100 max-h-[80vh] overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-slate-400 py-8">
                                    Memuat...
                                </p>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-[#3D7ABA] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {selected?.nama_lengkap?.charAt(
                                                    0,
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#3D7ABA]">
                                                    {selected?.nama_lengkap}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {selected?.nis}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowPopup(false)}
                                            className="text-slate-400 hover:text-slate-600 text-lg"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {detail?.map((d) => (
                                            <div
                                                key={d.jenis}
                                                className="bg-slate-50 rounded-2xl p-3"
                                            >
                                                <div className="flex justify-between text-sm font-medium mb-1">
                                                    <span>{d.jenis}</span>
                                                    <span
                                                        className={
                                                            d.total_belum === 0
                                                                ? "text-emerald-600"
                                                                : "text-red-500"
                                                        }
                                                    >
                                                        {d.total_belum === 0
                                                            ? "Lunas"
                                                            : `${d.total_belum} belum`}
                                                    </span>
                                                </div>
                                                <div className="space-y-0.5 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">
                                                            Total
                                                        </span>
                                                        <span className="font-semibold font-mono">
                                                            Rp{" "}
                                                            {parseInt(
                                                                d.total_nominal,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-emerald-500">
                                                            Lunas
                                                        </span>
                                                        <span className="font-semibold text-emerald-600 font-mono">
                                                            Rp{" "}
                                                            {parseInt(
                                                                d.nominal_lunas,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-red-400">
                                                            Belum
                                                        </span>
                                                        <span className="font-semibold text-red-500 font-mono">
                                                            Rp{" "}
                                                            {parseInt(
                                                                d.nominal_belum,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
