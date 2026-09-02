import { useEffect, useRef } from 'react'
import '../../css-animations.css'

class Vec3 {
  constructor(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  normalize() {
    const l = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    return new Vec3(this.x/l, this.y/l, this.z/l);
  }
  multiplyScalar(s) { return new Vec3(this.x*s, this.y*s, this.z*s); }
  add(v) { return new Vec3(this.x+v.x, this.y+v.y, this.z+v.z); }
}

export default function AuraOrb({ className = '', variant = 'small' }) {
  const globeRef = useRef(null);

  const isLarge = variant === 'large';
  const isIcon = variant === 'icon';
  const R = isLarge ? 60 : 45;
  const b1Size = isLarge ? 270 : 180;
  const b2Size = isLarge ? 330 : 220;
  const b3Size = isLarge ? 390 : 260;
  const glowSize = isLarge ? 165 : 110;
  const blurAmt = isLarge ? 12 : 8;
  const backdropSize = isLarge ? 120 : 80;

  // Compute container scale
  let containerScale = 'scale(1.5)';
  if (isLarge) containerScale = 'scale(2.25)';
  if (isIcon) containerScale = 'scale(0.35)';

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    
    const existingEdges = globe.querySelectorAll('.css-wireframe-edge');
    existingEdges.forEach(e => e.remove());

    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    
    let vertices = [
      new Vec3(-1,  t,  0), new Vec3( 1,  t,  0), new Vec3(-1, -t,  0), new Vec3( 1, -t,  0),
      new Vec3( 0, -1,  t), new Vec3( 0,  1,  t), new Vec3( 0, -1, -t), new Vec3( 0,  1, -t),
      new Vec3( t,  0, -1), new Vec3( t,  0,  1), new Vec3(-t,  0, -1), new Vec3(-t,  0,  1)
    ].map(v => v.normalize());

    const faces = [
      [0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
      [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
      [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
      [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]
    ];

    const subdividedFaces = [];
    const getMidpoint = (v1, v2) => v1.add(v2).multiplyScalar(0.5).normalize();
    
    faces.forEach(face => {
      const v0 = vertices[face[0]], v1 = vertices[face[1]], v2 = vertices[face[2]];
      const a = getMidpoint(v0, v1);
      const b = getMidpoint(v1, v2);
      const c = getMidpoint(v2, v0);
      
      const ia = vertices.length, ib = ia + 1, ic = ia + 2;
      vertices.push(a, b, c);

      subdividedFaces.push([face[0], ia, ic]);
      subdividedFaces.push([face[1], ib, ia]);
      subdividedFaces.push([face[2], ic, ib]);
      subdividedFaces.push([ia, ib, ic]);
    });

    vertices = vertices.map(v => v.multiplyScalar(R));

    const edgeMap = new Set();
    const edges = [];
    subdividedFaces.forEach(f => {
      const faceEdges = [ [f[0], f[1]], [f[1], f[2]], [f[2], f[0]] ];
      faceEdges.forEach(edge => {
        const min = Math.min(edge[0], edge[1]);
        const max = Math.max(edge[0], edge[1]);
        const key = `${min}-${max}`;
        if (!edgeMap.has(key)) {
          edgeMap.add(key);
          edges.push([vertices[min], vertices[max]]);
        }
      });
    });

    const lineElements = [];
    edges.forEach(edge => {
      const line = document.createElement("div");
      line.className = "css-wireframe-edge";
      globe.appendChild(line);
      lineElements.push({ el: line, v1: edge[0], v2: edge[1] });
    });

    let animationFrameId;
    let startTime = performance.now();
    
    function animate(time) {
      const elapsed = (time - startTime) * 0.001;
      
      const rotY = elapsed * 0.4;
      const rotX = Math.sin(elapsed * 0.6) * 0.2;
      const scale = 1.0 + Math.sin(elapsed * 2.5) * 0.07;
      
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const rotate = (v) => {
        const y1 = v.y * cosX - v.z * sinX;
        const z1 = v.y * sinX + v.z * cosX;
        const x2 = v.x * cosY + z1 * sinY;
        const z2 = -v.x * sinY + z1 * cosY;
        return new Vec3(x2 * scale, y1 * scale, z2 * scale);
      };

      lineElements.forEach(item => {
        const v1 = rotate(item.v1);
        const v2 = rotate(item.v2);
        
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const dz = v2.z - v1.z;
        
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const rY = Math.atan2(dz, dx) * (180 / Math.PI);
        const distXZ = Math.sqrt(dx*dx + dz*dz);
        const rZ = Math.atan2(dy, distXZ) * (180 / Math.PI);

        const avgZ = (v1.z + v2.z) / 2;
        
        let opacity = 1.0;
        if (avgZ < -10) opacity = 0.05;
        else if (avgZ < 20) opacity = (avgZ + 10) / 30;

        item.el.style.width = `${distance}px`;
        item.el.style.transform = `translate3d(${v1.x}px, ${v1.y}px, ${v1.z}px) rotateY(${-rY}deg) rotateZ(${rZ}deg)`;
        item.el.style.opacity = opacity.toString();
      });

      animationFrameId = requestAnimationFrame(animate);
    }
    
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [R]);

  return (
    <div className={`relative ${className}`}>
      <div className="css-aura-wrapper">
        <div className="css-aura-container" style={{ transform: containerScale }}>
          <div className="aura-blob blob-1" style={{ width: b1Size, height: b1Size }} />
          <div className="aura-blob blob-2" style={{ width: b2Size, height: b2Size }} />
          <div className="aura-blob blob-3" style={{ width: b3Size, height: b3Size }} />
          <div className="aura-center-glow" style={{ width: glowSize, height: glowSize, filter: `blur(${blurAmt}px)` }} />
        </div>
        <div className="aura-noise-overlay"></div>

        <div className="css-wireframe-scene">
          <div className="css-wireframe-globe" ref={globeRef}>
            <div className="css-wireframe-backdrop" style={{ 
              width: backdropSize, 
              height: backdropSize, 
              margin: `-${backdropSize/2}px 0 0 -${backdropSize/2}px` 
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
