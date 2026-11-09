import { describe, expect, it } from "vitest";
import type { HydraulicTest, MeasurementPoint } from "./model";
import { testReducer, type TestAction } from "./state";

const point: MeasurementPoint = { id: "point-a", measurements: {
  pressure: 0, flow: null, rotation: 1000, temperature: -2, drainFlow: null,
} };
const active: HydraulicTest = { id: "test-a", status: "active", points: [] };

describe("manipulação de pontos no ensaio", () => {
  it("inicia um ensaio vazio e impede reinício acidental", () => {
    expect(testReducer(null, { type: "start", id: "test-a" })).toEqual(active);
    expect(testReducer(null, { type: "start", id: " " })).toBeNull();
    expect(testReducer(active, { type: "start", id: "test-b" })).toBe(active);
  });
  it("adiciona múltiplos pontos, edita preservando IDs e exclui somente o ponto solicitado sem mutar o original", () => {
    const first = testReducer(active, { type: "add", point });
    const secondPoint = { ...point, id: "point-b" };
    const second = testReducer(first, { type: "add", point: secondPoint });
    const measurements = { ...point.measurements, pressure: null, flow: 0 };
    const updated = testReducer(second, { type: "update", id: point.id, measurements });
    expect(updated?.points).toEqual([{ ...point, measurements }, secondPoint]);
    expect(updated?.id).toBe(active.id);
    expect(second?.points[0]).toEqual(point);
    expect(active.points).toHaveLength(0);
    const removed = testReducer(updated, { type: "remove", id: point.id });
    expect(removed?.points).toEqual([secondPoint]);
    const third = testReducer(removed, { type: "add", point: { ...point, id: "point-c" } });
    expect(third?.points.map(item => item.id)).toEqual(["point-b", "point-c"]);
  });
  it("rejeita IDs vazios, duplicados, edição inexistente e números não finitos", () => {
    const populated = testReducer(active, { type: "add", point });
    expect(testReducer(populated, { type: "add", point })).toBe(populated);
    expect(testReducer(active, { type: "add", point: { ...point, id: "" } })).toBe(active);
    expect(testReducer(populated, { type: "update", id: "unknown", measurements: point.measurements })).toBe(populated);
    for (const pressure of [NaN, Infinity, -Infinity]) {
      const measurements = { ...point.measurements, pressure };
      expect(testReducer(active, { type: "add", point: { ...point, measurements } })).toBe(active);
      expect(testReducer(populated, { type: "update", id: point.id, measurements })).toBe(populated);
    }
  });
  it("permite pontos sem medições sem inventar campos obrigatórios", () => {
    const measurements = { pressure: null, flow: null, rotation: null, temperature: null, drainFlow: null };
    expect(testReducer(active, { type: "add", point: { ...point, measurements } })?.points[0].measurements).toEqual(measurements);
  });
  it("finaliza preservando os pontos e bloqueia todas as alterações posteriores", () => {
    const populated = testReducer(active, { type: "add", point });
    const finished = testReducer(populated, { type: "finish" });
    expect(finished).toEqual({ ...populated, status: "finished" });
    const actions: TestAction[] = [
      { type: "add", point: { ...point, id: "point-b" } },
      { type: "update", id: point.id, measurements: { ...point.measurements, flow: 1 } },
      { type: "remove", id: point.id }, { type: "finish" }, { type: "start", id: "test-b" },
    ];
    for (const action of actions) expect(testReducer(finished, action)).toBe(finished);
  });
  it("ignora operações sem ensaio iniciado e remoção de ID inexistente preserva dados", () => {
    expect(testReducer(null, { type: "add", point })).toBeNull();
    expect(testReducer(null, { type: "finish" })).toBeNull();
    const populated = testReducer(active, { type: "add", point });
    expect(testReducer(populated, { type: "remove", id: "unknown" })).toEqual(populated);
  });
});

it("finaliza ensaios vazios e preserva null e zero após edição e finalização", () => {
  expect(testReducer(active, { type: "finish" })).toEqual({ ...active, status: "finished" });
  const populated = testReducer(active, { type: "add", point });
  const measurements = { pressure: null, flow: 0, rotation: null, temperature: 0, drainFlow: null };
  const updated = testReducer(populated, { type: "update", id: point.id, measurements });
  const finished = testReducer(updated, { type: "finish" });
  expect(finished?.points[0]).toEqual({ id: point.id, measurements });
  expect(testReducer(finished, { type: "remove", id: point.id })).toBe(finished);
});
