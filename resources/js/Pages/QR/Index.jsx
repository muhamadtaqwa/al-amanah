import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";
import { usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [mode, setMode] = useState("camera");
    const [manualInput, setManualInput] = useState("");
    const scannerRef = useRef(null);
    const inputRef = useRef(null);

    const isAdmin = user.role === "admin";
    const profil = user.ustadz || user.santri || user.walisantri;
    const qrValue =
        user.role === "ustadz"
            ? profil?.niu
            : user.role === "santri"
              ? profil?.nis
              : user.role === "walisantri"
                ? profil?.niw
                : "";
    const nama = profil?.nama_lengkap || "Admin";

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        if (mode === "manual" && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    const startScan = async () => {
        setScanning(true);
        setScanResult(null);
        try {
            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    setScanResult(decodedText);
                    scanner.stop();
                    setScanning(false);
                },
                () => {},
            );
        } catch (err) {
            console.error(err);
            setScanning(false);
        }
    };

    const stopScan = async () => {
        if (scannerRef.current) {
            await scannerRef.current.stop();
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            setScanResult(manualInput.trim());
        }
    };

    return (
        <AppLayout>
            <div className="max-w-md mx-auto text-center">
                <h2 className="text-lg font-bold text-slate-800 mb-6">
                    {isAdmin ? "Scan Kode" : "Kode Saya"}
                </h2>

                {isAdmin ? (
                    <>
                        <div className="flex gap-2 mb-4 bg-slate-100 rounded-full p-1">
                            <button
                                onClick={() => {
                                    setMode("camera");
                                    stopScan();
                                }}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${mode === "camera" ? "bg-white shadow text-[#3D7ABA]" : "text-slate-500"}`}
                            >
                                Kamera
                            </button>
                            <button
                                onClick={() => {
                                    setMode("manual");
                                    stopScan();
                                }}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${mode === "manual" ? "bg-white shadow text-[#3D7ABA]" : "text-slate-500"}`}
                            >
                                Input Manual
                            </button>
                        </div>

                        {mode === "camera" && (
                            <>
                                <div
                                    id="reader"
                                    className="mx-auto rounded-2xl overflow-hidden shadow-2xl mb-4"
                                ></div>
                                {!scanning ? (
                                    <button
                                        onClick={startScan}
                                        className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Mulai Scan
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopScan}
                                        className="bg-red-500 text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Berhenti
                                    </button>
                                )}
                            </>
                        )}

                        {mode === "manual" && (
                            <form
                                onSubmit={handleManualSubmit}
                                className="space-y-3"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={manualInput}
                                    onChange={(e) =>
                                        setManualInput(e.target.value)
                                    }
                                    placeholder="Scan barcode atau input manual..."
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-xs text-center font-mono tracking-widest focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg"
                                >
                                    Cek Kode
                                </button>
                            </form>
                        )}

                        {scanResult && (
                            <div className="bg-emerald-50 rounded-2xl p-4 mt-4 border border-emerald-100">
                                <p className="text-sm text-emerald-700 font-medium">
                                    Hasil Scan:
                                </p>
                                <p className="text-lg font-bold text-emerald-800 mt-1 font-mono">
                                    {scanResult}
                                </p>
                                <button
                                    onClick={() => setScanResult(null)}
                                    className="text-xs text-emerald-600 mt-2 underline"
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Non-admin: Tampil Kode */
                    <div className="bg-gradient-to-br from-[#3D7ABA] to-[#20B5E8] rounded-[30px] p-8 shadow-2xl text-white">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 border-2 border-white/30">
                            {nama?.charAt(0) || "A"}
                        </div>
                        <h3 className="font-bold text-lg">{nama}</h3>
                        <p className="text-sm text-white/70">
                            {user.role.toUpperCase()} • {qrValue}
                        </p>

                        {/* QR Code */}
                        <div className="mt-6 bg-white rounded-2xl p-4 inline-block shadow-lg">
                            <QRCodeSVG
                                value={qrValue}
                                size={180}
                                level="H"
                                includeMargin
                            />
                        </div>

                        <p className="text-xs text-white/60 mt-4">
                            Tunjukkan kode ini untuk presensi
                        </p>
                    </div>
                )}

                <p className="text-xs text-slate-400 mt-6">
                    {isAdmin
                        ? "Gunakan kamera atau barcode scanner"
                        : "Tunjukkan kode ini"}
                </p>
            </div>
        </AppLayout>
    );
}
