/* ==========================================================================
   Sá | Spessatto · main.js
   JS puro, sem dependências.
   ========================================================================== */

/* ---------- Configuração (edite aqui) ---------- */

// WhatsApp do escritório: só números, com 55 + DDD. Todos os botões usam esta constante.
const WHATSAPP_NUMBER = '5562997006848';

// Horário de atendimento, no fuso de Goiânia. Dias: 0 = domingo ... 6 = sábado.
const BUSINESS_HOURS = {
  days: [1, 2, 3, 4, 5],
  open: 8,    // TODO: confirmar o horário de abertura
  close: 18,
  timeZone: 'America/Sao_Paulo',
  label: 'Segunda a sexta, até 18h',
  inline: 'de segunda a sexta, até as 18h',
};

// Google Analytics 4: cole o ID de medição (ex.: 'G-ABC123XYZ'). Vazio = só dataLayer (útil com GTM).
const GA_MEASUREMENT_ID = '';

// Painel do WhatsApp: abre sozinho uma única vez por sessão.
const WA_AUTO_OPEN = { delayMs: 25000, scrollRatio: 0.5 };

// Mensagem padrão dos botões de WhatsApp sem texto próprio
const WA_DEFAULT_TEXT = 'Olá! Vim pelo site e gostaria de falar sobre um projeto.';

/* ---------- Utilidades ---------- */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

const formatWhatsDisplay = (num) => {
  const d = num.replace(/\D/g, '').replace(/^55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d;
};

const storage = {
  get(key) { try { return window.sessionStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { window.sessionStorage.setItem(key, value); } catch (e) { /* modo privado */ } },
};

// Abre o WhatsApp em nova aba. Devolve false se o navegador bloqueou o popup.
function openWhatsApp(url) {
  const win = window.open(url, '_blank');
  if (win) {
    try { win.opener = null; } catch (e) { /* ignore */ }
    return true;
  }
  return false;
}

/* ---------- Analytics ---------- */

window.dataLayer = window.dataLayer || [];

function initAnalytics() {
  if (!GA_MEASUREMENT_ID) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

function track(event, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  } else {
    window.dataLayer.push({ event, ...params });
  }
}

/* ---------- Horário comercial ---------- */

function nowInOffice() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_HOURS.timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => (parts.find((p) => p.type === type) || {}).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const hour = Number(get('hour')) + Number(get('minute')) / 60;
  return { day, hour };
}

function officeStatus() {
  const { day, hour } = nowInOffice();
  const workday = BUSINESS_HOURS.days.includes(day);
  if (workday && hour >= BUSINESS_HOURS.open && hour < BUSINESS_HOURS.close) {
    return { online: true, text: 'online · responde em horário comercial' };
  }
  if (workday && hour < BUSINESS_HOURS.open) {
    return { online: false, text: `retornamos hoje, a partir das ${BUSINESS_HOURS.open}h` };
  }
  return { online: false, text: 'retornamos no próximo dia útil' };
}

/* ---------- Conteúdo dinâmico simples ---------- */

function initStaticBits() {
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  $$('[data-hours-label]').forEach((el) => { el.textContent = BUSINESS_HOURS.label; });
  $$('[data-hours-inline]').forEach((el) => { el.textContent = BUSINESS_HOURS.inline; });
  $$('[data-wa-display]').forEach((el) => { el.textContent = formatWhatsDisplay(WHATSAPP_NUMBER); });
}

/* ---------- Links de WhatsApp ---------- */

function initWhatsAppLinks() {
  $$('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.waText || WA_DEFAULT_TEXT);
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', () => track('whatsapp_click', { placement: a.dataset.wa }));
  });
}

/* ---------- Header e menu ---------- */

function initHeader() {
  const header = $('[data-header]');
  if (!header) return;

  let ticking = false;
  const update = () => {
    header.classList.toggle('is-solid', window.scrollY > 24);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();

  // Menu mobile
  const toggle = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  const label = $('[data-menu-label]');
  const root = document.documentElement;

  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'fechar' : 'menu';
    if (open) { const first = $('a', nav); if (first) first.focus(); }
  };

  toggle.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Item do menu da seção atual
  if (!('IntersectionObserver' in window)) return;
  const links = $$('.nav__list a');
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = map.get(entry.target.id);
      if (link && entry.isIntersecting) {
        links.forEach((l) => l.classList.toggle('is-current', l === link));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ---------- Revelação ao rolar ---------- */

function initReveal() {
  const items = $$('[data-reveal]');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}

/* ---------- Linha do tempo do processo ---------- */

function initTimeline() {
  const timeline = $('[data-timeline]');
  if (!timeline) return;
  const steps = $$('[data-step]', timeline);

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    steps.forEach((s) => s.classList.add('is-active'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-active');
    });
  }, { rootMargin: '0px 0px -35% 0px' });
  steps.forEach((s) => io.observe(s));

  // O traço dourado acompanha a leitura
  let visible = false;
  let ticking = false;
  const update = () => {
    const r = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / r.height));
    timeline.style.setProperty('--progress', p.toFixed(3));
    ticking = false;
  };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) update(); })
    .observe(timeline);
  window.addEventListener('scroll', () => {
    if (visible && !ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* ---------- Projetos: filtro + lightbox ---------- */

const CATEGORY_LABELS = {
  residencial: 'residenciais',
  corporativo: 'offices',
  store: 'stores',
  decorado: 'decorados',
  mostra: 'mostras',
  food: 'food',
};

function initProjects() {
  const grid = $('[data-projects]');
  if (!grid) return;
  const projects = $$('.project', grid);
  const filter = $('[data-filter]');

  const layout = (animate) => {
    projects.filter((p) => !p.hidden).forEach((p, i) => {
      p.dataset.pos = String(i % 8);
      if (animate && !reducedMotion.matches) {
        p.classList.remove('is-entering');
        void p.offsetWidth; // reinicia a animação
        p.classList.add('is-entering');
      }
    });
  };

  // Monta o filtro só com as categorias que têm projeto
  const counts = projects.reduce((acc, p) => {
    acc[p.dataset.category] = (acc[p.dataset.category] || 0) + 1;
    return acc;
  }, {});
  const cats = Object.keys(CATEGORY_LABELS).filter((c) => counts[c]);

  if (filter && cats.length > 1) {
    const make = (value, text, count) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.value = value;
      b.setAttribute('aria-pressed', value === 'todos' ? 'true' : 'false');
      b.innerHTML = `${text}<sup>${count}</sup>`;
      return b;
    };
    filter.append(make('todos', 'todos', projects.length));
    cats.forEach((c) => filter.append(make(c, CATEGORY_LABELS[c], counts[c])));
    filter.hidden = false;

    filter.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const value = btn.dataset.value;
      $$('button', filter).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      projects.forEach((p) => { p.hidden = value !== 'todos' && p.dataset.category !== value; });
      layout(true);
      track('project_filter', { category: value });
    });
  }
  layout(false);

  // Lightbox
  const dialog = $('[data-lightbox]');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const img = $('[data-lb-img]', dialog);
  const title = $('[data-lb-title]', dialog);
  const meta = $('[data-lb-meta]', dialog);
  const count = $('[data-lb-count]', dialog);
  let list = [];
  let index = 0;
  let opener = null;

  const pad = (n) => String(n).padStart(2, '0');

  const render = (swap) => {
    const p = list[index];
    const source = $('img', p);
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    title.textContent = $('.project__name', p).textContent;
    meta.textContent = $$('.project__meta span', p)
      .map((s) => s.textContent.trim()).filter(Boolean).join('  |  ');
    count.textContent = `${pad(index + 1)} / ${pad(list.length)}`;
    if (swap && !reducedMotion.matches) {
      img.classList.remove('is-swapping');
      void img.offsetWidth;
      img.classList.add('is-swapping');
    }
  };

  const go = (step) => {
    index = (index + step + list.length) % list.length;
    render(true);
  };

  projects.forEach((p) => {
    $('.project__open', p).addEventListener('click', (e) => {
      opener = e.currentTarget;
      list = projects.filter((x) => !x.hidden);
      index = list.indexOf(p);
      render(false);
      dialog.showModal();
      $('[data-lb-close]', dialog).focus();
    });
  });

  $('[data-lb-prev]', dialog).addEventListener('click', () => go(-1));
  $('[data-lb-next]', dialog).addEventListener('click', () => go(1));
  $('[data-lb-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  // Clique fora da imagem fecha
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('lightbox__figure')) dialog.close();
  });
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
}

/* ---------- Vídeo sob demanda ---------- */

function initVideo() {
  $$('[data-video]').forEach((box) => {
    const btn = $('.video__play', box);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.video}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = `Vídeo: ${box.dataset.videoTitle || 'Sá | Spessatto'}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      box.append(iframe);
      btn.remove();
      iframe.focus();
      track('video_play', { video_id: box.dataset.video });
    }, { once: true });
  });
}

/* ---------- Formulário de contato → WhatsApp ---------- */

const TIPO_FRASE = {
  residencial: 'residencial',
  corporativo: 'corporativo (escritório ou clínica)',
  comercial: 'comercial (loja)',
  decorado: 'de decorado ou mostra',
  outro: '',
};
const FASE_FRASE = {
  terreno: 'na fase de terreno',
  obra: 'na fase de obra',
  reforma: 'na fase de reforma',
  planejando: 'ainda na fase de planejamento',
};

function maskPhone(value) {
  const d = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function buildMessage(data) {
  const tipo = TIPO_FRASE[data.tipo] || '';
  let area = data.metragem.trim();
  if (/^\d+([.,]\d+)?$/.test(area)) area = `${area} m²`;

  let text = `Olá! Meu nome é ${data.nome}.`;
  text += ` Tenho um projeto${tipo ? ` ${tipo}` : ''} em ${data.local}`;
  if (area) text += `, de aproximadamente ${area}`;
  text += `, ${FASE_FRASE[data.fase]}.`;
  if (data.mensagem.trim()) text += `\n\n${data.mensagem.trim()}`;
  text += `\n\nMeu WhatsApp: ${data.whatsapp}`;
  return text;
}

function initContactForm() {
  const form = $('[data-contact-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const statusTitle = $('[data-form-status-title]', form);
  const fallback = $('[data-form-fallback]', form);
  const phone = form.elements.whatsapp;

  phone.addEventListener('input', () => { phone.value = maskPhone(phone.value); });

  const rules = {
    nome: (v) => (v.trim().length >= 2 ? '' : 'Informe seu nome.'),
    whatsapp: (v) => {
      const n = v.replace(/\D/g, '').length;
      return n >= 10 && n <= 11 ? '' : 'Informe um WhatsApp com DDD.';
    },
    tipo: (v) => (v ? '' : 'Escolha o tipo de projeto.'),
    fase: (v) => (v ? '' : 'Escolha a fase em que você está.'),
    local: (v) => (v.trim().length >= 2 ? '' : 'Diga a cidade ou o bairro do imóvel.'),
  };

  const setError = (name, message) => {
    const input = form.elements[name];
    const field = input.closest('.field');
    const error = $('.field__error', field);
    field.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  };

  // Revalida o campo assim que a pessoa corrige
  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    const evt = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evt, () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(name, rules[name](input.value));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    Object.entries(rules).forEach(([name, check]) => {
      const msg = check(form.elements[name].value);
      setError(name, msg);
      if (msg && !firstInvalid) firstInvalid = form.elements[name];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    const url = waLink(buildMessage(data));
    const opened = openWhatsApp(url);

    fallback.href = url;
    statusTitle.textContent = opened ? 'Abrindo o WhatsApp…' : 'Quase lá.';
    form.classList.add('is-sent');
    status.hidden = false;
    status.focus();

    track('generate_lead', { method: 'whatsapp_form', project_type: data.tipo, project_phase: data.fase });
  });

  $('[data-form-reset]', form).addEventListener('click', () => {
    form.reset();
    form.classList.remove('is-sent');
    status.hidden = true;
    form.elements.nome.focus();
  });

  fallback.addEventListener('click', () => track('whatsapp_click', { placement: 'form_fallback' }));
}

/* ---------- WhatsApp flutuante ---------- */

function initWidget() {
  const widget = $('[data-wa-widget]');
  if (!widget) return;
  const toggle = $('[data-wa-toggle]', widget);
  const panel = $('[data-wa-panel]', widget);
  const form = $('[data-wa-form]', widget);
  const input = $('input', form);
  const AUTO_KEY = 'ss_wa_auto_opened';
  let interacted = false;

  // Status de atendimento
  const statusWrap = $('[data-wa-status-wrap]', widget);
  const statusText = $('[data-wa-status]', widget);
  const paintStatus = () => {
    const s = officeStatus();
    statusText.textContent = s.text;
    statusWrap.classList.toggle('is-online', s.online);
  };
  paintStatus();
  window.setInterval(paintStatus, 60000);

  const isOpen = () => widget.classList.contains('is-open');
  const setOpen = (open, { focus = true, source = 'click' } = {}) => {
    widget.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar conversa no WhatsApp' : 'Abrir conversa no WhatsApp');
    if (open) {
      paintStatus();
      track('whatsapp_widget_open', { source });
      if (focus) window.setTimeout(() => $('.wa__quick button', panel).focus(), 50);
    }
  };

  toggle.addEventListener('click', () => { interacted = true; setOpen(!isOpen()); });
  $('[data-wa-close]', widget).addEventListener('click', () => { interacted = true; setOpen(false); toggle.focus(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });

  const send = (text, placement) => {
    const url = waLink(text);
    track('whatsapp_click', { placement });
    if (!openWhatsApp(url)) window.location.href = url;
    setOpen(false);
  };

  $$('[data-wa-quick]', widget).forEach((btn) => {
    btn.addEventListener('click', () => send(btn.dataset.waQuick, `widget_${btn.textContent.trim()}`));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    send(text ? `Olá! Vim pelo site. ${text}` : WA_DEFAULT_TEXT, 'widget_texto_livre');
    input.value = '';
  });

  // Recolhe o botão quando o formulário de contato está na tela (não cobre os campos)
  const contactForm = $('[data-contact-form]');
  let formInView = false;
  if (contactForm && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      formInView = entry.isIntersecting;
      widget.classList.toggle('is-tucked', formInView);
      if (formInView && isOpen()) setOpen(false, { focus: false });
    }, { rootMargin: '0px 0px -10% 0px' }).observe(contactForm);
  }

  // Abre sozinho uma única vez: após X segundos ou metade da página
  if (storage.get(AUTO_KEY)) return;

  const blocked = () => {
    const active = document.activeElement;
    return interacted
      || isOpen()
      || formInView
      || document.documentElement.classList.contains('menu-open')
      || document.querySelector('dialog[open]')
      || (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName));
  };

  let timer = null;
  const autoOpen = () => {
    if (storage.get(AUTO_KEY) || blocked()) return;
    storage.set(AUTO_KEY, '1');
    setOpen(true, { focus: false, source: 'auto' });
    window.clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
  };
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY / max >= WA_AUTO_OPEN.scrollRatio) autoOpen();
  };
  timer = window.setTimeout(autoOpen, WA_AUTO_OPEN.delayMs);
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Início ---------- */

initAnalytics();
initStaticBits();
initWhatsAppLinks();
initHeader();
initReveal();
initTimeline();
initProjects();
initVideo();
initContactForm();
initWidget();
