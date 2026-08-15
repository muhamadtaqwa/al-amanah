import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Santri() {
    const { presensi, tanggal } = usePage().props;
    const [selectedDate, setSelectedDate] = useState(tanggal);
    const [nis, setNis] = useState("");
    const [sending, setSending] = useState(false);

    const playBeep = () => {
        try {
            const ctx = new (
                window.AudioContext || window.webkitAudioContext
            )();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 1200;
            gain.gain.value = 0.1;
            osc.start();
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, 300);
        } catch (e) {
            console.log("Audio tidak didukung");
        }
    };

    const handleScan = (nisTerbaca) => {
        setSending(true);
        router.post(
            "/presensi-santri",
            { nis: nisTerbaca },
            {
                onSuccess: () => {
                    playBeep();
                    toast.success("Presensi berhasil!");
                    setNis("");
                    setSending(false);
                },
                onError: (errors) => {
                    toast.error(
                        errors?.error ||
                            "Santri sudah presensi atau data tidak ditemukan.",
                    );
                    setNis("");
                    setSending(false);
                },
            },
        );
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        router.get(
            "/presensi-santri",
            { tanggal: e.target.value },
            { preserveState: true },
        );
    };

    const formatJam = (jam) => {
        return jam?.slice(0, 5);
    };

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Presensi Santri
                    </h2>
                    <a
                        href="/presensi-santri/rekap"
                        className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg hover:scale-[1.02] transition"
                    >
                        Rekap
                    </a>
                </div>

                {/* Tanggal */}
                <div className="mb-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                </div>

                {/* Input manual scan */}
                <div className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl mb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                        Scan QR / Input NIS
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Masukkan NIS santri"
                            value={nis}
                            onChange={(e) => setNis(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && nis) {
                                    e.preventDefault();
                                    handleScan(nis);
                                }
                            }}
                            className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                            autoFocus
                        />
                        <button
                            onClick={() => handleScan(nis)}
                            disabled={!nis || sending}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg disabled:opacity-50"
                        >
                            Simpan
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                        Scan QR santri lalu NIS akan terisi otomatis, tekan
                        Enter untuk simpan
                    </p>
                    {sending && (
                        <p className="text-xs text-slate-400 mt-2">
                            Menyimpan...
                        </p>
                    )}
                </div>

                {/* Info tanggal */}
                <p className="text-sm text-slate-500 mb-3">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                        "id-ID",
                        {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        },
                    )}
                </p>

                {/* Daftar presensi */}
                <div className="space-y-2">
                    {presensi.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Belum ada santri presensi
                        </p>
                    )}
                    {presensi.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {p.santri?.nama_lengkap?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {p.santri?.nama_lengkap || p.nis}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {p.nis}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs font-mono text-slate-400">
                                    {formatJam(p.jam)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
