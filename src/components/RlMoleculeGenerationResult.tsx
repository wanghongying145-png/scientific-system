import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronDown,
  ChevronRight,
  Download, 
  Activity, 
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RlMoleculeGenerationResultProps {
  onBack: () => void;
  taskId?: string;
}

// ---------------------------------------------------------------------------
// 3D Conformation Viewer Component (Dark Canvas with Docking & Interactions)
// ---------------------------------------------------------------------------
interface Pose3DViewerDarkProps {
  rank: number;
  poseId: number;
  vinaScore: number;
  molId: string;
  layers: {
    protein: boolean;
    surface: boolean;
    ligand: boolean;
    residues: boolean;
    hbond: boolean;
    hydrophobic: boolean;
    saltBridge: boolean;
    piStacking: boolean;
  };
}

function Pose3DViewerDark({
  rank,
  poseId,
  vinaScore,
  molId,
  layers
}: Pose3DViewerDarkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(14);

  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.4, y: 0.75 });

  // Generate 3D geometry coordinates for receptor protein & ligand pose
  const sceneData = useMemo(() => {
    // Protein backbone residues
    const residues = [
      { resName: "MET", resSeq: 793, x: -2, y: 1, z: 0, atom: "N" },
      { resName: "LEU", resSeq: 718, x: 4, y: -3, z: 2, atom: "CD1" },
      { resName: "ASP", resSeq: 855, x: 1, y: 5, z: -1, atom: "OD2" },
      { resName: "PHE", resSeq: 723, x: -5, y: -4, z: -2, atom: "CG" },
      { resName: "VAL", resSeq: 726, x: 6, y: 2, z: -3, atom: "CG1" },
      { resName: "THR", resSeq: 790, x: -3, y: 6, z: 3, atom: "OG1" },
      { resName: "LYS", resSeq: 745, x: 2, y: -6, z: 1, atom: "NZ" },
      { resName: "GLU", resSeq: 762, x: -6, y: 3, z: 4, atom: "OE1" },
    ];

    // Ligand atoms for this pose
    const poseOffset = (poseId - 1) * 0.4;
    const ligandAtoms = [
      { id: 1, elem: "N", name: "O17", x: -0.5 + poseOffset, y: 0.8 - poseOffset, z: 0.2, color: "#3b82f6" },
      { id: 2, elem: "C", name: "C12", x: 1.2 + poseOffset, y: -0.5 + poseOffset, z: 0.5, color: "#f97316" },
      { id: 3, elem: "N", name: "N21", x: 0.2 + poseOffset, y: 2.1 - poseOffset, z: -0.3, color: "#eab308" },
      { id: 4, elem: "C", name: "C5", x: -2.1 + poseOffset, y: -1.2 + poseOffset, z: -0.8, color: "#f97316" },
      { id: 5, elem: "C", name: "C8", x: 2.8 + poseOffset, y: 0.5 - poseOffset, z: -1.2, color: "#f97316" },
      { id: 6, elem: "O", name: "O2", x: -1.2 + poseOffset, y: 2.8 - poseOffset, z: 1.1, color: "#ef4444" },
    ];

    // Interactions connecting protein residues to ligand atoms
    const interactions = [
      { type: "hbond", from: residues[0], to: ligandAtoms[0], color: "#38bdf8", label: "氢键 2.9Å" },
      { type: "hydrophobic", from: residues[1], to: ligandAtoms[1], color: "#e2e8f0", label: "疏水 3.7Å" },
      { type: "saltBridge", from: residues[2], to: ligandAtoms[2], color: "#f59e0b", label: "盐桥 3.5Å" },
      { type: "piStacking", from: residues[3], to: ligandAtoms[3], color: "#10b981", label: "π作用 4.1Å" },
    ];

    return { residues, ligandAtoms, interactions };
  }, [poseId]);

  // Canvas render loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark viewer background matching reference image
      ctx.fillStyle = '#0a101d';
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const project = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const depthScale = (z2 + 50) / 50;
        const screenX = width / 2 + x1 * scale * depthScale;
        const screenY = height / 2 + y2 * scale * depthScale;

        return { screenX, screenY, depth: z2, depthScale };
      };

      // 1. Render Docking Bounding Box (Cyan wireframe)
      const boxSize = 12;
      const h = boxSize / 2;
      const corners = [
        { x: -h, y: -h, z: -h }, { x: h, y: -h, z: -h },
        { x: h, y: h, z: -h }, { x: -h, y: h, z: -h },
        { x: -h, y: -h, z: h }, { x: h, y: -h, z: h },
        { x: h, y: h, z: h }, { x: -h, y: h, z: h }
      ].map(p => ({ ...p, ...project(p.x, p.y, p.z) }));

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      // Draw box fill
      ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.beginPath();
      ctx.moveTo(corners[0].screenX, corners[0].screenY);
      ctx.lineTo(corners[1].screenX, corners[1].screenY);
      ctx.lineTo(corners[2].screenX, corners[2].screenY);
      ctx.lineTo(corners[3].screenX, corners[3].screenY);
      ctx.closePath();
      ctx.fill();

      // Cyan box outline
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(corners[i].screenX, corners[i].screenY);
        ctx.lineTo(corners[j].screenX, corners[j].screenY);
        ctx.stroke();
      });

      // 2. Render Protein Backbone Ribbon (if enabled)
      if (layers.protein) {
        const protPoints = sceneData.residues.map(r => ({ ...r, ...project(r.x, r.y, r.z) }));
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < protPoints.length - 1; i++) {
          const p1 = protPoints[i];
          const p2 = protPoints[i + 1];
          ctx.beginPath();
          ctx.strokeStyle = '#028fac';
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.lineTo(p2.screenX, p2.screenY);
          ctx.stroke();
        }

        // Draw protein residue nodes
        if (layers.residues) {
          protPoints.forEach(p => {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(p.screenX, p.screenY, 5 * Math.max(0.5, p.depthScale), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px monospace';
            ctx.fillText(`${p.resName}${p.resSeq}`, p.screenX + 8, p.screenY - 4);
          });
        }
      }

      // 3. Render Ligand Pose Atoms & Bonds (if enabled)
      if (layers.ligand) {
        const ligPoints = sceneData.ligandAtoms.map(a => ({ ...a, ...project(a.x, a.y, a.z) }));

        // Ligand bonds
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#f97316';
        for (let i = 0; i < ligPoints.length - 1; i++) {
          const p1 = ligPoints[i];
          const p2 = ligPoints[i + 1];
          ctx.beginPath();
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.lineTo(p2.screenX, p2.screenY);
          ctx.stroke();
        }

        // Ligand atom spheres
        ligPoints.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.screenX, p.screenY, 6 * Math.max(0.5, p.depthScale), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      // 4. Render Non-covalent Interactions (Dashed lines)
      sceneData.interactions.forEach(inter => {
        const showThis = 
          (inter.type === 'hbond' && layers.hbond) ||
          (inter.type === 'hydrophobic' && layers.hydrophobic) ||
          (inter.type === 'saltBridge' && layers.saltBridge) ||
          (inter.type === 'piStacking' && layers.piStacking);

        if (showThis) {
          const p1 = project(inter.from.x, inter.from.y, inter.from.z);
          const p2 = project(inter.to.x, inter.to.y, inter.to.z);

          ctx.strokeStyle = inter.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.lineTo(p2.screenX, p2.screenY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center atom sphere
          const midX = (p1.screenX + p2.screenX) / 2;
          const midY = (p1.screenY + p2.screenY) / 2;
          ctx.fillStyle = inter.color;
          ctx.beginPath();
          ctx.arc(midX, midY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [rank, poseId, vinaScore, scale, layers, sceneData]);

  // Handle Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => Math.min(30, Math.max(6, prev - e.deltaY * 0.01)));
  };

  return (
    <div ref={containerRef} className="relative w-full h-[380px] bg-[#0a101d] rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between font-sans">
      
      {/* Top-Right Legend Box matching reference image */}
      <div className="absolute top-3 right-3 z-10 bg-slate-900/85 backdrop-blur border border-slate-700/60 rounded-lg p-2.5 text-[10px] font-mono text-slate-300 space-y-1 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-400 inline-block border-t border-dashed border-blue-400" />
          <span>氢键 3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-200 inline-block border-t border-dashed border-slate-200" />
          <span>疏水作用 5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-amber-400 inline-block border-t border-dashed border-amber-400" />
          <span>盐桥 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-400 inline-block border-t border-dashed border-emerald-400" />
          <span>π作用 2</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Right Overlay Badge matching reference image */}
      <div className="absolute bottom-3 right-3 z-10 bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-lg p-2.5 text-right font-sans shadow-lg">
        <span className="text-[10px] font-mono font-bold text-slate-400 block">{molId} / Pose {poseId}</span>
        <div className="flex items-baseline justify-end gap-1 mt-0.5">
          <span className="text-sm font-black text-blue-400 font-mono">{vinaScore.toFixed(1)}</span>
          <span className="text-[10px] text-slate-300 font-medium">kcal/mol</span>
        </div>
        <span className="text-[9px] text-slate-400 block">预测对接得分</span>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Result Component
// ---------------------------------------------------------------------------
export const RlMoleculeGenerationResult: React.FC<RlMoleculeGenerationResultProps> = ({ onBack, taskId = "RL-20260420-001" }) => {
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [selectedPoseId, setSelectedPoseId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'interaction' | 'poseInfo' | 'fileParams'>('interaction');
  const [filterType, setFilterType] = useState<string>('all');

  // Toggleable layers in 3D viewer
  const [viewerLayers, setViewerLayers] = useState({
    protein: true,
    surface: false,
    ligand: true,
    residues: true,
    hbond: true,
    hydrophobic: true,
    saltBridge: true,
    piStacking: true,
  });

  // Candidate Molecules Dataset matching reference image
  const MOLECULE_RESULTS = [
    {
      rank: 1,
      molId: "MOL-SH-001",
      smiles: "CC0c1ccc(NC(=O)N2CCN(CC2)c2ccncc2)cc1",
      qed: 0.82,
      sa: 2.31,
      poseCount: 9,
      status: "docked",
      poses: [
        { id: 1, vina: -9.8, rmsdLb: 0.00, rmsdUb: 0.00, file: "MOL-SH-001_pose_1.pdbqt", interactions: [
          { type: "氢键", color: "blue", residue: "A:MET793", protAtom: "N", ligAtom: "O17", dist: "2.9 Å", angle: "164.2°" },
          { type: "疏水作用", color: "gray", residue: "A:LEU718", protAtom: "CD1", ligAtom: "C12", dist: "3.7 Å", angle: "—" },
          { type: "盐桥", color: "yellow", residue: "A:ASP855", protAtom: "OD2", ligAtom: "N21", dist: "3.5 Å", angle: "—" },
        ]},
        { id: 2, vina: -9.5, rmsdLb: 1.18, rmsdUb: 2.40, file: "MOL-SH-001_pose_2.pdbqt", interactions: [
          { type: "氢键", color: "blue", residue: "A:MET793", protAtom: "N", ligAtom: "O17", dist: "3.1 Å", angle: "158.0°" },
          { type: "疏水作用", color: "gray", residue: "A:VAL726", protAtom: "CG1", ligAtom: "C10", dist: "3.8 Å", angle: "—" },
        ]},
        { id: 3, vina: -9.3, rmsdLb: 1.36, rmsdUb: 3.12, file: "MOL-SH-001_pose_3.pdbqt", interactions: [
          { type: "氢键", color: "blue", residue: "A:THR790", protAtom: "OG1", ligAtom: "N14", dist: "2.8 Å", angle: "170.1°" }
        ]},
        { id: 4, vina: -9.2, rmsdLb: 1.54, rmsdUb: 4.08, file: "MOL-SH-001_pose_4.pdbqt", interactions: [] },
        { id: 5, vina: -9.0, rmsdLb: 1.72, rmsdUb: 5.26, file: "MOL-SH-001_pose_5.pdbqt", interactions: [] },
        { id: 6, vina: -8.7, rmsdLb: 1.95, rmsdUb: 6.18, file: "MOL-SH-001_pose_6.pdbqt", interactions: [] },
        { id: 7, vina: -8.4, rmsdLb: 2.21, rmsdUb: 6.84, file: "MOL-SH-001_pose_7.pdbqt", interactions: [] },
        { id: 8, vina: -8.1, rmsdLb: 1.66, rmsdUb: 7.06, file: "MOL-SH-001_pose_8.pdbqt", interactions: [] },
        { id: 9, vina: -7.8, rmsdLb: 1.82, rmsdUb: 7.30, file: "MOL-SH-001_pose_9.pdbqt", interactions: [] }
      ]
    },
    {
      rank: 2,
      molId: "MOL-SH-002",
      smiles: "C0c1ncc(C2CC2)c(NC(=O)c2ccc(F)cc2)n1",
      qed: 0.79,
      sa: 2.54,
      poseCount: 9,
      status: "docked",
      poses: [
        { id: 1, vina: -9.1, rmsdLb: 0.00, rmsdUb: 0.00, file: "MOL-SH-002_pose_1.pdbqt", interactions: [
          { type: "氢键", color: "blue", residue: "A:MET793", protAtom: "N", ligAtom: "N3", dist: "3.0 Å", angle: "161.0°" },
          { type: "疏水作用", color: "gray", residue: "A:ALA743", protAtom: "CB", ligAtom: "C8", dist: "3.6 Å", angle: "—" },
        ]},
        { id: 2, vina: -8.8, rmsdLb: 1.25, rmsdUb: 2.30, file: "MOL-SH-002_pose_2.pdbqt", interactions: [] },
        { id: 3, vina: -8.6, rmsdLb: 1.40, rmsdUb: 3.10, file: "MOL-SH-002_pose_3.pdbqt", interactions: [] },
        { id: 4, vina: -8.4, rmsdLb: 1.60, rmsdUb: 4.10, file: "MOL-SH-002_pose_4.pdbqt", interactions: [] },
        { id: 5, vina: -8.2, rmsdLb: 1.80, rmsdUb: 5.20, file: "MOL-SH-002_pose_5.pdbqt", interactions: [] },
        { id: 6, vina: -7.9, rmsdLb: 2.00, rmsdUb: 6.00, file: "MOL-SH-002_pose_6.pdbqt", interactions: [] },
        { id: 7, vina: -7.6, rmsdLb: 2.20, rmsdUb: 6.70, file: "MOL-SH-002_pose_7.pdbqt", interactions: [] },
        { id: 8, vina: -7.4, rmsdLb: 1.70, rmsdUb: 7.10, file: "MOL-SH-002_pose_8.pdbqt", interactions: [] },
        { id: 9, vina: -7.1, rmsdLb: 1.90, rmsdUb: 7.40, file: "MOL-SH-002_pose_9.pdbqt", interactions: [] }
      ]
    },
    {
      rank: 3,
      molId: "MOL-SH-003",
      smiles: "CN1CCN(c2ncnc3c2ncn3C2CC2)CC1",
      qed: 0.77,
      sa: 2.68,
      poseCount: 9,
      status: "docked",
      poses: [
        { id: 1, vina: -8.9, rmsdLb: 0.00, rmsdUb: 0.00, file: "MOL-SH-003_pose_1.pdbqt", interactions: [
          { type: "氢键", color: "blue", residue: "A:LYS745", protAtom: "NZ", ligAtom: "N1", dist: "2.8 Å", angle: "168.5°" }
        ]},
        { id: 2, vina: -8.5, rmsdLb: 1.10, rmsdUb: 2.20, file: "MOL-SH-003_pose_2.pdbqt", interactions: [] },
        { id: 3, vina: -8.3, rmsdLb: 1.30, rmsdUb: 3.00, file: "MOL-SH-003_pose_3.pdbqt", interactions: [] },
        { id: 4, vina: -8.1, rmsdLb: 1.50, rmsdUb: 4.00, file: "MOL-SH-003_pose_4.pdbqt", interactions: [] },
        { id: 5, vina: -7.8, rmsdLb: 1.70, rmsdUb: 5.10, file: "MOL-SH-003_pose_5.pdbqt", interactions: [] },
        { id: 6, vina: -7.5, rmsdLb: 1.90, rmsdUb: 6.10, file: "MOL-SH-003_pose_6.pdbqt", interactions: [] },
        { id: 7, vina: -7.3, rmsdLb: 2.10, rmsdUb: 6.60, file: "MOL-SH-003_pose_7.pdbqt", interactions: [] },
        { id: 8, vina: -7.0, rmsdLb: 1.60, rmsdUb: 7.00, file: "MOL-SH-003_pose_8.pdbqt", interactions: [] },
        { id: 9, vina: -6.8, rmsdLb: 1.80, rmsdUb: 7.20, file: "MOL-SH-003_pose_9.pdbqt", interactions: [] }
      ]
    },
    {
      rank: 4,
      molId: "MOL-SH-004",
      smiles: "Fc1ccc(CNC(=O)N(C)C(=O)N2)cc1",
      qed: 0.75,
      sa: 2.47,
      poseCount: 8,
      status: "docked",
      poses: [
        { id: 1, vina: -8.6, rmsdLb: 0.00, rmsdUb: 0.00, file: "MOL-SH-004_pose_1.pdbqt", interactions: [] },
        { id: 2, vina: -8.3, rmsdLb: 1.15, rmsdUb: 2.25, file: "MOL-SH-004_pose_2.pdbqt", interactions: [] },
        { id: 3, vina: -8.0, rmsdLb: 1.35, rmsdUb: 3.05, file: "MOL-SH-004_pose_3.pdbqt", interactions: [] },
        { id: 4, vina: -7.8, rmsdLb: 1.55, rmsdUb: 4.05, file: "MOL-SH-004_pose_4.pdbqt", interactions: [] },
        { id: 5, vina: -7.5, rmsdLb: 1.75, rmsdUb: 5.15, file: "MOL-SH-004_pose_5.pdbqt", interactions: [] },
        { id: 6, vina: -7.2, rmsdLb: 1.95, rmsdUb: 6.05, file: "MOL-SH-004_pose_6.pdbqt", interactions: [] },
        { id: 7, vina: -7.0, rmsdLb: 2.15, rmsdUb: 6.55, file: "MOL-SH-004_pose_7.pdbqt", interactions: [] },
        { id: 8, vina: -6.7, rmsdLb: 1.65, rmsdUb: 6.95, file: "MOL-SH-004_pose_8.pdbqt", interactions: [] }
      ]
    },
    {
      rank: 5,
      molId: "MOL-SH-005",
      smiles: "CS(=O)(=O)Nc1ccc(NC(=O)c2cn[nH]c2)cc1",
      qed: 0.72,
      sa: 2.83,
      poseCount: 9,
      status: "docked",
      poses: [
        { id: 1, vina: -8.4, rmsdLb: 0.00, rmsdUb: 0.00, file: "MOL-SH-005_pose_1.pdbqt", interactions: [] },
        { id: 2, vina: -8.1, rmsdLb: 1.20, rmsdUb: 2.30, file: "MOL-SH-005_pose_2.pdbqt", interactions: [] },
        { id: 3, vina: -7.9, rmsdLb: 1.40, rmsdUb: 3.10, file: "MOL-SH-005_pose_3.pdbqt", interactions: [] },
        { id: 4, vina: -7.6, rmsdLb: 1.60, rmsdUb: 4.10, file: "MOL-SH-005_pose_4.pdbqt", interactions: [] },
        { id: 5, vina: -7.3, rmsdLb: 1.80, rmsdUb: 5.20, file: "MOL-SH-005_pose_5.pdbqt", interactions: [] },
        { id: 6, vina: -7.0, rmsdLb: 2.00, rmsdUb: 6.10, file: "MOL-SH-005_pose_6.pdbqt", interactions: [] },
        { id: 7, vina: -6.8, rmsdLb: 2.20, rmsdUb: 6.60, file: "MOL-SH-005_pose_7.pdbqt", interactions: [] },
        { id: 8, vina: -6.5, rmsdLb: 1.70, rmsdUb: 7.00, file: "MOL-SH-005_pose_8.pdbqt", interactions: [] },
        { id: 9, vina: -6.2, rmsdLb: 1.90, rmsdUb: 7.30, file: "MOL-SH-005_pose_9.pdbqt", interactions: [] }
      ]
    }
  ];

  const currentMol = MOLECULE_RESULTS.find(m => m.rank === selectedRank) || MOLECULE_RESULTS[0];
  const currentPose = currentMol.poses.find(p => p.id === selectedPoseId) || currentMol.poses[0];

  const toggleLayer = (layerKey: keyof typeof viewerLayers) => {
    setViewerLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] font-sans text-slate-800">
      
      {/* Sticky Header Bar */}
      <div className="bg-white border-b px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 hover:bg-slate-100 rounded-full cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">强化学习生成结果</h1>
              <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-600 font-bold bg-indigo-50/50">
                {taskId}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-medium">
              <Activity className="w-3 h-3 text-emerald-500" />
              任务状态：执行成功 | 完成时间: 2026-04-20 11:30:00
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold border-slate-200 text-slate-700 cursor-pointer">
             <Download className="w-3.5 h-3.5 mr-1.5" />
             导出列表
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-[1500px] mx-auto pb-24">
          
          {/* Module 1: Task Basic Information (UNCHANGED) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-4 bg-[#02A1C8] rounded-full" />
              <h2 className="text-xs font-black text-[#0F172A] tracking-tight">任务基础信息</h2>
            </div>
            
            <Card className="border border-slate-200/80 shadow-2xs p-5 bg-white rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-2.5">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500">任务名称</span>
                  <span className="text-xs font-bold text-slate-900">EGFR_RL_Optimization</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500">任务 ID</span>
                  <span className="text-xs font-mono font-bold text-slate-900">{taskId}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500">靶点名称</span>
                  <span className="text-xs font-bold text-slate-900">EGFR</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500">生成模式</span>
                  <span className="text-xs font-bold text-slate-900">强化学习高通量生成</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500">状态</span>
                  <span className="text-xs font-bold text-emerald-600">执行成功</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500">采样参数摘要</span>
                  <span className="text-xs font-bold text-slate-900">200-1000 步迭代</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Module 2: KPI Summary Cards Row (Matching reference screenshot top row) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 text-left">
              <span className="text-[11px] font-medium text-slate-600 block">生成分子</span>
              <div className="text-2xl font-black text-slate-900 font-mono">50</div>
              <span className="text-[10px] text-slate-400 block">有效去重47</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 text-left">
              <span className="text-[11px] font-medium text-slate-600 block">进入对接</span>
              <div className="text-2xl font-black text-slate-900 font-mono">20</div>
              <span className="text-[10px] text-slate-400 block">生成评分Top-N</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 text-left">
              <span className="text-[11px] font-medium text-slate-600 block">对接成功</span>
              <div className="text-2xl font-black text-slate-900 font-mono">19</div>
              <span className="text-[10px] text-slate-400 block">成功率95%</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 text-left">
              <span className="text-[11px] font-medium text-slate-600 block">输出Pose</span>
              <div className="text-2xl font-black text-slate-900 font-mono">171</div>
              <span className="text-[10px] text-slate-400 block">每分子最多9个</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 text-left">
              <span className="text-[11px] font-medium text-slate-600 block">已分析Pose</span>
              <div className="text-2xl font-black text-slate-900 font-mono">72</div>
              <span className="text-[10px] text-slate-400 block">持续更新中</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 text-left">
              <span className="text-[11px] font-medium text-slate-600 block">最佳Vina评分</span>
              <div className="text-2xl font-black text-blue-600 font-mono">-9.8</div>
              <span className="text-[10px] text-slate-400 block">kcal/mol · 预测值</span>
            </div>

          </div>

          {/* Module 3: Main Split Area ("生成候选分子列表") */}
          <div className="space-y-3">
            
            {/* Header Title & Subtitle */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#02A1C8] rounded-full" />
                <h2 className="text-xs font-black text-[#0F172A] tracking-tight">生成候选分子列表</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">按生成排名排列</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: '全部 50' },
                { key: 'topN', label: 'Top-N 20' },
                { key: 'docked', label: '对接成功 19' },
                { key: 'analyzing', label: '分析中 11' },
                { key: 'failed', label: '失败 1' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterType(f.key)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border",
                    filterType === f.key
                      ? "bg-white text-blue-600 border-blue-200 shadow-2xs font-bold"
                      : "bg-slate-100/80 text-slate-600 border-transparent hover:bg-slate-200/60"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Split Screen Grid (Left: Table & Sub-table, Right: 3D Viewer & Interaction Tabs) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* LEFT COLUMN: Candidates List & Expandable Conformations */}
              <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
                
                {/* Main Molecules Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px]">
                        <th className="py-2.5 px-3 w-12 text-center">排名</th>
                        <th className="py-2.5 px-3">SMILES序列</th>
                        <th className="py-2.5 px-3 w-16 text-center font-mono">QED</th>
                        <th className="py-2.5 px-3 w-16 text-center font-mono">SA</th>
                        <th className="py-2.5 px-3 w-16 text-center">Pose数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOLECULE_RESULTS.map((mol) => {
                        const isExpanded = mol.rank === selectedRank;
                        return (
                          <React.Fragment key={mol.rank}>
                            {/* Main Row */}
                            <tr 
                              onClick={() => {
                                setSelectedRank(mol.rank);
                                setSelectedPoseId(1);
                              }}
                              className={cn(
                                "transition-colors cursor-pointer group hover:bg-slate-50/80",
                                isExpanded ? "bg-cyan-50/30" : ""
                              )}
                            >
                              <td className="py-3 px-3 text-center">
                                <span className="font-mono text-slate-600 font-medium">{mol.rank}</span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5 max-w-[280px]">
                                  <button
                                    type="button"
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </button>
                                  <code className="font-mono text-[11px] text-slate-700 truncate select-all">
                                    {mol.smiles}
                                  </code>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-slate-700 font-medium">
                                {mol.qed.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-slate-700 font-medium">
                                {mol.sa.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-100/80 text-cyan-800 text-[10px] font-bold font-mono">
                                  {mol.poseCount}
                                </span>
                              </td>
                            </tr>

                            {/* Expanded Conformations Sub-Panel */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={5} className="p-3 bg-cyan-50/20 border-y border-cyan-100">
                                  <div className="bg-white rounded-lg border border-cyan-200/80 p-3.5 space-y-3 shadow-2xs">
                                    
                                    {/* Sub-panel Header */}
                                    <div className="flex items-center justify-between text-xs">
                                      <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <span>排名 {mol.rank} 分子的所有构象</span>
                                      </h3>
                                      <span className="text-[11px] text-slate-400 font-normal">点击任意构象可在右侧查看</span>
                                    </div>

                                    {/* Conformations Sub-table */}
                                    <div className="border border-slate-200/80 rounded-lg overflow-hidden">
                                      <table className="w-full text-left text-[11px]">
                                        <thead>
                                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                                            <th className="py-2 px-3">构象</th>
                                            <th className="py-2 px-3 font-mono">Vina评分</th>
                                            <th className="py-2 px-3 font-mono">RMSD l.b.</th>
                                            <th className="py-2 px-3 font-mono">RMSD u.b.</th>
                                            <th className="py-2 px-3">构象文件</th>
                                            <th className="py-2 px-3 text-right">下载</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-sans">
                                          {mol.poses.map((pose) => {
                                            const isSelectedPose = pose.id === selectedPoseId;
                                            return (
                                              <tr
                                                key={pose.id}
                                                onClick={() => setSelectedPoseId(pose.id)}
                                                className={cn(
                                                  "transition-colors cursor-pointer",
                                                  isSelectedPose ? "bg-cyan-50/80 font-semibold" : "hover:bg-slate-50"
                                                )}
                                              >
                                                <td className="py-2 px-3 font-medium text-slate-800">
                                                  构象 {pose.id}
                                                </td>
                                                <td className="py-2 px-3 font-mono font-bold text-rose-500">
                                                  {pose.vina.toFixed(1)}
                                                </td>
                                                <td className="py-2 px-3 font-mono text-slate-600">
                                                  {pose.rmsdLb.toFixed(2)}
                                                </td>
                                                <td className="py-2 px-3 font-mono text-slate-600">
                                                  {pose.rmsdUb.toFixed(2)}
                                                </td>
                                                <td className="py-2 px-3 font-mono text-slate-600 flex items-center gap-1">
                                                  <FileCode2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                                  <span className="text-[10px] text-cyan-800 font-medium">{pose.file}</span>
                                                </td>
                                                <td className="py-2 px-3 text-right">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                    }}
                                                    className="p-1 hover:bg-slate-200/60 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                                  >
                                                    <Download className="w-3.5 h-3.5" />
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* RIGHT COLUMN: 3D Conformation Viewer & Interaction Details */}
              <div className="lg:col-span-6 space-y-3">
                
                {/* Viewer Top Header Info Bar */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-slate-400">当前查看构象</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                      排名 {selectedRank} · 构象 {selectedPoseId}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-slate-900 font-mono">{currentPose.vina.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-500 font-bold">kcal/mol</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Vina 对接评分 · RMSD {currentPose.rmsdLb.toFixed(2)} / {currentPose.rmsdUb.toFixed(2)} Å</span>
                  </div>
                </div>

                {/* 3D Docking Viewer Container */}
                <div className="relative rounded-xl overflow-hidden shadow-sm bg-[#0a101d] border border-slate-800 space-y-0">
                  
                  {/* Layer Toggle Toolbar matching reference screenshot */}
                  <div className="bg-slate-900/90 border-b border-slate-800 p-2 flex items-center gap-1 overflow-x-auto text-[11px] font-bold text-slate-300">
                    <button
                      type="button"
                      onClick={() => toggleLayer('protein')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.protein ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      蛋白
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayer('surface')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.surface ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      表面
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayer('ligand')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.ligand ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      配体
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayer('residues')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.residues ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      邻近残基
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayer('hbond')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.hbond ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      氢键
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayer('hydrophobic')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.hydrophobic ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      疏水
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayer('saltBridge')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.saltBridge ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      盐桥
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLayer('piStacking')}
                      className={cn(
                        "px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0",
                        viewerLayers.piStacking ? "bg-[#02A1C8] text-white" : "hover:bg-slate-800 text-slate-400"
                      )}
                    >
                      π作用
                    </button>
                  </div>

                  {/* Interactive 3D Canvas View */}
                  <Pose3DViewerDark
                    rank={selectedRank}
                    poseId={selectedPoseId}
                    vinaScore={currentPose.vina}
                    molId={currentMol.molId}
                    layers={viewerLayers}
                  />

                </div>

                {/* Bottom Interaction Details Card with Tabs matching reference image */}
                <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden p-4 space-y-3">
                  
                  {/* Tab Headers */}
                  <div className="flex items-center gap-6 border-b border-slate-100 pb-2.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('interaction')}
                      className={cn(
                        "pb-1 border-b-2 transition-colors cursor-pointer",
                        activeTab === 'interaction' ? "border-[#02A1C8] text-[#02A1C8]" : "border-transparent text-slate-500 hover:text-slate-800"
                      )}
                    >
                      相互作用明细
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('poseInfo')}
                      className={cn(
                        "pb-1 border-b-2 transition-colors cursor-pointer",
                        activeTab === 'poseInfo' ? "border-[#02A1C8] text-[#02A1C8]" : "border-transparent text-slate-500 hover:text-slate-800"
                      )}
                    >
                      构象信息
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('fileParams')}
                      className={cn(
                        "pb-1 border-b-2 transition-colors cursor-pointer",
                        activeTab === 'fileParams' ? "border-[#02A1C8] text-[#02A1C8]" : "border-transparent text-slate-500 hover:text-slate-800"
                      )}
                    >
                      文件与参数
                    </button>
                  </div>

                  {/* Tab 1 Content: Interaction Details */}
                  {activeTab === 'interaction' && (
                    <div className="space-y-3">
                      <div className="border border-slate-100 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px]">
                              <th className="py-2.5 px-3">作用类型</th>
                              <th className="py-2.5 px-3">蛋白残基</th>
                              <th className="py-2.5 px-3">蛋白原子</th>
                              <th className="py-2.5 px-3">配体原子</th>
                              <th className="py-2.5 px-3">距离</th>
                              <th className="py-2.5 px-3">角度</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {currentPose.interactions.length > 0 ? (
                              currentPose.interactions.map((inter, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-[10px] font-bold border",
                                      inter.type === '氢键' ? "bg-sky-50 text-sky-700 border-sky-200" :
                                      inter.type === '疏水作用' ? "bg-slate-100 text-slate-700 border-slate-200" :
                                      "bg-amber-50 text-amber-700 border-amber-200"
                                    )}>
                                      {inter.type}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-800 font-semibold">{inter.residue}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-700">{inter.protAtom}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-700">{inter.ligAtom}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-800 font-bold">{inter.dist}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-700">{inter.angle}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="py-4 text-center text-slate-400 text-xs">
                                  未检测到强相互作用作用对，或当前层处于默认折叠状态。
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Footnote matching screenshot */}
                      <p className="text-[10px] text-slate-400">
                        来源: PLIP，结果为基于对接构象的计算预测，需结合实验验证。
                      </p>
                    </div>
                  )}

                  {/* Tab 2 Content: Pose Info */}
                  {activeTab === 'poseInfo' && (
                    <div className="grid grid-cols-2 gap-3 text-xs p-2">
                      <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 border border-slate-100">
                        <span className="text-slate-400 text-[10px] block">构象编号</span>
                        <span className="font-bold text-slate-900 font-mono">Pose #{selectedPoseId}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 border border-slate-100">
                        <span className="text-slate-400 text-[10px] block">Vina 对接打分</span>
                        <span className="font-bold text-rose-600 font-mono">{currentPose.vina.toFixed(1)} kcal/mol</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 border border-slate-100">
                        <span className="text-slate-400 text-[10px] block">RMSD 下界 (Lower Bound)</span>
                        <span className="font-bold text-slate-900 font-mono">{currentPose.rmsdLb.toFixed(2)} Å</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 border border-slate-100">
                        <span className="text-slate-400 text-[10px] block">RMSD 上界 (Upper Bound)</span>
                        <span className="font-bold text-slate-900 font-mono">{currentPose.rmsdUb.toFixed(2)} Å</span>
                      </div>
                    </div>
                  )}

                  {/* Tab 3 Content: File & Parameters */}
                  {activeTab === 'fileParams' && (
                    <div className="space-y-2 text-xs p-1">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">构象坐标文件</span>
                        <span className="font-mono font-bold text-cyan-700">{currentPose.file}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">配体 ID</span>
                        <span className="font-mono text-slate-800">{currentMol.molId}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">对接引擎</span>
                        <span className="font-bold text-slate-800">AutoDock Vina 1.2.5</span>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>
      </ScrollArea>

    </div>
  );
};

