
Render = (function() {

function makeDefault(canvas) {
  var gl = canvas.getContext('webgl');
  var shader = createShader(gl, VS_DEFAULT, FS_DEFAULT);
  var positions = [new Float32Array([100, 100, 200, 200, 100, 200])];
  var points = _.map(positions, x =>
    _.times(x.length/2, i => x.subarray(2*i, 2*(i+1))));
  var triangles = _.map(points, x => _.times(x.length/3, i => [x[3*i], x[3*i+1], x[3*i+2]]));
  var normals = _.cloneDeep(triangles);
  var buffers = _.map(positions, x => createBuffer(gl, x));
  var colors = _.map(buffers, x => [1,0,0,1]);

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
    for (var i = 0; i < triangles.length; i++) {
      if (Physics.collideBodyPoint(triangles[i], normals[i], currentPoint)) {
        v2.copy(lastPoint, currentPoint);
        colors[i] = [0,1,0,1];
        dragging = i;
        break;
      }
    }
  });

  canvas.addEventListener('mouseup', function(e) {
    if (dragging != -1) {
      colors[dragging] = [1,0,0,1];
    }
    dragging = -1;
  });

  canvas.addEventListener('mousemove', function(e) {
    extractEventPoint(currentPoint, e);
    v2.sub(shiftAmount, currentPoint, lastPoint);
    if (dragging != -1) {
      for (var i = 0; i < points[dragging].length; i++) {
        var target = points[dragging][i];
        v2.add(target, target, shiftAmount);
      }
    }
    v2.copy(lastPoint, currentPoint);
  });

  function render() {
    requestAnimationFrame(render);
    for (var i = 0; i < normals.length; i++) {
      Physics.computeBodyNormals(normals[i], triangles[i]);
    }

    shader.bind();
    shader.uniforms.viewport = [canvas.width, canvas.height];
    for (var i = 0; i < buffers.length; i++) {
      var buffer = buffers[i];
      buffer.bind(); 

      gl.bufferData(gl.ARRAY_BUFFER, positions[0], gl.DYNAMIC_DRAW);
      shader.attributes.position.pointer();
      shader.uniforms.color = colors[i];
      gl.drawArrays(gl.TRIANGLES, 0, buffer.length / 8);
    }
  }

  return { render };
}

return { makeDefault };

})();

