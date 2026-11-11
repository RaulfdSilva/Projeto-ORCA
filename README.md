# Projeto-ORCA
O ORCA é uma plataforma inteligente de diagnóstico e monitoramento de bombas e motores hidráulicos. Utilizando inteligência artificial e análise de parâmetros operacionais, identifica anomalias, sugere possíveis causas de falhas e auxilia profissionais na manutenção preventiva, reduzindo riscos de paradas e custos operacionais.

## Estado atual

A descrição acima registra a visão original do projeto, e não funcionalidades disponíveis. Além da fundação técnica, o módulo de ensaios permite registro manual de múltiplos pontos, edição, exclusão e finalização em memória. Equipamentos possui cadastro híbrido em memória e vínculo com ensaios; diagnósticos e relatórios permanecem como páginas informativas.

**Protótipo demonstrativo — não validado para uso operacional**

Não há autenticação, banco de dados, APIs externas, IA, sensores, dados de oficina ou resultados de diagnósticos. Funcionalidades de negócio dependem de novos requisitos aprovados. O [PRD](docs/PRD.md) é apenas um placeholder.

## Instalação e execução

Requisitos: Node.js 22.13 ou superior e npm. As versões resolvidas estão em `package-lock.json`.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para produção local:

```sh
npm run build
npm start
```

## Verificações

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

`lint` executa ESLint; `typecheck` verifica TypeScript strict; `test` executa Vitest sem modo de observação; `build` gera a aplicação Next.js com Webpack. Não são necessárias variáveis de ambiente.

## Estrutura

- `src/app/`: App Router, layout, estilos e páginas informativas.
- `src/components/`: componentes compartilhados, incluindo o aviso do protótipo.
- `src/modules/`: diretórios independentes para equipamentos, ensaios, diagnósticos e relatórios; equipamentos e ensaios contêm modelos, validações, estado e interface; diagnósticos e relatórios contêm somente metadados de apresentação.
- `src/state/application.ts`: composição do estado de equipamentos e ensaio com verificação de integridade referencial.
- `docs/PRD.md`: espaço para requisitos futuros aprovados.

Tailwind CSS cuida da apresentação; não há biblioteca adicional de componentes. O módulo de ensaios usa estado React compartilhado no layout raiz, sem serviços ou persistência. Os testes verificam o aviso do protótipo, a navegação, as validações e a manipulação de pontos, sem simular diagnósticos hidráulicos.

## Ensaios multiponto

Cadastre primeiro um equipamento em `/equipamentos`. Em `/ensaios`, selecione esse equipamento e **Iniciar ensaio**, preencha as medições disponíveis e use **Adicionar ponto**. Os campos são opcionais: vazio significa sem dado, enquanto `0` é registrado como zero. Edite ou exclua os pontos antes de selecionar **Finalizar ensaio**. Salve ou cancele uma edição aberta antes de manipular outro ponto ou finalizar.

Os dados existem somente na memória da aplicação. Navegar internamente entre as seções do ORCA preserva o ensaio, seus pontos e a edição aberta. Recarregar, fechar ou sair da aplicação apaga o ensaio. Finalizar bloqueia alterações, sem salvar permanentemente nem avaliar medições. O equipamento cadastrado é obrigatório para iniciar um ensaio. Não há cálculo de diagnóstico ou limites hidráulicos.

Pontos sem medições e ensaios sem dados continuam permitidos, com aviso informativo de insuficiência para análise técnica. Durante um ensaio não finalizado, a aplicação solicita confirmação nativa ao recarregar ou fechar a página, conforme suporte do navegador. A proteção de recarga/fechamento continua ativa nas demais seções enquanto o ensaio estiver em andamento. A navegação interna não requer confirmação porque o estado é preservado no layout compartilhado; após finalizar, a confirmação é removida.

Consulte [decisões técnicas e limitações](docs/ensaios-multiponto.md).

## Cadastro híbrido de equipamentos

Em `/equipamentos`, escolha cadastro manual ou seleção assistida. O modo assistido preenche Bosch Rexroth e oferece somente A10VSO e A4VSO; o operador deve informar o modelo completo. No manual, fabricante, família e modelo são livres e obrigatórios. Número de série ou código interno é opcional. Não há catálogo de modelos ou dados técnicos inferidos.

Cadastros podem ser consultados e editados, sem exclusão. O ID é gerado automaticamente e não muda na edição. Selecione um equipamento antes de iniciar o ensaio: seu ID fica vinculado e sua identificação aparece no resumo. O vínculo não pode ser trocado após o início, inclusive depois da finalização.

Equipamentos, ensaios e formulários são mantidos no layout compartilhado durante navegação interna. Recarregar, fechar ou sair da aplicação elimina todos os dados. Não há banco de dados, API ou localStorage. A confirmação nativa de saída existente cobre ensaios ativos, não cadastros isolados.

Consulte [decisões e limitações do cadastro](docs/cadastro-equipamentos.md).
