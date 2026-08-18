import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    getHalamanMushaf,
    getListSurat,
    getListJuz,
    getHalamanDariSurat,
    getHalamanDariAyat,
} from "@/Services/AlQuran";
import toast from "react-hot-toast";

export default function Index() {
    const [halaman, setHalaman] = useState(1);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const [ready, setReady] = useState(false);

    const [listSurat, setListSurat] = useState([]);
    const [listJuz, setListJuz] = useState([]);
    const [pickerMode, setPickerMode] = useState(null);
    const [pickerSearch, setPickerSearch] = useState("");
    const [pilihSurat, setPilihSurat] = useState(1);
    const [pilihAyat, setPilihAyat] = useState(1);

    const pickerRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const stageRef = useRef(null);
    const contentRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setReady(false);
        getHalamanMushaf(halaman, controller.signal)
            .then((res) => {
                if (res?.verses) setDetail(res);
                setLoading(false);
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    toast.error("Gagal memuat halaman.");
                    setLoading(false);
                }
            });
    }, [halaman]);

    useEffect(() => {
        getListSurat()
            .then((res) => {
                if (res?.chapters) setListSurat(res.chapters);
            })
            .catch(() => {});
        getListJuz()
            .then((res) => {
                if (res?.juzs) {
                    const unik = res.juzs.filter(
                        (j, i, arr) =>
                            arr.findIndex(
                                (x) => x.juz_number === j.juz_number,
                            ) === i,
                    );
                    setListJuz(unik);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target))
                setPickerMode(null);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    // Susun ulang kata-kata per baris asli Mushaf Madinah (line_number dari API),
    // bukan paragraf yang di-wrap otomatis oleh browser.
    const baris = useMemo(() => {
        if (!detail?.verses) return [];
        const perBaris = new Map();
        detail.verses.forEach((v) => {
            const nomorAyat = v.verse_key.split(":")[1];
            const kata = (v.words || []).filter(
                (w) => w.char_type_name !== "end",
            );
            kata.forEach((w, idx) => {
                const arr = perBaris.get(w.line_number) || [];
                arr.push({
                    key: `${v.verse_key}-${w.position}`,
                    text: w.text_uthmani,
                    akhirAyat: idx === kata.length - 1,
                    nomorAyat,
                });
                perBaris.set(w.line_number, arr);
            });
        });
        return [...perBaris.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([nomorBaris, kata]) => ({ nomorBaris, kata }));
    }, [detail]);

    const fitToStage = useCallback(() => {
        const stage = stageRef.current;
        const content = contentRef.current;
        if (!stage || !content) return;
        const stageRect = stage.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        if (contentRect.width === 0 || contentRect.height === 0) return;
        const scaleX = stageRect.width / contentRect.width;
        const scaleY = stageRect.height / contentRect.height;
        const next = Math.min(scaleX, scaleY, 1.5);
        setScale(Math.max(next, 0.2));
        setReady(true);
    }, []);

    useLayoutEffect(() => {
        if (loading || !detail) return;
        fitToStage();
        if (document.fonts?.ready) document.fonts.ready.then(fitToStage);
    }, [loading, detail, baris, fitToStage]);

    useEffect(() => {
        let raf;
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(fitToStage);
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
            cancelAnimationFrame(raf);
        };
    }, [fitToStage]);

    const angkaArab = (angka) => {
        const arab = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
        return String(angka).replace(/[0-9]/g, (d) => arab[Number(d)]);
    };

    const goTo = (n) => {
        if (n < 1 || n > 604) return;
        setHalaman(n);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null || touchStartY.current === null)
            return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) goTo(halaman + 1);
            else goTo(halaman - 1);
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    const pilihSuratHandler = async (suratId) => {
        try {
            const res = await getHalamanDariSurat(suratId);
            const halamanSurat = res?.chapter?.pages?.[0];
            if (halamanSurat) goTo(halamanSurat);
        } catch {
            toast.error("Gagal membuka surat.");
        }
        setPickerMode(null);
    };

    const pilihAyatHandlerByKey = async (surat, ayat) => {
        try {
            const res = await getHalamanDariAyat(surat, ayat);
            const halamanAyat = res?.verse?.page_number;
            if (halamanAyat) goTo(halamanAyat);
        } catch {
            toast.error("Gagal membuka ayat.");
        }
        setPickerMode(null);
    };

    const pilihAyatHandler = async () => {
        const surat = listSurat.find((s) => s.id === pilihSurat);
        const maxAyat = surat?.verses_count || 1;
        if (pilihAyat < 1 || pilihAyat > maxAyat) {
            toast.error("Ayat tidak valid.");
            return;
        }
        pilihAyatHandlerByKey(pilihSurat, pilihAyat);
    };

    const pilihJuzHandler = (juz) => {
        const mapping = juz.verse_mapping;
        const suratPertama = Object.keys(mapping)[0];
        const ayatPertama = mapping[suratPertama].split("-")[0];
        pilihAyatHandlerByKey(suratPertama, ayatPertama);
    };

    const handleGantiSurat = (suratId) => {
        setPilihSurat(Number(suratId));
        setPilihAyat(1);
    };

    const suratLatin = detail?.meta?.surah_name_simple || "Al-Fatihah";
    const ayatAwal = detail?.verses?.[0]?.verse_key?.split(":")[1] || "1";
    const juzInfo = detail?.meta?.juz || 1;

    const filteredSurat = listSurat.filter(
        (s) =>
            s.name_simple?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
            String(s.id).includes(pickerSearch),
    );

    return (
        <AppLayout>
            <div
                className="h-[100dvh] w-full bg-[#EEF8FD] flex flex-col overflow-hidden overscroll-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Header navigasi */}
                <div className="shrink-0 px-4 py-3 relative" ref={pickerRef}>
                    <div className="grid grid-cols-3 gap-2 mx-auto">
                        <button
                            onClick={() => setPickerMode("surat")}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg truncate"
                        >
                            {suratLatin}
                        </button>
                        <button
                            onClick={() => setPickerMode("ayat")}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Ayat {angkaArab(ayatAwal)}
                        </button>
                        <button
                            onClick={() => setPickerMode("juz")}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Juz {angkaArab(juzInfo)}
                        </button>
                    </div>

                    {pickerMode && (
                        <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-sky-100 overflow-hidden z-50 mx-auto">
                            <div className="p-2 border-b border-slate-100">
                                <input
                                    autoFocus
                                    type="text"
                                    value={pickerSearch}
                                    onChange={(e) =>
                                        setPickerSearch(e.target.value)
                                    }
                                    placeholder="Cari..."
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#20B5E8]"
                                />
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {pickerMode === "surat" &&
                                    filteredSurat.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() =>
                                                pilihSuratHandler(s.id)
                                            }
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#3D7ABA]/5 transition"
                                        >
                                            <span className="w-7 h-7 shrink-0 rounded-full border border-sky-200 text-[#3D7ABA] text-[11px] font-bold flex items-center justify-center">
                                                {angkaArab(s.id)}
                                            </span>
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-medium text-slate-800 truncate">
                                                    {s.name_simple}
                                                </span>
                                                <span className="block text-[11px] text-slate-400">
                                                    {s.verses_count} ayat
                                                </span>
                                            </span>
                                            <span className="font-mushaf text-lg text-[#3D7ABA]">
                                                {s.name_arabic}
                                            </span>
                                        </button>
                                    ))}

                                {pickerMode === "ayat" && (
                                    <div className="p-3 space-y-2">
                                        <select
                                            value={pilihSurat}
                                            onChange={(e) =>
                                                handleGantiSurat(e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm bg-white outline-none"
                                        >
                                            {listSurat.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name_simple}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            value={pilihAyat}
                                            onChange={(e) =>
                                                setPilihAyat(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm outline-none"
                                            min="1"
                                            max={
                                                listSurat.find(
                                                    (s) => s.id === pilihSurat,
                                                )?.verses_count || 1
                                            }
                                        />
                                        <button
                                            onClick={pilihAyatHandler}
                                            className="w-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2 rounded-2xl text-sm font-semibold"
                                        >
                                            Buka Ayat
                                        </button>
                                    </div>
                                )}

                                {pickerMode === "juz" &&
                                    listJuz.map((j) => (
                                        <button
                                            key={j.juz_number}
                                            onClick={() => pilihJuzHandler(j)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#3D7ABA]/5 transition"
                                        >
                                            <span className="w-7 h-7 shrink-0 rounded-full border border-sky-200 text-[#3D7ABA] text-[11px] font-bold flex items-center justify-center">
                                                {angkaArab(j.juz_number)}
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                Juz {angkaArab(j.juz_number)}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stage */}
                <div
                    ref={stageRef}
                    className="flex-1 min-h-0 relative flex items-stretch justify-center px-4 sm:px-6 py-3 overflow-hidden"
                >
                    {loading || !detail ? (
                        <div className="text-slate-400 text-sm flex items-center justify-center">
                            Memuat halaman...
                        </div>
                    ) : (
                        <div
                            ref={contentRef}
                            style={{
                                width: "max-content",
                                maxWidth: "none",
                                transform: `scale(${scale})`,
                                transformOrigin: "top center",
                                opacity: ready ? 1 : 0,
                                transition: "opacity 0.15s ease",
                            }}
                        >
                            {/* Setiap div di bawah = satu baris ASLI Mushaf Madinah
                                (dari line_number API), bukan hasil word-wrap browser */}
                            {baris.map((b) => (
                                <div
                                    key={b.nomorBaris}
                                    dir="rtl"
                                    className="font-mushaf whitespace-nowrap text-[26px] text-slate-800"
                                    style={{
                                        direction: "rtl",
                                        textAlign: "justify",
                                        textAlignLast: "justify",
                                    }}
                                >
                                    {b.kata.map((w) => (
                                        <span key={w.key}>
                                            {w.text}{" "}
                                            {w.akhirAyat && (
                                                <span
                                                    className="inline-flex items-center justify-center mx-1 align-middle rounded-full border border-slate-300 text-slate-600 select-none"
                                                    style={{
                                                        width: "0.85em",
                                                        height: "0.85em",
                                                        fontSize: "0.5em",
                                                        fontWeight: 600,
                                                        lineHeight: 1,
                                                        fontFamily:
                                                            "Amiri, serif",
                                                    }}
                                                >
                                                    {angkaArab(w.nomorAyat)}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
