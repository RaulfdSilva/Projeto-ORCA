import type { HydraulicTest, MeasurementPoint, Measurements } from "./model";
import { hasValidMeasurements } from "./validation";

export type TestAction =
  | { type: "start"; id: string; equipmentId: string }
  | { type: "add"; point: MeasurementPoint }
  | { type: "update"; id: string; measurements: Measurements }
  | { type: "remove"; id: string }
  | { type: "finish" };

export function testReducer(state: HydraulicTest | null, action: TestAction): HydraulicTest | null {
  if (action.type === "start") {
    return state === null && action.id.trim() && action.equipmentId.trim() ? { id: action.id, equipmentId: action.equipmentId, status: "active", points: [] } : state;
  }
  if (!state || state.status !== "active") return state;
  switch (action.type) {
    case "add":
      if (!action.point.id.trim() || state.points.some(point => point.id === action.point.id) ||
          !hasValidMeasurements(action.point.measurements)) return state;
      return { ...state, points: [...state.points, action.point] };
    case "update":
      if (!hasValidMeasurements(action.measurements) || !state.points.some(point => point.id === action.id)) return state;
      return { ...state, points: state.points.map(point => point.id === action.id
        ? { ...point, measurements: action.measurements } : point) };
    case "remove":
      return { ...state, points: state.points.filter(point => point.id !== action.id) };
    case "finish":
      return { ...state, status: "finished" };
  }
}
