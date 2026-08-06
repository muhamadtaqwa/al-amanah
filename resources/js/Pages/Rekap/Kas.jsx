import { usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Kas() {
    const { rekap, totalSemua, totalLunas, totalBelum } = usePage().props;

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Rekap Kas
                </h2>

                <div className="space-y-2 mb-6">
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Total Semua
                        </span>
                        <span className="text-base font-extrabold text-pink-600 font-mono tracking-tight">
                            Rp {totalSemua.toLocaleString()}
                        </span>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">Lunas</span>
                        <span className="text-base font-extrabold text-emerald-600 font-mono tracking-tight">
                            Rp {totalLunas.toLocaleString()}
                        </span>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Belum Lunas
                        </span>
                        <span className="text-base font-extrabold text-red-500 font-mono tracking-tight">
                            Rp {totalBelum.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {rekap.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada data Kas
                        </p>
                    )}
                    {rekap.map((s) => (
                        <div
                            key={s.nis}
                            className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {s.nama?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {s.nama}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {s.nis}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${s.total_belum === 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                                >
                                    {s.total_belum === 0
                                        ? "Lunas"
                                        : `${s.total_belum} belum`}
                                </span>
                            </div>

                            {/* Detail per bulan */}
                            <div className="space-y-1 mb-2">
                                {s.per_bulan?.map((bulan) => (
                                    <div
                                        key={bulan.id}
                                        className="flex justify-between text-xs bg-slate-50 rounded-lg px-3 py-1.5"
                                    >
                                        <span className="text-slate-600 truncate mr-2">
                                            {bulan.nama_pembayaran
                                                ?.replace("Kas Bulanan - ", "")
                                                .replace(` - ${s.nama}`, "")}
                                        </span>
                                        <span
                                            className={`font-medium ${bulan.status === "lunas" ? "text-emerald-600" : "text-red-500"}`}
                                        >
                                            {bulan.status === "lunas"
                                                ? "Lunas"
                                                : "Belum"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="space-y-1 text-xs border-t pt-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">
                                        Total
                                    </span>
                                    <span className="font-semibold font-mono">
                                        Rp{" "}
                                        {parseInt(
                                            s.total_nominal,
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
                                            s.nominal_lunas,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-red-400">Belum</span>
                                    <span className="font-semibold text-red-500 font-mono">
                                        Rp{" "}
                                        {parseInt(
                                            s.nominal_belum,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
