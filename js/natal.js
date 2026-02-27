// ============================================================
// NATAL CHART — расчёт и отрисовка
// ============================================================

// ── Astro math helpers ────────────────────────────────────

function julianDay(y, m, d) {
  if (m <= 2) { y--; m += 12; }
  var A = Math.floor(y / 100);
  var B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function getPlanetLon(planet, y, m, d, h) {
  h = h || 12;
  var jd = julianDay(y, m, d) + (h / 24) - 2451545.0;
  var cfg = {
    moon:    { ref: 218.32,  speed: 13.176396 },
    mercury: { ref: 252.2,   speed: 360 / (0.240846 * 365.25) },
    venus:   { ref: 181.98,  speed: 360 / (0.615198 * 365.25) },
    mars:    { ref: 355.43,  speed: 360 / (1.88085  * 365.25) },
    jupiter: { ref: 34.35,   speed: 360 / (11.862   * 365.25) },
    saturn:  { ref: 50.08,   speed: 360 / (29.457   * 365.25) },
    uranus:  { ref: 314.06,  speed: 360 / (84.011   * 365.25) },
    neptune: { ref: 304.35,  speed: 360 / (164.8    * 365.25) },
    pluto:   { ref: 238.92,  speed: 360 / (248.09   * 365.25) }
  };
  if (!cfg[planet]) return 0;
  return ((cfg[planet].ref + cfg[planet].speed * jd) % 360 + 360) % 360;
}

function lonToSign(lon) {
  return ZODIAC[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

function getSunSign(m, d) {
  for (var i = 0; i < ZODIAC.length; i++) {
    var z = ZODIAC[i];
    var sm = z.s[0], sd = z.s[1], em = z.e[0], ed = z.e[1];
    if (sm > em) {
      if (m === sm && d >= sd) return z;
      if (m === em && d <= ed) return z;
    } else {
      if ((m === sm && d >= sd) || (m === em && d <= ed) || (m > sm && m < em)) return z;
    }
  }
  return ZODIAC[9]; // Козерог fallback
}

function getAscendant(h, doy, lat) {
  var RAMC = (doy / 365.25) * 360 + h * 15 - 90;
  var e    = 23.45 * Math.PI / 180;
  var rr   = ((RAMC % 360 + 360) % 360) * Math.PI / 180;
  var lr   = lat * Math.PI / 180;
  var lon  = Math.atan2(Math.cos(rr), -(Math.sin(rr) * Math.cos(e) + Math.tan(lr) * Math.sin(e))) * 180 / Math.PI;
  lon = ((lon % 360) + 360) % 360;
  return ZODIAC[Math.floor(lon / 30)];
}

function getHouseSign(ascIdx, houseNum) {
  return ZODIAC[(ascIdx + houseNum - 1) % 12];
}

// ── Main entry ────────────────────────────────────────────

function calcNatal() {
  var dateVal  = document.getElementById('n-date').value;
  var hourVal  = parseFloat(document.getElementById('n-time').value) || 12;
  var lat      = parseFloat(document.getElementById('n-lat').value) || 55.75;
  var lon      = parseFloat(document.getElementById('n-lon').value) || 37.62;
  var cityName = document.getElementById('n-city').value || 'Москва';
  var errEl    = document.getElementById('n-err');

  if (!dateVal) { errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';

  try {
    // Parse date as local (avoid UTC shift)
    var parts = dateVal.split('-');
    var Y = parseInt(parts[0], 10);
    var M = parseInt(parts[1], 10);
    var D = parseInt(parts[2], 10);

    var hour = (hourVal === 0.5) ? 0 : hourVal;
    var doy  = Math.round((new Date(Y, M - 1, D) - new Date(Y, 0, 0)) / 86400000);
    var tz   = Math.round(lon / 15);

    // Planets
    var sunSign  = getSunSign(M, D);
    var moonLon  = getPlanetLon('moon',    Y, M, D, hour);
    var mercLon  = getPlanetLon('mercury', Y, M, D, hour);
    var venLon   = getPlanetLon('venus',   Y, M, D, hour);
    var marLon   = getPlanetLon('mars',    Y, M, D, hour);
    var jupLon   = getPlanetLon('jupiter', Y, M, D, hour);
    var satLon   = getPlanetLon('saturn',  Y, M, D, hour);
    var urLon    = getPlanetLon('uranus',  Y, M, D, hour);
    var nepLon   = getPlanetLon('neptune', Y, M, D, hour);
    var plLon    = getPlanetLon('pluto',   Y, M, D, hour);

    // Lunar node (retrograde, ~18.6yr cycle)
    var jd0      = julianDay(Y, M, D) - 2451545;
    var nodeLon  = ((125.04 - 0.052954 * jd0) % 360 + 360) % 360;
    var lilitLon = ((83.35  + 40.6903 * jd0 / 365.25) % 360 + 360) % 360;

    var moonSign  = lonToSign(moonLon);
    var ascSign   = getAscendant(hour, doy, lat);
    var ascIdx    = ZODIAC.indexOf(ascSign);
    var nodeSign  = lonToSign(nodeLon);
    var southNode = lonToSign((nodeLon + 180) % 360);
    var lilitSign = lonToSign(lilitLon);

    var houses = [];
    for (var i = 0; i < 12; i++) houses.push(getHouseSign(ascIdx, i + 1));

    var planets = [
      { name: 'Солнце',      sym: '☉', sign: sunSign,         color: '#FFD700' },
      { name: 'Луна',        sym: '☽', sign: moonSign,        color: '#C0C0C0' },
      { name: 'Асцендент',   sym: 'AC',sign: ascSign,         color: '#FF6B6B' },
      { name: 'Меркурий',    sym: '☿', sign: lonToSign(mercLon),color:'#90EE90' },
      { name: 'Венера',      sym: '♀', sign: lonToSign(venLon), color:'#FFB7C5' },
      { name: 'Марс',        sym: '♂', sign: lonToSign(marLon), color:'#FF4500' },
      { name: 'Юпитер',      sym: '♃', sign: lonToSign(jupLon), color:'#87CEEB' },
      { name: 'Сатурн',      sym: '♄', sign: lonToSign(satLon), color:'#DDA0DD' },
      { name: 'Уран',        sym: '♅', sign: lonToSign(urLon),  color:'#7FFFD4' },
      { name: 'Нептун',      sym: '♆', sign: lonToSign(nepLon), color:'#6495ED' },
      { name: 'Плутон',      sym: '♇', sign: lonToSign(plLon),  color:'#BC8F8F' },
      { name: 'Сев. Узел ☊', sym: '☊', sign: nodeSign,         color:'#c9a84c' },
      { name: 'Лилит',       sym: '⚸', sign: lilitSign,        color:'#e879a0' }
    ];

    // Format date
    var months = ['января','февраля','марта','апреля','мая','июня',
                  'июля','августа','сентября','октября','ноября','декабря'];
    var ds = D + ' ' + months[M - 1] + ' ' + Y + ' г.';

    var timeLabels = {
      '0': 'Ночь (~00:00)', '6': 'Утро (~6:00)', '9': 'Утро (~9:00)',
      '12': 'День (~12:00)', '15': 'День (~15:00)', '18': 'Вечер (~18:00)',
      '21': 'Вечер (~21:00)', '0.5': 'Ночь (~00:00)', '3': 'Ночь (~3:00)'
    };
    var timeLabel = timeLabels[String(document.getElementById('n-time').value)] || 'Полдень';

    document.getElementById('n-subtitle').textContent = ds + ' · ' + timeLabel + ' · ' + cityName;

    // Personal data
    document.getElementById('n-personal').innerHTML =
      '<div class="pd-item"><div class="pd-label">Дата рождения</div><div class="pd-val">' + ds + '</div></div>'
      + '<div class="pd-item"><div class="pd-label">Город / Координаты</div><div class="pd-val">' + cityName + ' · ' + lat.toFixed(2) + '°N ' + (lon >= 0 ? '+' : '') + lon.toFixed(2) + '°</div></div>'
      + '<div class="pd-item"><div class="pd-label">Солнечный знак</div><div class="pd-val">' + sunSign.sym + ' ' + sunSign.name + ' (' + sunSign.el + ')</div></div>'
      + '<div class="pd-item"><div class="pd-label">Лунный знак</div><div class="pd-val">' + moonSign.sym + ' ' + moonSign.name + ' (' + moonSign.el + ')</div></div>'
      + '<div class="pd-item"><div class="pd-label">Асцендент</div><div class="pd-val">' + ascSign.sym + ' ' + ascSign.name + '</div></div>'
      + '<div class="pd-item"><div class="pd-label">Часовой пояс</div><div class="pd-val">UTC' + (tz >= 0 ? '+' : '') + tz + '</div></div>';

    // Canvas
    drawNatal(planets, ascSign);

    // Tabs
    var tabs = [
      { id: 'portrait',  label: '🪞 Психологический портрет' },
      { id: 'social',    label: '🏛️ Социальная реализация' },
      { id: 'love',      label: '💞 Отношения и любовь' },
      { id: 'health',    label: '🌿 Здоровье' },
      { id: 'karma',     label: '🔮 Кармические задачи' },
      { id: 'forecast',  label: '📅 Прогностика' },
      { id: 'summary',   label: '📋 Резюме' }
    ];
    makeTabs('n-tabs', tabs, 'n-');

    buildNPortrait(sunSign, moonSign, ascSign, houses, planets);
    buildNSocial(sunSign, houses, planets, ascIdx);
    buildNLove(planets, houses, ascIdx);
    buildNHealth(sunSign, moonSign, ascSign, houses);
    buildNKarma(nodeSign, southNode, lilitSign, houses, ascIdx);
    buildNForecast(sunSign, Y);
    buildNSummary(sunSign, moonSign, ascSign, nodeSign);

    var r = document.getElementById('n-result');
    r.classList.add('vis');
    setTimeout(function() { r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);

  } catch (err) {
    console.error('Natal error:', err);
    errEl.style.display = 'block';
    errEl.textContent = 'Ошибка расчёта. Проверьте данные.';
  }
}

// ── Block builders ────────────────────────────────────────

function buildNPortrait(sun, moon, asc, houses, planets) {
  var elCounts = { 'Огонь': 0, 'Земля': 0, 'Воздух': 0, 'Вода': 0 };
  planets.slice(0, 8).forEach(function(p) {
    if (p.sign && p.sign.el) elCounts[p.sign.el]++;
  });
  var domEl = Object.keys(elCounts).sort(function(a, b) { return elCounts[b] - elCounts[a]; })[0];

  var elHtml = Object.keys(elCounts).map(function(el) {
    return '<div class="elem-badge ' + getElementClass(el) + '">' + el + ' ×' + elCounts[el] + '</div>';
  }).join('');

  var html = makeSecHdr('Психологический портрет', 'Солнце, Луна, Асцендент и темперамент');
  html += '<div class="elements-row">' + elHtml + '</div>';

  html += makeOverview(
    '<strong>✦ Характер через три кита гороскопа</strong><br><br>'
    + '<strong>☉ Солнце в ' + sun.name + ' (' + sun.el + '):</strong> ' + sun.desc
    + ' Жизненный путь — ' + sun.social.toLowerCase() + '.<br>'
    + '<em>Эмоциональный профиль:</em> ' + sun.emotion.toLowerCase() + '.<br><br>'
    + '<strong>☽ Луна в ' + moon.name + ' (' + moon.el + '):</strong> '
    + 'Внутренний мир, эмоции и подсознательные реакции. ' + moon.emotion + '. '
    + 'Для равновесия вам нужно: ' + moon.love.toLowerCase() + '.<br><br>'
    + '<strong>AC Асцендент в ' + asc.name + ' (' + asc.el + '):</strong> '
    + 'Ваша маска для мира, первое впечатление. ' + asc.desc + '<br><br>'
    + '<strong>Доминирующая стихия — ' + domEl + ':</strong> ' + getElementDesc(domEl)
  );

  html += '<div class="cards-grid">'
    + makeCard('☉ Солнечный знак — Ваше «Я»', sun.sym + ' ' + sun.name,
        sun.desc + '<br><br><b>Темперамент:</b> ' + sun.emotion + '.<br><b>Сфера реализации:</b> ' + sun.social + '.<br><b>В любви:</b> ' + sun.love + '.',
        [[sun.el,''],['Эго','tl'],[sun.qu,'']], 'teal')
    + makeCard('☽ Луна — Эмоции и подсознание', moon.sym + ' ' + moon.name,
        '<b>Эмоциональный мир:</b> ' + moon.emotion + '.<br><br>'
        + 'Луна в ' + moon.name + ': в детстве вы усвоили паттерн — <em>' + moon.love + '</em>. Привычные реакции имеют природу стихии ' + moon.el.toLowerCase() + '.',
        [[moon.el,''],['Подсознание','bl'],['Привычки','bl']], 'blue')
    + makeCard('AC Асцендент — Маска и облик', asc.sym + ' ' + asc.name,
        'Первое впечатление связано с энергией ' + asc.name + ': ' + asc.desc
        + '<br><br>Ваша внешность несёт черты стихии ' + asc.el.toLowerCase() + ' — ' + getElementBodyDesc(asc.el) + '.',
        [[asc.el,''],['Облик',''],['Первый контакт','rs']], 'rose')
    + makeCard('💪 Сильные стороны характера', 'Природные дары',
        '<b>По Солнцу (' + sun.name + '):</b> ' + sun.emotion.split(',')[0] + '.<br>'
        + '<b>По Луне (' + moon.name + '):</b> ' + moon.emotion.split(',')[0] + '.<br>'
        + '<b>По Асценденту (' + asc.name + '):</b> ' + asc.desc.split('.')[0] + '.',
        [['Ресурс','tl'],['Дары','tl']], 'teal')
    + makeCard('🌱 Зоны роста', 'Точки развития',
        '<b>По Солнцу:</b> преодоление — ' + (sun.emotion.split(',').slice(-1)[0] || '').trim().toLowerCase() + '.<br>'
        + '<b>По Луне:</b> работа с детскими паттернами: ' + (moon.emotion.split(',').slice(-1)[0] || '').trim().toLowerCase() + '.<br>'
        + '<b>По Асценденту:</b> принятие своей природы ' + asc.name.toLowerCase() + '.',
        [['Рост',''],['Самопознание','']], '')
    + '</div>';

  document.getElementById('n-block-portrait').innerHTML = html;
}

function buildNSocial(sun, houses, planets, ascIdx) {
  var h10 = getHouseSign(ascIdx, 10);
  var h2  = getHouseSign(ascIdx, 2);
  var h6  = getHouseSign(ascIdx, 6);
  var h5  = getHouseSign(ascIdx, 5);
  var venus   = null, mercury = null;
  planets.forEach(function(p) {
    if (p.name === 'Венера')   venus   = p;
    if (p.name === 'Меркурий') mercury = p;
  });

  var html = makeSecHdr('Социальная реализация', 'Карьера, деньги и таланты');
  html += makeOverview(
    '<strong>✦ Призвание и место в мире</strong><br><br>'
    + '10-й дом (МС) — карьерный указатель — в знаке <strong>' + h10.name + '</strong>: ' + h10.desc
    + ' Призвание: <em>' + h10.social + '</em>.<br><br>'
    + 'Финансовый потенциал (2-й дом, ' + h2.name + '): деньги приходят через '
    + h2.el.toLowerCase() + ' — ' + h2.emotion.split(',')[0].toLowerCase() + '.<br><br>'
    + 'Сфера работы и здоровья (6-й дом, ' + h6.name + '): ' + h6.desc
  );

  html += '<div class="cards-grid">'
    + makeCard('🏛️ 10-й дом (МС) — Карьера и статус', h10.sym + ' ' + h10.name,
        h10.desc + '<br><br><b>Сферы призвания:</b> ' + h10.social + '.<br><b>Стиль лидерства:</b> ' + h10.emotion.split(',')[0] + '.',
        [[h10.el,''],['Карьера','tl'],['Статус','tl']], 'teal')
    + makeCard('💰 2-й дом — Деньги и ценности', h2.sym + ' ' + h2.name,
        '<b>Как вы зарабатываете:</b> через ' + h2.el.toLowerCase() + ' — ' + h2.emotion.split(',')[0].toLowerCase() + '.<br><br>'
        + '<b>Финансовый стиль:</b> ' + h2.desc + '<br><b>Что цените:</b> ' + h2.love.toLowerCase() + '.',
        [[h2.el,''],['Финансы',''],['Доход','']], '')
    + makeCard('⚙️ 6-й дом — Работа и обязанности', h6.sym + ' ' + h6.name,
        '<b>Стиль повседневной работы:</b> ' + h6.desc + '<br><br>'
        + '<b>Отношение к обязанностям:</b> ' + h6.emotion.split(',')[0].toLowerCase() + '.<br>'
        + '<b>Здоровье в труде:</b> ' + h6.health + '.',
        [[h6.el,''],['Труд',''],['Обязанности','']], '');

  if (venus) {
    html += makeCard('♀ Венера в ' + venus.sign.name + ' — Таланты', venus.sign.sym + ' ' + venus.sign.name,
        '<b>Эстетические таланты:</b> ' + venus.sign.desc + '<br><br>'
        + 'Венера наделяет способностью к ' + venus.sign.social.toLowerCase()
        + '. Творческий потенциал 5-го дома (' + h5.name + '): ' + h5.desc,
        [['Таланты','rs'],['Творчество','rs'],['5-й дом','rs']], 'rose');
  }
  if (mercury) {
    html += makeCard('☿ Меркурий в ' + mercury.sign.name + ' — Интеллект', mercury.sign.sym + ' ' + mercury.sign.name,
        '<b>Стиль мышления:</b> ' + mercury.sign.emotion.split(',')[0].toLowerCase() + '.<br>'
        + '<b>Коммуникативный талант:</b> ' + mercury.sign.desc + '<br>'
        + 'Сферы: ' + mercury.sign.social.toLowerCase() + '.',
        [['Интеллект','bl'],['Коммуникация','bl']], 'blue');
  }
  html += '</div>';
  document.getElementById('n-block-social').innerHTML = html;
}

function buildNLove(planets, houses, ascIdx) {
  var h7 = getHouseSign(ascIdx, 7);
  var h5 = getHouseSign(ascIdx, 5);
  var venus = null, mars = null;
  planets.forEach(function(p) {
    if (p.name === 'Венера') venus = p;
    if (p.name === 'Марс')   mars  = p;
  });

  var html = makeSecHdr('Отношения и любовь', 'Ваш любовный код и тип идеального партнёра');
  html += makeOverview(
    '<strong>✦ Любовный портрет</strong><br><br>'
    + '<strong>♀ Венера в ' + (venus ? venus.sign.name : '…') + ':</strong> '
    + (venus ? venus.sign.love + '. ' + venus.sign.desc : '—') + '<br><br>'
    + '<strong>♂ Марс в ' + (mars ? mars.sign.name : '…') + ':</strong> '
    + (mars ? mars.sign.love + '. Стихия страсти: ' + mars.sign.el.toLowerCase() + '.' : '—') + '<br><br>'
    + '<strong>7-й дом (' + h7.name + ') — Партнёр и брак:</strong> ' + h7.desc
    + ' Вам нужен человек с качествами ' + h7.name + ': ' + h7.emotion.toLowerCase() + '. '
    + '<strong>5-й дом (' + h5.name + ') — Романтика:</strong> ' + h5.desc
  );

  html += '<div class="cards-grid">';
  if (venus) {
    html += makeCard('♀ Венера в ' + venus.sign.name, venus.sign.sym + ' ' + venus.sign.name,
        '<b>Стиль любви:</b> ' + venus.sign.love + '.<br><b>Привязанности:</b> ' + venus.sign.emotion.split(',')[0].toLowerCase() + '.<br><br>' + venus.sign.desc,
        [[venus.sign.el,''],['Любовь','rs'],['Венера','rs']], 'rose');
  }
  if (mars) {
    html += makeCard('♂ Марс в ' + mars.sign.name, mars.sign.sym + ' ' + mars.sign.name,
        '<b>Сексуальность и страсть:</b> ' + mars.sign.love + '.<br><b>Стиль завоевания:</b> ' + mars.sign.emotion.split(',')[0].toLowerCase() + '.<br><br>' + mars.sign.desc,
        [[mars.sign.el,''],['Страсть',''],['Марс','']], '');
  }
  html += makeCard('💍 7-й дом — Партнёр и брак', h7.sym + ' ' + h7.name,
      '<b>Тип партнёра:</b> ' + h7.emotion + '.<br><b>Идеальный союз:</b> ' + h7.desc + '<br><b>Стиль брака:</b> ' + h7.love.toLowerCase() + '.',
      [[h7.el,''],['Брак','bl'],['7-й дом','bl']], 'blue');
  html += makeCard('💫 5-й дом — Романтика и флирт', h5.sym + ' ' + h5.name,
      '<b>Стиль романтики:</b> ' + h5.love + '.<br>' + h5.desc + '<br><b>Досуг и свидания:</b> ' + h5.social.toLowerCase() + '.',
      [[h5.el,''],['Флирт',''],['Романтика','rs']], 'rose');
  html += makeCard('⚠️ Возможные сложности', 'Зоны роста в отношениях',
      'На основе Венеры в ' + (venus ? venus.sign.name : '…') + ' и Марса в ' + (mars ? mars.sign.name : '…')
      + ': возможно напряжение между разными стихиями. Ключ к гармонии — признание различий в эмоциональном языке.',
      [['Сложность',''],['Рост','tl']], '');
  html += '</div>';
  document.getElementById('n-block-love').innerHTML = html;
}

function buildNHealth(sun, moon, asc, houses) {
  var h6 = houses[5];
  var html = makeSecHdr('Здоровье и тело', 'Астрологическая карта здоровья');

  html += '<table class="info-table">'
    + '<tr><th>Зона</th><th>Знак</th><th>Органы и системы</th><th>Рекомендации</th></tr>'
    + '<tr><td>1-й дом (Асцендент)</td><td>' + asc.sym + ' ' + asc.name + '</td><td>' + asc.health + '</td><td>Тонус связан со стихией ' + asc.el.toLowerCase() + '. ' + getHealthTip(asc.el) + '</td></tr>'
    + '<tr><td>6-й дом</td><td>' + h6.sym + ' ' + h6.name + '</td><td>' + h6.health + '</td><td>' + getHealthTip(h6.el) + '</td></tr>'
    + '<tr><td>☉ Солнце (' + sun.name + ')</td><td>' + sun.sym + ' ' + sun.name + '</td><td>' + sun.health + '</td><td>Укрепляйте через ' + getElementPractice(sun.el) + '</td></tr>'
    + '<tr><td>☽ Луна (' + moon.name + ')</td><td>' + moon.sym + ' ' + moon.name + '</td><td>' + moon.health + '</td><td>Эмоциональное здоровье — приоритет. ' + getElementPractice(moon.el) + '</td></tr>'
    + '</table>';

  html += makeOverview(
    '<strong>✦ Общий прогноз здоровья</strong><br><br>'
    + 'Тело несёт черты знака Асцендента — <em>' + asc.name + '</em>: ' + asc.health + '. '
    + 'Укрепляйте эти системы профилактически.<br><br>'
    + 'Луна в <em>' + moon.name + '</em>: эмоциональные блоки проявляются через ' + moon.health.toLowerCase() + '. '
    + 'Работа с психоэмоциональным состоянием — ключ к физическому здоровью.<br><br>'
    + '<strong>Рекомендуемые практики:</strong> ' + getElementPractice(sun.el) + ', ' + getElementPractice(asc.el) + '.'
  );
  document.getElementById('n-block-health').innerHTML = html;
}

function buildNKarma(node, southNode, lilit, houses, ascIdx) {
  var h12 = getHouseSign(ascIdx, 12);
  var html = makeSecHdr('Кармические задачи', 'Лунные Узлы, Лилит и 12-й дом');

  html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px">'
    + '<div class="node-badge"><span class="node-sym">☊</span><div class="node-info"><span class="node-name">Северный Узел (Раху)</span><span class="node-sign">' + node.sym + ' ' + node.name + '</span></div></div>'
    + '<div class="node-badge"><span class="node-sym">☋</span><div class="node-info"><span class="node-name">Южный Узел (Кету)</span><span class="node-sign">' + southNode.sym + ' ' + southNode.name + '</span></div></div>'
    + '<div class="node-badge" style="background:rgba(232,121,160,.08);border-color:rgba(232,121,160,.3)"><span class="node-sym">⚸</span><div class="node-info"><span class="node-name" style="color:var(--rose)">Лилит (Чёрная Луна)</span><span class="node-sign" style="color:var(--rose)">' + lilit.sym + ' ' + lilit.name + '</span></div></div>'
    + '</div>';

  html += makeOverview(
    '<strong>✦ Кармическое направление жизни</strong><br><br>'
    + '<strong>☊ Северный Узел в ' + node.name + '</strong> — цель воплощения, зона роста. '
    + 'Двигайтесь в сторону качеств <em>' + node.name + '</em>: ' + node.desc + '<br><br>'
    + '<strong>☋ Южный Узел в ' + southNode.name + '</strong> — освоенное в прошлых жизнях, зона комфорта. '
    + 'Качества ' + southNode.name + ' даются легко, но именно там — ловушка кармической инерции.<br><br>'
    + '<strong>⚸ Лилит в ' + lilit.name + '</strong> — тёмная сторона, искушения. '
    + lilit.desc + ' Принятие тени открывает мощный ресурс.'
  );

  html += '<div class="cards-grid">'
    + makeCard('☊ Раху — Путь роста', node.sym + ' ' + node.name,
        '<b>Направление кармической эволюции:</b> ' + node.desc
        + '<br><br>В этой жизни вы учитесь: <em>' + node.emotion + '</em>.',
        [[node.el,''],['Эволюция','tl'],['Цель','tl']], 'teal')
    + makeCard('☋ Кету — Прошлый опыт', southNode.sym + ' ' + southNode.name,
        '<b>Что принесено из прошлых жизней:</b> ' + southNode.desc
        + '<br><br>Природный дар: ' + southNode.emotion.split(',')[0].toLowerCase()
        + '. Риск: зависание в прошлом вместо движения к цели.',
        [[southNode.el,''],['Карма','pu'],['Прошлое','pu']], 'purple')
    + makeCard('⚸ Лилит — Тёмная Луна', lilit.sym + ' ' + lilit.name,
        '<b>Зона искушений и тени:</b> ' + lilit.desc
        + '<br><br>Вытесненные желания в теме ' + lilit.name.toLowerCase() + ': ' + lilit.emotion.toLowerCase() + '.',
        [[lilit.el,''],['Тень','rs'],['Лилит','rs']], 'rose')
    + makeCard('🌌 12-й дом (' + h12.name + ') — Подсознание', h12.sym + ' ' + h12.name,
        '<b>Скрытые процессы и кармические долги:</b> ' + h12.desc
        + '<br><br>12-й дом — то, что работает за кулисами жизни. '
        + 'Темы ' + h12.name.toLowerCase() + ' требуют осознания.',
        [[h12.el,''],['12-й дом',''],['Подсознание','']], '')
    + '</div>';

  document.getElementById('n-block-karma').innerHTML = html;
}

function buildNForecast(sun, birthYear) {
  var curY    = new Date().getFullYear();
  var age     = curY - birthYear;
  var satRet  = (age >= 27 && age <= 30) || (age >= 57 && age <= 60);
  var jupRet  = age % 12 === 0 || age % 12 === 11;

  var satMsg = satRet
    ? '<br><br><strong>⚠️ Возврат Сатурна:</strong> Вы переживаете Возврат Сатурна (' + age + ' лет) — важнейший период переосмысления структуры жизни и принятия ответственности.'
    : '';
  var jupMsg = jupRet
    ? '<br><br><strong>✦ Возврат Юпитера:</strong> Год Юпитерова возвращения — время расширения возможностей, роста и удачи!'
    : '';

  var html = makeSecHdr('Прогностика', 'Текущие космические влияния');
  html += makeOverview(
    '<strong>✦ Астрологический прогноз на текущий период</strong><br><br>'
    + 'Солнце в ' + sun.name + ' определяет основной тон личности: ' + sun.desc
    + satMsg + jupMsg
  );

  html += '<div class="forecast-block">'
    + '<div class="forecast-period">Благоприятные периоды для ' + sun.name + '</div>'
    + '<div class="forecast-title">Когда солнечная энергия работает на вас</div>'
    + '<div class="forecast-body">Лучшие месяцы: когда Солнце проходит по дружественным знакам стихии ' + sun.el.toLowerCase() + '.<br><br>'
    + '<b>Сферы роста в этом году:</b> ' + sun.social + '.<br>'
    + '<b>Рекомендуемые практики:</b> ' + getElementPractice(sun.el) + '.'
    + '</div></div>';

  html += '<div class="cards-grid">'
    + makeCard('🌱 Ближайшие 6 месяцев', 'Прогноз развития',
        'Основной акцент на темах стихии ' + sun.el.toLowerCase() + ': ' + sun.emotion.split(',')[0].toLowerCase()
        + '. Сильные стороны периода: ' + sun.social.split(',')[0].toLowerCase() + '.',
        [['Прогноз','tl']], 'teal')
    + makeCard('📍 Соляр — Карта года', 'День рождения как точка отсчёта',
        'Каждый день рождения Солнце возвращается в точку рождения. Главная тема: раскрытие потенциала '
        + sun.name + ' через ' + sun.el.toLowerCase()
        + '. Важно: с кем и где вы встречаете день рождения — это программирует весь следующий год.',
        [['Соляр','bl']], 'blue')
    + '</div>';

  document.getElementById('n-block-forecast').innerHTML = html;
}

function buildNSummary(sun, moon, asc, node) {
  var html = makeSecHdr('Резюме и рекомендации', 'Персональный план самореализации');
  html += '<div class="summary-box">'
    + '<div class="summary-title">✦ Ключевые выводы натальной карты ✦</div>'
    + '<div class="summary-body">'
    +   '<b>Кто вы:</b> Солнце в ' + sun.name + ' — ' + sun.desc + '<br><br>'
    +   '<b>Ваш эмоциональный мир (Луна в ' + moon.name + '):</b> ' + moon.emotion + '. Для счастья необходимо: ' + moon.love.toLowerCase() + '.<br><br>'
    +   '<b>Как вас видит мир (Асцендент в ' + asc.name + '):</b> ' + asc.desc + '<br><br>'
    +   '<b>Ваша кармическая цель (Северный Узел в ' + node.name + '):</b> ' + node.desc + '<br><br>'
    +   '<b>Главная сфера самореализации:</b> ' + sun.social + '.<br><br>'
    +   '<b>В отношениях:</b> ' + sun.love.toLowerCase() + '.<br><br>'
    +   '<b>Для здоровья:</b> ' + getElementPractice(sun.el) + ', обращайте внимание на ' + sun.health.toLowerCase() + '.<br><br>'
    +   '<b>Духовный путь:</b> движение к качествам ' + node.name + ' через принятие своей природы и интеграцию всех частей себя.'
    + '</div></div>'
    + '<div class="cards-grid" style="margin-top:20px">'
    + makeCard('💡 Самореализация', 'Главный совет',
        'Ваша природа — ' + sun.name + ' (' + sun.el + '). Развивайте то, что даётся легко: ' + sun.emotion.split(',')[0].toLowerCase() + '.',
        [['Совет','tl']], 'teal')
    + makeCard('💞 Отношения', 'Для счастливого союза',
        'Вам нужен партнёр, уважающий вашу природу ' + sun.name + '. Ваш любовный язык: ' + sun.love.toLowerCase() + '.',
        [['Любовь','rs']], 'rose')
    + makeCard('🌿 Здоровье', 'Первичная профилактика',
        'Главный приоритет — ' + sun.health.toLowerCase() + ' и психоэмоциональное благополучие через ' + getElementPractice(moon.el) + '.',
        [['Здоровье','']], '')
    + makeCard('🔮 Духовный рост', 'Путь к себе',
        'Следуйте направлению Северного Узла: ' + node.name + ' — ' + node.emotion.split(',')[0].toLowerCase() + '. Медитация и самопознание откроют новый уровень.',
        [['Духовность','pu']], 'purple')
    + '</div>';

  document.getElementById('n-block-summary').innerHTML = html;
}

// ── Canvas rendering ─────────────────────────────────────

function drawNatal(planets, asc) {
  var canvas = document.getElementById('natalCanvas');
  var ctx    = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var cx = W / 2, cy = H / 2;
  var OR = 220, IR = 148, inner = 88;

  ctx.clearRect(0, 0, W, H);

  var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, OR + 50);
  g.addColorStop(0, 'rgba(93,173,226,.05)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Zodiac sectors
  ZODIAC.forEach(function(z, i) {
    var sa = (i * 30 - 90) * Math.PI / 180;
    var ea = ((i + 1) * 30 - 90) * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, OR, sa, ea); ctx.closePath();
    ctx.fillStyle   = hexA(z.color, .07); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = .5; ctx.stroke();
    var ma = (sa + ea) / 2;
    ctx.fillStyle = hexA(z.color, .8);
    ctx.font = '13px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(z.sym, cx + (OR - 18) * Math.cos(ma), cy + (OR - 18) * Math.sin(ma));
  });

  // Circles
  [[OR, 'rgba(201,168,76,.4)', 1.5], [IR, 'rgba(93,173,226,.25)', 1], [inner, 'rgba(93,173,226,.25)', 1]]
    .forEach(function(cfg) {
      ctx.beginPath(); ctx.arc(cx, cy, cfg[0], 0, Math.PI * 2);
      ctx.strokeStyle = cfg[1]; ctx.lineWidth = cfg[2]; ctx.stroke();
    });

  // House cusps
  for (var i = 0; i < 12; i++) {
    var a = (i * 30 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx + inner * Math.cos(a), cy + inner * Math.sin(a));
    ctx.lineTo(cx + OR    * Math.cos(a), cy + OR    * Math.sin(a));
    ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = .7; ctx.stroke();
  }

  // Horizon & MC
  [0, 90].forEach(function(deg) {
    var a = (deg - 90) * Math.PI / 180;
    [-1, 1].forEach(function(dir) {
      ctx.beginPath();
      ctx.moveTo(cx + inner * Math.cos(a) * dir, cy + inner * Math.sin(a) * dir);
      ctx.lineTo(cx + OR    * Math.cos(a) * dir, cy + OR    * Math.sin(a) * dir);
      ctx.strokeStyle = 'rgba(201,168,76,.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  });

  // Planet dots
  planets.slice(0, 11).forEach(function(p, i) {
    if (!p.sign) return;
    var signIdx = ZODIAC.indexOf(p.sign);
    if (signIdx < 0) return;
    var angle = ((signIdx * 30 + 15) - 90) * Math.PI / 180;
    var pr    = IR - 10 - (i % 4) * 14;
    var px = cx + pr * Math.cos(angle);
    var py = cy + pr * Math.sin(angle);
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = p.color + 'cc'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#000'; ctx.font = 'bold 8px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.sym, px, py);
  });

  // Center disc
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,7,20,.88)'; ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,.3)'; ctx.lineWidth = 1; ctx.stroke();

  ctx.fillStyle = 'rgba(201,168,76,.8)';
  ctx.font = 'bold 16px Cinzel, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('☉', cx, cy - 12);
  ctx.fillStyle = 'rgba(192,132,252,.8)';
  ctx.font = '11px Cinzel, serif';
  ctx.fillText(asc.sym + ' ' + asc.name.slice(0, 3) + '..', cx, cy + 12);
}
