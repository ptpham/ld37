var assets = (function () {
  function loadTexture(source) {
    var image = new Image();
    image.src = source;
    return image;
  }

  return {
    I: loadTexture('assets/I-shape.png'),
    L: loadTexture('assets/L-shape.png'),
    O: loadTexture('assets/O-shape.png'),
    Z: loadTexture('assets/Z-shape.png'),
  };
})();
