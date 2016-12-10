
Render = (function() {

function makeDefault(canvas) {
  var gl = canvas.getContext('webgl');
  var shader = createShader(gl, VS_DEFAULT, FS_DEFAULT);
  var raws = [new Float32Array([100, 100, 200, 200, 100, 200])];

  var bodies = _.map(raws, raw => {
    var result = {};
    var points = _.times(raw.length/2, i => raw.subarray(2*i, 2*(i+1)));
    var triangles = _.times(points.length/3, i =>
      [points[3*i], points[3*i+1], points[3*i+2]]);
    var lengths = _.map(triangles, x =>
      _.times(3, i => v2.distance(x[i], x[(i+1)%3])));
    var normals = _.cloneDeep(triangles);
    var buffer = createBuffer(gl, raw);
    var color = [1,0,0,1];

    return { positions: raw, points, triangles, lengths, normals, buffer, color };
  });

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

  canvas.addEventListener('mouseup', function(e) {
    if (dragging != -1) {
      bodies[dragging].color = [1,0,0,1];
    }
    dragging = -1;
  });

  canvas.addEventListener('mousemove', function(e) {
    extractEventPoint(currentPoint, e);
    v2.sub(shiftAmount, currentPoint, lastPoint);
    if (dragging != -1) {
      var points = bodies[dragging].points;
      for (var i = 0; i < points.length; i++) {
        var target = points[i];
        v2.add(target, target, shiftAmount);
      }
    }
    v2.copy(lastPoint, currentPoint);
  });

  function render() {
    requestAnimationFrame(render);

    for (var i = 0; i < bodies.length; i++) {
      Physics.segmentSprings(bodies[i].triangles, bodies[i].lengths);
    }

    for (var i = 0; i < bodies.length; i++) {
      Physics.computeBodyNormals(bodies[i].normals, bodies[i].triangles);
    }

    shader.bind();
    shader.uniforms.viewport = [canvas.width, canvas.height];
    for (var i = 0; i < bodies.length; i++) {
      var buffer = bodies[i].buffer;
      buffer.bind(); 

      gl.bufferData(gl.ARRAY_BUFFER, bodies[i].positions, gl.DYNAMIC_DRAW);
      shader.attributes.position.pointer();
      shader.uniforms.color = bodies[i].color;
      gl.drawArrays(gl.TRIANGLES, 0, buffer.length / 8);
    }
  }

  return { render };
}

return { makeDefault };

})();

