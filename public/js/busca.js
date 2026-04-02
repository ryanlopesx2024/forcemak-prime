// ============================================================
// Busca Avançada com Sidebar + Filtro de Estoque
// Forcemak Prime
// ============================================================

// Estado dos filtros
const estado = {
  texto:      '',
  categorias: new Set(),
  apenasEstoque: false,
  ordenar:    'padrao',
  todos:      []  // cache dos produtos
};

// ─── Inicialização ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('produtos-grid')) return;

  await carregarTodosProdutos();
  iniciarEventos();
  renderizarProdutos(false); // false = não rolar (carga inicial)
});

async function carregarTodosProdutos() {
  try {
    const res = await fetch('/api/produtos');
    estado.todos = await res.json();
    montarFiltrosCategorias();
  } catch {
    document.getElementById('produtos-grid').innerHTML = `
      <div class="sem-resultados">
        <div class="sem-resultados__icone"></div>
        <p class="sem-resultados__titulo">Erro ao carregar equipamentos</p>
        <p class="sem-resultados__texto">Tente recarregar a página.</p>
      </div>`;
  }
}

// ─── Monta checkboxes de categorias dinamicamente ────────────
function montarFiltrosCategorias() {
  const container = document.getElementById('filtros-categorias');
  if (!container) return;

  const contagem = {};
  estado.todos.forEach(p => {
    contagem[p.categoria] = (contagem[p.categoria] || 0) + 1;
  });

  const categorias = Object.keys(contagem).sort();

  container.innerHTML = categorias.map(cat => `
    <label class="filtro-opcao">
      <input type="checkbox" value="${cat}" class="filtro-categoria-check">
      <span class="filtro-opcao__label">${cat}</span>
      <span class="filtro-opcao__contagem">${contagem[cat]}</span>
    </label>
  `).join('');

  container.querySelectorAll('.filtro-categoria-check').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) estado.categorias.add(cb.value);
      else            estado.categorias.delete(cb.value);
      renderizarProdutos(true);
    });
  });
}

// ─── Eventos ─────────────────────────────────────────────────
function iniciarEventos() {
  const inputBusca = document.getElementById('busca-input');
  if (inputBusca) {
    inputBusca.addEventListener('input', () => {
      estado.texto = inputBusca.value.trim().toLowerCase();
      renderizarProdutos(true);
    });
  }

  const toggleEstoque = document.getElementById('toggle-estoque');
  const switchEl      = document.getElementById('switch-estoque');
  if (toggleEstoque) {
    toggleEstoque.addEventListener('click', () => {
      estado.apenasEstoque = !estado.apenasEstoque;
      switchEl.classList.toggle('ativo', estado.apenasEstoque);
      renderizarProdutos(true);
    });
  }

  const select = document.getElementById('ordenar-select');
  if (select) {
    select.addEventListener('change', () => {
      estado.ordenar = select.value;
      renderizarProdutos(true);
    });
  }

  const btnLimpar = document.getElementById('btn-limpar-filtros');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', limparFiltros);
  }
}

function limparFiltros() {
  estado.texto          = '';
  estado.categorias     = new Set();
  estado.apenasEstoque  = false;
  estado.ordenar        = 'padrao';

  const inputBusca = document.getElementById('busca-input');
  const switchEl   = document.getElementById('switch-estoque');
  const select     = document.getElementById('ordenar-select');
  const checks     = document.querySelectorAll('.filtro-categoria-check');

  if (inputBusca) inputBusca.value = '';
  if (switchEl)   switchEl.classList.remove('ativo');
  if (select)     select.value = 'padrao';
  checks.forEach(cb => cb.checked = false);

  renderizarProdutos(true);
}

// ─── Filtragem e Renderização ─────────────────────────────────
function filtrarProdutos() {
  return estado.todos.filter(p => {
    if (estado.texto) {
      const texto = estado.texto;
      const match = p.nome.toLowerCase().includes(texto) ||
                    p.descricao.toLowerCase().includes(texto) ||
                    p.categoria.toLowerCase().includes(texto);
      if (!match) return false;
    }
    if (estado.categorias.size > 0 && !estado.categorias.has(p.categoria)) return false;
    if (estado.apenasEstoque && p.estoque <= 0) return false;
    return true;
  });
}

function ordenarProdutos(lista) {
  const copia = [...lista];
  switch (estado.ordenar) {
    case 'nome-az':        return copia.sort((a, b) => a.nome.localeCompare(b.nome));
    case 'nome-za':        return copia.sort((a, b) => b.nome.localeCompare(a.nome));
    case 'estoque-maior':  return copia.sort((a, b) => (b.estoque || 0) - (a.estoque || 0));
    case 'destaque':       return copia.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
    default:               return copia;
  }
}

function renderizarProdutos(rolarParaGrid = false) {
  const grid   = document.getElementById('produtos-grid');
  const contEl = document.getElementById('contagem-resultados');
  if (!grid) return;

  const filtrados = ordenarProdutos(filtrarProdutos());

  if (contEl) {
    contEl.innerHTML = `<strong>${filtrados.length}</strong> equipamento${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`;
  }

  if (!filtrados.length) {
    grid.innerHTML = `
      <div class="sem-resultados" style="grid-column: 1/-1;">
        <div class="sem-resultados__icone"></div>
        <p class="sem-resultados__titulo">Nenhum equipamento encontrado</p>
        <p class="sem-resultados__texto">Tente ajustar os filtros ou pesquise por outro termo.</p>
        <button onclick="limparFiltros()" class="btn btn--azul" style="margin-top:20px;">
          Limpar filtros
        </button>
      </div>`;
  } else {
    grid.innerHTML = filtrados.map((p, i) => {
      const badgeEstoque = badgeEstoqueHTML(p.estoque);
      const semEstoque   = p.estoque <= 0 ? 'sem-estoque' : '';

      const dadosAttr = encodeURIComponent(JSON.stringify({
        id: p.id, nome: p.nome, categoria: p.categoria,
        descricao: p.descricao || '', imagem: p.imagem || '',
        imagens: p.imagens || [], estoque: p.estoque, destaque: p.destaque,
        ano: p.ano || '', horimetro: p.horimetro || '',
        localizacao: p.localizacao || '', valor: p.valor || '',
        condicao: p.condicao || ''
      }));

      return `
        <div class="produto-card ${semEstoque}" data-aos="fade-up" data-aos-delay="${(i % 3) * 60}"
             style="cursor:pointer;" onclick="abrirEqModal('${dadosAttr}')">
          <div class="produto-card__imagem">
            ${p.imagem
              ? `<img src="${p.imagem}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;">`
              : `<span style="font-size:0.8rem;font-weight:600;color:var(--cinza-texto);text-transform:uppercase;letter-spacing:0.08em;">${p.categoria}</span>`
            }
          </div>
          <div class="produto-card__corpo">
            <span class="produto-card__categoria">${p.categoria}</span>
            <h3 class="produto-card__nome">${destacarTexto(p.nome, estado.texto)}</h3>
            <p class="produto-card__descricao">${p.descricao}</p>
            <div class="produto-card__rodape">
              ${badgeEstoque}
              ${p.destaque ? '<span class="badge-destaque">Destaque</span>' : ''}
            </div>
            <span class="btn btn--azul"
                 style="display:block;text-align:center;margin-top:16px;font-size:0.85rem;padding:10px 16px;border-radius:8px;">
              Ver Detalhes
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  if (typeof AOS !== 'undefined') AOS.refresh();

  // Scroll para o grid no mobile quando filtro foi aplicado
  if (rolarParaGrid && window.innerWidth <= 1024) {
    setTimeout(() => {
      document.getElementById('produtos-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function badgeEstoqueHTML(qtd) {
  if (qtd <= 0) {
    return `<span class="estoque-badge estoque-badge--indisponivel">
              <span class="estoque-badge__dot"></span> Indisponível
            </span>`;
  }
  if (qtd <= 2) {
    return `<span class="estoque-badge estoque-badge--ultima">
              <span class="estoque-badge__dot"></span> Última${qtd > 1 ? 's ' + qtd : ''} unidade${qtd > 1 ? 's' : ''}
            </span>`;
  }
  return `<span class="estoque-badge estoque-badge--disponivel">
            <span class="estoque-badge__dot"></span> ${qtd} em estoque
          </span>`;
}

function destacarTexto(texto, termo) {
  if (!termo) return texto;
  const re = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return texto.replace(re, '<mark style="background:rgba(232,98,42,0.2);border-radius:2px;padding:0 2px;">$1</mark>');
}

// ─── Galeria de fotos ────────────────────────────────────────
let galeriaFotos = [];
let galeriaIdx   = 0;

function renderizarFotoGaleria() {
  const foto        = document.getElementById('eq-modal-foto');
  const placeholder = document.getElementById('eq-modal-placeholder');
  const thumbsEl    = document.getElementById('eq-modal-thumbs');
  const btnPrev     = document.getElementById('eq-gal-prev');
  const btnNext     = document.getElementById('eq-gal-next');

  if (galeriaFotos.length > 0) {
    foto.src = galeriaFotos[galeriaIdx];
    foto.alt = '';
    foto.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    foto.style.display = 'none';
    placeholder.style.display = 'flex';
  }

  const multi = galeriaFotos.length > 1;
  if (btnPrev) btnPrev.style.display = multi ? 'flex' : 'none';
  if (btnNext) btnNext.style.display = multi ? 'flex' : 'none';

  if (thumbsEl) {
    if (multi) {
      thumbsEl.innerHTML = galeriaFotos.map((url, i) => `
        <button class="eq-thumb ${i === galeriaIdx ? 'ativo' : ''}" onclick="irParaFoto(${i})" aria-label="Foto ${i+1}">
          <img src="${url}" alt="Foto ${i+1}">
        </button>
      `).join('');
      thumbsEl.style.display = 'flex';
    } else {
      thumbsEl.innerHTML = '';
      thumbsEl.style.display = 'none';
    }
  }
}

function irParaFoto(idx) {
  galeriaIdx = idx;
  renderizarFotoGaleria();
}

// ─── Modal de Equipamento ────────────────────────────────────
function abrirEqModal(dadosEncoded) {
  const p = JSON.parse(decodeURIComponent(dadosEncoded));
  const modal = document.getElementById('eq-modal');
  if (!modal) return;

  document.getElementById('eq-modal-cat').textContent  = p.categoria;
  document.getElementById('eq-modal-nome').textContent = p.nome;
  document.getElementById('eq-modal-cat-placeholder').textContent = p.categoria;
  document.getElementById('eq-modal-desc').textContent = p.descricao || 'Entre em contato para mais informações sobre este equipamento.';

  // Galeria de fotos
  if (p.imagens && p.imagens.length > 0) {
    galeriaFotos = p.imagens;
  } else if (p.imagem) {
    galeriaFotos = [p.imagem];
  } else {
    galeriaFotos = [];
  }
  galeriaIdx = 0;
  renderizarFotoGaleria();

  // Specs
  const specs  = document.getElementById('eq-modal-specs');
  const campos = [
    { label: 'Ano',         valor: p.ano },
    { label: 'Horímetro',   valor: p.horimetro },
    { label: 'Localização', valor: p.localizacao },
    { label: 'Valor',       valor: p.valor },
    { label: 'Condição',    valor: p.condicao },
  ].filter(c => c.valor);
  specs.innerHTML = campos.length ? campos.map(c => `
    <div class="eq-spec">
      <span class="eq-spec__label">${c.label}</span>
      <span class="eq-spec__valor">${c.valor}</span>
    </div>
  `).join('') : '';

  // Status
  const status = document.getElementById('eq-modal-status');
  if (p.estoque > 0) {
    status.textContent = 'Disponível em estoque';
    status.className   = 'eq-modal__status eq-modal__status--ok';
  } else {
    status.textContent = 'Consultar disponibilidade';
    status.className   = 'eq-modal__status eq-modal__status--consultar';
  }

  const msg = encodeURIComponent(`Olá! Tenho interesse no equipamento: ${p.nome}. Poderia me passar mais informações?`);
  document.getElementById('eq-modal-wa').href = `https://wa.me/5551996050777?text=${msg}`;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  if (typeof fbq !== 'undefined') fbq('track', 'ViewContent', { content_name: p.nome });
}

function fecharEqModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('eq-modal__fechar')) return;
  const modal = document.getElementById('eq-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') fecharEqModal({ target: null, currentTarget: null });
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('eq-gal-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    galeriaIdx = (galeriaIdx - 1 + galeriaFotos.length) % galeriaFotos.length;
    renderizarFotoGaleria();
  });
  document.getElementById('eq-gal-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    galeriaIdx = (galeriaIdx + 1) % galeriaFotos.length;
    renderizarFotoGaleria();
  });
});

// ─── Preenche campo de contato com equipamento selecionado ───
document.addEventListener('DOMContentLoaded', () => {
  const params      = new URLSearchParams(window.location.search);
  const equipamento = params.get('equipamento');
  const campoAssunto = document.getElementById('assunto');
  if (equipamento && campoAssunto) {
    const opcaoExistente = [...campoAssunto.options].find(o =>
      o.value.toLowerCase().includes(equipamento.toLowerCase())
    );
    if (!opcaoExistente) {
      const op = new Option(`Equipamento: ${equipamento}`, equipamento, true, true);
      campoAssunto.add(op);
    }
  }
});
