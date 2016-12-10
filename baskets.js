var baskets = (function () {
  var numBaskets = 5;
  var basketsEl = document.getElementsByTagName('baskets')[0];

  function initialize() {
    var basketDiv;
    for (var i = 0; i < numBaskets; i++) {
      basketDiv = document.createElement('div');
      basketsEl.appendChild(basketDiv);
    }
  }

  initialize();

  return {
    stockBasket: function (i) {},
    setFlower: function (i) {},
  };
})();
