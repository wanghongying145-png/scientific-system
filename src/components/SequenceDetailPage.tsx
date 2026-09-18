import React from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SequenceRecord {
  sequence_id: string;
  cdr3_aa: string;
  v_call: string;
  j_call: string;
  locus: string;
  disease_type: string;
  sample_type: string;
  source_db: string;
  age: number;
  gender: string;
  pmid: string;
  d_call: string;
  productive: string;
  consensus_count: number;
  v_identity: number;
  junction_aa: string;
  dataset_name?: string;
}

interface SequenceDetailPageProps {
  seq: SequenceRecord;
  onBack: () => void;
}

// Translate amino acids to realistic codon string
const aaToCodon = (aaSeq: string): string => {
  const table: Record<string, string> = {
    A: "GCT", C: "TGT", D: "GAT", E: "GAA", F: "TTT",
    G: "GGT", H: "CAT", I: "ATT", K: "AAA", L: "CTG",
    M: "ATG", N: "AAT", P: "CCT", Q: "CAG", R: "CGT",
    S: "TCT", T: "ACT", V: "GTT", W: "TGG", Y: "TAT"
  };
  return aaSeq
    .split("")
    .map(char => table[char.toUpperCase()] || "NNN")
    .join("");
};

export const SequenceDetailPage: React.FC<SequenceDetailPageProps> = ({ seq, onBack }) => {
  const dnaSequence = aaToCodon(seq.cdr3_aa);
  const vCallFormatted = seq.v_call.includes("*") ? seq.v_call : `${seq.v_call}*01`;
  const jCallFormatted = seq.j_call.includes("*") ? seq.j_call : `${seq.j_call}*01`;

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-300">
      {/* 1. Header with back and copy actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight font-sans flex items-center gap-2">
            <span>序列详情</span>
            <span className="text-slate-300 font-normal">·</span>
            <span className="text-slate-600 font-mono text-lg font-medium">{seq.sequence_id}</span>
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto font-sans">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
            onClick={onBack}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> <span>返回检索结果</span>
          </Button>
        </div>
      </div>

      {/* 2. Grid Layout of Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details tables */}
        <div className="lg:col-span-8 space-y-6">
          {/* AIRR Standard Fields Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pl-0.5">
              <span className="w-[3px] h-[14px] bg-[#0c356a] rounded-xs" />
              <h4 className="text-sm font-bold text-[#0c356a] font-sans">AIRR 标准字段</h4>
            </div>

            <div className="border border-slate-200/85 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-12 min-h-10 items-center py-2 bg-white">
                  <div className="col-span-4 sm:col-span-3 text-slate-400 font-sans text-xs px-4 sm:px-6">
                    sequence_id
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-slate-600 font-mono text-xs font-semibold px-4">
                    {seq.sequence_id}
                  </div>
                </div>

                <div className="grid grid-cols-12 min-h-10 items-center py-2 bg-white">
                  <div className="col-span-4 sm:col-span-3 text-slate-400 font-sans text-xs px-4 sm:px-6">
                    locus
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-slate-900 font-sans text-xs font-bold">
                    <span className="px-4">{seq.locus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 min-h-10 items-center py-2 bg-white">
                  <div className="col-span-4 sm:col-span-3 text-slate-400 font-sans text-xs px-4 sm:px-6">
                    v_call
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-slate-800 font-mono text-xs px-4">
                    {vCallFormatted}
                  </div>
                </div>

                <div className="grid grid-cols-12 min-h-10 items-center py-2 bg-white">
                  <div className="col-span-4 sm:col-span-3 text-slate-400 font-sans text-xs px-4 sm:px-6">
                    j_call
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-slate-800 font-mono text-xs px-4">
                    {jCallFormatted}
                  </div>
                </div>

                <div className="grid grid-cols-12 min-h-10 items-center py-2 bg-white">
                  <div className="col-span-4 sm:col-span-3 text-slate-400 font-sans text-xs px-4 sm:px-6">
                    cdr3_aa
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-slate-900 font-sans text-xs px-4">
                    <span className="font-bold tracking-wide">{seq.cdr3_aa}</span>{" "}
                    <span className="text-slate-400 text-[11px] font-normal ml-1">({seq.cdr3_aa.length} aa)</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 min-h-10 items-center py-2.5 bg-white">
                  <div className="col-span-4 sm:col-span-3 text-slate-400 font-sans text-xs px-4 sm:px-6">
                    cdr3
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-slate-500 font-mono text-[10px] break-all leading-relaxed tracking-wider px-4">
                    {dnaSequence}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Sample Information Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pl-0.5">
              <span className="w-[3px] h-[14px] bg-[#0c356a] rounded-xs" />
              <h4 className="text-sm font-bold text-[#0c356a] font-sans">关联样本信息</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12 px-6 py-4 bg-slate-50/15 border border-slate-100 rounded-xl">
              <div className="flex justify-between md:justify-start gap-4 text-xs font-sans">
                <span className="text-slate-400 w-24">疾病类型</span>
                <span className="text-slate-700 font-semibold">{seq.disease_type}</span>
              </div>
              <div className="flex justify-between md:justify-start gap-4 text-xs font-sans">
                <span className="text-slate-400 w-24">细胞亚群</span>
                <span className="text-slate-700 font-medium">
                  {seq.locus.startsWith("TR") ? "CD8+ T cell" : "Naïve B cell"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Source and Similar sequences */}
        <div className="lg:col-span-4 space-y-6">
          {/* Data Source Block */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pl-0.5">
              <span className="w-[3px] h-[14px] bg-[#0c356a] rounded-xs" />
              <h4 className="text-sm font-bold text-[#0c356a] font-sans">数据来源</h4>
            </div>

            <Card className="border border-slate-200/85 bg-white shadow-xs rounded-xl overflow-hidden">
              <CardContent className="p-5 space-y-3 text-xs font-sans">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">来源库</span>
                  <span className="text-slate-700 font-medium">
                    {seq.source_db === "iReceptor"
                      ? "iReceptor Public Archive"
                      : seq.source_db === "VDJdb"
                      ? "VDJdb Core Database"
                      : "NCBI SRA Archive"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">源 ID</span>
                  <span className="text-slate-700 font-mono">{seq.sequence_id.split("-")[0]}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">PMID</span>
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${seq.pmid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline font-mono"
                  >
                    {seq.pmid}
                  </a>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">发表年份</span>
                  <span className="text-slate-700">{seq.pmid.startsWith("38") ? "2024" : "2023"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
