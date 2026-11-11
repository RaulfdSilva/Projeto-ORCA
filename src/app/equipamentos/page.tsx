import type { Metadata } from "next";
import { EquipmentWorkspace } from "@/modules/equipamentos/components/equipment-workspace";
export const metadata: Metadata = { title: "Equipamentos" };
export default function Page() {
  return <section><p className="text-sm font-bold uppercase tracking-widest text-sky-800">Cadastro híbrido</p>
    <h1 className="mt-4 text-4xl font-bold">Equipamentos hidráulicos</h1>
    <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">Cadastre, consulte e edite equipamentos para vinculá-los aos ensaios. Use a seleção assistida ou informe livremente os dados no modo manual.</p>
    <EquipmentWorkspace />
  </section>;
}
