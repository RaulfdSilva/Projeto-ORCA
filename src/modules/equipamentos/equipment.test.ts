import { describe, expect, it } from "vitest";
import { validateEquipment } from "./validation";
import { equipmentReducer } from "./state";
import { applicationReducer, initialApplication } from "@/state/application";

const equipment = { id: "equipment-a", manufacturer: "Bosch Rexroth", family: "A10VSO", model: "Identificação informada pelo operador", serial: "" };
describe("cadastro híbrido e integridade referencial", () => {
  it.each(["A10VSO", "A4VSO"])("aceita cadastro assistido da família %s com modelo livre", family => {
    expect(validateEquipment({ ...equipment, family }, "assisted")).toMatchObject({ ok: true, data: { family } });
  });
  it("aceita fabricante e família livres e normaliza espaços sem exigir série", () => {
    expect(validateEquipment({ manufacturer: " Outro fabricante ", family: " Outra família ", model: " Modelo informado ", serial: " " })).toEqual({
      ok: true, data: { manufacturer: "Outro fabricante", family: "Outra família", model: "Modelo informado", serial: "" },
    });
  });
  it.each(["manufacturer", "family", "model"] as const)("exige %s e não aceita apenas espaços", key => {
    expect(validateEquipment({ ...equipment, [key]: "  " })).toMatchObject({ ok: false, errors: { [key]: expect.any(String) } });
  });
  it("rejeita família/fabricante fora da seleção assistida sem restringir modo manual", () => {
    const data = { ...equipment, manufacturer: "Outro", family: "Livre" };
    expect(validateEquipment(data, "assisted").ok).toBe(false);
    expect(validateEquipment(data, "manual").ok).toBe(true);
  });
  it("edita sem alterar o ID, sem mutar o original e rejeita duplicatas e dados inválidos", () => {
    const original = equipmentReducer([], { type: "equipment/add", equipment });
    const data = { ...equipment, model: "Identificação revisada", serial: "CÓDIGO-1" };
    const edited = equipmentReducer(original, { type: "equipment/update", id: equipment.id, data });
    expect(edited).toEqual([{ ...data, id: equipment.id }]);
    expect(original[0]).toEqual(equipment);
    expect(equipmentReducer(original, { type: "equipment/add", equipment })).toBe(original);
    expect(equipmentReducer(original, { type: "equipment/update", id: "inexistente", data })).toBe(original);
    expect(equipmentReducer(original, { type: "equipment/add", equipment: { ...equipment, id: "" } })).toBe(original);
    expect(equipmentReducer(original, { type: "equipment/update", id: equipment.id, data: { ...data, model: "" } })).toBe(original);
  });
  it("impede início sem cadastro ou com ID inexistente e permite somente vínculo válido", () => {
    const start = { type: "start", id: "test-a", equipmentId: equipment.id } as const;
    expect(applicationReducer(initialApplication, start)).toBe(initialApplication);
    const registered = applicationReducer(initialApplication, { type: "equipment/add", equipment });
    expect(applicationReducer(registered, { ...start, equipmentId: "ausente" })).toBe(registered);
    const active = applicationReducer(registered, start);
    expect(active.test?.equipmentId).toBe(equipment.id);
    expect(applicationReducer(active, { ...start, equipmentId: "outro" })).toBe(active);
  });
  it("preserva a referência ao editar cadastro e bloqueia alterações do ensaio finalizado", () => {
    let state = applicationReducer(initialApplication, { type: "equipment/add", equipment });
    state = applicationReducer(state, { type: "start", id: "test-a", equipmentId: equipment.id });
    state = applicationReducer(state, { type: "finish" });
    const finalTest = state.test;
    state = applicationReducer(state, { type: "equipment/update", id: equipment.id, data: { ...equipment, model: "Dados revisados" } });
    expect(state.test).toBe(finalTest);
    expect(state.equipment.some(item => item.id === state.test?.equipmentId)).toBe(true);
    expect(applicationReducer(state, { type: "start", id: "test-b", equipmentId: equipment.id })).toBe(state);
    expect(applicationReducer(state, { type: "remove", id: "point-a" })).toBe(state);
  });
});
