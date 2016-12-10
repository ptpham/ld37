var bodyGenerate = (function () {
  var genders = ['M', 'F'];
  var prefixes = {
    M: ['Mr.', 'Sir', 'Grandpa', 'M.C.', 'Dr.', 'Brother'],
    F: ['Ms.', 'Mrs.', 'Madame', 'Grandma', 'M.C.', 'Dr.', 'Sister'],
  };
  var postfixes = ['Esq.', 'the 3rd', 'Jr.', '', '', '', '', ''];
  var surnames = ['Hat', 'Spots', 'Cookie', 'Bonkedhead', 'Bentover', 'Sneezy'];

  var accessories = [
    'hat',
    'mustache',
    'broach',
    'cactus',
    'cane',
    'watch',
    'bouquet',
    'nose',
  ];

  var shapes = [
    {
      id: 0,
      triangles: triangulateFromBlocks([[0, 0], [0, 1], [0, 2], [0, 3]]), // I
      outline: [[0, 0], [1, 0], [1, 4], [0, 4]],
    },
    {
      id: 1,
      triangles: triangulateFromBlocks([[0, 0], [1, 0], [1, 1], [1, 2]]), // L
      outline: [[0, 0], [2, 0], [2, 3], [1, 3], [1, 1], [0, 1]],
    },
    {
      id: 2,
      triangles: triangulateFromBlocks([[0, 0], [1, 0], [1, 1], [2, 1]]), // Z
      outline: [[0, 0], [2, 0], [2, 1], [3, 1], [3, 2], [1, 2], [1, 1], [1, 0]],
    },
    {
      id: 3,
      triangles: triangulateFromBlocks([[0, 0], [1, 0], [1, 1], [0, 1]]), // block
      outline: [[0, 0], [2, 0], [2, 2], [0, 2]],
    },
  ];

  function triangulateFromBlocks(blocks) {
    var pointsPerBlock = blocks.map(function (block) {
      return [
        [block[0], block[1]],
        [block[0] + 1, block[1]],
        [block[0], block[1] + 1],
        [block[0] + 1, block[1]],
        [block[0] + 1, block[1] + 1],
        [block[0], block[1] + 1],
      ];
    });

    return _.flatten(pointsPerBlock, true);
  }

  return function bodyGenerate() {
    var gender = _.sample(genders);
    var name = _.compact([
      _.sample(prefixes[gender]),
      _.sample(surnames),
      _.sample(postfixes),
    ]).join(' ');
    var numAccessories = Math.ceil(Math.random() * 3);
    var bodyAccessories = _.sample(accessories, numAccessories);
    return {
      gender: gender,
      name: name,
      skin: _.sample([0, 1, 2]),
      hair: _.sample([0, 1, 2]),
      clothing: _.sample([0, 1, 2]),
      shape: _.sample(shapes),
      accessories: bodyAccessories,
    };
  };
})();
