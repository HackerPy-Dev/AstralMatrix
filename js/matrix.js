// ============================================================
// DESTINY MATRIX — расчёт и отрисовка
// ============================================================

function toArcana(n) {
  if (n <= 0) return 22;
  if (n >= 1 && n <= 22) return n;
  while (n > 22) {
    var s = 0;
    var tmp = n;
    while (tmp > 0) { s += tmp % 10; tmp = Math.floor(tmp / 10); }
    n = (s === 0) ? 22 : s;
  }
  return n;
}

function parseDate(dateStr) {
  // Parse as local date to avoid UTC offset shifting the day
  var parts = dateStr.split('-');
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  var d = parseInt(parts[2], 10);
  return { day: d, month: m, year: y };
}

function calcMatrixPositions(dateStr) {
  var p = parseDate(dateStr);
  var day = p.day, month = p.month, year = p.year;

  var ySum = 0;
  String(year).split('').forEach(function(c) { ySum += parseInt(c, 10); });

  var A = toArcana(day);
  var B = toArcana(month);
  var C = toArcana(ySum);
  var D = toArcana(A + B + C);
  var E = toArcana(A + B);
  var F = toArcana(B + C);
  var G = toArcana(C + D);
  var H = toArcana(A + D);
  var Center = toArcana(A + B + C + D);

  var J = toArcana(E + F);
  var K = toArcana(G + H);

  var Purpose1       = toArcana(A + D);
  var Purpose2       = toArcana(B + C);
  var PurposeGeneral = toArcana(Purpose1 + Purpose2);

  var curYear = new Date().getFullYear();
  var age     = curYear - year;
  var YearNum = toArcana(age + toArcana(day + month));

  return { A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H,
           Center: Center, J: J, K: K,
           Purpose1: Purpose1, Purpose2: Purpose2, PurposeGeneral: PurposeGeneral,
           YearNum: YearNum,
           raw: { day: day, month: month, year: year } };
}

// ── Main entry ────────────────────────────────────────────
function calcMatrix() {
  var dateVal = document.getElementById('m-date').value;
  var name    = document.getElementById('m-name').value.trim();
  var errEl   = document.getElementById('m-err');

  if (!dateVal) { errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';

  try {
    var pos = calcMatrixPositions(dateVal);
    var p   = pos.raw;

    // Format date
    var months = ['января','февраля','марта','апреля','мая','июня',
                  'июля','августа','сентября','октября','ноября','декабря'];
    var ds = p.day + ' ' + months[p.month - 1] + ' ' + p.year + ' г.';

    document.getElementById('m-subtitle').textContent = (name ? name + ' · ' : '') + ds;

    // Personal data
    var pdName = name
      ? '<div class="pd-item"><div class="pd-label">Имя</div><div class="pd-val">' + name + '</div></div>'
      : '';
    document.getElementById('m-personal').innerHTML =
      '<div class="pd-item"><div class="pd-label">Дата рождения</div><div class="pd-val">' + ds + '</div></div>'
      + pdName
      + '<div class="pd-item"><div class="pd-label">Центральный аркан</div><div class="pd-val">' + pos.Center + ' — ' + ARCANA[pos.Center].name + ' ' + ARCANA[pos.Center].emoji + '</div></div>'
      + '<div class="pd-item"><div class="pd-label">Личный аркан</div><div class="pd-val">' + pos.A + ' — ' + ARCANA[pos.A].name + '</div></div>'
      + '<div class="pd-item"><div class="pd-label">Кармический аркан</div><div class="pd-val">' + pos.D + ' — ' + ARCANA[pos.D].name + '</div></div>'
      + '<div class="pd-item"><div class="pd-label">Аркан года</div><div class="pd-val">' + pos.YearNum + ' — ' + ARCANA[pos.YearNum].name + '</div></div>';

    // Canvas
    drawMatrix(pos);

    // Inner tabs
    var tabs = [
      { id: 'zones',    label: '🏠 Личные зоны' },
      { id: 'destiny',  label: '🌟 Предназначение' },
      { id: 'karma',    label: '🔗 Кармические задачи' },
      { id: 'relations',label: '💞 Отношения' },
      { id: 'finance',  label: '💰 Финансы' },
      { id: 'health',   label: '🌿 Здоровье' },
      { id: 'year',     label: '📅 Годовой прогноз' },
      { id: 'summary',  label: '📋 Итог' }
    ];
    makeTabs('m-tabs', tabs, 'm-');

    buildMZones(pos, name);
    buildMDestiny(pos, name);
    buildMKarma(pos, name);
    buildMRelations(pos, name);
    buildMFinance(pos, name);
    buildMHealth(pos, name);
    buildMYear(pos, name);
    buildMSummary(pos, name);

    var r = document.getElementById('m-result');
    r.classList.add('vis');
    setTimeout(function() { r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);

  } catch (err) {
    console.error('Matrix error:', err);
    document.getElementById('m-err').style.display = 'block';
    document.getElementById('m-err').textContent = 'Ошибка расчёта. Проверьте дату.';
  }
}

// ── Block builders ────────────────────────────────────────

function buildMZones(pos, name) {
  var n = name || 'Вы';
  var zones = [
    { title: 'Зона комфорта — Характер и таланты',   akey: 'A',      sub: 'Личные качества, врождённые таланты, тип характера' },
    { title: 'Зона социального взаимодействия',       akey: 'B',      sub: 'Стиль общения с окружающим миром' },
    { title: 'Зона рода — Родовая программа',         akey: 'C',      sub: 'Энергия, унаследованная от предков' },
    { title: 'Зона кармической задачи',               akey: 'D',      sub: 'Главная цель воплощения, духовная задача' },
    { title: 'Ресурсная зона',                        akey: 'E',      sub: 'Скрытые таланты и природные ресурсы' },
    { title: 'Зона социальной реализации',            akey: 'F',      sub: 'Место в обществе, карьерный потенциал' },
    { title: 'Зона материального мира',               akey: 'G',      sub: 'Отношения с деньгами и материей' },
    { title: 'Зона духовного развития',               akey: 'H',      sub: 'Путь внутреннего роста и самопознания' },
    { title: 'Центр матрицы — Ядро личности',         akey: 'Center', sub: 'Главная вибрация, суть воплощения' }
  ];

  var html = makeSecHdr('Расшифровка личностных зон', 'Девять ключевых точек вашей матрицы');
  html += '<div class="cards-grid">';
  zones.forEach(function(z) {
    var num = pos[z.akey];
    var a   = ARCANA[num];
    var body = '<b>' + z.sub + ':</b> ' + a.desc
      + '<br><br><b>Сильные стороны:</b> ' + a.strong + '.'
      + '<br><b>Точки роста:</b> ' + a.weak + '.';
    html += makeCard(z.title, a.emoji + ' ' + num + ' — ' + a.name, body,
                     a.kw.map(function(k) { return [k, '']; }), '', num);
  });
  html += '</div>';
  document.getElementById('m-block-zones').innerHTML = html;
}

function buildMDestiny(pos, name) {
  var n  = name || 'Вы';
  var a1 = ARCANA[pos.Purpose1];
  var a2 = ARCANA[pos.Purpose2];
  var ag = ARCANA[pos.PurposeGeneral];

  var html = makeSecHdr('Предназначение', 'Три уровня вашей жизненной миссии');
  html += '<div class="cards-grid">';

  html += makeCard(
    'Личное предназначение',
    a1.emoji + ' ' + pos.Purpose1 + ' — ' + a1.name,
    'То, что нужно реализовать <b>для себя</b>: ' + a1.energy.toLowerCase() + '. ' + a1.desc
    + '<br><br>' + n + ' пришли в этот мир, чтобы освоить энергию ' + a1.name.toLowerCase()
    + ' — научиться ' + a1.strong.toLowerCase() + '.',
    a1.kw.map(function(k) { return [k, 'tl']; }), 'teal', pos.Purpose1
  );
  html += makeCard(
    'Социальное предназначение',
    a2.emoji + ' ' + pos.Purpose2 + ' — ' + a2.name,
    'То, что нужно дать <b>миру и людям</b>: ' + a2.energy.toLowerCase() + '. ' + a2.desc
    + '<br><br>Ваш вклад в общество связан с арканом ' + a2.name
    + ' — умением ' + a2.strong.toLowerCase() + '.',
    a2.kw.map(function(k) { return [k, 'bl']; }), 'blue', pos.Purpose2
  );
  html += makeCard(
    'Общее предназначение — Духовная миссия',
    ag.emoji + ' ' + pos.PurposeGeneral + ' — ' + ag.name,
    'Наивысший уровень реализации — <b>духовная миссия</b>. ' + ag.desc
    + '<br><br>Объединяя личное и социальное, ' + n + ' приходите к вибрации '
    + ag.name.toLowerCase() + ': ' + ag.energy.toLowerCase() + '.',
    ag.kw.map(function(k) { return [k, 'pu']; }), 'purple', pos.PurposeGeneral
  );

  html += '</div>';
  html += makeOverview(
    '<strong>✦ Путь реализации</strong><br><br>'
    + 'Ваше предназначение раскрывается в три этапа. Сначала — освоение личной энергии <em>'
    + pos.Purpose1 + ' — ' + a1.name + '</em>: ' + a1.strong.toLowerCase() + '. '
    + 'Затем — отдача этой силы миру через <em>' + pos.Purpose2 + ' — ' + a2.name + '</em>: '
    + a2.energy.toLowerCase() + '. '
    + 'Вершиной становится интеграция в духовную миссию — аркан <em>'
    + pos.PurposeGeneral + ' — ' + ag.name + '</em>.'
  );
  document.getElementById('m-block-destiny').innerHTML = html;
}

function buildMKarma(pos, name) {
  var n  = name || 'Вы';
  var ac = ARCANA[pos.C];
  var ad = ARCANA[pos.D];
  var ah = ARCANA[pos.H];

  var html = makeSecHdr('Кармические задачи', 'Уроки прошлых воплощений и родовые программы');
  html += '<div class="cards-grid">';

  html += makeCard('Родовая программа', ac.emoji + ' ' + pos.C + ' — ' + ac.name,
    '<b>Что вы унаследовали от рода:</b> ' + ac.energy.toLowerCase() + '. ' + ac.desc
    + '<br><br>Предки передали вам программу: <b>' + ac.strong + '</b>. '
    + 'Теневая сторона: ' + ac.weak.toLowerCase() + '.',
    [['Родовая память','rs'],['Предки','rs'],['Трансформация','tl']], 'rose', pos.C);

  html += makeCard('Кармический долг', ad.emoji + ' ' + pos.D + ' — ' + ad.name,
    '<b>Задача из прошлых воплощений:</b> ' + ad.desc
    + '<br><br>В прошлых жизнях был накоплен опыт ' + ad.energy.toLowerCase()
    + '. В этом воплощении необходимо проработать и завершить эту тему: ' + ad.strong.toLowerCase() + '.',
    [['Карма','pu'],['Прошлые жизни','pu'],['Урок','bl']], 'purple', pos.D);

  html += makeCard('Духовное испытание', ah.emoji + ' ' + pos.H + ' — ' + ah.name,
    '<b>Путь духовного роста:</b> ' + ah.desc
    + '<br><br>Главное испытание — тема ' + ah.energy.toLowerCase()
    + '. Преодоление открывает: ' + ah.strong.toLowerCase()
    + '. Уклонение проявляется как: ' + ah.weak.toLowerCase() + '.',
    [['Испытание',''],['Рост','tl'],['Инициация','']], '', pos.H);

  html += '</div>';
  html += makeOverview(
    '<strong>✦ Кармические «хвосты» и как с ними работать</strong><br><br>'
    + 'Родовая программа аркана <em>' + pos.C + ' — ' + ac.name + '</em> — это не проклятие, а материал для работы. '
    + 'Осознанное отношение к родовым паттернам (' + ac.energy.toLowerCase() + ') освобождает огромный ресурс.<br><br>'
    + 'Кармический долг (<em>' + pos.D + ' — ' + ad.name + '</em>) указывает на темы, которые необходимо завершить. '
    + 'Чем более осознанно вы проходите испытание <em>' + ah.name + '</em>, тем быстрее открываются новые возможности.'
  );
  document.getElementById('m-block-karma').innerHTML = html;
}

function buildMRelations(pos, name) {
  var n  = name || 'Вы';
  var ae = ARCANA[pos.E];
  var ab = ARCANA[pos.B];
  var aj = ARCANA[pos.J];

  var html = makeSecHdr('Отношения и партнёрство', 'Ваша любовная вибрация и тип партнёра');
  html += '<div class="cards-grid">';

  html += makeCard('Стиль любви', ab.emoji + ' ' + pos.B + ' — ' + ab.name,
    '<b>Как вы взаимодействуете в отношениях:</b> ' + ab.desc
    + '<br><br>Ваш любовный язык связан с энергией ' + ab.energy.toLowerCase()
    + '. Вы даёте партнёру: ' + ab.strong.toLowerCase()
    + '. Зона роста: ' + ab.weak.toLowerCase() + '.',
    [['Любовь','rs'],['Стиль','']], 'rose');

  html += makeCard('Ресурс в отношениях', ae.emoji + ' ' + pos.E + ' — ' + ae.name,
    '<b>Что вы приносите в пару:</b> ' + ae.desc
    + '<br><br>Ваш главный дар в отношениях — ' + ae.energy.toLowerCase()
    + ' и ' + ae.strong.toLowerCase() + '.',
    [['Ресурс','tl'],['Дар','tl']], 'teal');

  html += makeCard('Тип идеального партнёра', aj.emoji + ' ' + pos.J + ' — ' + aj.name,
    '<b>Кто вам нужен для гармонии:</b> ' + aj.desc
    + '<br><br>Партнёр с энергией ' + aj.name.toLowerCase()
    + ' — ' + aj.energy.toLowerCase() + ' — станет резонансным дополнением.',
    [['Партнёр','bl'],['Совместимость','bl']], 'blue');

  html += '</div>';
  html += makeOverview(
    '<strong>✦ Сценарии любви и брака</strong><br><br>'
    + 'В отношениях ' + n + ' проявляете энергию <em>' + ab.name + '</em>: ' + ab.desc + ' '
    + 'Идеальный партнёр дополняет вас энергией <em>' + aj.name + '</em>, '
    + 'помогая развивать ' + aj.strong.toLowerCase() + '.<br><br>'
    + 'Избегайте повторения кармического сценария аркана <em>'
    + pos.D + ' — ' + ARCANA[pos.D].name + '</em> — это уже пройденные уроки.'
  );
  document.getElementById('m-block-relations').innerHTML = html;
}

function buildMFinance(pos, name) {
  var n  = name || 'Вы';
  var ag = ARCANA[pos.G];
  var ak = ARCANA[pos.K];
  var ac = ARCANA[pos.Center];

  var html = makeSecHdr('Финансовый блок', 'Ваши потоки дохода и денежная программа');
  html += '<div class="cards-grid">';

  html += makeCard('Денежная программа', ag.emoji + ' ' + pos.G + ' — ' + ag.name,
    '<b>Как деньги приходят в вашу жизнь:</b> ' + ag.money
    + '<br><br>' + ag.desc
    + '<br><br>Деньги любят вас, когда вы действуете через ' + ag.strong.toLowerCase() + '.',
    [['Доход','tl'],['Поток','tl'],['Ресурс','']], 'teal');

  html += makeCard('Финансовые риски', ak.emoji + ' ' + pos.K + ' — ' + ak.name,
    '<b>Зоны финансовых блоков:</b> ' + ak.weak
    + '<br><br>Аркан ' + ak.name + ' указывает на риск: ' + ak.desc.toLowerCase()
    + ' Когда эта энергия в тени, деньги утекают через ' + ak.weak.toLowerCase() + '.',
    [['Риск','rs'],['Блок','rs'],['Осторожность','']], 'rose');

  html += makeCard('Предрасположенность к богатству', ac.emoji + ' ' + pos.Center + ' — ' + ac.name,
    '<b>Центральный поток благополучия:</b> ' + ac.money
    + '<br><br>Когда центральная энергия <em>' + ac.name + '</em> раскрыта, открывается доступ к изобилию.',
    [['Изобилие','bl'],['Потенциал','bl'],['Богатство','']], 'blue');

  html += '</div>';
  html += makeOverview(
    '<strong>✦ Финансовые рекомендации</strong><br><br>'
    + 'Ваша денежная программа работает через аркан <em>' + pos.G + ' — ' + ag.name + '</em>: '
    + ag.money.toLowerCase() + '<br><br>'
    + 'Главные риски связаны с арканом <em>' + pos.K + ' — ' + ak.name + '</em> — '
    + ak.weak.toLowerCase() + '. '
    + 'Для их минимизации развивайте: ' + ak.strong.toLowerCase() + '.<br><br>'
    + '<strong>Практические шаги:</strong> определите основную сферу дохода (резонирует с темой '
    + ag.name + '), создайте финансовую подушку (3–6 месяцев расходов).'
  );
  document.getElementById('m-block-finance').innerHTML = html;
}

function buildMHealth(pos, name) {
  var chakras = [
    { name: 'Муладхара',   color: '#e53935', arcKey: 'D',      desc: 'Выживание, безопасность, физическая сила' },
    { name: 'Свадхистхана',color: '#f57c00', arcKey: 'C',      desc: 'Сексуальность, творчество, эмоции' },
    { name: 'Манипура',    color: '#fdd835', arcKey: 'A',      desc: 'Воля, самооценка, личная сила' },
    { name: 'Анахата',     color: '#43a047', arcKey: 'E',      desc: 'Любовь, принятие, исцеление' },
    { name: 'Вишудха',     color: '#1e88e5', arcKey: 'B',      desc: 'Коммуникация, самовыражение' },
    { name: 'Аджна',       color: '#5e35b1', arcKey: 'H',      desc: 'Интуиция, ясновидение, мудрость' },
    { name: 'Сахасрара',   color: '#9c27b0', arcKey: 'Center', desc: 'Связь с высшим, духовность' }
  ];

  var html = makeSecHdr('Здоровье и энергетические центры', 'Чакровая карта по арканам');
  html += '<div class="cards-grid" style="grid-template-columns:1fr">';

  chakras.forEach(function(ch, i) {
    var arcNum = pos[ch.arcKey];
    var a      = ARCANA[arcNum];
    var level  = Math.min(95, Math.max(30, 40 + arcNum * 2.5));
    var delay  = (i * 0.07).toFixed(2);

    html += '<div class="card" style="animation-delay:' + delay + 's;display:flex;align-items:flex-start;gap:18px">'
      + '<div style="flex-shrink:0">'
      +   '<div style="width:44px;height:44px;border-radius:50%;background:' + ch.color + '22;border:2px solid ' + ch.color + ';display:flex;align-items:center;justify-content:center;font-size:1.2rem">' + a.emoji + '</div>'
      + '</div>'
      + '<div style="flex:1">'
      +   '<div class="card-label">' + ch.name + ' — ' + ch.desc + '</div>'
      +   '<div class="card-title" style="font-size:.92rem">' + arcNum + ' — ' + a.name + '</div>'
      +   '<div class="chakra-bar-wrap" style="margin:8px 0">'
      +     '<div class="chakra-bar" style="width:' + level + '%;background:' + ch.color + '"></div>'
      +   '</div>'
      +   '<div class="card-body"><b>Слабые места:</b> ' + a.health + '. <b>Рекомендация:</b> ' + a.strong.split(',')[0] + '.</div>'
      + '</div>'
      + '</div>';
  });

  html += '</div>';
  html += makeOverview(
    '<strong>✦ Общая картина здоровья</strong><br><br>'
    + 'Самые нагруженные зоны — арканы <em>' + pos.D + ' — ' + ARCANA[pos.D].name + '</em> и <em>'
    + pos.H + ' — ' + ARCANA[pos.H].name + '</em>. '
    + 'Физическое здоровье напрямую связано с тем, насколько честно вы проживаете темы этих арканов.<br><br>'
    + 'Блокировка <em>' + ARCANA[pos.C].name + '</em> (родовая программа) может проявляться через хронические состояния по линии '
    + ARCANA[pos.C].health + '. '
    + 'Рекомендации: практики осознанности, работа с телом, психосоматический подход к симптомам.'
  );
  document.getElementById('m-block-health').innerHTML = html;
}

function buildMYear(pos, name) {
  var n      = name || 'Вы';
  var ya     = ARCANA[pos.YearNum];
  var curYear = new Date().getFullYear();

  var html = makeSecHdr('Годовой прогноз — ' + curYear, 'Расчёт текущего года по матрице');

  html += '<div class="forecast-block">'
    + '<div class="forecast-period">Текущий год · ' + curYear + '</div>'
    + '<div class="forecast-title">' + ya.emoji + ' Аркан года: ' + pos.YearNum + ' — ' + ya.name + '</div>'
    + '<div class="forecast-body">'
    +   'Этот год проходит под вибрацией <b>' + ya.name + '</b>: ' + ya.energy.toLowerCase() + '. ' + ya.desc
    +   '<br><br><b>Главная тема года:</b> ' + ya.strong + '.'
    +   '<br><b>Вызовы:</b> ' + ya.weak + '.'
    +   '<br><b>Финансовая активность:</b> ' + ya.money + '.'
    +   '<br><b>Здоровье:</b> уделите внимание ' + ya.health + '.'
    + '</div></div>';

  html += '<div class="cards-grid">'
    + makeCard('I квартал — Зима/Весна', 'Начало цикла',
        'Заложите фундамент темы года — <b>' + ya.name + '</b>. Лучшее время для планирования в русле ' + ya.energy.toLowerCase() + '.',
        [['Начало','tl'],['Планирование','']], 'teal')
    + makeCard('II квартал — Весна/Лето', 'Развитие',
        'Активная фаза. Применяйте ресурс <b>' + ya.name + '</b> на практике. Возможны яркие события, связанные с ' + ya.strong.toLowerCase() + '.',
        [['Активность','bl'],['Рост','']], 'blue')
    + makeCard('III квартал — Лето/Осень', 'Кульминация',
        'Пик года. Главные результаты. Будьте внимательны к рискам <b>' + ya.name + '</b>: ' + ya.weak.toLowerCase() + '.',
        [['Пик',''],['Итоги','']], '')
    + makeCard('IV квартал — Осень/Зима', 'Завершение',
        'Интегрируйте опыт ' + ya.name.toLowerCase() + ' и готовьтесь к следующему циклу.',
        [['Интеграция','pu'],['Подведение итогов','']], 'purple')
    + '</div>';

  document.getElementById('m-block-year').innerHTML = html;
}

function buildMSummary(pos, name) {
  var n  = name || 'Вы';
  var ac = ARCANA[pos.Center];
  var aa = ARCANA[pos.A];
  var ad = ARCANA[pos.D];
  var ae = ARCANA[pos.E];
  var ah = ARCANA[pos.H];

  var html = makeSecHdr('Итоговые рекомендации', 'Ваша персональная карта развития');
  html += '<div class="summary-box">'
    + '<div class="summary-title">✦ Ключевые выводы ✦</div>'
    + '<div class="summary-body">'
    +   '<b>Ядро личности (' + pos.Center + ' — ' + ac.name + '):</b> ' + ac.desc + '<br><br>'
    +   '<b>Природные таланты (' + pos.A + ' — ' + aa.name + '):</b> ' + aa.strong + '.<br><br>'
    +   '<b>Кармическая задача (' + pos.D + ' — ' + ad.name + '):</b> ' + ad.desc + '<br><br>'
    +   '<b>Что развивать:</b> ' + aa.strong.split(',')[0] + ', ' + ac.strong.split(',')[0]
    +   ', работа с темой ' + ah.name.toLowerCase() + '.<br><br>'
    +   '<b>От чего отказаться:</b> ' + aa.weak.toLowerCase() + ', ' + ad.weak.toLowerCase() + '.<br><br>'
    +   '<b>Направления для гармонизации:</b> психологическая работа с арканом '
    +   ad.name + ', практики по теме ' + ac.name + ', развитие ресурса ' + ae.name.toLowerCase() + '.'
    + '</div>'
    + '</div>';

  document.getElementById('m-block-summary').innerHTML = html;
}

// ── Canvas rendering ─────────────────────────────────────

function drawMatrix(pos) {
  var canvas = document.getElementById('matrixCanvas');
  var ctx    = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var cx = W / 2, cy = H / 2;
  var R = 200;

  ctx.clearRect(0, 0, W, H);

  // Background glow
  var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R + 60);
  grd.addColorStop(0, 'rgba(139,92,246,.07)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Outer ring
  ctx.beginPath(); ctx.arc(cx, cy, R + 28, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(201,168,76,.15)'; ctx.lineWidth = 1; ctx.stroke();

  // 8 outer points (octagram)
  var angleDeg = [-135, -90, -45, 0, 45, 90, 135, 180];
  var keys     = ['A',   'E',  'B', 'F','C', 'G', 'D',  'H'];
  var pts = angleDeg.map(function(a) {
    var r = a * Math.PI / 180;
    return { x: cx + R * Math.cos(r), y: cy + R * Math.sin(r) };
  });

  // Two interlocked squares
  for (var offset = 0; offset < 2; offset++) {
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var pt = pts[offset + i * 2];
      if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(201,168,76,.3)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // Radial lines to center
  pts.forEach(function(pt) {
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = 'rgba(201,168,76,.08)'; ctx.lineWidth = 1; ctx.stroke();
  });

  // Inner circle
  ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(139,92,246,.35)'; ctx.lineWidth = 1; ctx.stroke();

  // Node drawing helper
  function drawNode(x, y, num, isCenter) {
    var nr = isCenter ? 34 : 27;
    var gc = ctx.createRadialGradient(x, y, 0, x, y, nr + 12);
    gc.addColorStop(0, isCenter ? 'rgba(201,168,76,.45)' : 'rgba(139,92,246,.35)');
    gc.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gc;
    ctx.beginPath(); ctx.arc(x, y, nr + 12, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.arc(x, y, nr, 0, Math.PI * 2);
    ctx.fillStyle = isCenter ? 'rgba(60,40,10,.92)' : 'rgba(20,15,40,.92)'; ctx.fill();
    ctx.strokeStyle = isCenter ? '#c9a84c' : 'rgba(139,92,246,.7)';
    ctx.lineWidth   = isCenter ? 2 : 1.5; ctx.stroke();

    ctx.fillStyle = isCenter ? '#f0d080' : '#c084fc';
    ctx.font = 'bold ' + (isCenter ? 20 : 16) + 'px Cinzel, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(num, x, y);

    var arcName = ARCANA[num].name;
    var textY   = (y > cy + 10) ? y + nr + 15 : y - nr - 7;
    ctx.fillStyle = 'rgba(240,220,160,.65)';
    ctx.font = '9px Georgia, serif';
    ctx.fillText(arcName, x, textY);
  }

  pts.forEach(function(pt, i) { drawNode(pt.x, pt.y, pos[keys[i]], false); });
  drawNode(cx, cy, pos.Center, true);

  ctx.fillStyle = 'rgba(201,168,76,.55)';
  ctx.font = '11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(ARCANA[pos.Center].name, cx, cy + 50);
}
