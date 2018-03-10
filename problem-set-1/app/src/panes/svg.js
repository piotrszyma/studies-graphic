define(['../turtle', '../wrapper'], ( turtle, domWrapper ) => {
  const _addLine = ({ startX, startY, endX, endY }) => {
    domWrapper.pane.innerHTML += `<line x1=${startX} y1=${startY} x2=${endX} y2=${endY} style="stroke:rgb(255,0,0);stroke-width:2" />`;
  };
  
  const move = ({ distance }) => {
    const {x: currentX, y: currentY} = turtle.getPosition();
    const newX = currentX + Math.sin(distance);
    const newY = currentY + Math.cos(distance);

    turtle.setPosition({
      x: newX,
      y: newY
    });

    _addLine({
      startX: currentX,
      startY: currentY,
      endX: newX,
      endY: newY
    });
  };

  return {
    move,
  };
});
