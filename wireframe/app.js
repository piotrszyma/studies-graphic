// ================================
//          DOM SECTION
// ================================

const SVG = document.querySelector('#main');

// ================================
//          DATA SECTION
// ================================

const MAX_DEPTH = 5;

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
  [500, 250, 1], // 0 
  [-500, 250, 1], // 1
  [-500, -250, 1], // 2
  [500, -250, 1], // 3
  [500, 250, 8], // 4
  [-500, 250, 8], // 5
  [-500, -250, 8], // 6
  [500, -250, 8], // 7
]

const playerBrickVertexes = [
  [50, 250, 1], // 0 
  [-50, 250, 1], // 1
  [-50, 50, 1], // 2
  [50, 50, 1], // 3
  [50, 250, 1.5], // 4
  [-50, 250, 1.5], // 5
  [-50, 0, 1.5], // 6
  [50, 0, 1.5], // 7
]

// start, end between 0 and 10
// depth 2 - 8
const generateVertex = (start, end, depth) => {
  return [
    [end, 250, depth], // 0 
    [start, 250, depth], // 1
    [start, -250, depth], // 2
    [end, -250, depth], // 3
    [end, 250, depth + 0.5], // 4
    [start, 250, depth + 0.5], // 5
    [start, -250, depth + 0.5], // 6
    [end, -250, depth + 0.5], // 7
  ].map(vertex => {
    vertex[0] = (vertex[0] - 5) * 100;
    return [...vertex];
  })
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
    x1="${x1 + 500}" 
    y1="${y1  + 250}" 
    x2="${x2 + 500}" 
    y2="${y2 + 250}" 
    ${type ? 'class=' + type : ''}
    style="stroke: ${getColor(type)};">`
  })
}

const mapXYZtoXY = (x, y, z) => {
  return [x / z, y / z];
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

const generateWalls = () => {
  const holes = Array.from({
    length: 4
  }, () => Math.floor(Math.random() * 10));

  return holes.map((h, i) => {
    const depth = i + 2;
    const leftMax = h - 1;
    const rightMin = h + 1;
    const generatedLeftVertex = leftMax > 0 ? generateVertex(0, leftMax, depth) : null;
    const generatedRightVertex = rightMin < 10 ? generateVertex(rightMin, 10, depth) : null;
    const details = {
      depth: depth,
      left: h - 1,
      right: h + 1
    }
    return [generatedLeftVertex, generatedRightVertex, details];
  });

}

let DEPTH = playerBrickVertexes[0][2];

document.addEventListener("keydown", (event) => {
  console.log(playerBrickVertexes[0]);

  if (['ArrowRight', 'ArrowLeft'].includes(event.key)) {
    if ('ArrowRight' === event.key) {
      if (playerBrickVertexes[0][0] > 450) return;
      document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));
      drawFigure(moveFigureLeftRight(playerBrickVertexes, 50), 'player');
    } else {
      if (playerBrickVertexes[0][0] < -350) return;
      document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));
      drawFigure(moveFigureLeftRight(playerBrickVertexes, -50), 'player');
    }
  }
});

drawFigure(outerFrameVertexes, 'outer-frame');
drawFigure(playerBrickVertexes, 'player');

const walls = generateWalls();

const MAP_DETAILS = walls.map((o, i) => {
  const [left, right, details] = o;
  if (left) drawFigure(left, `wall-${i}`);
  if (right) drawFigure(right, `wall-${i}`);
  return details
})

setInterval(() => {
  document.querySelectorAll('.player').forEach(o => o.parentNode.removeChild(o));
  drawFigure(moveFigureForward(playerBrickVertexes, 0.5), 'player');

  const START = playerBrickVertexes[1][0];
  const END = playerBrickVertexes[0][0];
  const DEPTH = playerBrickVertexes[0][2];
  if (DEPTH === ~~DEPTH) {
    const {
      left,
      right,
      depth
    } = MAP_DETAILS.find(o => o.depth === DEPTH);
    const [objLeft, objRight] = [(START + 500) / 100, (END + 500) / 100]

    if (objLeft < left || objRight > right) {
      alert("You lost");
      location.reload();
    } else {
      const wallsToColor = document.querySelectorAll(`.wall-${DEPTH - 2}`)
      wallsToColor.forEach(o => {
        o.style = 'opacity: 0;'
      })

      if (DEPTH === MAX_DEPTH) {
        alert("You won");
        location.reload();
      }
    }
  }



}, 1000);