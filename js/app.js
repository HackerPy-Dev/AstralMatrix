// ============================================================
// STARFIELD ANIMATION
// ============================================================
(function() {
  var canvas = document.getElementById('starfield');
  var ctx    = canvas.getContext('2d');
  var W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (var i = 0; i < 200; i++) {
      stars.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.2 + 0.2,
        a:  Math.random(),
        sp: Math.random() * 0.003 + 0.001,
        of: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(function(s) {
      var alpha = s.a * (0.5 + 0.5 * Math.sin(t * s.sp + s.of));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,220,160,' + alpha + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  window.addEventListener('resize', function() { resize(); initStars(); });
  requestAnimationFrame(draw);
})();
