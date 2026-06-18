/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RegistrationFormData {
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  asal_sekolah: string;
  no_hp_wa: string;
  email: string;
  program_pilihan: string;
  sumber_informasi: string[]; // checkboxes
  website_field: string; // Honeypot
  ip_address: string;
}

export interface FormStep {
  id: number;
  label: string;
  question: string;
  description?: string;
  field: keyof RegistrationFormData;
  type: "text" | "date" | "radio" | "textarea" | "tel" | "email" | "checkbox";
  options?: string[];
  placeholder?: string;
}
