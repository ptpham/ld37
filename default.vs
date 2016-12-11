
VS_DEFAULT = `
attribute vec2 position;
attribute vec2 texcoord;

varying vec2 v_texcoord;

uniform mat3 world;
uniform vec2 viewport;

void main() {
  v_texcoord = texcoord;
  vec2 transformed = (world*vec3(position, 1)).xy;
  gl_Position = vec4(2.*transformed/viewport - 1., 0, 1);
}
`

