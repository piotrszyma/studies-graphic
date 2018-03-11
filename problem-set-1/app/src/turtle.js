define(["../config"], (config) => {
  const turtleState = {
    x: config.INIT_X,
    y: config.INIT_Y,
    direction: config.INIT_DIRECTION,
    rotate: ({
      degree
    }) => {
      turtleState.direction = (turtleState.direction + degree) % 360;
      // console.log(`Rotation: New direction: ${turtleState.direction}`);
    },
    setPosition: ({
      x,
      y
    }) => {
      turtleState.x = x;
      turtleState.y = y;
      // console.log(`Position changed: x: ${turtleState.x} y: ${turtleState.y}`);
    },
    getPosition: () => ({
      x: turtleState.x,
      y: turtleState.y
    })
  };
  return turtleState;
});