# VoxDev

Site comercial da VoxDev para pequenos negócios locais de Blumenau e região. O projeto usa HTML5, CSS3, JavaScript puro e uma API Node.js sem dependências externas.

O repositório também inclui funções serverless para publicação na Vercel com Supabase Postgres. Consulte `docs/publicacao-github-vercel.md`.

## Início rápido

1. Copie `.env.example` para `.env` no ambiente de hospedagem.
2. Configure `ADMIN_PASSWORD` com uma senha longa e exclusiva.
3. Configure `SITE_URL` com o endereço público em HTTPS.
4. Execute `npm start`.
5. Acesse `http://localhost:3000`.

O Node.js não carrega arquivos `.env` automaticamente. Na hospedagem, cadastre as variáveis no painel da plataforma. Em desenvolvimento local, defina as variáveis no terminal antes de iniciar o servidor.

## Conteúdo editável

O conteúdo geral fica centralizado em `public/js/site-config.js`. Os contatos também podem ser alterados pelo modo de administração da página:

1. Acesse a seção de recados públicos.
2. Clique em **Modo de administração**.
3. Informe a senha definida em `ADMIN_PASSWORD`.
4. Edite os canais na seção **Vamos conversar?**.
5. Clique em **Salvar contatos**.

Os dados ficam em `server/data/contacts.json`. Comentários públicos ficam em `server/data/comments.json`.

Na Vercel, os dados ficam no Supabase Postgres. Os arquivos JSON são usados somente pelo servidor local.

Para adicionar um case, coloque a imagem otimizada em `public/assets/projects/` e inclua o item no array `projects` de `public/js/site-config.js`. Publique somente cases autorizados pelo cliente.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm start` | Inicia o servidor |
| `npm run dev` | Reinicia o servidor ao alterar arquivos |
| `npm run build` | Gera os arquivos estáticos em `dist/` para a Vercel |
| `npm test` | Executa os testes automatizados |
| `npm run check` | Verifica a sintaxe dos principais arquivos JavaScript |

## Estrutura

```text
voxdev/
├── api/
├── docs/
│   ├── checklist-producao.md
│   └── guia-administracao.md
├── public/
│   ├── assets/
│   │   ├── brand/
│   │   └── projects/
│   ├── css/
│   ├── js/
│   └── index.html
├── server/
│   ├── config/
│   ├── data/
│   ├── lib/
│   ├── repositories/
│   ├── services/
│   └── index.js
├── tests/
├── vercel/
├── vercel.json
├── .env.example
├── package.json
└── README.md
```

## SEO local

O HTML contém metadados, Open Graph, marcação semântica e dados estruturados para Blumenau, SC. O servidor gera `/robots.txt` e `/sitemap.xml` usando `SITE_URL`, o que evita publicar um domínio fictício.

## Persistência local

O repositório JSON atende a uma primeira publicação com volume baixo. A camada `JsonRepository` está isolada para facilitar a troca por PostgreSQL ou MySQL. Ao migrar, mantenha as validações no serviço e use consultas parametrizadas.

## Publicação na Vercel

Use Supabase Postgres para persistência. As rotas serverless em `api/` mantêm comentários e contatos entre deployments sem gravar no disco temporário da função. O passo a passo completo está em `docs/publicacao-github-vercel.md`.
