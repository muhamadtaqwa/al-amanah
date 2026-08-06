import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { walisantris, auth } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");

    const { data, setData, post, put, reset, processing } = useForm({
        niw: "",
        nama_lengkap: "",
        no_whatsapp: "",
        password: "",
    });

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (w) => {
        setEditData(w);
        setData({
            niw: w.niw,
            nama_lengkap: w.nama_lengkap,
            no_whatsapp: w.no_whatsapp,
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
            ? put(`/walisantri/${editData.id}`, {
                  onSuccess: () => closeModal(),
              })
            : post("/walisantri", { onSuccess: () => closeModal() });
    };
    const handleDelete = (id, nama) => {
        if (confirm(`Hapus walisantri "${nama}"?`))
            router.delete(`/walisantri/${id}`);
    };

    const filtered = walisantris.filter(
        (w) =>
            w.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
            w.niw?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Data Walisantri
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
                        placeholder="Cari nama atau NIW..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada data
                        </p>
                    )}
                    {filtered.map((w) => (
                        <div
                            key={w.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl hover:shadow-xl transition-shadow"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <span className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-3 py-1 rounded-full font-medium">
                                        {w.niw}
                                    </span>
                                    <h3 className="font-semibold text-sm mt-2">
                                        {w.nama_lengkap}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        No. Hp. {w.no_whatsapp}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(w)}
                                            className="bg-slate-100 p-2 rounded-xl text-xs hover:bg-[#3D7ABA]/10 hover:text-[#3D7ABA] transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    w.id,
                                                    w.nama_lengkap,
                                                )
                                            }
                                            className="bg-red-50 text-red-500 p-2 rounded-xl text-xs hover:bg-red-100 transition"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={closeModal}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-8 border border-sky-100">
                            <h3 className="font-semibold text-lg mb-4">
                                {editData ? "Edit" : "Tambah"} Walisantri
                            </h3>
                            <form onSubmit={submit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="NIW"
                                    value={data.niw}
                                    onChange={(e) =>
                                        setData("niw", e.target.value)
                                    }
                                    disabled={!!editData}
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm disabled:bg-slate-50"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={data.nama_lengkap}
                                    onChange={(e) =>
                                        setData("nama_lengkap", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="No WhatsApp"
                                    value={data.no_whatsapp}
                                    onChange={(e) =>
                                        setData("no_whatsapp", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm"
                                    required
                                />
                                {!editData && (
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm"
                                        required
                                    />
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 border border-slate-200 py-3 rounded-2xl text-sm hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold"
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
