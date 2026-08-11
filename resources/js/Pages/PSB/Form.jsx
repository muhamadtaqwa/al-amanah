import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";

export default function Form() {
    const { flash } = usePage().props;
    const psbId = flash?.psb_id || null;

    const prodiList = [
        "S1 Kedokteran",
        "S1 Bimbingan dan Penyuluhan Islam",
        "S1 Komunikasi dan Penyiaran Islam",
        "S1 Manajemen Dakwah",
        "S1 Pengembangan Masyarakat Islam",
        "S1 Manajemen Haji dan Umrah",
        "S1 Hukum Keluarga Islam",
        "S1 Hukum Pidana Islam",
        "S1 Hukum Ekonomi Syariah",
        "S1 Ilmu Falak",
        "S1 Ilmu Hukum",
        "S1 Pendidikan Agama Islam",
        "S1 Pendidikan Bahasa Arab",
        "S1 Manajemen Pendidikan Islam",
        "S1 Pendidikan Bahasa Inggris",
        "S1 Pendidikan Guru Madrasah Ibtidaiyah",
        "S1 Pendidikan Islam Anak Usia Dini",
        "S1 Aqidah dan Filsafat Islam",
        "S1 Ilmu Al-Qur'an dan Tafsir",
        "S1 Studi Agama-Agama",
        "S1 Tasawuf dan Psikoterapi",
        "S1 Ilmu Seni dan Arsitektur Islam",
        "S1 Ilmu Hadis",
        "S1 Ekonomi Syariah",
        "S1 Perbankan Syariah",
        "S1 Akuntansi Syariah",
        "S1 Manajemen",
        "S1 Bisnis Digital",
        "S1 Ilmu Politik",
        "S1 Sosiologi",
        "S1 Psikologi",
        "S1 Gizi",
        "S1 Biologi",
        "S1 Fisika",
        "S1 Kimia",
        "S1 Matematika",
        "S1 Pendidikan Matematika",
        "S1 Pendidikan Fisika",
        "S1 Pendidikan Kimia",
        "S1 Pendidikan Biologi",
        "S1 Teknologi Informasi",
        "S1 Teknik Lingkungan",
        "S2 Komunikasi dan Penyiaran Islam",
        "S2 Ilmu Falak",
        "S2 Hukum",
        "S2 Pendidikan Agama Islam",
        "S2 Manajemen Pendidikan Islam",
        "S2 Pendidikan Bahasa Arab",
        "S2 Ilmu Al-Qur'an dan Tafsir",
        "S2 Ekonomi Syariah",
        "S2 Ilmu Agama Islam",
        "S3 Pendidikan Agama Islam",
        "S3 Studi Islam",
    ];

    const provinsiList = [
        "Aceh",
        "Sumatera Utara",
        "Sumatera Barat",
        "Riau",
        "Jambi",
        "Sumatera Selatan",
        "Bengkulu",
        "Lampung",
        "Kepulauan Bangka Belitung",
        "Kepulauan Riau",
        "DKI Jakarta",
        "Jawa Barat",
        "Jawa Tengah",
        "DI Yogyakarta",
        "Jawa Timur",
        "Banten",
        "Bali",
        "Nusa Tenggara Barat",
        "Nusa Tenggara Timur",
        "Kalimantan Barat",
        "Kalimantan Tengah",
        "Kalimantan Selatan",
        "Kalimantan Timur",
        "Kalimantan Utara",
        "Sulawesi Utara",
        "Sulawesi Tengah",
        "Sulawesi Selatan",
        "Sulawesi Tenggara",
        "Gorontalo",
        "Sulawesi Barat",
        "Maluku",
        "Maluku Utara",
        "Papua",
        "Papua Barat",
        "Papua Selatan",
        "Papua Tengah",
        "Papua Pegunungan",
        "Papua Barat Daya",
    ];

    const [sukses, setSukses] = useState(false);
    const [suksesId, setSuksesId] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        nik: "",
        nisn: "",
        nama_lengkap: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        alamat: "",
        desa: "",
        kecamatan: "",
        kabupaten: "",
        provinsi: "",
        program_studi: "",
        angkatan: "",
        kamar: "",
        nomor_hp: "",
        nama_ayah: "",
        nik_ayah: "",
        pekerjaan_ayah: "",
        nama_ibu: "",
        nik_ibu: "",
        pekerjaan_ibu: "",
        no_hp_orang_tua: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/psb", {
            onSuccess: () => {
                const id =
                    psbId ||
                    new URLSearchParams(window.location.search).get("psb_id");
                setSuksesId(id);
                reset();
                setSukses(true);
            },
        });
    };

    if (sukses) {
        return (
            <div className="min-h-screen bg-[#EEF8FD] flex items-center justify-center p-4">
                <div className="bg-white rounded-[30px] shadow-2xl p-8 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-check text-3xl text-emerald-500"></i>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">
                        Pendaftaran Berhasil!
                    </h2>
                    {suksesId && (
                        <p className="text-sm text-slate-500 mb-1">
                            No. Pendaftaran: <strong>{suksesId}</strong>
                        </p>
                    )}
                    <p className="text-xs text-slate-400 mb-6">
                        Data kamu sudah terkirim. Silakan tunggu verifikasi dari
                        admin pondok.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSukses(false)}
                            className="flex-1 border border-slate-200 py-3 rounded-2xl text-sm"
                        >
                            Daftar Lagi
                        </button>
                        {suksesId && (
                            <a
                                href={`/psb/cetak/${suksesId}`}
                                className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold text-center"
                            >
                                Cetak Bukti
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EEF8FD] py-6 px-4">
            <div className="bg-white rounded-[30px] shadow-2xl p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <img
                        src="/images/logo-alamanah.png"
                        alt="Logo"
                        className="h-16 mx-auto mb-2"
                    />
                    <h1 className="text-lg font-bold text-slate-800">
                        PSB Al-Amanah
                    </h1>
                    <p className="text-xs text-slate-400">
                        Form Pendaftaran Santri Baru
                    </p>
                    <a
                        href="/psb/cek"
                        className="text-xs text-[#3D7ABA] underline mt-1 inline-block"
                    >
                        Cek Status Pendaftaran
                    </a>
                </div>

                <form onSubmit={submit} className="space-y-2.5">
                    <p className="text-[11px] font-semibold text-slate-500">
                        Data Diri
                    </p>
                    <input
                        type="text"
                        placeholder="NIK *"
                        value={data.nik}
                        onChange={(e) => setData("nik", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        required
                    />
                    <input
                        type="text"
                        placeholder="NISN"
                        value={data.nisn}
                        onChange={(e) => setData("nisn", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Nama Lengkap *"
                        value={data.nama_lengkap}
                        onChange={(e) =>
                            setData("nama_lengkap", e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        required
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Tempat Lahir"
                            value={data.tempat_lahir}
                            onChange={(e) =>
                                setData("tempat_lahir", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="date"
                            value={data.tanggal_lahir}
                            onChange={(e) =>
                                setData("tanggal_lahir", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                    </div>
                    <select
                        value={data.jenis_kelamin}
                        onChange={(e) =>
                            setData("jenis_kelamin", e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                    >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                    </select>

                    <p className="text-[11px] font-semibold text-slate-500 mt-2">
                        Alamat
                    </p>
                    <input
                        type="text"
                        placeholder="Alamat"
                        value={data.alamat}
                        onChange={(e) => setData("alamat", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Desa"
                            value={data.desa}
                            onChange={(e) => setData("desa", e.target.value)}
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Kecamatan"
                            value={data.kecamatan}
                            onChange={(e) =>
                                setData("kecamatan", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Kabupaten"
                            value={data.kabupaten}
                            onChange={(e) =>
                                setData("kabupaten", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <select
                            value={data.provinsi}
                            onChange={(e) =>
                                setData("provinsi", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                        >
                            <option value="">Provinsi</option>
                            {provinsiList.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-500 mt-2">
                        Pendidikan
                    </p>
                    <select
                        value={data.program_studi}
                        onChange={(e) =>
                            setData("program_studi", e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                        required
                    >
                        <option value="">Pilih Program Studi *</option>
                        {prodiList.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Angkatan (contoh: 2024)"
                        value={data.angkatan}
                        onChange={(e) => setData("angkatan", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />

                    <p className="text-[11px] font-semibold text-slate-500 mt-2">
                        Kontak
                    </p>
                    <input
                        type="text"
                        placeholder="Nomor HP *"
                        value={data.nomor_hp}
                        onChange={(e) => setData("nomor_hp", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        required
                    />

                    <p className="text-[11px] font-semibold text-slate-500 mt-2">
                        Data Orang Tua
                    </p>
                    <input
                        type="text"
                        placeholder="Nama Ayah"
                        value={data.nama_ayah}
                        onChange={(e) => setData("nama_ayah", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="NIK Ayah"
                        value={data.nik_ayah}
                        onChange={(e) => setData("nik_ayah", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Pekerjaan Ayah"
                        value={data.pekerjaan_ayah}
                        onChange={(e) =>
                            setData("pekerjaan_ayah", e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Nama Ibu"
                        value={data.nama_ibu}
                        onChange={(e) => setData("nama_ibu", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="NIK Ibu"
                        value={data.nik_ibu}
                        onChange={(e) => setData("nik_ibu", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Pekerjaan Ibu"
                        value={data.pekerjaan_ibu}
                        onChange={(e) =>
                            setData("pekerjaan_ibu", e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="No HP Orang Tua"
                        value={data.no_hp_orang_tua}
                        onChange={(e) =>
                            setData("no_hp_orang_tua", e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold shadow-lg transition disabled:opacity-50 mt-2"
                    >
                        Daftar Sekarang
                    </button>
                </form>
            </div>
        </div>
    );
}
