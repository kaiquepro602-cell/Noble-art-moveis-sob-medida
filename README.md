# Noble Art — versão publicada com sala 360°

Projeto recuperado e conferido com https://noble-art-moveis.netlify.app/ em 18/10/2026.
Os arquivos em `dist/` são idênticos aos publicados no deploy `6ad2cf7f0c831c66db6ed866`.
O relatório `VERSAO-PUBLICADA.json` registra tamanho e SHA-256 de cada arquivo conferido.

## Abrir no VS Code

1. Extraia o ZIP inteiro.
2. No VS Code, use **Arquivo > Abrir Pasta** e selecione a pasta que contém este README e `package.json`.
3. Abra **Terminal > Novo Terminal** e execute:

```bash
npm start
```

4. Acesse http://localhost:5173.
5. Em **Ambientes**, clique em **Entrar na sala 360°**.

Requer Node.js 18 ou superior. Não precisa executar `npm install`: o projeto não tem dependências de instalação.
Se a porta estiver ocupada, encerre o servidor antigo com Ctrl+C ou execute `npm start -- 5174`.
Para o visualizador funcionar corretamente, use o endereço do servidor, em vez de abrir o HTML por duplo clique.

## O que esta versão inclui

- Sala com perspectiva 360°, arraste, zoom, detalhes e tela ampliada.
- Imagem panorâmica da sala incluída em `dist/assets/sala-360-ia.webp`.
- Renderizador WebGL com foto original disponível como alternativa.
- Banheiro e bancada com exploração das fotografias, zoom e pontos de detalhe.
- Luvinha indicando a rolagem, interrompida no primeiro gesto.
- Botão fixo do WhatsApp para `(47) 99110-2938`.
- Imagens, fontes e bibliotecas carregadas de arquivos locais.

A sala 360° é uma recriação ilustrativa por IA a partir da referência, identificada na interface.
Permite olhar ao redor de um ponto; não é um modelo 3D navegável nem uma captura real completa do imóvel.

## Editar os arquivos

O próprio diretório `dist/` contém o código editável do site. Não existe uma pasta `src/` separada.

| Arquivo | Conteúdo |
| --- | --- |
| `dist/index.html` | Textos, seções, links e diálogos |
| `dist/style.css` | Cores, fontes, espaçamentos e responsividade |
| `dist/app.js` | Configuração de contatos, menu, galerias, materiais e animações |
| `dist/scroll-glove.css` e `.js` | Luvinha de indicação de rolagem |
| `dist/room-explorer.mjs` e `.css` | Controles e detalhes dos ambientes |
| `dist/panorama-viewer.mjs` | Visualizador WebGL da sala |
| `dist/panorama-math.mjs` | Câmera e projeção dos detalhes |
| `dist/assets/` | Fotos, panorâmicas, fontes, logo e bibliotecas |

Para trocar a panorâmica, use uma imagem equiretangular 2:1 em `dist/assets/sala-360-ia.webp`.
A foto original permanece em `dist/assets/sala.webp`.
Para alterar o WhatsApp, atualize tanto `config.whatsapp` em `dist/app.js` quanto o link `#whatsapp-contact` no HTML.

## Verificar

```bash
npm run build
npm test
```

O build verifica a sintaxe e os arquivos essenciais. Não transpila nem recria `dist/`.
Os testes conferem rotação, câmera e projeção dos detalhes.

## GitHub e continuidade

Repositório: https://github.com/kaiquepro602-cell/Noble-art-moveis-sob-medida

Para trabalhar com sincronização Git no VS Code, prefira clonar o repositório em uma pasta nova:

```bash
git clone https://github.com/kaiquepro602-cell/Noble-art-moveis-sob-medida.git
cd Noble-art-moveis-sob-medida
npm start
```

O ZIP contém a mesma versão dos arquivos, sem a pasta interna `.git`.
Antes de buscar alterações com `git pull`, salve suas mudanças em um commit.
As próximas alterações devem partir deste repositório e preservar a sala 360°.

## Netlify

Site existente: https://noble-art-moveis.netlify.app/

Configuração para conectar o repositório no projeto existente:

- Branch de produção: `main`.
- Comando de build: `npm run build`.
- Diretório publicado: `dist`.

O arquivo `netlify.toml` já define `dist` como diretório publicado.
A importação para o GitHub não estabelece, por si só, a publicação automática na Netlify.
A pasta `.netlify/` é ignorada pelo Git.

## Licenças

Fotos e identidade fornecidas pelo solicitante. Panorâmica da sala gerada por IA.
GSAP e ScrollTrigger 3.13.0 têm seus cabeçalhos preservados e seguem https://gsap.com/community/standard-license/.
Fontes Cormorant Garamond e Manrope usam SIL Open Font License; os textos estão em `licenses/`.
