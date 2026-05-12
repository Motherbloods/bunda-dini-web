import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Camera, Upload, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePatients } from "../../hooks/usePatients";
import PageLayout from "../../components/layout/PageLayout";
import Header from "../../components/layout/Header";
import Input, { Select } from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { BlockButton } from "../../components/ui/Button";
import {
  hplFormatted,
  usiaKehamilanFormatted,
} from "../../utils/dateFormatter";
import * as V from "../../utils/validators";

export default function AddPatientPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addPatient, checkNik, transfer, loading } = usePatients();

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [duplikat, setDuplikat] = useState(null);
  const [checkingNik, setCheckingNik] = useState(false);
  const fileRef = useRef();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const hphtValue = watch("hpht");

  function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function handleNikBlur(e) {
    const nik = e.target.value.trim();
    if (nik.length !== 16) return;
    setCheckingNik(true);
    const existing = await checkNik(nik);
    setCheckingNik(false);
    if (existing) setDuplikat(existing);
  }

  async function handleTransfer() {
    const ok = await transfer({
      patientId: duplikat.id,
      newKaderId: currentUser.id,
      newKaderNama: currentUser.nama,
      oldKaderId: duplikat.kaderId,
    });
    if (ok) navigate("/kader");
    setDuplikat(null);
  }

  async function onSubmit(data) {
    if (!fotoFile) {
      alert("Foto pasien wajib diisi");
      return;
    }

    const patient = {
      nik: data.nik.trim(),
      nama: data.nama.trim(),
      tempatLahir: data.tempatLahir.trim(),
      tanggalLahir: new Date(data.tanggalLahir),
      alamat: data.alamat.trim(),
      noHp: data.noHp.trim(),
      hpht: data.hpht ? new Date(data.hpht) : null,
      golonganDarah: data.golonganDarah,
      kaderId: currentUser.id,
      kaderNama: currentUser.nama,
      status: "aktif",
    };

    const existing = await checkNik(patient.nik);
    if (existing) {
      setDuplikat(existing);
      return;
    }

    const created = await addPatient(patient, fotoFile);
    if (created) navigate("/kader");
  }

  return (
    <PageLayout>
      {/* Header tetap full width */}
      <Header title="Tambah Pasien Baru" backTo={-1} />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* mx-auto untuk centering */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Foto Pasien <span className="text-danger">*</span>
            </h3>
            <div className="flex items-center gap-6">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-28 h-28 rounded-2xl overflow-hidden bg-primary-pale flex flex-col
                           items-center justify-center cursor-pointer hover:opacity-80 transition-opacity
                           border-2 border-dashed border-primary/30 flex-shrink-0"
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                ) : (
                  <>
                    <Camera size={28} className="text-primary mb-1" />
                    <span className="text-xs text-primary font-medium">
                      Tambah Foto
                    </span>
                  </>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Upload size={16} />
                  {fotoPreview ? "Ganti Foto" : "Pilih Foto"}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG · Maks 5MB
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFoto}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Data Diri</h3>

            <div>
              <Input
                label="NIK (16 digit) *"
                placeholder="Masukkan NIK 16 digit"
                maxLength={16}
                error={errors.nik?.message}
                {...register("nik", { validate: V.nik })}
                onBlur={handleNikBlur}
              />
              {checkingNik && (
                <p className="text-xs text-gray-400 mt-1">Mengecek NIK...</p>
              )}
            </div>

            <Input
              label="Nama Lengkap *"
              placeholder="Nama lengkap ibu hamil"
              error={errors.nama?.message}
              {...register("nama", { validate: V.required("Nama") })}
            />
            <Input
              label="Tempat Lahir *"
              placeholder="Kota tempat lahir"
              error={errors.tempatLahir?.message}
              {...register("tempatLahir", {
                validate: V.required("Tempat lahir"),
              })}
            />
            <Input
              label="Tanggal Lahir *"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              error={errors.tanggalLahir?.message}
              {...register("tanggalLahir", {
                required: "Tanggal lahir wajib diisi",
                validate: V.notFutureDate("Tanggal lahir"),
              })}
            />
            <Input
              label="Nomor HP *"
              type="tel"
              placeholder="08xx-xxxx-xxxx"
              error={errors.noHp?.message}
              {...register("noHp", { validate: V.noHp })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Alamat Lengkap *
              </label>
              <textarea
                rows={3}
                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
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

            <Select
              label="Golongan Darah *"
              error={errors.golonganDarah?.message}
              {...register("golonganDarah", {
                required: "Golongan darah wajib dipilih",
              })}
            >
              <option value="">-- Pilih --</option>
              {["A", "B", "AB", "O"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Data Kehamilan</h3>
            <div>
              <Input
                label="HPHT — Opsional"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                error={errors.hpht?.message}
                {...register("hpht", {
                  validate: V.notFutureDate("HPHT"),
                })}
              />
              {hphtValue &&
                (() => {
                  const usia = usiaKehamilanFormatted(new Date(hphtValue));
                  const hpl = hplFormatted(new Date(hphtValue));
                  if (!usia) return null;
                  return (
                    <div className="mt-2 p-3 bg-primary-pale rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-base">🤰</span>
                        <p className="text-sm font-semibold text-primary">
                          Usia kehamilan: {usia}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-base">📅</span>
                        <p className="text-sm text-primary">
                          HPL: <span className="font-semibold">{hpl}</span>
                        </p>
                      </div>
                    </div>
                  );
                })()}
              {!hphtValue && (
                <p className="mt-1.5 text-xs text-gray-400 italic">
                  Jika ibu tidak ingat HPHT, bisa diisi nanti melalui Edit
                  Biodata.
                </p>
              )}
            </div>
          </div>

          <BlockButton type="submit" loading={loading}>
            Simpan Pasien
          </BlockButton>
        </div>
      </form>

      <Modal
        isOpen={!!duplikat}
        onClose={() => setDuplikat(null)}
        title="NIK Sudah Terdaftar"
        size="sm"
      >
        <div className="flex items-start gap-3 mb-5">
          <AlertCircle
            size={22}
            className="text-warning flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-gray-700 font-medium">{duplikat?.nama}</p>
            <p className="text-gray-500 text-sm">NIK: {duplikat?.nik}</p>
            <p className="text-gray-500 text-sm mt-1">
              Sudah terdaftar di sistem. Apakah ingin memindahkan ke kader Anda?
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <BlockButton onClick={handleTransfer} loading={loading}>
            Transfer ke Kader Saya
          </BlockButton>
          <BlockButton variant="outline" onClick={() => setDuplikat(null)}>
            Batal
          </BlockButton>
        </div>
      </Modal>
    </PageLayout>
  );
}
