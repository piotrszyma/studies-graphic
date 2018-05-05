// ==========================================
//
//            Custom settings
//
// ==========================================


const CUSTOM_COORDS_LOCATION = 15; // range 0 - 15 (16)

// ==========================================
//
//   Initialize canvas, get webgl context    
//
// ==========================================

const canvas = document.querySelector('canvas');

const gl = canvas.getContext('webgl');

const selectHTMLelement = document.querySelector('select');

const colorHTMLelement = document.querySelector('input');

const attrHTMLelement = document.querySelector('.attr__list');
const uniHTMLelement = document.querySelector('.uni__list');

// ==========================================
//
//              Utils functions
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
  gl.bindBuffer(type, null);
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

  gl.bindAttribLocation(program, CUSTOM_COORDS_LOCATION, 'coordinates');

  gl.linkProgram(program);
  gl.useProgram(program);
  return program;
};

// ==========================================
//
//   Define geometry and store it in buffer  
//
// ==========================================

const vertices = [-0.7, -0.1, 0, -0.3, 0.6, 0, -0.3, -0.3, 0,
  0.2, 0.6, 0,
  0.3, -0.3, 0,
  0.7, 0.6, 0,
];

const vertexBuffer = createAndBindBuffer({
  type: gl.ARRAY_BUFFER,
  data: new Float32Array(vertices),
  usage: gl.STATIC_DRAW
});

// ==========================================
//
//   Create and compile Shader programs
//
// ==========================================

// Vertex shader



const vertexShaderCode = `
  attribute vec3 coordinates;

  void main(void) {
    gl_Position = vec4(coordinates, 1.0);
  }
`;

const vertexShader = createAndCompileShader({
  type: gl.VERTEX_SHADER,
  code: vertexShaderCode
});

const fragmentShaderCode = `
  precision mediump float;
  uniform vec3 u_Color;

  void main(void) {
    gl_FragColor = vec4(u_Color, 1.0);
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
//    Associate Shader program with Buffer
//
// ==========================================

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

// gl.bindAttribLocation(shaderProgram, 10, 'coordinates');
// const coordinates = 10;

const coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');

console.log(`coordinates location: ${coordinates}`)

gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coordinates);

const u_colorLocation = gl.getUniformLocation(shaderProgram, 'u_Color');

// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
// const color = gl.getAttribLocation(shaderProgram, 'color');
// gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(color);

// ==========================================
//
//    Setup canvas
//
// ==========================================

gl.enable(gl.DEPTH_TEST);
gl.viewport(0, 0, canvas.width, canvas.height);

// ==========================================
//
//    Add listeners
//
// ==========================================

const hexToFloatColor = (hex) => {
  const bigInt = parseInt(hex.slice(1), 16);
  const r = (bigInt >> 16) & 255;
  const g = (bigInt >> 8) & 255;
  const b = bigInt & 255;
  return [r, g, b].map(c => c / 255)
}

selectHTMLelement.onchange = (event) => {
  redraw({
    type: gl[event.target.value],
    color: hexToFloatColor(colorHTMLelement.value)
  });
};

colorHTMLelement.value = '#FFFFFF'
colorHTMLelement.oninput = (event) => {
  redraw({
    type: gl[selectHTMLelement.value],
    color: hexToFloatColor(event.target.value)
  });
}


const redraw = ({
  type = null,
  color = null
}) => {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform3f(u_colorLocation, ...color);
  gl.drawArrays(type, 0, 6);
};

// ==========================================
//
//    Initial
//
// ==========================================


redraw({
  type: gl[selectHTMLelement.value],
  color: hexToFloatColor(colorHTMLelement.value)
});


// ==========================================
//
//   Auxiliary methods for attrs & uniforms
//
// ==========================================


const showAttributes = () => {
  const numOfActiveAttribs = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
  const numOfActiveUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);

  const attrsArray = Array(numOfActiveAttribs).fill().map((_, i) => {
    const info = gl.getActiveAttrib(shaderProgram, i);
    const location = gl.getAttribLocation(shaderProgram, info.name);
    return `name: ${info.name} type: ${info.type} size: ${info.size} location: ${location}`
  });

  const unisArray = Array(numOfActiveUniforms).fill().map((_, i) => {
    const info = gl.getActiveUniform(shaderProgram, i);
    // const location = gl.getUniformLocation(shaderProgram, info.name);
    // returns [WebGLUniformLocation object]
    return `name: ${info.name} type: ${info.type} size: ${info.size}`
  });

  attrHTMLelement.innerHTML = `<li>${attrsArray.join('</li><li>')}</li>`;
  uniHTMLelement.innerHTML = `<li>${unisArray.join('</li><li>')}</li>`;
}

showAttributes();