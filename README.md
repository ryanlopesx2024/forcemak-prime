# Forcemak Prime — Site Oficial

> Negocie com segurança, realize com confiança.

---

## Estrutura do Projeto

```
forcemak-prime/
├── server.js              ← Servidor Node.js (backend)
├── .env                   ← Variáveis de ambiente (configure antes de rodar)
├── package.json
├── dados/
│   ├── conteudo.json      ← Textos editáveis do site
│   ├── produtos.json      ← Produtos cadastrados
│   ├── usuarios.json      ← Usuários admin (gerado automaticamente)
│   └── contatos.json      ← Mensagens do formulário de contato
└── public/
    ├── index.html         ← Página inicial
    ├── sobre.html         ← Sobre nós
    ├── produtos.html      ← Listagem de produtos
    ├── contato.html       ← Formulário de contato
    ├── css/
    │   └── estilos.css    ← Todos os estilos + responsivo
    ├── js/
    │   └── principal.js   ← Animações GSAP/AOS + interações
    ├── imagens/
    │   └── uploads/       ← Imagens enviadas pelo admin
    └── admin/
        ├── login.html     ← Login do administrador
        ├── painel.html    ← Dashboard admin
        ├── css/
        │   └── painel.css
        └── js/
            └── painel.js
```

---

## Instalação e Configuração

### 1. Pré-requisitos

- [Node.js](https://nodejs.org) versão 18 ou superior

### 2. Instalar dependências

```bash
cd forcemak-prime
npm install
```

### 3. Configurar variáveis de ambiente

Abra o arquivo `.env` e preencha:

```env
PORT=3000
JWT_SEGREDO=coloque_uma_chave_secreta_forte_aqui

# Facebook API (opcional — para ver métricas no painel admin)
FACEBOOK_ACCESS_TOKEN=seu_access_token_aqui
FACEBOOK_PIXEL_ID=1433120138425099
```

### 4. Colocar a logo

Coloque o arquivo da logo em:
```
public/imagens/logo.png
```

Depois, descomente as linhas de `<img>` nas páginas HTML e remova as tags de texto (busque por `nav__logo-texto`).

### 5. Rodar o servidor

**Produção:**
```bash
npm start
```

**Desenvolvimento (reinicia automaticamente ao salvar):**
```bash
npm run dev
```

O site estará disponível em: **http://localhost:3000**

---

## Primeiro Acesso ao Admin

Na primeira vez que o servidor rodar, ele cria automaticamente um usuário admin:

| Campo   | Valor     |
|---------|-----------|
| Usuário | `admin`   |
| Senha   | `admin123`|

**⚠️ Troque a senha imediatamente após o primeiro login!**
> Acesse: http://localhost:3000/admin/login.html
> No painel, vá em **Configurações → Alterar Senha**

---

## Funcionalidades

### Site (usuário final)
- Página inicial com animações GSAP
- Contadores animados (scroll trigger)
- Transições suaves entre páginas
- Animações de scroll (AOS)
- Listagem de produtos com filtros por categoria
- Formulário de contato integrado ao backend
- Meta Pixel do Facebook em todas as páginas
- Totalmente responsivo (mobile, tablet, desktop)

### Painel Admin
| Seção              | O que é possível fazer                                |
|--------------------|-------------------------------------------------------|
| Visão Geral        | Resumo de mensagens e produtos                        |
| Mensagens          | Ver todas as mensagens do formulário, marcar como lida|
| Produtos           | Criar, editar e excluir produtos                      |
| Textos do Site     | Editar hero, sobre e informações de contato           |
| Facebook / Meta    | Ver status do pixel e instruções da API               |
| Alterar Senha      | Trocar a senha de acesso                              |

---

## Facebook Pixel

O pixel **1433120138425099** está configurado em todas as páginas.

Eventos rastreados:
- `PageView` — em todas as páginas
- `Contact` — na página de contato e ao clicar no WhatsApp

Para ver métricas detalhadas no painel admin:
1. Obtenha um **Access Token** no Gerenciador de Negócios do Facebook
2. Adicione ao arquivo `.env`:
   ```
   FACEBOOK_ACCESS_TOKEN=seu_token_aqui
   ```
3. Reinicie o servidor

---

## Tecnologias Utilizadas

| Camada     | Tecnologia              | Motivo da escolha              |
|------------|-------------------------|-------------------------------|
| Frontend   | HTML5 + CSS3 + JS       | Leve, sem frameworks pesados  |
| Animações  | GSAP 3 + ScrollTrigger  | Animações profissionais        |
| Scroll     | AOS (Animate on Scroll) | Fácil e eficiente              |
| Backend    | Node.js + Express       | Simples e rápido               |
| Auth       | JWT + bcrypt            | Seguro e sem dependências extras|
| Dados      | JSON (arquivos)         | Sem necessidade de banco de dados|

---

## Personalização de Cores

Todas as cores ficam em `public/css/estilos.css`, no início do arquivo:

```css
:root {
  --azul:    #1C3A5E;   /* Azul escuro da marca */
  --laranja: #E8622A;   /* Laranja do badge PRIME */
  --branco:  #FFFFFF;
  /* ... */
}
```

---

## Deploy em Produção

Para publicar online (ex: VPS, DigitalOcean, Railway):

1. Suba os arquivos para o servidor
2. Configure o `.env` com valores de produção
3. Use **PM2** para manter o servidor rodando:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "forcemak"
   pm2 save
   pm2 startup
   ```
4. Configure um proxy reverso com **Nginx** apontando para a porta 3000
5. Configure SSL com **Let's Encrypt** (Certbot)
