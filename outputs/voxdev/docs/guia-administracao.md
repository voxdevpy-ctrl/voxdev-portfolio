# Guia de administração

## Atualizar os contatos

1. Abra o site.
2. Vá até **Recados públicos**.
3. Clique em **Modo de administração**.
4. Digite a senha administrativa.
5. Vá até **Vamos conversar?**.
6. Preencha os canais desejados e clique em **Salvar contatos**.

Os botões vazios ficam identificados como **Canal em configuração**. Eles não abrem links até receberem um endereço válido.

## Excluir um comentário

1. Ative o modo de administração.
2. Localize o comentário.
3. Clique em **Excluir comentário**.
4. Confirme a exclusão.

## Publicar um projeto

1. Otimize a imagem em formato WebP sempre que possível.
2. Coloque o arquivo em `public/assets/projects/`.
3. Abra `public/js/site-config.js`.
4. Adicione o projeto no array `projects`, seguindo o exemplo comentado no arquivo.
5. Verifique o texto alternativo da imagem.

Publique somente projetos autorizados pelo cliente. Evite textos longos: a descrição deve ocupar no máximo quatro linhas.

## Segurança

- Não compartilhe a senha administrativa.
- Troque a senha se houver suspeita de exposição.
- Não armazene credenciais dentro de arquivos JavaScript públicos.
- Faça cópias de segurança periódicas de `server/data/`.
