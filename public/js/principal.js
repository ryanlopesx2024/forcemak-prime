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
