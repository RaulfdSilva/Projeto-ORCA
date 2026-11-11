export const assistedManufacturer = "Bosch Rexroth";
export const assistedFamilies = ["A10VSO", "A4VSO"] as const;
export type EquipmentMode = "assisted" | "manual";
export interface EquipmentData {
  manufacturer: string;
  family: string;
  model: string;
  serial: string;
}
export interface Equipment extends EquipmentData {
  readonly id: string;
}
export const emptyEquipment: EquipmentData = { manufacturer: "", family: "", model: "", serial: "" };
export function equipmentLabel(equipment: Equipment): string {
  return [equipment.manufacturer, equipment.family, equipment.model, equipment.serial].filter(Boolean).join(" · ");
}
