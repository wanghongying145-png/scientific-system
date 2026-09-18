import * as React from "react";
import { useState, useEffect, ReactNode } from "react";
import { 
  Trash2, 
  ChevronLeft, 
  Search, 
  RotateCcw, 
  Info, 
  Activity, 
  Send, 
  History,
  Beaker,
  FileText,
  ChevronRight,
  Database,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
  Plus,
  Sparkles,
  Copy,
  Check,
  Undo,
  Eraser,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function HorizontalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-stretch border rounded h-10 overflow-hidden bg-white group focus-within:border-[#0F172A]/30 transition-colors">
      <div className="w-32 bg-[#F8FAFB] border-r flex items-center px-4 shrink-0">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex-1 flex items-center px-3 relative">
        {children}
      </div>
    </div>
  );
}

export function PotentialTargetPredictionTask({ onBack, onSubmit, onViewResult }: { onBack: () => void; onSubmit: () => void; onViewResult: (taskId: string) => void }) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference');
  const [taskName, setTaskName] = useState("PTP-Task-" + new Date().toISOString().slice(0, 10));
  const [taskDesc, setTaskDesc] = useState("");
  
  // SMILES Input
  const [smiles, setSmiles] = useState("");
  const [smilesError, setSmilesError] = useState("");

  // Settings
  const [topN, setTopN] = useState("10");
  const [minConfidence, setMinConfidence] = useState("standard");

  // Molecular Drawer dialog states
  const [isDrawOpen, setIsDrawOpen] = useState(false);
  const [dialogSmiles, setDialogSmiles] = useState("");
  const [drawNodes, setDrawNodes] = useState<{ id: string; x: number; y: number; label: string }[]>([]);
  const [drawEdges, setDrawEdges] = useState<{ id: string; source: string; target: string; type: 'single' | 'double' | 'triple' }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const parseSMILESToGraph = (smilesStr: string) => {
    const nodes: { id: string; x: number; y: number; label: string }[] = [];
    const edges: { id: string; source: string; target: string; type: 'single' | 'double' | 'triple' }[] = [];

    const cleanSmiles = smilesStr.trim();
    if (!cleanSmiles) return { nodes, edges };

    // Quick presets
    const lowerSmiles = cleanSmiles.toLowerCase().replace(/[\(\[\)\]]/g, '');
    if (lowerSmiles.includes('c1ccccc1') || lowerSmiles === 'c1=cc=cc=c1' || lowerSmiles === 'benzene' || cleanSmiles === 'C1=CC=CC=C1') {
      const cx = 220, cy = 150, R = 50;
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        nodes.push({ id: `parsed-b-${i}`, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), label: 'C' });
      }
      for (let i = 0; i < 6; i++) {
        edges.push({ id: `parsed-be-${i}`, source: `parsed-b-${i}`, target: `parsed-b-${(i+1)%6}`, type: i % 2 === 0 ? 'double' : 'single' });
      }
      return { nodes, edges };
    }
    
    if (cleanSmiles === "CC(=O)OC1=CC=CC=C1C(=O)O" || lowerSmiles.includes('aspirin') || lowerSmiles.includes('acetylsalicylic')) {
      const cx = 180, cy = 155, R = 45;
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        nodes.push({ id: `asp-r-${i}`, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), label: 'C' });
      }
      for (let i = 0; i < 6; i++) {
        edges.push({ id: `asp-re-${i}`, source: `asp-r-${i}`, target: `asp-r-${(i+1)%6}`, type: i % 2 === 0 ? 'double' : 'single' });
      }
      // acetyl branch
      nodes.push({ id: `asp-c1`, x: cx + 80, y: cy - 22, label: 'C' });
      nodes.push({ id: `asp-o1`, x: cx + 105, y: cy - 45, label: 'O' });
      nodes.push({ id: `asp-o2`, x: cx + 105, y: cy, label: 'O' });
      edges.push({ id: `asp-e1`, source: `asp-r-1`, target: `asp-c1`, type: 'single' });
      edges.push({ id: `asp-e2`, source: `asp-c1`, target: `asp-o1`, type: 'double' });
      edges.push({ id: `asp-e3`, source: `asp-c1`, target: `asp-o2`, type: 'single' });

      // ester cyclic branch
      nodes.push({ id: `asp-o3`, x: cx - 20, y: cy - 75, label: 'O' });
      nodes.push({ id: `asp-c2`, x: cx - 55, y: cy - 95, label: 'C' });
      nodes.push({ id: `asp-o4`, x: cx - 55, y: cy - 125, label: 'O' });
      nodes.push({ id: `asp-c3`, x: cx - 90, y: cy - 85, label: 'C' });
      edges.push({ id: `asp-e4`, source: `asp-r-0`, target: `asp-o3`, type: 'single' });
      edges.push({ id: `asp-o3`, source: `asp-o3`, target: `asp-c2`, type: 'single' }); // Wait! Correcting source/target error from original preset
      edges.push({ id: `asp-e6`, source: `asp-c2`, target: `asp-o4`, type: 'double' });
      edges.push({ id: `asp-e7`, source: `asp-c2`, target: `asp-c3`, type: 'single' });
      return { nodes, edges };
    }

    if (cleanSmiles === "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" || lowerSmiles.includes('caffeine')) {
      const cx = 220, cy = 150;
      const itemsNodes = [
        { id: 'caf-1', x: cx - 40, y: cy - 40, label: 'N' },
        { id: 'caf-2', x: cx + 10, y: cy - 40, label: 'C' },
        { id: 'caf-3', x: cx + 45, y: cy - 10, label: 'N' },
        { id: 'caf-4', x: cx + 25, y: cy + 35, label: 'C' },
        { id: 'caf-5', x: cx - 20, y: cy + 35, label: 'C' },
        { id: 'caf-6', x: cx - 55, y: cy - 5, label: 'C' },
        { id: 'caf-7', x: cx - 90, y: cy - 5, label: 'O' },
        { id: 'caf-8', x: cx + 80, y: cy - 10, label: 'C' },
        { id: 'caf-9', x: cx + 10, y: cy - 80, label: 'O' }
      ];
      const itemsEdges = [
        { id: 'caf-e1', source: 'caf-1', target: 'caf-2', type: 'single' as const },
        { id: 'caf-e2', source: 'caf-2', target: 'caf-3', type: 'single' as const },
        { id: 'caf-e3', source: 'caf-3', target: 'caf-4', type: 'single' as const },
        { id: 'caf-e4', source: 'caf-4', target: 'caf-5', type: 'single' as const },
        { id: 'caf-e5', source: 'caf-5', target: 'caf-6', type: 'single' as const },
        { id: 'caf-e6', source: 'caf-6', target: 'caf-1', type: 'single' as const },
        { id: 'caf-e7', source: 'caf-6', target: 'caf-7', type: 'double' as const },
        { id: 'caf-e8', source: 'caf-3', target: 'caf-8', type: 'single' as const },
        { id: 'caf-e9', source: 'caf-2', target: 'caf-9', type: 'double' as const }
      ];
      return { nodes: itemsNodes, edges: itemsEdges };
    }

    if (cleanSmiles === "CCO" || lowerSmiles === 'cco' || lowerSmiles === 'ethanol') {
      const itemsNodes = [
        { id: 'eth-1', x: 180, y: 150, label: 'C' },
        { id: 'eth-2', x: 230, y: 150, label: 'C' },
        { id: 'eth-3', x: 280, y: 150, label: 'O' }
      ];
      const itemsEdges = [
        { id: 'eth-e1', source: 'eth-1', target: 'eth-2', type: 'single' as const },
        { id: 'eth-e2', source: 'eth-2', target: 'eth-3', type: 'single' as const }
      ];
      return { nodes: itemsNodes, edges: itemsEdges };
    }

    // Generic heuristic chain/tree parsing
    try {
      const matchesTokens = cleanSmiles.match(/Cl|Br|[CNOSPFIc]|[\(\)\=\#1-9]/g) || [];
      if (matchesTokens.length === 0) return { nodes, edges };

      let currentX = 180;
      let currentY = 150;
      let currentAngle = 0;
      let parentIdxStack: number[] = [];
      let ringTags: { [key: string]: string } = {};
      let actParentId: string | null = null;
      let nextB = 'single' as 'single' | 'double' | 'triple';

      for (let i = 0; i < matchesTokens.length; i++) {
        const token = matchesTokens[i];

        if (token === '(') {
          if (nodes.length > 0) {
            parentIdxStack.push(nodes.length - 1);
          }
        } else if (token === ')') {
          const popped = parentIdxStack.pop();
          if (popped !== undefined && nodes[popped]) {
            actParentId = nodes[popped].id;
            currentX = nodes[popped].x;
            currentY = nodes[popped].y;
          }
        } else if (token === '=') {
          nextB = 'double';
        } else if (token === '#') {
          nextB = 'triple';
        } else if (/^[1-9]$/.test(token)) {
          if (nodes.length > 0) {
            const lastNodeId = nodes[nodes.length - 1].id;
            if (ringTags[token]) {
              const otherId = ringTags[token];
              const exists = edges.some(e => 
                (e.source === lastNodeId && e.target === otherId) ||
                (e.source === otherId && e.target === lastNodeId)
              );
              if (!exists) {
                edges.push({
                  id: `edge-ring-${Date.now()}-${token}-${Math.random()}`,
                  source: lastNodeId,
                  target: otherId,
                  type: nextB
                });
              }
              nextB = 'single';
              delete ringTags[token];
            } else {
              ringTags[token] = lastNodeId;
            }
          }
        } else {
          let labelStr = token.toUpperCase();
          if (labelStr === 'C' && token === 'c') labelStr = 'C';
          const nodeId = `parsed-node-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`;

          if (nodes.length > 0) {
            const actualParentId = actParentId || nodes[nodes.length - 1].id;
            const parentNode = nodes.find(n => n.id === actualParentId);
            if (parentNode) {
              const angleRad = (currentAngle * Math.PI) / 180;
              const bondLength = 40;
              currentX = parentNode.x + bondLength * Math.cos(angleRad);
              currentY = parentNode.y + bondLength * Math.sin(angleRad);

              nodes.push({ id: nodeId, x: currentX, y: currentY, label: labelStr });
              edges.push({
                id: `parsed-edge-${Date.now()}-${i}`,
                source: actualParentId,
                target: nodeId,
                type: nextB
              });
              nextB = 'single';
              currentAngle = (currentAngle + 35) % 360;
            } else {
              nodes.push({ id: nodeId, x: currentX, y: currentY, label: labelStr });
            }
          } else {
            nodes.push({ id: nodeId, x: currentX, y: currentY, label: labelStr });
          }

          actParentId = nodeId;
        }
      }
    } catch (e) {
      console.error(e);
    }

    return { nodes, edges };
  };

  useEffect(() => {
    if (isDrawOpen) {
      setDialogSmiles(smiles);
      if (smiles.trim()) {
        const { nodes, edges } = parseSMILESToGraph(smiles);
        setDrawNodes(nodes);
        setDrawEdges(edges);
      } else {
        setDrawNodes([]);
        setDrawEdges([]);
      }
      setSelectedNodeId(null);
    }
  }, [isDrawOpen]);
  
  const [currentAtom, setCurrentAtom] = useState<string>('C');
  const [currentBond, setCurrentBond] = useState<'single' | 'double' | 'triple'>('single');
  const [isEraserActive, setIsEraserActive] = useState<boolean>(false);
  const [activeRingTemplate, setActiveRingTemplate] = useState<'none' | 'benzene' | 'cyclohexane' | 'cyclopentane'>('none');
  const [historyStack, setHistoryStack] = useState<{ nodes: any[]; edges: any[] }[]>([]);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleExampleSmiles = () => {
    setSmiles("CC1=C(C(=O)N(C1=O)C)C2=CC=C(C=C2)C(=O)NC3=CC=C(C=C3)S(=O)(=O)N");
    setSmilesError("");
  };

  const validateSmiles = (val: string) => {
    setSmiles(val);
    if (val.trim() && !/^[A-Z0-9@\+\-\[\]\(\)\/\\=#\$\.\%]+$/i.test(val)) {
      setSmilesError("SMILES 格式可能有误，请检查。");
    } else {
      setSmilesError("");
    }
  };

  // Helper to update graph and store history for undo
  const updateGraph = (newNodes: any[], newEdges: any[]) => {
    setHistoryStack(prev => [...prev, { nodes: drawNodes, edges: drawEdges }]);
    setDrawNodes(newNodes);
    setDrawEdges(newEdges);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack(historyStack.slice(0, -1));
    setDrawNodes(previous.nodes);
    setDrawEdges(previous.edges);
    setSelectedNodeId(null);
  };

  // Adds predefined ring layouts
  const addRingTemplate = (rx: number, ry: number, type: 'benzene' | 'cyclohexane' | 'cyclopentane') => {
    const numAtoms = type === 'cyclopentane' ? 5 : 6;
    const R = 45;
    const offsetId = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    
    // Create nodes
    const newNodes = [];
    for (let i = 0; i < numAtoms; i++) {
      const angle = (2 * Math.PI * i) / numAtoms - Math.PI / 2;
      newNodes.push({
        id: `node-${offsetId}-${i}`,
        x: rx + R * Math.cos(angle),
        y: ry + R * Math.sin(angle),
        label: 'C'
      });
    }

    // Create edges
    const newEdges = [];
    for (let i = 0; i < numAtoms; i++) {
      const nextIdx = (i + 1) % numAtoms;
      const isDouble = type === 'benzene' && i % 2 === 0;
      newEdges.push({
        id: `edge-${offsetId}-${i}`,
        source: newNodes[i].id,
        target: newNodes[nextIdx].id,
        type: (isDouble ? 'double' : 'single') as any
      });
    }

    updateGraph([...drawNodes, ...newNodes], [...drawEdges, ...newEdges]);
  };

  // Loads starter structures
  const loadPreset = (name: string) => {
    let nodes: any[] = [];
    let edges: any[] = [];

    if (name === 'benzene') {
      const cx = 240, cy = 150, R = 50;
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        nodes.push({ id: `preset-b-${i}`, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), label: 'C' });
      }
      for (let i = 0; i < 6; i++) {
        edges.push({ id: `preset-be-${i}`, source: `preset-b-${i}`, target: `preset-b-${(i+1)%6}`, type: i % 2 === 0 ? 'double' : 'single' });
      }
    } else if (name === 'aspirin') {
      const cx = 200, cy = 160, R = 45;
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        nodes.push({ id: `asp-r-${i}`, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), label: 'C' });
      }
      for (let i = 0; i < 6; i++) {
        edges.push({ id: `asp-re-${i}`, source: `asp-r-${i}`, target: `asp-r-${(i+1)%6}`, type: i % 2 === 0 ? 'double' : 'single' });
      }
      
      nodes.push({ id: `asp-c1`, x: cx + 80, y: cy - 22, label: 'C' });
      nodes.push({ id: `asp-o1`, x: cx + 105, y: cy - 45, label: 'O' });
      nodes.push({ id: `asp-o2`, x: cx + 105, y: cy, label: 'O' });
      edges.push({ id: `asp-e1`, source: `asp-r-1`, target: `asp-c1`, type: 'single' });
      edges.push({ id: `asp-e2`, source: `asp-c1`, target: `asp-o1`, type: 'double' });
      edges.push({ id: `asp-e3`, source: `asp-c1`, target: `asp-o2`, type: 'single' });

      nodes.push({ id: `asp-o3`, x: cx - 20, y: cy - 75, label: 'O' });
      nodes.push({ id: `asp-c2`, x: cx - 55, y: cy - 95, label: 'C' });
      nodes.push({ id: `asp-o4`, x: cx - 55, y: cy - 125, label: 'O' });
      nodes.push({ id: `asp-c3`, x: cx - 90, y: cy - 85, label: 'C' });
      edges.push({ id: `asp-e4`, source: `asp-r-0`, target: `asp-o3`, type: 'single' });
      edges.push({ id: `asp-e5`, source: `asp-o3`, target: `asp-c2`, type: 'single' });
      edges.push({ id: `asp-e6`, source: `asp-c2`, target: `asp-o4`, type: 'double' });
      edges.push({ id: `asp-e7`, source: `asp-c2`, target: `asp-c3`, type: 'single' });

    } else if (name === 'caffeine') {
      const cx = 240, cy = 150;
      nodes = [
        { id: 'caf-1', x: cx - 40, y: cy - 40, label: 'N' },
        { id: 'caf-2', x: cx + 10, y: cy - 40, label: 'C' },
        { id: 'caf-3', x: cx + 45, y: cy - 10, label: 'N' },
        { id: 'caf-4', x: cx + 25, y: cy + 35, label: 'C' },
        { id: 'caf-5', x: cx - 20, y: cy + 35, label: 'C' },
        { id: 'caf-6', x: cx - 55, y: cy - 5, label: 'C' },
        { id: 'caf-7', x: cx - 90, y: cy - 5, label: 'O' },
        { id: 'caf-8', x: cx + 80, y: cy - 10, label: 'C' },
        { id: 'caf-9', x: cx + 10, y: cy - 80, label: 'O' }
      ];
      edges = [
        { id: 'caf-e1', source: 'caf-1', target: 'caf-2', type: 'single' },
        { id: 'caf-e2', source: 'caf-2', target: 'caf-3', type: 'single' },
        { id: 'caf-e3', source: 'caf-3', target: 'caf-4', type: 'single' },
        { id: 'caf-e4', source: 'caf-4', target: 'caf-5', type: 'single' },
        { id: 'caf-e5', source: 'caf-5', target: 'caf-6', type: 'single' },
        { id: 'caf-e6', source: 'caf-6', target: 'caf-1', type: 'single' },
        { id: 'caf-e7', source: 'caf-6', target: 'caf-7', type: 'double' },
        { id: 'caf-e8', source: 'caf-3', target: 'caf-8', type: 'single' },
        { id: 'caf-e9', source: 'caf-2', target: 'caf-9', type: 'double' }
      ];
    } else if (name === 'ibuprofen') {
      const cx = 240, cy = 150;
      nodes = [
        { id: 'ibu-1', x: cx - 60, y: cy, label: 'C' },
        { id: 'ibu-2', x: cx - 30, y: cy - 20, label: 'C' },
        { id: 'ibu-3', x: cx + 10, y: cy - 20, label: 'C' },
        { id: 'ibu-4', x: cx + 40, y: cy, label: 'C' },
        { id: 'ibu-5', x: cx + 10, y: cy + 20, label: 'C' },
        { id: 'ibu-6', x: cx - 30, y: cy + 20, label: 'C' },
        { id: 'ibu-7', x: cx - 95, y: cy, label: 'C' },
        { id: 'ibu-8', x: cx - 125, y: cy - 15, label: 'C' },
        { id: 'ibu-9', x: cx - 155, y: cy - 5, label: 'C' },
        { id: 'ibu-10', x: cx - 125, y: cy + 20, label: 'C' },
        { id: 'ibu-11', x: cx + 75, y: cy, label: 'C' },
        { id: 'ibu-12', x: cx + 100, y: cy - 25, label: 'C' },
        { id: 'ibu-13', x: cx + 130, y: cy - 15, label: 'C' },
        { id: 'ibu-14', x: cx + 155, y: cy - 35, label: 'O' },
        { id: 'ibu-15', x: cx + 130, y: cy + 15, label: 'O' }
      ];
      edges = [
        { id: 'ibu-e1', source: 'ibu-1', target: 'ibu-2', type: 'double' },
        { id: 'ibu-e2', source: 'ibu-2', target: 'ibu-3', type: 'single' },
        { id: 'ibu-e3', source: 'ibu-3', target: 'ibu-4', type: 'double' },
        { id: 'ibu-e4', source: 'ibu-4', target: 'ibu-5', type: 'single' },
        { id: 'ibu-e5', source: 'ibu-5', target: 'ibu-6', type: 'double' },
        { id: 'ibu-e6', source: 'ibu-6', target: 'ibu-1', type: 'single' },
        { id: 'ibu-e7', source: 'ibu-1', target: 'ibu-7', type: 'single' },
        { id: 'ibu-e8', source: 'ibu-7', target: 'ibu-8', type: 'single' },
        { id: 'ibu-e9', source: 'ibu-8', target: 'ibu-9', type: 'single' },
        { id: 'ibu-e10', source: 'ibu-8', target: 'ibu-10', type: 'single' },
        { id: 'ibu-e11', source: 'ibu-4', target: 'ibu-11', type: 'single' },
        { id: 'ibu-e12', source: 'ibu-11', target: 'ibu-12', type: 'single' },
        { id: 'ibu-e13', source: 'ibu-12', target: 'ibu-13', type: 'single' },
        { id: 'ibu-e14', source: 'ibu-13', target: 'ibu-14', type: 'double' },
        { id: 'ibu-e15', source: 'ibu-14', target: 'ibu-15', type: 'single' }
      ];
    } else if (name === 'ethanol') {
      nodes = [
        { id: 'eth-1', x: 180, y: 150, label: 'C' },
        { id: 'eth-2', x: 230, y: 150, label: 'C' },
        { id: 'eth-3', x: 280, y: 150, label: 'O' }
      ];
      edges = [
        { id: 'eth-e1', source: 'eth-1', target: 'eth-2', type: 'single' },
        { id: 'eth-e2', source: 'eth-2', target: 'eth-3', type: 'single' }
      ];
    }

    updateGraph(nodes, edges);
    setSelectedNodeId(null);
  };

  const generateSMILESFromGraph = (nodes: any[], edges: any[]) => {
    if (nodes.length === 0) return '';
    
    // Exact structures templates matchers
    const cCount = nodes.filter(n => n.label === 'C').length;
    const oCount = nodes.filter(n => n.label === 'O').length;
    const nCount = nodes.filter(n => n.label === 'N').length;
    
    if (cCount === 9 && oCount === 4 && nodes.length === 13) {
      return "CC(=O)OC1=CC=CC=C1C(=O)O"; // Aspirin
    }
    if (cCount === 8 && oCount === 2 && nCount === 4 && nodes.length === 14) {
      return "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"; // Caffeine
    }
    if (cCount === 6 && nodes.length === 6 && edges.length === 6) {
      return "C1=CC=CC=C1"; // Benzene
    }
    if (cCount === 6 && nodes.length === 6 && edges.length === 5) {
      return "C1CCCCC1"; // Cyclohexane
    }
    if (cCount === 2 && oCount === 1 && nodes.length === 3) {
      return "CCO"; // Ethanol
    }
    if (cCount === 13 && oCount === 2 && nodes.length === 15) {
      return "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O"; // Ibuprofen
    }

    // Standard recursive traversal SMILES builder
    const adj: { [key: string]: { target: string; type: string; edgeId: string }[] } = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
      adj[e.source]?.push({ target: e.target, type: e.type, edgeId: e.id });
      adj[e.target]?.push({ target: e.source, type: e.type, edgeId: e.id });
    });

    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const ringClosures: { [key: string]: number } = {};
    let ringIndex = 1;

    const getBondSymbol = (type: string) => {
      if (type === 'double') return '=';
      if (type === 'triple') return '#';
      return '';
    };

    const dfs = (nodeId: string, parentId: string | null = null, incomingBond: string = ''): string => {
      visitedNodes.add(nodeId);
      const nodeObj = nodes.find(n => n.id === nodeId);
      if (!nodeObj) return '';

      let label = nodeObj.label;
      let branchStr = incomingBond + label;
      const neighbors = adj[nodeId] || [];
      const unvisitedNeighbors = neighbors.filter(neigh => !visitedNodes.has(neigh.target));
      const visitedNeighbors = neighbors.filter(neigh => visitedNodes.has(neigh.target) && neigh.target !== parentId);

      visitedNeighbors.forEach(neigh => {
        if (!visitedEdges.has(neigh.edgeId)) {
          visitedEdges.add(neigh.edgeId);
          if (!ringClosures[neigh.edgeId]) {
            ringClosures[neigh.edgeId] = ringIndex++;
          }
          branchStr += getBondSymbol(neigh.type) + ringClosures[neigh.edgeId];
        }
      });

      unvisitedNeighbors.forEach((neigh, idx) => {
        visitedEdges.add(neigh.edgeId);
        const isLast = idx === unvisitedNeighbors.length - 1;
        const bondSym = getBondSymbol(neigh.type);
        const subResult = dfs(neigh.target, nodeId, bondSym);
        
        if (isLast) {
          branchStr += subResult;
        } else {
          branchStr += `(${subResult})`;
        }
      });

      return branchStr;
    };

    let startNodeId = nodes[0].id;
    let minDeg = 999;
    nodes.forEach(n => {
      const deg = adj[n.id]?.length || 0;
      if (deg < minDeg && deg > 0) {
        minDeg = deg;
        startNodeId = n.id;
      }
    });

    try {
      return dfs(startNodeId);
    } catch (e) {
      return nodes.map(n => n.label).join(edges.length > 0 ? '=' : '');
    }
  };

  const getFormulaStateObj = () => {
    if (drawNodes.length === 0) return { formula: 'N/A', mw: '0.00', smiles: '' };
    const counts: { [key: string]: number } = {};
    drawNodes.forEach(node => {
      counts[node.label] = (counts[node.label] || 0) + 1;
    });
    
    const nodeBonds: { [key: string]: number } = {};
    drawEdges.forEach(edge => {
      const valenceWeight = edge.type === 'triple' ? 3 : edge.type === 'double' ? 2 : 1;
      nodeBonds[edge.source] = (nodeBonds[edge.source] || 0) + valenceWeight;
      nodeBonds[edge.target] = (nodeBonds[edge.target] || 0) + valenceWeight;
    });
    
    let hCount = 0;
    drawNodes.forEach(node => {
      const atomLabel = node.label;
      let val = 4;
      if (atomLabel === 'O') val = 2;
      else if (atomLabel === 'N') val = 3;
      else if (atomLabel === 'S') val = 2;
      else if (atomLabel === 'F' || atomLabel === 'Cl') val = 1;
      
      const used = nodeBonds[node.id] || 0;
      hCount += Math.max(0, val - used);
    });

    if (hCount > 0) {
      counts['H'] = (counts['H'] || 0) + hCount;
    }
    
    const elements = Object.keys(counts).sort((a, b) => {
      if (a === 'C') return -1;
      if (b === 'C') return 1;
      if (a === 'H') return -1;
      if (b === 'H') return 1;
      return a.localeCompare(b);
    });
    
    let formulaStr = '';
    elements.forEach(el => {
      formulaStr += el + (counts[el] > 1 ? counts[el] : '');
    });
    
    const weights: { [key: string]: number } = {
      C: 12.011, H: 1.008, O: 15.999, N: 14.007, S: 32.06, F: 18.998, Cl: 35.45
    };
    let mwSub = 0;
    Object.keys(counts).forEach(el => {
      mwSub += (weights[el] || 12) * counts[el];
    });

    return {
      formula: formulaStr || 'N/A',
      mw: mwSub > 0 ? mwSub.toFixed(3) : '0.00',
      smiles: generateSMILESFromGraph(drawNodes, drawEdges)
    };
  };

  const formulaState = getFormulaStateObj();

  const handleApplyStructure = () => {
    setSmiles(formulaState.smiles);
    setSmilesError("");
    setIsDrawOpen(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isEraserActive) return;

    if (currentAtom === 'benzene' || currentAtom === 'cyclohexane' || currentAtom === 'cyclopentane') {
      addRingTemplate(x, y, currentAtom as any);
      setCurrentAtom('C');
      setActiveRingTemplate('none');
      return;
    }

    const nodeId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const newNode = { id: nodeId, x, y, label: currentAtom };

    if (selectedNodeId) {
      const edgeId = `edge-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const newEdge = {
        id: edgeId,
        source: selectedNodeId,
        target: nodeId,
        type: currentBond
      };
      updateGraph([...drawNodes, newNode], [...drawEdges, newEdge]);
      setSelectedNodeId(nodeId);
    } else {
      updateGraph([...drawNodes, newNode], drawEdges);
      setSelectedNodeId(nodeId);
    }
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isEraserActive) {
      updateGraph(
        drawNodes.filter(n => n.id !== nodeId),
        drawEdges.filter(e => e.source !== nodeId && e.target !== nodeId)
      );
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      return;
    }

    if (selectedNodeId === null) {
      setSelectedNodeId(nodeId);
    } else if (selectedNodeId === nodeId) {
      updateGraph(
        drawNodes.map(n => n.id === nodeId ? { ...n, label: currentAtom } : n),
        drawEdges
      );
      setSelectedNodeId(null);
    } else {
      const edgeExists = drawEdges.some(
        edge => (edge.source === selectedNodeId && edge.target === nodeId) ||
                (edge.source === nodeId && edge.target === selectedNodeId)
      );

      if (!edgeExists) {
        const edgeId = `edge-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        const newEdge = {
          id: edgeId,
          source: selectedNodeId,
          target: nodeId,
          type: currentBond
        };
        updateGraph(drawNodes, [...drawEdges, newEdge]);
      }
      setSelectedNodeId(nodeId);
    }
  };

  const renderStructurePreview = () => {
    if (drawNodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center text-xs">
          <Beaker className="w-12 h-12 stroke-[1.2] mb-3 text-slate-300" />
          <p className="font-medium">暂无绘制结构</p>
          <p className="text-[10px] text-slate-400 mt-1">请在右侧画布添加原子或在下方选择经典分子模板</p>
        </div>
      );
    }

    const minX = Math.min(...drawNodes.map(n => n.x));
    const maxX = Math.max(...drawNodes.map(n => n.x));
    const minY = Math.min(...drawNodes.map(n => n.y));
    const maxY = Math.max(...drawNodes.map(n => n.y));

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const maxSpan = Math.max(spanX, spanY, 80);

    const targetW = 240;
    const targetH = 200;
    const scale = Math.min((targetW - 50) / maxSpan, (targetH - 50) / maxSpan);

    const getScaledX = (x: number) => (x - cx) * scale + targetW / 2;
    const getScaledY = (y: number) => (y - cy) * scale + targetH / 2;

    return (
      <svg className="w-full h-[200px]" viewBox={`0 0 ${targetW} ${targetH}`}>
        {drawEdges.map(edge => {
          const n1 = drawNodes.find(n => n.id === edge.source);
          const n2 = drawNodes.find(n => n.id === edge.target);
          if (!n1 || !n2) return null;

          const sx = getScaledX(n1.x);
          const sy = getScaledY(n1.y);
          const tx = getScaledX(n2.x);
          const ty = getScaledY(n2.y);

          if (edge.type === 'double') {
            const dx = tx - sx;
            const dy = ty - sy;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ox = (-dy / len) * 3;
            const oy = (dx / len) * 3;
            return (
              <g key={edge.id}>
                <line x1={sx + ox} y1={sy + oy} x2={tx + ox} y2={ty + oy} stroke="#475569" strokeWidth="2" />
                <line x1={sx - ox} y1={sy - oy} x2={tx - ox} y2={ty - oy} stroke="#475569" strokeWidth="2" />
              </g>
            );
          } else if (edge.type === 'triple') {
            const dx = tx - sx;
            const dy = ty - sy;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ox = (-dy / len) * 5;
            const oy = (dx / len) * 5;
            return (
              <g key={edge.id}>
                <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="#475569" strokeWidth="2" />
                <line x1={sx + ox} y1={sy + oy} x2={tx + ox} y2={ty + oy} stroke="#475569" strokeWidth="1.5" />
                <line x1={sx - ox} y1={sy - oy} x2={tx - ox} y2={ty - oy} stroke="#475569" strokeWidth="1.5" />
              </g>
            );
          } else {
            return (
              <line key={edge.id} x1={sx} y1={sy} x2={tx} y2={ty} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            );
          }
        })}

        {drawNodes.map(node => {
          const sx = getScaledX(node.x);
          const sy = getScaledY(node.y);
          
          let fillBg = "#FFFFFF";
          let textColor = "#0F172A";
          let strokeColor = "#475569";
          
          if (node.label === 'O') {
            textColor = "#DC2626";
            strokeColor = "#FCA5A5";
          } else if (node.label === 'N') {
            textColor = "#2563EB";
            strokeColor = "#93C5FD";
          } else if (node.label === 'S') {
            textColor = "#D97706";
            strokeColor = "#FCD34D";
          } else if (node.label === 'F') {
            textColor = "#0D9488";
            strokeColor = "#5EEAD4";
          } else if (node.label === 'Cl') {
            textColor = "#16A34A";
            strokeColor = "#86EFAC";
          }

          const neighborsCount = drawEdges.filter(e => e.source === node.id || e.target === node.id).length;
          const showLabel = node.label !== 'C' || neighborsCount === 0;

          return (
            <g key={node.id}>
              {showLabel ? (
                <>
                  <circle cx={sx} cy={sy} r="10" fill={fillBg} stroke={strokeColor} strokeWidth="1.5" />
                  <text 
                    x={sx} 
                    y={sy + 3.5} 
                    textAnchor="middle" 
                    className="text-[9px] font-bold" 
                    fill={textColor}
                  >
                    {node.label}
                  </text>
                </>
              ) : (
                <circle cx={sx} cy={sy} r="4" fill="#475569" stroke="#FFFFFF" strokeWidth="1" />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      {/* Header Section */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100 transition-colors mt-1">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">靶点发现模型</h1>
              <p className="text-[11px] text-muted-foreground font-medium">基于深度学习模型预测小分子的潜在作用靶标</p>
            </div>

            {/* Tab Selection */}
            <div className="flex items-center bg-[#F1F4F9] p-1 rounded-full w-fit">
              <button 
                onClick={() => setActiveTab('inference')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === 'inference' ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A]"
                )}
              >
                <Activity className="w-4 h-4" />
                <span>推理</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === 'history' ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A]"
                )}
              >
                <History className="w-4 h-4" />
                <span>历史任务</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className={cn("p-8 max-w-[1240px] mx-auto", activeTab === 'inference' ? "pb-32" : "pb-10")}>
          
          {activeTab === 'inference' ? (
            <div className="space-y-8">
              {/* Module 1: 任务基本信息 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <div className="p-1.5 bg-white border rounded shadow-sm">
                     <FileText className="w-4 h-4 text-[#0F172A]" />
                   </div>
                   <h2 className="text-sm font-bold text-[#0F172A]">任务基本信息</h2>
                </div>
                <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                  <CardContent className="p-6 space-y-4">
                    <HorizontalField label="任务名称">
                      <Input 
                        value={taskName} 
                        onChange={e => setTaskName(e.target.value)} 
                        className="border-none focus-visible:ring-0 text-xs px-0 h-full w-full bg-transparent"
                        placeholder="请输入任务名称"
                      />
                    </HorizontalField>
                    <HorizontalField label="任务描述">
                      <Input 
                        value={taskDesc} 
                        onChange={e => setTaskDesc(e.target.value)} 
                        className="border-none focus-visible:ring-0 text-xs px-0 h-full w-full bg-transparent"
                        placeholder="请输入任务描述 (可选)"
                      />
                    </HorizontalField>
                  </CardContent>
                </Card>
              </div>

              {/* Molecule Input -> 数据输入 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-white border rounded shadow-sm">
                       <Beaker className="w-4 h-4 text-[#0F172A]" />
                     </div>
                     <h2 className="text-sm font-bold text-[#0F172A]">数据输入</h2>
                  </div>
                </div>

                <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-muted-foreground font-bold uppercase">标准 SMILES</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleExampleSmiles}
                            className="h-7 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold"
                          >
                            示例分子
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsDrawOpen(true)}
                            className="h-7 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-slate-50 font-bold flex items-center gap-1 border-indigo-200"
                          >
                            <Pencil className="w-3 h-3" />
                            结构绘制
                          </Button>
                        </div>
                      </div>
                      <textarea 
                        value={smiles}
                        onChange={(e) => validateSmiles(e.target.value)}
                        className={cn(
                          "w-full h-32 rounded-xl border p-4 text-xs tech-mono focus:ring-2 focus:ring-[#0F172A]/10 outline-none transition-all resize-none",
                          smilesError ? "border-destructive/50 bg-destructive/[0.02]" : "bg-[#F8FAFB] border-slate-100"
                        )}
                        placeholder="请输入标准 SMILES 字符串，或点击右上角“结构绘制”在线生成分子结构..."
                      />
                      {smilesError && (
                        <div className="flex items-center gap-2 text-destructive text-[10px] font-bold mt-2">
                          <Info className="w-3 h-3" />
                          {smilesError}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Configuration Modules -> 参数选择 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-1.5 bg-white border rounded shadow-sm">
                    <Layers className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#0F172A]">参数选择</h2>
                </div>
                <Card className="border-none shadow-sm ring-1 ring-black/[0.03]">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">返回靶标数量</Label>
                      <Input 
                        type="number"
                        value={topN}
                        onChange={(e) => setTopN(e.target.value)}
                        className="h-10 text-xs bg-[#F8FAFB]"
                        placeholder="请输入数量，如：10"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">历史推理任务</h2>
                  <p className="text-xs text-muted-foreground mt-1">查看过往提交的小分子靶标预测记录及其分析报告</p>
                </div>
                <div className="relative">
                   <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                   <Input placeholder="搜索任务名称或 ID..." className="w-64 h-9 pl-8 text-xs bg-white" />
                </div>
              </div>

              <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8FAFB] border-b">
                      <tr className="tech-mono text-[10px] uppercase text-slate-500">
                        <th className="px-6 py-4 font-bold">任务名称</th>
                        <th className="px-6 py-4 font-bold">模型名称</th>
                        <th className="px-6 py-4 font-bold">任务 ID</th>
                        <th className="px-6 py-4 font-bold">任务开始时间</th>
                        <th className="px-6 py-4 font-bold">任务结束时间</th>
                        <th className="px-6 py-4 font-bold">任务状态</th>
                        <th className="px-6 py-4 font-bold text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { id: 'PTP-20260412-01', name: '针对阿司匹林衍生物的靶点预测', model: '靶点发现模型', start: '2024-04-12 14:20:10', end: '2024-04-12 14:22:13', status: 'success' },
                        { id: 'PTP-20260410-05', name: '激酶活性分子筛选任务', model: '靶点发现模型', start: '2024-04-10 09:15:22', end: '2024-04-10 09:18:26', status: 'success' },
                        { id: 'PTP-20260408-02', name: '未命名分子预测', model: '靶点发现模型', start: '2024-04-08 16:45:00', end: '2024-04-08 16:47:01', status: 'failed' },
                        { id: 'PTP-20260417-09', name: '示例分子推理测试', model: '靶点发现模型', start: '2024-04-17 10:00:00', end: '-', status: 'executing' }
                      ].map(item => (
                        <tr key={item.id} className="text-[11px] group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-[#0F172A]">{item.name}</td>
                          <td className="px-6 py-4 text-slate-500">{item.model}</td>
                          <td className="px-6 py-4 tech-mono text-slate-500">{item.id}</td>
                          <td className="px-6 py-4 text-slate-500 tech-mono">{item.start}</td>
                          <td className="px-6 py-4 text-slate-500 tech-mono">{item.end}</td>
                          <td className="px-6 py-4">
                            {item.status === 'success' ? (
                              <Badge className="bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] hover:bg-[#F0FDF4] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-[#16A34A]/10">
                                <CheckCircle2 className="w-3 h-3" />
                                执行成功
                              </Badge>
                            ) : item.status === 'failed' ? (
                              <Badge className="bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2] hover:bg-[#FEF2F2] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-[#DC2626]/10">
                                <XCircle className="w-3 h-3" />
                                任务失败
                              </Badge>
                            ) : (
                              <Badge className="bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE] hover:bg-[#EFF6FF] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-[#2563EB]/10">
                                <Clock className="w-3 h-3 animate-spin-slow" />
                                进行中
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                className={cn(
                                  "text-[11px] font-bold flex items-center gap-1 transition-colors",
                                  item.status === 'success' ? "text-[#2563EB] hover:text-[#1D4ED8]" : "text-slate-300 cursor-not-allowed"
                                )}
                                disabled={item.status !== 'success'}
                                onClick={() => {
                                  if (item.status === 'success') onViewResult(item.id);
                                }}
                              >
                                查看 <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button className="text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* Module 7: 提交按钮 (Bottom Bar) */}
      {activeTab === 'inference' && (
        <div className="bottom-0 left-0 right-0 p-4 border-t bg-white flex items-center justify-between px-12 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] transition-all">
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-[9px] text-muted-foreground font-bold tech-mono">
                <Info className="w-3 h-3 text-indigo-500" />
                正在运行: Standard Mode (GraphDTA)
             </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => { setSmiles(""); }}
              className="h-10 px-8 rounded-full text-xs font-bold tech-mono text-muted-foreground hover:bg-slate-50 border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              清空重置
            </Button>
            <Button 
              onClick={onSubmit}
              className={cn(
                "h-10 px-12 rounded-full text-xs font-bold tech-mono transition-all hover:scale-105 active:scale-95 shadow-lg",
                (smiles.trim() !== "") 
                  ? "bg-[#0F172A] hover:bg-[#0F172A]/90 text-white" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none"
              )}
              disabled={!(smiles.trim() !== "")}
            >
              <Send className="w-3.5 h-3.5 mr-2" />
              提交任务
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Molecule Drawer Dialog */}
      <Dialog open={isDrawOpen} onOpenChange={setIsDrawOpen}>
        <DialogContent className="w-full max-w-[1000px] sm:max-w-[1000px] h-[500px] sm:h-[500px] md:h-[500px] p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-xl flex flex-col">
          {/* Header Bar */}
          <div className="bg-[#F8FAFC] border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-[#0F172A]">SMILES格式转换器</h3>
          </div>

          {/* Core Body Container (Grid: 12 Columns, Height: rest of 510) */}
          <div className="grid grid-cols-12 flex-1 h-0 overflow-hidden">
            
            {/* Left Region (Column Span 7) */}
            <div className="col-span-7 border-r border-slate-200 flex flex-col bg-[#F8FAFC] h-full justify-between p-4 pb-3">
              {/* Top toolbar */}
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm w-full mb-2 shrink-0">
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="新建文件"><FileText className="w-3.5 h-3.5" /></button>
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="保存结构"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></button>
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="复杂分析"><Beaker className="w-3.5 h-3.5 text-indigo-500" /></button>
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="复制分子"><Copy className="w-3.5 h-3.5" /></button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button 
                  type="button" 
                  onClick={handleUndo} 
                  disabled={historyStack.length === 0}
                  className={cn("p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors", historyStack.length === 0 && "opacity-30 cursor-not-allowed")}
                  title="撤销 (Undo)"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => updateGraph([], [])} 
                  className="p-1 hover:bg-slate-100 rounded text-red-500 transition-colors"
                  title="清空画布"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <span className="text-[10px] text-slate-400 font-bold ml-1 flex items-center gap-0.5">
                  缩放: <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">100% ▾</span>
                </span>
                <span className="text-[9px] text-slate-400 font-medium ml-auto select-none tech-mono">
                  {drawNodes.length} 原子 | {drawEdges.length} 键
                </span>
              </div>

              {/* Main Editor Row: Left Panel, Canvas, Right Panel */}
              <div className="flex flex-1 gap-2 items-stretch h-0 min-h-0 overflow-hidden">
                {/* Left Toolbar (Vertical) */}
                <div className="w-9 bg-white border border-slate-100 rounded-lg flex flex-col items-center py-1.5 gap-1 shadow-sm shrink-0">
                  {/* Hand Pan */}
                  <button 
                    type="button" 
                    onClick={() => { setIsEraserActive(false); setActiveRingTemplate('none'); setSelectedNodeId(null); }}
                    className={cn("p-1.5 rounded transition-colors", !isEraserActive && activeRingTemplate === 'none' ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50")}
                    title="选择/平移"
                  >
                    <span className="text-[12px] font-black leading-none">✋</span>
                  </button>

                  {/* Select Marquee */}
                  <button
                    type="button"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded text-xs transition-colors"
                    title="框选区域"
                  >
                    🔍
                  </button>

                  {/* Eraser */}
                  <button 
                    type="button" 
                    onClick={() => { setIsEraserActive(true); setActiveRingTemplate('none'); setSelectedNodeId(null); }}
                    className={cn("p-1.5 rounded transition-colors", isEraserActive ? "bg-red-50 text-red-600" : "text-slate-500 hover:text-red-500 hover:bg-red-50")}
                    title="橡皮擦"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>

                  {/* Single Bond */}
                  <button 
                    type="button" 
                    onClick={() => { setCurrentBond('single'); setIsEraserActive(false); }}
                    className={cn("p-1.5 rounded transition-colors text-[10px] font-black", currentBond === 'single' && !isEraserActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50")}
                    title="单键"
                  >
                    —
                  </button>

                  {/* Double Bond */}
                  <button 
                    type="button" 
                    onClick={() => { setCurrentBond('double'); setIsEraserActive(false); }}
                    className={cn("p-1.5 rounded transition-colors text-[10px] font-black", currentBond === 'double' && !isEraserActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50")}
                    title="双键"
                  >
                    =
                  </button>

                  {/* Triple Bond */}
                  <button 
                    type="button" 
                    onClick={() => { setCurrentBond('triple'); setIsEraserActive(false); }}
                    className={cn("p-1.5 rounded transition-colors text-[10px] font-black", currentBond === 'triple' && !isEraserActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50")}
                    title="三键"
                  >
                    三
                  </button>

                  {/* Text A */}
                  <button 
                    type="button" 
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded text-xs transition-colors font-bold"
                    title="备注文本"
                  >
                    A
                  </button>

                  {/* Ring Arrow */}
                  <button 
                    type="button" 
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded text-xs transition-colors font-bold"
                    title="对称翻转"
                  >
                    🔄
                  </button>

                  {/* S symbol */}
                  <button 
                    type="button" 
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded text-xs transition-colors font-bold"
                    title="立体异构"
                  >
                    [S]
                  </button>
                </div>

                {/* Canvas Box */}
                <div className="flex-1 relative border border-slate-200 bg-white rounded-lg overflow-hidden shadow-inner">
                  <svg 
                    className="w-full h-full cursor-crosshair select-none"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMousePos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      });
                    }}
                    onClick={handleCanvasClick}
                  >
                    <defs>
                      <pattern id="dotGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="8" cy="8" r="1.0" fill="#E2E8F0" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotGrid)" />

                    {/* Bond linkage trace */}
                    {selectedNodeId && !isEraserActive && activeRingTemplate === 'none' && (
                      <line
                        x1={(() => {
                          const n = drawNodes.find(item => item.id === selectedNodeId);
                          return n ? n.x : 0;
                        })()}
                        y1={(() => {
                          const n = drawNodes.find(item => item.id === selectedNodeId);
                          return n ? n.y : 0;
                        })()}
                        x2={mousePos.x}
                        y2={mousePos.y}
                        stroke="#2563EB"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Edges */}
                    {drawEdges.map(edge => {
                      const n1 = drawNodes.find(n => n.id === edge.source);
                      const n2 = drawNodes.find(n => n.id === edge.target);
                      if (!n1 || !n2) return null;

                      if (edge.type === 'double') {
                        const dx = n2.x - n1.x;
                        const dy = n2.y - n1.y;
                        const len = Math.sqrt(dx * dx + dy * dy);
                        const ox = (-dy / len) * 3;
                        const oy = (dx / len) * 3;
                        return (
                          <g key={edge.id} className="group">
                            <line x1={n1.x + ox} y1={n1.y + oy} x2={n2.x + ox} y2={n2.y + oy} stroke="#1E293B" strokeWidth="2" />
                            <line x1={n1.x - ox} y1={n1.y - oy} x2={n2.x - ox} y2={n2.y - oy} stroke="#1E293B" strokeWidth="2" />
                          </g>
                        );
                      } else if (edge.type === 'triple') {
                        const dx = n2.x - n1.x;
                        const dy = n2.y - n1.y;
                        const len = Math.sqrt(dx * dx + dy * dy);
                        const ox = (-dy / len) * 4.5;
                        const oy = (dx / len) * 4.5;
                        return (
                          <g key={edge.id} className="group">
                            <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#1E293B" strokeWidth="2" />
                            <line x1={n1.x + ox} y1={n1.y + oy} x2={n2.x + ox} y2={n2.y + oy} stroke="#1E293B" strokeWidth="1.5" />
                            <line x1={n1.x - ox} y1={n1.y - oy} x2={n2.x - ox} y2={n2.y - oy} stroke="#1E293B" strokeWidth="1.5" />
                          </g>
                        );
                      } else {
                        return (
                          <line
                            key={edge.id}
                            x1={n1.x}
                            y1={n1.y}
                            x2={n2.x}
                            y2={n2.y}
                            stroke="#1E293B"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        );
                      }
                    })}

                    {/* Nodes */}
                    {drawNodes.map(node => {
                      let fillBg = "#FFFFFF";
                      let textColor = "#0F172A";
                      let strokeColor = "#334155";
                      
                      if (node.label === 'O') { textColor = "#DC2626"; strokeColor = "#FCA5A5"; }
                      else if (node.label === 'N') { textColor = "#2563EB"; strokeColor = "#93C5FD"; }
                      else if (node.label === 'S') { textColor = "#D97706"; strokeColor = "#FCD34D"; }
                      else if (node.label === 'F') { textColor = "#0D9488"; strokeColor = "#5EEAD4"; }
                      else if (node.label === 'Cl') { textColor = "#16A34A"; strokeColor = "#86EFAC"; }
                      else if (node.label === 'P') { textColor = "#EA580C"; strokeColor = "#FED7AA"; }
                      else if (node.label === 'Br') { textColor = "#991B1B"; strokeColor = "#FCA5A5"; }
                      else if (node.label === 'I') { textColor = "#7C3AED"; strokeColor = "#DDD6FE"; }

                      const isSelected = selectedNodeId === node.id;
                      const neighbors = drawEdges.filter(e => e.source === node.id || e.target === node.id).length;
                      const renderLabel = node.label !== 'C' || neighbors === 0;

                      return (
                        <g 
                          key={node.id} 
                          onClick={(e) => handleNodeClick(node.id, e)}
                          className="group cursor-pointer"
                        >
                          {isSelected && (
                            <circle cx={node.x} cy={node.y} r="16" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 3" />
                          )}
                          <circle cx={node.x} cy={node.y} r="13" fill="#EEF2F6" className="opacity-0 group-hover:opacity-60 transition-opacity" />
                          {renderLabel ? (
                            <>
                              <circle cx={node.x} cy={node.y} r="10" fill={fillBg} stroke={isSelected ? "#2563EB" : strokeColor} strokeWidth="1.8" />
                              <text x={node.x} y={node.y + 3.5} textAnchor="middle" className="text-[10px] font-bold select-none pointer-events-none" fill={textColor}>
                                {node.label}
                              </text>
                            </>
                          ) : (
                            <circle cx={node.x} cy={node.y} r="4" fill={isSelected ? "#2563EB" : "#475569"} stroke="#FFFFFF" strokeWidth="1" />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {drawNodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-500/5 pointer-events-none">
                      <span className="text-[10px] bg-slate-100 border text-slate-500 px-3 py-1.5 rounded-full font-bold shadow-sm">
                        🎨 在画布空白处点击以放置原子或化学键
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Toolbar: Elements List (Vertical) */}
                <div className="w-10 bg-white border border-slate-100 rounded-lg flex flex-col items-center py-1 gap-1 shadow-sm shrink-0 overflow-y-auto">
                  {[
                    { el: 'H', desc: '氢', col: 'text-slate-700 bg-slate-50 border-slate-200' },
                    { el: 'C', desc: '碳', col: 'text-slate-800 bg-slate-50 border-slate-300' },
                    { el: 'N', desc: '氮', col: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { el: 'O', desc: '氧', col: 'text-red-600 bg-red-50 border-red-200' },
                    { el: 'S', desc: '硫', col: 'text-amber-800 bg-amber-50 border-amber-300' },
                    { el: 'P', desc: '磷', col: 'text-orange-600 bg-orange-50 border-orange-200' },
                    { el: 'F', desc: '氟', col: 'text-teal-600 bg-teal-50 border-teal-200' },
                    { el: 'Cl', desc: '氯', col: 'text-green-600 bg-green-50 border-green-200' },
                    { el: 'Br', desc: '溴', col: 'text-red-800 bg-red-100 border-red-200' },
                    { el: 'I', desc: '碘', col: 'text-purple-600 bg-purple-50 border-purple-200' }
                  ].map(item => (
                    <button
                      key={item.el}
                      type="button"
                      onClick={() => {
                        setCurrentAtom(item.el);
                        setIsEraserActive(false);
                        setActiveRingTemplate('none');
                      }}
                      className={cn(
                        "w-7 h-7 rounded text-[10px] font-black border transition-all flex flex-col items-center justify-center font-mono leading-none shrink-0",
                        currentAtom === item.el && !isEraserActive && activeRingTemplate === 'none'
                          ? "bg-[#2563EB] text-white border-transparent scale-105 shadow-md"
                          : `${item.col} hover:scale-105`
                      )}
                      title={item.desc}
                    >
                      {item.el}
                    </button>
                  ))}
                </div>
              </div>

              {/* Predefined Ring templates at the bottom of left column */}
              <div className="flex flex-col gap-1 w-full bg-white p-2 rounded-lg border border-slate-100 shadow-sm shrink-0 mt-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">常用模板环:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'benzene', label: '苯环 (Benzene)' },
                    { id: 'cyclohexane', label: '环己烷' },
                    { id: 'cyclopentane', label: '环戊烷' },
                    { id: 'aspirin', label: '阿司匹林' },
                    { id: 'caffeine', label: '咖啡因' },
                    { id: 'ethanol', label: '乙醇' }
                  ].map(temp => (
                    <button
                      key={temp.id}
                      type="button"
                      onClick={() => {
                        if (['benzene', 'cyclohexane', 'cyclopentane'].includes(temp.id)) {
                          setActiveRingTemplate(temp.id as any);
                          setCurrentAtom(temp.id);
                          setIsEraserActive(false);
                        } else {
                          loadPreset(temp.id);
                        }
                      }}
                      className={cn(
                        "px-2 py-0.5 text-[9px] rounded font-bold border transition-colors bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900",
                        activeRingTemplate === temp.id && "bg-indigo-50 text-indigo-600 border-indigo-200"
                      )}
                    >
                      {temp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 结构转SMILES Button inside Left Region */}
              <div className="flex justify-center mt-2 w-full shrink-0">
                <button 
                  type="button"
                  onClick={() => {
                    const generated = generateSMILESFromGraph(drawNodes, drawEdges);
                    setDialogSmiles(generated);
                    setSmiles(generated);
                    setSmilesError("");
                  }}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs h-8 px-10 rounded shadow-md hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5"
                >
                  <span>结构转SMILES</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Region (Column Span 5) */}
            <div className="col-span-5 flex flex-col justify-between p-4 bg-white h-full pb-3">
              {/* Header & Sub-Actions */}
              <div className="space-y-3 flex-1 flex flex-col h-0 overflow-hidden">
                <div className="flex items-center justify-between border-b pb-2 shrink-0">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 font-bold" />
                    SMILES格式:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDialogSmiles("");
                        setDrawNodes([]);
                        setDrawEdges([]);
                        setSelectedNodeId(null);
                        setHistoryStack([]);
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded transition-all"
                    >
                      重置
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(dialogSmiles);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1000);
                      }}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-bold rounded border transition-all flex items-center gap-1",
                        copied 
                          ? "bg-green-50 text-green-600 border-green-200" 
                          : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                      )}
                    >
                      {copied ? <Check className="w-2.5 h-2.5" /> : null}
                      {copied ? "已复制" : "复制"}
                    </button>
                  </div>
                </div>

                {/* Textarea Box */}
                <div className="flex-1 flex flex-col pt-1 min-h-0">
                  <textarea
                    value={dialogSmiles}
                    onChange={(e) => setDialogSmiles(e.target.value)}
                    className="w-full flex-1 h-full min-h-0 p-3 text-xs border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/70 resize-none font-mono tracking-tight leading-relaxed placeholder:text-slate-400"
                    placeholder="输入SMILES格式的分子结构，然后点击“SMILES转结构”按钮..."
                  />
                </div>
              </div>

              {/* Converter Trigger Button */}
              <div className="flex flex-col gap-2 pt-2 border-t mt-3 shrink-0">
                <div className="flex justify-center w-full">
                  <Button
                    type="button"
                    onClick={() => {
                      const { nodes, edges } = parseSMILESToGraph(dialogSmiles);
                      if (nodes.length > 0) {
                        setDrawNodes(nodes);
                        setDrawEdges(edges);
                        setSmiles(dialogSmiles);
                        setSmilesError("");
                      }
                    }}
                    disabled={!dialogSmiles.trim()}
                    className={cn(
                      "w-full font-bold text-xs h-9 rounded shadow-md hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-1.5",
                      dialogSmiles.trim()
                        ? "bg-[#2563EB] hover:bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border-none"
                    )}
                  >
                    <Undo className="w-3.5 h-3.5 rotate-180" />
                    <span>SMILES转结构</span>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-50 mt-1 select-none">
                  <span>* 更改将实时保存回任务输入框</span>
                  <span className="font-bold text-slate-500">SMILES Converter v1.2</span>
                </div>
              </div>
            </div>

          </div>
          {/* Action-Bar Footer */}
          <div className="bg-[#F8FAFC] border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsDrawOpen(false)}
              className="px-6 py-1.5 border rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 border-slate-200 transition-all bg-white"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleApplyStructure}
              disabled={drawNodes.length === 0}
              className={cn(
                "px-8 py-1.5 rounded-full text-xs font-bold transition-all text-white",
                drawNodes.length > 0 
                  ? "bg-[#2563EB] hover:bg-blue-700 hover:scale-105 active:scale-95 shadow cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              应用绘制结果
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
