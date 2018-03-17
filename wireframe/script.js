"use strict";

const vertexShaderText = [
  'precision mediump float;',
  '',
  'attribute vec2 vertPosition;',
  'attribute vec3 vertColor;',
  'varying vec3 fragColor;',
  '',
  'void main()',
  '{',
  ' fragColor = vertColor;',
  ' gl_Position = vec4(vertPosition, 0.0, 1.0);',
  '}'  
].join('\n');

const fragmentShaderText = [
  'precision mediump float;',
  'varying vec3 fragColor;',
  '',
  'void main()',
  '{',
  ' gl_FragColor = vec4(fragColor, 1.0);',
  '}'  
].join('\n');

const initialize = () => {
  const canvas = document.getElementById("pane");
  const gl = canvas.getContext('webgl');
  console.log("WebGL initialized");

  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  // 
  // Create shaders
  //

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("Failed to compile vertex shader", gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("Failed to compile fragment shader", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program", gl.getProgramInfoLog(program));
    return;
  }

  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("Error validating program", gl.getProgramInfoLog(program));
    return;
  }

  // 
  // Create buffer
  //
  
  const triangleVertices = [
    // X, Y         R, G, B
    0.0,  0.5,      1.0, 0.0, 0.0,
    -0.5, -0.5,     0.0, 0.0, 1.0,
    0.5,  -0.5,     0.0, 1.0, 0.0,
  ];

  const triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    2, //Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex,
    0// Offset from the beginning of a single vertex to this attribute
  );

  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3, //Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex,
    2 * Float32Array.BYTES_PER_ELEMENT// Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  //
  // Main render loop
  //

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

};
