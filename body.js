var Body = (function () {
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

  function generateTextureCoords(points, i, j) {
    var vert = 2, horz = 3;
    var width = _.chain(points).map(0).max().value();
    var height = _.chain(points).map(1).max().value();
    return _.map(points, p => [(p[0]/width+i)/horz, (p[1]/height+j)/vert]);
  }

  var shapes = [
    {
      asset: 'I',
      coords: triangulateFromBlocks([[0, 0], [0, 1], [0, 2], [0, 3]]), // I
      attachments: {
        'hat': [0.5, 0],
        'mustache': [0.5, 0.5],
        'broach': [0.5, 1],
        'cactus': [1, 2],
        'cane': [0, 2],
        'watch': [1, 3],
        'bouquet': [0.5, 2],
        'nose': [0.5, 0.5],
      },
    },
    {
      asset: 'L',
      coords: triangulateFromBlocks([[0, 0], [1, 0], [1, 1], [1, 2]]), // L
      attachments: {
        'hat': [0, 0.5],
        'mustache': [0.5, 0.5],
        'broach': [1.5, 0.5],
        'cactus': [2, 2],
        'cane': [1, 2],
        'watch': [2, 3],
        'bouquet': [1.5, 2],
        'nose': [0.5, 0.5],
      },
    },
    {
      asset: 'Z',
      coords: triangulateFromBlocks([[0, 0], [1, 0], [1, 1], [2, 1]]), // Z
      attachments: {
        'hat': [0, 0.5],
        'mustache': [0.5, 0.5],
        'broach': [1.5, 0.5],
        'cactus': [2, 1],
        'cane': [1, 1],
        'watch': [2, 2],
        'bouquet': [1.5, 1],
        'nose': [0.5, 0.5],
      },
    },
    {
      asset: 'O',
      coords: triangulateFromBlocks([[0, 0], [1, 0], [1, 1], [0, 1]]), // block
      attachments: {
        'hat': [1, 0],
        'mustache': [1, 0.5],
        'broach': [1, 1],
        'cactus': [2, 1],
        'cane': [0, 1],
        'watch': [2, 1.5],
        'bouquet': [1, 1.5],
        'nose': [1, 0.5],
      },
    },
  ];

  function triangulateFromBlocks(blocks) {
    var points = [];
    var pointsMap = {};
    var pointsMapIndex = 0;

    function addPoint(point) {
      var key = point[0] + '-' + point[1];
      if (key in pointsMap) {
        return pointsMap[key];
      }

      points.push(point);
      pointsMap[key] = pointsMapIndex;
      pointsMapIndex++;
      return pointsMap[key];
    }

    var pointsPerBlock = blocks.map(function (block) {
      return [
        [
          addPoint([block[0], block[1]]),
          addPoint([block[0] + 1, block[1]]),
          addPoint([block[0], block[1] + 1]),
        ],
        [
          addPoint([block[0] + 1, block[1]]),
          addPoint([block[0] + 1, block[1] + 1]),
          addPoint([block[0], block[1] + 1]),
        ],
      ];
    });

    var lines = blocks.map(function(block) {
      return [
        [
          addPoint([block[0], block[1]]),
          addPoint([block[0] + 1, block[1]]),
        ],
        [
          addPoint([block[0], block[1]]),
          addPoint([block[0], block[1] + 1]),
        ],
        [
          addPoint([block[0], block[1]]),
          addPoint([block[0] + 1, block[1] + 1]),
        ],
        [
          addPoint([block[0], block[1] + 1]),
          addPoint([block[0] + 1, block[1]]),
        ],
        [
          addPoint([block[0] + 1, block[1]]),
          addPoint([block[0] + 1, block[1] + 1]),
        ],
        [
          addPoint([block[0], block[1] + 1]),
          addPoint([block[0] + 1, block[1] + 1]),
        ]
      ];
    });

    return {
      triangles: _.flatten(pointsPerBlock, true),
      lines: _.flatten(lines),
      points: points,
    };
  }

  function bodyGenerate() {
    var gender = _.sample(genders);
    var name = _.compact([
      _.sample(prefixes[gender]),
      _.sample(surnames),
      _.sample(postfixes),
    ]).join(' ');
    var numAccessories = Math.ceil(Math.random() * 3);
    var bodyAccessories = _.sample(accessories, numAccessories);

    var shape = _.sample(shapes);
    var clothing = _.sample([0,1,2]);
    var base = _.sample([0,1,2]);

    var texcoords = {
      base: generateTextureCoords(shape.coords.points, base, 0),
      clothing: generateTextureCoords(shape.coords.points, clothing, 1)
    };

    return {
      gender: gender,
      name: name,
      base,
      clothing,
      shape,
      texcoords,
      accessories: bodyAccessories,
      freshness: 100,
    };
  }

  return {
    generate: bodyGenerate,
  };
})();
