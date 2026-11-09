import { describe, expect, it } from "vitest";
import { emptyDraft, measurementFields, pointToDraft } from "./model";
import { validatePoint } from "./validation";

describe("validação de medições", () => {
  it("distingue ausência de zero nos cinco campos", () => {
    expect(validatePoint({ ...emptyDraft })).toEqual({ ok: true, measurements: {
      pressure: null, flow: null, rotation: null, temperature: null, drainFlow: null,
    } });
    const result = validatePoint({ pressure: "0", flow: "0", rotation: "0", temperature: "0", drainFlow: "0" });
    expect(result).toEqual({ ok: true, measurements: {
      pressure: 0, flow: 0, rotation: 0, temperature: 0, drainFlow: 0,
    } });
  });
  it("aceita decimais com vírgula ou ponto, sinais e espaços externos, sem impor limites hidráulicos", () => {
    expect(validatePoint({ pressure: " 12,5 ", flow: "+0.5", rotation: "1234", temperature: "-5,2", drainFlow: " " })).toEqual({
      ok: true, measurements: { pressure: 12.5, flow: 0.5, rotation: 1234, temperature: -5.2, drainFlow: null },
    });
  });
  it.each(["abc", "NaN", "Infinity", "-Infinity", "12 bar", "1,2,3", "1.234,5", "1 000", "0x10", "1e3", "-", "1.", "9".repeat(400)])(
    "rejeita entrada inválida em cada campo: %s", value => {
      for (const { key } of measurementFields) {
        const result = validatePoint({ ...emptyDraft, [key]: value });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.errors[key]).toBeTruthy();
      }
    },
  );
  it("retorna erros de todos os campos inválidos sem produzir medições parciais", () => {
    expect(validatePoint({ ...emptyDraft, pressure: "x", flow: "y" })).toMatchObject({
      ok: false, errors: { pressure: expect.any(String), flow: expect.any(String) },
    });
  });
  it("preserva valores pequenos, grandes, zero e ausência ao reabrir a edição", () => {
    const measurements = { pressure: 1e25, flow: 1e-25, rotation: 0, temperature: -5, drainFlow: null };
    expect(validatePoint(pointToDraft({ id: "point-a", measurements }))).toEqual({ ok: true, measurements });
  });
});

it("não transforma entrada decimal não nula em zero por underflow", () => {
  const result = validatePoint({ ...emptyDraft, pressure: `0.${"0".repeat(400)}1` });
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.errors.pressure).toContain("zero");
});
