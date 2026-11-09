import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { modules } from "./index";
import Home from "../app/page";
import { PrototypeNotice } from "../components/prototype-notice";

describe("fundação demonstrativa", () => {
  it("mantém o aviso operacional explícito e acessível", () => {
    const html = renderToStaticMarkup(createElement(PrototypeNotice));
    expect(html).toContain("Protótipo demonstrativo — não validado para uso operacional");
    expect(html).toContain('role="note"');
  });
  it("oferece navegação para os quatro módulos reservados", () => {
    expect(modules.map(module => module.slug)).toEqual([
      "equipamentos", "ensaios", "diagnosticos", "relatorios",
    ]);
    const html = renderToStaticMarkup(createElement(Home));
    for (const item of modules) {
      expect(html).toContain(`href="/${item.slug}"`);
      expect(html).toContain(item.title);
    }
    expect(html).toContain("Estrutura reservada");
  });
});
