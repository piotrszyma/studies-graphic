define(['../turtle', '../wrapper', '../../config'], (turtle, domWrapper, config) => {
  const canvas = document.getElementById('canvas');

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

    // hook for canvas
    canvas.lineTo(newX, newY);
    canvas.stroke();

    turtle.setPosition({
      x: newX,
      y: newY
    });
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
    position
  };
});