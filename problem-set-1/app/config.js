define(() => {
  const pane = ['SVG', 'CANVAS'].includes(window.name) ? window.name : 'SVG';
  console.log(pane);
  window.name = pane;
  return {
    RADIANS_MULTIPLIER: Math.PI / 180,
    VIRTUAL_WIDTH: 10000,
    SCALE_RATIO: 1, //change in wrapper
    Y_CENTER: 0, // change in wrapper
    INIT_X: 0,
    INIT_Y: 0,
    INIT_DIRECTION: 180 - 45,
    PANE: pane
  }
});