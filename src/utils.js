function getCanvasScaleRatio(context) {
  // source: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
  let devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                          context.mozBackingStorePixelRatio ||
                          context.msBackingStorePixelRatio ||
                          context.oBackingStorePixelRatio ||
                          context.backingStorePixelRatio || 1;

  return devicePixelRatio / backingStoreRatio;
}

const utils = {
  getCanvasScaleRatio
};

export default utils;
