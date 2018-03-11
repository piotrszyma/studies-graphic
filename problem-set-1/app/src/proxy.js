define(['../config', './panes/svg', './wrapper', './turtle', './utils'], (config, svg, { print, pointer }, turtle, utils) => {
  const virtualCordsToReal = ({
    x,
    y
  }) => {
    const realY = y * config.SCALE_RATIO;

    return {
      x: x * config.SCALE_RATIO,
      y: (realY + 2 * ((config.Y_CENTER) - realY)),
    };
  };

  const realCoordsToVirtual = ({
    x,
    y
  }) => {
    return {
      x: x * (1 / config.SCALE_RATIO),
      y: (y + 2 * (config.Y_CENTER - y)) * (1 / config.SCALE_RATIO),
    };
  };

  const virtualDistanceToReal = ({
    distance
  }) => {
    return distance * config.SCALE_RATIO;
  };

  const clear = () => {};
  const move = (distance = 0, silent) => {
    const parsedDistance = virtualDistanceToReal({
      distance
    });
    svg.move({
      distance: parsedDistance
    });
    if (!silent) print(`Moved ${distance}`);
    pointer.adjust();
  };
  const rotate = (degree = 0, silent) => {
    svg.rotate({
      degree: degree % 360
    });
    if (!silent) print(`Rotated ${degree % 360} ${utils.rotatedArrow(turtle.direction)}`);
    pointer.adjust();
  };
  const status = (silent) => {
    const {
      x,
      y
    } = realCoordsToVirtual({
      x: turtle.x,
      y: turtle.y
    });

    if (!silent) print(`${turtle.direction}° ${utils.rotatedArrow(turtle.direction)} (${~~x}, ${~~y})`);
  };
  const pos = (x = 0, y = 0, silent) => {
    const {
      x: parsedX,
      y: parsedY
    } = virtualCordsToReal({
      x,
      y
    });
    svg.position({
      x: parsedX,
      y: parsedY
    });
    if (!silent) print(`Changed position to X: ${x} Y: ${y}`);
    pointer.adjust();
  };
  const help = () => {};
  const koch = (level = 1, length = 1) => {};

  const commands = {
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
  };

  const interpret = ({
    commandName,
    args,
    silent
  }) => {
    commands[commandName](...args, silent);
  };

  return {
    interpret
  };
});