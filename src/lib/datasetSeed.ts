export type DatasetCategoryId = "wet" | "omics" | "spectra" | "simulation";
export type QualityStatus = "合格" | "异常" | "待质检";

export interface DatasetRecord {
  id: string;
  name: string;
  category: DatasetCategoryId;
  project: string;
  projectId?: string;
  nodeId?: string;
  node: string;
  instrument: string;
  size: string;
  format: string;
  quality: QualityStatus;
  rsq: string;
  owner: string;
  updatedAt: string;
}

export const PROJECTS = {
  enz: "工业耐高温植酸酶（Phytase）理性重塑与定向进化",
  pet: "高效耐热型 PET 塑料降解酶挖掘与改造",
  virus: "呼吸道病毒高通量筛查研究",
  tumor: "肿瘤免疫微环境单细胞测序",
};

/* 台账种子数据：前 15 条为阶段原始数据集与关键谱图，其余按类别批量生成，合计 48 条 */
const SEED_DATASETS: DatasetRecord[] = [
  { id: "DS-2026-007", name: "植酸酶野生型 vs Mut-T04 NanoDSF 热稳定性扫描原始光谱", category: "spectra", project: PROJECTS.enz, node: "7. 蛋白纯化与质量检测", instrument: "Prometheus NT.48 NanoDSF", size: "4.8 MB", format: ".csv / .pzfx", quality: "合格", rsq: "1.8%", owner: "王雪 博士", updatedAt: "2026-03-18 09:42" },
  { id: "DS-2026-008", name: "植酸酶 Mut-T04 Michaelis-Menten 动力学参数拟合曲线数据", category: "simulation", project: PROJECTS.enz, node: "8. 酶学性质与稳定性表征", instrument: "UV-Vis 紫外可见分光光度计", size: "2.1 MB", format: ".xlsx", quality: "异常", rsq: "4.6%", owner: "王雪 博士", updatedAt: "2026-03-19 16:05" },
  { id: "DS-2026-006", name: "AKTA Pure 蛋白纯化系统 SEC 色谱原始曲线与峰面积积分表", category: "spectra", project: PROJECTS.enz, node: "6. 表达与培养/发酵", instrument: "Cytiva AKTA pure 25", size: "18.4 MB", format: ".raw / .dat", quality: "合格", rsq: "1.2%", owner: "李默然 博士", updatedAt: "2026-03-15 11:20" },
  { id: "DS-2026-PET-05", name: "PETase 降解 PET 薄膜微克产物 HPLC 定量原始谱图", category: "spectra", project: PROJECTS.pet, node: "6. 表达与培养/发酵", instrument: "Agilent 1260 Infinity II HPLC", size: "3.6 MB", format: ".xlsx", quality: "合格", rsq: "2.3%", owner: "赵一凡 副研究员", updatedAt: "2026-03-12 14:38" },
  { id: "DS-2026-PET-04", name: "PETase 突变体文库表达量荧光定量筛查原始数据", category: "wet", project: PROJECTS.pet, node: "6. 表达与培养/发酵", instrument: "Bio-Rad CFX96 实时荧光定量 PCR", size: "5.2 MB", format: ".xlsx", quality: "合格", rsq: "2.0%", owner: "赵一凡 副研究员", updatedAt: "2026-03-11 10:05" },
  { id: "DS-BIO-01-01", name: "01_课题立项与目标定义 原始数据集", category: "wet", project: PROJECTS.enz, node: "课题立项与目标定义", instrument: "AlphaFold / Rosetta 预测流水线", size: "2.4 MB", format: ".csv", quality: "合格", rsq: "1.6%", owner: "李默然 博士", updatedAt: "2026-01-12 09:00" },
  { id: "DS-BIO-01-02", name: "02_基础数据与知识库整理 原始数据集", category: "wet", project: PROJECTS.enz, node: "基础数据与知识库整理", instrument: "AlphaFold / Rosetta 预测流水线", size: "2.4 MB", format: ".csv", quality: "合格", rsq: "1.6%", owner: "李默然 博士", updatedAt: "2026-01-20 09:00" },
  { id: "DS-BIO-01-03", name: "03_计算分析与位点预测 原始数据集", category: "simulation", project: PROJECTS.enz, node: "计算分析与位点预测", instrument: "AlphaFold / Rosetta 预测流水线", size: "2.4 MB", format: ".csv", quality: "合格", rsq: "1.6%", owner: "赵一凡 副研究员", updatedAt: "2026-01-28 09:00" },
  { id: "DS-BIO-01-04", name: "04_突变_文库设计 原始数据集", category: "simulation", project: PROJECTS.enz, node: "突变/文库设计", instrument: "AlphaFold / Rosetta 预测流水线", size: "2.4 MB", format: ".csv", quality: "合格", rsq: "1.6%", owner: "赵一凡 副研究员", updatedAt: "2026-02-04 09:00" },
  { id: "DS-BIO-01-05", name: "05_基因合成与载体构建 原始数据集", category: "wet", project: PROJECTS.enz, node: "基因合成与载体构建", instrument: "AKTA pure / HPLC", size: "2.4 MB", format: ".csv", quality: "合格", rsq: "1.6%", owner: "李默然 博士", updatedAt: "2026-02-12 09:00" },
  { id: "DS-BIO-01-06", name: "06_表达与培养_发酵 原始数据集", category: "wet", project: PROJECTS.enz, node: "表达与培养/发酵", instrument: "AKTA pure / HPLC", size: "2.4 MB", format: ".csv", quality: "合格", rsq: "1.6%", owner: "王雪 博士", updatedAt: "2026-02-20 09:00" },
  { id: "DS-BIO-01-07", name: "07_蛋白纯化与质量检测 原始数据集", category: "wet", project: PROJECTS.enz, node: "蛋白纯化与质量检测", instrument: "AKTA pure / HPLC", size: "3.1 MB", format: ".csv", quality: "合格", rsq: "1.4%", owner: "王雪 博士", updatedAt: "2026-02-26 09:00" },
  { id: "DS-BIO-01-08", name: "08_酶学性质与稳定性表征 原始数据集", category: "wet", project: PROJECTS.enz, node: "酶学性质与稳定性表征", instrument: "UV-Vis 紫外可见分光光度计", size: "3.4 MB", format: ".csv", quality: "合格", rsq: "1.5%", owner: "王雪 博士", updatedAt: "2026-03-04 09:00" },
  { id: "DS-BIO-01-09", name: "09_迭代优化与下一轮目标设计 原始数据集", category: "simulation", project: PROJECTS.enz, node: "迭代优化与下一轮目标设计", instrument: "AlphaFold / Rosetta 预测流水线", size: "4.2 MB", format: ".csv", quality: "待质检", rsq: "-", owner: "赵一凡 副研究员", updatedAt: "2026-03-10 09:00" },
  { id: "DS-BIO-01-10", name: "10_中试放大与工艺验证 原始数据集", category: "wet", project: PROJECTS.enz, node: "中试放大与工艺验证", instrument: "Cytiva AKTA pure 25", size: "6.8 MB", format: ".xlsx", quality: "合格", rsq: "1.9%", owner: "李默然 博士", updatedAt: "2026-03-14 09:00" },
];
/* 批量补足台账数据：组学与测序 / 精密仪器原始谱图 / 动力学与计算拟合 */
const OMICS_SEED = [
  ["呼吸道病毒筛查 VIR-2026-021 宏基因组测序原始数据", PROJECTS.virus, "5. 基因合成与载体构建", "Illumina NovaSeq 6000", "8.6 GB", ".fastq.gz"],
  ["呼吸道病毒筛查 VIR-2026-022 宏基因组测序原始数据", PROJECTS.virus, "5. 基因合成与载体构建", "Illumina NovaSeq 6000", "9.2 GB", ".fastq.gz"],
  ["呼吸道病毒筛查 VIR-2026-023 转录组测序原始数据", PROJECTS.virus, "5. 基因合成与载体构建", "Illumina NovaSeq 6000", "7.4 GB", ".fastq.gz"],
  ["呼吸道病毒筛查 VIR-2026-024 靶向扩增子测序原始数据", PROJECTS.virus, "5. 基因合成与载体构建", "Illumina MiSeq", "1.2 GB", ".fastq.gz"],
  ["肿瘤免疫微环境 TIL-2026-011 单细胞 5' 转录组原始数据", PROJECTS.tumor, "4. 突变/文库设计", "10x Genomics Chromium X", "24.6 GB", ".fastq.gz"],
  ["肿瘤免疫微环境 TIL-2026-012 单细胞 TCR 免疫组库原始数据", PROJECTS.tumor, "4. 突变/文库设计", "10x Genomics Chromium X", "6.8 GB", ".fastq.gz"],
  ["肿瘤免疫微环境 TIL-2026-013 空间转录组原始数据", PROJECTS.tumor, "4. 突变/文库设计", "10x Genomics Visium", "12.4 GB", ".fastq.gz / .h5"],
  ["植酸酶 AppA 突变体库 T04 全质粒测序原始数据", PROJECTS.enz, "5. 基因合成与载体构建", "Illumina NextSeq 2000", "3.2 GB", ".fastq.gz"],
  ["PETase 突变体库中试发酵菌株全基因组重测序数据", PROJECTS.pet, "6. 表达与培养/发酵", "Illumina NextSeq 2000", "5.6 GB", ".fastq.gz"],
  ["PETase 降解菌群富集样本 16S rRNA 扩增子原始数据", PROJECTS.pet, "6. 表达与培养/发酵", "Illumina MiSeq", "1.8 GB", ".fastq.gz"],
  ["肿瘤免疫微环境 TIL-2026-014 单细胞 BCR 免疫组库原始数据", PROJECTS.tumor, "4. 突变/文库设计", "10x Genomics Chromium X", "6.1 GB", ".fastq.gz"],
];

const SPECTRA_SEED = [
  ["植酸酶 Mut-T04 圆二色光谱热变性曲线原始谱图", PROJECTS.enz, "8. 酶学性质与稳定性表征", "Jasco J-1500 圆二色光谱仪", "2.2 MB", ".csv / .jws"],
  ["植酸酶 AppA 野生型与突变体 FTIR 二级结构比对谱图", PROJECTS.enz, "8. 酶学性质与稳定性表征", "Thermo Nicolet iS50 FTIR", "3.8 MB", ".spa / .csv"],
  ["植酸酶样品 SEC-MALS 分子量与聚集体分析原始谱图", PROJECTS.enz, "7. 蛋白纯化与质量检测", "Wyatt DAWN SEC-MALS", "5.4 MB", ".raw / .dat"],
  ["植酸酶样品 LC-MS 肽段指纹图谱原始质谱数据", PROJECTS.enz, "7. 蛋白纯化与质量检测", "Thermo Q Exactive HF-X 质谱仪", "126.5 MB", ".raw / .mzML"],
  ["PETase 突变体差示扫描量热 DSC 热稳定性原始谱图", PROJECTS.pet, "8. 酶学性质与稳定性表征", "TA Instruments DSC 250", "2.6 MB", ".xlsx"],
  ["PETase 降解产物 GC-MS 定性定量原始谱图", PROJECTS.pet, "6. 表达与培养/发酵", "Agilent 8890-5977 GC-MS", "14.2 MB", ".raw / .ms"],
  ["PETase 酶-底物结合 ITC 等温滴定量热原始谱图", PROJECTS.pet, "8. 酶学性质与稳定性表征", "Malvern MicroCal PEAQ-ITC", "1.9 MB", ".csv"],
  ["呼吸道病毒样本 Sanger 测序峰图原始文件", PROJECTS.virus, "5. 基因合成与载体构建", "Applied Biosystems 3500 测序仪", "980 KB", ".ab1 / .seq"],
  ["肿瘤免疫微环境样本流式细胞术荧光补偿原始谱图", PROJECTS.tumor, "4. 突变/文库设计", "BD FACSymphony A5 流式细胞仪", "22.8 MB", ".fcs"],
  ["肿瘤免疫微环境样本免疫组化全片扫描原始图像", PROJECTS.tumor, "4. 突变/文库设计", "Leica Aperio GT450 数字切片扫描仪", "864.2 MB", ".svs"],
  ["植酸酶样品 NanoDrop 蛋白定量与纯度原始记录谱图", PROJECTS.enz, "7. 蛋白纯化与质量检测", "Thermo NanoDrop One", "640 KB", ".csv"],
];

const SIMULATION_SEED = [
  ["AppA 突变体二硫键网络刚性化设计 Rosetta 打分矩阵", PROJECTS.enz, "3. 计算分析与位点预测", "AlphaFold / Rosetta 预测流水线", "6.4 MB", ".csv / .sc"],
  ["AppA 活性中心 5 Å 邻域残基柔性预测结果", PROJECTS.enz, "3. 计算分析与位点预测", "GROMACS 分子动力学集群", "18.6 MB", ".csv / .pdb"],
  ["AppA Mut-T04 85℃ 高温模拟轨迹与 RMSD 统计", PROJECTS.enz, "9. 迭代优化与下一轮目标设计", "GROMACS 分子动力学集群", "1.4 GB", ".xtc / .csv"],
  ["AppA 突变体结合自由能 MM/PBSA 计算结果", PROJECTS.enz, "9. 迭代优化与下一轮目标设计", "GROMACS 分子动力学集群", "12.4 MB", ".csv"],
  ["PETase 突变体底物通道柔性对接打分结果", PROJECTS.pet, "3. 计算分析与位点预测", "AutoDock Vina 批量对接流水线", "8.8 MB", ".csv / .pdbqt"],
  ["PETase 突变体热稳定性预测 ΔΔG 全库扫描结果", PROJECTS.pet, "3. 计算分析与位点预测", "AlphaFold / Rosetta 预测流水线", "9.6 MB", ".csv"],
  ["PETase 降解中间体反应路径 DFT 能垒计算结果", PROJECTS.pet, "8. 酶学性质与稳定性表征", "Gaussian 16 量子化学计算节点", "42.1 MB", ".log / .csv"],
  ["呼吸道病毒表面蛋白结构预测模型输出结果", PROJECTS.virus, "3. 计算分析与位点预测", "AlphaFold / Rosetta 预测流水线", "268.4 MB", ".pdb / .json"],
  ["肿瘤免疫微环境 TCR 克隆型聚类与动力学拟合结果", PROJECTS.tumor, "4. 突变/文库设计", "Scirpy / MiXCR 免疫组库分析流水线", "16.2 MB", ".csv / .h5ad"],
  ["肿瘤免疫微环境细胞通讯配受体动力学拟合结果", PROJECTS.tumor, "4. 突变/文库设计", "CellChat 细胞通讯分析流水线", "11.8 MB", ".csv / .rds"],
  ["植酸酶酶催化速率常数 kcat/Km 拟合与置信区间数据", PROJECTS.enz, "8. 酶学性质与稳定性表征", "GraphPad Prism 非线性拟合", "1.6 MB", ".pzfx / .csv"],
];

export function getSeedDatasets(): DatasetRecord[] {
  const records: DatasetRecord[] = [...SEED_DATASETS];
  const qualityCycle: QualityStatus[] = ["合格", "合格", "合格", "合格", "异常"];
  const rsqQualified = ["1.2%", "1.4%", "1.6%", "1.8%", "2.0%", "2.3%", "2.5%", "3.1%"];
  const owners = ["李默然 博士", "王雪 博士", "赵一凡 副研究员", "刘敏 工程师"];

  const push = (rows: string[][], category: DatasetCategoryId, idPrefix: string) => {
    rows.forEach((row, index) => {
      const name = row[0];
      const project = row[1];
      const node = row[2];
      const instrument = row[3];
      const size = row[4];
      const format = row[5];
      const quality = qualityCycle[(index + records.length) % qualityCycle.length];
      records.push({
        id: idPrefix + "-" + String(index + 1).padStart(2, "0"),
        name,
        category,
        project,
        node,
        instrument,
        size,
        format,
        quality,
        rsq: quality === "合格" ? rsqQualified[(index * 3) % rsqQualified.length] : quality === "异常" ? "4.6%" : "-",
        owner: owners[(index + 1) % owners.length],
        updatedAt: "2026-0" + String((index % 3) + 1) + "-" + String((index % 27) + 1).padStart(2, "0") + " 1" + String(index % 9) + ":0" + String(index % 6),
      });
    });
  };

  push(OMICS_SEED, "omics", "DS-OMICS-2026");
  push(SPECTRA_SEED, "spectra", "DS-SPEC-2026");
  push(SIMULATION_SEED, "simulation", "DS-SIM-2026");

  return records;
}
export const PROJECT_ALIASES: Record<string, string> = { [PROJECTS.enz]: "enz-01", [PROJECTS.pet]: "pet-02", [PROJECTS.virus]: "1", [PROJECTS.tumor]: "2" };
