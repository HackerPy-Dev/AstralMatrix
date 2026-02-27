// ============================================================
// UI HELPERS
// ============================================================

function switchTab(t) {
  document.querySelectorAll('.tab-btn').forEach(function(b, i) {
    b.classList.toggle('active', (i === 0 && t === 'matrix') || (i === 1 && t === 'natal'));
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  document.getElementById('tab-' + t).classList.add('active');
}

function makeTabs(containerId, blocks, prefix) {
  var c = document.getElementById(containerId);
  c.innerHTML = '';
  blocks.forEach(function(b, i) {
    var btn = document.createElement('button');
    btn.className = 'bt' + (i === 0 ? ' ba' : '');
    btn.textContent = b.label;
    (function(blockId) {
      btn.addEventListener('click', function() {
        c.querySelectorAll('.bt').forEach(function(x) { x.classList.remove('ba'); });
        btn.classList.add('ba');
        document.querySelectorAll('[id^="' + prefix + 'block-"]').forEach(function(x) {
          x.classList.remove('bvis');
        });
        document.getElementById(prefix + 'block-' + blockId).classList.add('bvis');
      });
    })(b.id);
    c.appendChild(btn);
  });
}

// ── HTML builders ──────────────────────────────────────────

function makeCard(label, title, body, tags, accent, num) {
  tags  = tags  || [];
  accent = accent || '';
  num   = num   || '';

  var tagsHtml = tags.map(function(tag) {
    var tx = tag[0], cl = tag[1] || '';
    return '<span class="tag ' + cl + '">' + tx + '</span>';
  }).join('');

  var numEl   = num    ? '<div class="card-num">'  + num   + '</div>' : '';
  var tagsEl  = tagsHtml ? '<div class="tags">' + tagsHtml + '</div>' : '';
  var accentClass = accent ? ' accent-' + accent : '';
  var delay = (Math.random() * 0.3).toFixed(2);

  return '<div class="card' + accentClass + '" style="animation-delay:' + delay + 's">'
    + numEl
    + '<div class="card-label">' + label + '</div>'
    + '<div class="card-title">' + title + '</div>'
    + '<div class="card-body">'  + body  + '</div>'
    + tagsEl
    + '</div>';
}

function makeOverview(html) {
  return '<div class="overview">' + html + '</div>';
}

function makeSecHdr(title, sub) {
  var subEl = sub ? '<p>' + sub + '</p>' : '';
  return '<div class="sec-hdr"><h2>' + title + '</h2>' + subEl + '</div>';
}

// ── Hex → rgba helper ──────────────────────────────────────
function hexA(hex, a) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

// ── Statics ────────────────────────────────────────────────
function getElementClass(el) {
  var map = { 'Огонь': 'elem-fire', 'Земля': 'elem-earth', 'Воздух': 'elem-air', 'Вода': 'elem-water' };
  return map[el] || '';
}

function getElementDesc(el) {
  var d = {
    'Огонь':  'Страсть, энтузиазм, лидерство и творческий порыв — ваши ведущие качества. Вы зажигаете других и любите быть в движении.',
    'Земля':  'Практичность, надёжность и материальное мышление. Вы строите прочные основы и цените стабильность.',
    'Воздух': 'Интеллект, коммуникации и социальность. Вы живёте идеями и связями, мыслите глобально.',
    'Вода':   'Интуиция, глубина эмоций и сострадание. Вы тонко чувствуете других и живёте внутренним миром.'
  };
  return d[el] || '';
}

function getElementBodyDesc(el) {
  var d = {
    'Огонь':  'активную энергетику, стройность, горящий взгляд',
    'Земля':  'плотное телосложение, спокойствие, основательность',
    'Воздух': 'лёгкость, подвижность, живые глаза',
    'Вода':   'мягкость черт, выразительность, округлость форм'
  };
  return d[el] || '';
}

function getHealthTip(el) {
  var d = {
    'Огонь':  'Избегайте перегрева и перегрузок. Умеренная физическая активность, закаливание.',
    'Земля':  'Регулярное питание, массаж, работа с телом. Избегайте переедания и малоподвижности.',
    'Воздух': 'Дыхательные практики, прогулки, медитация. Следите за нервной системой.',
    'Вода':   'Водные практики, плавание. Работа с эмоциями. Избегайте сырости и переохлаждения.'
  };
  return d[el] || '';
}

function getElementPractice(el) {
  var d = {
    'Огонь':  'спорт, танцы, солнечные практики',
    'Земля':  'йога, садоводство, контакт с природой',
    'Воздух': 'дыхательные техники, медитация, общение',
    'Вода':   'плавание, медитация, работа с эмоциями'
  };
  return d[el] || '';
}
