var arrangement = (function () {
  var canvas = document.getElementById('arrangement');
  var arrangementContext = canvas.getContext('2d');

  var generatorCanvas = document.createElement('canvas');
  var generatorContext = generatorCanvas.getContext('2d');

  var silhouetteImage = null;
  var flowers = [];

  function getImageElement(source) {
    var img = document.createElement('img');
    img.setAttribute('src', source);
    return img;
  }

  function drawFlowers(flowers) {
    generatorContext.clearRect(0, 0, canvasSize, canvasSize);
    // TODO
    return generatorContext;
  }

  function drawSilhouette() {
    // TODO: generate random flowers
    var randomFlowers = [];
    var context = drawFlowers(randomFlowers);
    return context.getImageData();
  }

  function render() {
    arrangementContext.clearRect(0, 0, canvasSize, canvasSize);
    arrangementContext.putImageData(silhouetteImage);
    arrangementContext.putImageData(drawFlowers(flowers).getImageData());
  }

  return {
    addFlower: function(flower, context) {},
    removeFlower: function(flower, context) {},
    randomFlower: function() {},

    render: render,

    newArrangement: function() {
      flowers = [];
      silhouetteImage = drawSilhouette();
      render();
    },

    match: function() {},

    clear: function() {},
  };
})();
