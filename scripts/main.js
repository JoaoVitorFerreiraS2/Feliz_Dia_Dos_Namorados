; (function (window) {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

  const FRAME_RATE = 60
  const PARTICLE_NUM = 2500
  const RADIUS = Math.PI * 2
  const CANVASWIDTH = 1000
  const CANVASHEIGHT = 500
  const CANVASID = 'canvas'

  let texts = ['Oie Minha Princesa', 'Eu Sei', 'Um Pouco Exagerado', 'Mas..................', 'Isso Tudo É', 'Para Você Saber', 'Que nossa química', 
  'Está Marcada', 'Pelas Próprias', 'Estrelas ★', 'E Que Elas', 'Estão Torcendo', 'Por Nós Dois', 
  'EU', 'AMO', 'MUITO', "VOCÊ", 'Eu Quero', 'Que Você Seja', "O Amor", "Da Minha Vida", "Minha princesinha",
"Minha Mocinha", "Minha nega", "Meu amor","Minha faixa Preta", "Minha garota", ""]

  let canvas,
    ctx,
    particles = [],
    quiver = true,
    text = texts[0],
    textIndex = 0,
    textSize = 90

  function getHeartCoordinates() {
    let heartCoords = [];
    let scale = 10; // Adjust scale to fit the canvas size
    for (let t = 0; t < Math.PI * 2; t += 0.05) {
      let x = scale * 16 * Math.pow(Math.sin(t), 3);
      let y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      heartCoords.push([x + CANVASWIDTH / 2, y + CANVASHEIGHT / 2]);
    }
    return heartCoords;
  }

  function draw() {
    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT)
    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.textBaseline = 'middle'
    ctx.fontWeight = 'bold'
    ctx.font = textSize + 'px \'SimHei\', \'Avenir\', \'Helvetica Neue\', \'Arial\', \'sans-serif\''
    ctx.fillText(text, (CANVASWIDTH - ctx.measureText(text).width) * 0.5, CANVASHEIGHT * 0.5)

    let imgData = ctx.getImageData(0, 0, CANVASWIDTH, CANVASHEIGHT)

    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT)

    for (let i = 0, l = particles.length; i < l; i++) {
      let p = particles[i]
      p.inText = false
    }
    particleText(imgData)

    window.requestAnimationFrame(draw)
  }

  function particleText(imgData) {
    let pxls = [];
    if (textIndex === texts.length - 1) {
      // If it is the last text, show the heart shape
      pxls = getHeartCoordinates();
    } else {
      // Otherwise, get the text coordinates as usual
      for (let w = CANVASWIDTH; w > 0; w -= 3) {
        for (let h = 0; h < CANVASHEIGHT; h += 3) {
          let index = (w + h * (CANVASWIDTH)) * 4;
          if (imgData.data[index] > 1) {
            pxls.push([w, h]);
          }
        }
      }
    }

    let count = pxls.length;
    let j = parseInt((particles.length - pxls.length) / 2, 10);
    j = j < 0 ? 0 : j;

    for (let i = 0; i < pxls.length && j < particles.length; i++, j++) {
      try {
        let p = particles[j],
          X,
          Y;

        if (quiver) {
          X = (pxls[i][0]) - (p.px + Math.random() * 10);
          Y = (pxls[i][1]) - (p.py + Math.random() * 10);
        } else {
          X = (pxls[i][0]) - p.px;
          Y = (pxls[i][1]) - p.py;
        }
        let T = Math.sqrt(X * X + Y * Y);
        let A = Math.atan2(Y, X);
        let C = Math.cos(A);
        let S = Math.sin(A);
        p.x = p.px + C * T * p.delta;
        p.y = p.py + S * T * p.delta;
        p.px = p.x;
        p.py = p.y;
        p.inText = true;
        p.fadeIn();
        p.draw(ctx);
      } catch (e) { }
    }

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      if (!p.inText) {
        p.fadeOut();

        let X = p.mx - p.px;
        let Y = p.my - p.py;
        let T = Math.sqrt(X * X + Y * Y);
        let A = Math.atan2(Y, X);
        let C = Math.cos(A);
        let S = Math.sin(A);

        p.x = p.px + C * T * p.delta / 2;
        p.y = p.px + S * T * p.delta / 2;
        p.px = p.x;
        p.py = p.y;

        p.draw(ctx);
      }
    }
  }


  function setDimensions() {
    canvas.width = CANVASWIDTH
    canvas.height = CANVASHEIGHT
    canvas.style.position = 'absolute'
    canvas.style.left = '0%'
    canvas.style.top = '0%'
    canvas.style.bottom = '0%'
    canvas.style.right = '0%'
    canvas.style.marginTop = window.innerHeight * .15 + 'px'
  }

  function event() {
    document.addEventListener('click', function (e) {
      textIndex++
      if (textIndex >= texts.length) {
        textIndex--
        return
      }
      text = texts[textIndex]
      console.log(textIndex)
    }, false)

    document.addEventListener('touchstart', function (e) {
      textIndex++
      if (textIndex >= texts.length) {
        textIndex--
        return
      }
      text = texts[textIndex]
      console.log(textIndex)
    }, false)
  }

  function init() {
    canvas = document.getElementById(CANVASID)
    if (canvas === null || !canvas.getContext) {
      return
    }
    ctx = canvas.getContext('2d')
    setDimensions()
    event()

    for (var i = 0; i < PARTICLE_NUM; i++) {
      particles[i] = new Particle(canvas)
    }

    draw()
  }

  class Particle {
    constructor(canvas) {
      let spread = canvas.height
      let size = Math.random() * 1.2
      // 速度
      this.delta = 0.06
      // 现在的位置
      this.x = 0
      this.y = 0
      // 上次的位置
      this.px = Math.random() * canvas.width
      this.py = (canvas.height * 0.5) + ((Math.random() - 0.5) * spread)
      // 记录点最初的位置
      this.mx = this.px
      this.my = this.py
      // 点的大小
      this.size = size
      // this.origSize = size
      // 是否用来显示字
      this.inText = false
      // 透明度相关
      this.opacity = 0
      this.fadeInRate = 0.005
      this.fadeOutRate = 0.03
      this.opacityTresh = 0.98
      this.fadingOut = true
      this.fadingIn = true
    }
    fadeIn() {
      this.fadingIn = this.opacity > this.opacityTresh ? false : true
      if (this.fadingIn) {
        this.opacity += this.fadeInRate
      } else {
        this.opacity = 1
      }
    }
    fadeOut() {
      this.fadingOut = this.opacity < 0 ? false : true
      if (this.fadingOut) {
        this.opacity -= this.fadeOutRate
        if (this.opacity < 0) {
          this.opacity = 0
        }
      } else {
        this.opacity = 0
      }
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(226,225,142, ' + this.opacity + ')'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, RADIUS, true)
      ctx.closePath()
      ctx.fill()
    }
  }

  var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (!isChrome) {
    $('#iframeAudio').remove()
  }

  // setTimeout(() => {
  init()
  // }, 4000);
  // mp3.play()
})(window)
