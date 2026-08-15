import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { getJadwalSholat } from "@/Services/JadwalSholat";

export default function Index() {
    const [jadwal, setJadwal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tanggal, setTanggal] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });

    useEffect(() => {
        setLoading(true);
        getJadwalSholat(tanggal)
            .then((res) => {
                if (res?.data?.timings) {
                    setJadwal(res.data.timings);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [tanggal]);

    const formatTgl = (tgl) => {
        return new Date(tgl + "T12:00:00").toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const sholatList = jadwal
        ? [
              { label: "Imsak", waktu: jadwal.Imsak },
              { label: "Subuh", waktu: jadwal.Fajr },
              { label: "Terbit", waktu: jadwal.Sunrise },
              { label: "Dzuhur", waktu: jadwal.Dhuhr },
              { label: "Ashar", waktu: jadwal.Asr },
              { label: "Maghrib", waktu: jadwal.Maghrib },
              { label: "Isya", waktu: jadwal.Isha },
          ]
        : [];

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Jadwal Sholat
                    </h2>
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                </div>

                <p className="text-sm text-slate-500 mb-4">
                    {formatTgl(tanggal)}
                </p>

                {loading ? (
                    <p className="text-center text-slate-400 py-10">
                        Memuat...
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {sholatList.map((s) => (
                            <div
                                key={s.label}
                                className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-slate-600">
                                        {s.label}
                                    </span>
                                    <span className="text-sm font-bold text-[#3D7ABA] font-mono">
                                        {s.waktu?.slice(0, 5)} WIB
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-[10px] text-slate-400 mt-6">
                    Lokasi : Kedungpane, Mijen, Semarang
                </p>
            </div>
        </AppLayout>
    );
}
