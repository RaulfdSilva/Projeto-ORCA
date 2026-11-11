# Entrega 03 — Cadastro híbrido e vínculo com ensaios

## Modelo e validação

Um equipamento possui UUID interno gerado via `crypto.randomUUID()` (HTTPS ou localhost), fabricante, família, modelo/identificação técnica e série/código opcional. O modelo não contém especificações hidráulicas, reguladores ou catálogo de variantes. Fabricante, família e modelo devem conter texto não vazio após remoção dos espaços externos; série ausente é representada por string vazia.

O modo assistido oferece Bosch Rexroth e famílias A10VSO/A4VSO; o operador informa o modelo completo. A validação do formulário confirma essa seleção. O modo manual aceita livremente outros fabricantes e famílias. O modo é um auxílio de entrada, não uma classificação técnica persistida. Ao editar um cadastro, o formulário abre no modo manual com todos os valores preenchidos; é possível selecionar novamente o assistido. Trocar para assistido substitui fabricante/família pelos valores oferecidos, mantendo modelo/série; a gravação só ocorre ao salvar.

Não há exclusão, unicidade de número de série ou deduplicação por fabricante/modelo: essas regras não foram solicitadas. IDs vazios ou duplicados e atualizações de IDs inexistentes são rejeitados. Edição nunca altera o ID.

## Organização e estado compartilhado

- `src/modules/equipamentos/model.ts`, `validation.ts` e `state.ts`: dados, validação e reducer do cadastro.
- `components/equipment-workspace.tsx`: formulário assistido/manual, consulta em cartões, edição e mensagens acessíveis.
- `src/state/application.ts`: composição dos reducers de equipamentos e ensaios. Antes de iniciar, verifica se `equipmentId` pertence aos equipamentos cadastrados na mesma versão do estado.
- `TestProvider` existente: permanece no layout raiz e passa a usar o reducer composto. Expõe contextos de equipamentos e ensaios e mantém rascunhos, mensagens, erros e edição aberta durante a navegação interna. Não foi criado outro mecanismo de armazenamento.

Essa composição garante que não exista um ensaio iniciado com referência ausente no estado da aplicação; a UI também exige seleção válida. O reducer de ensaios verifica ID não vazio e mantém suas validações existentes. A checagem de existência do equipamento pertence ao reducer composto, que é o ponto de entrada do provider. Nenhuma ação permite excluir equipamentos ou trocar `equipmentId` de um ensaio iniciado. O bloqueio de finalização permanece na interface e no reducer.

A identificação apresentada no resumo é consultada pelo ID no cadastro atual. Editar os dados cadastrais atualiza a identificação exibida, mas nunca o vínculo, inclusive após finalização. Não há snapshot histórico dos dados do equipamento: esta entrega não é um arquivo de ensaios auditável.

## Interface e uso

Cadastre pelo menos um equipamento em `/equipamentos`. Consulte os cartões e use Editar para atualizar dados sem trocar o ID. Salve ou cancele o formulário antes de editar outro equipamento, evitando descarte silencioso do rascunho.

Em `/ensaios`, selecione explicitamente um equipamento e inicie. Sem cadastro, a interface orienta a criação e não permite início. Equipamento é escolhido somente no início, sem troca posterior, mesmo em ensaio ativo. Depois, o fluxo multiponto permanece: todos os campos de medição opcionais, `null` distinto de zero, pontos sem medições e ensaio vazio permitidos, avisos informativos e finalização sem diagnóstico.

Formulários usam rótulos, indicação de obrigatoriedade, erros associados aos campos e foco no primeiro erro. A listagem usa cartões em uma coluna no mobile e duas no desktop, com quebra de textos e IDs. Nenhuma dependência adicional foi introduzida.

## Limitações

- Dados e rascunhos somente em memória do layout compartilhado. Recarregar, fechar ou sair da aplicação elimina tudo; não há persistência, API, autenticação ou sincronização entre abas.
- A proteção nativa `beforeunload` já existente continua ativa enquanto houver ensaio não finalizado, mesmo fora de `/ensaios`. Não protege cadastros isolados. A confirmação depende do navegador.
- Continua existindo um ensaio por instância da aplicação, sem histórico e sem exclusão física de equipamentos.
- Não há diagnóstico, regras hidráulicas, parâmetros de fabricante inferidos, IA ou relatórios.
- Testes DOM usam jsdom e reproduzem desmontagem/remontagem de páginas mantendo o provider. Não substituem navegação no Next.js em navegador real nem validação visual desktop/mobile, que permanece pendente pelas limitações anteriormente identificadas. Chromium não foi executado novamente.

## Verificação

Os testes anteriores de medições e navegação mantêm seus cenários e asserções, agora com um equipamento válido na preparação, para refletir o requisito novo de vínculo obrigatório. Novos testes cobrem cadastro assistido/manual, obrigatoriedade, edição, integridade referencial, bloqueio de início sem equipamento, navegação e finalização. Execute `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `git diff --check`.
