// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProvider } from "@/modules/ensaios/components/test-provider";
import { TestWorkspace } from "@/modules/ensaios/components/test-workspace";
import { EquipmentWorkspace } from "./components/equipment-workspace";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
async function navigate(page: string) {
  await act(async () => { root.render(<TestProvider>{page === "equipamentos" ? <EquipmentWorkspace /> : page === "ensaios" ? <TestWorkspace /> : <p>{page}</p>}</TestProvider>); });
}
async function click(label: string) {
  const button = [...container.querySelectorAll("button")].find(item => item.textContent === label || item.getAttribute("aria-label") === label);
  if (!button) throw new Error(`Botão não encontrado: ${label}`);
  await act(async () => { button.click(); });
}
async function input(id: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
  await act(async () => {
    if (field instanceof HTMLSelectElement) { field.value = value; field.dispatchEvent(new Event("change", { bubbles: true })); }
    else { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value); field.dispatchEvent(new Event("input", { bubbles: true })); }
  });
}
async function registerManual() {
  await input("equipment-manufacturer", "Fabricante livre");
  await input("equipment-family", "Família livre");
  await input("equipment-model", "Identificação livre");
  await click("Cadastrar equipamento");
}
beforeEach(() => { container = document.createElement("div"); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => { root.unmount(); }); container.remove(); });

describe("cadastro e vínculo na interface", () => {
  it("orienta cadastro e impede iniciar ensaio sem equipamento", async () => {
    await navigate("ensaios");
    expect(container.textContent).toContain("Cadastre um equipamento antes de iniciar");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/equipamentos");
    expect(container.querySelector<HTMLButtonElement>("button")?.disabled).toBe(true);
    await click("Iniciar ensaio");
    expect(container.querySelector("#test-status")).toBeNull();
  });
  it("cadastra Rexroth com seleção assistida sem catálogo fictício de modelos", async () => {
    await navigate("equipamentos");
    await act(async () => { container.querySelector<HTMLInputElement>('input[value="assisted"]')!.click(); });
    expect(container.querySelector<HTMLInputElement>("#equipment-manufacturer")!.value).toBe("Bosch Rexroth");
    await input("equipment-family", "A4VSO");
    await input("equipment-model", "Modelo completo informado");
    await click("Cadastrar equipamento");
    expect(container.querySelector("li")!.textContent).toContain("Bosch Rexroth · A4VSO · Modelo completo informado");
  });
  it("exibe validações de obrigatórios e preserva rascunho durante navegação", async () => {
    await navigate("equipamentos");
    await click("Cadastrar equipamento");
    expect(container.querySelectorAll('[aria-invalid="true"]')).toHaveLength(3);
    await input("equipment-manufacturer", "Operador");
    await navigate("início"); await navigate("equipamentos");
    expect(container.querySelector<HTMLInputElement>("#equipment-manufacturer")!.value).toBe("Operador");
    expect(container.querySelector("#equipment-family")!.getAttribute("aria-invalid")).toBe("true");
  });
  it("exige seleção explícita e vincula o equipamento escolhido entre vários", async () => {
    await navigate("equipamentos"); await registerManual();
    await input("equipment-manufacturer", "Segundo fabricante");
    await input("equipment-family", "Segunda família");
    await input("equipment-model", "Segunda identificação");
    await input("equipment-serial", "CÓDIGO-2");
    await click("Cadastrar equipamento");
    const id = container.querySelectorAll("li button")[1].getAttribute("aria-label")!.replace("Editar equipamento ", "");
    await navigate("ensaios");
    expect(container.querySelector<HTMLButtonElement>("button")!.disabled).toBe(true);
    await input("test-equipment", id);
    await click("Iniciar ensaio");
    expect(container.textContent).toContain(`ID do equipamento: ${id}`);
    expect(container.querySelector('[data-testid="linked-equipment"]')!.textContent).toContain("Segundo fabricante · Segunda família · Segunda identificação · CÓDIGO-2");
  });
  it("preserva cadastro, edição, vínculo e finalização entre seções", async () => {
    await navigate("equipamentos"); await registerManual();
    const equipmentId = container.querySelector("li button")!.getAttribute("aria-label")!.replace("Editar equipamento ", "");
    await navigate("ensaios");
    await input("test-equipment", equipmentId);
    await click("Iniciar ensaio");
    expect(container.querySelector('[data-testid="linked-equipment"]')!.textContent).toContain("Fabricante livre · Família livre · Identificação livre");
    expect(container.textContent).toContain(`ID do equipamento: ${equipmentId}`);
    await click("Adicionar ponto");
    await navigate("equipamentos");
    expect(container.querySelectorAll("li")).toHaveLength(1);
    await click(`Editar equipamento ${equipmentId}`);
    await input("equipment-model", "Identificação revisada");
    await navigate("relatorios"); await navigate("equipamentos");
    expect(container.querySelector<HTMLInputElement>("#equipment-model")!.value).toBe("Identificação revisada");
    await click("Salvar equipamento");
    expect(container.querySelector("li button")!.getAttribute("aria-label")).toContain(equipmentId);
    await navigate("ensaios");
    expect(container.textContent).toContain(`ID do equipamento: ${equipmentId}`);
    expect(container.querySelector('[data-testid="linked-equipment"]')!.textContent).toContain("Identificação revisada");
    expect(container.querySelectorAll("li")).toHaveLength(1);
    await click("Finalizar ensaio");
    await navigate("equipamentos"); await navigate("ensaios");
    expect(container.querySelector("#test-status")!.textContent).toBe("Ensaio finalizado");
    expect(container.querySelector("#test-equipment")).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(container.textContent).toContain(`ID do equipamento: ${equipmentId}`);
  });
});
