import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
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

    // Fetch halaman dengan AbortController
    useEffect(() => {
        if (abortRef.current) {
            abortRef.current.abort();
        }
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
            .catch(() => toast.error("Gagal memuat daftar surat."));

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
            .catch(() => toast.error("Gagal memuat daftar juz."));
    }, []);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setPickerMode(null);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

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
        if (document.fonts?.ready) {
            document.fonts.ready.then(fitToStage);
        }
    }, [loading, detail, fitToStage]);

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
            if (deltaX > 0) {
                goTo(halaman + 1);
            } else {
                goTo(halaman - 1);
            }
        }

        touchStartX.current = null;
        touchStartY.current = null;
    };

    const pilihSuratHandler = async (suratId) => {
        try {
            const res = await getHalamanDariSurat(suratId);
            const halamanSurat = res?.chapter?.pages?.[0];
            if (halamanSurat) goTo(halamanSurat);
            else toast.error("Surat tidak ditemukan.");
        } catch {
            toast.error("Gagal membuka surat.");
        }
        setPickerMode(null);
    };

    const pilihAyatHandler = async () => {
        const surat = listSurat.find((s) => s.id === pilihSurat);
        const maxAyat = surat?.verses_count || 1;

        if (pilihAyat < 1 || pilihAyat > maxAyat) {
            toast.error(
                `Ayat tidak valid. Surat ${surat?.name_simple} hanya ${maxAyat} ayat.`,
            );
            return;
        }

        try {
            const res = await getHalamanDariAyat(pilihSurat, pilihAyat);
            const halamanAyat = res?.verse?.page_number;
            if (halamanAyat) goTo(halamanAyat);
            else toast.error("Ayat tidak ditemukan.");
        } catch {
            toast.error("Gagal membuka ayat.");
        }
        setPickerMode(null);
    };

    const pilihJuzHandler = (juz) => {
        const mapping = juz.verse_mapping;
        const suratPertama = Object.keys(mapping)[0];
        const ayatPertama = mapping[suratPertama].split("-")[0];
        pilihAyatHandlerByKey(suratPertama, ayatPertama);
    };

    const pilihAyatHandlerByKey = async (surat, ayat) => {
        try {
            const res = await getHalamanDariAyat(surat, ayat);
            const halamanAyat = res?.verse?.page_number;
            if (halamanAyat) goTo(halamanAyat);
            else toast.error("Ayat tidak ditemukan.");
        } catch {
            toast.error("Gagal membuka ayat.");
        }
        setPickerMode(null);
    };

    // Reset ayat saat ganti surat
    const handleGantiSurat = (suratId) => {
        setPilihSurat(Number(suratId));
        setPilihAyat(1);
        const surat = listSurat.find((s) => s.id === Number(suratId));
        toast.success(`Surat ${surat?.name_simple} dipilih.`);
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
                    <div className="grid grid-cols-3 gap-2 max-w-3xl mx-auto">
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
                        <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-sky-100 overflow-hidden z-50 max-w-3xl mx-auto">
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
                    className="flex-1 min-h-0 relative flex items-start justify-center px-2 sm:px-4 py-2 overflow-hidden"
                >
                    {loading || !detail ? (
                        <div className="text-slate-400 text-sm">
                            Memuat halaman...
                        </div>
                    ) : (
                        <div
                            ref={contentRef}
                            className="w-full max-w-3xl"
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: "top center",
                                opacity: ready ? 1 : 0,
                                transition: "opacity 0.15s ease",
                            }}
                        >
                            <div
                                className="rounded-[26px] p-[3px]"
                                style={{
                                    background:
                                        "linear-gradient(135deg,#3D7ABA,#20B5E8,#3D7ABA)",
                                }}
                            >
                                <div
                                    className="rounded-[23px] px-4 py-4 sm:px-8 sm:py-6 border-2 border-double border-sky-200/70"
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        backgroundImage:
                                            "radial-gradient(circle at top left, rgba(61,122,186,0.06), transparent 55%), radial-gradient(circle at bottom right, rgba(32,181,232,0.06), transparent 55%)",
                                    }}
                                >
                                    <div
                                        dir="rtl"
                                        className="font-mushaf text-justify text-[16px] sm:text-[18px] leading-[1.6] text-slate-800"
                                        style={{
                                            direction: "rtl",
                                            textAlignLast: "right",
                                        }}
                                    >
                                        {detail.verses?.map((v) => (
                                            <span key={v.id}>
                                                {v.text_uthmani}
                                                <span
                                                    className="inline-flex items-center justify-center mx-1 align-middle rounded-full border-[1.5px] border-sky-300 text-[#3D7ABA] font-sans select-none"
                                                    style={{
                                                        width: "1.5em",
                                                        height: "1.5em",
                                                        fontSize: "0.5em",
                                                        fontWeight: 700,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {angkaArab(
                                                        v.verse_key.split(
                                                            ":",
                                                        )[1],
                                                    )}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
