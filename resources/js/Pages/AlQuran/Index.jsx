import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { getListSurat, getDetailSurat } from "@/Services/AlQuran";

export default function Index() {
    const [surat, setSurat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [detail, setDetail] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        getListSurat()
            .then((res) => {
                if (res?.data) {
                    setSurat(res.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const openDetail = async (nomor) => {
        if (!nomor) return;
        setShowDetail(true);
        setDetail(null);
        setLoadingDetail(true);
        try {
            const res = await getDetailSurat(nomor);
            if (res?.data) {
                setDetail(res.data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoadingDetail(false);
    };

    const filtered = surat.filter(
        (s) =>
            s.namaLatin?.toLowerCase().includes(search.toLowerCase()) ||
            String(s.nomor).includes(search),
    );

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Al-Qur'an
                </h2>

                <input
                    type="text"
                    placeholder="Cari surat..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm mb-4 outline-none"
                />

                {loading ? (
                    <p className="text-center text-slate-400 py-10">
                        Memuat...
                    </p>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((s, index) => (
                            <div
                                key={index}
                                onClick={() => openDetail(s.nomor)}
                                className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#3D7ABA]/10 text-[#3D7ABA] rounded-full flex items-center justify-center text-xs font-bold">
                                        {s.nomor}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">
                                            {s.namaLatin}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {s.jumlahAyat} ayat
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showDetail && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-black/50"
                                onClick={() => setShowDetail(false)}
                            ></div>
                            <div className="relative bg-[#FFF8E7] rounded-[30px] shadow-2xl w-full max-w-2xl p-6 border-2 border-amber-200 my-4">
                                {loadingDetail || !detail ? (
                                    <p className="text-center text-slate-400 py-8">
                                        Memuat...
                                    </p>
                                ) : (
                                    <>
                                        <div className="text-center mb-6 pb-4 border-b-2 border-amber-200">
                                            <h3 className="font-bold text-xl text-emerald-800">
                                                {detail.namaLatin}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {detail.jumlahAyat} ayat •{" "}
                                                {detail.arti}
                                            </p>
                                        </div>
                                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                                            {detail.ayat?.map((a, index) => (
                                                <div
                                                    key={index}
                                                    className="text-center"
                                                >
                                                    <p
                                                        className="font-mushaf text-right text-2xl leading-loose text-slate-800"
                                                        dir="rtl"
                                                    >
                                                        {a.teksArab}
                                                    </p>
                                                    <div className="flex justify-center my-2">
                                                        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                                                            {a.nomorAyat}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setShowDetail(false)}
                                            className="mt-6 w-full border border-amber-300 text-slate-600 py-2.5 rounded-2xl text-sm hover:bg-amber-50 transition"
                                        >
                                            Tutup
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
