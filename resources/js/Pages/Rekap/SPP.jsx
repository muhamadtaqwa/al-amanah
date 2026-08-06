import { usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function SPP() {
    const { rekap, totalSemua, totalLunas, totalBelum } = usePage().props;

    const sorted = [...rekap].sort((a, b) => a.nis.localeCompare(b.nis));

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Rekap SPP
                </h2>

                {/* Ringkasan - 3 baris */}
                <div className="space-y-2 mb-6">
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Total Semua
                        </span>
                        <span className="text-base font-extrabold text-[#3D7ABA] font-mono tracking-tight">
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

                {/* List Santri */}
                <div className="space-y-2">
                    {sorted.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada data SPP
                        </p>
                    )}
                    {sorted.map((s) => (
                        <div
                            key={s.nis}
                            className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#3D7ABA] rounded-full flex items-center justify-center text-white font-bold text-xs">
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
                            {/* 3 baris */}
                            <div className="space-y-1 text-xs">
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
