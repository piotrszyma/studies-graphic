define(["../config"], ( config ) => ({
  _direction: config.INIT_DIRECTION,
  _x: config.INIT_X,
  _y: config.INIT_Y,
  rotate: ({ degree }) => {
    this._direction = this._direction + degree % 360;
  },
  setPosition: ({ x, y }) => {
    this._x = x;
    this._y = y;
  },
  getPosition: () => ({
    x: this._x, 
    y: this._y
  })
}));
