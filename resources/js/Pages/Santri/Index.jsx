import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { santris, walisantris, auth } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");

    const { data, setData, post, put, reset, processing } = useForm({
        nis: "",
        nik: "",
        nama_lengkap: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        program_studi: "",
        angkatan: "",
        kamar: "",
        nomor_hp: "",
        status: "aktif",
        password: "",
        walisantri_id: "",
    });

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (santri) => {
        setEditData(santri);
        setData({
            nis: santri.nis,
            nik: santri.nik || "",
            nama_lengkap: santri.nama_lengkap,
            tempat_lahir: santri.tempat_lahir || "",
            tanggal_lahir: santri.tanggal_lahir || "",
            jenis_kelamin: santri.jenis_kelamin || "",
            program_studi: santri.program_studi || "",
            angkatan: santri.angkatan || "",
            kamar: santri.kamar || "",
            nomor_hp: santri.nomor_hp || "",
            status: santri.status || "aktif",
            password: "",
            walisantri_id: santri.walisantri_id || "",
        });
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        reset();
    };
    const submit = (e) => {
        e.preventDefault();
        editData
            ? put(`/santri/${editData.id}`, { onSuccess: () => closeModal() })
            : post("/santri", { onSuccess: () => closeModal() });
    };
    const handleDelete = (id, nama) => {
        if (confirm(`Hapus santri "${nama}"?`)) router.delete(`/santri/${id}`);
    };

    const filtered = santris.filter(
        (s) =>
            s.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
            s.nis?.toLowerCase().includes(search.toLowerCase()),
    );

    const formatTgl = (tgl) => {
        if (!tgl) return null;
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Data Santri
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition"
                        >
                            + Tambah
                        </button>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama atau NIS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Tidak ada data santri
                        </p>
                    )}
                    {filtered.map((santri) => (
                        <div
                            key={santri.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-2xl hover:shadow-xl transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    {/* Badges */}
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-2.5 py-1 rounded-full font-medium">
                                            {santri.nis}
                                        </span>
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                santri.status === "aktif"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : santri.status === "lulus"
                                                      ? "bg-[#20B5E8]/10 text-[#20B5E8]"
                                                      : "bg-red-50 text-red-500"
                                            }`}
                                        >
                                            {santri.status
                                                ?.charAt(0)
                                                .toUpperCase() +
                                                santri.status?.slice(1)}
                                        </span>
                                    </div>

                                    {/* Nama */}
                                    <h3 className="font-semibold text-sm truncate">
                                        {santri.nama_lengkap}
                                    </h3>

                                    {/* Detail */}
                                    <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                                        {santri.nik && <p>NIK {santri.nik}</p>}
                                        {(santri.tempat_lahir ||
                                            santri.tanggal_lahir) && (
                                            <p>
                                                {santri.tempat_lahir}
                                                {santri.tempat_lahir &&
                                                    santri.tanggal_lahir &&
                                                    ", "}
                                                {formatTgl(
                                                    santri.tanggal_lahir,
                                                )}
                                            </p>
                                        )}
                                        {santri.jenis_kelamin && (
                                            <p>
                                                {santri.jenis_kelamin ===
                                                "laki-laki"
                                                    ? "Laki-laki"
                                                    : "Perempuan"}
                                            </p>
                                        )}
                                        {(santri.program_studi ||
                                            santri.angkatan) && (
                                            <p>
                                                {santri.program_studi}
                                                {santri.program_studi &&
                                                    santri.angkatan &&
                                                    " • "}
                                                {santri.angkatan &&
                                                    `Angkatan ${santri.angkatan}`}
                                            </p>
                                        )}
                                        {santri.kamar && (
                                            <p>Kamar {santri.kamar}</p>
                                        )}
                                        {santri.nomor_hp && (
                                            <p>{santri.nomor_hp}</p>
                                        )}
                                        <p>
                                            Walisantri :{" "}
                                            {santri.walisantri?.nama_lengkap ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex flex-col gap-1 ml-2 shrink-0">
                                        <button
                                            onClick={() => openEdit(santri)}
                                            className="bg-slate-100 px-3 py-1.5 rounded-xl text-[11px] hover:bg-[#3D7ABA]/10 hover:text-[#3D7ABA] transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    santri.id,
                                                    santri.nama_lengkap,
                                                )
                                            }
                                            className="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-[11px] hover:bg-red-100 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={closeModal}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-8 border border-sky-100 my-8">
                            <h3 className="font-semibold text-lg mb-4">
                                {editData ? "Edit" : "Tambah"} Santri
                            </h3>
                            <form onSubmit={submit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="NIS"
                                    value={data.nis}
                                    onChange={(e) =>
                                        setData("nis", e.target.value)
                                    }
                                    disabled={!!editData}
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm disabled:bg-slate-50 focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="NIK"
                                    value={data.nik}
                                    onChange={(e) =>
                                        setData("nik", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={data.nama_lengkap}
                                    onChange={(e) =>
                                        setData("nama_lengkap", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Tempat Lahir"
                                        value={data.tempat_lahir}
                                        onChange={(e) =>
                                            setData(
                                                "tempat_lahir",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                    />
                                    <input
                                        type="date"
                                        placeholder="Tanggal Lahir"
                                        value={data.tanggal_lahir}
                                        onChange={(e) =>
                                            setData(
                                                "tanggal_lahir",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                    />
                                </div>
                                <select
                                    value={data.jenis_kelamin}
                                    onChange={(e) =>
                                        setData("jenis_kelamin", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm bg-white focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                >
                                    <option value="">
                                        Pilih Jenis Kelamin
                                    </option>
                                    <option value="laki-laki">Laki-laki</option>
                                    <option value="perempuan">Perempuan</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Program Studi"
                                    value={data.program_studi}
                                    onChange={(e) =>
                                        setData("program_studi", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Angkatan"
                                    value={data.angkatan}
                                    onChange={(e) =>
                                        setData("angkatan", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Kamar"
                                    value={data.kamar}
                                    onChange={(e) =>
                                        setData("kamar", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Nomor HP"
                                    value={data.nomor_hp}
                                    onChange={(e) =>
                                        setData("nomor_hp", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                />
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm bg-white focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="lulus">Lulus</option>
                                    <option value="keluar">Keluar</option>
                                </select>
                                {!editData && (
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                        required
                                    />
                                )}
                                <select
                                    value={data.walisantri_id}
                                    onChange={(e) =>
                                        setData("walisantri_id", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm bg-white focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                    required
                                >
                                    <option value="">Pilih Walisantri</option>
                                    {walisantris.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.nama_lengkap} ({w.niw})
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 border border-slate-200 py-3 rounded-2xl text-sm hover:bg-slate-50 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition disabled:opacity-50"
                                    >
                                        {editData ? "Update" : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
