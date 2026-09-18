import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronDown,
  Upload, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Info, 
  HelpCircle,
  Check,
  Play,
  RotateCcw,
  Sliders,
  AlertCircle,
  FileText,
  MousePointer,
  Sparkles,
  PenTool,
  Atom,
  Target,
  Copy,
  LayoutGrid,
  CheckSquare,
  Undo2,
  Eraser
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Interactive Dark 3D Docking Pocket & Bounding Box Viewer Component
// ---------------------------------------------------------------------------
interface Docking3DViewerDarkProps {
  centerX: number;
  centerY: number;
  centerZ: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  isSelectingCenter: boolean;
  onSelectAtomCenter: (x: number, y: number, z: number) => void;
}

function Docking3DViewerDark({
  centerX,
  centerY,
  centerZ,
  sizeX,
  sizeY,
  sizeZ,
  isSelectingCenter,
  onSelectAtomCenter
}: Docking3DViewerDarkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<'cartoon' | 'surface' | 'both'>('cartoon');
  const [showBox, setShowBox] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(12);

  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.35, y: 0.85 });

  // Generate mock EGFR receptor protein backbone atoms for visualization
  const proteinAtoms = useMemo(() => {
    const atoms = [];
    const numResidues = 40;
    for (let r = 0; r < numResidues; r++) {
      const angle = r * 0.35;
      const radius = 9 + Math.sin(r * 0.2) * 3;
      const cx = centerX + Math.cos(angle) * radius;
      const cy = centerY + Math.sin(angle) * radius * 0.6 + (r - numResidues / 2) * 0.5;
      const cz = centerZ + Math.sin(r * 0.5) * 5;

      atoms.push({ id: r * 4, x: cx, y: cy, z: cz, atomName: 'CA', resSeq: 700 + r, resName: ['GLU', 'LYS', 'VAL', 'ASP', 'ALA', 'PHE', 'LEU'][r % 7] });
      atoms.push({ id: r * 4 + 1, x: cx + 1.2, y: cy + 0.8, z: cz - 0.5, atomName: 'N', resSeq: 700 + r, resName: ['GLU', 'LYS', 'VAL', 'ASP', 'ALA', 'PHE', 'LEU'][r % 7] });
      atoms.push({ id: r * 4 + 2, x: cx - 1.0, y: cy - 0.6, z: cz + 0.8, atomName: 'C', resSeq: 700 + r, resName: ['GLU', 'LYS', 'VAL', 'ASP', 'ALA', 'PHE', 'LEU'][r % 7] });
    }
    return atoms;
  }, [centerX, centerY, centerZ]);

  // Main canvas render loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid pattern
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      for (let x = 0; x < width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 36) {
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

      // 3D -> 2D projection
      const project = (x: number, y: number, z: number) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const dz = z - centerZ;

        const x1 = dx * cosY - dz * sinY;
        const z1 = dx * sinY + dz * cosY;

        const y2 = dy * cosX - z1 * sinX;
        const z2 = dy * sinX + z1 * cosX;

        const depthScale = (z2 + 60) / 60;
        const screenX = width / 2 + x1 * scale * depthScale;
        const screenY = height / 2 + y2 * scale * depthScale;

        return { screenX, screenY, depth: z2, depthScale };
      };

      // 1. Draw Cartoon Ribbon Backbone
      if (mode === 'cartoon' || mode === 'both') {
        const caAtoms = proteinAtoms.filter(a => a.atomName === 'CA').map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
        if (caAtoms.length > 1) {
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let i = 0; i < caAtoms.length - 1; i++) {
            const p1 = caAtoms[i];
            const p2 = caAtoms[i + 1];
            ctx.beginPath();
            const grad = ctx.createLinearGradient(p1.screenX, p1.screenY, p2.screenX, p2.screenY);
            grad.addColorStop(0, '#38bdf8');
            grad.addColorStop(0.5, '#028fac');
            grad.addColorStop(1, '#64748b');
            ctx.strokeStyle = grad;
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }

          // Atom nodes
          caAtoms.forEach((pa, idx) => {
            ctx.fillStyle = idx % 2 === 0 ? '#38bdf8' : '#a5f3fc';
            ctx.beginPath();
            ctx.arc(pa.screenX, pa.screenY, 3.5 * Math.max(0.5, pa.depthScale), 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      // 2. Draw Surface Mode
      if (mode === 'surface' || mode === 'both') {
        const projAtoms = proteinAtoms.map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1;
        projAtoms.forEach(pa => {
          ctx.beginPath();
          ctx.arc(pa.screenX, pa.screenY, 14 * Math.max(0.5, pa.depthScale), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      // 3. Draw Cyan Bounding Box (搜索盒)
      if (showBox) {
        const hx = sizeX / 2;
        const hy = sizeY / 2;
        const hz = sizeZ / 2;

        const corners = [
          { x: centerX - hx, y: centerY - hy, z: centerZ - hz },
          { x: centerX + hx, y: centerY - hy, z: centerZ - hz },
          { x: centerX + hx, y: centerY + hy, z: centerZ - hz },
          { x: centerX - hx, y: centerY + hy, z: centerZ - hz },
          { x: centerX - hx, y: centerY - hy, z: centerZ + hz },
          { x: centerX + hx, y: centerY - hy, z: centerZ + hz },
          { x: centerX + hx, y: centerY + hy, z: centerZ + hz },
          { x: centerX - hx, y: centerY + hy, z: centerZ + hz }
        ].map(p => ({ ...p, ...project(p.x, p.y, p.z) }));

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        // Fill box face
        ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
        ctx.beginPath();
        ctx.moveTo(corners[0].screenX, corners[0].screenY);
        ctx.lineTo(corners[1].screenX, corners[1].screenY);
        ctx.lineTo(corners[2].screenX, corners[2].screenY);
        ctx.lineTo(corners[3].screenX, corners[3].screenY);
        ctx.closePath();
        ctx.fill();

        // Cyan wireframe lines
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(corners[i].screenX, corners[i].screenY);
          ctx.lineTo(corners[j].screenX, corners[j].screenY);
          ctx.stroke();
        });

        // Center dot on docking box (Orange sphere)
        const centerProj = project(centerX, centerY, centerZ);
        ctx.fillStyle = '#f97316';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerProj.screenX, centerProj.screenY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [centerX, centerY, centerZ, sizeX, sizeY, sizeZ, mode, showBox, scale, proteinAtoms]);

  // Handle canvas resize
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

  // Mouse drag handlers
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
    setScale(prev => Math.min(28, Math.max(5, prev - e.deltaY * 0.01)));
  };

  const handleCanvasClick = () => {
    if (!isSelectingCenter) return;
    const randomOffsetX = (Math.random() - 0.5) * 3;
    const randomOffsetY = (Math.random() - 0.5) * 3;
    const randomOffsetZ = (Math.random() - 0.5) * 3;
    onSelectAtomCenter(
      parseFloat((centerX + randomOffsetX).toFixed(3)),
      parseFloat((centerY + randomOffsetY).toFixed(3)),
      parseFloat((centerZ + randomOffsetZ).toFixed(3))
    );
  };

  return (
    <div ref={containerRef} className="relative w-full h-[400px] bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between font-sans">
      
      {/* Top Toolbar matching screenshot */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#1e293b]/90 backdrop-blur border border-slate-700/60 rounded-lg p-1 text-[11px] font-bold text-slate-300">
        <button
          type="button"
          onClick={() => setMode('cartoon')}
          className={cn(
            "px-2.5 py-1 rounded transition-colors cursor-pointer",
            mode === 'cartoon' ? "bg-[#02A1C8] text-white" : "hover:bg-slate-700/80 text-slate-300"
          )}
        >
          Cartoon
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'surface' ? 'cartoon' : 'surface')}
          className={cn(
            "px-2.5 py-1 rounded transition-colors cursor-pointer",
            mode === 'surface' ? "bg-[#02A1C8] text-white" : "hover:bg-slate-700/80 text-slate-300"
          )}
        >
          Surface
        </button>
        <button
          type="button"
          onClick={() => setShowBox(!showBox)}
          className={cn(
            "px-2.5 py-1 rounded transition-colors cursor-pointer",
            showBox ? "bg-[#02A1C8] text-white" : "hover:bg-slate-700/80 text-slate-300"
          )}
        >
          搜索盒
        </button>
        <button
          type="button"
          onClick={() => {
            const randomOffsetX = (Math.random() - 0.5) * 2;
            const randomOffsetY = (Math.random() - 0.5) * 2;
            const randomOffsetZ = (Math.random() - 0.5) * 2;
            onSelectAtomCenter(
              parseFloat((centerX + randomOffsetX).toFixed(3)),
              parseFloat((centerY + randomOffsetY).toFixed(3)),
              parseFloat((centerZ + randomOffsetZ).toFixed(3))
            );
          }}
          className={cn(
            "px-2.5 py-1 rounded transition-colors cursor-pointer border border-cyan-500/30",
            isSelectingCenter ? "bg-cyan-500 text-white animate-pulse" : "hover:bg-slate-700/80 text-cyan-400"
          )}
        >
          在结构上选中心
        </button>
        <button
          type="button"
          onClick={() => {
            rotationRef.current = { x: 0.35, y: 0.85 };
            setScale(12);
          }}
          className="px-2.5 py-1 rounded hover:bg-slate-700/80 text-slate-300 transition-colors cursor-pointer"
        >
          重置
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Info Bar matching screenshot */}
      <div className="absolute bottom-2 left-3 right-3 z-10 flex items-center justify-between text-[11px] text-slate-400 font-sans pointer-events-none bg-slate-900/70 backdrop-blur px-2.5 py-1 rounded-md border border-slate-800/50">
        <span>点击 “在结构上选中心” 后选择原子，坐标自动回填</span>
        <span className="font-mono">受体已加载 · 2,846 原子 · 1 条链</span>
      </div>

    </div>
  );
}

// Scaffolds lists for molecular drawing panel/editor simulator
const SCAFFOLD_LIBRARY = [
  {
    name: "咪唑并吡啶骨架 (Imidazopyridine Core)",
    smiles: "C1=C2N=CN=C2C=C1",
    description: "常见激酶抑制剂母核骨架，多子链扩展可调结合能",
    type: "Kinase Scaffold"
  },
  {
    name: "Dianilinopyrimidine 骨架 (嘧啶二胺)",
    smiles: "C1=C(C=CN=C1N)NC2=CC=CC=C2",
    description: "表皮生长因子受体 (EGFR) 抑制剂高频优势骨架",
    type: "EGFR Core"
  },
  {
    name: "吲哚咔唑骨架 (Indolocarbazole Core)",
    smiles: "C1=CC=C2C(=C1)NC3=C2C(C(=O)N3)C4=CNC5=CC=CC=C54",
    description: "高刚性稠环结构，适合深口袋结合区填补优化",
    type: "De Novo Scaffold"
  },
  {
    name: "四氢异喹啉骨架 (Tetrahydroisoquinoline)",
    smiles: "C1CC2=CC=CC=C2CN1",
    description: "用于调节分子量与QED类药水溶平衡性极佳的片段",
    type: "Solubility Enhancer"
  },
];

export function RlMoleculeGenerationTask({ onBack, onSubmit, onViewResult }: { onBack: () => void; onSubmit: () => void; onViewResult: (taskId: string) => void }) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference'); 

  // Basic Info State
  const [taskName, setTaskName] = useState("RL-Task-" + new Date().toISOString().slice(0, 10));
  const [taskDesc, setTaskDesc] = useState("");

  // Step 1: Upload / Receptor States
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");

  // Step 2: SMILES input & Molecular Editor states
  const [inputSmiles, setInputSmiles] = useState<string>("CC1=C(C=C(C=C1)C(=O)NC2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5");
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [selectedScaffoldIndex, setSelectedScaffoldIndex] = useState<number>(0);
  const [drawingAtomCount, setDrawingAtomCount] = useState<number>(24);
  const [drawingRingCount, setDrawingRingCount] = useState<number>(3);
  const [chargeValue, setChargeValue] = useState<number>(0);
  const [copiedSmilesInEditor, setCopiedSmilesInEditor] = useState<boolean>(false);

  // Step 3: Docking Box Coordinates
  const [boxX, setBoxX] = useState<string>("10.5");
  const [boxY, setBoxY] = useState<string>("20.3");
  const [boxZ, setBoxZ] = useState<string>("-5.1");
  const [boxSize, setBoxSize] = useState<string>("20");

  // Step 4: High-Level RL Steps parameter
  const [rlSteps, setRlSteps] = useState<number>(500); // 200, 500, 1000
  const [qedThreshold, setQedThreshold] = useState<number>(0.5); // 0.1 - 0.9, default 0.5
  const [generateCount, setGenerateCount] = useState<number>(100); // 10 - 500, default 100

  // Step 5: Molecular Docking Section States
  const [enableDocking, setEnableDocking] = useState<boolean>(true);
  const [dockingTopN, setDockingTopN] = useState<string>("20");
  const [dockingCenterX, setDockingCenterX] = useState<string>("31.254");
  const [dockingCenterY, setDockingCenterY] = useState<string>("-1.894");
  const [dockingCenterZ, setDockingCenterZ] = useState<string>("18.442");
  const [dockingSizeX, setDockingSizeX] = useState<string>("22.500");
  const [dockingSizeY, setDockingSizeY] = useState<string>("22.500");
  const [dockingSizeZ, setDockingSizeZ] = useState<string>("22.500");
  const [dockingEnergyRange, setDockingEnergyRange] = useState<string>("3");
  const [dockingCpu, setDockingCpu] = useState<string>("8");
  const [dockingExhaustiveness, setDockingExhaustiveness] = useState<string>("8");
  const [dockingNumModes, setDockingNumModes] = useState<string>("9");
  const [dockingSeed, setDockingSeed] = useState<string>("20260804");
  const [dockingReceptorFile, setDockingReceptorFile] = useState<string>("receptor_egfr.pdb");
  const [dockingPreparedFile, setDockingPreparedFile] = useState<string>("receptor_egfr_prepared.pdbqt");
  const [isSelectingCenter, setIsSelectingCenter] = useState<boolean>(false);

  // History tasks list
  const [historyData] = useState([
    { id: "RL-20260420-001", name: "EGFR_RL_Optimization", model: "强化学习分子生成模型", startTime: "2026-04-20 10:00:00", endTime: "2026-04-20 11:30:00", status: "success" },
    { id: "RL-20260420-002", name: "BRAF_DeNovo_Gen", model: "强化学习分子生成模型", startTime: "2026-04-20 14:00:00", endTime: "2026-04-20 15:45:00", status: "success" },
    { id: "RL-20260421-003", name: "MET_Targeted_Gen", model: "强化学习分子生成模型", startTime: "2026-04-21 09:15:00", endTime: "-", status: "executing" },
    { id: "RL-20260502-004", name: "PDK1_Active口袋优化", model: "强化学习分子生成模型", startTime: "2026-05-02 11:30:00", endTime: "2026-05-02 13:00:00", status: "success" },
  ]);

  // Apply target presets
  const handleApplyPreset = (type: 'EGFR' | 'BRAF') => {
    if (type === 'EGFR') {
      setBoxX("10.5");
      setBoxY("20.3");
      setBoxZ("-5.1");
      setBoxSize("20");
      setUploadedFileName("EGFR_1IEP.pdbqt");
      setTargetId("EGFR (1IEP)");
      setDockingReceptorFile("receptor_egfr.pdb");
      setDockingPreparedFile("receptor_egfr_prepared.pdbqt");
      setDockingCenterX("31.254");
      setDockingCenterY("-1.894");
      setDockingCenterZ("18.442");
    } else {
      setBoxX("25.4");
      setBoxY("12.1");
      setBoxZ("34.8");
      setBoxSize("18");
      setUploadedFileName("BRAF_5CTB.pdbqt");
      setTargetId("BRAF (5C1B)");
      setDockingReceptorFile("receptor_braf.pdb");
      setDockingPreparedFile("receptor_braf_prepared.pdbqt");
      setDockingCenterX("25.400");
      setDockingCenterY("12.100");
      setDockingCenterZ("34.800");
    }
  };

  // Mock Upload simulation
  const handleDummyUpload = () => {
    setUploadedFileName("Custom_Receptor_Input.pdbqt");
    setTargetId("Uploaded_Receptor_Target");
  };

  // Load a standard sample ligand SMILES
  const handleLoadSampleSmiles = () => {
    const demoSmilesList = [
      "CC1=C(C=C(C=C1)C(=O)NC2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
      "CN1CCN(CC2=CC=C(C=C2)NC(=O)C3=CC=C(C)C(=C3)NC4=NC=CC(=N4)C5=CN=CC=C5)CC1",
      "COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4"
    ];
    // Random select or sequential
    const randomSmiles = demoSmilesList[Math.floor(Math.random() * demoSmilesList.length)];
    setInputSmiles(randomSmiles);
  };

  // Import from premium mock 2D molecule editor
  const handleImportFrom2DEditor = () => {
    const selectedScaffold = SCAFFOLD_LIBRARY[selectedScaffoldIndex];
    setInputSmiles(selectedScaffold.smiles);
    setIsEditorOpen(false);
  };

  const handleCustomSubmit = () => {
    onSubmit();
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] text-slate-800">
      
      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[1200px] mx-auto pb-44 space-y-6">
          
          {/* 1. Header & Description Block (模型标题和模型说明) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/35 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col gap-3.5">
              {/* Sleek inline back button */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack} 
                  className="flex items-center gap-1.5 text-slate-650 hover:text-slate-950 font-medium text-xs h-7 px-2 rounded-lg border border-slate-100 hover:border-slate-250 hover:bg-slate-50/80 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  返回
                </Button>
                <div className="h-4.5 w-[1px] bg-slate-200" />
                <span className="text-slate-400 text-xs font-mono">模型计算中心 / 强化学习分子生成</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="space-y-2 max-w-4xl">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">强化学习分子生成</h1>
                    <Badge className="bg-[#02A1C8]/10 text-[#02A1C8] hover:bg-[#02A1C8]/10 border-none tech-mono font-bold text-[10px] uppercase">
                      REINFORCEMENT LEARNING
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    提供基于智能神经网络与深度强化学习（RL）算法的小分子定向生成和结构微调。支持上传靶点蛋白受体和待优化分子SMILES，系统将自动映射活性口袋三维坐标网格，在维持优势高频分子骨架的同时，围绕结合静电、QED类药性、合成可及性（SA）等多物理指标在解空间内开展配体迭代进化，快速生成满足药效契合度的优质先导化合物。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tabs Switcher (页签转换器) */}
          <div className="flex border-b border-slate-200 font-sans">
            <button 
              onClick={() => setActiveTab('inference')}
              className={cn(
                "px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
                activeTab === 'inference' 
                  ? "border-[#02A1C8] text-[#02A1C8] font-black" 
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <MousePointer className="w-4 h-4" />
              推理
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
                activeTab === 'history' 
                  ? "border-[#02A1C8] text-[#02A1C8] font-black" 
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Clock className="w-4 h-4" />
              历史任务
              <Badge variant="secondary" className="ml-1 bg-slate-100 text-slate-600 border-none font-bold text-[10px] py-0.5 px-1.5">
                {historyData.length}
              </Badge>
            </button>
          </div>

          {/* Tab contents */}
          {activeTab === 'inference' ? (
            <div className="space-y-8 text-left font-sans">
              
              {/* STAGE 1: 输入 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#02A1C8] text-white font-extrabold text-[11px] flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-sm font-black text-slate-900">输入</h2>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                  
                  {/* Basic Task Information inside Group 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-100 pb-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="rl-task-name" className="text-xs font-bold text-slate-800">任务作业名称</Label>
                      <Input 
                        id="rl-task-name"
                        value={taskName}
                        onChange={e => setTaskName(e.target.value)}
                        className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-medium"
                        placeholder="请输入任务作业名称"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rl-task-desc" className="text-xs font-bold text-slate-800">任务描述（选填）</Label>
                      <Input 
                        id="rl-task-desc"
                        value={taskDesc}
                        onChange={e => setTaskDesc(e.target.value)}
                        className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-medium"
                        placeholder="记录您的生成思路或实验批次..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Input 1: Upload Pathogen Receptor */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-800">上传靶点结构</Label>
                        <span className="text-[10px] text-muted-foreground">支持格式: .pdb, .pdbqt</span>
                      </div>

                      <div 
                        onClick={handleDummyUpload}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 min-h-[170px]",
                          uploadedFileName 
                            ? "border-emerald-300 bg-emerald-50/10 hover:border-emerald-400" 
                            : "border-slate-200 bg-slate-50/40 hover:border-[#02A1C8]/40 hover:bg-slate-50/80"
                        )}
                      >
                        <Upload className={cn(
                          "w-6 h-6 transition-all group-hover:scale-110",
                          uploadedFileName ? "text-emerald-500" : "text-slate-400 group-hover:text-[#02A1C8]"
                        )} />
                        
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">
                            {uploadedFileName ? `已选文件: ${uploadedFileName}` : "拖拽或点击上传受体文件"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            通过上传受体文件（支持的格式: .pdb 和 .pdbqt）
                          </p>
                        </div>
                      </div>

                      {/* Presets target link buttons to allow quick interaction */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                        <span>已有样本：</span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('EGFR')}
                          className={cn(
                            "px-2 py-0.5 rounded border transition-all text-[10px] font-semibold",
                            targetId === "EGFR (1IEP)"
                              ? "bg-[#02A1C8] border-transparent text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          EGFR (1IEP)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('BRAF')}
                          className={cn(
                            "px-2 py-0.5 rounded border transition-all text-[10px] font-semibold",
                            targetId === "BRAF (5C1B)"
                              ? "bg-[#02A1C8] border-transparent text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          BRAF (5C1B)
                        </button>
                      </div>
                    </div>

                    {/* Input 2: Molecule SMILES input with 2D molecular Editor feature */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="rl-smiles-input" className="text-xs font-bold text-slate-800">参考分子 SMILES 序列</Label>
                          <button 
                            type="button"
                            onClick={handleLoadSampleSmiles}
                            className="text-[10px] text-[#02A1C8] font-bold hover:underline"
                          >
                            分子结构载入
                          </button>
                        </div>

                        <textarea
                          id="rl-smiles-input"
                          value={inputSmiles}
                          onChange={e => setInputSmiles(e.target.value)}
                          rows={6}
                          className="w-full text-[11px] font-mono p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus-visible:outline-none focus:ring-1 focus:ring-[#02A1C8] text-slate-705 font-medium leading-relaxed resize-none h-[116px]"
                          placeholder="请输入待优化分子 SMILES 序列 (例如：CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F)"
                        />
                      </div>

                      {/* Premium visual import block with customizable 2D drawing triggers */}
                      <div className="pt-2">
                        <Button 
                          type="button"
                          onClick={() => setIsEditorOpen(true)}
                          className="w-full py-5 rounded-xl border border-dashed border-[#02A1C8]/40 bg-[#02A1C8]/5 hover:bg-[#02A1C8]/10 text-xs font-bold text-[#02A1C8] flex items-center justify-center gap-2 shadow-none hover:border-[#02A1C8]"
                        >
                          <PenTool className="w-4 h-4 animate-bounce" />
                          从 2D 分子编辑器内导入参考序列
                        </Button>
                      </div>

                    </div>

                  </div>

                </div>
              </div>

              {/* STAGE 2: 第二部分：参数配置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#02A1C8] text-white font-extrabold text-[11px] flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-sm font-black text-slate-900">第二部分：参数配置</h2>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                  
                  {/* Sub-param 1: 指定活性位点 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Target className="w-4.5 h-4.5 text-[#02A1C8]" />
                      <h3 className="text-xs font-bold text-slate-800">指定活性位点</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-1">
                      
                      {/* Box coordinates */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] font-bold text-slate-500">对接盒子中心坐标</Label>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Coordinates (x, y, z)</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">X</span>
                              <Input 
                                value={boxX}
                                onChange={e => setBoxX(e.target.value)}
                                className="h-8 pl-6 text-xs text-center tech-mono rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">Y</span>
                              <Input 
                                value={boxY}
                                onChange={e => setBoxY(e.target.value)}
                                className="h-8 pl-6 text-xs text-center tech-mono rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">Z</span>
                              <Input 
                                value={boxZ}
                                onChange={e => setBoxZ(e.target.value)}
                                className="h-8 pl-6 text-xs text-center tech-mono rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Box dimension size */}
                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold text-slate-500 block text-left">对接的盒子大小</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input 
                              value={boxSize}
                              onChange={e => setBoxSize(e.target.value)}
                              className="h-8 text-xs font-bold text-center tech-mono rounded-lg"
                            />
                          </div>
                          <span className="text-xs text-slate-400 font-semibold shrink-0">(&Aring;) 埃</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Sub-param 2: RL迭代步数 */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                      <h3 className="text-xs font-bold text-slate-800">RL迭代步数</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pl-1">
                      
                      {/* Fast choice card */}
                      <div 
                        onClick={() => setRlSteps(200)}
                        className={cn(
                          "p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between text-left h-24",
                          rlSteps === 200 
                            ? "border-[#02A1C8] bg-[#02A1C8]/5 shadow-sm" 
                            : "border-slate-200/80 bg-slate-50/20 hover:bg-slate-50/70"
                        )}
                      >
                        {rlSteps === 200 && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-[#02A1C8] rounded-full flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div>
                          <p className={cn("text-xs font-extrabold transition-colors", rlSteps === 200 ? "text-[#02A1C8]" : "text-slate-800")}>快速生成</p>
                          <p className="text-[10px] text-slate-450 mt-1">200步，约10分钟配体生成</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px] w-fit font-bold border-none bg-slate-100 text-slate-500 font-mono">适合粗筛与探索</Badge>
                      </div>

                      {/* Standard choice card */}
                      <div 
                        onClick={() => setRlSteps(500)}
                        className={cn(
                          "p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between text-left h-24",
                          rlSteps === 500 
                            ? "border-[#02A1C8] bg-[#02A1C8]/5 shadow-sm" 
                            : "border-slate-200/80 bg-slate-50/20 hover:bg-slate-50/70"
                        )}
                      >
                        {rlSteps === 500 && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-[#02A1C8] rounded-full flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div>
                          <p className={cn("text-xs font-extrabold transition-colors", rlSteps === 500 ? "text-[#02A1C8]" : "text-slate-800")}>标准平衡</p>
                          <p className="text-[10px] text-slate-450 mt-1">500步，约25分钟，高度推荐</p>
                        </div>
                        <Badge className="text-[9px] w-fit font-bold border-none bg-indigo-50 text-indigo-500 font-mono">推荐基准配置</Badge>
                      </div>

                      {/* Precise choice card */}
                      <div 
                        onClick={() => setRlSteps(1000)}
                        className={cn(
                          "p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between text-left h-24",
                          rlSteps === 1000 
                            ? "border-[#02A1C8] bg-[#02A1C8]/5 shadow-sm" 
                            : "border-slate-200/80 bg-slate-50/20 hover:bg-slate-50/70"
                        )}
                      >
                        {rlSteps === 1000 && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-[#02A1C8] rounded-full flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div>
                          <p className={cn("text-xs font-extrabold transition-colors", rlSteps === 1000 ? "text-[#02A1C8]" : "text-slate-800")}>精细最优质量</p>
                          <p className="text-[10px] text-slate-450 mt-1">1000步，约50分钟，适合精细生成</p>
                        </div>
                        <Badge className="text-[9px] w-fit font-bold border-none bg-emerald-50 text-emerald-500 font-mono">精细最优质量</Badge>
                      </div>

                    </div>
                  </div>

                  {/* Sub-param 3: 类药性过滤阈值 */}
                  <div className="space-y-2 text-left pt-5 border-t border-slate-100">
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-bold text-slate-800">QED 类药性过滤阈值</span>
                      
                      <div className="relative w-28">
                        <select
                          id="qed-threshold-select"
                          value={qedThreshold}
                          onChange={(e) => setQedThreshold(parseFloat(e.target.value))}
                          className="w-full h-9 pl-3.5 pr-8 text-xs font-semibold border border-slate-200/80 rounded-xl bg-white text-slate-800 appearance-none focus:outline-none focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8]/10 transition-all cursor-pointer shadow-sm hover:border-slate-300"
                        >
                          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((val) => (
                            <option key={val} value={val}>{val.toFixed(1)}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-450 font-medium">QED代表定量估计分子类药可信度，该参数的取值范围为0-1</span>
                    </div>
                  </div>

                  {/* Sub-param 4: 生成分子数量 */}
                  <div className="space-y-2 text-left pt-5 border-t border-[#f1f5f9]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-bold text-slate-800">
                        生成分子样本数量
                      </span>
                      
                      <div className="relative w-28">
                        <select
                          id="generate-count-select"
                          value={generateCount}
                          onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                          className="w-full h-9 pl-3.5 pr-8 text-xs font-semibold border border-slate-200/80 rounded-xl bg-white text-slate-800 appearance-none focus:outline-none focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8]/10 transition-all cursor-pointer shadow-sm hover:border-slate-300"
                        >
                          {[10, 20, 50, 100, 150, 200, 300, 500].map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-450 font-medium">输出满足多样性指标的预测总数</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* STAGE 3: 第三部分：分子对接 */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-5 h-5 rounded-full bg-[#02A1C8] text-white font-extrabold text-[11px] flex items-center justify-center">
                    3
                  </div>
                  <h2 className="text-sm font-black text-slate-900">分子对接</h2>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                  
                  {/* Row 1: Enable Docking Switch */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div className="space-y-0.5 text-left">
                      <h3 className="text-xs font-bold text-slate-800">是否进行分子对接</h3>
                      <p className="text-[11px] text-slate-400">
                        开启后，按生成综合评分选择 Top-N 分子执行对接与全部 Pose 相互作用分析。
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={enableDocking}
                      onClick={() => setEnableDocking(!enableDocking)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#02A1C8] focus:ring-offset-2",
                        enableDocking ? "bg-[#02A1C8]" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          enableDocking ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Content below toggle when enableDocking is true */}
                  {enableDocking && (
                    <div className="space-y-6">
                      
                      {/* Row 2: Receptor Upload Box & Prepared Status Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Upload Dropzone Box */}
                        <div className="border-2 border-dashed border-slate-200 hover:border-[#02A1C8]/40 rounded-xl bg-white p-4 flex items-center justify-between transition-colors">
                          <div className="text-left space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">上传目标蛋白受体</p>
                            <p className="text-[11px] text-slate-400">支持 PDB、PDBQT；PDB 上传后由系统自动制备为 PDBQT。</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleDummyUpload}
                            className="text-[#02A1C8] hover:text-[#028FAC] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#02A1C8]/20 bg-[#02A1C8]/5 hover:bg-[#02A1C8]/10 transition-colors shrink-0 cursor-pointer ml-2"
                          >
                            选择文件
                          </button>
                        </div>

                        {/* Prepared Status Green Card */}
                        <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 flex flex-col justify-center text-left">
                          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            受体制备完成
                          </p>
                          <p className="text-xs font-mono text-emerald-800 mt-1">
                            {dockingReceptorFile} → {dockingPreparedFile}
                          </p>
                        </div>

                      </div>

                      {/* Row 3: Grid containing Left Form Inputs & Right 3D Canvas */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                        
                        {/* Left Column: Form Controls */}
                        <div className="lg:col-span-5 space-y-4">
                          
                          {/* Top-N count */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">对接分子数量 Top-N (不超过生成数量)</Label>
                            <Input
                              value={dockingTopN}
                              onChange={e => setDockingTopN(e.target.value)}
                              className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                            />
                          </div>

                          {/* Pocket Center & Box Size Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">口袋中心 X (Å)</Label>
                              <Input
                                value={dockingCenterX}
                                onChange={e => setDockingCenterX(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">搜索盒大小 X (Å)</Label>
                              <Input
                                value={dockingSizeX}
                                onChange={e => setDockingSizeX(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">口袋中心 Y (Å)</Label>
                              <Input
                                value={dockingCenterY}
                                onChange={e => setDockingCenterY(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">搜索盒大小 Y (Å)</Label>
                              <Input
                                value={dockingSizeY}
                                onChange={e => setDockingSizeY(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">口袋中心 Z (Å)</Label>
                              <Input
                                value={dockingCenterZ}
                                onChange={e => setDockingCenterZ(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">搜索盒大小 Z (Å)</Label>
                              <Input
                                value={dockingSizeZ}
                                onChange={e => setDockingSizeZ(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                          </div>

                          {/* Vina parameters grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">最大能量差 (kcal/mol)</Label>
                              <Input
                                value={dockingEnergyRange}
                                onChange={e => setDockingEnergyRange(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">CPU 数量</Label>
                              <Input
                                value={dockingCpu}
                                onChange={e => setDockingCpu(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">对接细致程度</Label>
                              <Input
                                value={dockingExhaustiveness}
                                onChange={e => setDockingExhaustiveness(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-700">输出构象数</Label>
                              <Input
                                value={dockingNumModes}
                                onChange={e => setDockingNumModes(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                          </div>

                          {/* Seed field */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700">随机种子</Label>
                            <Input
                              value={dockingSeed}
                              onChange={e => setDockingSeed(e.target.value)}
                              className="h-9 text-xs bg-white border-slate-200 rounded-lg text-slate-800 font-mono"
                            />
                          </div>

                        </div>

                        {/* Right Column: Interactive 3D Canvas */}
                        <div className="lg:col-span-7">
                          <Docking3DViewerDark
                            centerX={parseFloat(dockingCenterX) || 31.254}
                            centerY={parseFloat(dockingCenterY) || -1.894}
                            centerZ={parseFloat(dockingCenterZ) || 18.442}
                            sizeX={parseFloat(dockingSizeX) || 22.5}
                            sizeY={parseFloat(dockingSizeY) || 22.5}
                            sizeZ={parseFloat(dockingSizeZ) || 22.5}
                            isSelectingCenter={isSelectingCenter}
                            onSelectAtomCenter={(x, y, z) => {
                              setDockingCenterX(x.toFixed(3));
                              setDockingCenterY(y.toFixed(3));
                              setDockingCenterZ(z.toFixed(3));
                              setIsSelectingCenter(false);
                            }}
                          />
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              </div>

              {/* Action layout section: [开始生成] button */}
              <div className="pt-6 flex justify-center flex-col items-center gap-3">
                <Button 
                  onClick={handleCustomSubmit}
                  className={cn(
                    "h-11 px-20 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.01] active:scale-95 shadow-md flex items-center gap-2",
                    uploadedFileName ? "bg-[#02A1C8] hover:bg-[#028FAC] text-white cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                  disabled={!uploadedFileName}
                >
                  <Play className="w-4 h-4 fill-current animate-pulse" />
                  开始生成
                </Button>

                {/* Info help tag if no target uploaded */}
                {!uploadedFileName && (
                  <div className="p-2.5 px-4 bg-amber-50/80 border border-amber-100 rounded-lg text-[10px] text-amber-700 flex items-center gap-1.5 w-fit">
                    <AlertCircle className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                    <span>请通过点击 <strong>“上传靶点结构”</strong> 或者选择上面的 <strong>“样本靶点”</strong> 以启用算法预测！</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            
            /* History tasks list section matches Scaffold Hopping list visual design */
            <div className="space-y-4 text-left font-sans">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">强化学习分子生成历史</h2>
                  <p className="text-xs text-slate-400">查看计算节点和强化重构的先导小分子采样结果</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input placeholder="搜索任务名称或ID..." className="w-56 h-9 pl-9 text-[11px] tech-mono bg-white" />
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        <th className="px-6 py-4">任务作业名称</th>
                        <th className="px-6 py-4">运行模型</th>
                        <th className="px-6 py-4">任务编号 (Task ID)</th>
                        <th className="px-6 py-4">启动时间</th>
                        <th className="px-6 py-4">算法运行状态</th>
                        <th className="px-6 py-4 text-right">结果管理</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4.5 font-bold text-slate-800">{item.name}</td>
                          <td className="px-6 py-4.5 text-slate-500">{item.model}</td>
                          <td className="px-6 py-4.5 font-mono text-slate-400 font-bold">{item.id}</td>
                          <td className="px-6 py-4.5 text-slate-550">{item.startTime}</td>
                          <td className="px-6 py-4.5">
                            {item.status === 'success' && <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-150 hover:bg-emerald-50 text-[10px] font-bold rounded-lg px-2 py-0.5">执行成功</Badge>}
                            {item.status === 'failed' && <Badge className="bg-rose-50 text-rose-600 border border-rose-150 hover:bg-rose-50 text-[10px] font-bold rounded-lg px-2 py-0.5">任务失败</Badge>}
                            {item.status === 'executing' && <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-150 hover:bg-indigo-50 text-[10px] font-bold rounded-lg px-2 py-0.5 animate-pulse">重构生成中</Badge>}
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <button 
                              className={cn(
                                "text-[11px] font-bold hover:underline",
                                item.status === 'success' ? "text-[#02A1C8]" : "text-slate-300 cursor-not-allowed"
                              )}
                              disabled={item.status !== 'success'}
                              onClick={() => {
                                if (item.status === 'success') onViewResult(item.id);
                              }}
                            >
                              [ 查看详情评估 ]
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

        </div>
      </ScrollArea>

      {/* 2D Molecular Editor Simulator Canvas Pop-up Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-[760px] w-full bg-white text-slate-900 border-[#02A1C8]/20 shadow-2xl rounded-2xl p-6 font-sans">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <Sparkles className="w-5 h-5 text-[#02A1C8]" />
              2D先导化合物骨架编辑器 
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              自主绘制分子骨架或在左侧选择常备药物高频活性母核，通过点击或配置原子修饰参数快速进行2D建模并输出可用SMILES结构。
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-3 h-[420px]">
            
            {/* Left side: Scaffold List Selection */}
            <div className="md:col-span-5 border-r border-slate-100 pr-4 flex flex-col gap-3 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">预置优势核共用库</span>
              
              <div className="space-y-2">
                {SCAFFOLD_LIBRARY.map((scaffold, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      setSelectedScaffoldIndex(index);
                      setDrawingAtomCount(index === 0 ? 16 : index === 1 ? 22 : index === 2 ? 30 : 12);
                      setDrawingRingCount(index === 0 ? 2 : index === 1 ? 2 : index === 2 ? 4 : 1);
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1",
                      selectedScaffoldIndex === index 
                        ? "border-[#02A1C8] bg-[#02A1C8]/5" 
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 block truncate max-w-[195px]">{scaffold.name}</span>
                      <Badge className="bg-slate-200/70 text-slate-600 hover:bg-slate-200/70 border-none text-[8px] font-semibold scale-90 origin-right px-1">
                        {scaffold.type}
                      </Badge>
                    </div>
                    <code className="text-[8px] text-muted-foreground block font-mono truncate">{scaffold.smiles}</code>
                    <p className="text-[9px] text-slate-400 shrink-0 leading-normal">{scaffold.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Drawing Canvas Area Simulator */}
            <div className="md:col-span-7 flex flex-col justify-between">
              
              {/* Canvas toolbar */}
              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-1.5 border border-slate-250 mb-1 text-[10px]">
                <div className="flex items-center gap-1 text-slate-500">
                  <Button variant="ghost" size="icon" className="w-6 h-6 p-0 rounded bg-white text-slate-800 shadow-sm border border-slate-200">
                    <MousePointer className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6 p-0 rounded">
                    <Atom className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6 p-0 rounded">
                    <Eraser className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-slate-300 px-1">|</span>
                  <button className="px-1.5 py-0.5 rounded hover:bg-slate-200 font-bold text-[9px]">单键</button>
                  <button className="px-1.5 py-0.5 rounded hover:bg-slate-200 font-bold text-[9px]">双键</button>
                  <button className="px-1.5 py-0.5 rounded hover:bg-slate-200 font-bold text-[9px] text-[#02A1C8]">+ 苯环</button>
                </div>
                
                <div className="font-mono text-[9px] text-slate-400">
                  Grid 2D
                </div>
              </div>

              {/* Simulated whiteboard drawing with molecular diagram */}
              <div className="flex-1 bg-slate-50/30 rounded-xl relative border border-slate-200/75 p-3 flex flex-col justify-between min-h-[200px] overflow-hidden">
                {/* Visual grid background */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                  backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }} />

                <div className="flex items-start justify-between z-10">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] font-bold text-[#02A1C8] bg-[#02A1C8]/10 px-2 py-0.5 rounded-md w-fit">2D 晶格网格绘制中</span>
                    <span className="text-[9px] text-slate-400">原子坐标已校验：无明显电荷冲突</span>
                  </div>
                  <div className="text-right flex flex-col gap-1 text-[9px] text-slate-455 font-mono">
                    <span>原子数: {drawingAtomCount}</span>
                    <span>稠环数: {drawingRingCount}</span>
                  </div>
                </div>

                {/* Central beautiful structure render */}
                <div className="flex-1 flex items-center justify-center p-2">
                  {selectedScaffoldIndex === 0 && (
                    <svg viewBox="0 0 160 100" className="w-36 h-28">
                      {/* Imidazopyridine Core drawing */}
                      <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="#475569" strokeWidth="2" />
                      <polygon points="80,35 110,45 110,55 80,65" fill="none" stroke="#02A1C8" strokeWidth="2" />
                      <text x="50" y="54" fill="#02A1C8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
                      <text x="20" y="54" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
                    </svg>
                  )}
                  {selectedScaffoldIndex === 1 && (
                    <svg viewBox="0 0 160 100" className="w-36 h-28">
                      {/* Dianilinopyrimidine drawing */}
                      <circle cx="50" cy="50" r="20" fill="none" stroke="#475569" strokeWidth="2" />
                      <path d="M 70,50 L 90,50" stroke="#475569" strokeWidth="2" />
                      <circle cx="110" cy="50" r="20" fill="none" stroke="#02A1C8" strokeWidth="2" />
                      <text x="50" y="53" fill="#2563eb" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>
                      <text x="110" y="53" fill="#3b82f6" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
                    </svg>
                  )}
                  {selectedScaffoldIndex === 2 && (
                    <svg viewBox="0 0 160 100" className="w-36 h-28">
                      {/* Indolocarbazole multi ring */}
                      <polygon points="30,30 55,42 55,68 30,80 5,68 5,42" fill="none" stroke="#475569" strokeWidth="2" />
                      <polygon points="55,42 80,30 105,42 105,68 80,80 55,68" fill="none" stroke="#475569" strokeWidth="2" />
                      <polygon points="105,42 130,30 155,42 155,68 130,80 105,68" fill="none" stroke="#02A1C8" strokeWidth="2" />
                      <text x="130" y="58" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>
                    </svg>
                  )}
                  {selectedScaffoldIndex === 3 && (
                    <svg viewBox="0 0 160 100" className="w-36 h-28">
                      {/* Tetrahydroisoquinoline */}
                      <polygon points="60,25 95,45 60,85 25,65" fill="none" stroke="#475569" strokeWidth="2" />
                      <path d="M 95,45 C 110,60 110,75 95,85" fill="none" stroke="#475569" strokeWidth="2" />
                      <text x="60" y="55" fill="#2563eb" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>
                    </svg>
                  )}
                </div>

                {/* Simulated SMILES representation in realtime */}
                <div className="z-10 bg-white/90 backdrop-blur rounded p-2 text-left border border-slate-100 flex items-center justify-between gap-3 text-[10px]">
                  <div className="truncate font-mono font-bold text-slate-700">
                    SMILES: {SCAFFOLD_LIBRARY[selectedScaffoldIndex].smiles}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 border rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(SCAFFOLD_LIBRARY[selectedScaffoldIndex].smiles);
                      setCopiedSmilesInEditor(true);
                      setTimeout(() => setCopiedSmilesInEditor(false), 2000);
                    }}
                  >
                    {copiedSmilesInEditor ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </Button>
                </div>

              </div>

              {/* Extra atom parameter adjuster */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-left">
                <div>
                  <Label className="text-[9px] font-bold text-slate-400 block mb-1">形式电荷</Label>
                  <Input 
                    type="number"
                    value={chargeValue}
                    onChange={e => setChargeValue(parseInt(e.target.value) || 0)}
                    className="h-7 text-[10px] text-center"
                  />
                </div>
                <div>
                  <Label className="text-[9px] font-bold text-slate-400 block mb-1">立体异构</Label>
                  <select className="w-full h-7 rounded border border-slate-200 text-[10px] px-1 bg-white focus-visible:outline-none">
                    <option>无 (Acyclic)</option>
                    <option>置信 R 类药面</option>
                    <option>置信 S 类药面</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[9px] font-bold text-slate-400 block mb-1">重原子过滤</Label>
                  <select className="w-full h-7 rounded border border-slate-200 text-[10px] px-1 bg-white focus-visible:outline-none">
                    <option>不过滤</option>
                    <option>限制 F / Cl</option>
                    <option>高度氟化修饰</option>
                  </select>
                </div>
              </div>

            </div>

          </div>

          {/* Action buttons at the bottom of Editor Modal */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button 
              variant="outline" 
              className="px-4 h-8 rounded-lg text-xs font-bold border-slate-200 text-slate-550"
              onClick={() => setIsEditorOpen(false)}
            >
              取 消
            </Button>
            <Button 
              className="px-5 h-8 rounded-lg text-xs font-bold bg-[#02A1C8] hover:bg-[#028FAC] text-white"
              onClick={handleImportFrom2DEditor}
            >
              生成并导入序列
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
