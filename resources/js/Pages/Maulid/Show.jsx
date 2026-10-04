import { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    LIST_KITAB,
    FASAL_TITLES,
    getFasal,
} from "@/Services/Maulid";
import {
    ArrowLeft,
    Minus,
    Plus,
    List,
    Star,
    X,
    ChevronLeft,
    ChevronRight,
    Languages,
    Sparkles,
    RotateCcw,
} from "lucide-react";

export default function Show({ slug }) {
    const kitab = LIST_KITAB.find((k) => k.slug === slug) || LIST_KITAB[0];
    const titles = FASAL_TITLES[kitab.slug] || [];

    // Query param initial fasal
    const queryParams = new URLSearchParams(window.location.search);
    const initialFasal = Math.max(
        1,
        Math.min(
            kitab.totalFasal,
            Number(queryParams.get("fasal")) || 1
        )
    );

    const [currentFasal, setCurrentFasal] = useState(initialFasal);
    const [fasalData, setFasalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Font size & show translation
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem("maulid_font_size");
        return saved ? Number(saved) : 24;
    });

    const [showLatin, setShowLatin] = useState(() => {
        return localStorage.getItem("maulid_show_latin") === "true";
    });

    const abortRef = useRef(null);

    // Load fasal data
    const loadFasal = async (nomor) => {
        setLoading(true);
        setError(null);

        if (abortRef.current) {
            abortRef.current.abort();
        }
        abortRef.current = new AbortController();

        try {
            const data = await getFasal(kitab.slug, nomor, abortRef.current.signal);
            setFasalData(data);
            localStorage.setItem(`maulid_${kitab.slug}_last_read`, String(nomor));

            // Update URL without page reload
            const url = new URL(window.location);
            url.searchParams.set("fasal", String(nomor));
            window.history.replaceState({}, "", url);

            // Scroll to top of reading area
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message || "Gagal memuat teks maulid.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFasal(currentFasal);
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [currentFasal]);

    // Handle Zoom
    const handleZoomIn = () => {
        setFontSize((prev) => {
            const next = Math.min(prev + 2, 40);
            localStorage.setItem("maulid_font_size", String(next));
            return next;
        });
    };

    const handleZoomOut = () => {
        setFontSize((prev) => {
            const next = Math.max(prev - 2, 16);
            localStorage.setItem("maulid_font_size", String(next));
            return next;
        });
    };

    const toggleLatin = () => {
        setShowLatin((prev) => {
            const next = !prev;
            localStorage.setItem("maulid_show_latin", String(next));
            return next;
        });
    };

    const jumpToMahalulQiyam = () => {
        if (kitab.mahalulQiyamFasal) {
            setCurrentFasal(kitab.mahalulQiyamFasal);
            setDrawerOpen(false);
        }
    };

    const isCurrentMahalulQiyam = currentFasal === kitab.mahalulQiyamFasal;

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto pb-24 select-text">
                {/* STICKY TOP CONTROLS */}
                <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 -mx-4 -mt-4 px-4 py-3 md:-mx-6 md:-mt-6 md:px-6 shadow-sm mb-4">
                    <div className="flex items-center justify-between gap-2">
                        {/* Tombol Back & Judul */}
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Link
                                href="/maulid"
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition shrink-0"
                                title="Kembali ke Katalog"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-xs font-bold text-slate-800 truncate">
                                    {kitab.name}
                                </h1>
                                <p className="text-[10px] text-slate-400 font-medium truncate">
                                    Fasal {currentFasal} dari {kitab.totalFasal}
                                    {isCurrentMahalulQiyam && (
                                        <span className="ml-1 text-amber-600 font-bold">
                                            (Mahalul Qiyam)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Controls Toolbar */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* Font Zoom Controls */}
                            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                                <button
                                    onClick={handleZoomOut}
                                    disabled={fontSize <= 16}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition"
                                    title="Perkecil Huruf"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[11px] font-mono px-1 font-bold text-slate-600 select-none">
                                    {fontSize}
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    disabled={fontSize >= 40}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition"
                                    title="Perbesar Huruf"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Toggle Latin */}
                            <button
                                onClick={toggleLatin}
                                className={`h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                                    showLatin
                                        ? "bg-sky-50 border-sky-200 text-[#3D7ABA]"
                                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                                title="Tampilkan Transliterasi Latin"
                            >
                                <Languages className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Latin</span>
                            </button>

                            {/* Button Daftar Fasal */}
                            <button
                                onClick={() => setDrawerOpen(true)}
                                className="h-8 px-3 rounded-xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95 active:scale-95 transition"
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Fasal</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Button Mahalul Qiyam (Jika Tersedia) */}
                    {kitab.mahalulQiyamFasal && !isCurrentMahalulQiyam && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                                Waktu berdiri majelis:
                            </span>
                            <button
                                onClick={jumpToMahalulQiyam}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shadow-xs"
                            >
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span>Lompat ke Mahalul Qiyam</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* READING AREA */}
                {loading ? (
                    <div className="rounded-3xl bg-white p-8 border border-slate-100 shadow-sm text-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-[#3D7ABA] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-400 font-medium">
                            Memuat teks fasal {currentFasal}...
                        </p>
                    </div>
                ) : error ? (
                    <div className="rounded-3xl bg-white p-8 border border-red-100 shadow-sm text-center py-16 space-y-4">
                        <p className="text-sm font-semibold text-red-500">
                            {error}
                        </p>
                        <button
                            onClick={() => loadFasal(currentFasal)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Coba Lagi</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Header Fasal Info */}
                        <div
                            className={`rounded-3xl p-5 text-center transition border ${
                                isCurrentMahalulQiyam
                                    ? "bg-gradient-to-b from-amber-500/10 via-amber-50 to-white border-amber-200"
                                    : "bg-gradient-to-b from-sky-500/5 via-sky-50/30 to-white border-sky-100"
                            }`}
                        >
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase mb-2 ${
                                    isCurrentMahalulQiyam
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : "bg-sky-100 text-[#3D7ABA] border border-sky-200"
                                }`}
                            >
                                {isCurrentMahalulQiyam
                                    ? "⭐ MAHALUL QIYAM"
                                    : `FASAL ${currentFasal}`}
                            </span>

                            {fasalData?.name && (
                                <h2 className="text-xl font-serif text-slate-800 mb-1 leading-relaxed">
                                    {fasalData.name}
                                </h2>
                            )}

                            {fasalData?.latin && (
                                <p className="text-xs text-slate-500 italic max-w-lg mx-auto">
                                    {fasalData.latin}
                                </p>
                            )}
                        </div>

                        {/* List Sections / Baits */}
                        <div className="space-y-4">
                            {fasalData?.sections?.map((section, sIdx) => (
                                <div
                                    key={`sec-${sIdx}`}
                                    className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-5"
                                >
                                    {/* Section Sub-Header (jika ada) */}
                                    {section.name && (
                                        <div className="text-center pb-3 border-b border-slate-100">
                                            <span className="text-base font-serif text-[#3D7ABA]">
                                                {section.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Verses / Texts */}
                                    <div className="space-y-6">
                                        {section.texts?.map((item, tIdx) => (
                                            <div
                                                key={`txt-${tIdx}`}
                                                className="group text-right space-y-2 border-b border-slate-50 last:border-b-0 pb-4 last:pb-0"
                                            >
                                                {/* Teks Arab */}
                                                <p
                                                    dir="rtl"
                                                    style={{
                                                        fontSize: `${fontSize}px`,
                                                        lineHeight: "2.3",
                                                    }}
                                                    className="font-serif text-slate-800 text-right leading-loose select-text font-normal tracking-wide"
                                                >
                                                    {item.arabic}
                                                </p>

                                                {/* Transliterasi Latin (opsional) */}
                                                {showLatin && item.latin && (
                                                    <p
                                                        dir="ltr"
                                                        className="text-left text-xs text-slate-500 font-sans italic leading-relaxed pt-1"
                                                    >
                                                        {item.latin}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Navigation Buttons */}
                        <div className="flex items-center justify-between gap-3 pt-6">
                            <button
                                onClick={() =>
                                    setCurrentFasal((prev) =>
                                        Math.max(1, prev - 1)
                                    )
                                }
                                disabled={currentFasal <= 1}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Fasal Sebelumnya</span>
                            </button>

                            <button
                                onClick={() =>
                                    setCurrentFasal((prev) =>
                                        Math.min(kitab.totalFasal, prev + 1)
                                    )
                                }
                                disabled={currentFasal >= kitab.totalFasal}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-xs font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-40 disabled:pointer-events-none transition"
                            >
                                <span>Fasal Berikutnya</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* MODAL / DRAWER DAFTAR FASAL */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setDrawerOpen(false)}
                        ></div>

                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col border border-sky-100 overflow-hidden">
                            {/* Drawer Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800">
                                        Daftar Fasal & Rawi
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        {kitab.name} ({kitab.totalFasal} Fasal)
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Drawer Items List */}
                            <div className="p-3 overflow-y-auto flex-1 space-y-1.5 divide-y divide-slate-50">
                                {titles.map((item) => {
                                    const active = currentFasal === item.no;

                                    return (
                                        <button
                                            key={`fasal-item-${item.no}`}
                                            onClick={() => {
                                                setCurrentFasal(item.no);
                                                setDrawerOpen(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition ${
                                                active
                                                    ? "bg-[#3D7ABA] text-white shadow-sm font-semibold"
                                                    : item.isMahalulQiyam
                                                      ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                                                      : "hover:bg-slate-50 text-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                        active
                                                            ? "bg-white/20 text-white"
                                                            : item.isMahalulQiyam
                                                              ? "bg-amber-200 text-amber-800"
                                                              : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {item.no}
                                                </span>
                                                <p className="text-xs truncate">
                                                    {item.title}
                                                </p>
                                            </div>

                                            {item.isMahalulQiyam && (
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                        active
                                                            ? "bg-white text-amber-700"
                                                            : "bg-amber-200 text-amber-800"
                                                    }`}
                                                >
                                                    Berdiri
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
