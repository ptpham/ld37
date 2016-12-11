
Render = (function() {

var NO_MASK_COLOR = [1,1,1,1];
var NO_TIN_COLOR = [0,0,0,0];
var COFFIN_TINT_COLOR = [0.4,0,0,0];
var COFFIN_MASK_COLOR = [1,1,1,0.5];
var WORLD_IDENTITY = m3.create();
var AC_SIZE = 20;

function makeDefault(canvas) {
  var gl = canvas.getContext('webgl');
  var shader = createShader(gl, VS_DEFAULT, FS_DEFAULT);
  var squareBuffer = createBuffer(gl, _.map([0,0,1,0,0,1,1,0,1,1,0,1], x => AC_SIZE*x));
  var textures = {};
  var bodies = [];

  function prepareTextures() {
    for (var img of document.querySelectorAll('img.texture')) {
      textures[img.getAttribute('name')] = createTexture(gl, img);
    }
  }
  
  function addBody(ids, coordsBody, texcoords, lines, shapeName, attachPoints) {
    var positions = new Float32Array(_.chain(ids)
      .flatten().map(i => coordsBody[i]).flatten().value());
    var points = _.times(positions.length/2, i => positions.subarray(2*i, 2*(i+1)));

    coords = _.map(coordsBody.concat(attachPoints), x => new Float32Array(x));
    var attachments = coords.slice(coords.length - attachPoints.length);
    var shifts = _.cloneDeep(coords);

    var triangles = _.times(points.length/3, i =>
      [points[3*i], points[3*i+1], points[3*i+2]]);

    lines = _.concat(lines, _.chain(attachments).map((x,a) =>
      _.chain(coordsBody.length).times().sortBy(i => v2.distance(x, coordsBody[i])).take(4)
        .flatten().map(i => [coordsBody.length + a,i]).value()).flatten().value());

    var lengths = _.map(lines, x => v2.distance(coords[x[0]], coords[x[1]]));
    var normals = _.cloneDeep(triangles);
    var buffer = createBuffer(gl, positions);
    var color = [1,0,0,1];

    var counts = new Float32Array(coords.length);
    var center = v2.create();

    Physics.computeBodyCenter(center, triangles);
    var distances = _.map(triangles, x => v2.distance(x, center));

    function makeTextureCoordBuffer(x) {
      return createBuffer(gl, _.chain(ids).flatten().map(i => x[i]).flatten().value());
    }

    texcoords = _.mapValues(texcoords, (x,name) => {
      if (name == 'accessories') return _.map(x, makeTextureCoordBuffer);
      return makeTextureCoordBuffer(x);
    });
    var texture = textures[shapeName];

    function getBounds(min, max) {
      Physics.trianglesMin(min, triangles);
      Physics.trianglesMax(max, triangles);
    }

    function addShift(shift) {
      for (var i = 0; i < triangles.length; i++) {
        for (var j = 0; j < 3; j++) {
          v2.add(triangles[i][j], triangles[i][j], shift);
        }
      }
    }

    var result = { ids, positions, distances, points, shifts, triangles,
      lines, lengths, normals, buffer, color, coords, counts, distances,
      center, texcoords, texture, getBounds, addShift, attachments
    };

    bodies.push(result);
    return result;
  }

  function removeBody(body) {
    var index = bodies.indexOf(body);
    if (index != -1) bodies.splice(index, 1);
  }

  function addTestBody() {
    addBody([[0,1,2], [2,0,3]], [[100, 100], [200, 100], [200,200], [100,200]],
      [[0,1], [1,2],[2,0], [2,3], [3,0], [1,3]]);
  }

  var dragging = -1;
  var lastPoint = v2.create();
  var currentPoint = v2.create();
  var shiftAmount = v2.create();

  function extractEventPoint(result, e) {
    var parent = canvas.parentElement;
    result[0] = e.clientX - parent.offsetLeft;
    result[1] = parent.offsetHeight - (e.clientY - parent.offsetTop);
  }

  canvas.addEventListener('mousedown', function(e) {
    extractEventPoint(currentPoint, e);
    for (var i = 0; i < bodies.length; i++) {
      if (Physics.collideBodyPoint(bodies[i].triangles, bodies[i].normals, currentPoint)) {
        v2.copy(lastPoint, currentPoint);
        bodies[i].color = [0,1,0,1];
        dragging = i;
        break;
      }
    }
  });

  window.addEventListener('mouseup', function(e) {
    var body = bodies[dragging];
    if (body != null) {
      body.color = [1,0,0,1];
    }
    dragging = -1;
  });

  var diff = v2.create(), direction = v2.create();
  var min = v2.create(), max = v2.create();
  canvas.addEventListener('mousemove', function(e) {
    extractEventPoint(currentPoint, e);
    v2.sub(shiftAmount, currentPoint, lastPoint);
    var dampening = 1;

    v2.normalize(direction, shiftAmount);
    var body = bodies[dragging];
    if (body != null) {
      var affected = [body];
      Physics.trianglesMin(min, body.triangles);
      Physics.trianglesMax(max, body.triangles);
      if (min[0] < 0 && direction[0] < 0) { shiftAmount[0] = 0; }
      if (max[0] > canvas.width && direction[0] > 0) { shiftAmount[0] = 0; }
      if (min[1] < 0 && direction[1] < 0) { shiftAmount[1] = 0; }
      if (max[1] > canvas.height && direction[1] > 0) { shiftAmount[1] = 0; }

      for (var i = 0; i < bodies.length; i++) {
        var other = bodies[i];

        if (other == body) continue;

        if (Physics.collideBodyBody(body.triangles, body.normals,
          other.triangles, other.normals)) {
          dampening *= Physics.boundaryDampening(other.triangles,
            direction, canvas.width, canvas.height);

          v2.sub(diff, other.center, body.center);
          v2.normalize(diff, diff);
          var dot = v2.dot(direction, diff);

          if (dot > 0) {
            dampening *= 1 - dot;
            affected.push(other);
          }
        }
      }

      var strength = 350*dampening;
      for (var i = 0; i < affected.length; i++) {
        Physics.shiftBody(affected[i].points, currentPoint, shiftAmount, strength);
      }
    }
    v2.copy(lastPoint, currentPoint);
  });

  function recomputeBodies() {
    for (var i = 0; i < bodies.length; i++) {
      Physics.computeBodyNormals(bodies[i].normals, bodies[i].triangles);
      Physics.computeBodyCenter(bodies[i].center, bodies[i].triangles);
    }
  }

  var world = m3.create();
  var diff2 = v2.create();
  function render() {
    requestAnimationFrame(render);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];

      var triangles = body.triangles;
      var coords = body.coords;
      var ids = body.ids;

      Physics.extractCommonPoints(triangles, ids, coords);
      Physics.segmentSprings(body.lines, body.lengths, coords,
        1, body.counts, body.shifts);
      Physics.replicateCommonPoints(triangles, ids, coords);
    }
    recomputeBodies();

    shader.bind();
    shader.uniforms.viewport = [canvas.width, canvas.height];
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];

      body.buffer.bind(); 
      gl.bufferData(gl.ARRAY_BUFFER, body.positions, gl.DYNAMIC_DRAW);
      shader.uniforms.color = body.color;
      
      var times = body.coffin ? 2 : 1;
      for (var j = 0; j < times; j++) {
        body.buffer.bind(); 
        shader.attributes.position.pointer();

        if (body.coffin && j == 0) {
          v2.sub(diff, body.coffin.center, body.center);
          shader.uniforms.world = m3.fromTranslation(world, diff);
          shader.uniforms.mask = COFFIN_MASK_COLOR;
          shader.uniforms.tint = COFFIN_TINT_COLOR;
        } else {
          v2.set(diff, 0, 0);
          shader.uniforms.world = WORLD_IDENTITY;
          shader.uniforms.mask = NO_MASK_COLOR;
          shader.uniforms.tint = NO_TINT_COLOR;
        }

        shader.uniforms.texture = body.texture.bind();
        body.texcoords.base.bind();
        shader.attributes.texcoord.pointer();
        gl.drawArrays(gl.TRIANGLES, 0, body.buffer.length / 8);

        body.texcoords.clothing.bind();
        shader.attributes.texcoord.pointer();
        gl.drawArrays(gl.TRIANGLES, 0, body.buffer.length / 8);

        var attachments = body.attachments;
        shader.uniforms.texture = textures.accessories.bind();

        body.buffer.unbind();
        squareBuffer.bind(); 
        shader.attributes.position.pointer();
        for (var k = 0; k < attachments.length; k++) {
          body.texcoords.accessories[k].bind();
          shader.attributes.texcoord.pointer();

          v2.add(diff2, diff, attachments[k]);
          shader.uniforms.world = m3.fromTranslation(world, diff2);
          gl.drawArrays(gl.TRIANGLES, 0, squareBuffer.length / 8);
        }
        squareBuffer.unbind();
      }
    }
  }

  return { render, addBody, removeBody, prepareTextures };
}

return { makeDefault };

})();

