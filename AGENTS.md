# Noble Art

Site institucional estático. O código editável e os arquivos publicados ficam em `dist/`.

## Trabalhar no projeto

- Use este repositório como fonte das próximas alterações e confira a versão atual antes de editar.
- Inicie localmente com `npm start`; o endereço é `http://localhost:5173`.
- Não há dependências de instalação. `npm run build` verifica os arquivos e a sintaxe; não recria `dist/`.
- Execute `npm test` e `npm run build` antes de concluir mudanças no código ou na configuração de publicação.
- Quando a publicação contínua estiver conectada na Netlify, atualizações em `main` publicam automaticamente. Informe o commit e o resultado do deploy quando verificado.

## Requisitos do site

- Preserve a sala 360° e seus recursos: `room-explorer.mjs`, `room-explorer.css`, `panorama-viewer.mjs`, `panorama-math.mjs` e `assets/sala-360-ia.webp`, salvo solicitação expressa de mudança.
- A sala 360° é uma recriação ilustrativa por IA, com giro a partir de um ponto; mantenha essa identificação na interface.
- Preserve o indicador minimalista de rolagem e os botões fixos de WhatsApp e Instagram, salvo solicitação de mudança.
- O WhatsApp confirmado é `5547991102938`. Ao alterá-lo, mantenha `config.whatsapp` em `dist/app.js` e `#whatsapp-contact` no HTML consistentes.
- Mantenha o carregamento da panorâmica sob demanda, a foto original como alternativa, os controles de teclado e o respeito a movimento reduzido.
- Não adicione bibliotecas, serviços externos ou mudanças visuais sem necessidade da tarefa.
- Mantenha `.netlify/`, credenciais e arquivos de ambiente fora do Git. O site atual não precisa de chaves de API para publicar.

## Publicação

- Repositório: `kaiquepro602-cell/Noble-art-moveis-sob-medida`.
- Site existente: `https://noble-art-moveis.netlify.app/`.
- Branch de produção planejada: `main`.
- Comando na Netlify: `npm test && npm run build`.
- Diretório publicado: `dist`.
- `VERSAO-PUBLICADA.json` documenta o snapshot importado em 18/10/2026; após novas alterações, não o apresente como prova de igualdade com a produção atual.
