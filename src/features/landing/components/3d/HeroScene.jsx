import { useMemo } from 'react'
import '../../css-animations.css'

class Vec3 {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
  normalize() {
    const l = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    return new Vec3(this.x/l, this.y/l, this.z/l);
  }
  scale(s) { return new Vec3(this.x*s, this.y*s, this.z*s); }
  add(v) { return new Vec3(this.x+v.x, this.y+v.y, this.z+v.z); }
  sub(v) { return new Vec3(this.x-v.x, this.y-v.y, this.z-v.z); }
  dist(v) {
    const dx = this.x-v.x, dy = this.y-v.y, dz = this.z-v.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }
}

export default function HeroScene({ className = '', active = true }) {
  const { edges, particles } = useMemo(() => {
    const R = 60; 
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

    function getMiddle(v1, v2) { return v1.add(v2).scale(0.5).normalize(); }

    let newFaces = [];
    for (let f of faces) {
      let a = getMiddle(vertices[f[0]], vertices[f[1]]);
      let b = getMiddle(vertices[f[1]], vertices[f[2]]);
      let c = getMiddle(vertices[f[2]], vertices[f[0]]);
      let iA = vertices.length; vertices.push(a);
      let iB = vertices.length; vertices.push(b);
      let iC = vertices.length; vertices.push(c);
      newFaces.push([f[0], iA, iC], [f[1], iB, iA], [f[2], iC, iB], [iA, iB, iC]);
    }

    let rawEdges = []; 
    let edgeSet = new Set();
    for (let f of newFaces) {
      const addE = (i, j) => {
        let key = Math.min(i,j) + '_' + Math.max(i,j);
        if (!edgeSet.has(key)) { edgeSet.add(key); rawEdges.push([vertices[i], vertices[j]]); }
      };
      addE(f[0], f[1]); addE(f[1], f[2]); addE(f[2], f[0]);
    }

    const calculatedEdges = rawEdges.map((e, index) => {
      let v1 = e[0].scale(R), v2 = e[1].scale(R);
      let d = v1.dist(v2);
      let dir = v2.sub(v1).normalize();
      let a = Math.atan2(-dir.z, dir.x);
      let b = Math.asin(dir.y);
      return { id: index, width: d + 0.5, x: v1.x, y: v1.y, z: v1.z, rotY: a, rotZ: b };
    });

    const count = 48;
    const particleScale = 125; 
    const calculatedParticles = Array.from({ length: count }).map((_, i) => {
      let a = (i / count) * Math.PI * 2;
      let r = 1.05 + (i % 5) * 0.08;
      
      let x = Math.cos(a) * r * particleScale;
      let y = Math.sin(a * 1.7) * 0.35 * particleScale;
      let z = Math.sin(a) * r * 0.55 * particleScale;
      return { id: i, x, y, z };
    });

    return { edges: calculatedEdges, particles: calculatedParticles };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div 
        className="hero-scene-container" 
        style={{ 
          opacity: active ? 1 : 0.5, 
          transform: 'scale(0.9)', 
          transition: 'opacity 0.5s ease' 
        }}
      >
        <div className="hero-aura"></div>
        
        <div className="hero-ring hero-ring-1"></div>
        <div className="hero-ring hero-ring-2"></div>

        <div className="hero-orb-scale-wrapper">
          <div className="hero-glow-core"></div>
          
          <div className="hero-orb-wrapper">
            {edges.map((edge) => (
              <div 
                key={edge.id} 
                className="hero-edge"
                style={{
                  width: `${edge.width}px`,
                  transform: `translate3d(${edge.x}px, ${edge.y}px, ${edge.z}px) rotateY(${edge.rotY}rad) rotateZ(${edge.rotZ}rad)`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="hero-particle-orbit">
          {particles.map((p) => (
            <div 
              key={p.id}
              className="hero-particle"
              style={{
                transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
