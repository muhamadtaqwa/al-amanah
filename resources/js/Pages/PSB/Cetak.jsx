import { usePage } from "@inertiajs/react";

export default function Cetak() {
    const { data } = usePage().props;

    const formatTgl = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-white p-6 max-w-md mx-auto print:p-2">
            <div className="text-center border-b pb-4 mb-4">
                <img
                    src="/images/logo-alamanah.png"
                    alt="Logo"
                    className="h-16 mx-auto mb-2"
                />
                <h1 className="text-lg font-bold text-slate-800">
                    Bukti Pendaftaran
                </h1>
                <p className="text-xs text-slate-400">PSB Al-Amanah</p>
            </div>

            <div className="space-y-2 text-sm">
                <Row label="No. Pendaftaran" value={data.id} />
                <Row
                    label="Tanggal Daftar"
                    value={formatTgl(data.created_at)}
                />
                <Row label="NIK" value={data.nik} />
                <Row label="NISN" value={data.nisn} />
                <Row label="Nama" value={data.nama_lengkap} />
                <Row label="Program Studi" value={data.program_studi} />
                <Row label="Angkatan" value={data.angkatan} />
                <Row label="Nomor HP" value={data.nomor_hp} />
                <Row
                    label="Status"
                    value={
                        data.status === "menunggu"
                            ? "Menunggu Verifikasi"
                            : data.status === "diterima"
                              ? "Diterima"
                              : "Ditolak"
                    }
                />
            </div>

            <p className="text-xs text-slate-400 text-center mt-6">
                Simpan bukti ini untuk mengecek status pendaftaran.
            </p>

            <div className="text-center mt-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg"
                >
                    Cetak
                </button>
            </div>
        </div>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between border-b border-slate-100 py-1.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-700 text-right">
            {value || "-"}
        </span>
    </div>
);
