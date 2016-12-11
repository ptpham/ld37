
VS_DEFAULT = `
attribute vec2 position;
attribute vec2 texcoord;

varying vec2 v_texcoord;

uniform vec2 viewport;

void main() {
  v_texcoord = texcoord;
  gl_Position = vec4(2.*position/viewport - 1., 0, 1);
}
`

