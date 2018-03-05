// Settings

// Globals

let $state = {}
let $dom = {}
let COMMANDS_COUNTER = 0;
const RADIANS_MULTIPLIER = Math.PI / 180;
const VIRTUAL_WIDTH = 10000;

let SCALE_RATIO;
let COMMANDS;
let HELP;

// Utils

const _ = d => Math.floor(d);
const validate = n => {
  n = Number.parseFloat(n);
  if (isNaN(n)) {
    throw `Error: ${n} is not a number`
  }
  return n
}

const rotatedArrow = d => `<span class="rotation" style="transform: rotate(-${d}deg)">↓</span>`

const parseCoords = (x, y) => {
  const xp = x;
  const yp = y + 2 * ($state.pane.yCenter - y);
  return [xp, yp]
};

const printCoords = (x, y) => {
  const mul = (x) => x * (1/SCALE_RATIO);
  const [_x, _y] = parseCoords(x, y)
                    .map(mul);
  return `(${_x}, ${_y})`;
};

const printDistance = (d) => {
  return d * (1/SCALE_RATIO);
}

// L   120   L   120   L
// L => L/3   -60    L/3     120    L/3    -60    L#

let KOCH_CACHE = {}

const kochRecursive = (length, currentLevel, targetLevel) => {
  if (targetLevel === 1) {
    return length;
  } else if (targetLevel === currentLevel) {
    return length / 3;
  } else {
    if (KOCH_CACHE[currentLevel]) return KOCH_CACHE[currentLevel];
    const returned = kochRecursive(length / 3, currentLevel + 1, targetLevel);
    KOCH_CACHE[currentLevel] = returned;    
    const result = Array.isArray(returned) ? returned : [returned]
    return [
      ...result,
      "-60", 
      ...result,
      "120", 
      ...result,
      "-60", 
      ...result
    ]
  }
}


const generateKoch = (length, level) => {
  const returned = kochRecursive(length, 1, level);
  const result = Array.isArray(returned) ? returned : [returned]
  KOCH_CACHE = {}
  return [
    ...result,
    "120", 
    ...result, 
    "120", 
    ...result, 
    "120"
  ]
}

// Commands
//
// 1 / 10000 = x / HEIGHT
// x = HEIGHT / 10000
const move = (distance=0) => {
  const parsedDistance = distance * SCALE_RATIO;
  const x0 = $state.turtle.position.x;
  const y0 = $state.turtle.position.y;
  const direction = $state.turtle.direction * RADIANS_MULTIPLIER;
  const x = x0 + parsedDistance * Math.sin(direction);
  const y = y0 + parsedDistance * Math.cos(direction);
  $state.turtle.position.x = x;
  
  $state.turtle.position.y = y;
  $state.context.lineTo(x, y);
  $state.context.stroke();
  return `${printCoords(x0, y0)} ⟹  ${$state.turtle.direction}° ${rotatedArrow($state.turtle.direction)} | ${printDistance(parsedDistance)} units  ⟹ ${printCoords(x, y)}`
}

  
const rotate = (direction=360) => {
  direction = validate(direction);pos 
  $state.turtle.direction = ($state.turtle.direction + direction) % 360;
  return COMMANDS['status']();
}

const status = () => {
  return `${$state.turtle.direction}° ${rotatedArrow($state.turtle.direction)} /\
  ${printCoords($state.turtle.position.x, $state.turtle.position.y)}`
}

const pos = (x=0, y=0) => { 
  let [validX, validY] = [x, y]
          .map(validate)
          .map((c) => c * SCALE_RATIO);
  [x, y] = parseCoords(validX, validY);
  $state.turtle.position.x = x;
  $state.turtle.position.y = y;
  $state.context.moveTo(x, y);

  return COMMANDS['status']();
}

const help = () => {
  return HELP
}

const koch = (level, length) => {
  [length, level] = [length, level].map(validate)
  const scaledLength = length * (SCALE_RATIO);
  const generatedKoch = generateKoch(scaledLength, level)
  generatedKoch.map(e => {
    switch(typeof e) {
      case 'number':
        move(e);
        break;
      case 'string':
        rotate(e);
        break;
      default:
        throw "Unexpected command from generated Koch"
    }
  })
  return `Koch: level: ${level} length: ${length}`
}

const clear = () => {
  $state.context.clearRect(0, 0, canvas.width, canvas.height);
  $state.context.beginPath();
  return 'Cleared'
}

// Command line

const eval = (command) => {
  let [name, arg1, arg2] = command.split(" ")
  if (COMMANDS.hasOwnProperty(name)) {
    return COMMANDS[name](arg1, arg2);
  }
  throw "Unknown command";
};

const interpret = (command) => {
  try {
    const result = eval(command);
    print(result);
  } catch (error) {
    print(error);
  }
};

const print = (line) => {
  COMMANDS_COUNTER++;
  $dom.console.append(`<p>${COMMANDS_COUNTER}> ${line}</p>`)
}

const printMany = (lines) => {
  COMMANDS_COUNTER++;
  $dom.console.append(`<p>${COMMANDS_COUNTER}> ${lines[0]}</p>`)
  lines.slice(1).forEach(c => {
    $dom.console.append(`<p> ${c}</p>`)    
  })
}

// Hooks
$(document).ready(() => {
  $dom.prompt = $('input');
  $dom.console = $('.output');
  $dom.canvas = $('canvas')[0];
  $dom.status = $('.status')[0];
  
  $state.turtle = {
    direction: 0,
    position: {
      x: 0,
      y: 0,
    }
  }

  // Event Listeners
  $dom.prompt.on('keypress', (e) => {
    if (e.which === 13 && e.target.value !== "") {
      const command = e.target.value;
      if (command.indexOf(";") !== -1) {
        commands = command.trim().split(/\s*;\s*/).filter(c => c !== '');
        commands.forEach(c => interpret(c));
      } else {
        interpret(command);
      }
      $dom.prompt.val("");
      $dom.console[0].scrollTop = $dom.console[0].scrollHeight;
    }
  });
  const promptFocus = () => $dom.prompt.focus();
  $dom.console.on('mouseover', promptFocus);
  $dom.prompt.on('mouseover', promptFocus);

  setTimeout(() => {
    $state.context = $dom.canvas.getContext("2d");
    $state.context.lineJoin = 'round';
    $state.context.lineWidth = 'round';
    $state.context.beginPath();
  
    const clientHeight = $dom.canvas.clientHeight;
    const clientWidth = $dom.canvas.clientWidth;
  
    SCALE_RATIO = clientWidth / VIRTUAL_WIDTH;
  
    $state.context.canvas.width = clientWidth;
    $state.context.canvas.height = clientHeight;
    
    $state.context.strokeStyle = 'red';
    $state.context.fillStyle = 'red';
    $state.context.moveTo(
      $state.turtle.position.x,
      $state.turtle.position.y
    );

    $state.pane = {
      x: clientWidth,
      xCenter: Math.floor(clientWidth / 2),
      y: clientHeight,
      yCenter: Math.floor(clientHeight / 2)
    }

    pos(0, 0);
    rotate(135);

    print("Initial values:")   
    print("Canvas height: " + $state.context.canvas.height);
    print("Canvas width: " + $state.context.canvas.width);
    print(`Position: ${printCoords($state.turtle.position.x, $state.turtle.position.y)}`);
    print("Direction: " + $state.turtle.direction);

  }, 100);
})

// Initializers


COMMANDS = {
  'c': clear,
  'cl': clear,
  'clear': clear,

  'm': move,
  'mv': move,
  'move': move,

  'r': rotate,
  'rot': rotate,
  'rotate': rotate,

  's': status,
  'state': status,
  'status': status,

  'p': pos,
  'pos': pos,
  'position': pos,

  'help': help,
  'h': help,

  'koch': koch,
  'k': koch

}

HELP = `

        Simple canvas writer

COMMAND        ARGS         RETURNS

clear/0                     

move/1         distance     old coords
                            direction
                            distance
                            new coords

rotate/1       direction    direction
                            coords

status/0                    direction
                            coords

position/2     x-cord       direction
               y-cord       coords

koch/2         level        level
               length
`
