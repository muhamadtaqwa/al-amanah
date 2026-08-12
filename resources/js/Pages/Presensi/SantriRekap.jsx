import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function SantriRekap() {
    const { rekap, bulan, tahun } = usePage().props;

    const handleFilter = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        router.get(
            "/presensi-santri/rekap",
            {
                bulan: formData.get("bulan"),
                tahun: formData.get("tahun"),
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Rekap Presensi Santri
                    </h2>
                    <a
                        href="/presensi-santri"
                        className="text-sm text-[#3D7ABA] font-medium hover:underline"
                    >
                        Kembali
                    </a>
                </div>

                <form
                    onSubmit={handleFilter}
                    className="grid grid-cols-3 gap-2 mb-4"
                >
                    <select
                        name="bulan"
                        defaultValue={bulan}
                        className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (b) => (
                                <option key={b} value={b}>
                                    {new Date(2024, b - 1).toLocaleDateString(
                                        "id-ID",
                                        { month: "long" },
                                    )}
                                </option>
                            ),
                        )}
                    </select>
                    <select
                        name="tahun"
                        defaultValue={tahun}
                        className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                    >
                        {Array.from(
                            { length: 5 },
                            (_, i) => new Date().getFullYear() - i,
                        ).map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                    >
                        Filter
                    </button>
                </form>

                {/* Ringkasan */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-400">
                            Total Santri Presensi
                        </p>
                        <p className="text-xl font-bold text-[#3D7ABA] mt-1">
                            {rekap.length}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-400">
                            Total Kehadiran
                        </p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">
                            {rekap.reduce((s, r) => s + r.total_hadir, 0)}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {rekap.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Belum ada data
                        </p>
                    )}
                    {rekap.map((r) => (
                        <div
                            key={r.nis}
                            className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {r.nama?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {r.nama}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {r.nis}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">
                                        {r.total_hadir} hadir
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        Terakhir:{" "}
                                        {new Date(
                                            r.terakhir_hadir,
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
