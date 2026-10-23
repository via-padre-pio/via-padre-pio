/* ==========================================================================
   Via Padre Pio — animações
   --------------------------------------------------------------------------
   Camada puramente visual, construída sobre a biblioteca Motion.
   Nada aqui é necessário para montar o pedido: se a Motion não carregar, se o
   navegador for antigo ou se a pessoa pedir menos movimento no sistema, a
   página continua completa e o pedido segue funcionando igual.

   Para editar produtos, cores ou contato, use js/config.js.
   ========================================================================== */

(function () {
  "use strict";

  const M = window.Motion;

  const querMenosMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!M || querMenosMovimento) return;

  const { animate, scroll, inView, stagger, motionValue, springValue, press } = M;

  const umPouco = (min, max) => min + Math.random() * (max - min);

  /* Cores da marca, lidas do tema já aplicado pelo app.js. */
  function corDoTema(nome, reserva) {
    const valor = getComputedStyle(document.documentElement)
      .getPropertyValue(nome)
      .trim();
    return valor || reserva;
  }

  /* ====================================================================
     1. Logo da capa: nuvem de partículas douradas
     --------------------------------------------------------------------
     As partículas orbitam o logo o tempo todo. O ponteiro (ou o dedo)
     controla a velocidade na horizontal e a inclinação da órbita na
     vertical; segurar pressionado recolhe a nuvem para perto do logo.
     ==================================================================== */

  function nuvemDoLogo() {
    const palco = document.getElementById("capaPalco");
    if (!palco) return;

    const tela = document.createElement("canvas");
    tela.className = "capa__particulas";
    tela.setAttribute("aria-hidden", "true");
    palco.insertBefore(tela, palco.firstChild);

    const pincel = tela.getContext("2d");
    if (!pincel) return;

    const ouro = corDoTema("--destaque", "#a9792f");
    const marrom = corDoTema("--marca", "#6b4a1e");

    // Valores que o ponteiro controla. A mola evita que o movimento do
    // mouse chegue cru na animação e faça a nuvem pular.
    const alvoVelocidade = motionValue(1);
    const velocidade = springValue(alvoVelocidade, { stiffness: 80, damping: 20 });
    const alvoInclinacao = motionValue(0.9);
    const inclinacao = springValue(alvoInclinacao, { stiffness: 80, damping: 20 });
    const alvoAbertura = motionValue(1);
    const abertura = springValue(alvoAbertura, { stiffness: 140, damping: 22 });
    const alvoBrilho = motionValue(0.55);
    const brilho = springValue(alvoBrilho, { stiffness: 90, damping: 24 });

    const TOTAL = 140;
    const particulas = Array.from({ length: TOTAL }, () => ({
      angulo: umPouco(0, Math.PI * 2),
      raio: umPouco(0.78, 1.04),
      profundidade: umPouco(-1, 1),
      giro: umPouco(0.1, 0.42),
      tamanho: umPouco(0.6, 2.4),
      opacidade: umPouco(0.25, 1),
      dourada: Math.random() > 0.35,
    }));

    let largura = 0;
    let altura = 0;
    let decorrido = 0;
    let anterior = 0;

    function medir() {
      const area = palco.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = area.width;
      altura = area.height;
      tela.width = Math.round(largura * dpr);
      tela.height = Math.round(altura * dpr);
      pincel.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    medir();
    window.addEventListener("resize", medir);

    function desenhar(agora) {
      requestAnimationFrame(desenhar);
      if (!largura || !altura) return;

      const passo = anterior ? Math.min(agora - anterior, 40) : 16;
      anterior = agora;
      decorrido += (passo / 1000) * velocidade.get();

      const inc = inclinacao.get();
      const abre = abertura.get();
      const luz = brilho.get();
      const meioX = largura / 2;
      const meioY = altura / 2;
      const escala = Math.min(largura, altura) / 2;

      pincel.clearRect(0, 0, largura, altura);

      for (const p of particulas) {
        const fase = p.angulo + decorrido * p.giro;
        const raio = p.raio * abre;

        // Cilindro achatado pela inclinação: dá a sensação de volume sem 3D.
        const x = Math.cos(fase) * raio;
        const planoY = Math.sin(fase) * raio;
        const z = p.profundidade * 0.22 * abre;
        const y = planoY * Math.cos(inc) + z * Math.sin(inc);
        const fundo = -planoY * Math.sin(inc) + z * Math.cos(inc);

        const perto = Math.min(Math.max(0.5 + fundo * 0.7, 0), 1);
        const perspectiva = 1 / (1 - fundo * 0.42);

        const px = meioX + x * escala * perspectiva;
        const py = meioY + y * escala * perspectiva;
        const tamanho = p.tamanho * (0.55 + perto * 1.3);
        const alfa = p.opacidade * (0.3 + perto * 0.7) * luz;

        pincel.globalAlpha = Math.min(alfa, 1);
        pincel.fillStyle = p.dourada ? ouro : marrom;
        pincel.beginPath();
        pincel.arc(px, py, tamanho, 0, Math.PI * 2);
        pincel.fill();
      }

      pincel.globalAlpha = 1;
    }

    requestAnimationFrame(desenhar);

    // A nuvem acende devagar quando a capa aparece, em vez de já nascer forte.
    inView(palco, () => {
      alvoBrilho.set(0.85);
      return () => alvoBrilho.set(0.5);
    });

    palco.addEventListener("pointermove", (evento) => {
      const area = palco.getBoundingClientRect();
      const progressoX = (evento.clientX - area.left) / area.width;
      const progressoY = (evento.clientY - area.top) / area.height;
      alvoVelocidade.set(0.3 + progressoX * 2.6);
      alvoInclinacao.set(0.4 + progressoY * 1);
      alvoBrilho.set(1);
    });

    palco.addEventListener("pointerleave", () => {
      alvoVelocidade.set(1);
      alvoInclinacao.set(0.9);
      alvoBrilho.set(0.85);
    });

    // No celular não existe hover: o toque é que recolhe a nuvem.
    press(palco, () => {
      alvoAbertura.set(0.3);
      alvoBrilho.set(1);
      return () => {
        alvoAbertura.set(1);
        alvoBrilho.set(0.85);
      };
    });
  }

  /* ====================================================================
     2. Scroll: fotos revelam como uma cortina
     --------------------------------------------------------------------
     Cada foto abre do centro para as bordas conforme entra na tela, com
     um leve avanço da imagem por dentro do recorte.
     ==================================================================== */

  function revelarNoScroll() {
    document.querySelectorAll(".produto__figura").forEach((figura) => {
      const foto = figura.querySelector("img");
      if (!foto) return;

      figura.style.clipPath = "inset(0 50% 0 50%)";
      foto.style.transform = "scale(1.18)";

      scroll(
        (progresso) => {
          const abertura = 50 - progresso * 50;
          figura.style.clipPath = `inset(0 ${abertura}% 0 ${abertura}%)`;
          foto.style.transform = `scale(${1.18 - progresso * 0.18})`;
        },
        { target: figura, offset: ["start 92%", "center 62%"] }
      );
    });
  }

  /* ====================================================================
     3. Dúvidas frequentes: accordion com altura animada
     --------------------------------------------------------------------
     O <details> continua sendo um <details>: sem JavaScript ele abre e
     fecha sozinho. Aqui só assumimos o controle para animar a altura,
     que é o que o CSS sozinho não faz.
     ==================================================================== */

  function accordionDuvidas() {
    document.querySelectorAll(".duvida").forEach((duvida) => {
      const resumo = duvida.querySelector("summary");
      const painel = duvida.querySelector(".duvida__painel");
      const seta = duvida.querySelector(".duvida__seta");
      if (!resumo || !painel) return;

      // Avisa o CSS para soltar o giro da seta, que passa a ser nosso.
      duvida.classList.add("duvida--animada");

      let animando = null;

      const girarSeta = (aberto) =>
        seta &&
        animate(seta, { rotate: aberto ? 180 : 0 }, { type: "spring", stiffness: 260, damping: 24 });

      resumo.addEventListener("click", (evento) => {
        evento.preventDefault();
        if (animando) animando.stop();

        const abrindo = !duvida.open;
        painel.style.overflow = "hidden";

        if (abrindo) {
          duvida.open = true;
          const alvo = painel.scrollHeight;
          girarSeta(true);
          animando = animate(
            painel,
            { height: [0, alvo], opacity: [0, 1], filter: ["blur(4px)", "blur(0px)"] },
            { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
          );
          animando.then(() => {
            painel.style.height = "auto";
            painel.style.overflow = "";
          });
        } else {
          girarSeta(false);
          animando = animate(
            painel,
            { height: [painel.scrollHeight, 0], opacity: [1, 0], filter: ["blur(0px)", "blur(4px)"] },
            { duration: 0.3, ease: [0.4, 0, 1, 1] }
          );
          animando.then(() => {
            duvida.open = false;
            painel.style.height = "";
            painel.style.opacity = "";
            painel.style.filter = "";
            painel.style.overflow = "";
          });
        }
      });
    });
  }

  /* ====================================================================
     4. Confete ao enviar o pedido
     --------------------------------------------------------------------
     Só dispara quando o pedido realmente saiu para o WhatsApp — o app.js
     avisa pelo evento "via:pedido-enviado". Se a validação barrou, não há
     nada a comemorar.
     ==================================================================== */

  function confeteNoEnvio() {
    const botao = document.getElementById("botaoEnviar");
    if (!botao) return;

    const cores = [
      corDoTema("--destaque", "#a9792f"),
      corDoTema("--marca", "#6b4a1e"),
      corDoTema("--marca-escura", "#48300f"),
      corDoTema("--fundo", "#f4ece3"),
      "#fffdf9",
    ];

    const tela = document.createElement("canvas");
    tela.className = "confete";
    tela.setAttribute("aria-hidden", "true");
    document.body.appendChild(tela);
    const pincel = tela.getContext("2d");
    if (!pincel) return;

    let papeis = [];
    let rodando = false;
    let anterior = 0;

    function dimensionar() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tela.width = Math.round(window.innerWidth * dpr);
      tela.height = Math.round(window.innerHeight * dpr);
      pincel.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function quadro(agora) {
      const passo = anterior ? Math.min((agora - anterior) / 1000, 0.05) : 0.016;
      anterior = agora;

      pincel.clearRect(0, 0, window.innerWidth, window.innerHeight);

      papeis = papeis.filter((p) => {
        p.vy += 1180 * passo;          // gravidade
        p.vx *= 1 - 1.1 * passo;       // resistência do ar
        p.vy *= 1 - 0.3 * passo;
        p.x += p.vx * passo;
        p.y += p.vy * passo;
        p.giro += p.velocidadeGiro * passo;
        p.vida -= passo;

        if (p.vida <= 0 || p.y > window.innerHeight + 40) return false;

        pincel.save();
        pincel.translate(p.x, p.y);
        pincel.rotate(p.giro);
        // O achatamento horizontal simula o papel girando no eixo.
        pincel.scale(Math.cos(p.giro * 1.6), 1);
        pincel.globalAlpha = Math.min(p.vida / 0.6, 1);
        pincel.fillStyle = p.cor;
        pincel.fillRect(-p.largura / 2, -p.altura / 2, p.largura, p.altura);
        pincel.restore();

        return true;
      });

      if (papeis.length) {
        requestAnimationFrame(quadro);
      } else {
        rodando = false;
        tela.classList.remove("confete--ativo");
      }
    }

    function soltar() {
      const area = botao.getBoundingClientRect();
      const origemX = area.left + area.width / 2;
      const origemY = area.top + area.height / 2;

      for (let i = 0; i < 110; i++) {
        const angulo = umPouco(-Math.PI * 0.92, -Math.PI * 0.08);
        const forca = umPouco(420, 1000);
        papeis.push({
          x: origemX + umPouco(-area.width / 3, area.width / 3),
          y: origemY,
          vx: Math.cos(angulo) * forca,
          vy: Math.sin(angulo) * forca,
          giro: umPouco(0, Math.PI * 2),
          velocidadeGiro: umPouco(-9, 9),
          largura: umPouco(5, 11),
          altura: umPouco(7, 15),
          cor: cores[Math.floor(Math.random() * cores.length)],
          vida: umPouco(1.3, 2.4),
        });
      }

      dimensionar();
      tela.classList.add("confete--ativo");

      if (!rodando) {
        rodando = true;
        anterior = 0;
        requestAnimationFrame(quadro);
      }
    }

    window.addEventListener("resize", () => rodando && dimensionar());

    document.addEventListener("via:pedido-enviado", () => {
      soltar();
      animate(
        botao,
        { scale: [1, 0.94, 1] },
        { duration: 0.5, type: "spring", stiffness: 380, damping: 14 }
      );
    });
  }

  /* ====================================================================
     5. Marca do cabeçalho: texto embaralhado no hover
     ==================================================================== */

  function embaralharMarca() {
    const bloco = document.querySelector(".marca__texto");
    const gatilho = document.querySelector(".marca");
    if (!bloco || !gatilho) return;

    const GLIFOS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·+*#%&";
    const alvos = [...bloco.children];
    let emCurso = false;

    function embaralhar(elemento, atraso) {
      const texto = elemento.dataset.textoFinal || elemento.textContent;
      if (!texto) return Promise.resolve();

      elemento.dataset.textoFinal = texto;

      const relogio = { progresso: 0 };
      return animate(relogio, { progresso: 1 }, {
        duration: 0.6,
        delay: atraso,
        ease: "easeOut",
        onUpdate: () => {
          const revelados = Math.floor(relogio.progresso * texto.length);
          let saida = "";
          for (let i = 0; i < texto.length; i++) {
            const letra = texto[i];
            if (i < revelados || letra === " ") {
              saida += letra;
            } else {
              saida += GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
            }
          }
          elemento.textContent = saida;
        },
      }).then(() => {
        elemento.textContent = texto;
      });
    }

    function rodar() {
      if (emCurso) return;
      emCurso = true;
      Promise.all(alvos.map((alvo, i) => embaralhar(alvo, i * 0.08))).then(() => {
        emCurso = false;
      });
    }

    gatilho.addEventListener("pointerenter", rodar);
    gatilho.addEventListener("focus", rodar);
  }

  /* ====================================================================
     6. Catálogo: as peças são redistribuídas ao trocar de visualização
     --------------------------------------------------------------------
     Trocar de grade para lista muda completamente a forma dos cartões, e
     uma transição de posição ficaria torta. Em vez disso eles saem e
     voltam em cascata, como quem espalha as peças de novo sobre a mesa.
     ==================================================================== */

  function cartasDoCatalogo() {
    const alternar = document.getElementById("alternarVisao");
    const grade = document.getElementById("gradeProdutos");
    if (!alternar || !grade) return;

    // Fase de captura: precisamos ler qual botão estava ativo antes de o
    // app.js responder ao mesmo clique e marcar o novo.
    alternar.addEventListener(
      "click",
      (evento) => {
        const botao = evento.target.closest("[data-visao]");
        if (!botao || botao.getAttribute("aria-pressed") === "true") return;

        const cartoes = [...grade.children];
        if (!cartoes.length) return;

        // O app.js troca a classe ainda dentro deste clique, antes de pintar.
        // Esperamos o quadro seguinte para animar os cartões já na forma nova.
        requestAnimationFrame(() => {
          animate(
            cartoes,
            { opacity: [0, 1], y: [24, 0], scale: [0.96, 1] },
            { duration: 0.45, delay: stagger(0.06), ease: [0.22, 1, 0.36, 1] }
          );
        });
      },
      true
    );

    // A contagem conta de zero até o total quando entra na tela.
    const contagem = document.getElementById("contagemProdutos");
    if (!contagem) return;

    inView(
      contagem,
      () => {
        const texto = contagem.textContent;
        const total = parseInt(texto, 10);
        if (!total) return;

        const resto = texto.replace(/^\d+\s*/, "");
        const relogio = { valor: 0 };
        animate(relogio, { valor: total }, {
          duration: 0.7,
          ease: "easeOut",
          onUpdate: () => {
            contagem.textContent = `${Math.round(relogio.valor)} ${resto}`;
          },
        });
      },
      { amount: 1 }
    );
  }

  /* ====================================================================
     7. Como funciona: um anel dourado se fecha em volta de cada número
     ==================================================================== */

  function anelDosPassos() {
    const passos = document.querySelectorAll(".passo");
    if (!passos.length) return;

    passos.forEach((passo, indice) => {
      const numero = passo.querySelector(".passo__numero");
      if (!numero) return;

      const anel = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      anel.setAttribute("class", "passo__anel");
      anel.setAttribute("viewBox", "0 0 100 100");
      anel.setAttribute("aria-hidden", "true");

      const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circulo.setAttribute("cx", "50");
      circulo.setAttribute("cy", "50");
      circulo.setAttribute("r", "46");
      anel.appendChild(circulo);
      numero.appendChild(anel);

      passo.style.opacity = "0";

      inView(
        passo,
        () => {
          const atraso = indice * 0.14;

          try {
            animate(
              passo,
              { opacity: [0, 1], y: [26, 0] },
              { duration: 0.5, delay: atraso, ease: [0.22, 1, 0.36, 1] }
            );

            animate(
              numero,
              { scale: [0.6, 1] },
              { delay: atraso + 0.1, type: "spring", stiffness: 300, damping: 14 }
            );

            animate(
              circulo,
              { pathLength: [0, 1], opacity: [0, 1] },
              { duration: 0.9, delay: atraso + 0.12, ease: "easeInOut" }
            );
          } catch (erro) {
            // O passo foi escondido logo acima à espera da animação. Se ela
            // falhar, o texto precisa voltar: conteúdo vem antes do enfeite.
            passo.style.opacity = "";
          }
        },
        { amount: 0.4 }
      );
    });
  }

  /* ====================================================================
     8. Rodapé: o nome da marca sobe letra por letra
     ==================================================================== */

  function rodapeVivo() {
    const rodape = document.querySelector(".rodape");
    const nome = document.getElementById("rodapeNome");
    if (!rodape) return;

    // Um fio dourado abre do centro para as pontas quando o rodapé chega.
    const fio = document.createElement("span");
    fio.className = "rodape__fio";
    fio.setAttribute("aria-hidden", "true");
    // Começa fechado para não piscar inteiro antes de a animação assumir.
    fio.style.transform = "scaleX(0)";
    rodape.prepend(fio);

    if (nome) {
      const texto = nome.textContent;
      nome.textContent = "";
      nome.setAttribute("aria-label", texto);

      [...texto].forEach((letra) => {
        const span = document.createElement("span");
        span.className = "rodape__letra";
        span.textContent = letra === " " ? "\u00a0" : letra;
        span.setAttribute("aria-hidden", "true");
        nome.appendChild(span);
      });
    }

    const contatos = [...document.querySelectorAll(".rodape__contatos a")];

    inView(
      rodape,
      () => {
        animate(fio, { scaleX: [0, 1] }, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });

        if (nome) {
          animate(
            [...nome.children],
            { opacity: [0, 1], y: [18, 0] },
            { duration: 0.5, delay: stagger(0.035), ease: [0.22, 1, 0.36, 1] }
          );
        }

        if (contatos.length) {
          animate(
            contatos,
            { opacity: [0, 1], x: [-12, 0] },
            { duration: 0.45, delay: stagger(0.07, { startDelay: 0.25 }), ease: "easeOut" }
          );
        }
      },
      { amount: 0.3 }
    );
  }

  /* ====================================================================
     Início
     ==================================================================== */

  function iniciar() {
    // Um efeito que falhe não pode levar os outros junto.
    [
      nuvemDoLogo,
      revelarNoScroll,
      accordionDuvidas,
      confeteNoEnvio,
      embaralharMarca,
      cartasDoCatalogo,
      anelDosPassos,
      rodapeVivo,
    ].forEach((efeito) => {
      try {
        efeito();
      } catch (erro) {
        console.warn("Via Padre Pio: animação ignorada —", erro);
      }
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", iniciar)
    : iniciar();
})();
