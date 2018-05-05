// ==========================================
//
//   Initialize canvas, get webgl context    
//
// ==========================================

const canvas = document.querySelector('canvas');

const gl = canvas.getContext('webgl');

// ==========================================
//
//   Define geometry and store it in buffer  
//
// ==========================================

const vertices = [
  -0.5,  0.5, 0.0,
  -0.5, -0.5, 0.0,
   0.5, -0.5, 0.0,
   0.5,  0.5, 0.0 
];

const indices = [3, 2, 1, 3, 1, 0];

// Create buffer object
const vertexBuffer = gl.createBuffer();
// Bind an empty buffer to it
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// Pass vertices data to buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
// Unbind the buffer
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

// ==========================================
//
//   Create and compile Shader programs
//
// ==========================================

// Vertex shader

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const vertexShaderCode = `
  attribute vec3 coordinates;
  void main(void) {
    gl_Position = vec4(coordinates, 1.0);
  }
`
gl.shaderSource(vertexShader, vertexShaderCode);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
const fragmentShaderCode = `
  void main(void) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
  }
`
gl.shaderSource(fragmentShader, fragmentShaderCode);
gl.compileShader(fragmentShader);
// Shader program

const shaderProgram = gl.createProgram();

// Attach shaders to shader program

gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

// Use program object

gl.useProgram(shaderProgram);

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
