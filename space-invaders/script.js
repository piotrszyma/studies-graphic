
// ==========================================
//
//   Initialize canvas, get webgl context
//
// ==========================================

const canvas = document.querySelector('canvas');

const gl = canvas.getContext('webgl');

const health = document.querySelector('.statistics__health span');
const points = document.querySelector('.statistics__points span');

let TURN = 0;

let REDRAW_INTERVAL;

// ==========================================
//
//                Textures
//
// ==========================================

let playerTexture = loadTexture(gl, 'player.png');
let enemyTexture = loadTexture(gl, 'invader.png');
let foregroundTexture = loadTexture(gl, 'bullet.png');
let backgroundTexture = loadTexture(gl, 'background.png');
let logoTexture = loadTexture(gl, 'logo.png');

let shieldFull = loadTexture(gl, 'shield4.png');
let shieldThree = loadTexture(gl, 'shield3.png');
let shieldTwo = loadTexture(gl, 'shield2.png');
let shieldOne = loadTexture(gl, 'shield1.png');

const TEXTURE_TYPES = {
  'player': playerTexture,
  'enemy': enemyTexture,
  'shield': foregroundTexture,
  'bullet': foregroundTexture,
  'enemyBullet': foregroundTexture,
  'playerBullet': foregroundTexture,
  'background': backgroundTexture,
  'logo': logoTexture,
  'shield4': shieldFull,
  'shield3': shieldThree,
  'shield2': shieldTwo,
  'shield1': shieldOne
};

// ==========================================
//
//                Constants
//
// ==========================================

const HEIGHT = canvas.height;

const WIDTH = canvas.width;

let PLAYER_CAN_SHOOT = true;
let PLAYER_SPEED = 0;
let PLAYER_MAX_SPEED = 15;
let PLAYER_BULLET_SPEED = 2;
let PLAYER_SHOOT_INTERVAL = 800;
let PLAYER_POINTS = 0;
let PLAYER_HEALTH = 3;

let ENEMY_DIRECTION = 'right';
let ENEMY_BULLET_SPEED = 2;

const PANE_OFFSET = 15;

const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 4;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;

const ENEMY_WIDTH = 32;
const ENEMY_HEIGHT = 16;
const ENEMY_FIRERATE = 500;
const ENEMY_SPEED = 2;

const SHIELD_WIDTH = 60;
const SHIELD_HEIGHT = 10;

health.innerHTML = PLAYER_HEALTH;
points.innerHTML = 0;

// ==========================================
//
//            Utils functions
//
// ==========================================

const cartXtoGL = (x) => {
  return x / (WIDTH / 2) - 1;
}

const cartYtoGL = (y) => {
  return y / (HEIGHT / 2) - 1;
}

const randRange = (min, max) => {
  return ~~(Math.random() * (max - min) + min);
}

const randomColor = () => [Math.random(), Math.random(), Math.random()];

// ==========================================
//
//            Utils WebGL functions
//
// ==========================================


const createAndBindBuffer = ({
  type,
  data,
  usage
}) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, usage);
  return buffer;
};

const createAndCompileShader = ({
  type,
  code
}) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, code);
  gl.compileShader(shader);
  return shader;
};

const createProgramAndAttachShaders = ({
  shaders
}) => {
  const program = gl.createProgram();

  shaders.forEach(shader => {
    gl.attachShader(program, shader);
  })

  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    console.error("Error in program linking:" + lastError);
  }

  gl.useProgram(program);
  return program;
};


// ==========================================
//
//        Utils WebGL image functions
//
// ==========================================
//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//



function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


// ==========================================
//
//   Create and compile Shader programs
//
// ==========================================

// Vertex shader

const vertexShaderCode = `
  attribute vec3 coordinates;
  attribute vec2 aTextureCoord;

  varying highp vec2 vTextureCoord;

  void main(void) {
    gl_Position = vec4(coordinates, 1.0);
    vTextureCoord = aTextureCoord;
  }
`;

const vertexShader = createAndCompileShader({
  type: gl.VERTEX_SHADER,
  code: vertexShaderCode
});

const fragmentShaderCode = `
  precision mediump float;
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;

  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;

const fragmentShader = createAndCompileShader({
  type: gl.FRAGMENT_SHADER,
  code: fragmentShaderCode
});


// Shader program

const shaderProgram = createProgramAndAttachShaders({
  shaders: [
    vertexShader,
    fragmentShader
  ]
});

// ==========================================
//
//    Setup canvas
//
// ==========================================

gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, canvas.width, canvas.height);

// ==========================================
//
//    Render rectangle
//
// ==========================================

const u_colorLocation = gl.getUniformLocation(shaderProgram, 'u_Color');

const renderObject = ({
  x,
  y,
  w,
  h,
  color = [0, 1, 0.1],
  opacity = 1,
  type,
  health
}) => {

  const xMin = cartXtoGL(x);
  const yMin = cartYtoGL(y);
  const xMax = cartXtoGL(x + w);
  const yMax = cartYtoGL(y + h);

  const vertices = [
    xMin, yMin, 0,
    xMax, yMin, 0,
    xMax, yMax, 0,
    xMin, yMax, 0,
  ];

  const vertexBuffer = createAndBindBuffer({
    type: gl.ARRAY_BUFFER,
    data: new Float32Array(vertices),
    usage: gl.STATIC_DRAW
  });

  const coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');
  gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);

  // Textures buffer

  let currentTexture = null;

  if (type === 'shield') {
     currentTexture = TEXTURE_TYPES[`shield${health}`];
  } else {
     currentTexture = TEXTURE_TYPES[type] || backgroundTexture;
  }

  gl.bindTexture(gl.TEXTURE_2D, currentTexture);

  const textureCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);

  const textureCoords = [
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),
                gl.STATIC_DRAW);

  const texture = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.vertexAttribPointer(texture, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texture);

  // Texture buffer --- end

  // gl.uniform4f(u_colorLocation, ...color, opacity);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 3);
};

const renderBackground = () => {

  const vertices = [
    -0.95, -0.95, 0.3,
    -0.95,  0.95, 0.3,
     0.95,  0.95, 0.3,
     0.95, -0.95, 0.3,
  ];

  const vertexBuffer = createAndBindBuffer({
    type: gl.ARRAY_BUFFER,
    data: new Float32Array(vertices),
    usage: gl.STATIC_DRAW
  });

  const coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');
  gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);

  const currentTexture = logoTexture;

  gl.bindTexture(gl.TEXTURE_2D, currentTexture);

  const textureCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);

  const textureCoords = [
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),
                gl.STATIC_DRAW);

  const texture = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.vertexAttribPointer(texture, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texture);


  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 3);
}


// ==========================================
//
//          Objects initialization
//
// ==========================================

let GAME_OBJECTS = [];

let ENEMY_OBJECTS = [];

let SHIELD_OBJECTS = [];

const PLAYER_OBJECT = {
  x: 300,
  y: 40,
  w: PLAYER_WIDTH,
  h: PLAYER_HEIGHT,
  type: 'player'
};

[300, 350, 400].forEach(y => {
  ENEMY_OBJECTS.push(...Array(8)
    .fill()
    .map((_, i) => ({
      x: 64 * i + 32,
      y: y,
      w: ENEMY_WIDTH,
      h: ENEMY_HEIGHT,
      canShoot: true,
      type: 'enemy'
    })));
});

SHIELD_OBJECTS.push(...Array(4).fill().map((_, i) => ({
  x: 140 * i + 80,
  y: 80,
  w: SHIELD_WIDTH,
  h: SHIELD_HEIGHT,
  type: 'shield',
  health: 4,
  color: [0, 1, 0.1],
  opacity: 1.0
})));

GAME_OBJECTS.push(PLAYER_OBJECT);

ENEMY_OBJECTS.forEach(e => {
  GAME_OBJECTS.push(e);
});

SHIELD_OBJECTS.forEach(e => {
  GAME_OBJECTS.push(e);
});


// ==========================================
//
//             Click handlers
//
// ==========================================

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case "ArrowUp":
    case " ":
      if (!PLAYER_CAN_SHOOT) return;
      PLAYER_CAN_SHOOT = false;
      setTimeout(() => {
        PLAYER_CAN_SHOOT = true
      }, PLAYER_SHOOT_INTERVAL);
      GAME_OBJECTS.push({
        type: 'playerBullet',
        x: PLAYER_OBJECT.x + 18,
        y: PLAYER_OBJECT.y + 20,
        w: BULLET_WIDTH,
        h: BULLET_HEIGHT,
        color: randomColor()
      });
      break;
    default:
      break;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    PLAYER_SPEED = -PLAYER_MAX_SPEED;
  } else if (event.key === 'ArrowRight') {
    PLAYER_SPEED = PLAYER_MAX_SPEED;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft') {
    PLAYER_SPEED = 0;
  } else if (event.key === 'ArrowRight') {
    PLAYER_SPEED = 0;
  }
});

// ==========================================
//
//                The game
//
// ==========================================

handleGameObject = (o) => {
  switch (o.type) {
    case 'playerBullet':
      if (o.y > HEIGHT) {
        o.type = 'toRemove';
      } else {
        o.y += PLAYER_BULLET_SPEED;

        ENEMY_OBJECTS.forEach(e => {
          if (e.type === 'enemy') {
            if (
              o.x >= e.x &&
              o.x <= e.x + ENEMY_WIDTH &&
              o.y >= e.y &&
              o.y <= e.y + ENEMY_HEIGHT
            ) {
              e.type = 'toRemove';
              o.type = 'toRemove';
              PLAYER_POINTS += 1;
              points.innerHTML = PLAYER_POINTS;

              if (PLAYER_POINTS === 24) handleEnd("You won!");

            }
          }
        })

        SHIELD_OBJECTS.forEach(e => {
          if (e.type === 'shield') {
            if (
              o.x >= e.x &&
              o.x <= e.x + SHIELD_WIDTH &&
              o.y >= e.y &&
              o.y <= e.y + SHIELD_HEIGHT
            ) {
              e.health -= 1;

              if (e.health === 0) {
                e.type = 'toRemove';
              } else {
                e.opacity = e.health / 4;
              }
              o.type = 'toRemove';
            }
          }
        })

      }
      break;
    case 'enemy':
      if (
        randRange(0, 2000) < ENEMY_FIRERATE &&
        PLAYER_OBJECT.x <= o.x &&
        PLAYER_OBJECT.x + 40 >= o.x + 32 &&
        o.canShoot
      ) {
        o.canShoot = false;
        setTimeout(() => o.canShoot = true, randRange(500, 2000));
        setTimeout(() => {
          GAME_OBJECTS.push({
            type: 'enemyBullet',
            x: o.x + 14,
            y: o.y - 4,
            w: 4,
            h: 4,
            color: randomColor()
          })
        }, randRange(0, 300))
      }
      if (o.x + ENEMY_WIDTH > WIDTH - PANE_OFFSET) {
        ENEMY_DIRECTION = 'left';
      }

      if (o.x < PANE_OFFSET) {
        ENEMY_DIRECTION = 'right';
      }

      if (ENEMY_DIRECTION === 'right') {
        o.x += ENEMY_SPEED;

      } else {
        o.x -= ENEMY_SPEED;
      }

      if (TURN % 20 === 0) {
        o.y -= 1;
      }

      if (o.y === PLAYER_OBJECT.y + PLAYER_HEIGHT) {
        handleEnd("You didn\'t manage to defend from space invaders!");
      }

      break;
    case 'enemyBullet':
      if (o.y <= 0) {
        o.type = 'toRemove';
      } else {
        o.y -= ENEMY_BULLET_SPEED;
      }


      SHIELD_OBJECTS.forEach(e => {
        if (e.type === 'shield') {
          if (
            o.x >= e.x &&
            o.x <= e.x + SHIELD_WIDTH &&
            o.y >= e.y &&
            o.y <= e.y + SHIELD_HEIGHT
          ) {
            e.health -= 1;

            if (e.health === 0) {
              e.type = 'toRemove';
            } else {
              e.opacity = e.health / 4;
            }
            o.type = 'toRemove';
          }
        }
      })

      if (
        o.x >= PLAYER_OBJECT.x &&
        o.x <= PLAYER_OBJECT.x + PLAYER_OBJECT.w &&
        o.y >= PLAYER_OBJECT.y &&
        o.y <= PLAYER_OBJECT.y + PLAYER_OBJECT.h
      ) {
        PLAYER_HEALTH -= 1;
        health.innerHTML = PLAYER_HEALTH;

        o.type = 'toRemove';
        if (PLAYER_HEALTH === 0) handleEnd("No health left.");
      }

      break;
    case 'player':
      o.x = Math.max(o.x + PLAYER_SPEED, PANE_OFFSET);
      o.x = Math.min(o.x, WIDTH - PLAYER_WIDTH - PANE_OFFSET);
      break;
    default:
      break;
  }
};

// ==========================================
//
//              Redraw pane
//
// ==========================================

const redraw = () => {
  TURN = TURN + 1;
  gl.clearColor(0.03, 1, 0.07, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderBackground();

  GAME_OBJECTS.forEach(o => {
    handleGameObject(o);
    window.requestAnimationFrame(() => {
      renderObject(o);
      requestID = 0;
    });
  });

  GAME_OBJECTS = GAME_OBJECTS.filter(o => o.type !== 'toRemove');
};

REDRAW_INTERVAL = setInterval(redraw, 20);


const handleEnd = (reason = "You lost") => {
  clearInterval(REDRAW_INTERVAL);
  const wrapper = document.querySelector('.wrapper');
  wrapper.style = 'display: none;'

  const end = document.querySelector('.end');
  const endButton = document.querySelector('.end__button');
  const endMessage = document.querySelector('.end__message');
  endMessage.innerHTML = `
  <p>${reason}</p>
  <p>SCORE: ${PLAYER_POINTS}</p>
  `;

  endButton.addEventListener('click', () => {
    window.location.reload()
  });

  end.style = '';
}
