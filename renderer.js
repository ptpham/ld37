
function makeRenderer(canvas) {
  var gl = canvas.getContext('webgl');
  var shader = createShader(gl, VS_DEFAULT, FS_DEFAULT);
  var buffer = createBuffer(gl, [0, 0, 1, 1, 0, 1]);

  return {
    render: function() {
      shader.bind();
      buffer.bind(); 
      shader.attributes.position.pointer();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
}


