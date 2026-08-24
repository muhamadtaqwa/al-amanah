import { usePage, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Kitab() {
    const { rekap, totalSemua, totalLunas, totalBelum } = usePage().props;

    const menu = [
        {
            label: "Santri",
            path: "/rekap/santri",
            bg: "bg-[#3D7ABA]/10",
            text: "text-[#3D7ABA]",
        },
        {
            label: "SPP",
            path: "/rekap/spp",
            bg: "bg-[#20B5E8]/10",
            text: "text-[#20B5E8]",
        },
        {
            label: "Kitab",
            path: "/rekap/kitab",
            bg: "bg-orange-50",
            text: "text-orange-600",
        },
        {
            label: "Kas",
            path: "/rekap/kas",
            bg: "bg-pink-50",
            text: "text-pink-600",
        },
    ];

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Rekap Kitab
                </h2>

                <div className="space-y-2 mb-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Total Semua
                        </span>
                        <span className="text-base font-extrabold text-orange-600 font-mono tracking-tight">
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

                <p className="text-sm font-bold text-slate-400 uppercase mb-3">
                    Pilih jenis rekap
                </p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {menu.map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`${m.bg} rounded-2xl p-3 text-center active:scale-[0.98] transition-all hover:shadow-md`}
                        >
                            <span
                                className={`font-semibold text-[11px] ${m.text}`}
                            >
                                {m.label}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* 2 Kolom di desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rekap.length === 0 && (
                        <p className="text-center text-slate-400 py-10 md:col-span-2">
                            Tidak ada data Kitab
                        </p>
                    )}
                    {rekap.map((s) => (
                        <div
                            key={s.nis}
                            className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        {s.nama?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">
                                            {s.nama}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {s.nis}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${s.total_belum === 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                                >
                                    {s.total_belum === 0
                                        ? "Lunas"
                                        : `${s.total_belum} Belum`}
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                                <Row
                                    label="Total"
                                    value={`Rp ${parseInt(s.total_nominal).toLocaleString()}`}
                                />
                                <Row
                                    label="Lunas"
                                    value={`Rp ${parseInt(s.nominal_lunas).toLocaleString()}`}
                                />
                                <Row
                                    label="Belum"
                                    value={`Rp ${parseInt(s.nominal_belum).toLocaleString()}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-600 text-right ml-4">
            {value || "-"}
        </span>
    </div>
);
