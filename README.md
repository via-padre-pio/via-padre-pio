# Via Padre Pio — site de pré-venda

Página de pré-venda de camisetas. O cliente escolhe modelo, cor e tamanho, preenche os
dados e o pedido chega pronto no WhatsApp de vocês.

Site estático (HTML, CSS e JavaScript puros), sem instalação e sem servidor.

---

## Antes de publicar: o que precisa ser preenchido

Tudo fica em **`js/config.js`**. É o único arquivo do dia a dia.

| O quê | Onde | Obrigatório |
|---|---|---|
| Número que recebe os pedidos | `contato.whatsapp` | **Sim** |
| Como o número aparece na tela | `contato.whatsappVisivel` | Sim |
| E-mail de contato | `contato.email` | Não |
| Usuário do Instagram | `contato.instagram` | Não |
| CNPJ (linha discreta no fim do rodapé) | `contato.cnpj` | Não |
| Arquivo do logo | `marca.logo` | Não |
| Cores da marca | `tema` | Não |
| Camisetas, preços e fotos | `produtos` | **Sim** |

O número do WhatsApp vai **só com dígitos**, no formato `55` + DDD + número:

```js
whatsapp: "5511912345678",   // para (11) 91234-5678
```

---

## Adicionar ou trocar uma camiseta

Em `js/config.js`, dentro de `produtos`, copie um bloco inteiro e cole abaixo:

```js
{
  id: "nova-estampa",                       // apelido único, sem espaço nem acento
  nome: "Camiseta Nova Estampa",
  descricao: "Frase curta sobre a arte.",
  preco: 89.9,                              // número puro, ponto nos centavos
  imagem: "assets/camisetas/nova.jpg",
  esgotado: false,                          // true marca como indisponível
},
```

A página aceita de 1 a 10 modelos (ou mais) e ajusta a grade sozinha.

**Fotos:** coloque os arquivos em `assets/camisetas/`. Use imagens quadradas
(1000×1000 px serve bem) e salve em `.jpg` para a página carregar rápido.

**Tamanhos e cores** valem para todos os modelos e ficam em `padrao`. Se um modelo
específico tiver opções diferentes, adicione `tamanhos` ou `cores` dentro dele.

---

## Ver o site no seu computador

Abra o arquivo `index.html` com dois cliques. É o suficiente para conferir mudanças.

Para um teste mais fiel ao que vai para o ar, rode um servidor local:

```powershell
python -m http.server 8000
```

E acesse `http://localhost:8000`.

---

## Publicar no GitHub Pages

Na primeira vez:

```powershell
git add .
git commit -m "Site de pré-venda"
git branch -M main
git remote add origin https://github.com/via-padre-pio/NOME-DO-REPOSITORIO.git
git push -u origin main
```

Depois, no GitHub: **Settings → Pages → Source: Deploy from a branch →
Branch: `main` / `/ (root)` → Save**. Em poucos minutos o site fica no ar em
`https://via-padre-pio.github.io/NOME-DO-REPOSITORIO/`.

> Para o endereço ficar `https://via-padre-pio.github.io` (sem nada depois da barra),
> o repositório precisa se chamar exatamente `via-padre-pio.github.io`.

Nas próximas atualizações:

```powershell
git add .
git commit -m "Novos modelos da pré-venda"
git push
```

---

## Estrutura dos arquivos

```
.
├── index.html              página única
├── css/estilo.css          aparência (as cores vêm do config)
├── js/config.js            ← tudo que vocês editam
├── js/app.js               catálogo, carrinho e envio pro WhatsApp
├── js/animacoes.js         só os movimentos da página (enfeite, veja abaixo)
└── assets/
    ├── logo.png            logo da marca (aparece na capa e no rodapé)
    ├── santos/             fotos de "Nossas Inspirações"
    └── camisetas/          fotos dos modelos
```

As cores atuais foram tiradas do próprio logo: creme `#f4ece3` no fundo e
marrom `#6b4a1e` nas letras e botões.

---

## Detalhes que valem saber

- **Nada é cobrado no site.** O pedido vira uma mensagem de WhatsApp; pagamento e
  entrega são combinados na conversa.
- **O pedido fica salvo no navegador do cliente.** Se ele fechar a aba e voltar, os
  itens continuam lá.
- **O catálogo é uma vitrine de fotos.** São quatro modelos por linha no notebook,
  três no tablet e dois no celular. O cartão mostra só foto, nome e preço; cor e
  tamanho aparecem ao tocar em "Escolher", um modelo por vez.
- **"Nossas Inspirações" fica no rodapé.** Os santos vêm de `inspiracoes.santos`,
  no `js/config.js`: nome, anos de vida, foto (dentro de `assets/santos/`) e a
  história em parágrafos. Clicando no nome, abre uma janela com a foto e o texto.
- **As animações são enfeite e nada mais.** Elas vivem em `js/animacoes.js` e usam a
  biblioteca Motion, carregada da internet (CDN) no fim do `index.html`. Se essa
  biblioteca não carregar, ou se o visitante pedir menos movimento nas configurações
  do celular, a página aparece parada — mas inteira, e o pedido funciona igual.
- **Preço alterado no config vale na hora**, inclusive para carrinhos já montados —
  ninguém fica com preço antigo.
- **Modelo removido ou marcado como esgotado** some automaticamente dos pedidos
  que estavam salvos.
