// ================================
//          DOM SECTION
// ================================

const SVG = document.querySelector('#main');

let HEIGHT = SVG.clientHeight / 2;
let WIDTH = SVG.clientWidth / 2;


window.addEventListener('resize', () => {
  HEIGHT = SVG.clientHeight / 2;
  WIDTH = SVG.clientWidth / 2;
  SVG.innerHTML = '';
  
drawFigure(outerFrameVertexes, 'outer-frame');
drawFigure(playerBrickVertexes, 'player');

getWallsVertexes().map(vertexPair => {
  const [leftVertex, rightVertex] = vertexPair;
  if (leftVertex) drawFigure(leftVertex, 'wall');  
  if (rightVertex) drawFigure(rightVertex, 'wall');  
});
})

// ================================
//          DATA SECTION
// ================================

const MAX_DEPTH = 6;

const WALL_THICKNESS = 0.5;

const WIDTH_UNITS = 10;

const WIDTH_UNIT = WIDTH / 5;

const EDGES = [
  [0, 1],
  [0, 3],
  [0, 4],
  [1, 2],
  [1, 5],
  [2, 3],
  [2, 6],
  [3, 7],
  [4, 5],
  [4, 7],
  [5, 6],
  [6, 7]
]

const outerFrameVertexes = [
  [WIDTH, HEIGHT, 1], // 0 
  [-WIDTH, HEIGHT, 1], // 1
  [-WIDTH, -HEIGHT, 1], // 2
  [WIDTH, -HEIGHT, 1], // 3
  [WIDTH, HEIGHT, MAX_DEPTH], // 4
  [-WIDTH, HEIGHT, MAX_DEPTH], // 5
  [-WIDTH, -HEIGHT, MAX_DEPTH], // 6
  [WIDTH, -HEIGHT, MAX_DEPTH], // 7
]

const playerBrickVertexes = [
  [WIDTH / WIDTH_UNITS,  HEIGHT / 2, 0.5], // 0 
  [-WIDTH / WIDTH_UNITS, HEIGHT / 2, 0.5], // 1
  [-WIDTH / WIDTH_UNITS, HEIGHT / 10, 0.5], // 2
  [WIDTH / WIDTH_UNITS,  HEIGHT / 10, 0.5], // 3
  [WIDTH / WIDTH_UNITS,  HEIGHT / 2, 0.5 + WALL_THICKNESS / 2], // 4
  [-WIDTH / WIDTH_UNITS, HEIGHT / 2, 0.5 + WALL_THICKNESS / 2], // 5
  [-WIDTH / WIDTH_UNITS, HEIGHT / 10, 0.5 + WALL_THICKNESS / 2], // 6
  [WIDTH / WIDTH_UNITS,  HEIGHT / 10, 0.5 + WALL_THICKNESS / 2], // 7
]

// start, end between 0 and 10
// depth 2 - 8
const generateVertex = (start, end, depth) => {
  return [
    [end, HEIGHT, depth], // 0 
    [start, HEIGHT, depth], // 1
    [start, - HEIGHT, depth], // 2
    [end, - HEIGHT, depth], // 3
    [end, HEIGHT, depth + WALL_THICKNESS], // 4
    [start, HEIGHT, depth + WALL_THICKNESS], // 5
    [start, - HEIGHT, depth + WALL_THICKNESS], // 6
    [end, -HEIGHT, depth + WALL_THICKNESS], // 7
  ];
}

// ================================
//          CODE SECTION
// ================================


const moveFigureLeftRight = (vertexes, value) => vertexes.map(v => {
  v[0] += value;
  return [...v];
});

const moveFigureForward = (vertexes, value) => vertexes.map(v => {
  v[2] += value;
  return [...v]
})

const randomRGB = () => ~~(Math.random() * 255);

const getColor = (type) => {
  switch (type) {
    case 'player':
      return 'red';
    default:
      return 'rgb(0, 233, 0)';
  }
}

const addLine = (x1, y1, x2, y2, type) => {
  requestAnimationFrame(() => {
    SVG.innerHTML += `<line 
    x1="${x1 + WIDTH}" 
    y1="${y1  + HEIGHT}" 
    x2="${x2 + WIDTH}" 
    y2="${y2 + HEIGHT}" 
    ${type ? 'class=' + type : ''}
    style="stroke: ${getColor(type)};">`
  })
}

const mapXYZtoXY = (x, y, z) => {
  return [x / ( z ), y / ( z )];
}

const drawFigure = (vertexes, type) => {
  EDGES.map((pos) => {
    const [start, end] = pos;
    const [x1, y1, z1] = vertexes[start];
    const [x2, y2, z2] = vertexes[end];
    const [x1p, y1p] = mapXYZtoXY(x1, y1, z1);
    const [x2p, y2p] = mapXYZtoXY(x2, y2, z2);
    addLine(x1p, y1p, x2p, y2p, type);
  });
}

const getWallsVertexes = () => Array
      .from({length: 4}, () => ~~(Math.random() * 4))
      .map(h => {
        if ( h === 0 ) {
          return [null, [2, 10]]
        } else if ( h === 9 ) {
          return [[0, 8], null]
        } else {
          return [[0, h], [h + 2, 10]]      
        }
      }).map(p => {
        const [left, right] = p

        if ( left === null ) {
          const [rightLeft, rightRight] = right;
          return [null, [rightLeft * WIDTH_UNIT - WIDTH, rightRight * WIDTH_UNIT - WIDTH]];
        } else if ( right === null ) {
          const [leftLeft, leftRight] = left;
          return [[leftLeft * WIDTH_UNIT - WIDTH, leftRight * WIDTH_UNIT - WIDTH], null];
        } else {
          const [leftLeft, leftRight] = left;
          const [rightLeft, rightRight] = right;
          return [
            [leftLeft * WIDTH_UNIT - WIDTH, leftRight * WIDTH_UNIT - WIDTH],  
            [rightLeft * WIDTH_UNIT - WIDTH, rightRight * WIDTH_UNIT - WIDTH]
          ];
        }
      }).map((w, i) => {
        const [left, right] = w;

          if ( left === null ) {
          const [rightLeft, rightRight] = right;
          return [null, generateVertex(rightLeft, rightRight, i + 1.5)];
        } else if ( right === null ) {
          const [leftLeft, leftRight] = left;
          return [generateVertex(leftLeft, leftRight, i + 1.5), null];
        } else {
          const [leftLeft, leftRight] = left;
          const [rightLeft, rightRight] = right;
          return [
            generateVertex(leftLeft, leftRight, i + 1.5),
            generateVertex(rightLeft, rightRight, i + 1.5)
          ];
        }
      });
  // generate random holes
  // calculate width of each wall
  // return generated vertexes

let DEPTH = playerBrickVertexes[0][2];

const AVAILABLE_KEYS = ['Up', 'Down', 'Left', 'Right'].map(s => `Arrow${s}`);

document.addEventListener("keydown", (event) => {
  if (!AVAILABLE_KEYS.includes(event.key)) return;

  if ('ArrowRight' === event.key) {
    if (playerBrickVertexes[0][0] === WIDTH / 2) return;
    document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));
    drawFigure(moveFigureLeftRight(playerBrickVertexes, WIDTH / WIDTH_UNITS), 'player');
  } else if('ArrowLeft' === event.key) {
    if (playerBrickVertexes[1][0] === -WIDTH / 2) return;
    document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));
    drawFigure(moveFigureLeftRight(playerBrickVertexes, -WIDTH / WIDTH_UNITS), 'player'); 
  } else if ('ArrowUp' === event.key) {
    if (playerBrickVertexes[5][2] === 3.0) return;    
    document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));
    drawFigure(moveFigureForward(playerBrickVertexes, WALL_THICKNESS / 2), 'player');
  } else if ('ArrowDown' === event.key) {
    if (playerBrickVertexes[1][2] === 0.5) return;
    document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));
    drawFigure(moveFigureForward(playerBrickVertexes, -WALL_THICKNESS / 2), 'player');
  }
});

drawFigure(outerFrameVertexes, 'outer-frame');
drawFigure(playerBrickVertexes, 'player');

getWallsVertexes().map(vertexPair => {
  const [leftVertex, rightVertex] = vertexPair;
  if (leftVertex) drawFigure(leftVertex, 'wall');  
  if (rightVertex) drawFigure(rightVertex, 'wall');  
});

// const walls = generateWalls();

// const MAP_DETAILS = walls.map((o, i) => {
//   const [left, right, details] = o;
//   if (left) drawFigure(left, `wall wall-${i}`);
//   if (right) drawFigure(right, `wall wall-${i}`);
//   return details
// })

// setInterval(() => {
//   document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));

//   const START = playerBrickVertexes[1][0];
//   const END = playerBrickVertexes[0][0];
//   const DEPTH = playerBrickVertexes[0][2];

//   if (DEPTH === ~~DEPTH) {
//     const {
//       left,
//       right,
//       depth
//     } = MAP_DETAILS.find(o => o.depth === DEPTH);
//     const [objLeft, objRight] = [(START + 500) / 100, (END + 500) / 100]

//     console.log(DEPTH);

//     if (objLeft < left || objRight > right) {
//       // alert("You lost");
//       // location.reload();
//     } else {
//       const wallsToColor = document.querySelectorAll(`.wall-${DEPTH - 2}`)
//       wallsToColor.forEach(o => {
//         o.style = 'opacity: 0;'
//       })
//       if (DEPTH > MAX_DEPTH) {
//         // location.reload();
//       }
//     }
//   }
// }, 1000);
