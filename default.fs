
FS_DEFAULT = `
precision mediump float;

varying vec2 v_texcoord;

uniform vec4 color;
uniform vec4 tint;
uniform vec4 mask;
uniform sampler2D texture;

void main() {
  vec4 sample = texture2D(texture, v_texcoord);
  gl_FragColor = sample*mask + tint;
}
`

