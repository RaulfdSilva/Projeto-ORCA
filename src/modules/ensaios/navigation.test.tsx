// @vitest-environment jsdom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProvider, useEquipmentWorkspace } from "./components/test-provider";
import { TestWorkspace } from "./components/test-workspace";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;

// Os testes de regressão de medições agora partem de um equipamento cadastrado.
function EquipmentFixture() {
  const { dispatch } = useEquipmentWorkspace();
  useEffect(() => { dispatch({ type: "equipment/add", equipment: {
    id: "fixture-equipment", manufacturer: "Fabricante de teste", family: "Família de teste", model: "Modelo de teste", serial: "",
  } }); }, [dispatch]);
  return null;
}
// Reproduz o contrato do App Router: o layout/provider permanece, a página desmonta.
async function navigate(section: string) {
  await act(async () => {
    root.render(<TestProvider><EquipmentFixture />{section === "ensaios"
      ? <TestWorkspace />
      : <section key={section}>{section}</section>}</TestProvider>);
  });
}
async function click(label: string) {
  if (label === "Iniciar ensaio") {
    const select = container.querySelector<HTMLSelectElement>("#test-equipment");
    if (select) await act(async () => {
      select.value = "fixture-equipment";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  const button = [...container.querySelectorAll("button")].find(item =>
    item.getAttribute("aria-label") === label || item.textContent === label);
  if (!button) throw new Error(`Botão não encontrado: ${label}`);
  await act(async () => { button.click(); });
}
async function fill(key: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`#measurement-${key}`);
  if (!input) throw new Error(`Campo não encontrado: ${key}`);
  await act(async () => {
    // O setter nativo permite ao React detectar a alteração via evento de entrada.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function unloadIsPrevented() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
});

describe("estado compartilhado entre seções", () => {
  it("preserva IDs, pontos, null, zero e rascunho ao sair e retornar", async () => {
    await navigate("ensaios");
    expect(unloadIsPrevented()).toBe(false);
    await click("Iniciar ensaio");
    await fill("pressure", "0");
    await click("Adicionar ponto");
    const testId = container.querySelector("#test-status + p")!.textContent;
    const pointId = container.querySelector("li h3 + p")!.textContent;
    await fill("flow", "12,5");
    for (const section of ["equipamentos", "diagnosticos", "relatorios", "início"]) {
      await navigate(section);
      expect(container.querySelector("#point-form-title")).toBeNull();
      expect(unloadIsPrevented()).toBe(true);
      await navigate("ensaios");
      expect(container.querySelector("#test-status + p")!.textContent).toBe(testId);
      expect(container.querySelector("li h3 + p")!.textContent).toBe(pointId);
      expect(container.querySelector("li dd")!.textContent).toBe("0");
      expect(container.querySelectorAll("li dd")[1].textContent).toBe("Sem dado");
      expect(container.querySelector<HTMLInputElement>("#measurement-flow")!.value).toBe("12,5");
    }
  });

  it("preserva uma edição com erro e permite salvá-la após retornar", async () => {
    await navigate("ensaios");
    await click("Iniciar ensaio");
    await click("Adicionar ponto");
    await click("Editar ponto 1");
    await fill("temperature", "inválido");
    await click("Salvar alterações");
    const pointId = container.querySelector("li h3 + p")!.textContent;
    await navigate("equipamentos");
    await navigate("ensaios");
    expect(container.querySelector("#point-form-title")!.textContent).toBe("Editar ponto");
    expect(container.querySelector<HTMLInputElement>("#measurement-temperature")!.value).toBe("inválido");
    expect(container.querySelector("#measurement-temperature")!.getAttribute("aria-invalid")).toBe("true");
    await fill("temperature", "0");
    await click("Salvar alterações");
    expect(container.querySelector("li h3 + p")!.textContent).toBe(pointId);
    expect(container.querySelectorAll("li dd")[3].textContent).toBe("0");
    expect(container.querySelector("li dd")!.textContent).toBe("Sem dado");
  });

  it("mantém finalização e remove a proteção de saída inclusive após navegar", async () => {
    await navigate("ensaios");
    await click("Iniciar ensaio");
    expect(unloadIsPrevented()).toBe(true);
    await click("Adicionar ponto");
    await click("Finalizar ensaio");
    expect(unloadIsPrevented()).toBe(false);
    await navigate("relatorios");
    expect(unloadIsPrevented()).toBe(false);
    await navigate("ensaios");
    expect(container.querySelector("#test-status")!.textContent).toBe("Ensaio finalizado");
    expect(container.querySelectorAll("li")).toHaveLength(1);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  it("protege ensaio vazio fora da página e não persiste ao recriar a aplicação", async () => {
    await navigate("ensaios");
    await click("Iniciar ensaio");
    await navigate("início");
    expect(unloadIsPrevented()).toBe(true);
    await act(async () => { root.unmount(); });
    expect(unloadIsPrevented()).toBe(false);
    root = createRoot(container);
    await navigate("ensaios");
    expect(container.textContent).toContain("Iniciar ensaio");
    expect(container.querySelector("#test-status")).toBeNull();
    expect(unloadIsPrevented()).toBe(false);
  });
});
