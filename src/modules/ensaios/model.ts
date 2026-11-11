export const measurementFields = [
  { key: "pressure", label: "Pressão hidráulica", unit: "bar" },
  { key: "flow", label: "Vazão", unit: "L/min" },
  { key: "rotation", label: "Rotação", unit: "rpm" },
  { key: "temperature", label: "Temperatura", unit: "°C" },
  { key: "drainFlow", label: "Vazão de dreno", unit: "L/min" },
] as const;

export type MeasurementKey = (typeof measurementFields)[number]["key"];
export type Measurements = Record<MeasurementKey, number | null>;
export type PointDraft = Record<MeasurementKey, string>;
export interface MeasurementPoint {
  readonly id: string;
  readonly measurements: Measurements;
}
export interface HydraulicTest {
  readonly equipmentId: string;
  readonly id: string;
  readonly status: "active" | "finished";
  readonly points: readonly MeasurementPoint[];
}
export const emptyDraft: PointDraft = {
  pressure: "", flow: "", rotation: "", temperature: "", drainFlow: "",
};
export function pointToDraft(point: MeasurementPoint): PointDraft {
  return Object.fromEntries(measurementFields.map(({ key }) => [
    key, point.measurements[key]?.toLocaleString("en-US", { useGrouping: false, maximumSignificantDigits: 21 }) ?? "",
  ])) as PointDraft;
}

export function hasMeasurements(measurements: Measurements): boolean {
  return measurementFields.some(({ key }) => measurements[key] !== null);
}
