import { assistedFamilies, assistedManufacturer, type EquipmentData, type EquipmentMode } from "./model";
export type EquipmentErrors = Partial<Record<keyof EquipmentData, string>>;
export function validateEquipment(draft: EquipmentData, mode: EquipmentMode = "manual"):
  { ok: true; data: EquipmentData } | { ok: false; errors: EquipmentErrors } {
  const data: EquipmentData = {
    manufacturer: draft.manufacturer.trim(), family: draft.family.trim(),
    model: draft.model.trim(), serial: draft.serial.trim(),
  };
  const errors: EquipmentErrors = {};
  for (const key of ["manufacturer", "family", "model"] as const) {
    if (!data[key]) errors[key] = "Preencha este campo.";
  }
  if (mode === "assisted") {
    if (data.manufacturer !== assistedManufacturer) errors.manufacturer = "Selecione Bosch Rexroth ou utilize o cadastro manual.";
    if (!assistedFamilies.some(family => family === data.family)) errors.family = "Selecione A10VSO ou A4VSO ou utilize o cadastro manual.";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
