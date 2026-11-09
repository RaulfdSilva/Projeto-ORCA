import { measurementFields, type Measurements, type MeasurementKey, type PointDraft } from "./model";

export type FieldErrors = Partial<Record<MeasurementKey, string>>;
export type ValidationResult =
  | { ok: true; measurements: Measurements }
  | { ok: false; errors: FieldErrors };

// A validação é sintática. Nenhum limite hidráulico é inferido.
export function validatePoint(draft: PointDraft): ValidationResult {
  const errors: FieldErrors = {};
  const measurements = {} as Measurements;
  for (const { key } of measurementFields) {
    const raw = draft[key].trim();
    if (raw === "") {
      measurements[key] = null;
      continue;
    }
    const value = Number(raw.replace(",", "."));
    if (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(raw) || !Number.isFinite(value)) {
      errors[key] = "Informe um número decimal finito, sem unidade ou separador de milhar, ou deixe em branco.";
    } else if (value === 0 && /[1-9]/.test(raw)) {
      errors[key] = "Valor pequeno demais para representar sem convertê-lo em zero. Informe um valor representável ou deixe em branco.";
    } else {
      measurements[key] = value;
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, measurements };
}

export function hasValidMeasurements(measurements: Measurements): boolean {
  return measurementFields.every(({ key }) => measurements[key] === null ||
    (typeof measurements[key] === "number" && Number.isFinite(measurements[key])));
}
