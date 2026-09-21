import React, { useEffect, useRef } from 'react';

/**
 * WebGL shader animation — flowing radial laser lines adapted from the Orbit design system.
 * Pure native WebGL quad with zero external dependencies.
 * Tuned with Orbit's signature electric orange and warm ember palette.
 */
export function ShaderAnimation({
  className = '',
  speed = 1,
  intensity = 1.25,
  warm = [1.0, 0.337, 0.0], // Orbit Electric Orange #FF5600
  cool = [0.72, 0.15, 0.0], // Deep Ember #B83F00
  reducedMotion = false,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec3 warm;
      uniform vec3 cool;
      uniform float intensity;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.05;
        float lineWidth = 0.0022;
        vec3 raw = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            float fi = float(i);
            float fj = float(j);
            raw[j] += lineWidth * (fi * fi) / abs(fract(t - 0.01 * fj + fi * 0.01) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.2));
          }
        }
        float mixT = smoothstep(-0.6, 0.6, uv.x);
        vec3 tint = mix(warm, cool, mixT);
        vec3 color = raw * tint * intensity;
        float vig = smoothstep(1.3, 0.2, length(uv));
        gl_FragColor = vec4(color * vig, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'resolution');
    const timeLoc = gl.getUniformLocation(program, 'time');
    const warmLoc = gl.getUniformLocation(program, 'warm');
    const coolLoc = gl.getUniformLocation(program, 'cool');
    const intLoc = gl.getUniformLocation(program, 'intensity');

    let animId;
    let startTime = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    function render(now) {
      resize();
      const elapsed = (now - startTime) * 0.001 * (reducedMotion ? 0.25 : speed);

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform3fv(warmLoc, warm);
      gl.uniform3fv(coolLoc, cool);
      gl.uniform1f(intLoc, intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteBuffer(posBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [speed, intensity, warm, cool, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
