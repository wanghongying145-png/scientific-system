import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Download, 
  RotateCcw, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Beaker, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Database,
  Info,
  ChevronRight,
  Copy,
  Check,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Molecule2DView: React.FC<{ smiles: string }> = ({ smiles }) => {
  if (smiles === "CNC(=O)C1=C(C)C=C(C)C(=C1)C2=NC=NC3=C2C=NN3") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* Pyrimidine */}
        <path d="M 120,120 L 150,103 L 180,120 L 180,154 L 150,171 L 120,154 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 125,123 L 148,110" stroke="#475569" strokeWidth="2" />
        <path d="M 175,123 L 175,151" stroke="#475569" strokeWidth="2" />
        <rect x="114" y="114" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="120" y="124" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="174" y="148" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="180" y="158" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* Fused Triazole */}
        <path d="M 120,120 L 95,110 L 80,137 L 95,164 L 120,154" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 98,115 L 86,134" stroke="#475569" strokeWidth="2" />
        <rect x="74" y="131" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="80" y="141" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* Connection to Central Benzene */}
        <path d="M 180,137 L 220,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />

        {/* Central Benzene Ring */}
        <path d="M 220,137 L 240,102 L 280,102 L 300,137 L 280,172 L 240,172 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 243,107 L 277,107" stroke="#475569" strokeWidth="2" />
        <path d="M 295,137 L 279,165" stroke="#475569" strokeWidth="2" />
        <path d="M 227,137 L 243,165" stroke="#475569" strokeWidth="2" />

        {/* Substituents */}
        <path d="M 240,102 L 225,76" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="225" y="71" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>
        <path d="M 280,172 L 295,198" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="295" y="208" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>

        {/* Carbonyl and Methylcarbamoyl */}
        <path d="M 300,137 L 335,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 315,137 L 315,115" stroke="#475569" strokeWidth="2" />
        <path d="M 319,137 L 319,115" stroke="#475569" strokeWidth="2" />
        <text x="317" y="110" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>

        <path d="M 335,137 L 350,152" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="344" y="146" width="18" height="12" fill="#f8fafc" rx="2" />
        <text x="353" y="156" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>
        <path d="M 364,152 L 385,152" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="392" y="156" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>
      </svg>
    );
  }

  if (smiles === "CC(=O)NC1=CC=C(S1)C2=NC=NC3=C2C=CN3C4CCNCC4") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* Thiophene ring */}
        <path d="M 70,137 L 90,110 L 125,120 L 125,154 L 90,164 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 92,115 L 121,124" stroke="#475569" strokeWidth="2" />
        <rect x="64" y="131" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="70" y="141" fill="#d97706" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">S</text>

        {/* Amide connection CC(=O)NH- */}
        <path d="M 90,110 L 70,95" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="60" y="90" width="18" height="12" fill="#f8fafc" rx="2" />
        <text x="69" y="100" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>

        <path d="M 60,95 L 40,105" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 38,105 L 38,125" stroke="#475569" strokeWidth="2" />
        <path d="M 42,105 L 42,125" stroke="#475569" strokeWidth="2" />
        <text x="40" y="135" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
        <path d="M 40,105 L 20,95" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="12" y="94" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>

        {/* Thiophene connection to Pyrazolopyrimidine */}
        <path d="M 125,137 L 165,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />

        {/* Pyrimidine */}
        <path d="M 165,137 L 185,102 L 225,102 L 245,137 L 225,172 L 185,172 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 222,107 L 238,137" stroke="#475569" strokeWidth="2" />
        <rect x="179" y="96" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="185" y="106" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="219" y="166" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="225" y="176" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* Pyrrole Fused */}
        <path d="M 225,102 L 255,92 L 270,117 L 245,137" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="249" y="86" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="255" y="96" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* Piperidine connection */}
        <path d="M 255,92 L 285,67" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 285,67 L 315,67 L 330,92 L 315,117 L 285,117 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="324" y="86" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="330" y="96" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <text x="345" y="96" fill="#1e293b" fontSize="10" fontFamily="monospace">H</text>
      </svg>
    );
  }

  if (smiles === "FC1=CC=CC2=C1C(=NC=N2)C3=C4C(=C(C=C3)O)C=CN4CNC") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* Fluorine benzene portion */}
        <path d="M 65,137 L 45,102 L 75,47 L 115,47 L 135,102 L 105,137 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 49,102 L 72,52" stroke="#475569" strokeWidth="2" />
        <path d="M 111,52 L 129,102" stroke="#475569" strokeWidth="2" />
        <path d="M 72,132 L 101,132" stroke="#475569" strokeWidth="2" />

        {/* Fluorine label */}
        <path d="M 45,102 L 20,102" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="11" y="96" width="10" height="12" fill="#f8fafc" rx="2" />
        <text x="16" y="106" fill="#0d9488" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">F</text>

        {/* Pyrimidine ring fused */}
        <path d="M 115,47 L 145,47 L 160,82 L 145,117 L 105,117" stroke="#475569" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <rect x="139" y="41" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="145" y="51" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="139" y="111" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="145" y="121" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* Connection to Indole conjugate */}
        <path d="M 160,82 L 200,82" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />

        {/* Indole conjugate benzene ring */}
        <path d="M 200,82 L 220,47 L 260,47 L 280,82 L 260,117 L 220,117 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 223,52 L 257,52" stroke="#475569" strokeWidth="2" />
        <path d="M 257,112 L 223,112" stroke="#475569" strokeWidth="2" />

        {/* Hydroxyl group */}
        <path d="M 220,47 L 205,21" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="205" y="16" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">OH</text>

        {/* Pyrrole Fused */}
        <path d="M 260,117 L 290,127 L 305,102 L 280,82" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="284" y="121" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="290" y="131" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* CNC side chain */}
        <path d="M 290,131 L 320,146" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="314" y="140" width="18" height="12" fill="#f8fafc" rx="2" />
        <text x="323" y="150" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>
        <path d="M 332,146 L 355,136" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="365" y="136" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>
      </svg>
    );
  }

  if (smiles === "COC1=CC(=C2C(=C1)C(C#CC3=CC=C(C=C3)F)=NC=N2)OCCCN4CCOCC4") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* central quinazoline */}
        <path d="M 140,110 L 160,75 L 200,75 L 220,110 L 200,145 L 160,145 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 163,80 L 197,80" stroke="#475569" strokeWidth="2" />
        <path d="M 215,110 L 203,131" stroke="#475569" strokeWidth="2" />

        {/* Methoxy substituent */}
        <path d="M 160,75 L 145,50" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="139" y="44" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="145" y="54" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
        <path d="M 139,44 L 120,38" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="110" y="38" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>

        {/* Lysine-like links */}
        <path d="M 220,110 L 250,110 L 265,145 L 250,180 L 200,180" stroke="#475569" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <rect x="244" y="104" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="250" y="114" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="244" y="174" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="250" y="184" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* Triple bond */}
        <path d="M 265,145 L 295,145" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 270,141 L 290,141" stroke="#475569" strokeWidth="2" />
        <path d="M 270,149 L 290,149" stroke="#475569" strokeWidth="2" />

        {/* Fluorophenyl ring */}
        <path d="M 295,145 L 315,120 L 345,120 L 360,145 L 345,170 L 315,170 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 318,125 L 342,125" stroke="#475569" strokeWidth="2" />
        <path d="M 355,145 L 342,165" stroke="#475569" strokeWidth="2" />
        <path d="M 360,145 L 380,145" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="375" y="139" width="10" height="12" fill="#f8fafc" rx="2" />
        <text x="380" y="149" fill="#0d9488" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">F</text>

        {/* Propoxy-Morpholine */}
        <path d="M 160,145 L 140,165" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="130" y="159" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="136" y="169" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
        <path d="M 130,165 L 100,165 L 85,185" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />

        {/* Morpholine */}
        <path d="M 85,185 L 65,170 L 45,185 L 45,210 L 65,225 L 85,210 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="79" y="179" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="85" y="189" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="39" y="204" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="45" y="214" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
      </svg>
    );
  }

  if (smiles === "CN1CCN(CC1)CC(=O)C2=C(O)C=C(O)C(=C2)C3=NC(=CS3)C4=CC=CC=C4") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* Phenyl Group */}
        <path d="M 330,137 L 350,102 L 380,102 L 395,137 L 380,172 L 350,172 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 353,107 L 377,107" stroke="#475569" strokeWidth="2" />
        <path d="M 390,137 L 377,167" stroke="#475569" strokeWidth="2" />

        {/* Thiazole Ring */}
        <path d="M 330,137 L 300,127 L 285,152 L 305,172 L 320,154" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 300,132 L 292,148" stroke="#475569" strokeWidth="2" />
        <rect x="294" y="121" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="300" y="131" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="299" y="166" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="305" y="176" fill="#d97706" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">S</text>

        {/* Central phenyl with hydroxyl groups */}
        <path d="M 285,152 L 245,152" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 245,152 L 225,117 L 185,117 L 165,152 L 185,187 L 225,187 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 222,122 L 188,122" stroke="#475569" strokeWidth="2" />
        <path d="M 172,152 L 188,182" stroke="#475569" strokeWidth="2" />

        {/* Hydroxyls */}
        <path d="M 225,117 L 235,97" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="235" y="92" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">OH</text>
        <path d="M 185,187 L 175,207" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="175" y="217" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">OH</text>

        {/* Carbonyl bridge CC(=O)- */}
        <path d="M 165,152 L 135,152" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 148,152 L 148,132" stroke="#475569" strokeWidth="2" />
        <path d="M 152,152 L 152,132" stroke="#475569" strokeWidth="2" />
        <text x="150" y="127" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>

        {/* Piperazine Ring with N-Methyl */}
        <path d="M 135,152 L 115,152" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 115,152 L 95,137 L 65,137 L 45,152 L 65,167 L 95,167 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="109" y="146" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="115" y="156" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="39" y="146" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="45" y="156" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <path d="M 45,152 L 20,152" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="12" y="156" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>
      </svg>
    );
  }

  // Fragment Mode 2D structures
  if (smiles === "CC1=NN(C2=CC=C(F)C=C2)C(=O)C1=C(C*)OC(=O)NC") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* Fluorophenyl ring */}
        <path d="M 60,137 L 80,102 L 115,102 L 130,137 L 115,172 L 80,172 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 83,107 L 112,107" stroke="#475569" strokeWidth="2" />
        <path d="M 125,137 L 112,167" stroke="#475569" strokeWidth="2" />
        <path d="M 60,137 L 35,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="26" y="131" width="10" height="12" fill="#f8fafc" rx="2" />
        <text x="31" y="141" fill="#0d9488" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">F</text>

        {/* Pyrazolone ring with methyl */}
        <path d="M 130,137 L 160,127 L 180,147 L 165,177 L 145,167" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="154" y="121" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="160" y="131" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="139" y="161" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="145" y="171" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <path d="M 145,171 L 130,195" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="125" y="205" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>

        {/* Double bond O on Pyrazolone */}
        <path d="M 163,177 L 175,197" stroke="#475569" strokeWidth="2" />
        <path d="M 167,175 L 179,195" stroke="#475569" strokeWidth="2" />
        <text x="182" y="207" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>

        {/* Scaffold Star connection * */}
        <path d="M 180,147 L 220,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="214" y="131" width="12" height="12" fill="#fff7ed" rx="2" stroke="#ea580c" strokeWidth="1" />
        <text x="220" y="141" fill="#ea580c" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">*</text>

        {/* Carbamate chain -OC(=O)NHCH3 */}
        <path d="M 180,147 L 195,117" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="189" y="111" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="195" y="121" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
        <path d="M 195,117 L 225,117" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 213,117 L 213,97" stroke="#475569" strokeWidth="2" />
        <path d="M 217,117 L 217,97" stroke="#475569" strokeWidth="2" />
        <text x="215" y="92" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>

        <path d="M 225,117 L 240,132" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="234" y="126" width="18" height="12" fill="#f8fafc" rx="2" />
        <text x="243" y="136" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>
        <path d="M 252,132 L 275,122" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="285" y="122" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>
      </svg>
    );
  }

  if (smiles === "O=C1NC=CC2=C1C(=C(C*)S2)C3=CC=CC=C3F") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* Fluorophenyl on Right */}
        <path d="M 280,137 L 300,102 L 335,102 L 350,137 L 335,172 L 300,172 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 303,107 L 332,107" stroke="#475569" strokeWidth="2" />
        <path d="M 332,167 L 303,167" stroke="#475569" strokeWidth="2" />
        <path d="M 350,137 L 375,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="369" y="131" width="10" height="12" fill="#f8fafc" rx="2" />
        <text x="374" y="141" fill="#0d9488" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">F</text>

        {/* Central Thiophene Fused */}
        <path d="M 280,137 L 245,117 L 210,137 L 225,167 L 260,167" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="219" y="161" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="225" y="171" fill="#d97706" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">S</text>
        <path d="M 245,122 L 217,137" stroke="#475569" strokeWidth="2" />

        {/* Star Connector * */}
        <path d="M 245,117 L 245,77" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="239" y="71" width="12" height="12" fill="#fff7ed" rx="2" stroke="#ea580c" strokeWidth="1" />
        <text x="245" y="81" fill="#ea580c" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">*</text>

        {/* Fused Pyridone Ring */}
        <path d="M 210,137 L 175,137 L 155,102 L 175,67 L 200,67" stroke="#475569" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <rect x="169" y="131" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="175" y="141" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>

        <path d="M 155,102 L 130,102" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 134,98 L 115,98" stroke="#475569" strokeWidth="2" />
        <path d="M 134,106 L 115,106" stroke="#475569" strokeWidth="2" />
        <text x="105" y="106" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
      </svg>
    );
  }

  if (smiles === "CCNC(=O)NC1=C(*)C=C2C(=C1)C(=O)NCCN2C") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        <text x="20" y="85" fill="#1e293b" fontSize="10" fontFamily="monospace">CH₃CH₂</text>
        <path d="M 50,81 L 70,96" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="64" y="90" width="18" height="12" fill="#f8fafc" rx="2" />
        <text x="73" y="100" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>

        <path d="M 82,96 L 112,96" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 95,96 L 95,76" stroke="#475569" strokeWidth="2" />
        <path d="M 99,96 L 99,76" stroke="#475569" strokeWidth="2" />
        <text x="97" y="71" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>

        <path d="M 112,96 L 127,111" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="121" y="105" width="18" height="12" fill="#f8fafc" rx="2" />
        <text x="130" y="115" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>

        {/* Benzene fused core */}
        <path d="M 139,115 L 175,115 L 195,80 L 235,80 L 255,115 L 235,150 L 195,150 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 198,85 L 232,85" stroke="#475569" strokeWidth="2" />
        <path d="M 250,115 L 238,135" stroke="#475569" strokeWidth="2" />

        {/* Star connection * */}
        <path d="M 195,150 L 175,175" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="169" y="169" width="12" height="12" fill="#fff7ed" rx="2" stroke="#ea580c" strokeWidth="1" />
        <text x="175" y="179" fill="#ea580c" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">*</text>

        {/* Diazepinone fused on right */}
        <path d="M 235,80 L 265,65" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 265,65 L 295,75 T 315,105 T 295,135 L 235,150" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="289" y="69" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="295" y="79" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH</text>
        <path d="M 255,120 L 270,140" stroke="#475569" strokeWidth="2" />
        <path d="M 259,118 L 274,138" stroke="#475569" strokeWidth="2" />
        <text x="278" y="150" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>
      </svg>
    );
  }

  if (smiles === "CC1=NC=C(O1)C(*)=NN2C3=CC=C(C=C3)C(=O)N") {
    return (
      <svg viewBox="0 0 400 240" className="w-full h-full max-h-56">
        {/* Oxazole ring on Left */}
        <path d="M 50,137 L 70,102 L 105,112 L 105,162 L 70,172 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 72,107 L 100,117" stroke="#475569" strokeWidth="2" />
        <rect x="99" y="106" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="105" y="116" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
        <rect x="64" y="166" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="70" y="176" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>

        {/* Methyl on oxazole */}
        <path d="M 50,137 L 25,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <text x="15" y="141" fill="#1e293b" fontSize="10" textAnchor="middle" fontFamily="monospace">CH₃</text>

        {/* Connection with Star * */}
        <path d="M 105,137 L 135,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 135,137 L 135,100" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <rect x="129" y="94" width="12" height="12" fill="#fff7ed" rx="2" stroke="#ea580c" strokeWidth="1" />
        <text x="135" y="104" fill="#ea580c" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">*</text>

        {/* Diazo double-bond linkage =N-N */}
        <path d="M 135,137 L 165,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 140,133 L 160,133" stroke="#475569" strokeWidth="2" />
        <rect x="159" y="131" width="12" height="12" fill="#f8fafc" rx="2" />
        <text x="165" y="141" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>

        {/* Central Phenyl */}
        <path d="M 165,137 L 195,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 195,137 L 215,102 L 250,102 L 270,137 L 250,172 L 215,172 Z" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 218,107 L 247,107" stroke="#475569" strokeWidth="2" />
        <path d="M 247,167 L 218,167" stroke="#475569" strokeWidth="2" />

        {/* Amide terminal -C(=O)NH2 */}
        <path d="M 270,137 L 305,137" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 285,137 L 285,117" stroke="#475569" strokeWidth="2" />
        <path d="M 289,137 L 289,117" stroke="#475569" strokeWidth="2" />
        <text x="287" y="112" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O</text>

        <rect x="299" y="131" width="24" height="12" fill="#f8fafc" rx="2" />
        <text x="311" y="141" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NH₂</text>
      </svg>
    );
  }

  // Fallback molecular visual graph
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-150">
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-slate-400 fill-none mb-2">
        <polygon points="50,20 80,35 80,70 50,85 20,70 20,35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="50" y1="20" x2="50" y2="45" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="50" cy="45" r="4" className="fill-slate-100 stroke-slate-500" strokeWidth="1.5" />
        <circle cx="50" cy="20" r="4" className="fill-[#02A1C8] stroke-[#02A1C8]" strokeWidth="1.5" />
        <circle cx="80" cy="35" r="4" className="fill-slate-100 stroke-slate-500" strokeWidth="1.5" />
        <circle cx="80" cy="70" r="4" className="fill-red-500 stroke-red-500" strokeWidth="1.5" />
      </svg>
      <span className="text-[10px] text-slate-400 tech-mono">SMILES Code: {smiles.substring(0, 10)}...</span>
    </div>
  );
};

interface ScaffoldHoppingResultProps {
  onBack: () => void;
  taskId?: string;
}

export const ScaffoldHoppingResult: React.FC<ScaffoldHoppingResultProps> = ({ onBack, taskId = "SH-20260420-001" }) => {
  const [selectedMolecule, setSelectedMolecule] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Determine mode based on task ID for demo purposes
  const isFragmentMode = taskId === "SH-20260419-002" || taskId === "SH-20260419-001";

  // Mock data for the results table - Auto Mode
  const autoResultsData = [
    { 
      rank: 1, 
      smiles: "CNC(=O)C1=C(C)C=C(C)C(=C1)C2=NC=NC3=C2C=NN3", 
      structure: "https://picsum.photos/seed/mol1/200/200", 
      score: 0.985, 
      dockingScore: -9.5,
      qed: 0.88, 
      sa: 1.8, 
      explanation: "核心骨架从咪唑并吡啶跃迁至三唑并嘧啶，极性表面积稍有增加，提升了血脑屏障通透性预测。" 
    },
    { 
      rank: 2, 
      smiles: "CC(=O)NC1=CC=C(S1)C2=NC=NC3=C2C=CN3C4CCNCC4", 
      structure: "https://picsum.photos/seed/mol2/200/200", 
      score: 0.942, 
      dockingScore: -8.9,
      qed: 0.82, 
      sa: 2.1, 
      explanation: "通过Bioisostere置换，将苯环替换为噻吩环，保留了关键氢键受体位点，增加了激酶选择性。" 
    },
    { 
      rank: 3, 
      smiles: "FC1=CC=CC2=C1C(=NC=N2)C3=C4C(=C(C=C3)O)C=CN4CNC", 
      structure: "https://picsum.photos/seed/mol3/200/200", 
      score: 0.856, 
      dockingScore: -8.4,
      qed: 0.76, 
      sa: 2.6, 
      explanation: "引入氮杂环替代原有的饱和环，改善了溶解度并维持了与靶标ATP结合口袋的疏水作用。" 
    },
    { 
      rank: 4, 
      smiles: "COC1=CC(=C2C(=C1)C(C#CC3=CC=C(C=C3)F)=NC=N2)OCCCN4CCOCC4", 
      structure: "https://picsum.photos/seed/mol4/200/200", 
      score: 0.789, 
      dockingScore: -7.9,
      qed: 0.69, 
      sa: 3.2, 
      explanation: "侧链末端基团的氟代修饰，有效阻断了代谢位点，预计可延长药物半衰期。" 
    },
    { 
      rank: 5, 
      smiles: "CN1CCN(CC1)CC(=O)C2=C(O)C=C(O)C(=C2)C3=NC(=CS3)C4=CC=CC=C4", 
      structure: "https://picsum.photos/seed/mol5/200/200", 
      score: 0.654, 
      dockingScore: -7.2,
      qed: 0.58, 
      sa: 3.8, 
      explanation: "骨架环系扩大，由于构像约束增强，可能提升对特定突变体的抑制活性。" 
    },
  ];

  // Mock data for the results table - Fragment Mode
  const fragmentResultsData = [
    { 
      rank: 1, 
      smiles: "CC1=NN(C2=CC=C(F)C=C2)C(=O)C1=C(C*)OC(=O)NC", 
      structure: "https://picsum.photos/seed/frag1/200/200", 
      score: 0.978, 
      dockingScore: -9.8,
      qed: 0.91, 
      sa: 1.5, 
      regionDescription: "针对输入的 [N:1]C(=O)C2=CC=CC=C2 片段，采用骨架库替换策略，将其替换为包含吡唑和吗啉环的复合片段，显著增强了与Met口袋的亲和力。" 
    },
    { 
      rank: 2, 
      smiles: "O=C1NC=CC2=C1C(=C(C*)S2)C3=CC=CC=C3F", 
      structure: "https://picsum.photos/seed/frag2/200/200", 
      score: 0.935, 
      dockingScore: -9.1,
      qed: 0.85, 
      sa: 2.0, 
      regionDescription: "将指定的苯酰胺基团替换为苯氧乙酰胺衍生物，改善了分子的脂溶性分发，并在活性测试中表现出更好的靶向稳定性。" 
    },
    { 
      rank: 3, 
      smiles: "CCNC(=O)NC1=C(*)C=C2C(=C1)C(=O)NCCN2C", 
      structure: "https://picsum.photos/seed/frag3/200/200", 
      score: 0.892, 
      dockingScore: -8.6,
      qed: 0.79, 
      sa: 2.4, 
      regionDescription: "替换区域引入了具由供氢能力的酰胺键，通过形成额外的关键盐桥作用，大幅提升了对BRAF V600E突变株的抑制效率。" 
    },
    { 
      rank: 4, 
      smiles: "CC1=NC=C(O1)C(*)=NN2C3=CC=C(C=C3)C(=O)N", 
      structure: "https://picsum.photos/seed/frag4/200/200", 
      score: 0.824, 
      dockingScore: -8.0,
      qed: 0.72, 
      sa: 2.9, 
      regionDescription: "采用Bioisostere替换策略，将末端酯基替换为恶二唑环，解决了原分子在血浆中代谢快、稳定性差的问题。" 
    },
  ];

  const resultsData = isFragmentMode ? fragmentResultsData : autoResultsData;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#0F172A] tracking-tight">骨架跃迁结果详情</h1>
              <Badge variant="outline" className="text-[10px] tech-mono border-indigo-200 text-indigo-600 font-bold bg-indigo-50/30">
                {taskId}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5 font-medium">
              <Activity className="w-3 h-3 text-emerald-500" />
              任务状态：执行成功 | 完成时间: 2026-04-20 14:30:22
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 tech-mono text-xs font-bold border-slate-200">
             <Download className="w-3.5 h-3.5 mr-2" />
             下载结果 CSV
          </Button>
          <Button className="h-9 tech-mono text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B]">
             重新发起预测
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-8 max-w-[1280px] mx-auto pb-32">
          
          {/* Module 1: Task Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-[3px] h-4 bg-[#02A1C8]" />
              <h2 className="text-xs font-black text-[#0F172A] tracking-tight">任务基础信息</h2>
            </div>
            
            <Card className="border border-slate-200/80 shadow-sm p-6 md:p-8 bg-white rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0.5">
                
                {/* Row 1 / Col 1 */}
                <div className="flex items-center justify-between py-3.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">任务名称</span>
                  <span className="text-xs font-bold text-slate-900">
                    {isFragmentMode ? "BRAF_Hopping_Fragment_Update" : "EGFR_Refinement_Auto_Hopping"}
                  </span>
                </div>
                
                {/* Row 1 / Col 2 */}
                <div className="flex items-center justify-between py-3.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">任务描述</span>
                  <span className="text-xs font-bold text-slate-900 max-w-[240px] md:max-w-[280px] lg:max-w-[360px] truncate block text-right" title={isFragmentMode ? "针对 BRAF 激酶抑制剂的关键结合片段进行SMARTS匹配替换。" : "针对 EGFR 靶点设计的 T790M 突变体抑制剂骨架进行自动跃迁优化。"}>
                    {isFragmentMode 
                      ? "针对 BRAF 激酶抑制剂的关键结合片段进行SMARTS" 
                      : "针对 EGFR 靶点设计的 T790M 突变体骨架跃迁"}
                  </span>
                </div>

                {/* Row 2 / Col 1 */}
                <div className="flex items-center justify-between py-3.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">参考分子smiles序列</span>
                  <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[200px] md:max-w-[240px] block text-right" title={isFragmentMode ? "CNC(=O)C1=C(C)C=C(C)C(=C1)C2=NC=NC3=C2C=NN3" : "COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4"}>
                    {isFragmentMode ? "CNC(=O)C1=C(C)C=C(C)C" : "COC1=C(C=C2C(=C1)N=CN=C2"}
                  </span>
                </div>

                {/* Row 2 / Col 2 */}
                <div className="flex items-center justify-between py-3.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">替换核心骨架</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {isFragmentMode ? "*c1ccccc1*" : "c1ccccc1"}
                  </span>
                </div>

                {/* Row 3 / Col 1 */}
                <div className="flex items-center justify-between py-3.5 md:border-b-0 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">生成分子样本数量</span>
                  <span className="text-xs font-bold text-slate-900">
                    {isFragmentMode ? "240" : "500"}
                  </span>
                </div>

                {/* Row 3 / Col 2 */}
                <div className="flex items-center justify-between py-3.5 border-b border-slate-100 md:border-b-0">
                  <span className="text-xs text-slate-500 font-medium">强化学习迭代步数</span>
                  <span className="text-xs font-bold text-slate-900">
                    {isFragmentMode ? "500 步" : "1000 步"}
                  </span>
                </div>

                {/* Row 4 / Col 1 */}
                <div className="flex items-center justify-between py-3.5">
                  <span className="text-xs text-slate-500 font-medium">QED类药性过滤阈值</span>
                  <span className="text-xs font-bold text-[#02A1C8]">
                    {isFragmentMode ? "≥ 0.60" : "≥ 0.50"}
                  </span>
                </div>

                {/* Remaining alignment item */}
                <div className="hidden md:flex py-3.5"></div>

              </div>
            </Card>
          </div>

          {/* Module 2: Candidate Molecule List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                 <h2 className="text-md font-black text-[#0F172A] tracking-tight">候选分子列表</h2>
                 <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-500 border-none font-bold text-[10px]">共计 {isFragmentMode ? '24' : '30'} 个分子</Badge>
               </div>
               <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input placeholder="搜索候选分子..." className="w-48 h-8 pl-9 text-[10px] tech-mono" />
                  </div>
                  <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    排序过滤
                  </Button>
               </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-black/[0.03] overflow-hidden bg-white rounded-xl">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">分子 SMILES 序列 / 模型重构说明</th>
                          
                          <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider w-24">QED</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider w-24">SA</th>
                          <th className="px-6 py-4 text-right text-[11px] font-black uppercase text-slate-400 tracking-wider w-48">操作（详情）</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                       {resultsData.map((item: any) => (
                          <tr key={item.rank} className="group hover:bg-slate-50/30 transition-all duration-200">
                             {/* 分子 SMILES 序列 */}
                             <td className="px-6 py-5">
                                <div className="flex items-start gap-3">
                                   <div className="flex flex-col gap-1 shrink-0 justify-center items-center mt-0.5">
                                      <span className="text-[10px] font-black text-slate-400 tech-mono flex items-center justify-center w-6 h-6 bg-slate-50 border border-slate-150 rounded-md">
                                         {item.rank.toString().padStart(2, '0')}
                                      </span>

                                   </div>
                                   
                                   <div className="flex flex-col gap-1.5 min-w-0 max-w-xl">
                                      <div className="flex items-center gap-1.5">
                                         <span 
                                            className="font-mono text-[11.5px] font-medium text-slate-800 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded select-all break-all cursor-text leading-relaxed truncate max-w-[340px] md:max-w-[420px]" 
                                            title={item.smiles}
                                         >
                                            {item.smiles}
                                         </span>
                                         <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-slate-400 hover:text-[#02A1C8] shrink-0"
                                            onClick={(e) => {
                                               e.stopPropagation();
                                               navigator.clipboard.writeText(item.smiles);
                                               setCopiedIndex(item.rank);
                                               setTimeout(() => setCopiedIndex(null), 2000);
                                            }}
                                         >
                                {copiedIndex === item.rank ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                             ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                             )}
                                          </Button>
                                       </div>
                                    </div>
                                 </div>
                              </td>

                              {/* QED */}
                              <td className="px-6 py-5">
                                 <span className="text-xs font-semibold font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 shadow-sm">
                                    {item.qed.toFixed(2)}
                                 </span>
                              </td>

                              {/* SA */}
                              <td className="px-6 py-5">
                                 <span className="text-xs font-semibold font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 shadow-sm">
                                    {item.sa.toFixed(2)}
                                 </span>
                              </td>

                              {/* 操作 (详情) */}
                              <td className="px-6 py-5 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <Button 
                                       variant="outline"
                                       size="sm"
                                       className="h-8 text-[11px] font-bold text-[#02A1C8] border-[#02A1C8]/25 bg-[#02A1C8]/5 hover:bg-[#02A1C8]/10 hover:border-[#02A1C8]/40 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                                       onClick={() => setSelectedMolecule(item)}
                                    >
                                       <Eye className="w-3.5 h-3.5" />
                                       详情
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex justify-center">
                  <Button variant="ghost" size="sm" className="text-[11px] text-slate-400 font-bold tech-mono hover:text-[#0F172A]">
                     加载更多候选分子 <RotateCcw className="w-3 h-3 ml-2" />
                  </Button>
               </div>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* 候选分子详情评估弹窗 (Popup Modal containing: SMILES at the top, Vector 2D visual layout below, metrics column) */}
      <Dialog open={!!selectedMolecule} onOpenChange={() => setSelectedMolecule(null)}>
        <DialogContent className="max-w-[500px] sm:max-w-[500px] w-full bg-white text-slate-900 border-[#02A1C8]/25 shadow-2xl rounded-2xl p-6 font-sans">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <Beaker className="w-5 h-5 text-[#02A1C8] animate-pulse" />
              候选分子详情评估 (Rank {selectedMolecule?.rank})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              基于强化学习与图神经网络生成的特定骨架替换分子，包含高精度理化指标预测。
            </DialogDescription>
          </DialogHeader>

          {selectedMolecule && (
            <div className="py-2.5 space-y-4">
              
              {/* 1. SMILES序列 (放在最上面) */}
              <div className="space-y-1.5 text-left bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SMILES 序列字符串</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMolecule.smiles);
                      setCopiedIndex(999);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    className="h-6 px-2 text-[10px] text-[#02A1C8] hover:bg-[#02A1C8]/5 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 999 ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        复制 SMILES
                      </>
                    )}
                  </Button>
                </div>
                <p className="font-mono text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-100 select-all break-all leading-relaxed max-h-[70px] overflow-y-auto">
                  {selectedMolecule.smiles}
                </p>
              </div>

              {/* 2. 左右两栏布局 (左边放置分子二级结构图，右边放置评分性能指标) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* 左半部分 (占 5 列): 分子二级结构 svg 矢量图 */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-150 relative group">
                  <div className="w-full aspect-[4/3] flex items-center justify-center bg-white rounded-lg p-2 border border-slate-100 shadow-sm">
                    <Molecule2DView smiles={selectedMolecule.smiles} />
                  </div>
                  <div className="absolute top-2.5 left-2.5">
                    <Badge className="bg-[#02A1C8]/10 text-[#02A1C8] border-[#02A1C8]/20 text-[9px] font-bold px-2 h-5">
                      分子二级结构图 (2D Model)
                    </Badge>
                  </div>
                </div>

                {/* 右半部分 (占 7 列): 预测指标矩阵 */}
                <div className="md:col-span-7 grid grid-cols-2 gap-3.5">
                  {/* 对接打分 */}
                  <div className="p-3 bg-slate-50/40 rounded-xl border border-[#02A1C8]/10 space-y-1.5 text-left col-span-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">对接打分 (Docking Score)</span>
                    <div className="flex items-baseline gap-1 pt-0.5">
                      <span className="text-xl font-black text-[#02A1C8] tech-mono">{selectedMolecule.dockingScore.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">kcal/mol</span>
                    </div>
                    <Progress value={Math.min(100, Math.max(0, Math.abs(selectedMolecule.dockingScore) * 8))} className="h-1 bg-slate-100" indicatorClassName="bg-[#02A1C8]" />
                  </div>

                  {/* QED */}
                  <div className="p-3 bg-slate-50/40 rounded-xl border border-[#02A1C8]/10 space-y-1.5 text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">QED 类药性</span>
                    <div className="flex items-baseline gap-1 pt-0.5">
                      <span className="text-xl font-black text-emerald-600 tech-mono">{selectedMolecule.qed.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">基药QED</span>
                    </div>
                    <Progress value={selectedMolecule.qed * 100} className="h-1 bg-slate-100" indicatorClassName="bg-emerald-500" />
                  </div>

                  {/* SA评分 */}
                  <div className="p-3 bg-slate-50/40 rounded-xl border border-[#02A1C8]/10 space-y-1.5 text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">SA 合成可及性</span>
                    <div className="flex items-baseline gap-1 pt-0.5">
                      <span className="text-xl font-black text-amber-600 tech-mono">{selectedMolecule.sa.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-450 font-medium">越小越易合成</span>
                    </div>
                    <Progress value={Math.max(0, (5 - selectedMolecule.sa) * 20)} className="h-1 bg-slate-100" indicatorClassName="bg-amber-500" />
                  </div>
                </div>

              </div>

            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button 
              className="px-6 rounded-xl text-xs font-bold bg-[#02A1C8] hover:bg-[#028FAC] text-white"
              onClick={() => setSelectedMolecule(null)}
            >
              确 定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Bottom Actions */}
      <div className="bg-white border-t px-8 py-4 flex items-center justify-between sticky bottom-0 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-sans flex items-center gap-2">
               数据分析就绪
               <div className="h-3 w-[1px] bg-slate-200" />
               已选择 0 项
            </span>
         </div>
         <div className="flex items-center gap-4">
            <Button variant="outline" className="h-10 px-6 rounded-xl tech-mono text-xs font-black text-slate-500 border-slate-200 hover:bg-slate-50">
               导出清单
            </Button>
            <Button className="h-10 px-8 rounded-xl tech-mono text-xs font-black bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-lg">
               <Plus className="w-4 h-4 mr-2" />
               批量加入候选
            </Button>
         </div>
      </div>
    </div>
  );
};

const TargetIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
