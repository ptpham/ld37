
Render = (function() {

function makeDefault(canvas) {
  var gl = canvas.getContext('webgl');
  var shader = createShader(gl, VS_DEFAULT, FS_DEFAULT);
  var bodies = [];
  
  function addBody(ids, coords) {
    var positions = new Float32Array(_.chain(ids)
      .flatten().map(i => coords[i]).flatten().value());
    var points = _.times(positions.length/2, i => positions.subarray(2*i, 2*(i+1)));
    var triangles = _.times(points.length/3, i =>
      [points[3*i], points[3*i+1], points[3*i+2]]);

    var lengths = _.map(triangles, x =>
      _.times(3, i => v2.distance(x[i], x[(i+1)%3])));
    var normals = _.cloneDeep(triangles);
    var buffer = createBuffer(gl, positions);
    var color = [1,0,0,1];

    var counts = new Float32Array(coords.length);
    bodies.push({ ids, positions, points, triangles, lengths,
      normals, buffer, color, coords, counts });
  }

  function getBodyBounds(id, min, max) {
    Physics.trianglesMin(min, bodies[id].triangles);
    Physics.trianglesMax(max, bodies[id].triangles);
  }

  addBody([[0,1,2], [2,0,3]], [[100, 100], [200, 100], [200,200], [100,200]]);
  addBody([[0,1,2], [2,0,3]], [[400, 400], [500, 400], [500,500], [400,500]]);

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

  var scaledShift = v2.create();
  canvas.addEventListener('mousemove', function(e) {
    extractEventPoint(currentPoint, e);
    v2.sub(shiftAmount, currentPoint, lastPoint);
    if (dragging != -1) {
      var points = bodies[dragging].points;
      var strength = 100;

      for (var i = 0; i < points.length; i++) {
        var target = points[i];
        var weight = Math.exp(-v2.distance(target, currentPoint)/strength);
        v2.scale(scaledShift, shiftAmount, weight);
        v2.add(target, target, scaledShift);
      }
    }
    v2.copy(lastPoint, currentPoint);
  });

  function render() {
    requestAnimationFrame(render);

    for (var i = 0; i < bodies.length; i++) {
      for (var j = 0; j < bodies.length; j++) {
        if (i == j) continue; 

        var value = 0;
        if (Physics.collideBodyBody(bodies[i].triangles, bodies[i].normals,
          bodies[j].triangles, bodies[j].normals)) {
          value = 1;
        }
        bodies[i].color[2] = value;
        bodies[j].color[2] = value;
      }
    }

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      Physics.segmentSprings(body.triangles, body.lengths, 1);
      Physics.averageCommonPoints(body.triangles, body.ids, body.counts, body.coords);
    }

    for (var i = 0; i < bodies.length; i++) {
      Physics.computeBodyNormals(bodies[i].normals, bodies[i].triangles);
    }

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

