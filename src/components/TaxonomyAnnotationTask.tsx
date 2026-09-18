import React, { useState } from "react";
import {
  ChevronLeft,
  Upload,
  Settings,
  Terminal,
  FileText,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderOpen,
  X,
  Send,
  Info,
  ChevronDown,
  Database,
  Dna,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatabaseSelectDialog } from "./DatabaseSelectDialog";

interface TaxonomyAnnotationTaskProps {
  onBack: () => void;
  onSubmitSuccess?: (taskInfo: any) => void;
}

export function TaxonomyAnnotationTask({ onBack, onSubmitSuccess }: TaxonomyAnnotationTaskProps) {
  // Input Files State
  const [repSeqFile, setRepSeqFile] = useState<{ name: string; size: string } | null>(null);
  const [otuTableFile, setOtuTableFile] = useState<{ name: string; size: string } | null>(null);

  // Parameter Configuration State
  const [taxonomyDbPath, setTaxonomyDbPath] = useState(
    "/data-nfs/nextflow/database/taxonomy_database/silva138_99_qiime2_sintax.fa.gz"
  );
  const [sintaxCutoff, setSintaxCutoff] = useState("0.8");
  const [rarefactionDepth, setRarefactionDepth] = useState("10000");
  const [randomSeed, setRandomSeed] = useState("42");
  const [filterOrganelles, setFilterOrganelles] = useState("chloroplast,mitochondria");

  // General Basic Configuration State
  const [selectedProject, setSelectedProject] = useState("");
  const [taskName, setTaskName] = useState("TAXONOMY_ANNOTATION_260817_001");

  // UI States
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessDialog, setSubmitSuccessDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);
  const [dbDialogOpen, setDbDialogOpen] = useState(false);

  // Command Preview Generation
  const rawCommand = `vsearch --sintax \${rep_seqs} --db \${params.taxonomy_db ?: '${taxonomyDbPath || "/data-nfs/nextflow/database/taxonomy_database/silva138_99_qiime2_sintax.fa.gz"}'} --tabbedout \${params.otu_table ?: 'taxonomy.tsv'} --strand plus --threads \${task.cpus} --sintax_cutoff \${params.taxonomy_sintax_cutoff}`;

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFillReferenceGenome = () => {
    const presetPath = "/data-nfs/nextflow/database/taxonomy_database/silva138_99_qiime2_sintax.fa.gz";
    setTaxonomyDbPath(presetPath);
    showToast("已自动填充参考基因组", "系统已自动加载预置的 SILVA 138 SINTAX 官方标准物种注释参考数据库。");
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(rawCommand);
    setCopied(true);
    showToast("指令已复制", "命令行运行指令已成功复制到剪贴板。");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSample = (type: "rep_seq" | "otu_table") => {
    const filename = type === "rep_seq" ? "sample_rep_seqs.fasta" : "sample_otu_table.tsv";
    showToast("示例文件下载中", `正在生成并下载示例文件 ${filename}`);
  };

  const handleUploadFile = (type: "rep_seq" | "otu_table") => {
    if (type === "rep_seq") {
      setRepSeqFile({
        name: "microbiome_16S_rep_seqs.fasta",
        size: "14.8 MB"
      });
      showToast("文件上传成功", "microbiome_16S_rep_seqs.fasta 已解析完成。");
    } else {
      setOtuTableFile({
        name: "otu_abundance_matrix.tsv",
        size: "3.2 MB"
      });
      showToast("文件上传成功", "otu_abundance_matrix.tsv 已绑定。");
    }
  };

  const handleSubmit = () => {
    if (!selectedProject) {
      showToast("请选择所属项目", "请在通用基础配置中选择该任务所属的研究项目。");
      return;
    }
    if (!taskName.trim()) {
      showToast("请输入任务名称", "任务名称不能为空。");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccessDialog(true);
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFB] min-h-screen text-[#0F172A] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-4 flex items-start gap-3 max-w-md animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-sky-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-slate-800">{toastMessage.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{toastMessage.desc}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                返回
              </button>
              <div className="h-3.5 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  运行工具: <span className="font-mono text-[#0284c7]">taxonomy_annotation</span>
                </h1>
                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-200/60 text-[11px] font-medium px-2 py-0.5 rounded">
                  已启用
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-left">
              该工具基于 SINTAX 数据库对代表序列进行物种注释，并输出注释结果与数据库信息。
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg px-5 h-9 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            {isSubmitting ? "正在提交..." : "提交任务"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-6">

        {/* ============================================================ */}
        {/* CARD 1: 输入 (配置工具输入参数) - Images 3 & 4 */}
        {/* ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] border border-sky-100 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900">输入</h2>
              <p className="text-[11px] text-slate-400">配置工具输入参数</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Input 1: rep_seq.fasta * */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>rep_seq.fasta</span>
                <span className="text-rose-500">*</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Upload Dropzone */}
                <div 
                  onClick={() => handleUploadFile("rep_seq")}
                  className={cn(
                    "lg:col-span-6 rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                    repSeqFile 
                      ? "border-sky-300 bg-sky-50/40" 
                      : "border-slate-200 bg-[#FAFCFD] hover:bg-slate-50/80 hover:border-sky-300"
                  )}
                >
                  {repSeqFile ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{repSeqFile.name}</p>
                        <p className="text-[11px] text-slate-400">{repSeqFile.size} • 点击可重新选择文件</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">拖放或点击上传 rep_seq.fasta</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">支持 .fasta, .fa</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Guide Instructions */}
                <div className="lg:col-span-6 bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between text-left space-y-3">
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p className="font-medium text-slate-700">
                      请上传 FASTA 格式的 OTU 代表序列文件。FASTA 格式是一种用于记录核酸序列或肽序列的文本格式。
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-slate-500">
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>一条完整序列包含单行描述行和多行序列数据</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>每条序列以 &gt; 开头的描述行作为起始标识</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>序列内容只能包含合法碱基字符或约定的简并碱基字符</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleDownloadSample("rep_seq")}
                    className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline flex items-center gap-1.5 self-start cursor-pointer pt-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载示例文件
                  </button>
                </div>
              </div>
            </div>

            {/* Input 2: otu_table.tsv/csv * */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>otu_table.tsv/csv</span>
                <span className="text-rose-500">*</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Upload Dropzone */}
                <div 
                  onClick={() => handleUploadFile("otu_table")}
                  className={cn(
                    "lg:col-span-6 rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                    otuTableFile 
                      ? "border-sky-300 bg-sky-50/40" 
                      : "border-slate-200 bg-[#FAFCFD] hover:bg-slate-50/80 hover:border-sky-300"
                  )}
                >
                  {otuTableFile ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{otuTableFile.name}</p>
                        <p className="text-[11px] text-slate-400">{otuTableFile.size} • 点击可重新选择文件</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">拖放或点击上传 otu_table.tsv/csv</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">支持 .tsv, .csv</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Guide Instructions */}
                <div className="lg:col-span-6 bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between text-left space-y-3">
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p className="font-medium text-slate-700">
                      请传入上游 OTU 表文件路径，后端会将 relativePath 写入 params.otu_table。
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-slate-500">
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>第一列为特征 ID（Feature ID），需要与代表序列及后续注释结果保持一致</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>第一行为样本名称（Sample ID），每一列代表一个样本</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>矩阵中的数值表示该特征在对应样本中的丰度值或 reads 计数</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleDownloadSample("otu_table")}
                    className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline flex items-center gap-1.5 self-start cursor-pointer pt-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载示例文件
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD 2: 参数配置 (配置工具运行参数) - Image 2 */}
        {/* ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] border border-sky-100 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div className="text-left space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900">参数配置</h2>
              <p className="text-[11px] text-slate-400">配置工具运行参数</p>
            </div>
          </div>

          <div className="p-6 space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              
              {/* Field 1: 物种注释数据库路径 (支持弹窗选择与参考基因组预置) */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-sky-600" />
                      物种注释数据库路径
                    </label>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      可选参 / 支持多选文件
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono truncate max-w-[280px]">
                    默认: /data-nfs/nextflow/database/taxonomy_data...
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  SINTAX 物种注释数据库文件路径；未填写时使用平台默认数据库，支持从弹窗中选择病原/免疫/蛋白/自建数据库或具体文件。
                </p>

                {/* Input + Select Database Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="请输入或从右侧弹窗选择数据库路径（多路径用逗号分隔）"
                      value={taxonomyDbPath}
                      onChange={(e) => setTaxonomyDbPath(e.target.value)}
                      className="h-9 text-xs font-mono bg-white border-slate-200 pr-8"
                    />
                    {taxonomyDbPath && (
                      <button
                        type="button"
                        onClick={() => setTaxonomyDbPath("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        title="清空路径"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 选择数据库按钮 */}
                  <Button
                    type="button"
                    onClick={() => setDbDialogOpen(true)}
                    className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold h-9 px-4 shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    选择数据库
                  </Button>
                </div>

                {/* 左下方：参考基因组链接按钮 & 路径计数 */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleFillReferenceGenome}
                    className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline flex items-center gap-1.5 cursor-pointer group transition-colors"
                  >
                    <Dna className="w-3.5 h-3.5 text-sky-500 group-hover:rotate-45 transition-transform" />
                    <span>参考基因组（一键自动预置系统数据库）</span>
                  </button>

                  {taxonomyDbPath && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      已绑定 {taxonomyDbPath.split(/[,;\n]/).filter(Boolean).length} 个数据库/文件路径
                    </span>
                  )}
                </div>
              </div>

              {/* Field 2: SINTAX置信度阈值 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">SINTAX置信度阈值</label>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    默认: 0.8
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  物种注释时使用的 SINTAX 置信度阈值。
                </p>
                <Input
                  type="text"
                  value={sintaxCutoff}
                  onChange={(e) => setSintaxCutoff(e.target.value)}
                  className="h-9 text-xs font-mono bg-white border-slate-200"
                />
              </div>

              {/* Field 3: 稀释深度 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">稀释深度</label>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    默认: 10000
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  采样深度，根据该参数将所有样本的reads数进行随机抽样稀释，使得所有样本的深度相同。
                </p>
                <Input
                  type="text"
                  value={rarefactionDepth}
                  onChange={(e) => setRarefactionDepth(e.target.value)}
                  className="h-9 text-xs font-mono bg-white border-slate-200"
                />
              </div>

              {/* Field 4: 随机抽样种子 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">随机抽样种子</label>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    默认: 42
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  抽样稀释的随机种子，用于保证结果可重复。
                </p>
                <Input
                  type="text"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(e.target.value)}
                  className="h-9 text-xs font-mono bg-white border-slate-200"
                />
              </div>

              {/* Field 5: 叶绿体/线粒体过滤 */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">叶绿体/线粒体过滤</label>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    默认: chloroplast,mitochondria
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  用于过滤叶绿体和线粒体的分类学模式，多个模式用逗号分隔。
                </p>
                <Input
                  type="text"
                  value={filterOrganelles}
                  onChange={(e) => setFilterOrganelles(e.target.value)}
                  className="h-9 text-xs font-mono bg-white border-slate-200"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD 3: 通用基础配置 (Image 2 & 4) */}
        {/* ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] border border-sky-100 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div className="text-left space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900">通用基础配置</h2>
            </div>
          </div>

          <div className="p-6 space-y-5 text-left">
            {/* Field 1: 所属项目 * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                所属项目 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  aria-label="选择所属项目"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none cursor-pointer"
                >
                  <option value="">请选择所属项目</option>
                  <option value="PRJ-001">肠道微生态宏基因组与16S多样性研究 (PRJ-2026-001)</option>
                  <option value="PRJ-002">单细胞免疫组库与病原多模态联合分析 (PRJ-2026-002)</option>
                  <option value="PRJ-003">临床耐药菌靶点发现与溯源项目 (PRJ-2026-003)</option>
                  <option value="PRJ-004">新型小分子抗肿瘤药物虚拟筛选 (PRJ-2026-004)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Field 2: 任务名称 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">任务名称</label>
              <Input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="h-9 text-xs font-mono bg-white border-slate-200"
              />
              <p className="text-[11px] text-slate-400">
                任务名称不能包含中文，建议使用英文、数字或下划线
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD 4: 命令行代码预览 (Image 4) */}
        {/* ============================================================ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] border border-sky-100 flex items-center justify-center shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="text-left space-y-0.5">
                <h2 className="text-sm font-bold text-slate-900">命令行代码预览</h2>
                <p className="text-[11px] text-slate-400">工具执行命令</p>
              </div>
            </div>

            <button
              onClick={handleCopyCommand}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? "已复制" : "复制指令"}
            </button>
          </div>

          <div className="p-6 space-y-4 text-left">
            {/* Terminal box */}
            <div className="bg-[#0B132B] text-slate-100 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 shadow-inner">
              <code>{rawCommand}</code>
            </div>

            {/* Remarks Section (ⓘ 备注说明) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>备注说明</span>
              </div>
              <div className="space-y-1.5 pl-1 text-[11px] text-slate-500">
                <div className="flex items-start gap-2">
                  <span className="text-[#0284c7] text-xs">⊙</span>
                  <span>Excel 标注了数据库切换开发，因此标准定义中将数据库作为可选参暴露。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#0284c7] text-xs">⊙</span>
                  <span>otu_table 通过文件绑定传入，后端会优先提取 relativePath 并写入 runner 的 params.otu_table。</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Task Submission Success Dialog */}
      <Dialog open={submitSuccessDialog} onOpenChange={setSubmitSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center text-slate-900 font-bold">
              任务提交成功
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500 mt-1">
              任务 <span className="font-mono font-bold text-slate-800">{taskName}</span> 已提交至 Nextflow 计算集群进行排队执行。
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2 my-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400">所属项目:</span>
              <span className="font-medium text-slate-700">{selectedProject || "默认项目"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">物种注释算法:</span>
              <span className="font-medium text-slate-700">SINTAX / vsearch</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">置信度阈值:</span>
              <span className="font-mono font-medium text-slate-700">{sintaxCutoff}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">采样稀释深度:</span>
              <span className="font-mono font-medium text-slate-700">{rarefactionDepth}</span>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitSuccessDialog(false);
                onBack();
              }}
              className="text-xs cursor-pointer"
            >
              返回工具列表
            </Button>
            <Button
              onClick={() => {
                setSubmitSuccessDialog(false);
                onSubmitSuccess?.({
                  taskName,
                  project: selectedProject,
                  type: "taxonomy_annotation"
                });
              }}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs cursor-pointer"
            >
              前往任务监控中心
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Database Selection Dialog (4 Major Modules & Multi-file support) */}
      <DatabaseSelectDialog
        open={dbDialogOpen}
        onOpenChange={setDbDialogOpen}
        currentValue={taxonomyDbPath}
        onSelect={(selected) => {
          setTaxonomyDbPath(selected);
          showToast(
            "数据库路径已填充",
            `已将所选的 ${selected.split(/[,;\n]/).filter(Boolean).length} 个数据库/文件路径同步至参数配置中。`
          );
        }}
      />
    </div>
  );
}
