import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Camera, Upload } from "lucide-react";
import { usePatients } from "../../hooks/usePatients";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Input, { Select } from "../../components/ui/Input";
import { BlockButton } from "../../components/ui/Button";
import { InlineLoader } from "../../components/ui/LoadingSpinner";
import { usiaKehamilanMinggu, toDisplay } from "../../utils/dateFormatter";
import * as V from "../../utils/validators";

export default function EditPatientPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { loadById, selected: patient, editPatient, loading } = usePatients();
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileRef = useRef();

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const hphtValue = watch("hpht");

  useEffect(() => {
    loadById(patientId);
  }, [patientId]);

  useEffect(() => {
    if (!patient) return;
    const hpht =
      patient.hpht?.toDate?.() ??
      (patient.hpht ? new Date(patient.hpht) : null);
    reset({
      nama: patient.nama,
      tempatLahir: patient.tempatLahir,
      tanggalLahir: patient.tanggalLahir?.toDate
        ? patient.tanggalLahir.toDate().toISOString().split("T")[0]
        : (patient.tanggalLahir?.split?.("T")?.[0] ?? ""),
      alamat: patient.alamat,
      noHp: patient.noHp,
      golonganDarah: patient.golonganDarah,
      hpht: hpht ? hpht.toISOString().split("T")[0] : "",
    });
    setFotoPreview(patient.fotoUrl || null);
  }, [patient]);

  function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data) {
    const updated = {
      ...patient,
      nama: data.nama.trim(),
      tempatLahir: data.tempatLahir.trim(),
      tanggalLahir: new Date(data.tanggalLahir),
      alamat: data.alamat.trim(),
      noHp: data.noHp.trim(),
      golonganDarah: data.golonganDarah,
      hpht: data.hpht ? new Date(data.hpht) : null,
    };
    const result = await editPatient(updated, fotoFile);
    if (result) navigate(`/kader/patients/${patientId}`);
  }

  if (!patient)
    return (
      <PageLayout>
        <InlineLoader />
      </PageLayout>
    );

  const usiaFromHpht = hphtValue
    ? usiaKehamilanMinggu(new Date(hphtValue))
    : null;

  return (
    <PageLayout>
      <Header title="Edit Biodata Pasien" backTo={-1} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Foto Pasien</h3>
            <div className="flex items-center gap-6">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-28 h-28 rounded-2xl overflow-hidden bg-primary-pale flex-shrink-0
                           cursor-pointer hover:opacity-80 transition-opacity"
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={28} className="text-primary" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5
                           text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Upload size={16} />
                Ganti Foto
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFoto}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Data Diri</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-400 mb-0.5">
                NIK (tidak dapat diubah)
              </p>
              <p className="font-semibold text-gray-900">{patient.nik}</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Nama Lengkap *"
                error={errors.nama?.message}
                {...register("nama", { validate: V.required("Nama") })}
              />
              <Input
                label="Tempat Lahir *"
                error={errors.tempatLahir?.message}
                {...register("tempatLahir", {
                  validate: V.required("Tempat lahir"),
                })}
              />
              <Input
                label="Tanggal Lahir *"
                type="date"
                error={errors.tanggalLahir?.message}
                {...register("tanggalLahir", { required: "Wajib diisi" })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Alamat Lengkap *
                </label>
                <textarea
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-3 text-base bg-white resize-none
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                             ${errors.alamat ? "border-danger" : "border-gray-200"}`}
                  {...register("alamat", { validate: V.required("Alamat") })}
                />
                {errors.alamat && (
                  <p className="mt-1 text-sm text-danger">
                    {errors.alamat.message}
                  </p>
                )}
              </div>
              <Input
                label="Nomor HP *"
                type="tel"
                error={errors.noHp?.message}
                {...register("noHp", { validate: V.noHp })}
              />
              <Select
                label="Golongan Darah *"
                error={errors.golonganDarah?.message}
                {...register("golonganDarah", { required: "Wajib dipilih" })}
              >
                <option value="">-- Pilih --</option>
                {["A", "B", "AB", "O"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Data Kehamilan</h3>
            <Input label="HPHT — Opsional" type="date" {...register("hpht")} />
            {usiaFromHpht !== null && (
              <p className="mt-1.5 text-sm text-primary font-medium">
                Usia kehamilan: {usiaFromHpht} minggu
              </p>
            )}
            {!hphtValue && (
              <p className="mt-1.5 text-xs text-gray-400 italic">
                Isi HPHT agar taksiran persalinan dan usia kehamilan dapat
                dihitung.
              </p>
            )}
          </div>

          <BlockButton type="submit" loading={loading}>
            Simpan Perubahan
          </BlockButton>
        </div>
      </form>
    </PageLayout>
  );
}
