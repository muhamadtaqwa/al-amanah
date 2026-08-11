import { useState, useRef } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { tagihan, rekening } = usePage().props;
    const [filter, setFilter] = useState("semua");
    const [showUpload, setShowUpload] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [fileName, setFileName] = useState("");
    const fileRef = useRef(null);

    const handleUpload = (id) => {
        const file = fileRef.current?.files[0];
        if (!file) return toast.error("Pilih file dulu");

        setUploadingId(id);
        const formData = new FormData();
        formData.append("bukti", file);

        router.post(`/pembayaran/${id}/upload-bukti`, formData, {
            onSuccess: () => {
                setShowUpload(null);
                setFileName("");
                setUploadingId(null);
                toast.success("Bukti berhasil diupload!");
            },
            onError: () => {
                toast.error("Gagal upload. Coba lagi.");
                setUploadingId(null);
            },
            forceFormData: true,
        });
    };

    const filtered =
        filter === "semua"
            ? tagihan
            : tagihan.filter((t) => t.status === filter);
    const totalBelum = tagihan
        .filter((t) => t.status === "menunggu" || t.status === "dicicil")
        .reduce((s, t) => s + (t.sisa || t.nominal), 0);
    const totalLunas = tagihan
        .filter((t) => t.status === "lunas")
        .reduce((s, t) => s + t.nominal, 0);

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Tagihan
                </h2>

                <div className="space-y-2 mb-6">
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Total Semua
                        </span>
                        <span className="text-base font-extrabold text-[#3D7ABA] font-mono tracking-tight">
                            Rp {(totalBelum + totalLunas).toLocaleString()}
                        </span>
                    </div>
                    {totalLunas > 0 && (
                        <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                            <span className="text-sm text-slate-500">
                                Lunas
                            </span>
                            <span className="text-base font-extrabold text-emerald-600 font-mono tracking-tight">
                                Rp {totalLunas.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {totalBelum > 0 && (
                        <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                            <span className="text-sm text-slate-500">
                                Belum Lunas
                            </span>
                            <span className="text-base font-extrabold text-red-500 font-mono tracking-tight">
                                Rp {totalBelum.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {rekening && (
                    <div className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl mb-4">
                        <h4 className="text-sm font-semibold mb-2">
                            Rekening Yayasan
                        </h4>
                        <p className="text-sm text-slate-600">
                            {rekening.bank} - {rekening.nomor_rekening} a.n{" "}
                            {rekening.atas_nama}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {["semua", "menunggu", "lunas"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`py-2 rounded-full text-xs font-medium transition ${filter === f ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500 hover:border-[#20B5E8]"}`}
                        >
                            {f === "semua"
                                ? "Semua"
                                : f === "menunggu"
                                  ? "Belum"
                                  : "Lunas"}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada tagihan
                        </p>
                    )}
                    {filtered.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                                    {t.jenis}
                                </span>
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium ${t.status === "lunas" ? "bg-emerald-50 text-emerald-600" : t.status === "ditolak" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}
                                >
                                    {t.status === "lunas"
                                        ? "Lunas"
                                        : t.status === "ditolak"
                                          ? "Ditolak"
                                          : "Menunggu"}
                                </span>
                            </div>
                            <h3 className="font-semibold text-sm">
                                {t.nama_pembayaran}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                {t.santri?.nama_lengkap} ({t.nis})
                            </p>
                            <p className="text-lg font-bold mt-2 font-mono tracking-tight">
                                Rp {parseInt(t.nominal).toLocaleString()}
                            </p>

                            {t.total_dibayar > 0 && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-emerald-500 font-mono">
                                            Dibayar: Rp{" "}
                                            {t.total_dibayar?.toLocaleString()}
                                        </span>
                                        <span className="text-red-400 font-mono">
                                            Sisa: Rp {t.sisa?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-emerald-500 h-2 rounded-full"
                                            style={{
                                                width: `${(t.total_dibayar / t.nominal) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {t.status !== "lunas" && (
                                <div className="mt-3 pt-3 border-t">
                                    {t.bukti ? (
                                        <p className="text-xs text-[#3D7ABA] bg-[#3D7ABA]/5 px-3 py-2 rounded-2xl">
                                            ✅ Bukti diupload - Menunggu
                                            verifikasi
                                        </p>
                                    ) : (
                                        <>
                                            {showUpload === t.id ? (
                                                <div>
                                                    <label className="flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 cursor-pointer hover:border-[#20B5E8] transition mb-2">
                                                        {fileName ? (
                                                            <span className="text-xs text-emerald-600 font-medium">
                                                                📄 {fileName}
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <i className="fa-solid fa-cloud-upload text-slate-400"></i>
                                                                <span className="text-xs text-slate-500">
                                                                    Klik untuk
                                                                    pilih file
                                                                </span>
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={fileRef}
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file =
                                                                    e.target
                                                                        .files[0];
                                                                if (file)
                                                                    setFileName(
                                                                        file.name,
                                                                    );
                                                            }}
                                                        />
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleUpload(
                                                                    t.id,
                                                                )
                                                            }
                                                            disabled={
                                                                uploadingId ===
                                                                t.id
                                                            }
                                                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg disabled:opacity-50"
                                                        >
                                                            {uploadingId ===
                                                            t.id
                                                                ? "Mengupload..."
                                                                : "Upload"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowUpload(
                                                                    null,
                                                                );
                                                                setFileName("");
                                                            }}
                                                            className="text-xs text-slate-400"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setShowUpload(t.id)
                                                    }
                                                    className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg hover:scale-[1.02] transition"
                                                >
                                                    Upload Bukti TF
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
