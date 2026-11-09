import { describe, expect, it, vi } from "vitest";
import { registerBeforeUnload } from "./before-unload";

describe("proteção nativa contra perda de ensaio ativo", () => {
  it("solicita confirmação inclusive para ensaio iniciado sem pontos", () => {
    const target = new EventTarget();
    const add = vi.spyOn(target, "addEventListener");
    const remove = vi.spyOn(target, "removeEventListener");
    const cleanup = registerBeforeUnload(target, true);
    const event = new Event("beforeunload", { cancelable: true });
    target.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    cleanup();
    expect(remove).toHaveBeenCalledWith("beforeunload", add.mock.calls[0][1]);
    const afterCleanup = new Event("beforeunload", { cancelable: true });
    target.dispatchEvent(afterCleanup);
    expect(afterCleanup.defaultPrevented).toBe(false);
  });
  it("não registra proteção antes do início ou após a finalização", () => {
    const target = new EventTarget();
    const add = vi.spyOn(target, "addEventListener");
    const cleanup = registerBeforeUnload(target, false);
    const event = new Event("beforeunload", { cancelable: true });
    target.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(add).not.toHaveBeenCalled();
    expect(cleanup).not.toThrow();
  });
  it("remove o listener ativo ao finalizar e admite ciclos de montagem e desmontagem", () => {
    const target = new EventTarget();
    registerBeforeUnload(target, true)();
    const cleanup = registerBeforeUnload(target, true);
    const active = new Event("beforeunload", { cancelable: true });
    target.dispatchEvent(active);
    expect(active.defaultPrevented).toBe(true);
    cleanup();
    registerBeforeUnload(target, false);
    const finished = new Event("beforeunload", { cancelable: true });
    target.dispatchEvent(finished);
    expect(finished.defaultPrevented).toBe(false);
  });
});
