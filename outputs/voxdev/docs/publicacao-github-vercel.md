# Publicação no GitHub e na Vercel

Este projeto já está preparado para publicação pela Vercel. O frontend é enviado à CDN e as rotas em `api/` são executadas como funções serverless.

## 1. Preencher conteúdo real

1. Abra `public/js/site-config.js`.
2. Adicione somente projetos autorizados no array `projects`.
3. Coloque imagens otimizadas em `public/assets/projects/`.
4. Preencha os contatos depois da publicação pelo modo de administração ou diretamente no arquivo para a primeira versão.

## 2. Criar o repositório no GitHub

Execute na pasta `voxdev`:

```bash
git init
git add .
git commit -m "Publica portfólio VoxDev"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/voxdev.git
git push -u origin main
```

O arquivo `.gitignore` impede o envio de credenciais, dependências e arquivos gerados.

## 3. Criar o banco pelo painel da Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. No projeto, abra **Marketplace**.
3. Instale a integração **Supabase** e conecte um projeto.
4. No painel do Supabase, abra **SQL Editor**.
5. Execute o conteúdo de `docs/supabase-schema.sql`.
6. No Supabase, abra **Project Settings → API** e copie a URL do projeto e a chave `service_role`.

Nunca coloque a chave `service_role` no arquivo `public/js/site-config.js` ou em qualquer código enviado ao navegador.

## 4. Configurar variáveis privadas na Vercel

Em **Project Settings → Environment Variables**, cadastre:

| Variável | Valor |
| --- | --- |
| `SITE_URL` | Domínio público final, como `https://voxdev.com.br` |
| `ADMIN_PASSWORD` | Senha longa e exclusiva para excluir comentários e editar contatos |
| `RATE_LIMIT_SALT` | Outra frase longa e aleatória |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada `service_role` do Supabase |

Marque pelo menos o ambiente **Production**. Para testar tudo antes de publicar, marque também **Preview**.

Depois de alterar variáveis, faça um novo deploy. A Vercel aplica variáveis novas somente aos deployments seguintes.

## 5. Publicar

Na Vercel:

1. Confirme **Framework Preset: Other**.
2. Confirme **Build Command: `npm run build`**.
3. Confirme **Output Directory: `dist`**.
4. Clique em **Deploy**.

O arquivo `vercel.json` já define essas opções.

## 6. Validar após o deploy

Abra o endereço de Preview e teste:

- Página inicial e monitor em um celular real.
- `/robots.txt`.
- `/sitemap.xml`.
- Envio de comentário.
- Bloqueio de envio repetido.
- Modo de administração.
- Edição dos contatos.
- Exclusão de comentário.
- WhatsApp, Instagram e e-mail.

## 7. Conectar domínio

1. Em **Project Settings → Domains**, adicione o domínio.
2. Ajuste o DNS seguindo as instruções exibidas pela Vercel.
3. Atualize `SITE_URL` com o domínio final.
4. Faça um novo deploy.
5. Envie `/sitemap.xml` ao Google Search Console.

## Observação importante

O servidor em `server/` continua disponível para desenvolvimento local com arquivos JSON. Na Vercel, as funções em `api/` usam Supabase porque o disco local de uma função serverless não deve ser usado como banco de dados persistente.
