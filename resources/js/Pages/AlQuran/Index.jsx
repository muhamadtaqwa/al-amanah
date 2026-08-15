import { useState, useEffect, useRef } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { getListSurat, getDetailSurat } from "@/Services/AlQuran";

export default function Index() {
    const [listSurat, setListSurat] = useState([]);
    const [nomor, setNomor] = useState(1);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");
    const pickerRef = useRef(null);

    useEffect(() => {
        getListSurat().then((res) => {
            if (res?.data) setListSurat(res.data);
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        getDetailSurat(nomor)
            .then((res) => {
                if (res?.data) setDetail(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [nomor]);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const filteredList = listSurat.filter(
        (s) =>
            s.namaLatin?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
            String(s.nomor).includes(pickerSearch),
    );

    const goTo = (n) => {
        if (n < 1 || n > 114) return;
        setNomor(n);
        setPickerOpen(false);
        setPickerSearch("");
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#EEF8FD]">
                {/* Header navigasi */}
                <div className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] shadow-md">
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                        <button
                            onClick={() => goTo(nomor - 1)}
                            disabled={nomor <= 1}
                            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            aria-label="Surat sebelumnya"
                        >
                            ‹
                        </button>

                        <div className="relative flex-1" ref={pickerRef}>
                            <button
                                onClick={() => setPickerOpen((v) => !v)}
                                className="w-full flex items-center justify-between gap-2 bg-white/10 hover:bg-white/15 rounded-full px-4 py-2 text-left transition"
                            >
                                <span className="min-w-0">
                                    <span className="block text-[11px] text-white/60 leading-none mb-0.5">
                                        Surat {nomor} dari 114
                                    </span>
                                    <span className="block text-sm font-semibold text-white truncate">
                                        {detail?.namaLatin || "Memuat..."}
                                    </span>
                                </span>
                                <svg
                                    className={`w-4 h-4 text-white/70 shrink-0 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M5.5 7.5l4.5 4.5 4.5-4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            {pickerOpen && (
                                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-sky-100 overflow-hidden">
                                    <div className="p-2 border-b border-slate-100">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={pickerSearch}
                                            onChange={(e) =>
                                                setPickerSearch(e.target.value)
                                            }
                                            placeholder="Cari nama atau nomor surat..."
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#20B5E8]"
                                        />
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {filteredList.map((s) => (
                                            <button
                                                key={s.nomor}
                                                onClick={() => goTo(s.nomor)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#3D7ABA]/5 transition ${
                                                    s.nomor === nomor
                                                        ? "bg-[#3D7ABA]/10"
                                                        : ""
                                                }`}
                                            >
                                                <span className="w-7 h-7 shrink-0 rounded-full border border-sky-200 text-[#3D7ABA] text-[11px] font-bold flex items-center justify-center">
                                                    {s.nomor}
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="block text-sm font-medium text-slate-800 truncate">
                                                        {s.namaLatin}
                                                    </span>
                                                    <span className="block text-[11px] text-slate-400">
                                                        {s.jumlahAyat} ayat
                                                    </span>
                                                </span>
                                                <span className="font-mushaf text-lg text-[#3D7ABA]">
                                                    {s.nama}
                                                </span>
                                            </button>
                                        ))}
                                        {filteredList.length === 0 && (
                                            <p className="text-center text-sm text-slate-400 py-6">
                                                Surat tidak ditemukan.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => goTo(nomor + 1)}
                            disabled={nomor >= 114}
                            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            aria-label="Surat berikutnya"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Halaman mushaf */}
                <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6">
                    {loading || !detail ? (
                        <div className="py-24 text-center text-slate-400 text-sm">
                            Memuat ayat...
                        </div>
                    ) : (
                        <div
                            className="rounded-[26px] p-[3px]"
                            style={{
                                background:
                                    "linear-gradient(135deg,#20B5E8,#7DD3FC,#20B5E8)",
                            }}
                        >
                            <div
                                className="rounded-[23px] px-5 py-7 sm:px-10 sm:py-10 border-2 border-double border-sky-200/70"
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    backgroundImage:
                                        "radial-gradient(circle at top left, rgba(61,122,186,0.06), transparent 55%), radial-gradient(circle at bottom right, rgba(32,181,232,0.06), transparent 55%)",
                                }}
                            >
                                {/* Kepala surat */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-sky-200 bg-[#3D7ABA]/5">
                                        <span className="font-mushaf text-2xl text-[#3D7ABA]">
                                            {detail.nama}
                                        </span>
                                        <span className="w-px h-4 bg-sky-200" />
                                        <span
                                            className="text-sm text-slate-600 tracking-wide"
                                            style={{
                                                fontFamily: "'Lora', serif",
                                            }}
                                        >
                                            {detail.namaLatin}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {detail.tempatTurun} ·{" "}
                                        {detail.jumlahAyat} ayat · {detail.arti}
                                    </p>

                                    {detail.nomor !== 9 && (
                                        <p
                                            dir="rtl"
                                            className="font-mushaf text-[26px] sm:text-3xl text-[#3D7ABA] mt-6"
                                        >
                                            بِسْمِ اللَّهِ الرَّحْمَٰنِ
                                            الرَّحِيمِ
                                        </p>
                                    )}
                                </div>

                                {/* Teks ayat mengalir, gaya mushaf */}
                                <div
                                    dir="rtl"
                                    className="font-mushaf text-justify text-[24px] sm:text-[28px] leading-[2.7] text-slate-800"
                                    style={{ textAlignLast: "right" }}
                                >
                                    {detail.ayat?.map((a) => (
                                        <span key={a.nomorAyat}>
                                            {a.teksArab}
                                            <span
                                                className="inline-flex items-center justify-center mx-1.5 align-middle rounded-full border-[1.5px] border-sky-300 text-[#3D7ABA] font-sans select-none"
                                                style={{
                                                    width: "1.7em",
                                                    height: "1.7em",
                                                    fontSize: "0.55em",
                                                    fontWeight: 700,
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {a.nomorAyat}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigasi bawah */}
                    {!loading && detail && (
                        <div className="flex items-center justify-between gap-3 mt-6">
                            <button
                                onClick={() => goTo(nomor - 1)}
                                disabled={nomor <= 1}
                                className="flex-1 text-sm font-medium text-[#3D7ABA] border border-sky-200 rounded-2xl py-3 disabled:opacity-30 hover:bg-[#3D7ABA]/5 transition"
                            >
                                ‹ Surat Sebelumnya
                            </button>
                            <button
                                onClick={() => goTo(nomor + 1)}
                                disabled={nomor >= 114}
                                className="flex-1 text-sm font-medium text-[#3D7ABA] border border-sky-200 rounded-2xl py-3 disabled:opacity-30 hover:bg-[#3D7ABA]/5 transition"
                            >
                                Surat Berikutnya ›
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
