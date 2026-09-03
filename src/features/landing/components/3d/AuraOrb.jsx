import { useMemo } from 'react'
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

  const { edges } = useMemo(() => {
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

    let finalFaces = faces;

    if (!isIcon) {
      const subdividedFaces = [];
      const getMidpoint = (v1, v2) => v1.add(v2).multiplyScalar(0.5).normalize();
      
      faces.forEach(face => {
        const v0 = vertices[face[0]], v1 = vertices[face[1]], v2 = vertices[face[2]];
        const m01 = getMidpoint(v0, v1);
        const m12 = getMidpoint(v1, v2);
        const m20 = getMidpoint(v2, v0);
        
        const v01_idx = vertices.length; vertices.push(m01);
        const v12_idx = vertices.length; vertices.push(m12);
        const v20_idx = vertices.length; vertices.push(m20);
        
        subdividedFaces.push([face[0], v01_idx, v20_idx]);
        subdividedFaces.push([face[1], v12_idx, v01_idx]);
        subdividedFaces.push([face[2], v20_idx, v12_idx]);
        subdividedFaces.push([v01_idx, v12_idx, v20_idx]);
      });
      finalFaces = subdividedFaces;
    }

    const edgeSet = new Set();
    const uniqueEdges = [];
    finalFaces.forEach(f => {
      const addE = (i, j) => {
        const key = i < j ? `${i}_${j}` : `${j}_${i}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          uniqueEdges.push({ v1: vertices[i], v2: vertices[j] });
        }
      };
      addE(f[0], f[1]); addE(f[1], f[2]); addE(f[2], f[0]);
    });

    return {
      edges: uniqueEdges.map((e, index) => {
        let v1 = e.v1.multiplyScalar(R), v2 = e.v2.multiplyScalar(R);
        let dx = v2.x - v1.x, dy = v2.y - v1.y, dz = v2.z - v1.z;
        let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        let rY = Math.atan2(dz, dx);
        let rZ = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz));
        
        const avgZ = (v1.z + v2.z) / 2;
        let opacity = 1.0;
        if (avgZ < -10) opacity = 0.15;
        else if (avgZ < 20) opacity = 0.4 + ((avgZ + 10) / 30) * 0.6;
        
        return { 
          id: index, width: distance, x: v1.x, y: v1.y, z: v1.z, 
          rotY: -rY, rotZ: rZ, opacity 
        };
      })
    };
  }, [R]);

  return (
    <div className={`css-aura-wrapper ${className}`}>
      <div
        className="css-aura-container"
        style={{
          width: R * 2,
          height: R * 2,
          transform: `${containerScale}`,
          perspective: '1000px',
        }}
      >
        <div className="aura-blob blob-1" style={{ width: b1Size, height: b1Size, filter: `blur(${blurAmt*2}px)` }} />
        <div className="aura-blob blob-2" style={{ width: b2Size, height: b2Size, filter: `blur(${blurAmt*2}px)` }} />
        <div className="aura-blob blob-3" style={{ width: b3Size, height: b3Size, filter: `blur(${blurAmt*2}px)` }} />

        <div className="css-wireframe-scene">
          <div className="css-wireframe-backdrop" style={{ width: backdropSize, height: backdropSize }} />
          <div className="aura-center-glow" style={{ width: glowSize, height: glowSize, filter: `blur(${blurAmt}px)` }} />
          
          <div className="css-wireframe-globe" style={{ width: R * 2, height: R * 2 }}>
            <div className="aura-orb-spin-wrapper" style={{ 
              position: 'absolute', inset: 0, 
              transformStyle: 'preserve-3d', 
              animation: 'aura-spin-3d 20s linear infinite' 
            }}>
              {edges.map((edge) => (
                <div
                  key={edge.id}
                  className="css-wireframe-edge"
                  style={{
                    width: `${edge.width}px`,
                    opacity: edge.opacity,
                    transform: `translate3d(${edge.x + R}px, ${edge.y + R}px, ${edge.z}px) rotateY(${edge.rotY}rad) rotateZ(${edge.rotZ}rad)`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="aura-noise-overlay" />
      </div>
    </div>
  );
}
