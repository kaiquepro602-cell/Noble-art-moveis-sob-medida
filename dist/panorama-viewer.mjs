// Full spherical 360 x 180 degree view of an illustrative AI panorama.
// Texture and GPU resources load only when the visitor opens the room.
import { cameraView, radians } from './panorama-math.mjs';
const vertex = `attribute vec2 position; varying vec2 screen;
void main(){screen=position;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
varying vec2 screen;uniform sampler2D photo;
uniform float aspect;uniform float fov;uniform float yaw;uniform float pitch;
void main(){
 vec3 ray=normalize(vec3(screen.x*aspect*tan(fov*.5),screen.y*tan(fov*.5),-1.));
 float cy=cos(yaw),sy=sin(yaw),cp=cos(pitch),sp=sin(pitch);
 ray=vec3(ray.x,ray.y*cp-ray.z*sp,ray.y*sp+ray.z*cp);
 ray=vec3(ray.x*cy-ray.z*sy,ray.y,ray.x*sy+ray.z*cy);
 float lon=atan(ray.x,-ray.z);float lat=asin(clamp(ray.y,-1.,1.));
 vec2 uv=vec2(fract(.5+lon/6.283185307),clamp(.5-lat/3.141592654,.0001,.9999));
 gl_FragColor=texture2D(photo,uv);
}`;

export async function createPanoramaViewer(canvas, source) {
  const gl = canvas.getContext('webgl', {alpha:false, antialias:false, depth:false,
    stencil:false, preserveDrawingBuffer:false, powerPreference:'low-power'});
  if (!gl || gl.isContextLost()) throw new Error('Vista 360° indisponível neste navegador.');
  let disposed = false, program = null, buffer = null, texture = null;
  const shaders = [];
  function destroy() {
    if (disposed) return;
    disposed = true;
    shaders.forEach(shader => gl.deleteShader(shader));
    shaders.length = 0;
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    canvas.width = 1; canvas.height = 1;
  }
  function compile(type, code) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Não foi possível preparar a vista 360°.');
    shaders.push(shader); gl.shaderSource(shader, code); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Não foi possível preparar a vista 360°.');
    return shader;
  }
  try {
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
    program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Não foi possível preparar a vista 360°.');
    shaders.forEach(shader => gl.deleteShader(shader)); shaders.length = 0;
    gl.useProgram(program); buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const photo = new Image(); photo.decoding = 'async';
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('A vista 360° demorou para carregar. Tente novamente.')), 15000);
      photo.onload = () => {clearTimeout(timeout); resolve();};
      photo.onerror = () => {clearTimeout(timeout); reject(new Error('Não foi possível carregar a vista 360°.'));};
      photo.src = source;
    });
    if (gl.isContextLost()) throw new Error('Vista 360° interrompida.');
    if (Math.abs(photo.naturalWidth / photo.naturalHeight - 2) > 0.01)
      throw new Error('A vista 360° precisa de uma imagem na proporção 2:1.');
    if (photo.naturalWidth > gl.getParameter(gl.MAX_TEXTURE_SIZE))
      throw new Error('A imagem excede a capacidade deste dispositivo.');
    texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
    const uniforms = Object.fromEntries(['aspect','fov','yaw','pitch'].map(key => [key, gl.getUniformLocation(program,key)]));
    return { draw(state) {
      if (disposed || gl.isContextLost()) return;
      const r = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 1.5);
      const view = cameraView({...state, width:r.width, height:r.height});
      const width = Math.max(1, Math.round(r.width * ratio)), height = Math.max(1, Math.round(r.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {canvas.width=width; canvas.height=height;}
      gl.viewport(0,0,width,height); gl.useProgram(program);
      gl.uniform1f(uniforms.aspect,view.aspect); gl.uniform1f(uniforms.fov,view.vfov);
      gl.uniform1f(uniforms.yaw,view.yaw*radians); gl.uniform1f(uniforms.pitch,view.pitch*radians);
      gl.drawArrays(gl.TRIANGLES,0,6);
      return view;
    }, destroy };
  } catch (error) {destroy(); throw error;}
}
