define(['../turtle', '../wrapper', '../../config'], (turtle, domWrapper, config) => {
  if (config.PANE != 'CANVAS') return;

  const CONTEXT_2D = domWrapper.pane.getContext('2d');
  CONTEXT_2D.beginPath();
  CONTEXT_2D.lineJoin = 'round';
  CONTEXT_2D.lineWidth = 'round';
  CONTEXT_2D.canvas.width = domWrapper.pane.clientWidth;
  CONTEXT_2D.canvas.height = domWrapper.pane.clientHeight;
  CONTEXT_2D.strokeStyle = 'red';
  CONTEXT_2D.fillStyle = 'red';

  CONTEXT_2D.moveTo(
    turtle.x,
    turtle.y
  );
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
    CONTEXT_2D.lineTo(newX, newY);
    CONTEXT_2D.stroke();

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