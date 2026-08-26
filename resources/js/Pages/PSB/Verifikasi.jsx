import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Verifikasi() {
    const { pendaftar } = usePage().props;
    const [filter, setFilter] = useState("semua");
    const [detail, setDetail] = useState(null);
    const [confirmTerima, setConfirmTerima] = useState(null);
    const [confirmTolak, setConfirmTolak] = useState(null);
    const [confirmBatal, setConfirmBatal] = useState(null);

    const { data, setData, put, processing } = useForm({
        status: "diterima",
        catatan: "",
    });

    const filtered =
        filter === "semua"
            ? pendaftar
            : pendaftar.filter((p) => p.status === filter);

    const formatTgl = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleVerifikasi = (id, status) => {
        setData("status", status);
        put(`/psb/${id}/verifikasi`, {
            onSuccess: () => {
                setConfirmTerima(null);
                setConfirmTolak(null);
                setDetail(null);
                toast.success(
                    status === "diterima"
                        ? "Pendaftar diterima!"
                        : "Pendaftar ditolak!",
                );
            },
            onError: () => toast.error("Gagal memverifikasi."),
        });
    };

    const handleBatalkan = (id) => {
        router.put(
            `/psb/${id}/batalkan`,
            {},
            {
                onSuccess: () => {
                    setConfirmBatal(null);
                    setDetail(null);
                    toast.success("Status dikembalikan ke menunggu.");
                },
                onError: () => toast.error("Gagal membatalkan."),
            },
        );
    };

    const countMenunggu = pendaftar.filter(
        (p) => p.status === "menunggu",
    ).length;

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Verifikasi PSB
                        {countMenunggu > 0 && (
                            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {countMenunggu}
                            </span>
                        )}
                    </h2>
                    <div className="flex gap-2">
                        <a
                            href="/psb"
                            target="_blank"
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Form PSB
                        </a>
                        <a
                            href="/psb/cek"
                            target="_blank"
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Cek Status
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                    {["semua", "menunggu", "diterima", "ditolak"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`py-2 rounded-full text-xs font-medium transition ${filter === f ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada data
                        </p>
                    )}
                    {filtered.map((p) => (
                        <div
                            key={p.id}
                            onClick={() =>
                                setDetail(detail?.id === p.id ? null : p)
                            }
                            className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-2xl cursor-pointer hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                            {p.nik}
                                        </span>
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === "menunggu" ? "bg-amber-50 text-amber-600" : p.status === "diterima" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                                        >
                                            {p.status.charAt(0).toUpperCase() +
                                                p.status.slice(1)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm truncate">
                                        {p.nama_lengkap}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {p.program_studi} • {p.nomor_hp}
                                    </p>
                                </div>
                                <i
                                    className={`fa-solid fa-chevron-${detail?.id === p.id ? "up" : "down"} text-slate-300 ml-2`}
                                ></i>
                            </div>

                            {detail?.id === p.id && (
                                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                                    <Row label="NIK" value={p.nik} />
                                    <Row label="NISN" value={p.nisn} />
                                    <Row label="Nama" value={p.nama_lengkap} />
                                    <Row
                                        label="Tempat, Tgl Lahir"
                                        value={`${p.tempat_lahir || "-"}, ${formatTgl(p.tanggal_lahir)}`}
                                    />
                                    <Row
                                        label="Jenis Kelamin"
                                        value={
                                            p.jenis_kelamin === "laki-laki"
                                                ? "Laki-laki"
                                                : p.jenis_kelamin ===
                                                    "perempuan"
                                                  ? "Perempuan"
                                                  : "-"
                                        }
                                    />
                                    <Row
                                        label="Program Studi"
                                        value={p.program_studi}
                                    />
                                    <Row label="Angkatan" value={p.angkatan} />
                                    <Row label="Nomor HP" value={p.nomor_hp} />
                                    <Row
                                        label="Alamat"
                                        value={`${p.alamat || "-"}, ${p.desa || "-"}, ${p.kecamatan || "-"}, ${p.kabupaten || "-"}, ${p.provinsi || "-"}`}
                                    />
                                    <hr className="border-slate-100" />
                                    <p className="font-semibold text-slate-600">
                                        Orang Tua
                                    </p>
                                    <Row
                                        label="Nama Ayah"
                                        value={p.nama_ayah}
                                    />
                                    <Row label="NIK Ayah" value={p.nik_ayah} />
                                    <Row
                                        label="Pekerjaan Ayah"
                                        value={p.pekerjaan_ayah}
                                    />
                                    <Row label="Nama Ibu" value={p.nama_ibu} />
                                    <Row label="NIK Ibu" value={p.nik_ibu} />
                                    <Row
                                        label="Pekerjaan Ibu"
                                        value={p.pekerjaan_ibu}
                                    />
                                    <Row
                                        label="No HP Orang Tua"
                                        value={p.no_hp_orang_tua}
                                    />
                                    {p.catatan && (
                                        <Row
                                            label="Catatan"
                                            value={p.catatan}
                                        />
                                    )}

                                    {/* Tombol untuk status menunggu */}
                                    {p.status === "menunggu" && (
                                        <div className="flex gap-2 pt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmTerima(p);
                                                }}
                                                className="flex-1 bg-emerald-500 text-white py-2 rounded-2xl text-xs font-semibold hover:bg-emerald-600 transition"
                                            >
                                                Terima
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmTolak(p);
                                                }}
                                                className="flex-1 bg-red-500 text-white py-2 rounded-2xl text-xs font-semibold hover:bg-red-600 transition"
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    )}

                                    {/* Tombol batalkan untuk sudah diterima/ditolak */}
                                    {(p.status === "diterima" ||
                                        p.status === "ditolak") && (
                                        <div className="flex gap-2 pt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmBatal(p);
                                                }}
                                                className="w-full bg-slate-500 text-white py-2 rounded-2xl text-xs font-semibold hover:bg-slate-600 transition"
                                            >
                                                Batalkan Verifikasi
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Popup Konfirmasi Terima */}
                {confirmTerima && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setConfirmTerima(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Terima Pendaftar?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                <strong>{confirmTerima.nama_lengkap}</strong>{" "}
                                akan diterima sebagai santri.
                            </p>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setConfirmTerima(null)}
                                    className="flex-1 border py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleVerifikasi(
                                            confirmTerima.id,
                                            "diterima",
                                        )
                                    }
                                    disabled={processing}
                                    className="flex-1 bg-emerald-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    {processing ? "..." : "Ya, Terima"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popup Konfirmasi Tolak */}
                {confirmTolak && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setConfirmTolak(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100">
                            <h3 className="font-semibold text-lg">
                                Tolak Pendaftar?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                <strong>{confirmTolak.nama_lengkap}</strong>{" "}
                                akan ditolak.
                            </p>
                            <textarea
                                placeholder="Alasan penolakan (opsional)..."
                                value={data.catatan}
                                onChange={(e) =>
                                    setData("catatan", e.target.value)
                                }
                                className="w-full border border-slate-200 rounded-2xl px-4 py-2 text-xs outline-none mt-3"
                                rows={2}
                            ></textarea>
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={() => setConfirmTolak(null)}
                                    className="flex-1 border py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleVerifikasi(
                                            confirmTolak.id,
                                            "ditolak",
                                        )
                                    }
                                    disabled={processing}
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    {processing ? "..." : "Ya, Tolak"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popup Konfirmasi Batalkan */}
                {confirmBatal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setConfirmBatal(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Batalkan Verifikasi?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Status{" "}
                                <strong>{confirmBatal.nama_lengkap}</strong>{" "}
                                akan kembali ke <strong>menunggu</strong>.
                            </p>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setConfirmBatal(null)}
                                    className="flex-1 border py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleBatalkan(confirmBatal.id)
                                    }
                                    className="flex-1 bg-slate-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    Ya, Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-600 text-right ml-4">
            {value || "-"}
        </span>
    </div>
);
