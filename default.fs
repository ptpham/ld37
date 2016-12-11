
FS_DEFAULT = `
precision mediump float;

varying vec2 v_texcoord;

uniform vec4 color;
uniform sampler2D texture;

void main() {
  gl_FragColor = texture2D(texture, v_texcoord);
}
`

