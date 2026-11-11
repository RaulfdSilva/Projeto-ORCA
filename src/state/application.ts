import type { Equipment } from "@/modules/equipamentos/model";
import { equipmentReducer, type EquipmentAction } from "@/modules/equipamentos/state";
import type { HydraulicTest } from "@/modules/ensaios/model";
import { testReducer, type TestAction } from "@/modules/ensaios/state";
export interface ApplicationState {
  readonly equipment: readonly Equipment[];
  readonly test: HydraulicTest | null;
}
export type ApplicationAction = EquipmentAction | TestAction;
export const initialApplication: ApplicationState = { equipment: [], test: null };
export function applicationReducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  if (action.type === "equipment/add" || action.type === "equipment/update") {
    const equipment = equipmentReducer(state.equipment, action);
    return equipment === state.equipment ? state : { ...state, equipment };
  }
  if (action.type === "start" && !state.equipment.some(item => item.id === action.equipmentId)) return state;
  const test = testReducer(state.test, action);
  return test === state.test ? state : { ...state, test };
}
