let $state = {}
let $dom = {}

const interpret = (command) => {
  return command;
  // move turtle
  // return output
};

const print = (text) => {
  $dom.console.append(`<p>${text}</p>`)
}

const move = (distance) => {
  
}

const rotate = (direction) => {
  
}

$(document).ready(() => {
  // Hooks
  $dom.prompt = $('input');
  $dom.console = $('.output');
  $dom.canvas = $('canvas')[0];

  $state.context = $dom.canvas.getContext("2d");
  $state.pane = {
    x: $dom.canvas.clientWidth,
    xCenter: $state.pane.x / 2
    y: $dom.canvas.clientHeight,
    yCenter: $state.pane.y / 2
  }
  $state.turtle = {
    direction: 90,
    position: {
      x: 0.0,
      xMax: 10000.0,
      y: 0.0,
      yMax: 10000.0
    }
  }

  // Event Listeners
  $dom.prompt.on('keypress', (e) => {
    if (e.which === 13) {
      const command = e.target.value;
      try {
        const result = interpret(command);
        print(result);
      } catch (error) {
        print('unknown');
      }
      $dom.prompt.val("")
    }
  });
})
