import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, User, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { registerKader } from "../../services/authService";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Input from "../../components/ui/Input";
import { BlockButton } from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";
import * as V from "../../utils/validators";
import toast from "react-hot-toast";

export default function AddKaderPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    setLoading(true);
    try {
      await registerKader({
        email: data.email.trim(),
        password: data.password,
        nama: data.nama.trim(),
        createdBy: currentUser.id,
      });
      toast.success("Kader berhasil didaftarkan");
      navigate(ROUTES.KADER_LIST);
    } catch (err) {
      const msg = err?.message ?? "";
      if (msg.includes("email-already-in-use")) {
        toast.error("Email sudah terdaftar.");
      } else {
        toast.error("Gagal mendaftarkan kader.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <Header title="Tambah Kader" backTo={-1} />

      <div className="max-w-lg mx-auto space-y-5">
        <div className="bg-info-light border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={20} className="text-info flex-shrink-0 mt-0.5" />
          <p className="text-sm text-info">
            Kader akan dapat login menggunakan email dan kata sandi yang
            didaftarkan di sini.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <Input
            label="Nama Lengkap Kader *"
            placeholder="Nama lengkap kader"
            error={errors.nama?.message}
            {...register("nama", { validate: V.required("Nama") })}
          />
          <Input
            label="Email *"
            type="email"
            placeholder="email@kader.com"
            error={errors.email?.message}
            {...register("email", { validate: V.email })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Kata Sandi *
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                className={`w-full border rounded-xl px-4 py-3 pr-12 text-base bg-white
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  ${errors.password ? "border-danger" : "border-gray-200"}`}
                {...register("password", { validate: V.password })}
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
            <p className="mt-1 text-xs text-gray-400">
              Kader bisa mengubah sendiri setelah login.
            </p>
          </div>
        </div>

        <BlockButton onClick={handleSubmit(onSubmit)} loading={loading}>
          Daftarkan Kader
        </BlockButton>
      </div>
    </PageLayout>
  );
}
