import { useState } from "react";
import { usePage, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { auth } = usePage().props;
    const user = auth.user;
    const profil = user.ustadz || user.santri || user.walisantri;

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, put, processing } = useForm({
        nama_lengkap: profil?.nama_lengkap || "Admin",
        password: "",
    });

    const passwordForm = useForm({ username: "", password_baru: "" });

    const submit = (e) => {
        e.preventDefault();
        put("/profil");
    };
    const handleGantiPassword = (e) => {
        e.preventDefault();
        passwordForm.post("/profil/ganti-password", {
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Profil
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Kolom 1 - Card Profil */}
                    <div>
                        <div className="rounded-[30px] bg-gradient-to-br from-[#3D7ABA] to-[#20B5E8] p-6 shadow-2xl text-white text-center h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold mb-4 border-2 border-white/30">
                                {profil?.nama_lengkap?.charAt(0) || "A"}
                            </div>
                            <h3 className="font-bold text-xl">
                                {profil?.nama_lengkap || "Admin Pondok"}
                            </h3>
                            <p className="text-white/80 text-sm capitalize mt-1">
                                {user.role}
                            </p>
                            <p className="text-xs text-white/60 mt-2">
                                ID: {user.username}
                            </p>
                        </div>
                    </div>

                    {/* Kolom 2 - Edit Profil */}
                    <div>
                        <div className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl h-full">
                            <h3 className="font-semibold text-sm text-slate-700 mb-4">
                                Edit Profil
                            </h3>
                            <form onSubmit={submit} className="space-y-3">
                                <div>
                                    <label className="text-sm text-slate-500 font-medium">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_lengkap}
                                        onChange={(e) =>
                                            setData(
                                                "nama_lengkap",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm mt-1 focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 font-medium">
                                        Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm mt-1 focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                        placeholder="Min. 6 karakter"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                                >
                                    Simpan Perubahan
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Kolom 3 - Ganti Password User Lain (Admin only) */}
                    <div>
                        {user.role === "admin" ? (
                            <div className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl h-full">
                                <h3 className="font-semibold text-sm text-slate-700 mb-4">
                                    Ganti Password User
                                </h3>
                                <form
                                    onSubmit={handleGantiPassword}
                                    className="space-y-3"
                                >
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={passwordForm.data.username}
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                "username",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password Baru"
                                        value={passwordForm.data.password_baru}
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                "password_baru",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="w-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                                    >
                                        Simpan
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl h-full flex items-center justify-center text-center">
                                <p className="text-sm text-slate-400">
                                    Hanya admin yang dapat mengganti password
                                    user lain
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
