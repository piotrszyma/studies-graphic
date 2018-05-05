// ==========================================
//
//   Initialize canvas, get webgl context    
//
// ==========================================

const canvas = document.querySelector('canvas');

const gl = canvas.getContext('webgl');

// ==========================================
//
//              Utils functions
//
// ==========================================


const createAndBindBuffer = ({ type, data, usage }) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, usage);
  gl.bindBuffer(type, null);
  return buffer;
};

const createAndCompileShader = ({ type, code }) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, code);
  gl.compileShader(shader);
  return shader;
};

const createProgramAndAttachShaders = ({ shaders }) => {
  const program = gl.createProgram();
  shaders.forEach(shader => {
    gl.attachShader(program, shader);
  })
  gl.linkProgram(program);
  gl.useProgram(program);
  return program;
};

// ==========================================
//
//   Define geometry and store it in buffer  
//
// ==========================================

const vertices = [
  -0.5,  0.5, 0.0,
  -0.5, -0.5, 0.0,
   0.5, -0.5, 0.0,
   0.5,  0.5, 0.0,
];

const colors = [
  0, 0, 1,
  1, 0, 0,
  0, 1, 0, 
  1, 0, 1,
];

const indices = [3, 2, 1, 3, 1, 0];

const vertexBuffer = createAndBindBuffer({
  type:   gl.ARRAY_BUFFER, 
  data:   new Float32Array(vertices),
  usage:  gl.STATIC_DRAW
});

const indexBuffer = createAndBindBuffer({
  type:   gl.ELEMENT_ARRAY_BUFFER, 
  data:   new Int16Array(indices),
  usage:  gl.STATIC_DRAW
});

const colorBuffer = createAndBindBuffer({
  type:   gl.ARRAY_BUFFER, 
  data:   new Float32Array(colors),
  usage:  gl.STATIC_DRAW
});

// ==========================================
//
//   Create and compile Shader programs
//
// ==========================================

// Vertex shader



const vertexShaderCode = `
  attribute vec3 coordinates;
  attribute vec3 color;
  varying vec3 vColor;

  void main(void) {
    gl_Position = vec4(coordinates, 1.0);
    vColor = color;
  }
`;

const vertexShader = createAndCompileShader({
  type: gl.VERTEX_SHADER,
  code: vertexShaderCode
});

const fragmentShaderCode = `
  precision mediump float;
  varying vec3 vColor;

  void main(void) {
    gl_FragColor = vec4(vColor, 1.0);
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
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

const coordinates = gl.getAttribLocation(shaderProgram, 'coordinates');

// Point an attribute to the currently bound Vertex Buffer Object
gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
// Enable the attribute
gl.enableVertexAttribArray(coordinates);


gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
// Colors
const color = gl.getAttribLocation(shaderProgram, 'color');

gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

gl.enableVertexAttribArray(color);


// ==========================================
//
//    Clear canvas
//
// ==========================================

gl.clearColor(0.5, 0.5, 0.5, 0.9);

gl.enable(gl.DEPTH_TEST);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.viewport(0, 0, canvas.width, canvas.height);

// gl.drawArrays(gl.LINES, 0, 6);

gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
