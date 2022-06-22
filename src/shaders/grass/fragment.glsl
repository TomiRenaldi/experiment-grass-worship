varying vec2 vUv;
  
void main() 
{
  	vec3 baseColor = vec3(0.60, 1.0, 0.0);
    float clarity = (vUv.y * 0.5 ) * 0.5;
    gl_FragColor = vec4(baseColor * clarity, 1 );
}