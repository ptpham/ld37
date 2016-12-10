
VS_DEFAULT = `
attribute vec2 position;
uniform vec2 viewport;

void main() {
  gl_Position = vec4(2.*position/viewport - 1., 0, 1);
}
`

