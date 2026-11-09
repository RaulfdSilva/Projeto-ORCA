import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { hasMeasurements, measurementFields, type Measurements } from "./model";
import { NoMeasurementsNotice } from "./components/no-measurements-notice";

const absent: Measurements = { pressure: null, flow: null, rotation: null, temperature: null, drainFlow: null };

describe("avisos informativos de ausência de medições", () => {
  it("identifica pontos ausentes e ensaios vazios ou sem nenhuma medição", () => {
    expect(hasMeasurements(absent)).toBe(false);
    expect([].some(hasMeasurements)).toBe(false);
    expect([absent, absent].some(hasMeasurements)).toBe(false);
  });
  it("considera zero uma medição em qualquer um dos campos", () => {
    for (const { key } of measurementFields) {
      expect(hasMeasurements({ ...absent, [key]: 0 })).toBe(true);
    }
  });
  it.each(["point", "test"] as const)("renderiza aviso acessível para %s sem inferir diagnóstico", subject => {
    const html = renderToStaticMarkup(createElement(NoMeasurementsNotice, { subject }));
    expect(html).toContain(subject === "point" ? "Este ponto" : "Este ensaio");
    expect(html).toContain("não contém dados suficientes para análise técnica");
    expect(html).toContain('role="note"');
  });
});
