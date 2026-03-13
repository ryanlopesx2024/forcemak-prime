// ============================================================
// JavaScript Principal - Forcemak Prime
// Animações GSAP, AOS, interações e carregamento de conteúdo
// ============================================================

// ─── Inicialização após carregamento ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  iniciarNavegacao();
  iniciarAnimacoesHero();
  iniciarAOS();
  iniciarContadores();
  carregarServicos();
  iniciarTransicoesDePagina();
  marcarLinkAtivo();
  // Dois painéis (home)
  if (document.getElementById('painel-equip')) {
    iniciarCarrosseis();
    carregarVideosEspeciais();
  }
});


// ════════════════════════════════════════════════════════════
// NAVEGAÇÃO
// ════════════════════════════════════════════════════════════

function iniciarNavegacao() {
  const nav         = document.getElementById('nav');
  const hamburguer  = document.getElementById('nav-hamburguer');
  const menu        = document.getElementById('nav-menu');

  if (!nav) return;

  // Muda aparência ao rolar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('rolando');
    } else {
      nav.classList.remove('rolando');
    }
  }, { passive: true });

  // Menu mobile
  if (hamburguer && menu) {
    hamburguer.addEventListener('click', () => {
      hamburguer.classList.toggle('aberto');
      menu.classList.toggle('aberto');
      document.body.style.overflow = menu.classList.contains('aberto') ? 'hidden' : '';
    });

    // Fecha ao clicar em um link
    menu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburguer.classList.remove('aberto');
        menu.classList.remove('aberto');
        document.body.style.overflow = '';
      });
    });
  }
}

function marcarLinkAtivo() {
  const paginaAtual = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    link.classList.remove('ativo');
    const href = link.getAttribute('href');
    if (
      href === paginaAtual ||
      (paginaAtual === '/' && href === '/') ||
      (paginaAtual.includes(href) && href !== '/')
    ) {
      link.classList.add('ativo');
    }
  });
}


// ════════════════════════════════════════════════════════════
// ANIMAÇÕES DO HERO (GSAP)
// ════════════════════════════════════════════════════════════

function iniciarAnimacoesHero() {
  if (typeof gsap === 'undefined') return;
  if (!document.querySelector('.hero')) return;

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({ delay: 0.3 });

  // Animação sequencial dos elementos do hero
  tl.to('#hero-badge', {
    opacity:   1,
    y:         0,
    duration:  0.6,
    ease:      'power3.out',
    from:      { y: 30 }
  })
  .to('#hero-titulo', {
    opacity:   1,
    y:         0,
    duration:  0.8,
    ease:      'power3.out',
    from:      { y: 40 }
  }, '-=0.3')
  .to('#hero-subtitulo', {
    opacity:   1,
    y:         0,
    duration:  0.7,
    ease:      'power3.out',
    from:      { y: 30 }
  }, '-=0.4')
  .to('#hero-botoes', {
    opacity:   1,
    y:         0,
    duration:  0.6,
    ease:      'power3.out',
    from:      { y: 20 }
  }, '-=0.3')
  .to('#hero-imagem', {
    opacity:   1,
    x:         0,
    duration:  0.9,
    ease:      'power3.out',
    from:      { x: 60 }
  }, '-=0.6');

  // Animação parallax no scroll
  gsap.to('.hero__fundo', {
    scrollTrigger: {
      trigger: '.hero',
      start:   'top top',
      end:     'bottom top',
      scrub:   true
    },
    y: 120,
    ease: 'none'
  });
}


// ════════════════════════════════════════════════════════════
// AOS - ANIMAÇÕES DE SCROLL
// ════════════════════════════════════════════════════════════

function iniciarAOS() {
  if (typeof AOS === 'undefined') return;

  AOS.init({
    duration:   700,
    easing:     'ease-out-cubic',
    once:       true,
    offset:     80,
    delay:      0
  });
}


// ════════════════════════════════════════════════════════════
// CONTADORES ANIMADOS
// ════════════════════════════════════════════════════════════

function iniciarContadores() {
  const itens = document.querySelectorAll('[data-contador]');
  if (!itens.length) return;

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;

      const elemento  = entrada.target;
      const destino   = parseInt(elemento.dataset.contador);
      const duracao   = 2000;
      const intervalo = 16;
      const passos    = duracao / intervalo;
      const incremento = destino / passos;
      let atual = 0;

      const timer = setInterval(() => {
        atual += incremento;
        if (atual >= destino) {
          elemento.textContent = destino.toLocaleString('pt-BR');
          clearInterval(timer);
        } else {
          elemento.textContent = Math.floor(atual).toLocaleString('pt-BR');
        }
      }, intervalo);

      observer.unobserve(elemento);
    });
  }, { threshold: 0.5 });

  itens.forEach(item => observer.observe(item));
}


// ════════════════════════════════════════════════════════════
// CARREGAMENTO DINÂMICO DE SERVIÇOS
// ════════════════════════════════════════════════════════════

async function carregarServicos() {
  const grid = document.getElementById('servicos-grid');
  if (!grid) return;

  try {
    const resposta = await fetch('/api/conteudo');
    const dados    = await resposta.json();
    const servicos = dados.servicos || [];

    grid.innerHTML = servicos.map((s, i) => `
      <div class="servico-card" data-aos="fade-up" data-aos-delay="${i * 80}">
        <span class="servico-card__linha"></span>
        <span class="servico-card__icone">${s.icone}</span>
        <h3 class="servico-card__titulo">${s.titulo}</h3>
        <p class="servico-card__descricao">${s.descricao}</p>
      </div>
    `).join('');

    // Re-inicializa AOS para novos elementos
    if (typeof AOS !== 'undefined') AOS.refresh();

  } catch {
    grid.innerHTML = '<p style="text-align:center;color:#666;">Erro ao carregar serviços.</p>';
  }
}


// ════════════════════════════════════════════════════════════
// TRANSIÇÕES DE PÁGINA
// ════════════════════════════════════════════════════════════

function iniciarTransicoesDePagina() {
  const overlay = document.getElementById('overlay-transicao');
  if (!overlay || typeof gsap === 'undefined') return;

  // Animação de entrada (página está carregando)
  gsap.fromTo(overlay,
    { scaleY: 1, transformOrigin: 'top' },
    { scaleY: 0, duration: 0.6, ease: 'power3.inOut', delay: 0 }
  );

  // Intercepta cliques em links internos
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      link.target === '_blank'
    ) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const destino = href;

      gsap.fromTo(overlay,
        { scaleY: 0, transformOrigin: 'bottom' },
        {
          scaleY:   1,
          duration: 0.5,
          ease:     'power3.inOut',
          onComplete: () => { window.location.href = destino; }
        }
      );
    });
  });
}


// ════════════════════════════════════════════════════════════
// FORMULÁRIO DE CONTATO
// ════════════════════════════════════════════════════════════

const formContato = document.getElementById('form-contato');
if (formContato) {
  formContato.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn      = formContato.querySelector('button[type="submit"]');
    const msgEl    = document.getElementById('form-mensagem');
    const dados    = Object.fromEntries(new FormData(formContato));

    btn.disabled       = true;
    btn.innerHTML      = '<span class="spinner"></span> Enviando...';

    try {
      const res  = await fetch('/api/contato', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(dados)
      });
      const json = await res.json();

      if (json.sucesso) {
        msgEl.className   = 'formulario__mensagem sucesso';
        msgEl.textContent = '✅ Mensagem enviada com sucesso! Em breve entraremos em contato.';
        formContato.reset();
      } else {
        throw new Error(json.erro);
      }
    } catch (err) {
      msgEl.className   = 'formulario__mensagem erro';
      msgEl.textContent = '❌ ' + (err.message || 'Erro ao enviar. Tente novamente.');
    }

    btn.disabled  = false;
    btn.innerHTML = 'Enviar Mensagem';
  });
}


// ════════════════════════════════════════════════════════════
// CARREGAMENTO DE PRODUTOS (página produtos.html)
// ════════════════════════════════════════════════════════════

async function carregarProdutos(filtro = 'Todos') {
  const grid = document.getElementById('produtos-grid');
  if (!grid) return;

  grid.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Carregando...</p>';

  try {
    const res      = await fetch('/api/produtos');
    let produtos   = await res.json();

    if (filtro !== 'Todos') {
      produtos = produtos.filter(p => p.categoria === filtro);
    }

    if (!produtos.length) {
      grid.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Nenhum produto encontrado.</p>';
      return;
    }

    const iconesPorCategoria = {
      'Grãos':        '🌾',
      'Commodities':  '📦',
      'Insumos':      '🌱',
      'Outros':       '🔶'
    };

    grid.innerHTML = produtos.map((p, i) => `
      <div class="produto-card" data-aos="fade-up" data-aos-delay="${(i % 3) * 80}">
        <div class="produto-card__imagem">
          ${p.imagem
            ? `<img src="${p.imagem}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;">`
            : `<span style="font-size:3.5rem">${iconesPorCategoria[p.categoria] || '📦'}</span>`
          }
        </div>
        <div class="produto-card__corpo">
          <span class="produto-card__categoria">${p.categoria}</span>
          <h3 class="produto-card__nome">${p.nome}</h3>
          <p class="produto-card__descricao">${p.descricao}</p>
          <div class="produto-card__rodape">
            <span class="produto-card__unidade">Unidade: ${p.unidade}</span>
            ${p.destaque ? '<span class="badge-destaque">⭐ Destaque</span>' : ''}
          </div>
        </div>
      </div>
    `).join('');

    if (typeof AOS !== 'undefined') AOS.refresh();

  } catch {
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Erro ao carregar produtos.</p>';
  }
}

// Filtros de categoria na página de produtos
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    carregarProdutos(btn.dataset.filtro || 'Todos');
  });
});

// Iniciar carregamento se estiver na página de produtos
if (document.getElementById('produtos-grid')) {
  carregarProdutos();
}


// ════════════════════════════════════════════════════════════
// CARROSSEL DOS DOIS PAINÉIS (home)
// ════════════════════════════════════════════════════════════

const _car = {
  equip: { slides: [], atual: 0, timer: null, dados: [] },
  serv:  { slides: [], atual: 0, timer: null, dados: [] }
};

const SERVICOS_CAROUSEL = [
  { icone: '🔍', nome: 'Busca Inteligente',  bg: 'linear-gradient(160deg,#091520 0%,#0e2540 100%)' },
  { icone: '📋', nome: 'Laudo Cautelar',     bg: 'linear-gradient(160deg,#150e00 0%,#2e1f00 100%)' },
  { icone: '⭐', nome: 'Key Account Prime',  bg: 'linear-gradient(160deg,#0b0920 0%,#1a1540 100%)' },
  { icone: '🚜', nome: 'Mix de Frota',       bg: 'linear-gradient(160deg,#081508 0%,#102810 100%)' },
  { icone: '💰', nome: 'Venda do Ativo',     bg: 'linear-gradient(160deg,#150808 0%,#2e1010 100%)' },
  { icone: '🎯', nome: 'Equipamento Ideal',  bg: 'linear-gradient(160deg,#100815 0%,#201028 100%)' },
];

const CAT_BG = {
  'Colheitadeira': 'linear-gradient(160deg,#081508 0%,#142814 100%)',
  'Trator':        'linear-gradient(160deg,#091520 0%,#0e2a40 100%)',
  'Plantadeira':   'linear-gradient(160deg,#081508 0%,#103010 100%)',
  'Pulverizador':  'linear-gradient(160deg,#150808 0%,#301010 100%)',
  'Implemento':    'linear-gradient(160deg,#100815 0%,#201530 100%)',
};

const CAT_ICONE = {
  'Colheitadeira': '🌾',
  'Trator':        '🚜',
  'Plantadeira':   '🌱',
  'Pulverizador':  '💨',
  'Implemento':    '⚙️',
};

function iniciarCarrosseis() {
  // Serviços (estático)
  montarCarrossel('serv', SERVICOS_CAROUSEL.map(s => ({
    bg: s.bg, icone: s.icone, nome: s.nome, categoria: 'Serviço'
  })));

  // Equipamentos (dinâmico via API)
  fetch('/api/produtos')
    .then(r => r.json())
    .then(dados => {
      const lista = dados.produtos || [];
      if (!lista.length) {
        montarCarrossel('equip', [{ bg: CAT_BG['Trator'], icone: '🚜', nome: 'Equipamentos Agrícolas', categoria: 'Todos os tipos' }]);
        return;
      }
      montarCarrossel('equip', lista.map(p => ({
        bg:       p.imagem ? null : (CAT_BG[p.categoria] || 'linear-gradient(160deg,#091520,#0e2a40)'),
        img:      p.imagem ? `/uploads/${p.imagem}` : null,
        icone:    CAT_ICONE[p.categoria] || '🚜',
        nome:     p.nome,
        categoria:p.categoria,
        estoque:  p.estoque,
      })));
    })
    .catch(() => {
      montarCarrossel('equip', [{ bg: CAT_BG['Trator'], icone: '🚜', nome: 'Equipamentos Agrícolas', categoria: 'Máquinas do Agronegócio' }]);
    });
}

function montarCarrossel(id, slides) {
  const c       = _car[id];
  c.dados       = slides;
  const slidesEl = document.getElementById(`slides-${id}`);
  const dotsEl   = document.getElementById(`dots-${id}`);
  if (!slidesEl) return;

  slidesEl.innerHTML = slides.map((s, i) => {
    const style = s.img
      ? `background-image:url('${s.img}');background-size:cover;background-position:center;`
      : `background:${s.bg};`;
    return `<div class="painel__slide${i === 0 ? ' ativo' : ''}" style="${style}" data-idx="${i}">
      <div class="slide-icone-bg">${s.icone}</div>
    </div>`;
  }).join('');

  if (dotsEl) {
    dotsEl.innerHTML = slides.map((_, i) =>
      `<button class="painel__dot${i === 0 ? ' ativo' : ''}" data-idx="${i}" aria-label="Slide ${i+1}"></button>`
    ).join('');
    dotsEl.querySelectorAll('.painel__dot').forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(c.timer);
        _irParaSlide(id, parseInt(dot.dataset.idx));
        _iniciarAutoplay(id);
      });
    });
  }

  c.slides = Array.from(slidesEl.querySelectorAll('.painel__slide'));
  c.atual  = 0;
  _atualizarInfoSlide(id, 0);
  _iniciarAutoplay(id);

  const painel = document.getElementById(`painel-${id}`);
  if (painel) _adicionarSwipe(painel, id);
}

function _irParaSlide(id, idx) {
  const c = _car[id];
  if (!c.slides.length) return;

  c.slides[c.atual].classList.remove('ativo');
  const dots = document.getElementById(`dots-${id}`);
  if (dots) dots.querySelectorAll('.painel__dot')[c.atual]?.classList.remove('ativo');

  c.atual = ((idx % c.slides.length) + c.slides.length) % c.slides.length;
  c.slides[c.atual].classList.add('ativo');
  if (dots) dots.querySelectorAll('.painel__dot')[c.atual]?.classList.add('ativo');

  _atualizarInfoSlide(id, c.atual);
}

function _atualizarInfoSlide(id, idx) {
  const d = _car[id].dados[idx];
  if (!d) return;

  const nomeEl = document.getElementById(`${id}-nome`);
  const catEl  = document.getElementById(`${id}-cat`);

  if (nomeEl) {
    nomeEl.style.opacity = '0';
    setTimeout(() => { nomeEl.textContent = d.nome; nomeEl.style.opacity = '1'; }, 220);
  }
  if (catEl) catEl.textContent = d.categoria || 'Equipamento';

  if (id === 'equip') {
    const badgeEl = document.getElementById('equip-badge');
    if (badgeEl && d.estoque !== undefined) {
      badgeEl.style.display = 'inline-block';
      if (d.estoque > 3) {
        badgeEl.textContent = '● Em estoque';
        badgeEl.className = 'painel__badge painel__badge--verde';
      } else if (d.estoque > 0) {
        badgeEl.textContent = '● Última unidade';
        badgeEl.className = 'painel__badge painel__badge--amarelo';
      } else {
        badgeEl.textContent = '● Consultar disponibilidade';
        badgeEl.className = 'painel__badge painel__badge--cinza';
      }
    }
  }
}

function _iniciarAutoplay(id) {
  const c = _car[id];
  clearInterval(c.timer);
  c.timer = setInterval(() => _irParaSlide(id, c.atual + 1), 4200);
}

function _adicionarSwipe(el, id) {
  let sx = 0, sy = 0;
  el.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    const dy = Math.abs(sy - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 48 && Math.abs(dx) > dy) {
      clearInterval(_car[id].timer);
      _irParaSlide(id, _car[id].atual + (dx > 0 ? 1 : -1));
      _iniciarAutoplay(id);
    }
  }, { passive: true });
}


// ════════════════════════════════════════════════════════════
// VÍDEOS ESPECIAIS (YouTube embeds na home)
// ════════════════════════════════════════════════════════════

function carregarVideosEspeciais() {
  const container = document.getElementById('videos-especiais-container');
  const ctaEl     = document.getElementById('videos-canal-cta');
  if (!container) return;

  fetch('/api/conteudo')
    .then(r => r.json())
    .then(dados => {
      const videos = dados.midia?.youtube?.videos || [];
      if (!videos.length) return; // keep placeholder

      const gridClass = videos.length === 1 ? 'videos-especiais-grid um-video' : 'videos-especiais-grid';
      container.innerHTML = `
        <div class="${gridClass}">
          ${videos.slice(0, 4).map(vid => `
            <div class="video-especial-wrapper">
              <iframe
                src="https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
                title="Vídeo Forcemak Prime">
              </iframe>
            </div>`).join('')}
        </div>`;

      if (ctaEl) ctaEl.style.display = 'block';
    })
    .catch(() => { /* keep placeholder */ });
}
