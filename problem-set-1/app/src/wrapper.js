define(['../config', './turtle'], (config, turtle) => {
  const [status, input, pane, output, pointer] = ['status', 'input', 'pane', 'output', 'pointer']
  .map((event) => document.getElementById(event));

  pointer.adjust = () => {
    requestAnimationFrame(() => {
      pointer.style = `left: ${turtle.x - 7.5}px; top: ${turtle.y - 7.5}px; transform: rotate(-${turtle.direction % 360 + 45 + 180}deg);`;
      status.innerHTML =
        `X: ${~~(turtle.x * (1 / config.SCALE_RATIO))} \
         Y: ${~~((turtle.y + 2 * (config.Y_CENTER - turtle.y)) * (1 / config.SCALE_RATIO))}\
         (<span class="rotation" style="transform: rotate(${(-1 * turtle.direction) % 360}deg)">↓</span>)`
    });
  }

  config.SCALE_RATIO = pane.clientWidth / config.VIRTUAL_WIDTH;
  config.Y_CENTER = pane.clientHeight / 2;
  turtle.y = pane.clientHeight;
  pointer.adjust();
  return {
    status,
    input,
    pane,
    output,
    pointer,
    print: (line) => output.innerHTML += `<p>${line}</p>`
  };
});