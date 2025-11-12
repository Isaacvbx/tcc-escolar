# SciShare — Plataforma de Colaboração entre Pesquisadores

[![Status](https://img.shields.io/badge/status-prot%C3%B3tipo-blue)](https://github.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Protótipo front-end para publicação colaborativa de projetos, chat em estilo mensageiro, perfis de pesquisadores e visualização de estatísticas. Feito com HTML/CSS/JS + Bootstrap e Chart.js. Dados persistem localmente via `localStorage`.

---

## 🔎 Visão geral

**SciShare** é um protótipo de plataforma web que facilita a colaboração entre pesquisadores por meio de:
- Publicação de **projetos abertos** (título, resumo, áreas, colaboradores);
- Convites e compartilhamento de resultados (simulados);
- **Chat** estilo WhatsApp/Instagram com reações e indicador de digitação;
- **Perfis** de usuários com avatar e áreas de interesse;
- Painel com **estatísticas** (gráficos) e reordenação de projetos (drag & drop).

O protótipo usa `localStorage` para persistência (prova de conceito). A intenção é demonstrar UX/fluxo e mecanismos de colaboração antes de implementar backend.

---

## 📌 Link do documento (Google Docs)

Documentação completa (para apresentação/relatório):  
https://docs.google.com/document/d/1Ul2-VwThaYYE9tjy2y2tReZ1-lEKP0YBBz-jgP4Zbus/edit?usp=sharing

---

## 🚀 Solução proposta

Uma interface leve, responsiva e modular que:
- Reduz atritos para colaboração em pequenos projetos;
- Fornece um local unificado para publicar projetos, convidar colaboradores e trocar mensagens;
- Facilita comunicação assíncrona e rápida iteração em pesquisas experimentais, históricas ou computacionais.

Principais funcionalidades:
- Publicar/editar projetos via modal;
- Buscar e filtrar projetos, salvar (bookmark) e curtir (like);
- Reordenar projetos por drag & drop (persistente);
- Chat com reações, indicador de digitação e notificações de não-lidas;
- Upload de avatar e perfil com áreas de interesse;
- Gráfico (Chart.js) com distribuição de projetos por área;
- Casos recentes — seção com referências científicas e links.

---

## 🧰 Tecnologias e ferramentas

**Front-end**
- HTML5, CSS3 (arquivo `style.css` com animações)
- JavaScript modular (arquivos: `common.js`, `script.js`, `projects.js`, `chat.js`, `profile.js`, `cases.js`, `login.js`)
- [Bootstrap 5] — layout, modais e componentes
- [Tailwind] (utilitário opcional carregado)
- [Chart.js] — gráficos
- Web Storage API (`localStorage`) — persistência local

**(Futuro) Back-end sugerido**
- Node.js + Express + Socket.io (chat em tempo real)
- Banco: PostgreSQL / MongoDB

---

## 🗂 Estrutura do repositório (sugerida)

/ (repo root)
├─ index.html
├─ login.html
├─ projects.html
├─ chat.html
├─ profile.html
├─ cases.html
├─ style.css
├─ common.js
├─ script.js
├─ projects.js
├─ chat.js
├─ profile.js
├─ cases.js
├─ login.js
└─ README.md

yaml
Copiar código

---

## ⚙️ Instalação e execução local

1. Clone o repositório:
```bash
Faça login (qualquer e-mail é aceito no protótipo), você será redirecionado para index.html.

Teste funcionalidades: publicar projeto, chat, editar perfil, gerar dados demo, etc.

🧩 Arquivos principais e responsabilidades
common.js: utilitários (load/save/escapeHtml/getUser) e lógica de login/logout.

script.js: lógica principal do index.html (render, estados globais, chart, handlers).

projects.js: renderização de projetos, busca, filtro, drag & drop, publish modal.

chat.js: chat bolha, envio, reações, typing indicator e unread badge.

profile.js: edição do perfil, upload de avatar (salvo em base64 no localStorage).

cases.js: seção de casos recentes (links/DOIs).

style.css: estilos, animações, toasts, chat e visual moderno.

login.html / login.js: fluxo de login prototipado.

🧪 Bases científicas e referências (usadas na seção "Casos recentes")
Tal Bruttmann — reanálise de fotografias do álbum de Auschwitz

Le Monde — Historian Tal Bruttmann's sharp eye on the Holocaust (exemplo de caso histórico).

Link no site e no Google Doc (ver seção Casos recentes).

Redescoberta da cidade bizantina "Tharais" (Jordânia)

Cobertura em Archaeology Magazine / Popular Mechanics; artigo acadêmico (Gephyra — Al-Rawahneh et al., 2025).

Domesticação da videira na Itália — análise de sementes

Ucchesu et al., PLOS ONE (2025). DOI: 10.1371/journal.pone.0321653 — versão em PMC disponível.

Observação: as referências acima estão vinculadas na seção “Casos recentes” do site e no documento do Google Docs.

🧑‍🤝‍🧑 Integrantes
Isaac Gabriel

Antônio Enzo

Raul Victor

Davi Ibiapina Passos

Cicero Willsson

🔒 Segurança, limitações e recomendações
Limitações atuais

Persistência via localStorage (dados somente no navegador local);

Autenticação simulada (sem senhas reais nem verificação);

Chat sem persistência multiusuário/tempo-real (simulações locais).

Recomendações para produção

Implementar backend (API REST) com autenticação (JWT/sessions);

Armazenar arquivos e imagens em blob storage (S3) ou DB;

Usar HTTPS, validação do lado servidor, sanitização e políticas de CORS;

Implementar controle de permissões por projeto (owner, collab, viewer).

🛠️ Próximos passos (roadmap)
🔷 Backend: Node.js + Express + autenticação.

🔷 Chat em tempo real: Socket.io (mensagens distribuídas entre clientes).

🔷 Integração com repositórios de dados: Zenodo, Figshare (DOI automáticos).

🔷 Exportação/importação de projetos (JSON/ZIP) e geração de citações (BibTeX).

🔷 Sistema de permissões e roles por projeto.

🔷 Indexação / busca avançada (Algolia / Elasticsearch).

📝 Como contribuir
Fork o repositório.

Crie uma branch com sua feature: git checkout -b feature/nome-da-feature.

Commit suas mudanças: git commit -m "Descrição".

Push: git push origin feature/nome-da-feature.

Abra um Pull Request descrevendo a alteração.

📄 Licença
Este projeto usa a licença MIT — veja o arquivo LICENSE para detalhes.

🙋 Contato
Projeto desenvolvido por Isaac Gabriel, Antônio Enzo, Raul Victor, Davi Ibiapina Passos e Cicero Willsson.
Para dúvidas ou colaborações, abra uma issue no GitHub ou envie e-mail (adicione aqui o e-mail do contato do projeto).

Leia também (documentação completa / relatório):
https://docs.google.com/document/d/1Ul2-VwThaYYE9tjy2y2tReZ1-lEKP0YBBz-jgP4Zbus/edit?usp=sharing


