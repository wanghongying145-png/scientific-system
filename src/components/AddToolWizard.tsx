import { useState, useRef, useEffect } from "react";
import { 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Info, 
  Plus, 
  Trash2, 
  Edit2, 
  Play, 
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
  Database,
  Terminal,
  Cpu,
  RefreshCw,
  FolderOpen,
  Copy,
  Square,
  UploadCloud,
  Loader2,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Types
interface InputPort {
  id: string;
  name: string;
  displayName: string;
  type: string;
  format: string;
  required: boolean;
  multiple: boolean;
  source: string;
}

interface ParameterItem {
  id: string;
  name: string;
  displayName: string;
  type: string;
  defaultValue: string;
  min?: number;
  max?: number;
  required: boolean;
  isAdvanced: boolean;
  helpText?: string;
}

interface OutputPort {
  id: string;
  name: string;
  displayName: string;
  type: string;
  format: string;
  matchRule: string;
  required: boolean;
}

interface AddToolWizardProps {
  onBack: () => void;
  onSave?: (toolData: any) => void;
  toolToEdit?: any;
}

export function AddToolWizard({ onBack, onSave, toolToEdit }: AddToolWizardProps) {
  const isEditMode = !!toolToEdit;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showTestResult, setShowTestResult] = useState(false);

  // STEP 7 State: Tests & Publish
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [testProgress, setTestProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>(["— 等待测试开始..."]);
  const [passedChecks, setPassedChecks] = useState<number[]>([]);
  const [currentCheckingIndex, setCurrentCheckingIndex] = useState(-1);
  const [selectedProjectFile, setSelectedProjectFile] = useState("");
  const [publishStrategy, setPublishStrategy] = useState<"default" | "only-publish">("default");
  const [dragActive, setDragActive] = useState(false);

  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logLines]);

  // STEP 1 State: Basic Info
  const [basicInfo, setBasicInfo] = useState(() => {
    if (toolToEdit?.toolData?.basic) {
      return toolToEdit.toolData.basic;
    }
    if (toolToEdit) {
      return {
        name: toolToEdit.name || "FastQC",
        identifier: toolToEdit.id || "fastqc",
        version: toolToEdit.version || "0.11.9",
        category: toolToEdit.category || "质量控制",
        dataType: "FASTQ",
        description: toolToEdit.description || "用于对测序数据进行质量评估分析的工具",
        maintainer: "张三",
        refDocument: "https://www.bioinformatics.babraham.ac.uk/projects/fastqc/",
        isEnabled: true,
        allowInWorkflow: true
      };
    }
    return {
      name: "FastQC",
      identifier: "fastqc",
      version: "0.11.9",
      category: "质量控制",
      dataType: "FASTQ",
      description: "用于对测序原始数据（FASTQ 格式）进行质量评估，输出 HTML 可视化质控报告。",
      maintainer: "张三",
      refDocument: "https://www.bioinformatics.babraham.ac.uk/projects/fastqc/",
      isEnabled: true,
      allowInWorkflow: true
    };
  });

  // STEP 2 State: Running Environment
  const [envConfig, setEnvConfig] = useState(() => {
    if (toolToEdit?.toolData?.env) {
      return toolToEdit.toolData.env;
    }
    if (toolToEdit) {
      return {
        engine: "Docker",
        image: toolToEdit.imageAddress || "registry.xxx.com/bio/fastqc:0.11.9",
        pullStrategy: "IfNotPresent",
        credential: "无（公开镜像）",
        workDir: "/workspace",
        entrypoint: "/bin/sh -c",
        envVariables: "PATH=/opt/conda/bin:$PATH",
        defaultCpu: 4,
        maxCpu: 32,
        gpuSupported: "否",
        defaultMem: 8,
        maxMem: 64,
        timeout: 2,
        allowParallel: true
      };
    }
    return {
      engine: "Docker",
      image: "registry.xxx.com/bio/fastqc:0.11.9",
      pullStrategy: "IfNotPresent",
      credential: "无（公开镜像）",
      workDir: "/workspace",
      entrypoint: "/bin/sh -c",
      envVariables: "PATH=/opt/conda/bin:$PATH",
      defaultCpu: 4,
      maxCpu: 32,
      gpuSupported: "否",
      defaultMem: 8,
      maxMem: 64,
      timeout: 2,
      allowParallel: true
    };
  });

  // STEP 3 State: Input Ports List & Form
  const [inputs, setInputs] = useState<InputPort[]>(() => {
    if (toolToEdit?.toolData?.inputs) {
      return toolToEdit.toolData.inputs;
    }
    return [
      {
        id: "input-1",
        name: "fastq_files",
        displayName: "FASTQ 文件",
        type: "文件",
        format: "fastq/fastq.gz/fq/fq.gz",
        required: true,
        multiple: true,
        source: "用户上传 / 项目文件"
      }
    ];
  });
  const [showAddInputForm, setShowAddInputForm] = useState(false);
  const [newInput, setNewInput] = useState<Partial<InputPort>>({
    name: "reads_1",
    displayName: "R1 测序文件",
    type: "文件",
    format: "fastq.gz, fq.gz",
    required: true,
    multiple: true,
    source: "用户上传"
  });

  // STEP 4 State: Parameters
  const [parameters, setParameters] = useState<ParameterItem[]>(() => {
    if (toolToEdit?.toolData?.parameters) {
      return toolToEdit.toolData.parameters;
    }
    return [
      {
        id: "param-1",
        name: "threads",
        displayName: "线程数",
        type: "integer",
        defaultValue: "4",
        min: 1,
        max: 32,
        required: true,
        isAdvanced: false,
        helpText: "定义FastQC运行所使用的线程数量"
      },
      {
        id: "param-2",
        name: "nogroup",
        displayName: "不对碱基位置分组",
        type: "boolean",
        defaultValue: "false",
        required: false,
        isAdvanced: true,
        helpText: "关闭默认的碱基合并展示"
      }
    ];
  });
  const [showAddParamForm, setShowAddParamForm] = useState(false);
  const [newParam, setNewParam] = useState<Partial<ParameterItem>>({
    name: "confidence",
    displayName: "置信度阈值",
    type: "integer",
    defaultValue: "20",
    required: true,
    isAdvanced: false,
    helpText: "测序碱基质量控制置信度阈值"
  });

  // STEP 5 State: Output Ports (Titled "参数配置" in mockup 5 but represents outputs)
  const [outputs, setOutputs] = useState<OutputPort[]>(() => {
    if (toolToEdit?.toolData?.outputs) {
      return toolToEdit.toolData.outputs;
    }
    return [
      {
        id: "output-1",
        name: "output_dir",
        displayName: "报告输出目录",
        type: "目录",
        format: "html, zip",
        matchRule: "./fastqc_out",
        required: true
      }
    ];
  });
  const [showAddOutputForm, setShowAddOutputForm] = useState(false);
  const [newOutput, setNewOutput] = useState<Partial<OutputPort>>({
    name: "html_report",
    displayName: "HTML 质控报告",
    type: "文件",
    format: "html",
    matchRule: "*.html",
    required: true
  });

  // STEP 6 State: Command Template
  const [commandTemplate, setCommandTemplate] = useState(() => {
    if (toolToEdit?.toolData?.command) {
      return toolToEdit.toolData.command;
    }
    return "fastqc ${fastq_files} \\\n  -t ${threads} \\\n  -o ${output_dir}";
  });

  // Sidebar Steps Data
  const steps = [
    { id: 1, name: "基础信息", desc: "名称 / 分类 / 说明" },
    { id: 2, name: "运行环境", desc: "容器镜像配置" },
    { id: 3, name: "输入配置", desc: "Input Port" },
    { id: 4, name: "参数配置", desc: "动态表单" },
    { id: 5, name: "输出配置", desc: "Output Port" },
    { id: 6, name: "命令模板", desc: "变量替换" },
    { id: 7, name: "测试与发布", desc: "运行比对及发布" },
  ];

  // Input Handlers
  const handleAddInput = () => {
    if (!newInput.name || !newInput.displayName) return;
    if (newInput.id) {
      setInputs(inputs.map(item => item.id === newInput.id ? {
        ...item,
        name: newInput.name!,
        displayName: newInput.displayName!,
        type: newInput.type || "文件",
        format: newInput.format || "",
        required: newInput.required !== undefined ? newInput.required : true,
        multiple: newInput.multiple !== undefined ? newInput.multiple : false,
        source: newInput.source || "用户上传"
      } : item));
    } else {
      const inputItem: InputPort = {
        id: "input-" + Date.now(),
        name: newInput.name,
        displayName: newInput.displayName,
        type: newInput.type || "文件",
        format: newInput.format || "fastq.gz",
        required: newInput.required !== undefined ? newInput.required : true,
        multiple: newInput.multiple !== undefined ? newInput.multiple : false,
        source: newInput.source || "用户上传"
      };
      setInputs([...inputs, inputItem]);
    }
    setShowAddInputForm(false);
    // Reset to default new state or default values
    setNewInput({
      name: "reads_1",
      displayName: "R1 测序文件",
      type: "文件",
      format: "fastq.gz, fq.gz",
      required: true,
      multiple: true,
      source: "用户上传"
    });
  };

  const handleDeleteInput = (id: string) => {
    setInputs(inputs.filter(item => item.id !== id));
  };

  const handleAddParam = () => {
    if (!newParam.name || !newParam.displayName) return;
    if (newParam.id) {
      setParameters(parameters.map(item => item.id === newParam.id ? {
        ...item,
        name: newParam.name!,
        displayName: newParam.displayName!,
        type: newParam.type || "integer",
        defaultValue: newParam.defaultValue || "",
        required: newParam.required !== undefined ? newParam.required : false,
        isAdvanced: newParam.isAdvanced !== undefined ? newParam.isAdvanced : false,
        helpText: newParam.helpText || ""
      } : item));
    } else {
      const paramItem: ParameterItem = {
        id: "param-" + Date.now(),
        name: newParam.name,
        displayName: newParam.displayName,
        type: newParam.type || "integer",
        defaultValue: newParam.defaultValue || "",
        required: newParam.required !== undefined ? newParam.required : false,
        isAdvanced: newParam.isAdvanced !== undefined ? newParam.isAdvanced : false,
        helpText: newParam.helpText || ""
      };
      setParameters([...parameters, paramItem]);
    }
    setShowAddParamForm(false);
    // Reset
    setNewParam({
      name: "",
      displayName: "",
      type: "integer",
      defaultValue: "",
      required: false,
      isAdvanced: false,
      helpText: ""
    });
  };

  const handleDeleteParam = (id: string) => {
    setParameters(parameters.filter(item => item.id !== id));
  };

  const handleAddOutput = () => {
    if (!newOutput.name || !newOutput.displayName) return;
    if (newOutput.id) {
      setOutputs(outputs.map(item => item.id === newOutput.id ? {
        ...item,
        name: newOutput.name!,
        displayName: newOutput.displayName!,
        type: newOutput.type || "文件",
        format: newOutput.format || "",
        matchRule: newOutput.matchRule || "*",
        required: newOutput.required !== undefined ? newOutput.required : true
      } : item));
    } else {
      const outputItem: OutputPort = {
        id: "output-" + Date.now(),
        name: newOutput.name,
        displayName: newOutput.displayName,
        type: newOutput.type || "文件",
        format: newOutput.format || "html",
        matchRule: newOutput.matchRule || "*",
        required: newOutput.required !== undefined ? newOutput.required : true
      };
      setOutputs([...outputs, outputItem]);
    }
    setShowAddOutputForm(false);
    // Reset
    setNewOutput({
      name: "",
      displayName: "",
      type: "文件",
      format: "",
      matchRule: "",
      required: true
    });
  };

  const handleDeleteOutput = (id: string) => {
    setOutputs(outputs.filter(item => item.id !== id));
  };

  // Variable Insertion helper for Step 6
  const handleInsertVariable = (variableName: string) => {
    setCommandTemplate(prev => prev + ` \${${variableName}}`);
  };

  // Form Submission
  const handleSaveDraft = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestAndSubmit = () => {
    setCurrentStep(7);
    setTestStatus("idle");
    setTestProgress(0);
    setLogLines(["— 等待测试开始..."]);
    setPassedChecks([]);
    setCurrentCheckingIndex(-1);
    setSelectedProjectFile("fastq_run_9329_R1.fastq.gz");
  };

  const handleConfirmPublish = () => {
    setShowSuccessModal(true);
  };

  const startVerificationTest = () => {
    if (testStatus === "running") return;
    
    setTestStatus("running");
    setTestProgress(0);
    setLogLines(["[08:55:00] [SYSTEM] 准备启动仿真容器验证..."]);
    setPassedChecks([]);
    setCurrentCheckingIndex(0);

    const logsAndSteps = [
      {
        stepIndex: 0,
        progress: 15,
        logs: [
          "[08:55:01] [INFO] [Step 1/7] 镜像拉取: 验证容器镜像可正常拉取...",
          `[08:55:02] [DOCKER] Spawning container with image: ${envConfig.image || "registry.xxx.com/bio/fastqc:0.11.9"}`,
          "[08:55:03] [DOCKER] Pulling layer 1/3... Complete.",
          "[08:55:04] [DOCKER] Pulling layer 2/3... Complete.",
          "[08:55:04] [DOCKER] Pulling layer 3/3... Complete.",
          "[08:55:05] [SUCCESS] 镜像拉取成功！(Hash ID: sha256:4765d7fe89cd)"
        ]
      },
      {
        stepIndex: 1,
        progress: 30,
        logs: [
          "[08:55:06] [INFO] [Step 2/7] 命令生成: 验证变量替换后命令格式正确...",
          `[08:55:06] [SYSTEM] 原命令模板: ${commandTemplate.replace(/\n/g, " ")}`,
          `[08:55:07] [SYSTEM] 解析参数替换...`,
          `[08:55:07] [SYSTEM] 生成命令行: fastqc ${selectedProjectFile || "fastq_files"} -t ${parameters.find(p => p.name === "threads")?.defaultValue || "4"} -o ./fastqc_out`,
          "[08:55:08] [SUCCESS] 命令及拼写校验成功！"
        ]
      },
      {
        stepIndex: 2,
        progress: 45,
        logs: [
          "[08:55:08] [INFO] [Step 3/7] 输入文件挂载: 验证测试文件可挂载进容器...",
          `[08:55:09] [MOUNT] 挂载宿主机测试路径: /datasets/project-files/${selectedProjectFile || "fastq_run_9329_R1.fastq.gz"}`,
          "[08:55:09] [MOUNT] 映射容器内部路径: /workspace/demo_sample_R1.fastq.gz",
          "[08:55:10] [SUCCESS] 读写卷挂载检查成功"
        ]
      },
      {
        stepIndex: 3,
        progress: 60,
        logs: [
          "[08:55:11] [INFO] [Step 4/7] 工具正常运行: 容器内工具实际执行...",
          "[08:55:11] [JOB] 正在容器集群调度沙箱运行...",
          "[08:55:12] [JOB] FastQC output: Started analysis of /workspace/demo_sample_R1.fastq.gz",
          "[08:55:13] [JOB] FastQC output: Percent processed: 5%... 20%... 50%... 85%... 100%",
          "[08:55:14] [JOB] FastQC output: Analysis complete for /workspace/demo_sample_R1.fastq.gz",
          "[08:55:14] [SUCCESS] 容器运行时无异常，执行通过！"
        ]
      },
      {
        stepIndex: 4,
        progress: 75,
        logs: [
          "[08:55:15] [INFO] [Step 5/7] 输出文件匹配: 输出文件符合 Output Port 定义...",
          `[08:55:15] [SYSTEM] 正在搜索匹配文件夹 [./fastqc_out]...`,
          "[08:55:16] [SYSTEM] 检测到生成文件: ./fastqc_out/demo_sample_R1_fastqc.html (280 KB)",
          "[08:55:16] [SYSTEM] 检测到生成文件: ./fastqc_out/demo_sample_R1_fastqc.zip (1.1 MB)",
          "[08:55:16] [SUCCESS] 文件匹配提取校验成功 (符合 *.html 和 *.zip 定义)"
        ]
      },
      {
        stepIndex: 5,
        progress: 90,
        logs: [
          "[08:55:17] [INFO] [Step 6/7] 日志采集: 平台可正常收集运行日志...",
          "[08:55:17] [LOGS] 标准输出和标准错误流订阅正常",
          "[08:55:18] [SUCCESS] 获取到全部 42 行输出日志，健康值 100%"
        ]
      },
      {
        stepIndex: 6,
        progress: 100,
        logs: [
          "[08:55:19] [INFO] [Step 7/7] 结果可识别: 平台可解析结果文件路径...",
          "[08:55:19] [SYSTEM] 正在解析生成的 HTML 质控可视化页面...",
          "[08:55:20] [SYSTEM] 元数据目录索引构建成功 (exit code: 0)",
          "[08:55:20] [SUCCESS] 结果视图解析与渲染通过！",
          "[08:55:21] [SUCCESS] 恭喜，7项校验清单已全部运行通过！所有功能达到发布标准。"
        ]
      }
    ];

    let currentIdx = 0;
    const runNextStep = () => {
      if (currentIdx < logsAndSteps.length) {
        const item = logsAndSteps[currentIdx];
        setCurrentCheckingIndex(item.stepIndex);
        
        let logSubIdx = 0;
        const printLogs = () => {
          if (logSubIdx < item.logs.length) {
            setLogLines(prev => [...prev, item.logs[logSubIdx]]);
            logSubIdx++;
            setTimeout(printLogs, 120);
          } else {
            setPassedChecks(prev => [...prev, item.stepIndex]);
            setTestProgress(item.progress);
            currentIdx++;
            
            if (currentIdx < logsAndSteps.length) {
              setTimeout(runNextStep, 350);
            } else {
              setTestStatus("success");
              setCurrentCheckingIndex(-1);
            }
          }
        };
        printLogs();
      }
    };

    setTimeout(runNextStep, 500);
  };

  const handleCompleteAll = () => {
    if (onSave) {
      onSave({
        basic: basicInfo,
        env: envConfig,
        inputs,
        parameters,
        outputs,
        command: commandTemplate
      });
    }
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-[calc(100vh-3.5rem)] relative font-sans text-slate-700">
      
      {/* Title Header Bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        {currentStep === 7 ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-405">{isEditMode ? "编辑工具" : "新增工具"}</span>
              <span className="text-xs text-slate-300 font-mono">&gt;</span>
              <span className="text-sm font-bold text-slate-800">第7步：测试与{isEditMode ? "保存" : "发布"}</span>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full text-xs text-slate-600 font-medium font-sans ml-2 border border-slate-200 shadow-2xs">
                <span className="text-slate-400">⚡</span>
                <span className="font-semibold">{basicInfo.name || "FastQC"}</span>
                <span className="text-slate-400 text-[10px] font-mono">{basicInfo.version || "v0.11.9"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors border ${
                testStatus === "idle"
                  ? "bg-slate-50 text-slate-600 border-slate-250 font-normal"
                  : testStatus === "running"
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
              }`}>
                {testStatus === "idle" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    待验证
                  </>
                )}
                {testStatus === "running" && (
                  <>
                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                    测试中 {testProgress}%
                  </>
                )}
                {testStatus === "success" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute duration-1000" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    验证成功
                  </>
                )}
              </span>
              <button className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center border border-slate-100 hover:bg-slate-50">
                <span className="font-bold text-stone-500 -mt-1.5">...</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-sm font-bold text-slate-905 flex items-center gap-2">
                  <span>{isEditMode ? "编辑工具向导" : "新增工具向导"}</span>
                  <span className="text-xs font-medium text-slate-400">/</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{basicInfo.name || "FastQC"}</span>
                </h1>
                <p className="text-[11px] text-slate-400 mt-0.5">{isEditMode ? "您正在修改现有的生物信息学容器分析模型工具" : "您正在创建一个全新的生物信息学容器分析模型工具"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="border-slate-200 text-slate-500 font-mono">STEP {currentStep} / 7</Badge>
              <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300" 
                  style={{ width: `${(currentStep / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Left Interactive Side Steps Panel */}
        <div className="w-full lg:w-64 bg-white p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-4 px-1">{isEditMode ? "编辑工具步骤" : "新增工具步骤"}</div>
            
            <div className="space-y-1">
              {steps.map((s) => {
                const isCompleted = s.id < currentStep;
                const isActive = s.id === currentStep;
                
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(s.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition duration-150 text-left cursor-pointer ${
                      isActive 
                        ? "bg-blue-50/70 border border-blue-100" 
                        : "hover:bg-slate-50/60 border border-transparent"
                    }`}
                  >
                    {/* Status Circle */}
                    <div className="mt-0.5 shrink-0 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3px]" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10.5px] font-mono flex items-center justify-center shadow-sm shadow-blue-100">
                          {s.id}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 font-semibold text-[10.5px] font-mono flex items-center justify-center">
                          {s.id}
                        </div>
                      )}
                    </div>

                    {/* Step Meta */}
                    <div className="space-y-0.5">
                      <span className={`text-[11.5px] block font-bold ${isActive ? "text-blue-900" : isCompleted ? "text-slate-800" : "text-slate-505"}`}>
                        {s.name}
                      </span>
                      <span className={`text-[9.5px] block font-mono font-medium ${isActive ? "text-blue-500" : "text-slate-400"}`}>
                        {s.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 mt-8 hidden lg:block">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-450 leading-relaxed">
                完成所有步骤后，平台将组织进行自动化环境比对测试。只有运行成功的分析工具才能正式发布。
              </div>
            </div>
          </div>
        </div>

        {/* Right Active Step Content Area */}
        <div className="flex-1 bg-white p-6 lg:p-8 flex flex-col justify-between overflow-x-hidden">
          
          <div className={`${currentStep === 7 ? "max-w-none w-full" : "max-w-4xl"} space-y-6`}>

            {/* Step 1 Content: 基础信息 */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">基础信息</h2>
                  <p className="text-xs text-slate-400 mt-1">描述这个工具是什么，帮助用户了解用途和适用场景</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                      工具名称 <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="FastQC" 
                      value={basicInfo.name} 
                      onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                      className="bg-slate-55/30 border-slate-200 h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                      工具标识 <span className="text-red-500">*</span>
                      <span className="text-[9.5px] text-slate-400 font-normal">系统内唯一ID，创建后不可修改</span>
                    </label>
                    <Input 
                      placeholder="fastqc" 
                      value={basicInfo.identifier} 
                      onChange={(e) => setBasicInfo({...basicInfo, identifier: e.target.value})}
                      className="bg-slate-55/30 border-slate-200 h-9 font-mono"
                    />
                    <p className="text-[9.5px] text-slate-400">只允许小写字母、数字和连字符</p>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                      工具版本 <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="v0.11.9" 
                      value={basicInfo.version} 
                      onChange={(e) => setBasicInfo({...basicInfo, version: e.target.value})}
                      className="bg-slate-55/30 border-slate-200 h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                      工具分类 <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={basicInfo.category}
                      onChange={(e) => setBasicInfo({...basicInfo, category: e.target.value})}
                      className="w-full bg-slate-55/30 border border-slate-200 text-slate-700 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                    >
                      <option value="质量控制">质量控制</option>
                      <option value="序列比对">序列比对</option>
                      <option value="基因组组装">基因组组装</option>
                      <option value="表达量定量">表达量定量</option>
                      <option value="格式转换">格式转换</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-650">适用数据类型</label>
                    <select 
                      value={basicInfo.dataType}
                      onChange={(e) => setBasicInfo({...basicInfo, dataType: e.target.value})}
                      className="w-full bg-slate-55/30 border border-slate-200 text-slate-700 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-mono"
                    >
                      <option value="FASTQ">FASTQ</option>
                      <option value="FASTA">FASTA</option>
                      <option value="BAM/SAM">BAM / SAM</option>
                      <option value="VCF">VCF</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                      工具说明 <span className="text-red-500">*</span>
                    </label>
                    <Textarea 
                      placeholder="对数据的解释、用法及简介..."
                      value={basicInfo.description}
                      onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                      className="h-20 bg-slate-55/30 border-slate-200 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* Switch Settings Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] font-bold text-slate-500 tracking-wider">可见性设置</div>
                  
                  <div className="flex flex-col gap-3">
                    {/* Switch 1 */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">启用此工具</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">关闭后用户在分析工具箱中不可见且不可使用</span>
                      </div>
                      <button 
                        onClick={() => setBasicInfo({...basicInfo, isEnabled: !basicInfo.isEnabled})}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${basicInfo.isEnabled ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${basicInfo.isEnabled ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* Switch 2 */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">允许加入自定义工作流</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">开启后可在工作流分析管道中编排，并支持节点拖拽连线</span>
                      </div>
                      <button 
                        onClick={() => setBasicInfo({...basicInfo, allowInWorkflow: !basicInfo.allowInWorkflow})}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${basicInfo.allowInWorkflow ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${basicInfo.allowInWorkflow ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Content: 运行环境 */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">运行环境</h2>
                  <p className="text-xs text-slate-400 mt-1">配置工具的容器镜像和执行资源，当前一期只支持 Docker / Singularity</p>
                </div>

                {/* Registry Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 text-left md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                      镜像地址 <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="registry.xxx.com/bio/fastqc:0.11.9" 
                      value={envConfig.image} 
                      onChange={(e) => setEnvConfig({...envConfig, image: e.target.value})}
                      className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                    />
                    <p className="text-[9.5px] text-slate-400">格式：仓库地址/镜像名:版本标签，建议与工具版本保持一致</p>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650">镜像拉取策略</label>
                    <select 
                      value={envConfig.pullStrategy}
                      onChange={(e) => setEnvConfig({...envConfig, pullStrategy: e.target.value})}
                      className="w-full bg-slate-55/30 border border-slate-200 text-slate-700 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                    >
                      <option value="IfNotPresent">IfNotPresent (推荐)</option>
                      <option value="Always">Always</option>
                      <option value="Never">Never</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650">仓库凭证 (私有镜像)</label>
                    <select 
                      value={envConfig.credential}
                      onChange={(e) => setEnvConfig({...envConfig, credential: e.target.value})}
                      className="w-full bg-slate-55/30 border border-slate-200 text-slate-700 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                    >
                      <option value="无（公开镜像）">无（公开镜像）</option>
                      <option value="默认平台凭证">默认平台凭证</option>
                      <option value="私有云Token">私有云托管Token</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650">工作目录</label>
                    <Input 
                      placeholder="/workspace" 
                      value={envConfig.workDir} 
                      onChange={(e) => setEnvConfig({...envConfig, workDir: e.target.value})}
                      className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-650">启动入口</label>
                    <Input 
                      placeholder="/bin/sh -c" 
                      value={envConfig.entrypoint} 
                      onChange={(e) => setEnvConfig({...envConfig, entrypoint: e.target.value})}
                      className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 text-left md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-650">环境变量</label>
                    <Textarea 
                      placeholder="可选，格式 KEY=VALUE，每行一个"
                      value={envConfig.envVariables}
                      onChange={(e) => setEnvConfig({...envConfig, envVariables: e.target.value})}
                      className="bg-slate-55/30 border-slate-200 h-16 font-mono text-xs text-left"
                    />
                  </div>
                </div>

                {/* Resource Allocations */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="text-[11px] font-bold text-slate-500 tracking-wider">资源配置 (Limits & Allocations)</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11.5px] font-bold text-slate-650 flex items-center gap-1">
                        默认 CPU (核) <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        type="number" 
                        value={envConfig.defaultCpu} 
                        onChange={(e) => setEnvConfig({...envConfig, defaultCpu: Number(e.target.value)})}
                        className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11.5px] font-bold text-slate-650">最大 CPU (核)</label>
                      <Input 
                        type="number" 
                        value={envConfig.maxCpu} 
                        onChange={(e) => setEnvConfig({...envConfig, maxCpu: Number(e.target.value)})}
                        className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11.5px] font-bold text-slate-650">是否支持 GPU</label>
                      <select 
                        value={envConfig.gpuSupported}
                        onChange={(e) => setEnvConfig({...envConfig, gpuSupported: e.target.value})}
                        className="w-full bg-slate-55/30 border border-slate-200 text-slate-705 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                      >
                        <option value="否">否</option>
                        <option value="是">是</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[11.5px] font-bold text-slate-650 flex items-center gap-1">
                        默认内存 (Gi) <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        type="number" 
                        value={envConfig.defaultMem} 
                        onChange={(e) => setEnvConfig({...envConfig, defaultMem: Number(e.target.value)})}
                        className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11.5px] font-bold text-slate-650">最大内存 (Gi)</label>
                      <Input 
                        type="number" 
                        value={envConfig.maxMem} 
                        onChange={(e) => setEnvConfig({...envConfig, maxMem: Number(e.target.value)})}
                        className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11.5px] font-bold text-slate-650">超时时间 (小时)</label>
                      <Input 
                        type="number" 
                        value={envConfig.timeout} 
                        onChange={(e) => setEnvConfig({...envConfig, timeout: Number(e.target.value)})}
                        className="bg-slate-55/30 border-slate-200 h-9 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Parallel sample checkbox */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl mt-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">支持多样本并行 (Multi-sample Concurrent)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">开启后平台可同时拉起多个容器并发跑多个样本数据</span>
                    </div>
                    <button 
                      onClick={() => setEnvConfig({...envConfig, allowParallel: !envConfig.allowParallel})}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${envConfig.allowParallel ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${envConfig.allowParallel ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Content: 输入配置 */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">输入配置</h2>
                  <p className="text-xs text-slate-400 mt-1">定义此工具需要哪些输入，每个输入项构成一个 Input Port，前端组件根据类型自动渲染上传和选择</p>
                </div>

                {/* Port List */}
                <div className="space-y-3 text-left">
                  {inputs.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-start justify-between hover:border-slate-300 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-bold font-mono text-blue-700 bg-blue-50/50 px-2 py-0.5 rounded">{item.name}</code>
                          {item.required && <Badge className="bg-red-50 text-red-600 border border-red-100 font-bold hover:bg-red-50 text-[9.5px] px-1.5 py-0">必填</Badge>}
                        </div>
                        <p className="text-sm font-bold text-slate-850">{item.displayName}</p>
                        <div className="flex flex-wrap gap-2 text-[10.5px] text-slate-500 font-sans font-medium">
                          <span className="bg-white px-2 py-0.5 border border-slate-200/50 rounded-sm">
                            <strong className="text-slate-400">类型:</strong> {item.type}
                          </span>
                          {item.format && (
                            <span className="bg-white px-2 py-0.5 border border-slate-200/50 rounded-sm">
                              <strong className="text-slate-400">格式:</strong> {item.format}
                            </span>
                          )}
                          <span className="bg-white px-2 py-0.5 border border-slate-200/50 rounded-sm-sm">
                            {item.multiple ? "⚡ 支持多文件" : "单个文件"}
                          </span>
                          <span className="bg-white px-2 py-0.5 border border-slate-200/50 rounded-sm">
                            <strong className="text-slate-400">来源:</strong> {item.source}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setNewInput({ ...item });
                            setShowAddInputForm(true);
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteInput(item.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-650 hover:bg-red-50/50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Input trigger btn */}
                  {!showAddInputForm && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNewInput({
                          name: "reads_1",
                          displayName: "R1 测序文件",
                          type: "文件",
                          format: "fastq.gz, fq.gz",
                          required: true,
                          multiple: true,
                          source: "用户上传"
                        });
                        setShowAddInputForm(true);
                      }} 
                      className="w-full h-10 border-dashed border-slate-250 bg-white text-slate-500 text-xs hover:text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1.5 text-slate-400" />
                      添加输入项
                    </Button>
                  )}
                </div>

                {/* Input form block nested */}
                {showAddInputForm && (
                  <div className="p-5 border border-slate-200/80 bg-slate-50/50 rounded-2xl space-y-4 text-left animate-fadeIn">
                    <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>{newInput.id ? "编辑输入项" : "新建输入项"}</span>
                      <Badge className="text-[10px] text-slate-400 font-normal">Input Port</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          参数名 <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="reads_1"
                          value={newInput.name}
                          onChange={(e) => setNewInput({...newInput, name: e.target.value})}
                          className="bg-white border-slate-200 h-9 font-mono text-xs"
                        />
                        <p className="text-[9.5px] text-slate-400">英文，如 reads_1, input_path</p>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          显示名称 <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="R1 测序文件"
                          value={newInput.displayName}
                          onChange={(e) => setNewInput({...newInput, displayName: e.target.value})}
                          className="bg-white border-slate-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-bold text-slate-600">输入类型</label>
                        <select 
                          value={newInput.type}
                          onChange={(e) => setNewInput({...newInput, type: e.target.value})}
                          className="w-full bg-white border border-slate-200 text-slate-700 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                        >
                          <option value="文件">文件</option>
                          <option value="目录">目录</option>
                          <option value="字符串">字符串</option>
                          <option value="数值">数值</option>
                        </select>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-bold text-slate-600">文件格式</label>
                        <Input 
                          placeholder="fastq.gz, fq.gz"
                          value={newInput.format}
                          onChange={(e) => setNewInput({...newInput, format: e.target.value})}
                          className="bg-white border-slate-200 h-9 font-mono text-xs"
                        />
                        <p className="text-[9.5px] text-slate-400">多个用逗号分隔，如 fastq.gz, fq.gz</p>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-bold text-slate-600">是否必填</label>
                        <select 
                          value={newInput.required ? "是" : "否"}
                          onChange={(e) => setNewInput({...newInput, required: e.target.value === "是"})}
                          className="w-full bg-white border border-slate-200 text-slate-700 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                        >
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </select>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-bold text-slate-600">是否支持多文件</label>
                        <select 
                          value={newInput.multiple ? "是" : "否"}
                          onChange={(e) => setNewInput({...newInput, multiple: e.target.value === "是"})}
                          className="w-full bg-white border border-slate-200 text-slate-700 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                        >
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </select>
                      </div>

                      <div className="space-y-1 text-left md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600">输入来源</label>
                        <select 
                          value={newInput.source}
                          onChange={(e) => setNewInput({...newInput, source: e.target.value})}
                          className="w-full bg-white border border-slate-200 text-slate-750 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                        >
                          <option value="用户上传">用户上传</option>
                          <option value="上游任务输出部署">上游管道输出</option>
                          <option value="公共数据库匹配">公共数据库</option>
                        </select>
                      </div>

                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <Button onClick={handleAddInput} className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1.5 px-4 font-bold h-8 cursor-pointer rounded-lg">
                        {newInput.id ? "确认修改" : "确认添加"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddInputForm(false)} className="text-xs h-8 cursor-pointer rounded-lg border-slate-200 text-slate-500">
                        取消
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 Content: 参数配置 */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">参数配置</h2>
                  <p className="text-xs text-slate-400 mt-1">定义工具的运行参数，平台的前端表单将根据参数设置自动进行字段校验和UI呈现</p>
                </div>

                {/* Parameters List */}
                <div className="space-y-3">
                  {parameters.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-start justify-between hover:border-slate-350 transition-colors text-left animate-fadeIn">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-bold font-mono text-cyan-705 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">{item.name}</code>
                          <Badge className="bg-slate-100 text-slate-605 border-0 font-bold hover:bg-slate-100 text-[9px] px-1.5 py-0">{item.type}</Badge>
                          {item.displayName && <span className="text-xs text-slate-400 font-medium font-sans">({item.displayName})</span>}
                        </div>

                        {/* Rendering dynamic fields info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                          <div>
                            <span className="text-slate-400">默认值:</span> <code className="font-mono bg-white border px-1.5 py-0.2 select-all rounded text-[11px]">{item.defaultValue || "无"}</code>
                          </div>
                          {item.min !== undefined && (
                            <div>
                              <span className="text-slate-400">最小限制:</span> <code className="font-mono text-xs">{item.min}</code>
                            </div>
                          )}
                          {item.max !== undefined && (
                            <div>
                              <span className="text-slate-400">最大限制:</span> <code className="font-mono text-xs">{item.max}</code>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-[10px] text-slate-450 font-bold">
                            <input type="checkbox" checked={item.required} readOnly className="rounded border-slate-300 w-3 h-3 text-blue-600" />
                            必填参数
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-slate-450 font-bold">
                            <input type="checkbox" checked={item.isAdvanced} readOnly className="rounded border-slate-300 w-3 h-3 text-blue-600" />
                            高级参数
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setNewParam({ ...item });
                            setShowAddParamForm(true);
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteParam(item.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-605 hover:bg-red-50/50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Parameter trigger button */}
                  {!showAddParamForm && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNewParam({
                          name: "",
                          displayName: "",
                          type: "integer",
                          defaultValue: "",
                          required: false,
                          isAdvanced: false,
                          helpText: ""
                        });
                        setShowAddParamForm(true);
                      }} 
                      className="w-full h-10 border-dashed border-slate-250 bg-white text-slate-500 text-xs hover:text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1.5 text-slate-400" />
                      添加参数
                    </Button>
                  )}
                </div>

                {/* Parameter Add form nested */}
                {showAddParamForm && (
                  <div className="p-5 border border-slate-200/80 bg-slate-50/50 rounded-2xl space-y-4 text-left animate-fadeIn">
                    <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>{newParam.id ? "编辑运行参数" : "新建运行参数"}</span>
                      <Badge className="text-[10px] text-slate-400 font-normal">Dynamic Form Item</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          参数名 <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="confidence"
                          value={newParam.name}
                          onChange={(e) => setNewParam({...newParam, name: e.target.value})}
                          className="bg-white border-slate-200 h-9 font-mono text-xs"
                        />
                        <p className="text-[9.5px] text-slate-400">英文，如 threads, clip_length</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          显示名称 <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="置信度阈值"
                          value={newParam.displayName}
                          onChange={(e) => setNewParam({...newParam, displayName: e.target.value})}
                          className="bg-white border-slate-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">参数类型</label>
                        <select 
                          value={newParam.type}
                          onChange={(e) => setNewParam({...newParam, type: e.target.value})}
                          className="w-full bg-white border border-slate-200 text-slate-705 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                        >
                          <option value="integer">integer (整数)</option>
                          <option value="float">float (浮点数)</option>
                          <option value="string">string (字符串)</option>
                          <option value="boolean">boolean (布尔开关)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">默认值</label>
                        <Input 
                          placeholder="0.1"
                          value={newParam.defaultValue}
                          onChange={(e) => setNewParam({...newParam, defaultValue: e.target.value})}
                          className="bg-white border-slate-200 h-9 font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600">帮助说明</label>
                        <Input 
                          placeholder="展示给用户的鼠标悬停描述信息及指引..."
                          value={newParam.helpText}
                          onChange={(e) => setNewParam({...newParam, helpText: e.target.value})}
                          className="bg-white border-slate-200 h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button onClick={handleAddParam} className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1.5 px-4 font-bold h-8 cursor-pointer rounded-lg">
                        {newParam.id ? "确认修改" : "确认添加"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddParamForm(false)} className="text-xs h-8 cursor-pointer rounded-lg border-slate-200 text-slate-500">
                        取消
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5 Content: 输出配置 */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">输出配置</h2>
                  <p className="text-xs text-slate-400 mt-1">定义此分析工具产生的文件/报告输出结构，前端组件根据端口定义自动提取和生成最终质控包</p>
                </div>

                {/* Outputs list container */}
                <div className="space-y-3 text-left animate-fadeIn">
                  {outputs.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-start justify-between hover:border-slate-350 transition-colors text-left animate-fadeIn">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{item.name}</code>
                          {item.required && <Badge className="bg-red-50 text-red-600 border border-red-100 font-bold hover:bg-red-50 text-[9.5px] px-1.5 py-0">必填</Badge>}
                        </div>
                        <p className="text-sm font-bold text-slate-850">{item.displayName}</p>
                        <div className="flex flex-wrap gap-2 text-[10.5px] text-slate-500 font-medium">
                          <span className="bg-white px-2 py-0.5 border border-slate-200/50 rounded-sm">
                            <strong className="text-slate-400">输出类型:</strong> {item.type}
                          </span>
                          <span className="bg-white px-2 py-0.5 border border-slate-200/50 rounded-sm">
                            <strong className="text-slate-400">匹配提取路径:</strong> {item.matchRule}
                          </span>
                          {item.format && (
                            <span className="bg-white px-2 py-0.5 border border-slate-200/50 rounded-sm">
                              <strong className="text-slate-400">格式后缀:</strong> {item.format}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setNewOutput({ ...item });
                            setShowAddOutputForm(true);
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteOutput(item.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-605 hover:bg-red-50/50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Trigger add output button */}
                  {!showAddOutputForm && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNewOutput({
                          name: "",
                          displayName: "",
                          type: "文件",
                          format: "",
                          matchRule: "",
                          required: true
                        });
                        setShowAddOutputForm(true);
                      }} 
                      className="w-full h-10 border-dashed border-slate-250 bg-white text-slate-500 text-xs hover:text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1.5 text-slate-400" />
                      添加输出端口
                    </Button>
                  )}
                </div>

                {/* Nested Output add block */}
                {showAddOutputForm && (
                  <div className="p-5 border border-slate-200/80 bg-slate-50/50 rounded-2xl space-y-4 text-left animate-fadeIn">
                    <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>{newOutput.id ? "编辑输出端口" : "新建输出端口"}</span>
                      <Badge className="text-[10px] text-slate-400 font-normal">Output Port</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          变量名 / 端口Key <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="html_report"
                          value={newOutput.name}
                          onChange={(e) => setNewOutput({...newOutput, name: e.target.value})}
                          className="bg-white border-slate-200 h-9 font-mono text-xs"
                        />
                        <p className="text-[9.5px] text-slate-400">英文数字组合，如 report_out, summary_json</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          显示名称 <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="HTML 质控报告"
                          value={newOutput.displayName}
                          onChange={(e) => setNewOutput({...newOutput, displayName: e.target.value})}
                          className="bg-white border-slate-200 h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">输出类型</label>
                        <select 
                          value={newOutput.type}
                          onChange={(e) => setNewOutput({...newOutput, type: e.target.value})}
                          className="w-full bg-white border border-slate-200 text-slate-705 h-9 px-3 rounded-md text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                        >
                          <option value="文件">特定文件</option>
                          <option value="目录">生成目录</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">格式限制</label>
                        <Input 
                          placeholder="html, report, pdf"
                          value={newOutput.format}
                          onChange={(e) => setNewOutput({...newOutput, format: e.target.value})}
                          className="bg-white border-slate-200 h-9 font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600">匹配规则 / 相对路径 (以工作空间为基准)</label>
                        <Input 
                          placeholder="*.html 或 raw_results/*"
                          value={newOutput.matchRule}
                          onChange={(e) => setNewOutput({...newOutput, matchRule: e.target.value})}
                          className="bg-white border-slate-200 h-9 font-mono text-xs text-left"
                        />
                      </div>

                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button onClick={handleAddOutput} className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1.5 px-4 font-bold h-8 cursor-pointer rounded-lg">
                        {newOutput.id ? "确认修改" : "确认添加"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddOutputForm(false)} className="text-xs h-8 cursor-pointer rounded-lg border-slate-200 text-slate-500">
                        取消
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6 Content: 命令模板 */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-fadeIn text-left">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">命令模板</h2>
                  <p className="text-xs text-slate-400 mt-1">编写工具的执行逻辑，用 <code className="font-mono text-sky-600 bg-sky-50 px-1 rounded">${"{变量名}"}</code> 引用输入和环境配置，提交时自动映射并执行</p>
                </div>

                {/* Dynamic Variables Pill selector */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500">可用变量 (点击插入命令行) :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Raw Hard-coded items linked with user states */}
                    {inputs.map(i => (
                      <button 
                        key={i.id}
                        onClick={() => handleInsertVariable(i.name)}
                        className="px-2.5 py-1 text-[11px] font-mono font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-150 transition cursor-pointer"
                      >
                        ${"{"}{i.name}{"}"}
                      </button>
                    ))}
                    {parameters.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleInsertVariable(p.name)}
                        className="px-2.5 py-1 text-[11px] font-mono font-bold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded border border-cyan-150 transition cursor-pointer"
                      >
                        ${"{"}{p.name}{"}"}
                      </button>
                    ))}
                    {outputs.map(o => (
                      <button 
                        key={o.id}
                        onClick={() => handleInsertVariable(o.name)}
                        className="px-2.5 py-1 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-150 transition cursor-pointer"
                      >
                        ${"{"}{o.name}{"}"}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleInsertVariable("sample_name")}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold bg-slate-55 border text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                    >
                      {"${sample_name}"}
                    </button>
                  </div>
                </div>

                {/* Command Shell Editor Container */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500">命令编辑器 (Command Line Editor)</span>
                  <div className="border border-slate-205 rounded-xl overflow-hidden shadow-xs bg-slate-900">
                    <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        <span className="text-[10px] text-slate-400 font-mono ml-2">bash_script.sh</span>
                      </div>
                      <div className="text-[10.5px] font-mono font-bold text-slate-450 uppercase">BASH</div>
                    </div>
                    <textarea 
                      value={commandTemplate}
                      onChange={(e) => setCommandTemplate(e.target.value)}
                      className="w-full h-32 px-5 py-4 bg-slate-950 font-mono text-[11.5px] leading-relaxed text-blue-200 border-none select-text focus:ring-0 active:ring-0 outline-hidden resize-none"
                    />
                  </div>
                </div>

                {/* Command Evaluated/Evaluations preview */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500">命令预览 (以测试样例数据为例)</span>
                  <div className="bg-slate-50 border border-slate-200 text-slate-650 p-4 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre select-all text-left relative overflow-x-auto shadow-inner">
                    {/* Calculated live substitution mock */}
                    <code>
                      fastqc /input/S001_R1.fastq.gz /input/S001_R2.fastq.gz \<br />
                      {"  "}-t 4 \<br />
                      {"  "}-o /output/results
                    </code>
                    <div className="absolute right-3.5 top-3.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">PREVIEW</div>
                  </div>
                  <p className="text-[9.5px] text-slate-400">预览基于表单字段默认值以及输入项示例，最终执行时采用用户作业提供的具体文件和运行时指定的并发参数</p>
                </div>

                {/* Important notice block colored yellow/amber */}
                <div className="p-4 bg-orange-50 border border-orange-200/60 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-650 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-orange-900 block">测试验证提示</span>
                    <p className="text-[10.5px] text-orange-700 leading-relaxed mt-0.5">
                      工具命令及基础包保存后，将进入「镜像编译及仿真参数测试」阶段，平台容器集群会同时注入测试样例数据，通过沙箱分析验证命令行、资源占比和输出挂载能否完全跑通工作空间读写，确保持续可用。
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Step 7 Content: 测试与发布 */}
            {currentStep === 7 && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn text-left leading-relaxed text-slate-705">
                
                {/* Left Side: Test Data and Run Logs */}
                <div className="xl:col-span-7 space-y-6 flex flex-col">
                  
                  {/* Test Data Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">测试数据配置</h3>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">运行测试前需先选择或上传测试文件</span>
                    </div>

                    {/* Dotted upload zone with copy mock or project file click */}
                    <div 
                      onClick={() => {
                        setSelectedProjectFile("fastq_run_9329_R1.fastq.gz");
                        setLogLines(prev => [...prev, "[08:55:00] [USER] 已选择上传测试文件 fastq_run_9329_R1.fastq.gz"]);
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                        selectedProjectFile ? "border-slate-350 bg-slate-50/50" : "border-slate-200 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="w-8 h-8 text-slate-450" />
                        <span className="text-xs font-semibold text-slate-700">点击上传测试数据，或从项目文件中选择</span>
                        <span className="text-[10px] text-slate-400 font-medium">支持 fastq / fastq.gz，建议文件 &lt; 50 MB</span>
                      </div>
                      {selectedProjectFile && (
                        <div className="mt-3.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-0.5 rounded text-xs font-mono">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3px]" />
                          <span>已选择: {selectedProjectFile}</span>
                        </div>
                      )}
                    </div>

                    {/* Divider or project files */}
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono">或从项目文件选择</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <div className="text-left">
                      <select
                        value={selectedProjectFile}
                        onChange={(e) => {
                          setSelectedProjectFile(e.target.value);
                          if (e.target.value) {
                            setLogLines(prev => [...prev, `[08:55:00] [USER] 从项目中选择测试文件: ${e.target.value}`]);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 h-9 px-3 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-sans"
                      >
                        <option value="">-- 选择项目文件 --</option>
                        <option value="fastq_run_9329_R1.fastq.gz">fastq_run_9329_R1.fastq.gz (42.5 MB)</option>
                        <option value="sample_low_quality_R1.fastq">sample_low_quality_R1.fastq (18.1 MB)</option>
                        <option value="human_genome_sample_rep1_R2.fq.gz">human_genome_sample_rep1_R2.fq.gz (49.8 MB)</option>
                      </select>
                    </div>

                    {/* Test parameters list */}
                    <div className="space-y-3 pt-1">
                      <span className="text-xs font-bold text-slate-700 block">测试参数</span>
                      
                      <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 font-mono text-xs overflow-hidden">
                        
                        <div className="flex justify-between p-3 bg-slate-50/50 hover:bg-slate-50/80 transition-colors">
                          <span className="text-slate-500 font-medium font-sans">threads</span>
                          <span className="font-bold text-slate-800">4</span>
                        </div>

                        <div className="flex justify-between p-3 bg-slate-50/50 hover:bg-slate-50/80 transition-colors">
                          <span className="text-slate-550 font-medium font-sans">nogroup</span>
                          <span className="font-bold text-slate-800">false</span>
                        </div>

                        <div className="flex justify-between p-3 bg-slate-50/50 hover:bg-slate-50/80 transition-colors">
                          <span className="text-slate-550 font-medium font-sans">output_dir</span>
                          <span className="font-bold text-slate-800">/test-output/</span>
                        </div>

                      </div>
                    </div>

                    {/* Alert Info Banner */}
                    <div className="p-3 bg-amber-50/65 border border-amber-100 rounded-xl flex items-start gap-2.5 text-amber-800">
                      <Info className="w-4 h-4 shrink-0 text-amber-550 mt-0.5" />
                      <p className="text-[10.5px] leading-relaxed text-amber-900/80">
                        测试参数默认使用配置中的默认值，如需调整可临时修改
                      </p>
                    </div>

                    {/* Bottom test buttons */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-55">
                      <Button
                        onClick={() => setCurrentStep(6)}
                        variant="outline"
                        className="flex-grow h-9 font-bold bg-white text-slate-600 hover:bg-slate-50 border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-shadow cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        返回修改
                      </Button>

                      <Button
                        onClick={startVerificationTest}
                        disabled={testStatus === "running"}
                        className={`flex-grow h-9 font-bold rounded-lg flex items-center justify-center gap-2 border shadow-2xs transition-all duration-150 cursor-pointer ${
                          testStatus === "running"
                            ? "bg-blue-50 text-blue-500 border-blue-200 cursor-not-allowed"
                            : testStatus === "success"
                            ? "bg-slate-50 hover:bg-slate-105 text-slate-800 border-slate-305 font-semibold"
                            : "bg-white text-slate-900 border-slate-800 hover:bg-slate-50 font-semibold"
                        }`}
                      >
                        {testStatus === "running" ? (
                          <>
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            测试准备中...
                          </>
                        ) : testStatus === "success" ? (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            再测试
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            开始测试
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Execution Log Card */}
                  <div className="bg-white border border-slate-200/85 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 font-sans">运行日志</h3>
                      <span className={`text-[11px] font-mono font-medium ${
                        testStatus === "idle"
                          ? "text-slate-400"
                          : testStatus === "running"
                          ? "text-blue-500 animate-pulse font-bold"
                          : "text-emerald-600 font-bold"
                      }`}>
                        {testStatus === "idle" && "等待测试开始..."}
                        {testStatus === "running" && `运行中 ${testProgress}%`}
                        {testStatus === "success" && "验证通过"}
                      </span>
                    </div>

                    {/* Console box styled in beige/soft warm gray */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-[#fafaf7]">
                      <div className="bg-slate-100/60 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-450 font-mono">
                        <span>stdout_stream</span>
                        <span>{testProgress}%</span>
                      </div>
                      
                      <div className="p-4 font-mono text-[11px] leading-relaxed text-slate-600 flex-1 h-[270px] min-h-[180px] overflow-y-auto block whitespace-pre select-text text-left border-none shadow-inner max-w-full">
                        <div className="space-y-1">
                          {logLines.map((line, idx) => {
                            const safeLine = line || "";
                            const isSuccess = safeLine.includes("[SUCCESS]");
                            const isInfo = safeLine.includes("[INFO]");
                            const isUser = safeLine.includes("[USER]");
                            const isSys = safeLine.includes("[SYSTEM]") || safeLine.includes("[MOUNT]") || safeLine.includes("[JOB]") || safeLine.includes("[DOCKER]");
                            
                            return (
                              <div key={idx} className={`${
                                isSuccess 
                                  ? "text-emerald-650 font-semibold" 
                                  : isInfo 
                                  ? "text-slate-500" 
                                  : isUser 
                                  ? "text-blue-600 font-semibold"
                                  : isSys 
                                  ? "text-slate-800 font-semibold" 
                                  : "text-slate-450"
                              }`}>
                                {safeLine}
                              </div>
                            );
                          })}
                          <div ref={logEndRef} />
                        </div>
                      </div>

                      {/* Log console footer bar */}
                      <div className="bg-slate-100/60 p-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const clipboardText = logLines.join("\n");
                              navigator.clipboard.writeText(clipboardText);
                              setLogLines(prev => [...prev, "[INFO] -- 运行日志也已经复制到了您的剪贴板 --"]);
                            }}
                            className="h-7 text-[10.5px] px-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-600 flex items-center gap-1 cursor-pointer font-sans shadow-3xs font-medium"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            复制日志
                          </button>
                          
                          <button
                            onClick={() => {
                              if (testStatus === "running") {
                                setTestStatus("idle");
                                setCurrentCheckingIndex(-1);
                                setLogLines(prev => [...prev, "[SYSTEM] -- 人工测试终止成功 --"]);
                              }
                            }}
                            disabled={testStatus !== "running"}
                            className="h-7 text-[10.5px] px-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer font-sans shadow-3xs font-medium"
                          >
                            <Square className="w-3 h-3 text-slate-405 fill-slate-400" />
                            终止测试
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => {
                            if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="h-7 w-7 bg-white rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer shadow-3xs"
                        >
                          <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Side: Checklist and Publish Options */}
                <div className="xl:col-span-5 space-y-6 flex flex-col">
                  
                  {/* Checklist Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">校验清单</h3>
                      <span className="text-[11px] font-semibold text-slate-450 font-sans">共 7 项</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { title: "镜像拉取", desc: "验证容器镜像可正常拉取" },
                        { title: "命令生成", desc: "验证变量替换后命令格式正确" },
                        { title: "输入文件挂载", desc: "验证测试文件可挂载进容器" },
                        { title: "工具正常运行", desc: "容器内工具实际执行" },
                        { title: "输出文件匹配", desc: "输出文件符合 Output Port 定义" },
                        { title: "日志采集", desc: "平台可正常收集运行日志" },
                        { title: "结果可识别", desc: "平台可解析结果文件路径" }
                      ].map((chk, index) => {
                        const isCompleting = currentCheckingIndex === index;
                        const isVerified = passedChecks.includes(index);
                        
                        return (
                          <div 
                            key={index}
                            className={`p-3 rounded-xl border flex items-center gap-3.5 transition-all duration-200 text-left ${
                              isCompleting 
                                ? "border-blue-200 bg-blue-50/20" 
                                : isVerified 
                                ? "border-slate-100 bg-slate-50/30" 
                                : "border-slate-100 bg-white"
                            }`}
                          >
                            {/* Checkbox badge circle */}
                            <div className="shrink-0 text-left">
                              {isVerified ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3px]" />
                                </div>
                              ) : isCompleting ? (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-250 bg-slate-50/50" />
                              )}
                            </div>

                            {/* Text labels */}
                            <div className="space-y-0.5 text-left">
                              <span className={`text-xs block font-bold transition-colors ${
                                isVerified ? "text-slate-700" : isCompleting ? "text-blue-900" : "text-slate-450"
                              }`}>
                                {chk.title}
                              </span>
                              <span className={`text-[10px] block font-medium transition-colors ${
                                isVerified ? "text-slate-400" : isCompleting ? "text-blue-500" : "text-slate-400"
                              }`}>
                                {chk.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Publish Strategy Form Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800 font-sans">发布设置</h3>
                      <p className="text-[10px] text-slate-400 font-medium">测试通过后选择发布策略，确认发布后用户可使用此工具</p>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* Option 1 */}
                      <div 
                        onClick={() => setPublishStrategy("default")}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                          publishStrategy === "default"
                            ? "bg-blue-50/30 border-blue-200 shadow-3xs"
                            : "border-slate-150 bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3 text-left">
                          <div className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                            publishStrategy === "default" ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                          }`}>
                            {publishStrategy === "default" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="space-y-0.5 text-left">
                            <span className="text-xs font-bold text-slate-800 block font-sans">设为默认版本并发布</span>
                            <span className="text-[10.5px] text-slate-450 leading-relaxed block font-medium">
                              新建任务默认使用 {basicInfo.version || "v0.11.9"}; 工具库显示此版本; 旧版本保留但不再默认
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Option 2 */}
                      <div 
                        onClick={() => setPublishStrategy("only-publish")}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                          publishStrategy === "only-publish"
                            ? "bg-blue-50/30 border-blue-200 shadow-3xs"
                            : "border-slate-150 bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3 text-left">
                          <div className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                            publishStrategy === "only-publish" ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                          }`}>
                            {publishStrategy === "only-publish" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="space-y-0.5 text-left">
                            <span className="text-xs font-bold text-slate-800 block font-sans">仅发布，不切换默认版本</span>
                            <span className="text-[10.5px] text-slate-450 leading-relaxed block font-medium">
                              新版本可用但不自动切换; 适合灰度验证，用户可手动选择此版本
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        onClick={handleConfirmPublish}
                        disabled={testStatus !== "success"}
                        className={`w-full h-10 font-bold select-none text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          testStatus === "success"
                            ? "bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 shadow-xs"
                            : "bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        确认发布
                      </Button>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Persistent Sticky / Absolute Wizards Footer Navigation actions button */}
          <div className="mt-12 pt-5 border-t border-slate-100 flex items-center justify-between bg-white text-xs">
            {/* Save draft action left aligned */}
            <Button 
              onClick={handleSaveDraft}
              variant="outline" 
              className="h-9 font-bold bg-white text-slate-600 hover:bg-slate-50 border-slate-200 px-4 rounded-lg flex items-center gap-1.5 transition-shadow cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-405" />
              {isSaved ? "已存草稿！" : "存草稿"}
            </Button>

            {/* Stepper logic page togglers */}
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="h-9 font-bold text-slate-600 bg-white hover:bg-slate-55/40 border border-slate-200 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  上一步
                </Button>
              )}

              {currentStep < 6 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="h-9 font-bold bg-slate-900 text-white hover:bg-slate-800 px-5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  下一步
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleTestAndSubmit}
                  className="h-9 font-bold bg-blue-600 text-white hover:bg-blue-700 px-5 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-105 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 mr-0.5" />
                  <b>提交测试</b>
                </Button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Simulator Testing Modal Layer overlay */}
      {isTesting && (
        <div className="fixed inset-0 bg-slate-905/70 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center space-y-6 shadow-2xl border border-slate-100">
            <div className="relative flex justify-center">
              <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center border border-blue-100/50">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">沙箱容器仿真验证中...</h3>
              <p className="text-xs text-slate-400">
                正在容器集群上拉起测试环境，挂载数据目录，比对端口映射参数，并运行 BASH 作业指令。预计耗时约 2 分钟。
              </p>
            </div>
            {/* Live Terminal outputs */}
            <div className="bg-slate-950 p-4 rounded-lg text-left text-[10px] font-mono text-emerald-400 h-28 overflow-y-auto space-y-1 shadow-inner leading-relaxed select-all">
              <div>[SYSTEM]: Allocating nodes...</div>
              <div>[DOCKER]: Spawning container: registry.xxx.com/bio/fastqc...</div>
              <div>[MOUNT]: Binding workspace to /workspace...</div>
              <div>[JOB]: Running fastqc -t 4 -o /workspace/output...</div>
              <div className="animate-pulse text-slate-400">[RUNNING]: Checking execution outputs...</div>
            </div>
          </div>
        </div>
      )}

      {/* Test Completed result report sheet */}
      {showTestResult && (
        <div className="fixed inset-0 bg-slate-905/75 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full mx-4 shadow-2xl border border-slate-100 space-y-5 text-left animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5 font-bold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">沙箱集成仿真测试成功！</h3>
                <p className="text-[11px] text-slate-400">所有挂载点、执行环境与返回逻辑校验均正常</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-105 space-y-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">验证报告详情 (Verification logs)</div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block pb-0.5">镜像加载状态</span>
                  <span className="font-bold text-emerald-600">SUCCESS</span>
                </div>
                <div>
                  <span className="text-slate-400 block pb-0.5">CPU/内存占比配置安全限</span>
                  <span className="font-bold text-slate-800">通过 (0.12s)</span>
                </div>
                <div>
                  <span className="text-slate-400 block pb-0.5">数据目录读写挂载端</span>
                  <span className="font-bold text-slate-800">读取/写入通过</span>
                </div>
                <div>
                  <span className="text-slate-400 block pb-0.5">输出报告验证检查 (*.html)</span>
                  <span className="font-bold text-emerald-600">1个报告提取成功</span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-200" />

              <div className="text-[10px] font-mono leading-relaxed text-slate-450 bg-white/70 p-2.5 rounded border border-slate-100">
                <b>运行耗时</b> : 12.45s<br />
                <b>镜像哈希</b> : sha256:d55f462bb0f074d6cda7101de838a3794b150935d21a22<br />
                <b>任务返回码 (exit code)</b> : 0 (正常退出)
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowTestResult(false)} 
                className="text-xs h-9 font-bold px-4 rounded-lg border-slate-200 text-slate-650"
              >
                返回修改
              </Button>
              <Button 
                onClick={handleConfirmPublish}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-5 rounded-lg shadow-md hover:shadow-lg transition-transform"
              >
                {isEditMode ? "保存修改并应用" : "一键发布工具至公共库"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Final congratulations feedback popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-905/70 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center space-y-6 shadow-2xl border border-slate-100">
            <div className="relative flex justify-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="absolute top-0 right-1/3 text-yellow-500 animate-bounce">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">{isEditMode ? "工具修改成功！" : "新工具发布成功！"}</h3>
              <p className="text-xs text-slate-400">
                {isEditMode ? (
                  <>
                    您修改的分析工具 <strong>{basicInfo.name}</strong> 已成功保存，相关容器运行资源、自定义表单规则以及执行入口已更新。
                  </>
                ) : (
                  <>
                    您新增的分析工具 <strong>FastQC</strong> 已成功入库，相关容器运行资源、自定义表单规则以及执行入口已发布至平台公共工具库。所有研究员均可在作业和分析管道编排中使用。
                  </>
                )}
              </p>
            </div>
            <Button 
              onClick={handleCompleteAll}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
            >
              返回工具管理
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
