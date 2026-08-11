import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { ustadzs, auth } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");

    const { data, setData, post, put, reset, processing } = useForm({
        niu: "",
        nip_nuptk: "",
        nik: "",
        nama_lengkap: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        pendidikan_terakhir: "",
        alamat: "",
        status: "aktif",
        status_kepegawaian: "",
        tanggal_mulai_tugas: "",
        nomor_hp: "",
        password: "",
    });

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (u) => {
        setEditData(u);
        setData({
            niu: u.niu,
            nip_nuptk: u.nip_nuptk || "",
            nik: u.nik || "",
            nama_lengkap: u.nama_lengkap,
            tempat_lahir: u.tempat_lahir || "",
            tanggal_lahir: u.tanggal_lahir || "",
            jenis_kelamin: u.jenis_kelamin || "",
            pendidikan_terakhir: u.pendidikan_terakhir || "",
            alamat: u.alamat || "",
            status: u.status || "aktif",
            status_kepegawaian: u.status_kepegawaian || "",
            tanggal_mulai_tugas: u.tanggal_mulai_tugas || "",
            nomor_hp: u.nomor_hp || "",
            password: "",
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
            ? put(`/ustadz/${editData.id}`, {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Ustadz berhasil diupdate!");
                  },
                  onError: () => toast.error("Gagal mengupdate ustadz."),
              })
            : post("/ustadz", {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Ustadz berhasil ditambah!");
                  },
                  onError: () => toast.error("Gagal menambah ustadz."),
              });
    };
    const handleDelete = (id, nama) => {
        if (confirm(`Hapus ustadz "${nama}"?`)) {
            router.delete(`/ustadz/${id}`, {
                onSuccess: () => toast.success("Ustadz berhasil dihapus!"),
                onError: () => toast.error("Gagal menghapus ustadz."),
            });
        }
    };

    const filtered = ustadzs.filter(
        (u) =>
            u.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
            u.niu?.toLowerCase().includes(search.toLowerCase()),
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
                        Data Ustadz
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
                        placeholder="Cari nama atau NIU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Tidak ada data ustadz
                        </p>
                    )}
                    {filtered.map((u) => (
                        <div
                            key={u.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-2xl hover:shadow-xl transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="text-xs bg-[#20B5E8]/10 text-[#20B5E8] px-2.5 py-1 rounded-full font-medium">
                                            {u.niu}
                                        </span>
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.status === "aktif" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                                        >
                                            {u.status?.charAt(0).toUpperCase() +
                                                u.status?.slice(1)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm truncate">
                                        {u.nama_lengkap}
                                    </h3>
                                    <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                                        {u.nip_nuptk && (
                                            <p>NIP/NUPTK: {u.nip_nuptk}</p>
                                        )}
                                        {u.nik && <p>NIK: {u.nik}</p>}
                                        {(u.tempat_lahir ||
                                            u.tanggal_lahir) && (
                                            <p>
                                                {u.tempat_lahir}
                                                {u.tempat_lahir &&
                                                    u.tanggal_lahir &&
                                                    ", "}
                                                {formatTgl(u.tanggal_lahir)}
                                            </p>
                                        )}
                                        {u.jenis_kelamin && (
                                            <p>
                                                {u.jenis_kelamin === "laki-laki"
                                                    ? "Laki-laki"
                                                    : "Perempuan"}
                                            </p>
                                        )}
                                        {u.pendidikan_terakhir && (
                                            <p>{u.pendidikan_terakhir}</p>
                                        )}
                                        {u.status_kepegawaian && (
                                            <p>{u.status_kepegawaian}</p>
                                        )}
                                        {u.nomor_hp && <p>{u.nomor_hp}</p>}
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex flex-col gap-1 ml-2 shrink-0">
                                        <button
                                            onClick={() => openEdit(u)}
                                            className="bg-slate-100 px-3 py-1.5 rounded-xl text-[11px] hover:bg-[#3D7ABA]/10 hover:text-[#3D7ABA] transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    u.id,
                                                    u.nama_lengkap,
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
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-black/50"
                                onClick={closeModal}
                            ></div>
                            <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100 my-4">
                                <h3 className="font-semibold text-lg mb-4">
                                    {editData ? "Edit" : "Tambah"} Ustadz
                                </h3>
                                <form
                                    onSubmit={submit}
                                    className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1"
                                >
                                    <input
                                        type="text"
                                        placeholder="NIU"
                                        value={data.niu}
                                        onChange={(e) =>
                                            setData("niu", e.target.value)
                                        }
                                        disabled={!!editData}
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm disabled:bg-slate-50 outline-none"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="NIP/NIPPPK/NUPTK"
                                        value={data.nip_nuptk}
                                        onChange={(e) =>
                                            setData("nip_nuptk", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="NIK"
                                        value={data.nik}
                                        onChange={(e) =>
                                            setData("nik", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap"
                                        value={data.nama_lengkap}
                                        onChange={(e) =>
                                            setData(
                                                "nama_lengkap",
                                                e.target.value,
                                            )
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
                                                setData(
                                                    "tempat_lahir",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="date"
                                            value={data.tanggal_lahir}
                                            onChange={(e) =>
                                                setData(
                                                    "tanggal_lahir",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                    </div>
                                    <select
                                        value={data.jenis_kelamin}
                                        onChange={(e) =>
                                            setData(
                                                "jenis_kelamin",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    >
                                        <option value="">
                                            Pilih Jenis Kelamin
                                        </option>
                                        <option value="laki-laki">
                                            Laki-laki
                                        </option>
                                        <option value="perempuan">
                                            Perempuan
                                        </option>
                                    </select>
                                    <select
                                        value={data.pendidikan_terakhir}
                                        onChange={(e) =>
                                            setData(
                                                "pendidikan_terakhir",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    >
                                        <option value="">
                                            Pilih Pendidikan Terakhir
                                        </option>
                                        <option value="SMA/Sederajat">
                                            SMA/Sederajat
                                        </option>
                                        <option value="D1">D1</option>
                                        <option value="D2">D2</option>
                                        <option value="D3">D3</option>
                                        <option value="S1">S1</option>
                                        <option value="S2">S2</option>
                                        <option value="S3">S3</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Alamat"
                                        value={data.alamat}
                                        onChange={(e) =>
                                            setData("alamat", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                    <select
                                        value={data.status_kepegawaian}
                                        onChange={(e) =>
                                            setData(
                                                "status_kepegawaian",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    >
                                        <option value="">
                                            Status Kepegawaian
                                        </option>
                                        <option value="PNS">PNS</option>
                                        <option value="PPPK">PPPK</option>
                                        <option value="Honorer">Honorer</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={data.tanggal_mulai_tugas}
                                        onChange={(e) =>
                                            setData(
                                                "tanggal_mulai_tugas",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                    <select
                                        value={data.status}
                                        onChange={(e) =>
                                            setData("status", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="tidak aktif">
                                            Tidak Aktif
                                        </option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Nomor HP"
                                        value={data.nomor_hp}
                                        onChange={(e) =>
                                            setData("nomor_hp", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                    {!editData && (
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                            required
                                        />
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm hover:bg-slate-50 transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold shadow-lg transition disabled:opacity-50"
                                        >
                                            {editData ? "Update" : "Simpan"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
