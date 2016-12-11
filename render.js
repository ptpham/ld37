
Render = (function() {

function makeDefault(canvas) {
  var gl = canvas.getContext('webgl');
  var shader = createShader(gl, VS_DEFAULT, FS_DEFAULT);
  var bodies = [];
  
  function addBody(ids, coords, lines) {
    var positions = new Float32Array(_.chain(ids)
      .flatten().map(i => coords[i]).flatten().value());
    var points = _.times(positions.length/2, i => positions.subarray(2*i, 2*(i+1)));
    coords = _.map(coords, x => new Float32Array(x));
    var shifts = _.cloneDeep(coords);

    var triangles = _.times(points.length/3, i =>
      [points[3*i], points[3*i+1], points[3*i+2]]);
    var lengths = _.map(lines, x => v2.distance(coords[x[0]], coords[x[1]]));
    var normals = _.cloneDeep(triangles);
    var buffer = createBuffer(gl, positions);
    var color = [1,0,0,1];

    var counts = new Float32Array(coords.length);
    var center = v2.create();

    Physics.computeBodyCenter(center, triangles);
    var distances = _.map(triangles, x => v2.distance(x, center));

    bodies.push({ ids, positions, distances, points, shifts, triangles,
      lines, lengths, normals, buffer, color, coords, counts, distances,
      center
    });
  }

  function getBodyBounds(id, min, max) {
    Physics.trianglesMin(min, bodies[id].triangles);
    Physics.trianglesMax(max, bodies[id].triangles);
  }

  addBody([[0,1,2], [2,0,3]], [[100, 100], [200, 100], [200,200], [100,200]],
    [[0,1], [1,2],[2,0], [2,3], [3,0], [1,3]]);
  addBody([[0,1,2], [2,0,3]], [[210, 210], [300, 210], [300,300], [210,300]],
    [[0,1], [1,2],[2,0], [2,3], [3,0], [1,3]]);

  var dragging = -1;
  var lastPoint = v2.create();
  var currentPoint = v2.create();
  var shiftAmount = v2.create();

  function extractEventPoint(result, e) {
    result[0] = e.clientX - canvas.offsetLeft;
    result[1] = canvas.offsetHeight - (e.clientY - canvas.offsetTop);
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
    if (dragging != -1) {
      bodies[dragging].color = [1,0,0,1];
    }
    dragging = -1;
  });

  var draftShift = v2.create();
  function shiftBody(body, point, amount, strength) {
    var points = body.points;

    for (var i = 0; i < points.length; i++) {
      var target = points[i];
      var weight = Math.exp(-v2.distance(target, point)/strength);
      v2.scale(draftShift, amount, weight);
      v2.add(target, target, draftShift);
    }
  }

  var diff = v2.create(), direction = v2.create();
  canvas.addEventListener('mousemove', function(e) {
    extractEventPoint(currentPoint, e);
    v2.sub(shiftAmount, currentPoint, lastPoint);
    var dampening = 1;

    v2.normalize(direction, shiftAmount);
    if (dragging != -1) {
      var body = bodies[dragging];

      var affected = [body];
      for (var i = 0; i < bodies.length; i++) {
        var other = bodies[i];
        if (other == body) continue;

        if (Physics.collideBodyBody(body.triangles, body.normals,
          other.triangles, other.normals)) {

          v2.sub(diff, other.center, body.center);
          v2.normalize(diff, diff);
          var dot = v2.dot(direction, diff);

          if (dot > 0) {
            dampening *= 1 - dot;
            affected.push(other);
          }
        }
      }

      var strength = 100*dampening;
      for (var i = 0; i < affected.length; i++) {
        shiftBody(affected[i], currentPoint, shiftAmount, strength);
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

  function render() {
    requestAnimationFrame(render);
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

      shader.attributes.position.pointer();
      shader.uniforms.color = body.color;
      gl.drawArrays(gl.TRIANGLES, 0, body.buffer.length / 8);
    }
  }

  return { render, addBody, getBodyBounds };
}

return { makeDefault };

})();

