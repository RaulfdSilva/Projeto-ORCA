import { equipamentos } from "./equipamentos";
import { ensaios } from "./ensaios";
import { diagnosticos } from "./diagnosticos";
import { relatorios } from "./relatorios";
export const modules = [equipamentos, ensaios, diagnosticos, relatorios] as const;
