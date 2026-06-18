/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, KeyboardEvent, FormEvent } from "react";
import { User, MapPin, Calendar, Users, Home, GraduationCap, Phone, Mail, Award, CheckCircle, ArrowLeft, ArrowRight, RefreshCw, Send, ShieldAlert, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RegistrationFormData } from "../types";

const MONTHS_ID = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" }
];

export default function FormWizard() {
  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>({
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    asal_sekolah: "",
    no_hp_wa: "",
    email: "",
    program_pilihan: "",
    sumber_informasi: [],
    website_field: "", // Honeypot
    ip_address: "Unknown",
  });

  // Date of Birth dropdown sub-states
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => String(currentYear - i));

  const getDaysInMonth = (monthStr: string, yearStr: string) => {
    const m = parseInt(monthStr, 10);
    const y = parseInt(yearStr, 10);
    if (!m) return 31;
    if (m === 2) {
      if (y && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) {
        return 29;
      }
      return 28;
    }
    if ([4, 6, 9, 11].includes(m)) {
      return 30;
    }
    return 31;
  };

  const maxDays = getDaysInMonth(dobMonth, dobYear);
  const days = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0"));

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ status: "success" | "error"; message: string } | null>(null);
  const [ipServiceState, setIpServiceState] = useState<"loading" | "ready" | "failed">("loading");

  // Endpoint configuration for Sandbox testing vs Production testing
  const [endpointMode, setEndpointMode] = useState<"sandbox" | "live">("live");
  const [liveScriptUrl, setLiveScriptUrl] = useState("https://script.google.com/macros/s/AKfycbzC6xYtnu2K7ByWz5HsnGDzFzcNL6LIIm7jTFQHnF5qAuiAGJdWA5oVTz8-h-bQk9A/exec");

  // Simulated Submission Counts for IP Anti-Spam Demo
  const [submitHistoryCount, setSubmitHistoryCount] = useState(0);

  // Fetch IP address on load
  useEffect(() => {
    async function getIP() {
      try {
        setIpServiceState("loading");
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        if (data && data.ip) {
          setFormData((prev) => ({ ...prev, ip_address: data.ip }));
          setIpServiceState("ready");
        } else {
          setIpServiceState("failed");
        }
      } catch (err) {
        console.warn("Gagal mengambil IP publik.", err);
        setIpServiceState("failed");
      }
    }
    getIP();
  }, []);

  // Synchronize separate fields to "tanggal_lahir" in "YYYY-MM-DD" format
  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      setFormData((prev) => ({
        ...prev,
        tanggal_lahir: `${dobYear}-${dobMonth}-${dobDay}`,
      }));
      clearError("tanggal_lahir");
    } else {
      setFormData((prev) => ({
        ...prev,
        tanggal_lahir: "",
      }));
    }
  }, [dobDay, dobMonth, dobYear]);

  // Adjust selected day if month limit changes (e.g. switching to February)
  useEffect(() => {
    if (dobMonth && dobDay) {
      const maxDaysVal = getDaysInMonth(dobMonth, dobYear);
      const currentDayNum = parseInt(dobDay, 10);
      if (currentDayNum > maxDaysVal) {
        setDobDay(String(maxDaysVal).padStart(2, "0"));
      }
    }
  }, [dobMonth, dobYear, dobDay]);

  // Validation function per step
  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nama.trim()) {
        stepErrors.nama = "Nama lengkap wajib diisi.";
      } else if (formData.nama.trim().length < 3) {
        stepErrors.nama = "Nama lengkap minimal terdiri dari 3 karakter.";
      }
    } else if (step === 2) {
      if (!formData.tempat_lahir.trim()) {
        stepErrors.tempat_lahir = "Tempat lahir wajib diisi.";
      }
    } else if (step === 3) {
      if (!formData.tanggal_lahir) {
        stepErrors.tanggal_lahir = "Tanggal lahir wajib diisi.";
      }
    } else if (step === 4) {
      if (!formData.jenis_kelamin) {
        stepErrors.jenis_kelamin = "Harap pilih jenis kelamin Anda.";
      }
    } else if (step === 5) {
      if (!formData.alamat.trim()) {
        stepErrors.alamat = "Alamat rumah lengkap wajib diisi.";
      } else if (formData.alamat.trim().length < 5) {
        stepErrors.alamat = "Tuliskan alamat tinggal yang lebih lengkap (min 5 karakter).";
      }
    } else if (step === 6) {
      if (!formData.asal_sekolah.trim()) {
        stepErrors.asal_sekolah = "Asal sekolah wajib diisi.";
      }
    } else if (step === 7) {
      const numbersOnly = formData.no_hp_wa.replace(/[^0-9]/g, "");
      if (!formData.no_hp_wa.trim()) {
        stepErrors.no_hp_wa = "Nomor HP & WhatsApp wajib diisi.";
      } else if (numbersOnly.length < 9 || numbersOnly.length > 13) {
        stepErrors.no_hp_wa = "Masukkan nomor yang valid (9 s/d 13 digit angka).";
      }
    } else if (step === 8) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        stepErrors.email = "Alamat email wajib diisi.";
      } else if (!emailRegex.test(formData.email.trim())) {
        stepErrors.email = "Alamat email yang dimasukkan tidak valid.";
      }
    } else if (step === 9) {
      if (!formData.program_pilihan) {
        stepErrors.program_pilihan = "Harap pilih program yang Anda inginkan.";
      }
    } else if (step === 10) {
      if (formData.sumber_informasi.length === 0) {
        stepErrors.sumber_informasi = "Harap pilih minimal satu sumber informasi.";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Handle click next
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 10) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  // Handle click back
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  };

  // Handle change text inputs
  const handleTextChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Clear specific error
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((p) => {
        const copy = { ...p };
        delete copy[field];
        return copy;
      });
    }
  };

  // Handle selecting radio options (auto-advance configured)
  const handleRadioSelect = (field: "jenis_kelamin" | "program_pilihan", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
    
    // Auto advance short delay for ultra-modern immersive UX
    setTimeout(() => {
      // confirm it is still on the same step before pushing forward
      if (field === "jenis_kelamin" && currentStep === 4) {
        setCurrentStep(5);
      } else if (field === "program_pilihan" && currentStep === 9) {
        setCurrentStep(10);
      }
    }, 250);
  };

  // Handle checkboxes for Sumber Informasi
  const handleCheckboxToggle = (val: string) => {
    setFormData((prev) => {
      const currentSources = [...prev.sumber_informasi];
      const index = currentSources.indexOf(val);
      if (index === -1) {
        currentSources.push(val);
      } else {
        currentSources.splice(index, 1);
      }
      return { ...prev, sumber_informasi: currentSources };
    });
    clearError("sumber_informasi");
  };

  // Keydown to press Next on Enter click
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.currentTarget.tagName === "INPUT") {
      e.preventDefault();
      handleNext();
    }
  };

  // Submit Action Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(10)) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    // Form data bundle preparation
    const submitPayload = {
      ...formData,
      no_hp_wa: "+62" + formData.no_hp_wa.replace(/[^0-9]/g, ""),
      sumber_informasi: formData.sumber_informasi.join(", "),
    };

    // 1. Live Web App Request Mode
    if (endpointMode === "live") {
      if (!liveScriptUrl.trim() || liveScriptUrl === "URL_ANDA_DI_SINI") {
        setIsSubmitting(false);
        setSubmitResult({
          status: "error",
          message: "Akses Ditolak. Harap sertakan Tautan URL Web App Google Apps Script Anda yang valid pada kolom di bawah.",
        });
        return;
      }

      try {
        const response = await fetch(liveScriptUrl, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(submitPayload),
        });

        const resData = await response.json();
        setIsSubmitting(false);

        if (resData.status === "success") {
          setSubmitResult({
            status: "success",
            message: resData.message || "Pendaftaran berhasil terkirim ke Google Spreadsheet!",
          });
          // Increment simulator counter
          setSubmitHistoryCount((p) => p + 1);
        } else {
          setSubmitResult({
            status: "error",
            message: resData.message || "Gagal menyimpan pendaftaran ke Google Spreadsheet.",
          });
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitResult({
          status: "error",
          message: "CORS atau Network Error. Pastikan script GAS Anda telah ter-deploy dengan akses 'Anyone' (Semua Orang) dan Anda mengizinkan CORs. Rincian: " + err.message,
        });
      }
    } 
    // 2. Local Sandbox Simulator Mode
    else {
      // Simulate network request latency
      setTimeout(() => {
        setIsSubmitting(false);

        // Honeypot validation
        if (formData.website_field.trim() !== "") {
          setSubmitResult({
            status: "error",
            message: "Spam bot terdeteksi! (Honeypot Triggered). Data ditolak karena kolom website_field terisi.",
          });
          return;
        }

        // Anti Spam Protection Limit test - 5 hits in sandbox demo limits
        if (submitHistoryCount >= 5) {
          setSubmitResult({
            status: "error",
            message: "⚠️ SANDBOX SPAM BLOCKER: Membatasi maksimal 5 pengiriman dari IP yang sama (" + formData.ip_address + ") dalam durasi 20 menit (CacheService Triggered). Silakan bersihkan history atau ganti IP.",
          });
          return;
        }

        // Simulating success
        setSubmitResult({
          status: "success",
          message: "🎉 SIMULATOR SUKSES: Data pendaftaran di-serialize dan berhasil dikirim! Email simulasi dikirim ke binakaryalht18@gmail.com.",
        });
        setSubmitHistoryCount((prev) => prev + 1);
      }, 1500);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      nama: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: "",
      alamat: "",
      asal_sekolah: "",
      no_hp_wa: "",
      email: "",
      program_pilihan: "",
      sumber_informasi: [],
      website_field: "",
      ip_address: formData.ip_address, // keep IP
    });
    setDobDay("");
    setDobMonth("");
    setDobYear("");
    setCurrentStep(1);
    setErrors({});
    setSubmitResult(null);
  };

  // Labels dynamically mapped for steps
  const stepsMetadata = [
    { id: 1, title: "Nama", icon: <User className="w-5 h-5" /> },
    { id: 2, title: "Tempat Lahir", icon: <MapPin className="w-5 h-5" /> },
    { id: 3, title: "Tanggal Lahir", icon: <Calendar className="w-5 h-5" /> },
    { id: 4, title: "Gender", icon: <Users className="w-5 h-5" /> },
    { id: 5, title: "Alamat", icon: <Home className="w-5 h-5" /> },
    { id: 6, title: "Sekolah", icon: <GraduationCap className="w-5 h-5" /> },
    { id: 7, title: "No HP & WA", icon: <Phone className="w-5 h-5" /> },
    { id: 8, title: "Email", icon: <Mail className="w-5 h-5" /> },
    { id: 9, title: "Program", icon: <Award className="w-5 h-5" /> },
    { id: 10, title: "Info", icon: <CheckCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-900/80 rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
      {/* Form Title Header Bar */}
      <div className="bg-[#0b0c0f]/80 px-6 py-3 flex items-center justify-between text-white border-b border-slate-900">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-slate-200 tracking-wider font-mono">Form Pendaftaran</span>
        </div>
      </div>

      {/* Embedded Wizard Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center bg-[#070709]/30">
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden relative flex flex-col">
          
          {/* Form Header */}
          <div className="bg-slate-950/80 p-4 sm:p-5 text-white relative shrink-0 border-b border-slate-900/50">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Formulir Penerimaan</p>
            <h2 className="text-sm font-bold mt-1 text-white flex items-center gap-1.5">
              <span>Langkah</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-extrabold">{currentStep}</span>
              <span className="text-slate-500 text-xs font-normal">dari 10</span>
            </h2>

            {/* Slider progress bar */}
            <div className="mt-2.5">
              <div className="flex justify-between items-center text-[10px] font-bold mb-1 uppercase tracking-wide">
                <span>{stepsMetadata[currentStep - 1].title}</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[9px]">
                  {currentStep * 10}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${currentStep * 10}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Steps List Dots Indicator */}
          <div className="flex justify-center border-b border-slate-850 bg-slate-950/20 px-4 py-1.5 gap-1.5 shrink-0 overflow-x-auto">
            {stepsMetadata.map((st) => (
              <div
                key={st.id}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  st.id === currentStep
                    ? "bg-emerald-400 w-5"
                    : st.id < currentStep
                    ? "bg-emerald-600"
                    : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* Form Core Body */}
          <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col justify-between min-h-[290px]">
            {/* Honeypot field (fully hidden, mock bots trigger it with autofill) */}
            <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
              <label htmlFor="website_field">Website Field (Ignore if human)</label>
              <input
                id="website_field"
                type="text"
                value={formData.website_field}
                onChange={(e) => handleTextChange("website_field", e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="flex-1 mb-6 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {/* Step 1: Nama */}
                  {currentStep === 1 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="nama">
                        Nama Lengkap Anda <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">
                        Tuliskan nama lengkap sesuai dengan kartu identitas atau ijazah terakhir Anda.
                      </p>
                      <input
                        type="text"
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => handleTextChange("nama", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full text-sm px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-100 placeholder:text-slate-600 transition"
                        autoFocus
                      />
                      {errors.nama && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.nama}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 2: Tempat Lahir */}
                  {currentStep === 2 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="tempat_lahir">
                        Kabupaten / Tempat Lahir <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">Masukkan nama kota kelahiran Anda.</p>
                      <input
                        type="text"
                        id="tempat_lahir"
                        value={formData.tempat_lahir}
                        onChange={(e) => handleTextChange("tempat_lahir", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Contoh: Surabaya"
                        className="w-full text-sm px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-100 placeholder:text-slate-600 transition"
                        autoFocus
                      />
                      {errors.tempat_lahir && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.tempat_lahir}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 3: Tanggal Lahir */}
                  {currentStep === 3 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                        Tanggal Lahir Anda <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-4 font-normal">Pilih tanggal, bulan, dan tahun kelahiran Anda.</p>
                      
                      <div className="grid grid-cols-[1fr_1.35fr_1fr] sm:grid-cols-[1fr_1.5fr_1fr] gap-2">
                        {/* Dropdown Tanggal */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal</label>
                          <select
                            value={dobDay}
                            onChange={(e) => setDobDay(e.target.value)}
                            className="w-full text-xs sm:text-sm px-2 py-2.5 sm:px-3 sm:py-3 rounded-xl bg-slate-950/30 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-200 transition cursor-pointer"
                          >
                            <option value="" className="bg-slate-950 text-slate-500">Pilih</option>
                            {days.map((d) => (
                              <option key={d} value={d} className="bg-slate-950 text-slate-200">
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dropdown Bulan */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bulan</label>
                          <select
                            value={dobMonth}
                            onChange={(e) => setDobMonth(e.target.value)}
                            className="w-full text-xs sm:text-sm px-1.5 py-2.5 sm:px-3 sm:py-3 rounded-xl bg-slate-950/30 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-200 transition cursor-pointer"
                          >
                            <option value="" className="bg-slate-950 text-slate-500">Pilih</option>
                            {MONTHS_ID.map((m) => (
                              <option key={m.value} value={m.value} className="bg-slate-950 text-slate-200">
                                {m.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dropdown Tahun */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tahun</label>
                          <select
                            value={dobYear}
                            onChange={(e) => setDobYear(e.target.value)}
                            className="w-full text-xs sm:text-sm px-2 py-2.5 sm:px-3 sm:py-3 rounded-xl bg-slate-950/30 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-200 transition cursor-pointer"
                          >
                            <option value="" className="bg-slate-950 text-slate-500">Pilih</option>
                            {years.map((y) => (
                              <option key={y} value={y} className="bg-slate-950 text-slate-200">
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {errors.tanggal_lahir && (
                        <p className="text-red-400 text-xs mt-3.5 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.tanggal_lahir}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 4: Jenis Kelamin */}
                  {currentStep === 4 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Pilih Jenis Kelamin <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleRadioSelect("jenis_kelamin", "Laki-laki")}
                          className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-slate-900/60 transition duration-150 relative ${
                            formData.jenis_kelamin === "Laki-laki"
                              ? "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold"
                              : "border-slate-800 text-slate-400 bg-slate-950/20"
                          }`}
                        >
                          <span className="text-2xl mb-1 select-none">👨</span>
                          <span className="font-bold text-xs">Laki-laki</span>
                          {formData.jenis_kelamin === "Laki-laki" && (
                            <span className="absolute top-2 right-2 text-xs text-emerald-400 font-bold font-mono">✓</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRadioSelect("jenis_kelamin", "Perempuan")}
                          className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-slate-900/60 transition duration-150 relative ${
                            formData.jenis_kelamin === "Perempuan"
                              ? "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold"
                              : "border-slate-800 text-slate-400 bg-slate-950/20"
                          }`}
                        >
                          <span className="text-2xl mb-1 select-none">👩</span>
                          <span className="font-bold text-xs">Perempuan</span>
                          {formData.jenis_kelamin === "Perempuan" && (
                            <span className="absolute top-2 right-2 text-xs text-emerald-400 font-bold font-mono">✓</span>
                          )}
                        </button>
                      </div>
                      {errors.jenis_kelamin && (
                        <p className="text-red-400 text-xs mt-3 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.jenis_kelamin}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 5: Alamat */}
                  {currentStep === 5 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="alamat">
                        Alamat Tinggal Lengkap <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">Tulis alamat lengkap (dusun, kelurahan, ruko, gang, dsb).</p>
                      <textarea
                        id="alamat"
                        rows={3}
                        value={formData.alamat}
                        onChange={(e) => handleTextChange("alamat", e.target.value)}
                        placeholder="Contoh: Jl. Diponegoro No. 45, RT 01 RW 03, Tulangan, Sidoarjo"
                        className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-100 placeholder:text-slate-600 transition resize-none font-sans"
                        autoFocus
                      />
                      {errors.alamat && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.alamat}
                        </p>
                      )}
                    </div>
                  )}

                   {/* Step 6: Asal Sekolah */}
                  {currentStep === 6 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="asal_sekolah">
                        Asal Sekolah Terakhir <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">Nama SMP, SMA, SMK, atau perguruan tinggi asal Anda.</p>
                      <input
                        type="text"
                        id="asal_sekolah"
                        value={formData.asal_sekolah}
                        onChange={(e) => handleTextChange("asal_sekolah", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Contoh: SMA Negeri 1 Krian"
                        className="w-full text-sm px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-100 placeholder:text-slate-600 transition"
                        autoFocus
                      />
                      {errors.asal_sekolah && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.asal_sekolah}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 7: No HP & WA */}
                  {currentStep === 7 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="no_hp_wa">
                        Nomor HP & WhatsApp <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">Gunakan angka saja tanpa tanda strip atau spasi.</p>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-sm font-bold text-slate-500 select-none">+62</span>
                        <input
                          type="tel"
                          id="no_hp_wa"
                          value={formData.no_hp_wa}
                          onChange={(e) => handleTextChange("no_hp_wa", e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="8123456789"
                          className="w-full text-sm pl-12 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-semibold text-slate-200 tracker-wider placeholder:text-slate-600 transition"
                          autoFocus
                        />
                      </div>
                      {errors.no_hp_wa && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.no_hp_wa}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 8: Email */}
                  {currentStep === 8 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5" htmlFor="email">
                        Alamat Email Aktif <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">Alamat email surat pengantar untuk mengirimkan notifikasi pendaftaran.</p>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleTextChange("email", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Contoh: budi@gmail.com"
                        className="w-full text-sm px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-950/40 outline-none font-medium text-slate-100 placeholder:text-slate-600 transition"
                        autoFocus
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.email}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 9: Program Pilihan */}
                  {currentStep === 9 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Pilih Program Kursus Utama <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <div className="space-y-2.5">
                        <button
                          type="button"
                          onClick={() => handleRadioSelect("program_pilihan", "Program 1 Tahun")}
                          className={`w-full flex items-center p-3.5 border rounded-xl cursor-pointer hover:bg-slate-900/40 transition duration-150 text-left relative ${
                            formData.program_pilihan === "Program 1 Tahun"
                              ? "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-950/40"
                              : "border-slate-800 text-slate-300 bg-slate-950/20"
                          }`}
                        >
                          <div className="mr-3 p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 select-none font-bold text-xs">🎓</div>
                          <div>
                            <span className="font-bold text-xs text-slate-200 block">Program 1 Tahun</span>
                            <span className="text-[9.5px] text-slate-500 block -mt-0.5">Kelas komprehensif berorientasi kerja profesional</span>
                          </div>
                          {formData.program_pilihan === "Program 1 Tahun" && (
                            <span className="absolute right-4 top-4 text-emerald-400 font-bold text-xs">✓</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRadioSelect("program_pilihan", "Program Reguler (Ms. Office)")}
                          className={`w-full flex items-center p-3.5 border rounded-xl cursor-pointer hover:bg-slate-900/40 transition duration-150 text-left relative ${
                            formData.program_pilihan === "Program Reguler (Ms. Office)"
                              ? "border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-950/40"
                              : "border-slate-800 text-slate-300 bg-slate-950/20"
                          }`}
                        >
                          <div className="mr-3 p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 select-none font-bold text-xs">💻</div>
                          <div>
                            <span className="font-bold text-xs text-slate-200 block">Program Reguler (Ms. Office)</span>
                            <span className="text-[9.5px] text-slate-500 block -mt-0.5">Kursus dasar perkantoran administratif esensial</span>
                          </div>
                          {formData.program_pilihan === "Program Reguler (Ms. Office)" && (
                            <span className="absolute right-4 top-4 text-emerald-400 font-bold text-xs">✓</span>
                          )}
                        </button>
                      </div>
                      {errors.program_pilihan && (
                        <p className="text-red-400 text-xs mt-3 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.program_pilihan}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 10: Sumber Informasi */}
                  {currentStep === 10 && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                        Sumber Informasi Bina Karya <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2.5">Darimana Anda mengetahui pendaftaran kami? (Pilih satu atau lebih)</p>
                      <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                        {[
                          "Brosur",
                          "Alumni Bina Karya",
                          "Facebook",
                          "Whatsapp",
                          "Sosialisasi sekolah",
                          "Teman/Keluarga",
                          "Instagram",
                          "Tiktok",
                        ].map((srcName) => (
                          <button
                            type="button"
                            key={srcName}
                            onClick={() => handleCheckboxToggle(srcName)}
                            className={`flex items-center px-2.5 py-1.5 border rounded-lg hover:bg-slate-900/60 text-left text-xs transition relative ${
                              formData.sumber_informasi.includes(srcName)
                                ? "border-emerald-500 bg-emerald-950/25 text-emerald-400 font-bold"
                                : "border-slate-800 text-slate-400 bg-slate-950/20"
                            }`}
                          >
                            <span className="truncate">{srcName}</span>
                            {formData.sumber_informasi.includes(srcName) && (
                              <span className="absolute right-2 text-emerald-400 font-bold">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {errors.sumber_informasi && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1 font-semibold">
                          <span>⚠️</span> {errors.sumber_informasi}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form Nav Actions footer */}
            <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 shrink-0">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-305 px-3 py-2 rounded-lg transition shrink-0 ${
                  currentStep === 1 ? "opacity-0 pointer-events-none" : ""
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>

              {currentStep < 10 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-450 text-slate-950 px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-950/20 transition cursor-pointer font-sans uppercase tracking-wider"
                >
                  Lanjut <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-450 disabled:bg-slate-800 text-slate-950 px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-950/25 transition cursor-pointer font-sans uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Formulir <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Toast Error Alert */}
          {submitResult && submitResult.status === "error" && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#1a0f12] border border-red-950 text-red-200 rounded-xl p-3.5 flex gap-2 w-auto max-w-full z-50 shadow-2xl">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[11px] font-bold block mb-0.5">Kesalahan Server / Pembatasan:</span>
                <span className="text-[10px] text-red-300 block leading-normal">{submitResult.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setSubmitResult(null)}
                className="text-slate-500 hover:text-slate-350 font-bold text-sm shrink-0"
              >
                &times;
              </button>
            </div>
          )}

          {/* Success Overlay Panel */}
          {submitResult && submitResult.status === "success" && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in text-slate-100">
              <div className="w-14 h-14 bg-emerald-555/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-4 select-none border border-emerald-500/20">
                🎉
              </div>
              <h3 className="text-xl font-extrabold text-white leading-tight">Pendaftaran Sukses!</h3>
              <p className="text-emerald-400 font-semibold text-xs mt-1">Data Tersimpan ke Spreadsheet</p>
              
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 my-5 w-full text-left font-mono text-[10px] text-slate-400 overflow-x-auto space-y-1">
                <div className="font-bold text-[10px] text-slate-300 mb-1 border-b border-slate-800 pb-1">PRODUKSI SERIALIZED OBJECT:</div>
                <div><span className="text-emerald-400">"nama":</span> "{formData.nama}"</div>
                <div><span className="text-emerald-400">"alamat":</span> "{formData.alamat.substring(0, 25)}..."</div>
                <div><span className="text-emerald-400">"telepon":</span> "+62{formData.no_hp_wa}"</div>
                <div><span className="text-emerald-400">"program":</span> "{formData.program_pilihan}"</div>
                <div><span className="text-emerald-400">"ip_address":</span> "{formData.ip_address}"</div>
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
                {submitResult.message} Notifikasi otomatis dikirim ke: <strong className="text-emerald-400 font-medium">binakaryalht18@gmail.com</strong>.
              </p>

              <button
                type="button"
                onClick={resetForm}
                className="mt-6 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-bold rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Isi Baru (Reset)
              </button>
            </div>
          )}

          {/* Local Processing Loader */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="font-bold text-xs text-slate-200">Menghubungkan ke Database Cloud...</p>
              <p className="text-[10px] font-mono text-slate-500">Verifikasi Antispam & Honeypot</p>
            </div>
          )}

        </div>
      </div>

      {/* Embedded Wizard Footer */}
      <div className="bg-[#0b0c0f]/80 border-t border-slate-900 px-6 py-3.5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 font-medium shrink-0">
        <div>
          IP Terdeteksi: <span className="font-mono text-slate-350 bg-slate-950 px-2 py-0.5 rounded border border-slate-900/60 font-bold">{formData.ip_address}</span>
        </div>
        <div>
          Limit Demo IP: <span className="font-mono text-slate-355 bg-slate-950 px-2 py-0.5 rounded border border-slate-900/60 font-bold">{submitHistoryCount} / 5 kali pakai</span>
        </div>
      </div>
    </div>
  );
}
