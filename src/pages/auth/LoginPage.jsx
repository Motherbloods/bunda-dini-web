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
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bunda Dini
            </h1>
            <p className="text-gray-500">Sistem Monitoring Ibu Hamil</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error message */}
            {errorMsg && (
              <div className="bg-danger-light border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <span className="text-danger text-lg leading-none">⚠</span>
                <p className="text-danger text-sm">{errorMsg}</p>
              </div>
            )}

            {/* Email */}
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

            {/* Password */}
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

            {/* Submit */}
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

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Hanya untuk petugas kesehatan terdaftar</p>
            <p className="mt-2">
              Butuh akses? Hubungi{" "}
              <span className="text-primary font-semibold">Administrator</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
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
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-sm text-white/80">Ibu Terpantau</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-sm text-white/80">Kader Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-sm text-white/80">Pemeriksaan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
