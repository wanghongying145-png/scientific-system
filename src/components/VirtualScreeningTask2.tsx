import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Trash2, 
  FileIcon, 
  ChevronLeft, 
  Settings,
  Database,
  Play,
  RotateCcw,
  Info,
  History,
  Activity,
  Send,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Save,
  Eye,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
  Square,
  Box,
  Download,
  DownloadCloud,
  FileDown,
  Layers,
  Maximize2,
  RefreshCw,
  Zap,
  FileText,
  ChevronUp,
  Focus,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  format: string;
  size: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface HistoryTask {
  id: string;
  name: string;
  receptor: string;
  ligandsCount: number;
  status: 'running' | 'completed' | 'failed';
  time: string;
  date: string;
}

interface Atom {
  id: number;
  x: number;
  y: number;
  z: number;
  element: string;
}

interface Conformation {
  index: number;
  bindingAffinity: number;
  rmsdLb: number;
  rmsdUb: number;
  pdbqtFileName: string;
  pdbqtContent: string;
}

interface DockingResult {
  rank: number;
  ligandName: string;
  bindingAffinity: number;
  rmsdLb: number;
  rmsdUb: number;
  pdbqtFileName: string;
  pdbqtContent: string;
  conformations: Conformation[];
}

const mockPdbqtData = {
  egfr_1: `REMARK  Name = ZINC000003819201
REMARK  VINA RESULT:      -9.8      0.000      0.000
ROOT
ATOM      1  N   LIG     1       1.240   2.341 -12.405  1.00 15.00           N
ATOM      2  CA  LIG     1       2.152   3.125 -11.581  1.00 14.80           C
ATOM      3  C   LIG     1       3.421   2.302 -11.092  1.00 15.20           C
ATOM      4  O   LIG     1       4.451   2.890 -10.654  1.00 16.00           O
ATOM      5  CB  LIG     1       2.481   4.421 -12.382  1.00 14.50           C
ATOM      6  CG  LIG     1       3.210   5.480 -11.590  1.00 14.00           C
ATOM      7  OD1 LIG     1       4.281   5.210 -11.021  1.00 13.80           O
ATOM      8  OD2 LIG     1       2.710   6.611 -11.542  1.00 14.10           O
ATOM      9  CD  LIG     1       1.282   4.981 -13.204  1.00 14.60           C
ATOM     10  CE  LIG     1       0.890   6.241 -12.450  1.00 15.00           C
ENDROOT
TORSDOF 2`,
  egfr_2: `REMARK  Name = ZINC000012498102
REMARK  VINA RESULT:      -9.4      1.240      1.240
ROOT
ATOM      1  C   LIG     1       0.892   1.954 -10.241  1.00 12.00           C
ATOM      2  CA  LIG     1       1.543   2.812  -9.412  1.00 12.50           C
ATOM      3  N   LIG     1       2.890   2.110  -8.892  1.00 13.00           N
ATOM      4  O   LIG     1       3.782   2.754  -8.312  1.00 13.50           O
ATOM      5  CB  LIG     1       1.890   4.102 -10.254  1.00 11.80           C
ATOM      6  CG  LIG     1       0.912   5.124  -9.810  1.00 11.20           C
ATOM      7  CD  LIG     1       1.354   6.410 -10.420  1.00 11.50           C
ENDROOT
TORSDOF 1`,
  egfr_3: `REMARK  Name = ChemDiv_8012-0194
REMARK  VINA RESULT:      -9.1      1.870      1.870
ROOT
ATOM      1  N   LIG     1       2.110   1.045  -8.210  1.00 18.00           N
ATOM      2  CA  LIG     1       1.410   2.124  -7.512  1.00 17.50           C
ATOM      3  C   LIG     1       0.124   2.510  -8.154  1.00 17.20           C
ATOM      4  O   LIG     1      -0.890   1.892  -7.912  1.00 16.80           O
ATOM      5  CB  LIG     1       2.254   3.381  -7.410  1.00 18.20           C
ATOM      6  S   LIG     1       3.410   3.120  -6.102  1.00 19.50           S
ATOM      7  C1  LIG     1       4.410   4.421  -6.541  1.00 19.00           C
ENDROOT
TORSDOF 2`,
  egfr_4: `REMARK  Name = Enamine_T5819012
REMARK  VINA RESULT:      -8.9      2.150      2.150
ROOT
ATOM      1  C   LIG     1       1.504   0.210  -9.821  1.00 14.20           C
ATOM      2  CA  LIG     1       2.210   1.214  -8.910  1.00 13.80           C
ATOM      3  N   LIG     1       3.502   0.612  -8.411  1.00 13.50           N
ATOM      4  C1  LIG     1       4.410   1.412  -7.610  1.00 14.00           C
ATOM      5  O1  LIG     1       5.512   0.982  -7.210  1.00 14.50           O
ATOM      6  CB  LIG     1       1.412   1.710  -7.754  1.00 13.20           C
ENDROOT
TORSDOF 1`,
  egfr_5: `REMARK  Name = TargetMol_30911
REMARK  VINA RESULT:      -8.7      1.540      1.540
ROOT
ATOM      1  N   LIG     1       0.512   2.110 -11.210  1.00 16.00           N
ATOM      2  CA  LIG     1       1.450   3.024 -10.512  1.00 15.50           C
ATOM      3  CB  LIG     1       2.810   2.341 -10.210  1.00 15.00           C
ATOM      4  O   LIG     1       3.410   3.112  -9.154  1.00 14.80           O
ATOM      5  CG  LIG     1       3.612   1.954 -11.412  1.00 15.20           C
ENDROOT
TORSDOF 1`,
  her2_1: `REMARK  Name = Lapatinib_analog_03
REMARK  VINA RESULT:     -11.2      0.000      0.000
ROOT
ATOM      1  N   LIG     1       1.512   2.890 -12.110  1.00 13.00           N
ATOM      2  CA  LIG     1       2.450   3.712 -11.254  1.00 12.80           C
ATOM      3  C   LIG     1       3.810   2.954 -10.982  1.00 13.20           C
ATOM      4  O   LIG     1       4.812   3.512 -10.454  1.00 14.00           O
ATOM      5  CB  LIG     1       2.610   5.110 -11.954  1.00 12.50           C
ATOM      6  S   LIG     1       3.612   6.254 -10.954  1.00 11.80           S
ATOM      7  F   LIG     1       1.412   5.812 -12.354  1.00 12.00           F
ENDROOT
TORSDOF 2`,
  her2_2: `REMARK  Name = Neratinib_deriv_05
REMARK  VINA RESULT:     -10.8      1.120      1.120
ROOT
ATOM      1  C   LIG     1       0.954   1.214 -10.812  1.00 14.50           C
ATOM      2  CA  LIG     1       1.810   2.112  -9.982  1.00 14.00           C
ATOM      3  N   LIG     1       3.120   1.412  -9.512  1.00 13.80           N
ATOM      4  O   LIG     1       4.120   2.124  -8.912  1.00 14.20           O
ATOM      5  CB  LIG     1       2.112   3.450 -10.754  1.00 13.50           C
ATOM      6  CL  LIG     1       0.812   4.512 -11.154  1.00 13.00          CL
ENDROOT
TORSDOF 1`,
  her2_3: `REMARK  Name = ChemDiv_9918231
REMARK  VINA RESULT:     -10.3      1.650      1.650
ROOT
ATOM      1  N   LIG     1       2.450   1.210  -9.154  1.00 15.80           N
ATOM      2  CA  LIG     1       1.812   2.341  -8.412  1.00 15.20           C
ATOM      3  C   LIG     1       0.512   2.812  -9.054  1.00 14.80           C
ATOM      4  O   LIG     1      -0.450   2.112  -8.812  1.00 14.50           O
ATOM      5  CB  LIG     1       2.612   3.541  -8.210  1.00 15.50           C
ENDROOT
TORSDOF 1`,
  her2_4: `REMARK  Name = ZINC000021983011
REMARK  VINA RESULT:      -9.9      2.080      2.080
ROOT
ATOM      1  C   LIG     1       1.210   0.512 -10.210  1.00 13.80           C
ATOM      2  CA  LIG     1       2.112   1.541  -9.450  1.00 13.20           C
ATOM      3  N   LIG     1       3.450   0.954  -8.912  1.00 13.00           N
ATOM      4  C1  LIG     1       4.410   1.812  -8.154  1.00 13.50           C
ATOM      5  O1  LIG     1       5.512   1.341  -7.754  1.00 14.00           O
ENDROOT
TORSDOF 1`
};

const generateConformations = (ligandName: string, bestBinding: number, basePdbqt: string, count: number = 5): Conformation[] => {
  const conformations: Conformation[] = [];
  for (let i = 1; i <= count; i++) {
    const binding = i === 1 ? bestBinding : bestBinding + (i - 1) * 0.45;
    const rmsdLb = i === 1 ? 0.0 : 1.1 + (i - 1) * 0.45;
    const rmsdUb = i === 1 ? 0.0 : 2.3 + (i - 1) * 0.65;
    
    // Slightly translate or rotate the atoms for visual difference in 3D
    const angle = (i - 1) * 0.3; // rotation angle in radians
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    
    const transformedLines = basePdbqt.split('\n').map(line => {
      if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
        const xStr = line.substring(30, 38).trim();
        const yStr = line.substring(38, 46).trim();
        const zStr = line.substring(46, 54).trim();
        
        let x = parseFloat(xStr);
        let y = parseFloat(yStr);
        let z = parseFloat(zStr);
        
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          const rx = x * cosA - z * sinA;
          const rz = x * sinA + z * cosA;
          const ry = y + (i - 1) * 0.25; // slight translation
          
          const rxStr = rx.toFixed(3).padStart(8);
          const ryStr = ry.toFixed(3).padStart(8);
          const rzStr = rz.toFixed(3).padStart(8);
          
          return line.substring(0, 30) + rxStr + ryStr + rzStr + line.substring(54);
        }
      }
      return line;
    });

    const finalContent = `REMARK  Name = ${ligandName}\nREMARK  VINA RESULT:      ${binding.toFixed(1)}      ${rmsdLb.toFixed(3)}      ${rmsdUb.toFixed(3)}\n` + 
      transformedLines.slice(2).join('\n');

    conformations.push({
      index: i,
      bindingAffinity: Number(binding.toFixed(1)),
      rmsdLb: Number(rmsdLb.toFixed(2)),
      rmsdUb: Number(rmsdUb.toFixed(2)),
      pdbqtFileName: `${ligandName}_pose${i}.pdbqt`,
      pdbqtContent: finalContent
    });
  }
  return conformations;
};

const getMockResultsForTask = (taskId: string): DockingResult[] => {
  if (taskId === 'Vina-Task-2026-07-10-004') {
    return [
      { rank: 1, ligandName: "ZINC000003819201", bindingAffinity: -9.8, rmsdLb: 0.0, rmsdUb: 0.0, pdbqtFileName: "ZINC000003819201.pdbqt", pdbqtContent: mockPdbqtData.egfr_1, conformations: generateConformations("ZINC000003819201", -9.8, mockPdbqtData.egfr_1, 5) },
      { rank: 2, ligandName: "ZINC000012498102", bindingAffinity: -9.4, rmsdLb: 1.24, rmsdUb: 2.15, pdbqtFileName: "ZINC000012498102.pdbqt", pdbqtContent: mockPdbqtData.egfr_2, conformations: generateConformations("ZINC000012498102", -9.4, mockPdbqtData.egfr_2, 4) },
      { rank: 3, ligandName: "ChemDiv_8012-0194", bindingAffinity: -9.1, rmsdLb: 1.87, rmsdUb: 3.12, pdbqtFileName: "ChemDiv_8012-0194.pdbqt", pdbqtContent: mockPdbqtData.egfr_3, conformations: generateConformations("ChemDiv_8012-0194", -9.1, mockPdbqtData.egfr_3, 4) },
      { rank: 4, ligandName: "Enamine_T5819012", bindingAffinity: -8.9, rmsdLb: 2.15, rmsdUb: 3.44, pdbqtFileName: "Enamine_T5819012.pdbqt", pdbqtContent: mockPdbqtData.egfr_4, conformations: generateConformations("Enamine_T5819012", -8.9, mockPdbqtData.egfr_4, 5) },
      { rank: 5, ligandName: "TargetMol_30911", bindingAffinity: -8.7, rmsdLb: 1.54, rmsdUb: 2.68, pdbqtFileName: "TargetMol_30911.pdbqt", pdbqtContent: mockPdbqtData.egfr_5, conformations: generateConformations("TargetMol_30911", -8.7, mockPdbqtData.egfr_5, 3) }
    ];
  } else {
    return [
      { rank: 1, ligandName: "Lapatinib_analog_03", bindingAffinity: -11.2, rmsdLb: 0.0, rmsdUb: 0.0, pdbqtFileName: "Lapatinib_analog_03.pdbqt", pdbqtContent: mockPdbqtData.her2_1, conformations: generateConformations("Lapatinib_analog_03", -11.2, mockPdbqtData.her2_1, 5) },
      { rank: 2, ligandName: "Neratinib_deriv_05", bindingAffinity: -10.8, rmsdLb: 1.12, rmsdUb: 2.18, pdbqtFileName: "Neratinib_deriv_05.pdbqt", pdbqtContent: mockPdbqtData.her2_2, conformations: generateConformations("Neratinib_deriv_05", -10.8, mockPdbqtData.her2_2, 4) },
      { rank: 3, ligandName: "ChemDiv_9918231", bindingAffinity: -10.3, rmsdLb: 1.65, rmsdUb: 2.92, pdbqtFileName: "ChemDiv_9918231.pdbqt", pdbqtContent: mockPdbqtData.her2_3, conformations: generateConformations("ChemDiv_9918231", -10.3, mockPdbqtData.her2_3, 4) },
      { rank: 4, ligandName: "ZINC000021983011", bindingAffinity: -9.9, rmsdLb: 2.08, rmsdUb: 3.16, pdbqtFileName: "ZINC000021983011.pdbqt", pdbqtContent: mockPdbqtData.her2_4, conformations: generateConformations("ZINC000021983011", -9.9, mockPdbqtData.her2_4, 5) }
    ];
  }
};

// --- Mock Receptor Protein PDB Datasets ---
const MOCK_EGFR_PDB = `HEADER    KINASE DOMAIN EGFR                      13-JUL-26   1M17
TITLE     CRYSTAL STRUCTURE OF EGFR KINASE DOMAIN WITH BOUND INHIBITOR
HELIX    1   H1 MET A  712  ILE A  722  1                                  11
HELIX    2   H2 GLU A  758  LYS A  773  1                                  16
HELIX    3   H3 LEU A  828  CYS A  841  1                                  14
SHEET    1   S1 3 VAL A 726  ALA A 731  0
SHEET    2   S1 3 ALA A 743  VAL A 748 -1
SHEET    3   S1 3 MET A 793  GLY A 796 -1
ATOM      1  N   LEU A 718      28.410  -4.120  15.110  1.00 20.00           N
ATOM      2  CA  LEU A 718      29.120  -3.210  16.020  1.00 19.80           C
ATOM      3  C   LEU A 718      30.250  -2.510  15.280  1.00 19.50           C
ATOM      4  O   LEU A 718      31.120  -3.150  14.680  1.00 19.20           O
ATOM      5  CB  LEU A 718      28.180  -2.210  16.710  1.00 19.70           C
ATOM      6  N   VAL A 726      32.110  -0.890  17.410  1.00 18.50           N
ATOM      7  CA  VAL A 726      32.890   0.120  18.150  1.00 18.20           C
ATOM      8  C   VAL A 726      33.950  -0.510  19.040  1.00 18.00           C
ATOM      9  O   VAL A 726      34.820  -1.250  18.580  1.00 17.80           O
ATOM     10  CB  VAL A 726      33.510   1.150  17.180  1.00 18.10           C
ATOM     11  N   ALA A 743      29.410   2.110  20.120  1.00 16.50           N
ATOM     12  CA  ALA A 743      30.120   1.280  21.090  1.00 16.20           C
ATOM     13  C   ALA A 743      31.250   0.510  20.410  1.00 16.00           C
ATOM     14  O   ALA A 743      32.180   1.020  19.780  1.00 15.80           O
ATOM     15  N   LYS A 745      33.120  -2.150  19.820  1.00 15.00           N
ATOM     16  CA  LYS A 745      33.850  -3.120  20.650  1.00 14.80           C
ATOM     17  C   LYS A 745      34.920  -2.410  21.480  1.00 14.50           C
ATOM     18  O   LYS A 745      35.820  -3.020  22.050  1.00 14.20           O
ATOM     19  CB  LYS A 745      32.890  -3.950  21.520  1.00 14.60           C
ATOM     20  CG  LYS A 745      33.510  -5.120  22.280  1.00 14.30           C
ATOM     21  CD  LYS A 745      32.480  -6.050  22.910  1.00 14.00           C
ATOM     22  CE  LYS A 745      33.120  -7.180  23.710  1.00 13.80           C
ATOM     23  NZ  LYS A 745      32.120  -8.020  24.420  1.00 13.50           N
ATOM     24  N   GLU A 762      35.120   1.890  16.420  1.00 17.00           N
ATOM     25  CA  GLU A 762      36.020   2.810  15.710  1.00 16.80           C
ATOM     26  C   GLU A 762      37.150   2.050  15.020  1.00 16.50           C
ATOM     27  O   GLU A 762      38.050   2.620  14.380  1.00 16.20           O
ATOM     28  OE1 GLU A 762      36.420   4.890  14.210  1.00 16.00           O
ATOM     29  N   MET A 793      31.120  -1.850  12.420  1.00 14.00           N
ATOM     30  CA  MET A 793      30.250  -1.020  11.580  1.00 13.80           C
ATOM     31  C   MET A 793      29.180  -0.310  12.410  1.00 13.50           C
ATOM     32  O   MET A 793      28.150  -0.890  12.780  1.00 13.20           O
ATOM     33  CB  MET A 793      31.050   0.050  10.820  1.00 13.60           C
ATOM     34  SD  MET A 793      32.250   0.980  11.820  1.00 13.20           S
ATOM     35  N   PRO A 794      29.410   0.950  12.750  1.00 14.20           N
ATOM     36  N   CYS A 797      27.820   2.150  14.120  1.00 15.00           N
ATOM     37  CA  CYS A 797      26.890   3.020  14.850  1.00 14.80           C
ATOM     38  SG  CYS A 797      25.820   4.120  13.820  1.00 14.50           S
ATOM     39  N   LEU A 844      34.120  -4.820  16.280  1.00 15.50           N
ATOM     40  CA  LEU A 844      35.020  -5.890  15.890  1.00 15.20           C
ATOM     41  N   ASP A 855      32.850  -6.210  18.920  1.00 14.50           N
ATOM     42  CA  ASP A 855      31.950  -7.150  19.610  1.00 14.20           C
ATOM     43  OD1 ASP A 855      30.820  -8.120  18.210  1.00 13.80           O
TER`;

const MOCK_HER2_PDB = `HEADER    HER2 KINASE DOMAIN                      08-JUL-26   3RCD
TITLE     CRYSTAL STRUCTURE OF HER2 KINASE DOMAIN
HELIX    1   H1 MET A  720  ILE A  730  1                                  11
SHEET    1   S1 3 VAL A 734  ALA A 739  0
ATOM      1  N   LYS A 753      16.120   1.890 -11.210  1.00 14.00           N
ATOM      2  CA  LYS A 753      17.020   2.810 -10.510  1.00 13.80           C
ATOM      3  NZ  LYS A 753      15.250   4.890  -8.920  1.00 13.00           N
ATOM      4  N   GLU A 770      18.420  -1.120  -8.410  1.00 15.00           N
ATOM      5  OE1 GLU A 770      19.820  -2.150  -7.210  1.00 14.50           O
ATOM      6  N   MET A 801      14.120   1.050 -10.820  1.00 13.20           N
ATOM      7  CA  MET A 801      13.250   1.890 -11.650  1.00 13.00           C
ATOM      8  O   MET A 801      12.180   1.210 -12.120  1.00 12.80           O
ATOM      9  N   ASP A 863      16.850  -3.210 -12.820  1.00 13.50           N
ATOM     10  OD1 ASP A 863      15.820  -4.120 -13.910  1.00 13.20           O
TER`;

const getReceptorPdb = (taskId?: string) => {
  if (taskId === 'Vina-Task-2026-07-08-002') return MOCK_HER2_PDB;
  return MOCK_EGFR_PDB;
};

// Helper: generate merged receptor-ligand complex PDB string
const generateComplexPdb = (receptorPdb: string, ligandPdbqt: string, ligandName: string, poseIdx: number): string => {
  const header = `REMARK  COMPLEX OF RECEPTOR AND LIGAND ${ligandName} POSE ${poseIdx}\nREMARK  GENERATED BY AIDRUGDISCOVERY PLATFORM VINA ENGINE\n`;
  let proteinPart = receptorPdb;
  if (proteinPart.includes('END')) {
    proteinPart = proteinPart.replace('END', '');
  }

  let ligandAtomLines = '';
  let atomSerial = 5000;
  ligandPdbqt.split('\n').forEach(line => {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      const element = line.substring(76, 78).trim() || 'C';
      const atomName = line.substring(12, 16).trim() || 'C';
      const x = line.substring(30, 38).trim();
      const y = line.substring(38, 46).trim();
      const z = line.substring(46, 54).trim();
      
      const serialStr = String(atomSerial++).padStart(5);
      const nameStr = atomName.padEnd(4);
      const xStr = parseFloat(x).toFixed(3).padStart(8);
      const yStr = parseFloat(y).toFixed(3).padStart(8);
      const zStr = parseFloat(z).toFixed(3).padStart(8);
      
      ligandAtomLines += `HETATM${serialStr} ${nameStr} LIG L 999    ${xStr}${yStr}${zStr}  1.00 20.00          ${element.padStart(2)}\n`;
    }
  });

  return header + proteinPart + "\n" + ligandAtomLines + "END\n";
};

interface Docking3DViewerProps {
  receptorPdb: string;
  receptorName: string;
  pdbqtContent: string;
  ligandName: string;
  rank?: number;
  conformations?: Conformation[];
  selectedConfIndex?: number;
  onConfIndexChange?: (index: number) => void;
  bindingAffinity?: number;
  rmsdLb?: number;
  rmsdUb?: number;
  dockingBox?: {
    centerX: number;
    centerY: number;
    centerZ: number;
    sizeX: number;
    sizeY: number;
    sizeZ: number;
  };
  onDownloadPose?: () => void;
  onDownloadComplex?: () => void;
  onToast?: (msg: string) => void;
}

function Docking3DViewer({
  receptorPdb,
  receptorName,
  pdbqtContent,
  ligandName,
  rank = 1,
  conformations = [],
  selectedConfIndex = 1,
  onConfIndexChange,
  bindingAffinity = -9.8,
  rmsdLb = 0.0,
  rmsdUb = 0.0,
  dockingBox = { centerX: 31.254, centerY: -1.894, centerZ: 18.442, sizeX: 22.5, sizeY: 22.5, sizeZ: 22.5 },
  onDownloadPose,
  onDownloadComplex,
  onToast
}: Docking3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Toggles matching exact prompt specifications
  const [showProtein, setShowProtein] = useState<boolean>(true);
  const [showSurface, setShowSurface] = useState<boolean>(false);
  const [showPocketResidues, setShowPocketResidues] = useState<boolean>(true);
  const [showLigand, setShowLigand] = useState<boolean>(true);
  const [showSearchBox, setShowSearchBox] = useState<boolean>(true);

  const [scale, setScale] = useState<number>(14);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.35, y: 0.75 });

  // Parse ligand atoms from PDBQT
  const ligandAtoms: Atom[] = [];
  pdbqtContent.split('\n').forEach((line, index) => {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 8) {
        const x = parseFloat(line.substring(30, 38));
        const y = parseFloat(line.substring(38, 46));
        const z = parseFloat(line.substring(46, 54));
        const element = line.substring(76, 78).trim() || parts[parts.length - 1] || "C";
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          ligandAtoms.push({ id: index, x, y, z, element: element.toUpperCase() });
        }
      }
    }
  });

  // Calculate ligand geometric center
  let ligCenterX = 0, ligCenterY = 0, ligCenterZ = 0;
  if (ligandAtoms.length > 0) {
    ligandAtoms.forEach(a => {
      ligCenterX += a.x;
      ligCenterY += a.y;
      ligCenterZ += a.z;
    });
    ligCenterX /= ligandAtoms.length;
    ligCenterY /= ligandAtoms.length;
    ligCenterZ /= ligandAtoms.length;
  }

  // Parse protein atoms & pocket residues (<4 Å)
  const proteinAtoms: { id: number; x: number; y: number; z: number; element: string; resName: string; resSeq: number; atomName: string }[] = [];
  receptorPdb.split('\n').forEach((line, index) => {
    if (line.startsWith('ATOM')) {
      const atomName = line.substring(12, 16).trim();
      const resName = line.substring(17, 20).trim();
      const resSeq = parseInt(line.substring(22, 26).trim());
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));
      const element = line.substring(76, 78).trim() || atomName[0] || 'C';

      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        proteinAtoms.push({ id: index, x, y, z, element: element.toUpperCase(), resName, resSeq, atomName });
      }
    }
  });

  const pocketResidueList: { resName: string; resSeq: number; atoms: typeof proteinAtoms; minDist: number }[] = [];
  const resGroup: { [key: string]: typeof proteinAtoms } = {};
  proteinAtoms.forEach(pa => {
    const key = `${pa.resName}-${pa.resSeq}`;
    if (!resGroup[key]) resGroup[key] = [];
    resGroup[key].push(pa);
  });

  Object.entries(resGroup).forEach(([key, pAtoms]) => {
    let minDist = 999;
    pAtoms.forEach(pa => {
      ligandAtoms.forEach(la => {
        const d = Math.sqrt((pa.x - la.x) ** 2 + (pa.y - la.y) ** 2 + (pa.z - la.z) ** 2);
        if (d < minDist) minDist = d;
      });
    });
    if (minDist <= 4.0) {
      const [resName, seqStr] = key.split('-');
      pocketResidueList.push({
        resName,
        resSeq: parseInt(seqStr),
        atoms: pAtoms,
        minDist
      });
    }
  });

  const getElementColor = (el: string) => {
    switch (el) {
      case 'C': return '#00F0FF';
      case 'O': return '#FF4B4B';
      case 'N': return '#3B82F6';
      case 'S': return '#EAB308';
      case 'H': return '#FFFFFF';
      case 'P': return '#A855F7';
      case 'F': return '#22C55E';
      case 'CL': return '#10B981';
      case 'BR': return '#F97316';
      default: return '#94A3B8';
    }
  };

  const stateRef = useRef({
    scale,
    showProtein,
    showSurface,
    showPocketResidues,
    showLigand,
    showSearchBox,
    ligandAtoms,
    proteinAtoms,
    pocketResidueList,
    ligCenterX,
    ligCenterY,
    ligCenterZ,
    dockingBox
  });

  useEffect(() => {
    stateRef.current = {
      scale,
      showProtein,
      showSurface,
      showPocketResidues,
      showLigand,
      showSearchBox,
      ligandAtoms,
      proteinAtoms,
      pocketResidueList,
      ligCenterX,
      ligCenterY,
      ligCenterZ,
      dockingBox
    };
  }, [scale, showProtein, showSurface, showPocketResidues, showLigand, showSearchBox, ligandAtoms, proteinAtoms, pocketResidueList, ligCenterX, ligCenterY, ligCenterZ, dockingBox]);

  // Main 3D Canvas Rendering Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const config = stateRef.current;

      // Dark background matching uploaded screenshot
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
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

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Project 3D point to 2D screen
      const project = (x: number, y: number, z: number) => {
        const dx = x - config.ligCenterX;
        const dy = y - config.ligCenterY;
        const dz = z - config.ligCenterZ;

        const x1 = dx * cosY - dz * sinY;
        const z1 = dx * sinY + dz * cosY;

        const y2 = dy * cosX - z1 * sinX;
        const z2 = dy * sinX + z1 * cosX;

        const depthScale = (z2 + 40) / 40;
        const screenX = width / 2 + x1 * config.scale * depthScale;
        const screenY = height / 2 + y2 * config.scale * depthScale;

        return { screenX, screenY, depth: z2, depthScale };
      };

      // 1. Draw Search Box (Grid Box Wireframe + Translucent Fill)
      if (config.showSearchBox) {
        const { centerX: cx, centerY: cy, centerZ: cz, sizeX: sx, sizeY: sy, sizeZ: sz } = config.dockingBox;
        const hx = sx / 2, hy = sy / 2, hz = sz / 2;

        const boxCorners = [
          { x: cx - hx, y: cy - hy, z: cz - hz },
          { x: cx + hx, y: cy - hy, z: cz - hz },
          { x: cx + hx, y: cy + hy, z: cz - hz },
          { x: cx - hx, y: cy + hy, z: cz - hz },
          { x: cx - hx, y: cy - hy, z: cz + hz },
          { x: cx + hx, y: cy - hy, z: cz + hz },
          { x: cx + hx, y: cy + hy, z: cz + hz },
          { x: cx - hx, y: cy + hy, z: cz + hz },
        ].map(p => ({ ...p, ...project(p.x, p.y, p.z) }));

        const boxEdges = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7]
        ];

        ctx.fillStyle = 'rgba(2, 161, 200, 0.12)';
        ctx.beginPath();
        ctx.moveTo(boxCorners[0].screenX, boxCorners[0].screenY);
        ctx.lineTo(boxCorners[1].screenX, boxCorners[1].screenY);
        ctx.lineTo(boxCorners[2].screenX, boxCorners[2].screenY);
        ctx.lineTo(boxCorners[3].screenX, boxCorners[3].screenY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#02A1C8';
        ctx.lineWidth = 1.5;
        boxEdges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(boxCorners[i].screenX, boxCorners[i].screenY);
          ctx.lineTo(boxCorners[j].screenX, boxCorners[j].screenY);
          ctx.stroke();
        });
      }

      // 2. Draw Protein Receptor (Cartoon Ribbons - Blue/Indigo)
      if (config.showProtein) {
        const caAtoms = config.proteinAtoms.filter(a => a.atomName === 'CA').map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
        if (caAtoms.length > 1) {
          ctx.lineWidth = 12;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let i = 0; i < caAtoms.length - 1; i++) {
            const p1 = caAtoms[i];
            const p2 = caAtoms[i + 1];
            ctx.beginPath();
            const strokeGrad = ctx.createLinearGradient(p1.screenX, p1.screenY, p2.screenX, p2.screenY);
            strokeGrad.addColorStop(0, '#2563EB');
            strokeGrad.addColorStop(0.5, '#3B82F6');
            strokeGrad.addColorStop(1, '#1D4ED8');
            ctx.strokeStyle = strokeGrad;
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }

          // Inner highlight stroke for smooth ribbon finish
          ctx.lineWidth = 4;
          for (let i = 0; i < caAtoms.length - 1; i++) {
            const p1 = caAtoms[i];
            const p2 = caAtoms[i + 1];
            ctx.beginPath();
            ctx.strokeStyle = '#93C5FD';
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }
        }
      }

      // 3. Draw Protein Surface (Turned OFF by default)
      if (config.showSurface) {
        const pocketAtoms = config.pocketResidueList.flatMap(r => r.atoms).map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
        if (pocketAtoms.length > 0) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.strokeStyle = 'rgba(147, 197, 253, 0.35)';
          ctx.lineWidth = 1;
          pocketAtoms.forEach(pa => {
            ctx.beginPath();
            ctx.arc(pa.screenX, pa.screenY, 18 * pa.depthScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        }
      }

      // 4. Draw Pocket Residues (4 Å Stick Highlight)
      if (config.showPocketResidues) {
        config.pocketResidueList.forEach(res => {
          const projectedResAtoms = res.atoms.map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
          for (let i = 0; i < projectedResAtoms.length; i++) {
            for (let j = i + 1; j < projectedResAtoms.length; j++) {
              const a1 = res.atoms[i];
              const a2 = res.atoms[j];
              const d = Math.sqrt((a1.x - a2.x)**2 + (a1.y - a2.y)**2 + (a1.z - a2.z)**2);
              if (d < 1.85) {
                const pa1 = projectedResAtoms[i];
                const pa2 = projectedResAtoms[j];
                ctx.beginPath();
                ctx.strokeStyle = '#EAB308';
                ctx.lineWidth = 2.5;
                ctx.moveTo(pa1.screenX, pa1.screenY);
                ctx.lineTo(pa2.screenX, pa2.screenY);
                ctx.stroke();
              }
            }
          }
        });
      }

      // 5. Draw Ligand (Ball + Stick Model)
      if (config.showLigand) {
        const projLigAtoms = config.ligandAtoms.map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
        projLigAtoms.sort((a, b) => b.depth - a.depth);

        for (let i = 0; i < config.ligandAtoms.length; i++) {
          for (let j = i + 1; j < config.ligandAtoms.length; j++) {
            const a1 = config.ligandAtoms[i];
            const a2 = config.ligandAtoms[j];
            const dist = Math.sqrt((a1.x - a2.x)**2 + (a1.y - a2.y)**2 + (a1.z - a2.z)**2);
            if (dist < 1.95 && a1.element !== 'H' && a2.element !== 'H') {
              const pa1 = projLigAtoms.find(pa => pa.id === a1.id);
              const pa2 = projLigAtoms.find(pa => pa.id === a2.id);
              if (pa1 && pa2) {
                const midX = (pa1.screenX + pa2.screenX) / 2;
                const midY = (pa1.screenY + pa2.screenY) / 2;

                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.strokeStyle = getElementColor(pa1.element);
                ctx.moveTo(pa1.screenX, pa1.screenY);
                ctx.lineTo(midX, midY);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = getElementColor(pa2.element);
                ctx.moveTo(midX, midY);
                ctx.lineTo(pa2.screenX, pa2.screenY);
                ctx.stroke();
              }
            }
          }
        }

        projLigAtoms.forEach(atom => {
          const radius = Math.max(3, 5.5 * atom.depthScale);
          ctx.beginPath();
          ctx.arc(atom.screenX, atom.screenY, radius, 0, Math.PI * 2);
          
          const grad = ctx.createRadialGradient(
            atom.screenX - radius * 0.3,
            atom.screenY - radius * 0.3,
            radius * 0.1,
            atom.screenX,
            atom.screenY,
            radius
          );
          const col = getElementColor(atom.element);
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.3, col);
          grad.addColorStop(1, '#000000');
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const takeSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${ligandName}_model${selectedConfIndex}_3d.png`;
    a.click();
    onToast?.("已保存 3D 结合模式截图！");
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-[#0B132B] rounded-xl overflow-hidden shadow-xl border border-slate-800 text-left w-full h-[520px]">
      {/* Top Header Bar matching screenshot */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-sm font-bold text-white font-mono">{ligandName}</span>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            排名 {rank}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {conformations.length > 0 && onConfIndexChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">切换构象</span>
              <select
                value={selectedConfIndex}
                onChange={(e) => onConfIndexChange(Number(e.target.value))}
                className="bg-slate-900 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer h-8"
              >
                {conformations.map((conf) => (
                  <option key={conf.index} value={conf.index} className="bg-slate-900 text-slate-200">
                    Model {conf.index} ({conf.bindingAffinity.toFixed(1)} kcal/mol)
                  </option>
                ))}
              </select>
            </div>
          )}

          {onDownloadComplex && (
            <button
              type="button"
              onClick={onDownloadComplex}
              className="bg-[#02A1C8] hover:bg-[#017ea0] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm h-8"
            >
              <Download className="w-3.5 h-3.5" />
              下载复合物
            </button>
          )}
        </div>
      </div>

      {/* Toolbar Checkboxes & Action Buttons Row matching screenshot */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1E293B]/70 border-b border-slate-800/80 text-xs text-slate-300 select-none">
        {/* Left Checkboxes Group */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={showProtein} 
              onChange={e => setShowProtein(e.target.checked)} 
              className="rounded border-slate-700 bg-slate-900 text-[#02A1C8] focus:ring-0 w-3.5 h-3.5"
            />
            <span>蛋白</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={showSurface} 
              onChange={e => setShowSurface(e.target.checked)} 
              className="rounded border-slate-700 bg-slate-900 text-[#02A1C8] focus:ring-0 w-3.5 h-3.5"
            />
            <span>表面</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={showPocketResidues} 
              onChange={e => setShowPocketResidues(e.target.checked)} 
              className="rounded border-slate-700 bg-slate-900 text-[#02A1C8] focus:ring-0 w-3.5 h-3.5"
            />
            <span>口袋残基</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={showLigand} 
              onChange={e => setShowLigand(e.target.checked)} 
              className="rounded border-slate-700 bg-slate-900 text-[#02A1C8] focus:ring-0 w-3.5 h-3.5"
            />
            <span>配体</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input 
              type="checkbox" 
              checked={showSearchBox} 
              onChange={e => setShowSearchBox(e.target.checked)} 
              className="rounded border-slate-700 bg-slate-900 text-[#02A1C8] focus:ring-0 w-3.5 h-3.5"
            />
            <span>搜索盒</span>
          </label>
        </div>

        {/* Right Icon Action Buttons */}
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={() => setScale(20)} 
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
            title="聚焦配体"
          >
            <Focus className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setScale(12)} 
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
            title="聚焦盒子"
          >
            <Box className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => {
              rotationRef.current = { x: 0.35, y: 0.75 };
              setScale(14);
            }} 
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
            title="重置视角"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={toggleFullscreen} 
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
            title="全屏"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={takeSnapshot} 
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
            title="截图"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative flex-1 bg-[#0F172A] cursor-grab active:cursor-grabbing select-none overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={400} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Top Right HUD Box matching screenshot */}
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-left space-y-2 shadow-xl min-w-[170px]">
          <div className="text-[11px] text-slate-400 font-medium">当前构象</div>
          <div className="text-xl font-bold font-mono text-rose-500">
            {bindingAffinity.toFixed(1)} <span className="text-xs text-rose-400 font-normal">kcal/mol</span>
          </div>
          <div className="pt-1 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">RMSD</span>
              <span className="font-mono text-slate-200">{rmsdLb.toFixed(2)} / {rmsdUb.toFixed(2)} Å</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">口袋残基</span>
              <span className="font-mono text-slate-200">{pocketResidueList.length} 个 (4 Å)</span>
            </div>
          </div>
        </div>

        {/* Bottom Left Legend overlay matching screenshot */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            受体
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            配体
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
            口袋残基
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-600/60 border border-cyan-400 inline-block" />
            搜索盒
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Interactive 3D Receptor & Grid Box Viewer Component for Parameter Configuration ---
interface ReceptorDockingBox3DViewerProps {
  receptorPdb: string;
  receptorFileName: string;
  centerX: number;
  centerY: number;
  centerZ: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  isSelectingCenter: boolean;
  onSelectAtomCenter: (x: number, y: number, z: number, atomInfo: string) => void;
}

function ReceptorDockingBox3DViewer({
  receptorPdb,
  receptorFileName,
  centerX,
  centerY,
  centerZ,
  sizeX,
  sizeY,
  sizeZ,
  isSelectingCenter,
  onSelectAtomCenter
}: ReceptorDockingBox3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<'cartoon' | 'surface' | 'both'>('cartoon');
  const [showBox, setShowBox] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(14);
  const [hoveredAtom, setHoveredAtom] = useState<{
    atomName: string;
    resName: string;
    resSeq: number;
    x: number;
    y: number;
    z: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.35, y: 0.75 });

  // Parse receptor protein atoms from PDB string
  const proteinAtoms: { id: number; x: number; y: number; z: number; resName: string; resSeq: number; atomName: string; element: string; chain: string }[] = [];
  receptorPdb.split('\n').forEach((line, index) => {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      const atomName = line.substring(12, 16).trim();
      const resName = line.substring(17, 20).trim();
      const chain = line.substring(21, 22).trim() || 'A';
      const resSeq = parseInt(line.substring(22, 26).trim()) || 1;
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));
      const element = line.substring(76, 78).trim() || atomName[0] || 'C';

      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        proteinAtoms.push({ id: index, x, y, z, resName, resSeq, atomName, element: element.toUpperCase(), chain });
      }
    }
  });

  // Calculate geometric center of protein structure
  let protCenterX = 0, protCenterY = 0, protCenterZ = 0;
  if (proteinAtoms.length > 0) {
    proteinAtoms.forEach(a => {
      protCenterX += a.x;
      protCenterY += a.y;
      protCenterZ += a.z;
    });
    protCenterX /= proteinAtoms.length;
    protCenterY /= proteinAtoms.length;
    protCenterZ /= proteinAtoms.length;
  }

  const configRef = useRef({
    scale,
    mode,
    showBox,
    centerX,
    centerY,
    centerZ,
    sizeX,
    sizeY,
    sizeZ,
    proteinAtoms,
    protCenterX,
    protCenterY,
    protCenterZ,
    isSelectingCenter
  });

  useEffect(() => {
    configRef.current = {
      scale,
      mode,
      showBox,
      centerX,
      centerY,
      centerZ,
      sizeX,
      sizeY,
      sizeZ,
      proteinAtoms,
      protCenterX,
      protCenterY,
      protCenterZ,
      isSelectingCenter
    };
  }, [scale, mode, showBox, centerX, centerY, centerZ, sizeX, sizeY, sizeZ, proteinAtoms, protCenterX, protCenterY, protCenterZ, isSelectingCenter]);

  // Main 3D Canvas rendering loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cfg = configRef.current;

      // Clean background
      ctx.fillStyle = '#FAFCFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
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

      // Project 3D point to 2D screen coordinates
      const project = (x: number, y: number, z: number) => {
        const dx = x - cfg.protCenterX;
        const dy = y - cfg.protCenterY;
        const dz = z - cfg.protCenterZ;

        const x1 = dx * cosY - dz * sinY;
        const z1 = dx * sinY + dz * cosY;

        const y2 = dy * cosX - z1 * sinX;
        const z2 = dy * sinX + z1 * cosX;

        const depthScale = (z2 + 50) / 50;
        const screenX = width / 2 + x1 * cfg.scale * depthScale;
        const screenY = height / 2 + y2 * cfg.scale * depthScale;

        return { screenX, screenY, depth: z2, depthScale };
      };

      // 1. Draw Protein Receptor Structure (Cartoon ribbons)
      if (cfg.mode === 'cartoon' || cfg.mode === 'both') {
        const caAtoms = cfg.proteinAtoms.filter(a => a.atomName === 'CA').map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
        if (caAtoms.length > 1) {
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let i = 0; i < caAtoms.length - 1; i++) {
            const p1 = caAtoms[i];
            const p2 = caAtoms[i + 1];
            ctx.beginPath();
            const grad = ctx.createLinearGradient(p1.screenX, p1.screenY, p2.screenX, p2.screenY);
            grad.addColorStop(0, '#A3B8CC');
            grad.addColorStop(0.5, '#7B94B0');
            grad.addColorStop(1, '#536E8D');
            ctx.strokeStyle = grad;
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }

          // Inner highlight stroke for smooth ribbon finish
          ctx.lineWidth = 5;
          for (let i = 0; i < caAtoms.length - 1; i++) {
            const p1 = caAtoms[i];
            const p2 = caAtoms[i + 1];
            ctx.beginPath();
            ctx.strokeStyle = '#E2E8F0';
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }
        }
      }

      // 2. Draw Protein Surface representation
      if (cfg.mode === 'surface' || cfg.mode === 'both') {
        const projAtoms = cfg.proteinAtoms.map(a => ({ ...a, ...project(a.x, a.y, a.z) }));
        ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 1;
        projAtoms.forEach(pa => {
          ctx.beginPath();
          ctx.arc(pa.screenX, pa.screenY, 18 * pa.depthScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      // 3. Draw 3D Docking Wireframe Grid Box
      if (cfg.showBox) {
        const cx = cfg.centerX;
        const cy = cfg.centerY;
        const cz = cfg.centerZ;
        const hx = cfg.sizeX / 2;
        const hy = cfg.sizeY / 2;
        const hz = cfg.sizeZ / 2;

        const corners = [
          { x: cx - hx, y: cy - hy, z: cz - hz },
          { x: cx + hx, y: cy - hy, z: cz - hz },
          { x: cx + hx, y: cy + hy, z: cz - hz },
          { x: cx - hx, y: cy + hy, z: cz - hz },
          { x: cx - hx, y: cy - hy, z: cz + hz },
          { x: cx + hx, y: cy - hy, z: cz + hz },
          { x: cx + hx, y: cy + hy, z: cz + hz },
          { x: cx - hx, y: cy + hy, z: cz + hz }
        ].map(p => ({ ...p, ...project(p.x, p.y, p.z) }));

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        // Fill box translucent face
        ctx.fillStyle = 'rgba(2, 161, 200, 0.08)';
        ctx.beginPath();
        ctx.moveTo(corners[0].screenX, corners[0].screenY);
        ctx.lineTo(corners[1].screenX, corners[1].screenY);
        ctx.lineTo(corners[2].screenX, corners[2].screenY);
        ctx.lineTo(corners[3].screenX, corners[3].screenY);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(corners[4].screenX, corners[4].screenY);
        ctx.lineTo(corners[5].screenX, corners[5].screenY);
        ctx.lineTo(corners[6].screenX, corners[6].screenY);
        ctx.lineTo(corners[7].screenX, corners[7].screenY);
        ctx.closePath();
        ctx.fill();

        // Draw cyan wireframe box edges
        ctx.strokeStyle = '#02A1C8';
        ctx.lineWidth = 2;
        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(corners[i].screenX, corners[i].screenY);
          ctx.lineTo(corners[j].screenX, corners[j].screenY);
          ctx.stroke();
        });

        // Center dot on docking box
        const centerProj = project(cx, cy, cz);
        ctx.fillStyle = '#EA580C';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerProj.screenX, centerProj.screenY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      rotationRef.current.y += deltaX * 0.008;
      rotationRef.current.x += deltaY * 0.008;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    } else {
      // Find atom closest to mouse cursor
      const cfg = configRef.current;
      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      let closestAtom: typeof hoveredAtom = null;
      let minDistance = 24; // px threshold

      cfg.proteinAtoms.forEach(a => {
        const dx = a.x - cfg.protCenterX;
        const dy = a.y - cfg.protCenterY;
        const dz = a.z - cfg.protCenterZ;

        const x1 = dx * cosY - dz * sinY;
        const z1 = dx * sinY + dz * cosY;
        const y2 = dy * cosX - z1 * sinX;
        const z2 = dy * sinX + z1 * cosX;

        const depthScale = (z2 + 50) / 50;
        const screenX = canvasRef.current!.width / 2 + x1 * cfg.scale * depthScale;
        const screenY = canvasRef.current!.height / 2 + y2 * cfg.scale * depthScale;

        const d = Math.sqrt((screenX - mouseX) ** 2 + (screenY - mouseY) ** 2);
        if (d < minDistance) {
          minDistance = d;
          closestAtom = {
            atomName: a.atomName,
            resName: a.resName,
            resSeq: a.resSeq,
            x: a.x,
            y: a.y,
            z: a.z,
            screenX,
            screenY
          };
        }
      });

      setHoveredAtom(closestAtom);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleClick = () => {
    if (isSelectingCenter && hoveredAtom) {
      onSelectAtomCenter(
        hoveredAtom.x,
        hoveredAtom.y,
        hoveredAtom.z,
        `${hoveredAtom.resName} ${hoveredAtom.resSeq} · Chain A · ${hoveredAtom.atomName}`
      );
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm text-left h-full min-h-[480px]">
      {/* Top Header / Control Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        {/* Left Toggle Group: Cartoon / Surface / Box */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('cartoon')}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer",
                mode === 'cartoon' ? "bg-[#F0F9FB] text-[#02A1C8] border border-[#d6f2f6]" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Cartoon
            </button>
            <button
              type="button"
              onClick={() => setMode('surface')}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer",
                mode === 'surface' ? "bg-[#F0F9FB] text-[#02A1C8] border border-[#d6f2f6]" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Surface
            </button>
            <button
              type="button"
              onClick={() => setShowBox(!showBox)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer",
                showBox ? "bg-[#F0F9FB] text-[#02A1C8] border border-[#d6f2f6]" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Box
            </button>
          </div>
        </div>

        {/* Right Action Buttons: 聚焦盒子 | 全屏 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              rotationRef.current = { x: 0.35, y: 0.75 };
              setScale(14);
            }}
            className="px-3 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            聚焦盒子
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            全屏
          </button>
        </div>
      </div>

      {/* 3D Viewport Canvas */}
      <div className="relative flex-1 bg-slate-50 min-h-[380px] cursor-grab active:cursor-grabbing select-none overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          className="w-full h-full block"
        />

        {/* Atom Hover / Click Tooltip Box matching Screenshot */}
        {hoveredAtom && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-left font-mono animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(Math.max(hoveredAtom.screenX + 12, 10), 400)}px`,
              top: `${Math.min(Math.max(hoveredAtom.screenY - 20, 10), 320)}px`
            }}
          >
            <div className="text-xs font-bold text-white flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>{hoveredAtom.resName} {hoveredAtom.resSeq} · Chain A · {hoveredAtom.atomName}</span>
            </div>
            <div className="text-[11px] text-slate-200 pt-1.5 space-x-2">
              <span>X <strong className="text-cyan-400">{hoveredAtom.x.toFixed(3)}</strong></span>
              <span>Y <strong className="text-cyan-400">{hoveredAtom.y.toFixed(3)}</strong></span>
              <span>Z <strong className="text-cyan-400">{hoveredAtom.z.toFixed(3)}</strong></span>
            </div>
          </div>
        )}

        {/* Floating Zoom Controls Bottom-Left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-200 shadow-sm text-xs">
          <button
            type="button"
            onClick={() => setScale(prev => Math.max(5, prev - 2))}
            className="w-6 h-6 flex items-center justify-center font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setScale(prev => Math.min(30, prev + 2))}
            className="w-6 h-6 flex items-center justify-center font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Bottom Information Footer Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-[11px]">受体: 按链着色</span>
          <span className="bg-[#F0F9FB] text-[#02A1C8] px-2.5 py-1 rounded border border-[#d6f2f6] text-[11px] font-bold">盒子: 青色线框</span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-full text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>结构已加载 · 2,846 原子 · 1 条链</span>
        </div>
      </div>
    </div>
  );
}

export function VirtualScreeningTask2({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [activeTab, setActiveTab] = useState<'inference' | 'history'>('inference');
  
  // Task settings
  const [taskName, setTaskName] = useState("Vina-Task-2026-07-13-001");
  const [taskDesc, setTaskDesc] = useState("针对 EGFR 靶点进行小分子虚拟筛选，用于候选化合物优先级排序。");

  // Selection mode for picking center from 3D structure
  const [isSelectingCenter, setIsSelectingCenter] = useState<boolean>(true);

  // File uploads state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "file-1",
      name: "receptor_egfr_l858r.pdbqt",
      type: "受体",
      format: "pdbqt",
      size: "3.21 MB",
      status: "completed"
    },
    {
      id: "file-2",
      name: "ligands.pdbqt",
      type: "配体库",
      format: "pdbqt",
      size: "12.47 MB",
      status: "completed"
    }
  ]);

  // Parameters
  const [params, setParams] = useState({
    centerX: "31.254",
    centerY: "-1.894",
    centerZ: "18.442",
    sizeX: "22.500",
    sizeY: "22.500",
    sizeZ: "22.500",
    energyRange: "4.0",
    cpu: "16",
    exhaustiveness: "24",
    numModes: "12",
    seed: "888888"
  });



  // Local task history (allows interactive additions)
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([
    { id: 'Vina-Task-2026-07-10-004', name: 'EGFR-L858R突变体筛选', receptor: 'receptor_egfr_l858r.pdbqt', ligandsCount: 500, status: 'completed', time: '14m 20s', date: '2026-07-10 14:20' },
    { id: 'Vina-Task-2026-07-08-002', name: 'HER2小分子配体精细对接', receptor: 'her2_receptor.pdbqt', ligandsCount: 12, status: 'completed', time: '1m 45s', date: '2026-07-08 10:15' },
    { id: 'Vina-Task-2026-07-05-001', name: '新冠3CL蛋白酶抑制剂初筛', receptor: 'cov_3clpro.pdb', ligandsCount: 2500, status: 'failed', time: '5m 12s', date: '2026-07-05 16:45' }
  ]);

  const [selectedTask, setSelectedTask] = useState<HistoryTask | null>(null);
  const [selectedResult, setSelectedResult] = useState<DockingResult | null>(null);
  const [selectedConfIndex, setSelectedConfIndex] = useState<number>(1);
  const [expandedLigands, setExpandedLigands] = useState<Set<string>>(new Set());
  const [activeDetailsTab, setActiveDetailsTab] = useState<'conformation' | 'pocket' | 'params'>('conformation');
  const [isPdbqtCodeExpanded, setIsPdbqtCodeExpanded] = useState<boolean>(false);

  const getParam = (key: string, defaultValue: string) => {
    if (selectedTask?.params && (selectedTask.params as any)[key]) {
      return (selectedTask.params as any)[key];
    }
    if (selectedTask?.id === 'Vina-Task-2026-07-10-004') {
      const defaults: any = {
        centerX: "31.254", centerY: "-1.894", centerZ: "18.442",
        sizeX: "22.500", sizeY: "22.500", sizeZ: "22.500",
        energyRange: "4.0", cpu: "16", exhaustiveness: "24", numModes: "12", seed: "888888"
      };
      return defaults[key] || defaultValue;
    }
    if (selectedTask?.id === 'Vina-Task-2026-07-08-002') {
      const defaults: any = {
        centerX: "15.340", centerY: "2.110", centerZ: "-10.502",
        sizeX: "20.000", sizeY: "20.000", sizeZ: "20.000",
        energyRange: "3.0", cpu: "8", exhaustiveness: "16", numModes: "9", seed: "42"
      };
      return defaults[key] || defaultValue;
    }
    const defaults: any = {
      centerX: "25.045", centerY: "-4.890", centerZ: "5.120",
      sizeX: "18.500", sizeY: "18.500", sizeZ: "18.500",
      energyRange: "3.0", cpu: "8", exhaustiveness: "16", numModes: "9", seed: "12345"
    };
    return defaults[key] || defaultValue;
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const receptorInputRef = useRef<HTMLInputElement | null>(null);
  const ligandInputRef = useRef<HTMLInputElement | null>(null);

  const [isReceptorDragging, setIsReceptorDragging] = useState(false);
  const [isLigandDragging, setIsLigandDragging] = useState(false);

  const processFile = (file: File, type: '受体' | '配体库') => {
    const name = file.name;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const ext = name.split('.').pop()?.toLowerCase() || "";

    const receptorAllowed = ['pdbqt', 'pdb', 'ent', 'pqr', 'mcif', 'mmcif'];
    const ligandAllowed = ['pdbqt', 'pdb', 'xyz', 'pqr'];

    if (type === '受体') {
      if (!receptorAllowed.includes(ext)) {
        triggerToast(`格式错误！受体文件仅支持：${receptorAllowed.join(', ')}`);
        return;
      }
      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: name,
        type: "受体",
        format: ext,
        size: sizeInMB,
        status: "completed"
      };
      setUploadedFiles(prev => [newFile, ...prev.filter(f => f.type !== '受体')]);
      triggerToast(`受体文件 ${name} 上传成功！`);
    } else {
      if (!ligandAllowed.includes(ext)) {
        triggerToast(`格式错误！配体文件仅支持：${ligandAllowed.join(', ')}`);
        return;
      }
      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: name,
        type: "配体库",
        format: ext,
        size: sizeInMB,
        status: "completed"
      };
      setUploadedFiles(prev => [...prev, newFile]);
      triggerToast(`配体文件 ${name} 上传成功！`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: '受体' | '配体库') => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        processFile(file as File, type);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: '受体' | '配体库') => {
    e.preventDefault();
    if (type === '受体') {
      setIsReceptorDragging(true);
    } else {
      setIsLigandDragging(true);
    }
  };

  const handleDragLeave = (type: '受体' | '配体库') => {
    if (type === '受体') {
      setIsReceptorDragging(false);
    } else {
      setIsLigandDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: '受体' | '配体库') => {
    e.preventDefault();
    if (type === '受体') {
      setIsReceptorDragging(false);
    } else {
      setIsLigandDragging(false);
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        processFile(file as File, type);
      });
    }
  };

  const handleFileUpload = (type: '受体' | '配体库') => {
    if (type === '受体') {
      receptorInputRef.current?.click();
    } else {
      ligandInputRef.current?.click();
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    triggerToast("文件删除成功！");
  };

  const handleGenerateSampleParams = () => {
    setParams({
      centerX: "31.254",
      centerY: "-1.894",
      centerZ: "18.442",
      sizeX: "22.500",
      sizeY: "22.500",
      sizeZ: "22.500",
      energyRange: "4.0",
      cpu: "16",
      exhaustiveness: "24",
      numModes: "12",
      seed: "888888"
    });
    triggerToast("已自动生成高精度对接示例参数！");
  };

  const handleSaveDraft = () => {
    triggerToast("草稿保存成功！当前任务配置已暂存。");
  };

  const handleSubmitTask = () => {
    setShowConfirmSubmit(true);
  };

  const confirmSubmit = () => {
    setShowConfirmSubmit(false);
    
    // Add new task to local history with "running" status
    const newTask: HistoryTask = {
      id: `Vina-Task-${new Date().toISOString().slice(0, 10)}-${String(historyTasks.length + 1).padStart(3, '0')}`,
      name: taskName,
      receptor: uploadedFiles.find(f => f.type === "受体")?.name || "receptor_egfr.pdbqt",
      ligandsCount: uploadedFiles.some(f => f.type === "配体库") ? 128 : 0,
      status: 'running',
      time: '-',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setHistoryTasks(prev => [newTask, ...prev]);
    triggerToast("任务提交成功！已加入到离线计算队列。");
    
    // Switch to history tab to show the task
    setTimeout(() => {
      setActiveTab('history');
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium animate-in slide-in-from-top duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white p-6 rounded-xl shadow-xl">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
                <Play className="w-5 h-5 text-[#02A1C8]" />
                确认提交虚拟筛选任务
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                此任务预估计算时间为 25 分钟，提交后将消耗平台的并行计算节点资源。
              </CardDescription>
            </CardHeader>
            <div className="py-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">任务名称</span>
                <span className="font-semibold text-slate-700">{taskName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">受体文件名</span>
                <span className="font-mono text-slate-700">{uploadedFiles.find(f => f.type === '受体')?.name || "未上传"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">估算配体数</span>
                <span className="font-semibold text-slate-700">128 个</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400">算法引擎</span>
                <span className="font-mono text-[#02A1C8] font-bold">AutoDock Vina 1.2.5</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowConfirmSubmit(false)}
                className="h-9 font-semibold text-xs border-slate-200"
              >
                取消
              </Button>
              <Button 
                size="sm" 
                onClick={confirmSubmit}
                className="h-9 bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold text-xs px-5"
              >
                确认提交
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Top Breadcrumb and Title Header */}
      <div className="bg-white border-b px-8 py-5 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-3">
          <span>AI药物发现平台</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-slate-600 cursor-pointer" onClick={onBack}>模型中心</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">基于结构的虚拟筛选</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              基于结构的虚拟筛选 (AutoDock Vina)
            </h1>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              基于 AutoDock Vina 的受体-配体分子对接与虚拟筛选任务配置。
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack} 
            className="rounded-full border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 h-8.5 px-4 shadow-sm shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            返回模型中心
          </Button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex items-center justify-between mt-5 pt-1">
          <div className="flex items-center bg-[#F1F4F9] p-1.5 rounded-full w-fit border border-slate-100">
            <button 
              type="button"
              onClick={() => {
                setActiveTab('inference');
                setSelectedTask(null);
                setSelectedResult(null);
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === 'inference' 
                  ? "bg-[#0F172A] text-white shadow-md" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>提交任务</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setActiveTab('history');
                setSelectedTask(null);
                setSelectedResult(null);
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === 'history' 
                  ? "bg-[#0F172A] text-white shadow-md" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>历史任务</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <ScrollArea className="flex-1">
        <div className="p-8 max-w-[1500px] mx-auto pb-24">
          {activeTab === 'inference' ? (
            <div className="grid grid-cols-12 gap-6 items-start">
              
              {/* Left Column Fields */}
              <div className="col-span-12 space-y-6">
                
                {/* 1. 任务设置 */}
                <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100/70 p-5 flex-row items-center gap-2.5 space-y-0">
                    <div className="p-1.5 bg-blue-50 text-[#02A1C8] rounded-lg">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-xs font-bold text-slate-800">任务设置</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left: Task Name */}
                      <div className="space-y-2 text-left">
                        <Label className="text-xs font-bold text-slate-600">任务名称</Label>
                        <Input 
                          value={taskName} 
                          onChange={e => setTaskName(e.target.value)} 
                          className="text-xs h-10 border-slate-200 focus-visible:ring-[#02A1C8] rounded-lg text-slate-700"
                          placeholder="请输入任务名称"
                        />
                      </div>
                      
                      {/* Right: Task Description */}
                      <div className="space-y-2 text-left">
                        <Label className="text-xs font-bold text-slate-600">任务说明</Label>
                        <div className="relative">
                          <textarea 
                            value={taskDesc} 
                            onChange={e => setTaskDesc(e.target.value)} 
                            className="w-full text-xs min-h-[40px] max-h-[80px] p-2.5 border border-slate-200 focus:border-[#02A1C8] focus:outline-none focus:ring-1 focus:ring-[#02A1C8] rounded-lg text-slate-700 leading-relaxed resize-none"
                            placeholder="可选，方便后续任务追踪和结果说明。"
                            maxLength={200}
                          />
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>可选，方便后续任务追踪和结果说明。</span>
                            <span>{taskDesc.length} / 200</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. 文件上传 */}
                <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100/70 p-5 flex-row items-center gap-2.5 space-y-0">
                    <div className="p-1.5 bg-blue-50 text-[#02A1C8] rounded-lg">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-xs font-bold text-slate-800">文件上传</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    {/* Hidden inputs for file upload */}
                    <input 
                      type="file" 
                      ref={receptorInputRef} 
                      onChange={e => handleFileChange(e, '受体')} 
                      accept=".pdbqt,.pdb,.ent,.pqr,.mcif,.mmcif" 
                      className="hidden" 
                    />
                    <input 
                      type="file" 
                      ref={ligandInputRef} 
                      onChange={e => handleFileChange(e, '配体库')} 
                      accept=".pdbqt,.pdb,.xyz,.pqr" 
                      className="hidden" 
                      multiple 
                    />

                    {/* Drag and drop boxes side-by-side */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Receptor Dropzone */}
                      <div className="text-left space-y-2">
                        <Label className="text-xs font-bold text-slate-600">受体文件上传</Label>
                        <div 
                          onClick={() => handleFileUpload('受体')}
                          onDragOver={e => handleDragOver(e, '受体')}
                          onDragLeave={() => handleDragLeave('受体')}
                          onDrop={e => handleDrop(e, '受体')}
                          className={cn(
                            "border border-dashed transition-all p-5 rounded-xl cursor-pointer text-center flex flex-col items-center justify-center min-h-[110px]",
                            isReceptorDragging 
                              ? "border-[#02A1C8] bg-[#F0F9FB]/80 scale-[0.99] shadow-inner" 
                              : "border-slate-200 hover:border-[#02A1C8] bg-slate-50/30 hover:bg-[#F0F9FB]/40"
                          )}
                        >
                          <div className="p-2.5 bg-white border border-slate-100 rounded-full shadow-sm mb-2 text-[#02A1C8]">
                            <Upload className="w-5 h-5 text-[#02A1C8]" />
                          </div>
                          <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                            点击或拖拽文件到此处上传
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 font-mono">
                            支持 pdbqt / pdb / ent / pqr / mcif / mmcif
                          </span>
                        </div>
                      </div>

                      {/* Ligand Dropzone */}
                      <div className="text-left space-y-2">
                        <Label className="text-xs font-bold text-slate-600">配体文件上传</Label>
                        <div 
                          onClick={() => handleFileUpload('配体库')}
                          onDragOver={e => handleDragOver(e, '配体库')}
                          onDragLeave={() => handleDragLeave('配体库')}
                          onDrop={e => handleDrop(e, '配体库')}
                          className={cn(
                            "border border-dashed transition-all p-5 rounded-xl cursor-pointer text-center flex flex-col items-center justify-center min-h-[110px]",
                            isLigandDragging 
                              ? "border-[#02A1C8] bg-[#F0F9FB]/80 scale-[0.99] shadow-inner" 
                              : "border-slate-200 hover:border-[#02A1C8] bg-slate-50/30 hover:bg-[#F0F9FB]/40"
                          )}
                        >
                          <div className="p-2.5 bg-white border border-slate-100 rounded-full shadow-sm mb-2 text-[#02A1C8]">
                            <Upload className="w-5 h-5 text-[#02A1C8]" />
                          </div>
                          <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                            点击或拖拽文件到此处上传
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 font-mono">
                            支持 pdbqt / pdb / xyz / pqr
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Uploded files table list */}
                    {uploadedFiles.length > 0 && (
                      <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
                        <Table>
                          <TableHeader className="bg-slate-50/70 text-slate-400">
                            <TableRow className="border-b border-slate-100">
                              <TableHead className="text-slate-500 font-bold text-xs h-10">文件名</TableHead>
                              <TableHead className="text-slate-500 font-bold text-xs h-10">类型</TableHead>
                              <TableHead className="text-slate-500 font-bold text-xs h-10">格式</TableHead>
                              <TableHead className="text-slate-500 font-bold text-xs h-10">大小</TableHead>
                              <TableHead className="text-slate-500 font-bold text-xs h-10">状态</TableHead>
                              <TableHead className="text-slate-500 font-bold text-xs h-10 text-right">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {uploadedFiles.map((file) => (
                              <TableRow key={file.id} className="text-xs hover:bg-slate-50/30 border-b border-slate-50">
                                <TableCell className="font-medium text-slate-700 flex items-center gap-2">
                                  <FileIcon className={cn("w-4 h-4", file.type === '受体' ? "text-blue-500" : "text-purple-500")} />
                                  <span className="font-mono">{file.name}</span>
                                </TableCell>
                                <TableCell className="text-slate-600">{file.type}</TableCell>
                                <TableCell className="font-mono text-slate-500">{file.format}</TableCell>
                                <TableCell className="text-slate-500 font-mono">{file.size}</TableCell>
                                <TableCell>
                                  <Badge className="bg-[#F0F9FB] text-[#02A1C8] border border-[#d6f2f6] shadow-none hover:bg-[#F0F9FB] text-[10px] px-2 py-0.5 font-bold rounded">
                                    已上传
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button 
                                      type="button"
                                      className="text-slate-400 hover:text-[#02A1C8] p-1.5 hover:bg-slate-50 rounded"
                                      title="预览"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleRemoveFile(file.id)}
                                      className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-slate-50 rounded"
                                      title="删除"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3. 参数配置 */}
                <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                  {/* Header bar matching screenshot */}
                  <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-cyan-50 text-[#02A1C8] rounded-lg">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold text-slate-800">3. 参数配置</CardTitle>
                        <span className="text-xs text-slate-400 font-normal">设置对接搜索空间与运行参数</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">
                        {uploadedFiles.find(f => f.type === '受体')?.name || 'receptor_egfr_l858r.pdbqt'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        已解析
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-12 gap-8 items-start">
                      {/* Left Side: Parameters & Coordinates Controls (col-span-6) */}
                      <div className="col-span-12 lg:col-span-6 space-y-6 text-left">
                        {/* 对接区域 Sub-header */}
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5 text-[#02A1C8]" />
                            对接区域
                          </h4>
                          <span className="text-[11px] text-slate-400">盒子单位: Å</span>
                        </div>

                        {/* 活性位点盒子中心 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs font-bold text-slate-700">活性位点盒子中心</Label>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="三维结合口袋的中心点坐标 (X, Y, Z)" />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-9 focus-within:border-[#02A1C8] focus-within:ring-1 focus-within:ring-[#02A1C8]">
                              <span className="bg-slate-100 text-[11px] text-slate-500 font-mono px-2.5 py-2 border-r border-slate-200">Center X</span>
                              <input 
                                type="text"
                                value={params.centerX}
                                onChange={e => setParams({...params, centerX: e.target.value})}
                                className="bg-white flex-1 text-xs px-2 h-full focus:outline-none text-slate-800 font-mono font-medium"
                              />
                              <span className="text-[10px] text-slate-400 pr-2">Å</span>
                            </div>

                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-9 focus-within:border-[#02A1C8] focus-within:ring-1 focus-within:ring-[#02A1C8]">
                              <span className="bg-slate-100 text-[11px] text-slate-500 font-mono px-2.5 py-2 border-r border-slate-200">Center Y</span>
                              <input 
                                type="text"
                                value={params.centerY}
                                onChange={e => setParams({...params, centerY: e.target.value})}
                                className="bg-white flex-1 text-xs px-2 h-full focus:outline-none text-slate-800 font-mono font-medium"
                              />
                              <span className="text-[10px] text-slate-400 pr-2">Å</span>
                            </div>

                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-9 focus-within:border-[#02A1C8] focus-within:ring-1 focus-within:ring-[#02A1C8]">
                              <span className="bg-slate-100 text-[11px] text-slate-500 font-mono px-2.5 py-2 border-r border-slate-200">Center Z</span>
                              <input 
                                type="text"
                                value={params.centerZ}
                                onChange={e => setParams({...params, centerZ: e.target.value})}
                                className="bg-white flex-1 text-xs px-2 h-full focus:outline-none text-slate-800 font-mono font-medium"
                              />
                              <span className="text-[10px] text-slate-400 pr-2">Å</span>
                            </div>
                          </div>
                        </div>

                        {/* 对接盒子大小 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs font-bold text-slate-700">对接盒子大小</Label>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="三维结合口袋的长宽高尺寸 (Size X, Y, Z)" />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-9 focus-within:border-[#02A1C8] focus-within:ring-1 focus-within:ring-[#02A1C8]">
                              <span className="bg-slate-100 text-[11px] text-slate-500 font-mono px-2.5 py-2 border-r border-slate-200">Size X</span>
                              <input 
                                type="text"
                                value={params.sizeX}
                                onChange={e => setParams({...params, sizeX: e.target.value})}
                                className="bg-white flex-1 text-xs px-3 h-full focus:outline-none text-slate-800 font-mono font-medium"
                              />
                              <span className="text-[10px] text-slate-400 pr-2">Å</span>
                            </div>

                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-9 focus-within:border-[#02A1C8] focus-within:ring-1 focus-within:ring-[#02A1C8]">
                              <span className="bg-slate-100 text-[11px] text-slate-500 font-mono px-2.5 py-2 border-r border-slate-200">Size Y</span>
                              <input 
                                type="text"
                                value={params.sizeY}
                                onChange={e => setParams({...params, sizeY: e.target.value})}
                                className="bg-white flex-1 text-xs px-3 h-full focus:outline-none text-slate-800 font-mono font-medium"
                              />
                              <span className="text-[10px] text-slate-400 pr-2">Å</span>
                            </div>

                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-9 focus-within:border-[#02A1C8] focus-within:ring-1 focus-within:ring-[#02A1C8]">
                              <span className="bg-slate-100 text-[11px] text-slate-500 font-mono px-2.5 py-2 border-r border-slate-200">Size Z</span>
                              <input 
                                type="text"
                                value={params.sizeZ}
                                onChange={e => setParams({...params, sizeZ: e.target.value})}
                                className="bg-white flex-1 text-xs px-3 h-full focus:outline-none text-slate-800 font-mono font-medium"
                              />
                              <span className="text-[10px] text-slate-400 pr-2">Å</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons matching screenshot */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsSelectingCenter(!isSelectingCenter)}
                            className={cn(
                              "px-3.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
                              isSelectingCenter
                                ? "bg-[#02A1C8] text-white border-[#02A1C8] ring-2 ring-cyan-100"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <span>+</span> 在结构上选中心
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setParams({
                                ...params,
                                centerX: "31.254",
                                centerY: "-1.894",
                                centerZ: "18.442"
                              });
                              triggerToast("已自动定位到蛋白质心中心！");
                            }}
                            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            定位到结构中心
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setParams({
                                centerX: "31.254",
                                centerY: "-1.894",
                                centerZ: "18.442",
                                sizeX: "22.500",
                                sizeY: "22.500",
                                sizeZ: "22.500",
                                energyRange: "4.0",
                                cpu: "16",
                                exhaustiveness: "24",
                                numModes: "12",
                                seed: "888888"
                              });
                              triggerToast("参数已重置为默认选区！");
                            }}
                            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            重置视角
                          </button>
                        </div>

                        {/* Notice Banner matching screenshot */}
                        <div className="bg-[#F0F9FB] border border-[#d6f2f6] rounded-xl p-3.5 space-y-1 text-left">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#02A1C8]">
                            <Info className="w-4 h-4" />
                            <span>选择中心模式已开启</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                            在右侧 3D 视图中点击任意残基原子，系统将自动把该原子的 (X, Y, Z) 坐标填入“活性位点盒子中心”。
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="pt-2 border-t border-slate-100" />

                        {/* Other Vina Parameters */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 block">最大能量差 (kcal/mol)</Label>
                            <input 
                              type="text"
                              value={params.energyRange}
                              onChange={e => setParams({...params, energyRange: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg text-xs px-3 h-9 w-full focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8] focus:outline-none text-slate-800 font-mono font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 block">CPU 线程数</Label>
                            <input 
                              type="text"
                              value={params.cpu}
                              onChange={e => setParams({...params, cpu: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg text-xs px-3 h-9 w-full focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8] focus:outline-none text-slate-800 font-mono font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 block">对接细致度 (Exhaustiveness)</Label>
                            <input 
                              type="text"
                              value={params.exhaustiveness}
                              onChange={e => setParams({...params, exhaustiveness: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg text-xs px-3 h-9 w-full focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8] focus:outline-none text-slate-800 font-mono font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 block">输出构象数 (Num Modes)</Label>
                            <input 
                              type="text"
                              value={params.numModes}
                              onChange={e => setParams({...params, numModes: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg text-xs px-3 h-9 w-full focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8] focus:outline-none text-slate-800 font-mono font-medium"
                            />
                          </div>
                        </div>

                        {/* Seed Input + Button */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-700 block">随机种子 (Seed)</Label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={params.seed}
                              onChange={e => setParams({...params, seed: e.target.value})}
                              className="bg-white border border-slate-200 rounded-lg text-xs px-3 h-9 flex-1 focus:border-[#02A1C8] focus:ring-1 focus:ring-[#02A1C8] focus:outline-none text-slate-800 font-mono font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newSeed = Math.floor(100000 + Math.random() * 900000).toString();
                                setParams({ ...params, seed: newSeed });
                                triggerToast(`已更新随机种子为: ${newSeed}`);
                              }}
                              className="px-3 h-9 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              重新生成
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Interactive 3D Receptor Viewer with Docking Grid Box (col-span-6) */}
                      <div className="col-span-12 lg:col-span-6 h-full">
                        <ReceptorDockingBox3DViewer
                          receptorPdb={MOCK_EGFR_PDB}
                          receptorFileName={uploadedFiles.find(f => f.type === '受体')?.name || 'receptor_egfr_l858r.pdbqt'}
                          centerX={parseFloat(params.centerX) || 31.254}
                          centerY={parseFloat(params.centerY) || -1.894}
                          centerZ={parseFloat(params.centerZ) || 18.442}
                          sizeX={parseFloat(params.sizeX) || 22.5}
                          sizeY={parseFloat(params.sizeY) || 22.5}
                          sizeZ={parseFloat(params.sizeZ) || 22.5}
                          isSelectingCenter={isSelectingCenter}
                          onSelectAtomCenter={(x, y, z, atomInfo) => {
                            setParams(prev => ({
                              ...prev,
                              centerX: x.toFixed(3),
                              centerY: y.toFixed(3),
                              centerZ: z.toFixed(3)
                            }));
                            triggerToast(`已由结构拾取中心坐标 (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)}) [${atomInfo}]`);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Bottom Trigger Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleGenerateSampleParams}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10 text-xs font-bold px-5 rounded-lg flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#02A1C8]" />
                      生成示例参数
                    </Button>

                  </div>

                  <Button 
                    type="button"
                    onClick={handleSubmitTask}
                    className="bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold h-10 text-xs px-6 rounded-lg flex items-center gap-2 shadow-md shrink-0 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    提交虚拟筛选任务
                  </Button>
                </div>

              </div>

            </div>
          ) : selectedTask ? (
            /* Selected Task Results Details View */
            <div className="space-y-6">
              {/* Task Details Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(null);
                      setSelectedResult(null);
                    }}
                    className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    返回历史列表
                  </Button>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-800">{selectedTask.name}</h2>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded">
                        {selectedTask.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">查看筛选对接结果及分子空间构象</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-none text-[10px] px-2.5 py-1 rounded font-medium">
                    计算完成
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">{selectedTask.date}</span>
                </div>
              </div>

              {/* Task Summary Overview KPI Cards replaced with Image Style Details */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-6 text-left">
                {/* 1. 基础信息 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#02A1C8] rounded-full inline-block"></span>
                    一、基础信息
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pl-3.5">
                    {/* Left side */}
                    <div className="grid grid-cols-12 gap-2 text-xs">
                      <span className="col-span-4 text-slate-500">推理任务名称:</span>
                      <span className="col-span-8 font-semibold text-slate-800">{selectedTask.name}</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">创建时间:</span>
                      <span className="col-span-8 font-medium text-slate-700 mt-1">{selectedTask.date}</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">输入受体分子:</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700 mt-1 truncate" title={selectedTask.receptor}>
                        {selectedTask.receptor}
                      </span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">模型名称:</span>
                      <span className="col-span-8 font-medium text-slate-700 mt-1">基于结构的虚拟筛选模型 (AutoDock Vina)</span>
                    </div>

                    {/* Right side */}
                    <div className="grid grid-cols-12 gap-2 text-xs">
                      <span className="col-span-4 text-slate-500">配体分子库:</span>
                      <span className="col-span-8 font-medium text-slate-700">
                        ligands.pdbqt (<span className="font-mono font-semibold">{selectedTask.ligandsCount}</span> 个小分子)
                      </span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">预测任务状态:</span>
                      <span className="col-span-8 mt-1">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          COMPLETED SUCCESS
                        </span>
                      </span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">预测消耗时长:</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700 mt-1">{selectedTask.time}</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">计算物理节点:</span>
                      <span className="col-span-8 font-medium text-slate-700 mt-1">16 Cores CPU & High-Performance Node</span>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. 参数配置 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#02A1C8] rounded-full inline-block"></span>
                    二、参数配置
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pl-3.5">
                    {/* Left side */}
                    <div className="grid grid-cols-12 gap-2 text-xs">
                      <span className="col-span-4 text-slate-500">活性位点中心 X:</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700">{getParam("centerX", "31.254")}</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">活性位点中心 Y:</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700 mt-1">{getParam("centerY", "-1.894")}</span>

                      <span className="col-span-4 text-slate-500 mt-1">活性位点中心 Z:</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700 mt-1">{getParam("centerZ", "18.442")}</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">对接盒子大小:</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700 mt-1">
                        X: {getParam("sizeX", "22.500")}, Y: {getParam("sizeY", "22.500")}, Z: {getParam("sizeZ", "22.500")} Å
                      </span>
                    </div>

                    {/* Right side */}
                    <div className="grid grid-cols-12 gap-2 text-xs">
                      <span className="col-span-4 text-slate-500">最大能差 (Energy):</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700">{getParam("energyRange", "4.0")} kcal/mol</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">对接细致程度:</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700 mt-1">{getParam("exhaustiveness", "24")} (Exhaustiveness)</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">输出构象数 (Modes):</span>
                      <span className="col-span-8 font-mono font-medium text-slate-700 mt-1">{getParam("numModes", "12")}</span>
                      
                      <span className="col-span-4 text-slate-500 mt-1">计算种子数 (Seed):</span>
                      <span className="col-span-8 font-mono font-semibold text-[#02A1C8] mt-1">{getParam("seed", "888888")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Layout - Two Columns (Left ~40%, Right ~60%) */}
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* Left Side: Results Table (col-span-5, ~40% width) */}
                <div className="col-span-5 space-y-4">
                  <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white text-left">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100/70 py-3.5 px-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xs font-bold text-slate-800">对接筛选结果</CardTitle>
                        <CardDescription className="text-[10px] text-slate-400 mt-0.5">
                          按结合评分(kcal/mol)由低到高排序，共 500 个候选。
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => triggerToast("已导出全量配体筛选排名 CSV 文件")}
                        className="h-7 text-[10px] font-bold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer gap-1 px-2.5 shrink-0"
                      >
                        <Download className="w-3 h-3 text-[#02A1C8]" />
                        导出排名
                      </Button>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="p-2.5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-2">
                        <Input 
                          placeholder="搜索配体名称..." 
                          className="h-7 text-xs bg-white border-slate-200"
                        />
                        <select className="h-7 text-xs bg-white border border-slate-200 rounded-md px-2 text-slate-600 focus:outline-none">
                          <option>全部评分</option>
                          <option>&lt; -9.0 kcal/mol</option>
                          <option>&lt; -8.0 kcal/mol</option>
                        </select>
                      </div>

                      <div className="max-h-[640px] overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-slate-50/80 text-slate-500 sticky top-0 z-10 shadow-2xs">
                            <TableRow className="border-b border-slate-100">
                              <TableHead className="text-slate-500 font-bold text-[11px] h-8 w-12 text-center">排名</TableHead>
                              <TableHead className="text-slate-500 font-bold text-[11px] h-8">配体名称</TableHead>
                              <TableHead className="text-slate-500 font-bold text-[11px] h-8 text-center">Vina评分</TableHead>
                              <TableHead className="text-slate-500 font-bold text-[11px] h-8 text-center">Pose数</TableHead>
                              <TableHead className="text-slate-500 font-bold text-[11px] h-8 text-center">RMSD</TableHead>
                              <TableHead className="text-slate-500 font-bold text-[11px] h-8 text-right pr-3">状态</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getMockResultsForTask(selectedTask.id).map((result) => {
                              const isCurrent = selectedResult?.ligandName === result.ligandName;
                              return (
                                <TableRow 
                                  key={result.rank}
                                  className={cn(
                                    "text-xs border-b border-slate-100 transition-colors cursor-pointer select-none",
                                    isCurrent 
                                      ? "bg-cyan-50/80 font-bold text-[#02A1C8] border-l-4 border-[#02A1C8]" 
                                      : "hover:bg-slate-50/60 text-slate-700"
                                  )}
                                  onClick={() => {
                                    setSelectedResult(result);
                                    setSelectedConfIndex(1);
                                  }}
                                >
                                  <TableCell className="font-mono text-center py-2.5 text-slate-500">
                                    {result.rank}
                                  </TableCell>
                                  <TableCell className="font-mono font-bold py-2.5">
                                    {result.ligandName}
                                  </TableCell>
                                  <TableCell className="text-center font-mono font-bold text-rose-600 py-2.5">
                                    {result.bindingAffinity.toFixed(1)}
                                  </TableCell>
                                  <TableCell className="text-center font-mono py-2.5 text-slate-500">
                                    {result.conformations?.length || 12}
                                  </TableCell>
                                  <TableCell className="text-center font-mono text-slate-400 text-[10px] py-2.5">
                                    {result.rmsdLb.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right pr-3 py-2.5">
                                    <span className="inline-flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                      已完成
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side: Interactive 3D Viewer & Details Tabs (col-span-7, ~60% width) */}
                <div className="col-span-7 sticky top-4 space-y-4 text-left">
                  {selectedResult ? (
                    <div className="space-y-4">
                      {(() => {
                        const activeConf = selectedResult.conformations?.find(c => c.index === selectedConfIndex) || {
                          index: selectedConfIndex,
                          bindingAffinity: selectedResult.bindingAffinity,
                          rmsdLb: selectedResult.rmsdLb,
                          rmsdUb: selectedResult.rmsdUb,
                          pdbqtContent: selectedResult.pdbqtContent,
                          pdbqtFileName: selectedResult.pdbqtFileName
                        };

                        return (
                          <>
                            {/* 3D Viewer Component - Fixed height 520px */}
                            <Docking3DViewer 
                              receptorPdb={getReceptorPdb(selectedTask?.id)}
                              receptorName={selectedTask?.receptor || "receptor_egfr.pdbqt"}
                              pdbqtContent={activeConf.pdbqtContent} 
                              ligandName={selectedResult.ligandName} 
                              rank={selectedResult.rank}
                              conformations={selectedResult.conformations}
                              selectedConfIndex={selectedConfIndex}
                              onConfIndexChange={setSelectedConfIndex}
                              bindingAffinity={activeConf.bindingAffinity}
                              rmsdLb={activeConf.rmsdLb}
                              rmsdUb={activeConf.rmsdUb}
                              onToast={triggerToast}
                              dockingBox={{
                                centerX: parseFloat(getParam("centerX", "31.254")),
                                centerY: parseFloat(getParam("centerY", "-1.894")),
                                centerZ: parseFloat(getParam("centerZ", "18.442")),
                                sizeX: parseFloat(getParam("sizeX", "22.500")),
                                sizeY: parseFloat(getParam("sizeY", "22.500")),
                                sizeZ: parseFloat(getParam("sizeZ", "22.500"))
                              }}
                              onDownloadPose={() => {
                                const blob = new Blob([activeConf.pdbqtContent], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${selectedResult.ligandName}_pose${selectedConfIndex}.pdbqt`;
                                a.click();
                                URL.revokeObjectURL(url);
                                triggerToast(`已成功下载 ${selectedResult.ligandName} Pose ${selectedConfIndex} (.pdbqt)`);
                              }}
                              onDownloadComplex={() => {
                                const complexPdb = generateComplexPdb(getReceptorPdb(selectedTask?.id), activeConf.pdbqtContent, selectedResult.ligandName, selectedConfIndex);
                                const blob = new Blob([complexPdb], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `Complex_${selectedTask?.receptor || 'receptor'}_${selectedResult.ligandName}_pose${selectedConfIndex}.pdb`;
                                a.click();
                                URL.revokeObjectURL(url);
                                triggerToast(`已成功导出受体-配体复合物结构 (.pdb)`);
                              }}
                            />

                            {/* Details Tabs Navigation Below 3D Viewer */}
                            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                              <div className="flex items-center border-b border-slate-100 bg-slate-50/70 px-4">
                                <button
                                  type="button"
                                  onClick={() => setActiveDetailsTab('conformation')}
                                  className={cn(
                                    "px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5",
                                    activeDetailsTab === 'conformation'
                                      ? "border-[#02A1C8] text-[#02A1C8] bg-white"
                                      : "border-transparent text-slate-500 hover:text-slate-800"
                                  )}
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  构象信息
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setActiveDetailsTab('pocket')}
                                  className={cn(
                                    "px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5",
                                    activeDetailsTab === 'pocket'
                                      ? "border-[#02A1C8] text-[#02A1C8] bg-white"
                                      : "border-transparent text-slate-500 hover:text-slate-800"
                                  )}
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  口袋残基 (4 Å)
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setActiveDetailsTab('params')}
                                  className={cn(
                                    "px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5",
                                    activeDetailsTab === 'params'
                                      ? "border-[#02A1C8] text-[#02A1C8] bg-white"
                                      : "border-transparent text-slate-500 hover:text-slate-800"
                                  )}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  文件与参数
                                </button>
                              </div>

                              <CardContent className="p-4 text-xs text-slate-700">
                                {/* Tab 1: 构象信息 */}
                                {activeDetailsTab === 'conformation' && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="text-[10px] text-slate-400">结合评分 (Vina Score)</div>
                                        <div className="text-base font-bold font-mono text-rose-600 mt-1">
                                          {activeConf.bindingAffinity.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kcal/mol</span>
                                        </div>
                                      </div>

                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="text-[10px] text-slate-400">RMSD Lower Bound</div>
                                        <div className="text-base font-bold font-mono text-slate-700 mt-1">
                                          {activeConf.rmsdLb.toFixed(2)} <span className="text-xs text-slate-500 font-normal">Å</span>
                                        </div>
                                      </div>

                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="text-[10px] text-slate-400">RMSD Upper Bound</div>
                                        <div className="text-base font-bold font-mono text-slate-700 mt-1">
                                          {activeConf.rmsdUb.toFixed(2)} <span className="text-xs text-slate-500 font-normal">Å</span>
                                        </div>
                                      </div>

                                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="text-[10px] text-slate-400">当前构象 Mode</div>
                                        <div className="text-base font-bold font-mono text-[#02A1C8] mt-1">
                                          Pose {selectedConfIndex} / {selectedResult.conformations?.length || 12}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-lg text-slate-600 text-[11px] leading-relaxed">
                                      <span className="font-bold text-[#02A1C8]">提示：</span>
                                      结合评分为 AutoDock Vina 评分函数计算输出，数值越负表示结合亲和力越强，不等同于实验结合自由能。
                                    </div>
                                  </div>
                                )}

                                {/* Tab 2: 口袋残基 */}
                                {activeDetailsTab === 'pocket' && (
                                  <div className="space-y-3">
                                    <div className="text-[11px] text-slate-500">
                                      配体 <span className="font-bold text-slate-800 font-mono">{selectedResult.ligandName}</span> 4 Å 范围内的受体口袋结合残基：
                                    </div>

                                    <Table className="border border-slate-100 rounded-lg overflow-hidden">
                                      <TableHeader className="bg-slate-50">
                                        <TableRow className="border-b border-slate-100 text-[10px]">
                                          <TableHead className="h-7 text-slate-500 font-bold">链</TableHead>
                                          <TableHead className="h-7 text-slate-500 font-bold">残基名称</TableHead>
                                          <TableHead className="h-7 text-slate-500 font-bold text-center">残基编号</TableHead>
                                          <TableHead className="h-7 text-slate-500 font-bold text-right pr-4">与配体最近距离</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {[
                                          { chain: 'A', name: 'LEU', seq: 718, dist: 2.84 },
                                          { chain: 'A', name: 'VAL', seq: 726, dist: 3.12 },
                                          { chain: 'A', name: 'ALA', seq: 743, dist: 3.45 },
                                          { chain: 'A', name: 'MET', seq: 790, dist: 3.28 },
                                          { chain: 'A', name: 'LEU', seq: 844, dist: 2.95 },
                                          { chain: 'A', name: 'THR', seq: 854, dist: 3.61 }
                                        ].map((res, idx) => (
                                          <TableRow key={idx} className="border-b border-slate-50 text-xs">
                                            <TableCell className="font-mono text-slate-500 py-1.5">{res.chain}</TableCell>
                                            <TableCell className="font-bold text-emerald-600 py-1.5">{res.name}</TableCell>
                                            <TableCell className="font-mono text-center py-1.5">{res.seq}</TableCell>
                                            <TableCell className="font-mono text-right pr-4 font-bold text-slate-700 py-1.5">{res.dist.toFixed(2)} Å</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}

                                {/* Tab 3: 文件与参数 */}
                                {activeDetailsTab === 'params' && (
                                  <div className="space-y-4">
                                    {/* Downloads section */}
                                    <div className="space-y-2">
                                      <div className="text-xs font-bold text-slate-800">文件下载</div>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <button
                                          type="button"
                                          onClick={() => triggerToast(`已开始下载受体文件 (${selectedTask?.receptor || "receptor_egfr.pdbqt"})`)}
                                          className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between cursor-pointer transition-colors"
                                        >
                                          <div className="truncate pr-1">
                                            <div className="text-[10px] text-slate-400">受体结构</div>
                                            <div className="font-mono font-bold text-slate-700 truncate">{selectedTask?.receptor || "receptor_egfr.pdbqt"}</div>
                                          </div>
                                          <Download className="w-3.5 h-3.5 text-[#02A1C8] shrink-0" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const blob = new Blob([activeConf.pdbqtContent], { type: "text/plain" });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `${selectedResult.ligandName}_pose${selectedConfIndex}.pdbqt`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            triggerToast(`已成功下载 ${selectedResult.ligandName} Pose ${selectedConfIndex} (.pdbqt)`);
                                          }}
                                          className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left flex items-center justify-between cursor-pointer transition-colors"
                                        >
                                          <div className="truncate pr-1">
                                            <div className="text-[10px] text-slate-400">选中 Pose 构象</div>
                                            <div className="font-mono font-bold text-slate-700 truncate">{selectedResult.ligandName}_pose{selectedConfIndex}.pdbqt</div>
                                          </div>
                                          <Download className="w-3.5 h-3.5 text-[#02A1C8] shrink-0" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const complexPdb = generateComplexPdb(getReceptorPdb(selectedTask?.id), activeConf.pdbqtContent, selectedResult.ligandName, selectedConfIndex);
                                            const blob = new Blob([complexPdb], { type: "text/plain" });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `Complex_${selectedTask?.receptor || 'receptor'}_${selectedResult.ligandName}_pose${selectedConfIndex}.pdb`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            triggerToast(`已成功导出受体-配体复合物结构 (.pdb)`);
                                          }}
                                          className="p-2.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg text-left flex items-center justify-between cursor-pointer transition-colors"
                                        >
                                          <div className="truncate pr-1">
                                            <div className="text-[10px] text-[#02A1C8]">复合物结构</div>
                                            <div className="font-mono font-bold text-slate-800 truncate">Complex.pdb</div>
                                          </div>
                                          <DownloadCloud className="w-3.5 h-3.5 text-[#02A1C8] shrink-0" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Parameter Summary */}
                                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-800">对接网格盒子 (Grid Box)</div>
                                        <div className="text-[11px] font-mono text-slate-500 space-y-0.5">
                                          <div>Center: X={getParam("centerX", "31.254")}, Y={getParam("centerY", "-1.894")}, Z={getParam("centerZ", "18.442")}</div>
                                          <div>Size: X={getParam("sizeX", "22.500")}, Y={getParam("sizeY", "22.500")}, Z={getParam("sizeZ", "22.500")} Å</div>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-800">Vina 运行参数</div>
                                        <div className="text-[11px] font-mono text-slate-500 space-y-0.5">
                                          <div>Exhaustiveness: {getParam("exhaustiveness", "24")} | CPU: {getParam("cpu", "16")}</div>
                                          <div>Energy Range: {getParam("energyRange", "4.0")} kcal/mol | Seed: {getParam("seed", "888888")}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Folded PDBQT Source Accordion */}
                                    <div className="pt-2 border-t border-slate-100">
                                      <button
                                        type="button"
                                        onClick={() => setIsPdbqtCodeExpanded(prev => !prev)}
                                        className="flex items-center justify-between w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 font-bold text-xs cursor-pointer border border-slate-200 transition-colors"
                                      >
                                        <span className="flex items-center gap-2">
                                          <FileText className="w-3.5 h-3.5 text-[#02A1C8]" />
                                          <span>PDBQT 结构数据源码 ({activeConf.pdbqtFileName})</span>
                                        </span>
                                        {isPdbqtCodeExpanded ? (
                                          <ChevronUp className="w-4 h-4 text-slate-400" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-slate-400" />
                                        )}
                                      </button>

                                      {isPdbqtCodeExpanded && (
                                        <div className="mt-2 bg-slate-900 p-3 rounded-lg text-[11px] font-mono text-slate-300 h-48 overflow-y-auto leading-relaxed select-text border border-slate-800">
                                          {activeConf.pdbqtContent.split('\n').map((line, i) => (
                                            <div key={i} className="flex gap-4 hover:bg-slate-800/50 px-1">
                                              <span className="text-slate-600 text-right select-none w-6 shrink-0">{i + 1}</span>
                                              <span className={cn(
                                                line.startsWith('REMARK') ? "text-slate-500" :
                                                line.startsWith('ATOM') ? "text-emerald-400" :
                                                line.startsWith('ROOT') || line.startsWith('ENDROOT') ? "text-amber-400 font-bold" :
                                                "text-slate-300"
                                              )}>
                                                {line}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <Card className="border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400 rounded-xl">
                      <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs">请在左侧列表中点击选择要预览的配体构象数据</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* History view styled exactly corresponding to the rest of the application */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-sm font-bold text-slate-800">历史推理任务</h2>
                  <p className="text-xs text-slate-400 mt-1">查看过往提交的 AutoDock Vina 虚拟筛选任务及其状态</p>
                </div>
                <Input placeholder="搜索任务名称..." className="w-64 h-9 text-xs" />
              </div>

              <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-slate-50/70 text-slate-400">
                    <TableRow className="border-b border-slate-100">
                      <TableHead className="text-slate-500 font-bold text-xs h-10">任务 ID</TableHead>
                      <TableHead className="text-slate-500 font-bold text-xs h-10">任务名称</TableHead>
                      <TableHead className="text-slate-500 font-bold text-xs h-10">受体分子</TableHead>
                      <TableHead className="text-slate-500 font-bold text-xs h-10">配体分子数</TableHead>
                      <TableHead className="text-slate-500 font-bold text-xs h-10">状态</TableHead>
                      <TableHead className="text-slate-500 font-bold text-xs h-10">提交时间</TableHead>
                      <TableHead className="text-slate-500 font-bold text-xs h-10 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyTasks.map(item => (
                      <TableRow key={item.id} className="text-xs hover:bg-slate-50/20 border-b border-slate-50 text-left">
                        <TableCell className="font-mono text-slate-500 font-medium">{item.id}</TableCell>
                        <TableCell className="font-bold text-slate-700">{item.name}</TableCell>
                        <TableCell className="font-mono text-slate-500">{item.receptor}</TableCell>
                        <TableCell className="font-mono font-bold text-slate-600">{item.ligandsCount} 个</TableCell>
                        <TableCell>
                          {item.status === 'completed' && (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-none text-[10px] px-2 py-0.5 rounded font-medium hover:bg-emerald-50">已完成</Badge>
                          )}
                          {item.status === 'running' && (
                            <Badge className="bg-blue-50 text-[#02A1C8] border border-blue-200 shadow-none text-[10px] px-2 py-0.5 rounded font-medium hover:bg-blue-50 animate-pulse">计算中</Badge>
                          )}
                          {item.status === 'failed' && (
                            <Badge className="bg-rose-50 text-rose-600 border border-rose-200 shadow-none text-[10px] px-2 py-0.5 rounded font-medium hover:bg-rose-50">计算失败</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono">{item.date}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs text-[#02A1C8] hover:text-[#017ea0] flex items-center gap-1 font-bold cursor-pointer ml-auto"
                            disabled={item.status === 'running'}
                            onClick={() => {
                              if (item.status === 'completed') {
                                setSelectedTask(item);
                                const results = getMockResultsForTask(item.id);
                                if (results.length > 0) {
                                  setSelectedResult(results[0]);
                                  setSelectedConfIndex(1);
                                  setExpandedLigands(new Set());
                                }
                              } else if (item.status === 'failed') {
                                triggerToast("该任务计算失败，无分子对接结果数据。");
                              }
                            }}
                          >
                            查看详情 <ChevronRight className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
