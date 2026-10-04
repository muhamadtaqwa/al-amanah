import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { LIST_KITAB } from "@/Services/Maulid";
import { BookOpen, Star, Sparkles, ChevronRight, Bookmark } from "lucide-react";

export default function Index() {
    const [lastReadMap, setLastReadMap] = useState({});

    useEffect(() => {
        const reads = {};
        LIST_KITAB.forEach((kitab) => {
            const saved = localStorage.getItem(`maulid_${kitab.slug}_last_read`);
            if (saved) {
                reads[kitab.slug] = Number(saved);
            }
        });
        setLastReadMap(reads);
    }, []);

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Banner Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3D7ABA] via-[#2A65A5] to-[#20B5E8] p-6 text-white shadow-lg">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-3 border border-white/20">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Majelis Shalawat & Maulid</span>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Kitab Maulid Nabi SAW
                        </h1>
                        <p className="mt-1 text-xs text-sky-100 max-w-md leading-relaxed">
                            Kumpulan kitab bacaan shalawat, riwayat kelahiran,
                            dan kemuliaan akhlak Rasulullah SAW untuk rutinan
                            santri dan majelis Al-Amanah.
                        </p>
                    </div>

                    {/* Hiasan Kaligrafi / Simbol */}
                    <div className="absolute -right-6 -bottom-8 opacity-15 text-white select-none pointer-events-none">
                        <span className="text-9xl font-serif">ﷺ</span>
                    </div>
                </div>

                {/* Daftar Kitab */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                            Pilihan Kitab Maulid
                        </h2>
                        <span className="text-xs text-slate-400">
                            {LIST_KITAB.length} Kitab Tersedia
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {LIST_KITAB.map((kitab) => {
                            const lastFasal = lastReadMap[kitab.slug];

                            return (
                                <div
                                    key={kitab.slug}
                                    className="group rounded-3xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Header Card */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-[#3D7ABA] border border-sky-100">
                                                {kitab.badge}
                                            </span>
                                            <span className="text-lg font-serif text-slate-400 group-hover:text-[#3D7ABA] transition">
                                                {kitab.arabicName}
                                            </span>
                                        </div>

                                        {/* Judul & Penulis */}
                                        <h3 className="text-base font-bold text-slate-800 group-hover:text-[#3D7ABA] transition">
                                            {kitab.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                            {kitab.author}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-2">
                                            {kitab.description}
                                        </p>

                                        {/* Status Terakhir Dibaca */}
                                        {lastFasal && (
                                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100">
                                                <Bookmark className="w-3 h-3" />
                                                <span>
                                                    Terakhir: Fasal {lastFasal}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                                        <Link
                                            href={`/maulid/${kitab.slug}${lastFasal ? `?fasal=${lastFasal}` : ""}`}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white text-xs font-semibold shadow-sm hover:opacity-95 active:scale-95 transition"
                                        >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>
                                                {lastFasal
                                                    ? "Lanjutkan Membaca"
                                                    : "Buka Kitab"}
                                            </span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>

                                        {/* Tombol Cepat Mahalul Qiyam */}
                                        {kitab.mahalulQiyamFasal && (
                                            <Link
                                                href={`/maulid/${kitab.slug}?fasal=${kitab.mahalulQiyamFasal}`}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-semibold transition"
                                            >
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                <span>
                                                    Langsung ke Mahalul Qiyam
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips Membaca Maulid */}
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-xs text-slate-600 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm shrink-0 text-[#3D7ABA]">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">
                            Fitur Pembaca Majelis
                        </p>
                        <p className="mt-0.5 text-slate-500 leading-relaxed">
                            Dilengkapi pengatur ukuran huruf (A- / A+) dan tombol
                            pintas langsung ke <strong>Mahalul Qiyam</strong>{" "}
                            saat jamaah berdiri. Teks otomatis tersimpan di HP
                            untuk dibaca offline.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
