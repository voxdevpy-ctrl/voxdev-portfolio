# Checklist de produção

## Conteúdo

- [ ] Preencher os canais oficiais de Instagram, WhatsApp e e-mail.
- [ ] Adicionar apenas projetos autorizados pelos respectivos clientes.
- [ ] Revisar ortografia, textos alternativos e mensagens automáticas.
- [ ] Confirmar o domínio público definitivo.

## Segurança

- [ ] Definir `ADMIN_PASSWORD` fora do código-fonte.
- [ ] Publicar somente por HTTPS.
- [ ] Executar `docs/supabase-schema.sql` no SQL Editor do Supabase.
- [ ] Configurar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `RATE_LIMIT_SALT` na Vercel.
- [ ] Manter cópias de segurança dos dados persistidos.
- [ ] Configurar limites de requisição no proxy reverso ou na plataforma.
- [ ] Revisar logs sem armazenar dados pessoais desnecessários.

## SEO local

- [ ] Configurar `SITE_URL` com o domínio público.
- [ ] Cadastrar o domínio no Google Search Console.
- [ ] Enviar `/sitemap.xml` ao Search Console.
- [ ] Vincular o site ao Perfil da Empresa no Google.
- [ ] Validar Open Graph e dados estruturados após a publicação.

## Qualidade

- [ ] Executar `npm test`.
- [ ] Executar `npm run check`.
- [ ] Avaliar navegação por teclado.
- [ ] Conferir contraste e legibilidade em telas pequenas.
- [ ] Executar Lighthouse em dispositivo móvel.
- [ ] Testar envio, bloqueio antispam e exclusão de comentários.

## Operação

- [ ] Configurar monitoramento de disponibilidade.
- [ ] Configurar alerta de erro do servidor.
- [ ] Definir rotina de atualização do Node.js.
- [ ] Monitorar o uso do Supabase e revisar o plano quando o volume crescer.
