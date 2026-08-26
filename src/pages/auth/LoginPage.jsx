import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, Heart } from "lucide-react";
import { login } from "../../services/authService";
import { ROUTES } from "../../constants/routes";
import {
  email as emailValidator,
  password as passwordValidator,
} from "../../utils/validators";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await login(data.email, data.password);
      const dest =
        user.role === "bidan" ? ROUTES.BIDAN_DASHBOARD : ROUTES.KADER_HOME;
      navigate(dest, { replace: true });
    } catch (err) {
      setErrorMsg(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  function parseError(err) {
    const msg = err?.message ?? "";
    if (
      msg.includes("invalid-credential") ||
      msg.includes("wrong-password") ||
      msg.includes("user-not-found")
    )
      return "Email atau kata sandi salah.";
    if (msg.includes("user-disabled") || msg === "user-disabled")
      return "Akun ini dinonaktifkan. Hubungi bidan pendamping.";
    if (msg.includes("network"))
      return "Tidak ada koneksi internet. Coba lagi.";
    if (msg.includes("too-many-requests"))
      return "Terlalu banyak percobaan. Tunggu beberapa menit.";
    return "Terjadi kesalahan. Coba lagi.";
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="Logo Bunda Dini"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-px h-10 bg-gray-200 flex-shrink-0" />
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/images/tutwuri.webp"
                  alt="Tut Wuri Handayani"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/images/kemendiktisaintek.png"
                  alt="Kemendiktisaintek"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/images/udb.jpg"
                  alt="Universitas Duta Bangsa"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bunda Dini
            </h1>
            <p className="text-gray-500">Sistem Monitoring Ibu Hamil</p>
            <p className="text-xs text-gray-400 mt-1">
              Program Pengabdian kepada Masyarakat — Hibah Kemendiktisaintek
              Tahun 2026
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMsg && (
              <div className="bg-danger-light border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <span className="text-danger text-lg leading-none">⚠</span>
                <p className="text-danger text-sm">{errorMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-base bg-white transition-all
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    ${errors.email ? "border-danger" : "border-gray-200"}`}
                  {...register("email", { validate: emailValidator })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-base bg-white transition-all
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    ${errors.password ? "border-danger" : "border-gray-200"}`}
                  {...register("password", { validate: passwordValidator })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit(onSubmit)();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 text-base"
            >
              {loading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Sedang masuk..." : "Masuk"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Hanya untuk petugas kesehatan terdaftar</p>
            <p className="mt-2">
              Butuh akses? Hubungi{" "}
              <span className="text-primary font-semibold">Administrator</span>
            </p>
          </div>

          <div className="mt-6 flex lg:hidden flex-col items-center gap-2 text-gray-400">
            <span className="text-xs">Didukung oleh</span>
            <div className="flex items-center gap-4">
              <img
                src="/images/tutwuri.webp"
                alt="Tut Wuri Handayani"
                className="h-5 object-contain"
              />
              <img
                src="/images/kemendiktisaintek.png"
                alt="Kemendiktisaintek"
                className="h-5 object-contain"
              />
              <img
                src="/images/udb.jpg"
                alt="Universitas Duta Bangsa"
                className="h-5 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary-dark p-12 items-center justify-center">
        <div className="text-white text-center max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Pemantauan Kesehatan Ibu Hamil
          </h2>
          <p className="text-lg text-white/90 leading-relaxed mb-8">
            Platform digital untuk memudahkan kader posyandu dalam memantau
            kesehatan ibu hamil secara real-time dengan sistem deteksi dini
            risiko kehamilan.
          </p>

          <div className="mx-auto max-w-md flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
            <div className="flex items-center gap-3 bg-white rounded-xl p-2 flex-shrink-0">
              <img
                src="/images/tutwuri.webp"
                alt="Tut Wuri Handayani"
                className="h-9 object-contain"
              />
              <img
                src="/images/kemendiktisaintek.png"
                alt="Kemendiktisaintek"
                className="h-9 object-contain"
              />
              <img
                src="/images/udb.jpg"
                alt="Universitas Duta Bangsa"
                className="h-9 object-contain"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                Didanai oleh Hibah Kemendiktisaintek Tahun 2026
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                Program Pengabdian kepada Masyarakat, Universitas Duta Bangsa
                (UDB) Surakarta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
