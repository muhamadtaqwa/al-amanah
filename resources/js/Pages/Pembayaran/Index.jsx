import { useState, useEffect, useRef } from "react";
import { usePage, useForm, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { pembayaran, santris, jenisPembayaran, filters, auth } =
        usePage().props;
    const isAdmin = auth.user.role === "admin";

    const [showModal, setShowModal] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);
    const [showKategori, setShowKategori] = useState(false);
    const [showCicilan, setShowCicilan] = useState(null);
    const [nominalCicilan, setNominalCicilan] = useState("");
    const [cicilanError, setCicilanError] = useState("");
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [verifyingId, setVerifyingId] = useState(null);
    const [cicilanSubmitting, setCicilanSubmitting] = useState(false);
    const [lunasiSubmitting, setLunasiSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deletingKategoriId, setDeletingKategoriId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteKategoriTarget, setDeleteKategoriTarget] = useState(null);
    const [statusFilter, setStatusFilter] = useState(filters.status || "semua");
    const firstFieldRef = useRef(null);

    const { data, setData, post, put, reset, processing, errors, clearErrors } =
        useForm({
            nis: "",
            jenis: jenisPembayaran[0]?.nama || "SPP",
            nama_pembayaran: "",
            nominal: "",
            tgl_jatuh_tempo: "",
        });

    const generateForm = useForm({
        jenis: jenisPembayaran[0]?.nama || "SPP",
        nama_pembayaran: "",
        nominal: "",
        bulan: "",
        tahun: "",
        kecualikan: "",
    });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 250);
        return () => clearTimeout(t);
    }, [search]);
    useEffect(() => {
        if (showModal) firstFieldRef.current?.focus();
    }, [showModal]);

    const openCreate = () => {
        reset();
        clearErrors();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (p) => {
        setEditData(p);
        clearErrors();
        setData({
            nis: p.nis,
            jenis: p.jenis,
            nama_pembayaran: p.nama_pembayaran,
            nominal: p.nominal,
            tgl_jatuh_tempo: p.tgl_jatuh_tempo || "",
        });
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        editData
            ? put(`/pembayaran/${editData.id}`, {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Pembayaran diupdate!");
                  },
                  onError: () => toast.error("Gagal mengupdate."),
              })
            : post("/pembayaran", {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Pembayaran ditambah!");
                  },
                  onError: () => toast.error("Gagal menambah."),
              });
    };

    const confirmDeletePembayaran = (id, nama) => setDeleteTarget({ id, nama });
    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        router.delete(`/pembayaran/${deleteTarget.id}`, {
            onSuccess: () => toast.success("Pembayaran dihapus!"),
            onError: () => toast.error("Gagal menghapus."),
            onFinish: () => {
                setDeletingId(null);
                setDeleteTarget(null);
            },
        });
    };

    const openCicilan = (id) => {
        setShowCicilan(id);
        setNominalCicilan("");
        setCicilanError("");
    };
    const handleCicilan = (p) => {
        const value = Number(nominalCicilan);
        if (!nominalCicilan || value <= 0) {
            setCicilanError("Masukkan nominal yang valid.");
            return;
        }
        if (typeof p.sisa === "number" && value > p.sisa) {
            setCicilanError("Nominal melebihi sisa tagihan.");
            return;
        }
        setCicilanError("");
        setCicilanSubmitting(true);
        router.post(
            `/pembayaran/${p.id}/cicilan`,
            { nominal: nominalCicilan },
            {
                onSuccess: () => {
                    setShowCicilan(null);
                    setNominalCicilan("");
                    toast.success("Cicilan berhasil!");
                },
                onError: (errs) => {
                    setCicilanError(Object.values(errs)[0] || "Gagal.");
                    toast.error("Gagal menyimpan cicilan.");
                },
                onFinish: () => setCicilanSubmitting(false),
            },
        );
    };

    const handleLunasi = (p) => {
        const sisa = p.sisa || p.nominal;
        if (!confirm(`Lunasi tagihan ini? (Rp ${sisa.toLocaleString()})`))
            return;
        setLunasiSubmitting(true);
        router.post(
            `/pembayaran/${p.id}/cicilan`,
            { nominal: sisa },
            {
                onSuccess: () => toast.success("Tagihan dilunasi!"),
                onError: () => toast.error("Gagal melunasi."),
                onFinish: () => setLunasiSubmitting(false),
            },
        );
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        generateForm.post("/pembayaran/generate", {
            onSuccess: () => {
                setShowGenerate(false);
                toast.success("Tagihan digenerate!");
            },
            onError: () => toast.error("Gagal generate."),
        });
    };

    const handleVerifikasi = (id, status) => {
        setVerifyingId(id);
        router.post(
            `/pembayaran/${id}/verifikasi`,
            { status_verifikasi: status },
            {
                onSuccess: () =>
                    toast.success(
                        status === "lunas"
                            ? "Pembayaran diterima!"
                            : "Pembayaran ditolak!",
                    ),
                onError: () => toast.error("Gagal verifikasi."),
                onFinish: () => setVerifyingId(null),
            },
        );
    };

    const confirmDeleteKategori = (id, nama) =>
        setDeleteKategoriTarget({ id, nama });
    const handleDeleteKategori = () => {
        if (!deleteKategoriTarget) return;
        setDeletingKategoriId(deleteKategoriTarget.id);
        router.delete(`/jenis-pembayaran/${deleteKategoriTarget.id}`, {
            onSuccess: () => toast.success("Kategori dihapus!"),
            onError: () => toast.error("Gagal menghapus kategori."),
            onFinish: () => {
                setDeletingKategoriId(null);
                setDeleteKategoriTarget(null);
            },
        });
    };

    const statusColor = (s) =>
        s === "lunas"
            ? "bg-emerald-50 text-emerald-600"
            : s === "ditolak"
              ? "bg-red-50 text-red-500"
              : s === "dicicil"
                ? "bg-amber-50 text-amber-600"
                : "bg-slate-100 text-slate-500";
    const statusLabel = (s) =>
        s === "lunas"
            ? "Lunas"
            : s === "ditolak"
              ? "Ditolak"
              : s === "dicicil"
                ? "Dicicil"
                : "Menunggu";

    const filtered = pembayaran
        .filter((p) => statusFilter === "semua" || p.status === statusFilter)
        .filter(
            (p) =>
                p.nama_pembayaran
                    ?.toLowerCase()
                    .includes(debouncedSearch.toLowerCase()) ||
                p.nis?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                p.santri?.nama_lengkap
                    ?.toLowerCase()
                    .includes(debouncedSearch.toLowerCase()),
        );

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-slate-800">
                        Pembayaran
                    </h2>
                </div>

                {isAdmin && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                            onClick={() => setShowKategori(true)}
                            className="bg-white border border-slate-200 text-slate-600 py-2.5 rounded-2xl text-xs font-medium hover:bg-slate-50 transition"
                        >
                            Kategori
                        </button>
                        <button
                            onClick={() => setShowGenerate(true)}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Generate
                        </button>
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            + Tambah
                        </button>
                    </div>
                )}

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari NIS, nama santri, atau pembayaran..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                    />
                </div>

                {/* Filter Jenis */}
                <div className="flex gap-2 mb-2">
                    {[{ nama: "semua" }, ...jenisPembayaran].map((j) => (
                        <Link
                            key={j.nama}
                            href={`/pembayaran?jenis=${j.nama === "semua" ? "" : j.nama}`}
                            preserveScroll
                            className={`flex-1 py-1.5 rounded-full text-xs text-center ${filters.jenis === j.nama || (!filters.jenis && j.nama === "semua") ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white" : "bg-white border text-slate-500"}`}
                        >
                            {j.nama === "semua" ? "Semua" : j.nama}
                        </Link>
                    ))}
                </div>

                {/* Filter Status */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {["semua", "menunggu", "lunas"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`py-1.5 rounded-full text-xs font-medium transition ${statusFilter === f ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border text-slate-500"}`}
                        >
                            {f === "semua"
                                ? "Semua"
                                : f === "menunggu"
                                  ? "Belum"
                                  : "Lunas"}
                        </button>
                    ))}
                </div>

                {/* Kategori Modal */}
                {showKategori && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowKategori(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    Kategori Tagihan
                                </h3>
                                <button
                                    onClick={() => setShowKategori(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {jenisPembayaran?.map((j) => (
                                    <span
                                        key={j.id}
                                        className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-3 py-1.5 rounded-full flex items-center gap-2"
                                    >
                                        {j.nama}
                                        <button
                                            onClick={() =>
                                                confirmDeleteKategori(
                                                    j.id,
                                                    j.nama,
                                                )
                                            }
                                            className="text-red-400 hover:text-red-600 ml-1"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.target.nama;
                                    router.post(
                                        "/jenis-pembayaran",
                                        { nama: input.value },
                                        {
                                            onSuccess: () => {
                                                input.value = "";
                                                toast.success(
                                                    "Kategori ditambah!",
                                                );
                                            },
                                            onError: () =>
                                                toast.error(
                                                    "Gagal menambah kategori.",
                                                ),
                                        },
                                    );
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    name="nama"
                                    placeholder="Nama kategori baru..."
                                    className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-5 py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    Tambah
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Generate Modal */}
                {showGenerate && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowGenerate(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    Generate Tagihan
                                </h3>
                                <button
                                    onClick={() => setShowGenerate(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <form
                                onSubmit={handleGenerate}
                                className="space-y-3"
                            >
                                <select
                                    value={generateForm.data.jenis}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "jenis",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                >
                                    {jenisPembayaran?.map((j) => (
                                        <option key={j.id} value={j.nama}>
                                            {j.nama}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Nama Pembayaran"
                                    value={generateForm.data.nama_pembayaran}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "nama_pembayaran",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Nominal"
                                    value={generateForm.data.nominal}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "nominal",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Bulan"
                                    value={generateForm.data.bulan}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "bulan",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Tahun"
                                    value={generateForm.data.tahun}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "tahun",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Kecualikan NIS (pisah koma)"
                                    value={generateForm.data.kecualikan}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "kecualikan",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowGenerate(false)}
                                        className="flex-1 border py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={generateForm.processing}
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Card List */}
                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada data
                        </p>
                    )}
                    {filtered.map((p) => {
                        const nominal = Number(p.nominal) || 0;
                        const dibayar = Number(p.total_dibayar) || 0;
                        const percent =
                            nominal > 0
                                ? Math.min(
                                      100,
                                      Math.max(0, (dibayar / nominal) * 100),
                                  )
                                : 0;
                        return (
                            <div
                                key={p.id}
                                className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                            {p.jenis}
                                        </span>
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(p.status)}`}
                                        >
                                            {statusLabel(p.status)}
                                        </span>
                                        {p.bukti && (
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                                                Bukti
                                            </span>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs hover:bg-[#3D7ABA]/10 hover:text-[#3D7ABA] transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDeletePembayaran(
                                                        p.id,
                                                        p.nama_pembayaran,
                                                    )
                                                }
                                                className="bg-red-50 text-red-500 px-2.5 py-1 rounded-lg text-xs hover:bg-red-100 transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-sm truncate mb-2">
                                    {p.nama_pembayaran}
                                </h3>
                                <div className="text-[11px] text-slate-500 space-y-0.5 mb-2">
                                    <Row label="NIS" value={p.nis} />
                                    <Row
                                        label="Santri"
                                        value={p.santri?.nama_lengkap}
                                    />
                                    <Row
                                        label="Nominal"
                                        value={`Rp ${nominal.toLocaleString()}`}
                                    />
                                    {dibayar > 0 && (
                                        <>
                                            <Row
                                                label="Dibayar"
                                                value={`Rp ${dibayar.toLocaleString()}`}
                                            />
                                            <Row
                                                label="Sisa"
                                                value={`Rp ${Math.max(0, nominal - dibayar).toLocaleString()}`}
                                            />
                                        </>
                                    )}
                                </div>
                                {dibayar > 0 && (
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                                        <div
                                            className="bg-emerald-500 h-1.5 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                )}
                                {isAdmin && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {p.status !== "lunas" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        openCicilan(p.id)
                                                    }
                                                    className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg"
                                                >
                                                    Cicilan
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleLunasi(p)
                                                    }
                                                    disabled={lunasiSubmitting}
                                                    className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg"
                                                >
                                                    {lunasiSubmitting
                                                        ? "..."
                                                        : "Lunasi"}
                                                </button>
                                            </>
                                        )}
                                        {p.status_verifikasi === "menunggu" &&
                                            p.bukti && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleVerifikasi(
                                                                p.id,
                                                                "lunas",
                                                            )
                                                        }
                                                        className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg"
                                                    >
                                                        Terima
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleVerifikasi(
                                                                p.id,
                                                                "ditolak",
                                                            )
                                                        }
                                                        className="text-[10px] bg-red-100 text-red-700 px-2.5 py-1 rounded-lg"
                                                    >
                                                        Tolak
                                                    </button>
                                                </>
                                            )}
                                    </div>
                                )}
                                {showCicilan === p.id && isAdmin && (
                                    <div className="mt-3 pt-3 border-t flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Nominal"
                                            value={nominalCicilan}
                                            onChange={(e) => {
                                                setNominalCicilan(
                                                    e.target.value,
                                                );
                                                setCicilanError("");
                                            }}
                                            className="flex-1 border rounded-2xl px-4 py-2 text-sm"
                                        />
                                        <button
                                            onClick={() => handleCicilan(p)}
                                            disabled={cicilanSubmitting}
                                            className="bg-amber-500 text-white px-4 py-2 rounded-2xl text-sm"
                                        >
                                            Bayar
                                        </button>
                                        <button
                                            onClick={() => setShowCicilan(null)}
                                            className="text-slate-400"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Tambah/Edit Modal */}
                {showModal && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={closeModal}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    {editData ? "Edit" : "Tambah"} Pembayaran
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={submit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="NIS"
                                    value={data.nis}
                                    onChange={(e) =>
                                        setData("nis", e.target.value)
                                    }
                                    disabled={!!editData}
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <select
                                    value={data.jenis}
                                    onChange={(e) =>
                                        setData("jenis", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm bg-white"
                                >
                                    {jenisPembayaran?.map((j) => (
                                        <option key={j.id} value={j.nama}>
                                            {j.nama}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Nama Pembayaran"
                                    value={data.nama_pembayaran}
                                    onChange={(e) =>
                                        setData(
                                            "nama_pembayaran",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Nominal"
                                    value={data.nominal}
                                    onChange={(e) =>
                                        setData("nominal", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="date"
                                    value={data.tgl_jatuh_tempo}
                                    onChange={(e) =>
                                        setData(
                                            "tgl_jatuh_tempo",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 border py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        {editData ? "Update" : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setDeleteTarget(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Hapus Pembayaran?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Data ini akan dihapus permanen.
                            </p>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 border py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!!deletingId}
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    {deletingId ? "Menghapus..." : "Hapus"}
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
