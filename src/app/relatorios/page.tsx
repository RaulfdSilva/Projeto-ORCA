import type { Metadata } from "next";
import Link from "next/link";
import { relatorios as module } from "@/modules/relatorios";
export const metadata: Metadata = { title: module.title };
export default function Page() {
 return <section className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-widest text-sky-800">Estrutura reservada</p><h1 className="mt-4 text-4xl font-bold">{module.title}</h1><p className="mt-6 text-lg text-slate-600">{module.description}</p><p className="mt-4 leading-relaxed text-slate-600">Nenhuma funcionalidade de negócio foi implementada. O desenvolvimento depende de requisitos aprovados.</p><Link href="/" className="mt-8 inline-block font-semibold text-sky-800">Voltar ao início →</Link></section>;
}
