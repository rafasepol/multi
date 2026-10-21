// Janela do vídeo da equipe: abre por cima da revista, com o player do YouTube.
//
// Abre pelo cartaz fincado na grama queimada (cartaz3d.js) e pelo botão "Vídeo" da
// contracapa (script.js). Fecha no ✕, com Esc ou clicando fora do vídeo; ao fechar, o player
// sai da página e o vídeo para. O link fica em dados.js (REVISTA.video.youtube); sem ele, a
// janela avisa que o vídeo vem em breve.

// id do vídeo a partir do link (youtu.be/ID, youtube.com/watch?v=ID, /shorts/ID, /embed/ID)
// ou do próprio id
export function idDoYoutube(link) {
  const m = (link ?? "").trim().match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})|^([\w-]{11})$/);
  return m ? m[1] ?? m[2] : null;
}

let janela = null; // a janela aberta
let antes = null;  // o que tinha o foco antes de abrir, para devolver ao fechar

export const videoAberto = () => !!janela;

function aoTeclar(e) {
  if (e.key === "Escape") fecharVideo();
}

export function abrirVideo(cfg) {
  if (janela) return;
  antes = document.activeElement;
  const id = idDoYoutube(cfg.youtube);

  janela = document.createElement("div");
  janela.className = "video";
  janela.setAttribute("role", "dialog");
  janela.setAttribute("aria-modal", "true");
  janela.setAttribute("aria-label", cfg.titulo);
  janela.innerHTML = `
    <div class="video__caixa">
      <div class="video__topo">
        <span class="video__titulo"></span>
        <button class="video__fechar" type="button" aria-label="Fechar o vídeo">&#10005;</button>
      </div>
      <div class="video__tela"></div>
    </div>`;
  janela.querySelector(".video__titulo").textContent = cfg.duracao ? `${cfg.titulo} · ${cfg.duracao}` : cfg.titulo;
  const tela = janela.querySelector(".video__tela");
  if (id) {
    // youtube-nocookie: o player não grava cookies antes de a pessoa dar play
    const player = document.createElement("iframe");
    player.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    player.title = cfg.titulo;
    player.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    tela.append(player);
  } else {
    console.warn("[vídeo] falta o link do YouTube em dados.js (video.youtube)");
    const aviso = document.createElement("p");
    aviso.className = "video__aviso";
    aviso.textContent = "Vídeo em breve.";
    tela.append(aviso);
  }

  // clique fora do vídeo fecha, mas só se começou fora: o toque que abriu a janela (no
  // cartaz, na cena) termina em cima dela e não pode fechá-la
  let comecouFora = false;
  janela.addEventListener("pointerdown", (e) => {
    comecouFora = e.target === janela;
  });
  janela.addEventListener("click", (e) => {
    if (comecouFora && e.target === janela) fecharVideo();
  });
  const fechar = janela.querySelector(".video__fechar");
  fechar.addEventListener("click", fecharVideo);
  document.addEventListener("keydown", aoTeclar);
  document.body.append(janela);
  // depois do clique que abriu a janela, que ainda mexeria no foco
  setTimeout(() => fechar.focus(), 0);
}

export function fecharVideo() {
  if (!janela) return;
  janela.remove();
  janela = null;
  document.removeEventListener("keydown", aoTeclar);
  antes?.focus?.();
}
