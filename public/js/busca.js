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
  renderizarProdutos();
});

async function carregarTodosProdutos() {
  try {
    const res = await fetch('/api/produtos');
    estado.todos = await res.json();
    montarFiltrosCategorias();
  } catch {
    document.getElementById('produtos-grid').innerHTML = `
      <div class="sem-resultados">
        <div class="sem-resultados__icone">⚠️</div>
        <p class="sem-resultados__titulo">Erro ao carregar equipamentos</p>
        <p class="sem-resultados__texto">Tente recarregar a página.</p>
      </div>`;
  }
}

// ─── Monta checkboxes de categorias dinamicamente ────────────
function montarFiltrosCategorias() {
  const container = document.getElementById('filtros-categorias');
  if (!container) return;

  // Conta produtos por categoria
  const contagem = {};
  estado.todos.forEach(p => {
    contagem[p.categoria] = (contagem[p.categoria] || 0) + 1;
  });

  const categorias = Object.keys(contagem).sort();

  container.innerHTML = categorias.map(cat => `
    <label class="filtro-opcao">
      <input type="checkbox" value="${cat}" class="filtro-categoria-check">
      <span class="filtro-opcao__label">
        ${iconeCategoria(cat)} ${cat}
      </span>
      <span class="filtro-opcao__contagem">${contagem[cat]}</span>
    </label>
  `).join('');

  // Eventos nos checkboxes
  container.querySelectorAll('.filtro-categoria-check').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) estado.categorias.add(cb.value);
      else            estado.categorias.delete(cb.value);
      renderizarProdutos();
    });
  });
}

function iconeCategoria(cat) {
  const icones = {
    'Colheitadeiras': '🌾',
    'Tratores':       '🚜',
    'Plantadeiras':   '🌱',
    'Pulverizadores': '💨',
    'Implementos':    '🔧',
    'Outros':         '📦'
  };
  return icones[cat] || '📦';
}

// ─── Eventos ─────────────────────────────────────────────────
function iniciarEventos() {
  // Busca em tempo real
  const inputBusca = document.getElementById('busca-input');
  if (inputBusca) {
    inputBusca.addEventListener('input', () => {
      estado.texto = inputBusca.value.trim().toLowerCase();
      renderizarProdutos();
    });
  }

  // Toggle apenas em estoque
  const toggleEstoque = document.getElementById('toggle-estoque');
  const switchEl      = document.getElementById('switch-estoque');
  if (toggleEstoque) {
    toggleEstoque.addEventListener('click', () => {
      estado.apenasEstoque = !estado.apenasEstoque;
      switchEl.classList.toggle('ativo', estado.apenasEstoque);
      renderizarProdutos();
    });
  }

  // Ordenação
  const select = document.getElementById('ordenar-select');
  if (select) {
    select.addEventListener('change', () => {
      estado.ordenar = select.value;
      renderizarProdutos();
    });
  }

  // Limpar filtros
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

  renderizarProdutos();
}

// ─── Filtragem e Renderização ─────────────────────────────────
function filtrarProdutos() {
  return estado.todos.filter(p => {
    // Filtro de texto (nome + descrição)
    if (estado.texto) {
      const texto = estado.texto;
      const match = p.nome.toLowerCase().includes(texto) ||
                    p.descricao.toLowerCase().includes(texto) ||
                    p.categoria.toLowerCase().includes(texto);
      if (!match) return false;
    }

    // Filtro de categorias
    if (estado.categorias.size > 0 && !estado.categorias.has(p.categoria)) {
      return false;
    }

    // Filtro de estoque
    if (estado.apenasEstoque && p.estoque <= 0) {
      return false;
    }

    return true;
  });
}

function ordenarProdutos(lista) {
  const copia = [...lista];
  switch (estado.ordenar) {
    case 'nome-az':
      return copia.sort((a, b) => a.nome.localeCompare(b.nome));
    case 'nome-za':
      return copia.sort((a, b) => b.nome.localeCompare(a.nome));
    case 'estoque-maior':
      return copia.sort((a, b) => (b.estoque || 0) - (a.estoque || 0));
    case 'destaque':
      return copia.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
    default:
      return copia;
  }
}

function renderizarProdutos() {
  const grid    = document.getElementById('produtos-grid');
  const contEl  = document.getElementById('contagem-resultados');
  if (!grid) return;

  const filtrados = ordenarProdutos(filtrarProdutos());

  // Atualiza contagem
  if (contEl) {
    contEl.innerHTML = `<strong>${filtrados.length}</strong> equipamento${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`;
  }

  // Sem resultados
  if (!filtrados.length) {
    grid.innerHTML = `
      <div class="sem-resultados" style="grid-column: 1/-1;">
        <div class="sem-resultados__icone">🔍</div>
        <p class="sem-resultados__titulo">Nenhum equipamento encontrado</p>
        <p class="sem-resultados__texto">Tente ajustar os filtros ou pesquise por outro termo.</p>
        <button onclick="limparFiltros()" class="btn btn--azul" style="margin-top:20px;">
          Limpar filtros
        </button>
      </div>`;
    return;
  }

  grid.innerHTML = filtrados.map((p, i) => {
    const badgeEstoque = badgeEstoqueHTML(p.estoque);
    const semEstoque   = p.estoque <= 0 ? 'sem-estoque' : '';

    return `
      <div class="produto-card ${semEstoque}" data-aos="fade-up" data-aos-delay="${(i % 3) * 60}">
        <div class="produto-card__imagem">
          ${p.imagem
            ? `<img src="${p.imagem}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;">`
            : `<span style="font-size:3.5rem;">${iconeCategoria(p.categoria)}</span>`
          }
        </div>
        <div class="produto-card__corpo">
          <span class="produto-card__categoria">${p.categoria}</span>
          <h3 class="produto-card__nome">${destacarTexto(p.nome, estado.texto)}</h3>
          <p class="produto-card__descricao">${p.descricao}</p>
          <div class="produto-card__rodape">
            ${badgeEstoque}
            ${p.destaque ? '<span class="badge-destaque">⭐ Destaque</span>' : ''}
          </div>
          <a href="/contato.html?equipamento=${encodeURIComponent(p.nome)}"
             class="btn btn--azul"
             style="width:100%;justify-content:center;margin-top:16px;font-size:0.85rem;"
             onclick="fbq && fbq('track','InitiateCheckout',{content_name:'${p.nome}'})">
            Solicitar Proposta
          </a>
        </div>
      </div>
    `;
  }).join('');

  // Reinicia AOS nos novos elementos
  if (typeof AOS !== 'undefined') AOS.refresh();
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

// ─── Preenche campo de contato com equipamento selecionado ───
document.addEventListener('DOMContentLoaded', () => {
  const params     = new URLSearchParams(window.location.search);
  const equipamento = params.get('equipamento');
  const campoAssunto = document.getElementById('assunto');
  if (equipamento && campoAssunto) {
    // Tenta selecionar a opção, senão cria uma nova
    const opcaoExistente = [...campoAssunto.options].find(o =>
      o.value.toLowerCase().includes(equipamento.toLowerCase())
    );
    if (!opcaoExistente) {
      const op = new Option(`Equipamento: ${equipamento}`, equipamento, true, true);
      campoAssunto.add(op);
    }
  }
});
