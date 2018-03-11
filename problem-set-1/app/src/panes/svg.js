define(['../turtle', '../wrapper', '../../config', '../koch'], (turtle, domWrapper, config, kochGenerator) => {
  const addLine = ({
    startX,
    startY,
    endX,
    endY
  }) => {
    requestAnimationFrame(() => {
      domWrapper.pane.innerHTML += `<line x1=${startX} y1=${startY} x2=${endX} y2=${endY} style="stroke:rgb(255,0,0);stroke-width:2" />`;
    });
  };

  const move = ({
    distance
  }) => {
    const {
      x: currentX,
      y: currentY
    } = turtle.getPosition();
    const direction = turtle.direction * config.RADIANS_MULTIPLIER;
    const newX = currentX + distance * Math.sin(direction);
    const newY = currentY + distance * Math.cos(direction);

    turtle.setPosition({
      x: newX,
      y: newY
    });

    addLine({
      startX: currentX,
      startY: currentY,
      endX: newX,
      endY: newY
    });
  };

  const fakeMove = ({
    distance
  }) => {
    const {
      x: currentX,
      y: currentY
    } = turtle.getPosition();

    const direction = turtle.direction * config.RADIANS_MULTIPLIER;
    const newX = currentX + distance * Math.sin(direction);
    const newY = currentY + distance * Math.cos(direction);

    turtle.setPosition({
      x: newX,
      y: newY
    });

    return  `<line x1=${currentX} y1=${currentY} x2=${newX} y2=${newY} style="stroke:rgb(255,0,0);stroke-width:2" />`;
  };

  const rotate = ({
    degree
  }) => {
    turtle.rotate({
      degree: degree
    });
  };


  const position = ({
    x = 0,
    y = 0
  }) => {
    turtle.setPosition({
      x,
      y
    });
  };

  return {
    move,
    rotate,
    position,
    fakeMove
  };
});