import type { Equipment, EquipmentData } from "./model";
import { validateEquipment } from "./validation";
export type EquipmentAction =
  | { type: "equipment/add"; equipment: Equipment }
  | { type: "equipment/update"; id: string; data: EquipmentData };
export function equipmentReducer(state: readonly Equipment[], action: EquipmentAction): readonly Equipment[] {
  const result = validateEquipment(action.type === "equipment/add" ? action.equipment : action.data);
  if (!result.ok) return state;
  if (action.type === "equipment/add") {
    if (!action.equipment.id.trim() || state.some(item => item.id === action.equipment.id)) return state;
    return [...state, { id: action.equipment.id, ...result.data }];
  }
  if (!state.some(item => item.id === action.id)) return state;
  return state.map(item => item.id === action.id ? { id: item.id, ...result.data } : item);
}
