import { useState, useMemo } from "react";
import { 
  Database, 
  Search, 
  Filter, 
  Info, 
  Globe, 
  ShieldAlert, 
  Activity,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Microscope,
  Bug,
  Dna,
  RotateCcw,
  Layers,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface TaxonomyHierarchy {
  superkingdom: string; // 域/界
  phylum: string;       // 门
  class: string;        // 纲
  order: string;        // 目
  family: string;       // 科
  genus: string;        // 属
  species: string;      // 种
}

export interface Pathogen {
  id: string;
  name: string;
  englishName: string;
  latinName: string;
  alias?: string[];
  type: '细菌' | '病毒' | '真菌' | '寄生虫' | '分枝杆菌' | '支原体/衣原体';
  bsl: 'BSL-1' | 'BSL-2' | 'BSL-3' | 'BSL-4';
  rank: 'species' | 'genus' | 'subspecies';
  taxonomy: TaxonomyHierarchy;
  relatedDiseases: string;
  source: 'NCBI' | 'FDA-ARGOS' | 'FungiDB' | 'BV-BRC';
  isKey: boolean;
  updateTime: string;
  taxonomyPath: string;
  pathogenicity: string;
  transmission: string;
  clinicalManifestation: string;
  susceptiblePopulation: string;
  ncbiTaxId: string;
  refSeqId: string;
  genomeSummary: string;
  sourceUrl: string;
}

const MOCK_PATHOGENS: Pathogen[] = [
  {
    id: "PAT-010",
    name: "无害梭菌",
    englishName: "Clostridium innocuum",
    latinName: "Clostridium innocuum",
    alias: ["无害梭状芽孢杆菌"],
    type: "细菌",
    bsl: "BSL-1",
    rank: "species",
    taxonomy: {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "厚壁菌门 (Firmicutes)",
      class: "梭菌纲 (Clostridia)",
      order: "梭菌目 (Clostridiales)",
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      species: "Clostridium innocuum (无害梭菌)"
    },
    relatedDiseases: "肠道菌群失调、机会性败血症、神经毒素弱感染",
    source: "BV-BRC",
    isKey: true,
    updateTime: "2026-05-18",
    taxonomyPath: "细菌 / 厚壁菌门 / 梭菌纲 / 梭菌目 / 梭菌科 / Clostridium / Clostridium innocuum",
    pathogenicity: "以往被视为低致病性肠道共生菌，近期研究发现其可引起肠道移位及耐药性机会感染。",
    transmission: "内源性菌群移位、消化道传播。",
    clinicalManifestation: "腹泻、腹痛、免疫受损患者可能出现发热及脓毒血症。",
    susceptiblePopulation: "长期使用广谱抗生素者、免疫功能低下患者。",
    ncbiTaxId: "29388",
    refSeqId: "NC_018610.1",
    genomeSummary: "双链 DNA，基因组约 4.1 Mb，编码万古霉素非典型耐药基因簇。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/29388"
  },
  {
    id: "PAT-011",
    name: "产气荚膜梭菌",
    englishName: "Clostridium perfringens",
    latinName: "Clostridium perfringens",
    alias: ["韦氏梭菌"],
    type: "细菌",
    bsl: "BSL-2",
    rank: "species",
    taxonomy: {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "厚壁菌门 (Firmicutes)",
      class: "梭菌纲 (Clostridia)",
      order: "梭菌目 (Clostridiales)",
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      species: "Clostridium perfringens (产气荚膜梭菌)"
    },
    relatedDiseases: "气性坏疽、细菌性食物中毒、坏死性肠炎",
    source: "FDA-ARGOS",
    isKey: true,
    updateTime: "2026-05-12",
    taxonomyPath: "细菌 / 厚壁菌门 / 梭菌纲 / 梭菌目 / 梭菌科 / Clostridium / Clostridium perfringens",
    pathogenicity: "产生 α 毒素 (磷脂酶 C)、肠毒素 (CPE) 等多种外毒素，引发组织坏死。",
    transmission: "创口污染、经口摄入受污染食物。",
    clinicalManifestation: "伤口剧痛、组织气肿、恶臭分泌物、严重者迅速发生休克。",
    susceptiblePopulation: "创伤、战伤、创口受泥土污染者、饮食不洁者。",
    ncbiTaxId: "1502",
    refSeqId: "NC_003366.1",
    genomeSummary: "双链 DNA，约 3.2 Mb，含质粒外毒素基因编码区。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/1502"
  },
  {
    id: "PAT-012",
    name: "艰难梭菌",
    englishName: "Clostridioides difficile",
    latinName: "Clostridioides difficile",
    alias: ["艰难梭状芽孢杆菌"],
    type: "细菌",
    bsl: "BSL-2",
    rank: "species",
    taxonomy: {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "厚壁菌门 (Firmicutes)",
      class: "梭菌纲 (Clostridia)",
      order: "梭菌目 (Clostridiales)",
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      species: "Clostridium difficile (艰难梭菌)"
    },
    relatedDiseases: "伪膜性肠炎、抗生素相关性腹泻 (AAD)",
    source: "NCBI",
    isKey: true,
    updateTime: "2026-04-28",
    taxonomyPath: "细菌 / 厚壁菌门 / 梭菌纲 / 梭菌目 / 梭菌科 / Clostridium / Clostridium difficile",
    pathogenicity: "分泌毒素 A (TcdA，肠毒素) 和毒素 B (TcdB，细胞毒素)，破坏肠上皮屏障。",
    transmission: "粪-口途径传播，芽孢可在医院环境中长期存活。",
    clinicalManifestation: "水样腹泻、发热、腹痛、伪膜性肠炎、重症可致毒性巨结肠。",
    susceptiblePopulation: "住院患者、长期使用抗生素者、老年人。",
    ncbiTaxId: "1496",
    refSeqId: "NC_009089.1",
    genomeSummary: "双链 DNA，约 4.3 Mb，含致病性转座子与毒素基因岛。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/1496"
  },
  {
    id: "PAT-013",
    name: "破伤风梭菌",
    englishName: "Clostridium tetani",
    latinName: "Clostridium tetani",
    alias: ["破伤风杆菌"],
    type: "细菌",
    bsl: "BSL-2",
    rank: "species",
    taxonomy: {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "厚壁菌门 (Firmicutes)",
      class: "梭菌纲 (Clostridia)",
      order: "梭菌目 (Clostridiales)",
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      species: "Clostridium tetani (破伤风梭菌)"
    },
    relatedDiseases: "破伤风",
    source: "NCBI",
    isKey: true,
    updateTime: "2026-04-20",
    taxonomyPath: "细菌 / 厚壁菌门 / 梭菌纲 / 梭菌目 / 梭菌科 / Clostridium / Clostridium tetani",
    pathogenicity: "产生破伤风痉挛毒素 (Tetanospasmin)，阻断抑制性神经递质释放。",
    transmission: "深部缺氧创口污染土壤芽孢。",
    clinicalManifestation: "苦笑面容、牙关紧闭、角弓反张、强直性痉挛。",
    susceptiblePopulation: "未接种破伤风类毒素者、深创伤患者。",
    ncbiTaxId: "1425",
    refSeqId: "NC_004557.1",
    genomeSummary: "双链 DNA，约 2.8 Mb，由质粒 pCL1 编码破伤风毒素。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/1425"
  },
  {
    id: "PAT-014",
    name: "肉毒梭菌",
    englishName: "Clostridium botulinum",
    latinName: "Clostridium botulinum",
    alias: ["肉毒杆菌"],
    type: "细菌",
    bsl: "BSL-3",
    rank: "species",
    taxonomy: {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "厚壁菌门 (Firmicutes)",
      class: "梭菌纲 (Clostridia)",
      order: "梭菌目 (Clostridiales)",
      family: "梭菌科 (Clostridiaceae)",
      genus: "Clostridium (梭菌属)",
      species: "Clostridium botulinum (肉毒梭菌)"
    },
    relatedDiseases: "肉毒毒素中毒、婴儿肉毒中毒",
    source: "FDA-ARGOS",
    isKey: true,
    updateTime: "2026-05-02",
    taxonomyPath: "细菌 / 厚壁菌门 / 梭菌纲 / 梭菌目 / 梭菌科 / Clostridium / Clostridium botulinum",
    pathogenicity: "产生已知毒性最强的肉毒神经毒素 (BoNT A-G 型)，阻断乙酰胆碱释放。",
    transmission: "食入罐头或发酵食品中毒素、创口芽孢感染。",
    clinicalManifestation: "复视、斜视、吞咽困难、呼吸肌麻痹致死。",
    susceptiblePopulation: "摄入未彻底加热发酵食品者、婴儿。",
    ncbiTaxId: "1491",
    refSeqId: "NC_009495.1",
    genomeSummary: "双链 DNA，约 3.8 Mb，含不同血清型 BoNT 噬菌体/质粒岛。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/1491"
  },
  {
    id: "PAT-001",
    name: "人类免疫缺陷病毒 (HIV-1)",
    englishName: "Human Immunodeficiency Virus 1",
    latinName: "Human Immunodeficiency Virus 1",
    alias: ["艾滋病病毒"],
    type: "病毒",
    bsl: "BSL-3",
    rank: "species",
    taxonomy: {
      superkingdom: "正核正核病毒域 (Riboviria)",
      phylum: "逆转录病毒门 (Artiverviricota)",
      class: "Revtraviricetes 纲",
      order: "Ortervirales 目",
      family: "逆转录病毒科 (Retroviridae)",
      genus: "Lentivirus (慢病毒属)",
      species: "HIV-1 (人类免疫缺陷病毒1型)"
    },
    relatedDiseases: "获得性免疫缺陷综合征 (AIDS)",
    source: "NCBI",
    isKey: true,
    updateTime: "2026-04-15",
    taxonomyPath: "病毒 / 逆转录病毒门 / Revtraviricetes / Ortervirales / 逆转录病毒科 / Lentivirus / HIV-1",
    pathogenicity: "主要攻击人体免疫系统中的 CD4+ T 淋巴细胞，导致免疫功能缺陷。",
    transmission: "血液传播、性传播、母婴传播。",
    clinicalManifestation: "发热、乏力、淋巴结肿大，后期出现各种机会性感染和肿瘤。",
    susceptiblePopulation: "全人群易感，高危行为人群风险更高。",
    ncbiTaxId: "11676",
    refSeqId: "NC_001722.1",
    genomeSummary: "单股正链 RNA，约 9.7 kb。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/11676"
  },
  {
    id: "PAT-003",
    name: "结核分枝杆菌",
    englishName: "Mycobacterium tuberculosis",
    latinName: "Mycobacterium tuberculosis",
    alias: ["结核杆菌"],
    type: "分枝杆菌",
    bsl: "BSL-3",
    rank: "species",
    taxonomy: {
      superkingdom: "细菌域 (Bacteria)",
      phylum: "放线菌门 (Actinomycetota)",
      class: "放线菌纲 (Actinomycetes)",
      order: "分枝杆菌目 (Mycobacteriales)",
      family: "分枝杆菌科 (Mycobacteriaceae)",
      genus: "Mycobacterium (分枝杆菌属)",
      species: "Mycobacterium tuberculosis (结核分枝杆菌)"
    },
    relatedDiseases: "结核病 (肺结核、淋巴结核等)",
    source: "NCBI",
    isKey: true,
    updateTime: "2026-04-12",
    taxonomyPath: "细菌 / 放线菌门 / 放线菌纲 / 分枝杆菌目 / 分枝杆菌科 / Mycobacterium / Mycobacterium tuberculosis",
    pathogenicity: "胞内寄生，引起慢性肉芽肿性炎症。",
    transmission: "呼吸道飞沫传播。",
    clinicalManifestation: "长期低热、咳嗽、咳痰、咯血、盗汗、消瘦。",
    susceptiblePopulation: "免疫力低下者，如老年人、HIV感染者。",
    ncbiTaxId: "1773",
    refSeqId: "NC_000962.3",
    genomeSummary: "双链 DNA，约 4.4 Mb，高 GC 含量。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/1773"
  },
  {
    id: "PAT-004",
    name: "新型冠状病毒 (SARS-CoV-2)",
    englishName: "SARS-CoV-2",
    latinName: "Severe Acute Respiratory Syndrome Coronavirus 2",
    alias: ["新冠病毒", "2019-nCoV"],
    type: "病毒",
    bsl: "BSL-3",
    rank: "species",
    taxonomy: {
      superkingdom: "正核正核病毒域 (Riboviria)",
      phylum: "网巢病毒门 (Pisuviricota)",
      class: "Pisoniviricetes 纲",
      order: "尼多病毒目 (Nidovirales)",
      family: "冠状病毒科 (Coronaviridae)",
      genus: "Betacoronavirus (乙型冠状病毒属)",
      species: "SARS-CoV-2"
    },
    relatedDiseases: "2019冠状病毒病 (COVID-19)",
    source: "NCBI",
    isKey: true,
    updateTime: "2026-04-14",
    taxonomyPath: "病毒 / 网巢病毒门 / Pisoniviricetes / 尼多病毒目 / 冠状病毒科 / Betacoronavirus / SARS-CoV-2",
    pathogenicity: "通过 ACE2 受体进入细胞，引起多系统炎症反应。",
    transmission: "呼吸道飞沫、密切接触、气溶胶。",
    clinicalManifestation: "发热、干咳、乏力、嗅觉味觉减退、肺炎。",
    susceptiblePopulation: "全人群易感。",
    ncbiTaxId: "2697049",
    refSeqId: "NC_045512.2",
    genomeSummary: "单股正链 RNA，约 29.9 kb。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/2697049"
  },
  {
    id: "PAT-005",
    name: "白色念珠菌",
    englishName: "Candida albicans",
    latinName: "Candida albicans",
    alias: ["白假丝酵母菌"],
    type: "真菌",
    bsl: "BSL-1",
    rank: "species",
    taxonomy: {
      superkingdom: "真核生物域 (Eukaryota)",
      phylum: "子囊菌门 (Ascomycota)",
      class: "酵母菌纲 (Saccharomycetes)",
      order: "酵母菌目 (Saccharomycetales)",
      family: "酵母科 (Saccharomycetaceae)",
      genus: "Candida (念珠菌属)",
      species: "Candida albicans (白色念珠菌)"
    },
    relatedDiseases: "念珠菌病、浅表皮肤真菌感染",
    source: "FungiDB",
    isKey: false,
    updateTime: "2026-03-20",
    taxonomyPath: "真菌 / 子囊菌门 / 酵母菌纲 / 酵母菌目 / 酵母科 / Candida / Candida albicans",
    pathogenicity: "机会致病菌，在免疫受损时引起浅表或系统感染。",
    transmission: "内源性感染为主，也可通过接触传播。",
    clinicalManifestation: "鹅口疮、阴道炎、内脏感染。",
    susceptiblePopulation: "长期使用抗生素、激素或免疫抑制剂者。",
    ncbiTaxId: "5476",
    refSeqId: "NC_032089.1",
    genomeSummary: "二倍体真菌，基因组约 14.3 Mb。",
    sourceUrl: "https://fungidb.org/fungidb/app/record/organism/5476"
  },
  {
    id: "PAT-006",
    name: "恶性疟原虫",
    englishName: "Plasmodium falciparum",
    latinName: "Plasmodium falciparum",
    alias: ["热带疟原虫"],
    type: "寄生虫",
    bsl: "BSL-2",
    rank: "species",
    taxonomy: {
      superkingdom: "真核生物域 (Eukaryota)",
      phylum: "顶复门 (Apicomplexa)",
      class: "类孢子虫纲 (Aconoidasida)",
      order: "血孢子虫目 (Haemosporida)",
      family: "疟原虫科 (Plasmodiidae)",
      genus: "Plasmodium (疟原虫属)",
      species: "Plasmodium falciparum (恶性疟原虫)"
    },
    relatedDiseases: "恶性疟疾、脑型疟",
    source: "BV-BRC",
    isKey: true,
    updateTime: "2026-05-10",
    taxonomyPath: "寄生虫 / 顶复门 / 类孢子虫纲 / 血孢子虫目 / 疟原虫科 / Plasmodium / Plasmodium falciparum",
    pathogenicity: "寄生于红细胞内，表达 PfEMP1 粘附分子导致微血管堵塞。",
    transmission: "按蚊叮咬传播。",
    clinicalManifestation: "周期性寒战、高热、大汗、贫血、脾大。",
    susceptiblePopulation: "疟疾流行区居民、未获得免疫能力的游客。",
    ncbiTaxId: "5833",
    refSeqId: "NC_000910.2",
    genomeSummary: "单倍体真核生物，14 条染色体约 23.3 Mb。",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/taxonomy/5833"
  }
];

const stats = [
  { label: "总病原体数", value: "20,452", icon: Database, color: "text-blue-500" },
  { label: "细菌", value: "10,230", icon: Bug, color: "text-orange-500" },
  { label: "病毒", value: "8,120", icon: Activity, color: "text-red-500" },
  { label: "真菌", value: "1,150", icon: Microscope, color: "text-purple-500" },
  { label: "寄生虫", value: "642", icon: Globe, color: "text-green-500" },
  { label: "分枝杆菌", value: "155", icon: ShieldAlert, color: "text-yellow-600" },
  { label: "支原体/衣原体", value: "155", icon: Dna, color: "text-cyan-500" },
];

export function PathogenDatabase({ onSelectPathogen }: { onSelectPathogen: (p: Pathogen) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPathogen, setSelectedPathogen] = useState<Pathogen | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  // Taxonomy Cascade Filter States
  const [selectedPhylum, setSelectedPhylum] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<string>("all");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [selectedGenus, setSelectedGenus] = useState<string>("all");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");

  // Hierarchy Matching Logic: 'include_lower' (包含下级物种 - default) | 'exact_rank' (仅看该层级命中)
  const [matchLogic, setMatchLogic] = useState<'include_lower' | 'exact_rank'>('include_lower');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dynamic options for Taxonomy Cascading Selector
  const availablePhyla = useMemo(() => {
    return Array.from(new Set(MOCK_PATHOGENS.map(p => p.taxonomy.phylum)));
  }, []);

  const availableClasses = useMemo(() => {
    return Array.from(new Set(
      MOCK_PATHOGENS
        .filter(p => selectedPhylum === "all" || p.taxonomy.phylum === selectedPhylum)
        .map(p => p.taxonomy.class)
    ));
  }, [selectedPhylum]);

  const availableOrders = useMemo(() => {
    return Array.from(new Set(
      MOCK_PATHOGENS
        .filter(p => (selectedPhylum === "all" || p.taxonomy.phylum === selectedPhylum) &&
                     (selectedClass === "all" || p.taxonomy.class === selectedClass))
        .map(p => p.taxonomy.order)
    ));
  }, [selectedPhylum, selectedClass]);

  const availableFamilies = useMemo(() => {
    return Array.from(new Set(
      MOCK_PATHOGENS
        .filter(p => (selectedPhylum === "all" || p.taxonomy.phylum === selectedPhylum) &&
                     (selectedClass === "all" || p.taxonomy.class === selectedClass) &&
                     (selectedOrder === "all" || p.taxonomy.order === selectedOrder))
        .map(p => p.taxonomy.family)
    ));
  }, [selectedPhylum, selectedClass, selectedOrder]);

  const availableGenera = useMemo(() => {
    return Array.from(new Set(
      MOCK_PATHOGENS
        .filter(p => (selectedPhylum === "all" || p.taxonomy.phylum === selectedPhylum) &&
                     (selectedClass === "all" || p.taxonomy.class === selectedClass) &&
                     (selectedOrder === "all" || p.taxonomy.order === selectedOrder) &&
                     (selectedFamily === "all" || p.taxonomy.family === selectedFamily))
        .map(p => p.taxonomy.genus)
    ));
  }, [selectedPhylum, selectedClass, selectedOrder, selectedFamily]);

  const availableSpecies = useMemo(() => {
    return Array.from(new Set(
      MOCK_PATHOGENS
        .filter(p => (selectedPhylum === "all" || p.taxonomy.phylum === selectedPhylum) &&
                     (selectedClass === "all" || p.taxonomy.class === selectedClass) &&
                     (selectedOrder === "all" || p.taxonomy.order === selectedOrder) &&
                     (selectedFamily === "all" || p.taxonomy.family === selectedFamily) &&
                     (selectedGenus === "all" || p.taxonomy.genus === selectedGenus))
        .map(p => p.taxonomy.species)
    ));
  }, [selectedPhylum, selectedClass, selectedOrder, selectedFamily, selectedGenus]);

  // Reset Cascade Filters
  const handleResetTaxonomyFilters = () => {
    setSelectedPhylum("all");
    setSelectedClass("all");
    setSelectedOrder("all");
    setSelectedFamily("all");
    setSelectedGenus("all");
    setSelectedSpecies("all");
    setMatchLogic("include_lower");
  };

  // Main Filtering Logic
  const filteredPathogens = useMemo(() => {
    return MOCK_PATHOGENS.filter(p => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        p.name.toLowerCase().includes(query) ||
        p.englishName.toLowerCase().includes(query) ||
        p.latinName.toLowerCase().includes(query) ||
        p.taxonomyPath.toLowerCase().includes(query) ||
        p.taxonomy.genus.toLowerCase().includes(query) ||
        p.taxonomy.phylum.toLowerCase().includes(query) ||
        (p.alias && p.alias.some(a => a.toLowerCase().includes(query)));
      
      const matchesType = filterType === "all" || p.type === filterType;
      const matchesSource = filterSource === "all" || p.source === filterSource;

      // Taxonomy level matching
      let matchesTaxonomy = true;
      if (selectedSpecies !== "all") {
        matchesTaxonomy = p.taxonomy.species === selectedSpecies;
      } else if (selectedGenus !== "all") {
        if (matchLogic === 'include_lower') {
          matchesTaxonomy = p.taxonomy.genus === selectedGenus;
        } else {
          matchesTaxonomy = p.taxonomy.genus === selectedGenus && p.rank === 'genus';
        }
      } else if (selectedFamily !== "all") {
        matchesTaxonomy = p.taxonomy.family === selectedFamily;
      } else if (selectedOrder !== "all") {
        matchesTaxonomy = p.taxonomy.order === selectedOrder;
      } else if (selectedClass !== "all") {
        matchesTaxonomy = p.taxonomy.class === selectedClass;
      } else if (selectedPhylum !== "all") {
        matchesTaxonomy = p.taxonomy.phylum === selectedPhylum;
      }

      return matchesSearch && matchesType && matchesSource && matchesTaxonomy;
    });
  }, [searchTerm, filterType, filterSource, selectedPhylum, selectedClass, selectedOrder, selectedFamily, selectedGenus, selectedSpecies, matchLogic]);

  // Result Set Statistics Breakdown
  const dynamicStats = useMemo(() => {
    const isFiltered = searchTerm.trim() !== "" || 
      filterType !== "all" || 
      filterSource !== "all" || 
      selectedPhylum !== "all" || 
      selectedGenus !== "all";

    const matchedGenera = Array.from(new Set(filteredPathogens.map(p => p.taxonomy.genus.split(' ')[0])));
    const sourcesCount = {
      'NCBI': filteredPathogens.filter(p => p.source === 'NCBI').length,
      'FDA-ARGOS': filteredPathogens.filter(p => p.source === 'FDA-ARGOS').length,
      'BV-BRC': filteredPathogens.filter(p => p.source === 'BV-BRC').length,
      'FungiDB': filteredPathogens.filter(p => p.source === 'FungiDB').length,
    };
    const bslCount = {
      'BSL-1': filteredPathogens.filter(p => p.bsl === 'BSL-1').length,
      'BSL-2': filteredPathogens.filter(p => p.bsl === 'BSL-2').length,
      'BSL-3': filteredPathogens.filter(p => p.bsl === 'BSL-3').length,
      'BSL-4': filteredPathogens.filter(p => p.bsl === 'BSL-4').length,
    };

    return {
      isFiltered,
      totalSpecies: filteredPathogens.length,
      matchedGeneraCount: matchedGenera.length,
      matchedGeneraList: matchedGenera.join(', '),
      sourcesCount,
      bslCount,
      diseaseCount: new Set(filteredPathogens.map(p => p.relatedDiseases)).size
    };
  }, [filteredPathogens, searchTerm, filterType, filterSource, selectedPhylum, selectedGenus]);

  const paginatedPathogens = filteredPathogens.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getTypeBadge = (type: Pathogen['type']) => {
    const styles: Record<string, string> = {
      '病毒': "bg-red-500/10 text-red-500 border-red-500/20",
      '细菌': "bg-orange-500/10 text-orange-500 border-orange-500/20",
      '真菌': "bg-purple-500/10 text-purple-500 border-purple-500/20",
      '分枝杆菌': "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      '寄生虫': "bg-green-500/10 text-green-500 border-green-500/20",
      '支原体/衣原体': "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    };
    return <Badge variant="outline" className={cn("tech-mono text-[9px] font-normal", styles[type])}>{type}</Badge>;
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">病原微生物数据库</h2>
          <p className="text-muted-foreground text-sm tech-mono">
            集成 NCBI, FDA-ARGOS, Fungidb, BV-BRC 等权威数据源，构建超 20,000 种病原微生物知识库。
          </p>
        </div>
      </div>

      {/* Top Stats Grid - High Level Categories */}
      <div className="grid grid-cols-7 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="tech-border bg-background/50 p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
              <span className="text-[10px] tech-mono text-muted-foreground uppercase">{stat.label}</span>
            </div>
            <div className="text-lg font-bold tech-mono mt-1">{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Search & Advanced Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索中文名、英文学名 (如 Clostridium)、属名、分类路径..."
              className="pl-8 tech-mono text-xs h-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            variant={showFilters ? "secondary" : "outline"} 
            size="sm" 
            className="h-9 tech-mono text-[10px]"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3 h-3 mr-2" />
            高级筛选与分类学层级
          </Button>
        </div>

        {/* Dynamic Result Set Statistics Breakdown */}
        <div className="bg-slate-50 border tech-border rounded-lg p-3 text-xs tech-mono flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>当前结果: <span className="text-indigo-600 font-extrabold">{dynamicStats.totalSpecies}</span> 个物种</span>
            </div>
            
            {!dynamicStats.isFiltered ? (
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                <span className="border-l pl-3">门: <strong className="text-slate-700">42</strong></span>
                <span>纲: <strong className="text-slate-700">128</strong></span>
                <span>目: <strong className="text-slate-700">356</strong></span>
                <span>科: <strong className="text-slate-700">1,240</strong></span>
                <span>属: <strong className="text-slate-700">8,600</strong></span>
                <span>种: <strong className="text-slate-700">164,973</strong></span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px]">
                <span className="border-l pl-3 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  命中属: <strong className="text-indigo-700">{dynamicStats.matchedGeneraList || '多种'}</strong>
                </span>
                <span>下属物种: <strong className="text-slate-800">{dynamicStats.totalSpecies}</strong></span>
                <span className="border-l pl-3">
                  来源分布: 
                  <span className="text-slate-700 ml-1">
                    BV-BRC ({dynamicStats.sourcesCount['BV-BRC']}) / FDA-ARGOS ({dynamicStats.sourcesCount['FDA-ARGOS']}) / NCBI ({dynamicStats.sourcesCount['NCBI']}) / FungiDB ({dynamicStats.sourcesCount['FungiDB']})
                  </span>
                </span>
                <span className="border-l pl-3">
                  相关疾病数: <strong className="text-slate-800">{dynamicStats.diseaseCount}</strong>
                </span>
                <span className="border-l pl-3">
                  BSL 分布: 
                  <span className="text-slate-700 ml-1">
                    BSL-1 ({dynamicStats.bslCount['BSL-1']}) | BSL-2 ({dynamicStats.bslCount['BSL-2']}) | BSL-3 ({dynamicStats.bslCount['BSL-3']})
                  </span>
                </span>
              </div>
            )}
          </div>

          {(dynamicStats.isFiltered || selectedPhylum !== "all") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
                setFilterSource("all");
                handleResetTaxonomyFilters();
              }}
              className="h-6 text-[10px] text-muted-foreground hover:text-slate-900 px-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              重置所有筛选项
            </Button>
          )}
        </div>

        {/* Expanded Advanced Filters Panel */}
        {showFilters && (
          <Card className="tech-border bg-muted/20 p-4 space-y-4">
            {/* 1. Basic Type & Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b">
              <div className="space-y-1.5">
                <label className="text-[10px] tech-mono uppercase font-bold text-muted-foreground">病原体大类</label>
                <select 
                  className="w-full h-8 bg-background border tech-border rounded px-2 text-xs tech-mono"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">全部分类</option>
                  <option value="细菌">细菌</option>
                  <option value="病毒">病毒</option>
                  <option value="真菌">真菌</option>
                  <option value="寄生虫">寄生虫</option>
                  <option value="支原体/衣原体">支原体/衣原体</option>
                  <option value="分枝杆菌">分枝杆菌</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] tech-mono uppercase font-bold text-muted-foreground">数据来源库</label>
                <select 
                  className="w-full h-8 bg-background border tech-border rounded px-2 text-xs tech-mono"
                  value={filterSource}
                  onChange={(e) => {
                    setFilterSource(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">全部来源</option>
                  <option value="NCBI">NCBI</option>
                  <option value="FDA-ARGOS">FDA-ARGOS</option>
                  <option value="BV-BRC">BV-BRC</option>
                  <option value="FungiDB">FungiDB</option>
                </select>
              </div>
            </div>

            {/* 2. Taxonomy Hierarchy Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">分类学层级 (Taxonomy Rank Hierarchy)</span>
              </div>

              {/* Cascade Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {/* Level 1: Phylum */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">门 (Phylum)</span>
                  <select 
                    className="w-full h-8 bg-background border tech-border rounded px-2 text-xs tech-mono"
                    value={selectedPhylum}
                    onChange={(e) => {
                      setSelectedPhylum(e.target.value);
                      setSelectedClass("all");
                      setSelectedOrder("all");
                      setSelectedFamily("all");
                      setSelectedGenus("all");
                      setSelectedSpecies("all");
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">全部 (门)</option>
                    {availablePhyla.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Level 2: Class */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">纲 (Class)</span>
                  <select 
                    className="w-full h-8 bg-background border tech-border rounded px-2 text-xs tech-mono"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedOrder("all");
                      setSelectedFamily("all");
                      setSelectedGenus("all");
                      setSelectedSpecies("all");
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">全部 (纲)</option>
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Level 3: Order */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">目 (Order)</span>
                  <select 
                    className="w-full h-8 bg-background border tech-border rounded px-2 text-xs tech-mono"
                    value={selectedOrder}
                    onChange={(e) => {
                      setSelectedOrder(e.target.value);
                      setSelectedFamily("all");
                      setSelectedGenus("all");
                      setSelectedSpecies("all");
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">全部 (目)</option>
                    {availableOrders.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Level 4: Family */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">科 (Family)</span>
                  <select 
                    className="w-full h-8 bg-background border tech-border rounded px-2 text-xs tech-mono"
                    value={selectedFamily}
                    onChange={(e) => {
                      setSelectedFamily(e.target.value);
                      setSelectedGenus("all");
                      setSelectedSpecies("all");
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">全部 (科)</option>
                    {availableFamilies.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Level 5: Genus */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 block">属 (Genus)</span>
                  <select 
                    className="w-full h-8 bg-background border-2 border-indigo-200 rounded px-2 text-xs tech-mono font-bold text-indigo-900"
                    value={selectedGenus}
                    onChange={(e) => {
                      setSelectedGenus(e.target.value);
                      setSelectedSpecies("all");
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">全部 (属)</option>
                    {availableGenera.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Level 6: Species */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">种 (Species)</span>
                  <select 
                    className="w-full h-8 bg-background border tech-border rounded px-2 text-xs tech-mono"
                    value={selectedSpecies}
                    onChange={(e) => {
                      setSelectedSpecies(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">默认展示所有种</option>
                    {availableSpecies.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cascading Breadcrumb Preview */}
              <div className="bg-background p-2 rounded border text-[11px] tech-mono text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  <span className="text-slate-400">已选分类路径:</span>
                  <span className="font-semibold text-slate-700">{selectedPhylum}</span>
                  <span>&gt;</span>
                  <span className="font-semibold text-slate-700">{selectedClass}</span>
                  <span>&gt;</span>
                  <span className="font-semibold text-slate-700">{selectedOrder}</span>
                  <span>&gt;</span>
                  <span className="font-semibold text-slate-700">{selectedFamily}</span>
                  <span>&gt;</span>
                  <span className="font-bold text-indigo-600">{selectedGenus}</span>
                  <span>&gt;</span>
                  <span className="font-semibold text-slate-800">{selectedSpecies}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetTaxonomyFilters}
                  className="h-6 text-[10px] text-indigo-600 hover:bg-indigo-50 shrink-0"
                >
                  重置层级
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Main Table View */}
      <Card className="tech-border bg-background/50 flex-1 min-h-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader className="tech-bg-soft sticky top-0 z-10 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="tech-header">中文名</TableHead>
                <TableHead className="tech-header">英文名 / 学名</TableHead>
                <TableHead className="tech-header">分类路径 (Taxonomy Breadcrumb)</TableHead>
                <TableHead className="tech-header">大类</TableHead>
                <TableHead className="tech-header">相关疾病</TableHead>
                <TableHead className="tech-header">数据来源</TableHead>
                <TableHead className="tech-header">更新时间</TableHead>
                <TableHead className="tech-header text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPathogens.map((p) => (
                <TableRow key={p.id} className="group hover:bg-muted/30">
                  <TableCell className="font-bold text-xs">
                    <div className="flex items-center gap-2">
                      {p.name}
                      {p.isKey && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px] h-4 px-1">重点</Badge>}
                    </div>
                  </TableCell>

                  {/* Scientific Name & Rank */}
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900">{p.englishName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="italic text-[11px] text-slate-500">{p.latinName}</span>
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1 bg-indigo-50 border-indigo-200 text-indigo-700 font-mono">
                          {p.rank}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* Detailed Taxonomy Path Breadcrumb */}
                  <TableCell className="text-xs">
                    <div className="text-[11px] tech-mono leading-relaxed max-w-[320px] bg-slate-50/80 p-1.5 rounded border border-slate-100" title={p.taxonomyPath}>
                      <span className="text-slate-400">细菌 / </span>
                      <span className="text-slate-500">{p.taxonomy.phylum.split(' ')[0]} / </span>
                      <span className="text-slate-500">{p.taxonomy.class.split(' ')[0]} / </span>
                      <span className="text-slate-500">{p.taxonomy.order.split(' ')[0]} / </span>
                      <span className="text-slate-500">{p.taxonomy.family.split(' ')[0]} / </span>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{p.taxonomy.genus.split(' ')[0]}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="font-bold text-slate-800">{p.taxonomy.species.split(' ')[0]}</span>
                    </div>
                  </TableCell>

                  <TableCell>{getTypeBadge(p.type)}</TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate" title={p.relatedDiseases}>{p.relatedDiseases}</TableCell>
                  <TableCell className="text-[10px] tech-mono">
                    <Badge variant="secondary" className="text-[9px] bg-slate-100">{p.source}</Badge>
                  </TableCell>
                  <TableCell className="tech-mono text-[10px] text-muted-foreground">{p.updateTime}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 tech-mono text-[10px] text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                        onClick={() => {
                          onSelectPathogen(p);
                        }}
                      >
                        <Info className="w-3 h-3 mr-1.5" />
                        详情
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedPathogens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs tech-mono">
                    未找到匹配当前筛选条件的病原物种记录。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination UI */}
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] tech-mono text-muted-foreground">
            <span>共 {filteredPathogens.length} 条记录</span>
            <div className="flex items-center gap-2">
              <span>每页显示:</span>
              <select 
                className="bg-transparent border tech-border rounded px-1 h-6"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-[10px] tech-mono px-2">
              第 {currentPage} / {Math.ceil(filteredPathogens.length / pageSize) || 1} 页
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              disabled={currentPage === Math.ceil(filteredPathogens.length / pageSize) || filteredPathogens.length === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Pathogen Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border tech-border shadow-inner">
                <Bug className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold">{selectedPathogen?.name}</DialogTitle>
                  {selectedPathogen?.isKey && <Badge className="bg-amber-500 text-white border-none text-[10px]">重点病原体</Badge>}
                </div>
                <DialogDescription className="text-xs tech-mono mt-1 flex items-center gap-2">
                  <span className="font-medium text-foreground">{selectedPathogen?.englishName}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="italic text-muted-foreground">{selectedPathogen?.latinName}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Comprehensive Taxonomy Section */}
              <Card className="tech-border overflow-hidden bg-gradient-to-br from-indigo-50/30 to-background">
                <CardHeader className="bg-indigo-50/50 py-3 px-4 border-b border-indigo-100">
                  <CardTitle className="text-xs font-bold flex items-center gap-2 text-indigo-900">
                    <Microscope className="w-4 h-4 text-indigo-600" />
                    完整分类学信息 (Full Taxonomy Information)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">NCBI Tax ID</span>
                      <span className="text-xs font-bold tech-mono text-indigo-600">{selectedPathogen?.ncbiTaxId}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Rank (层级)</span>
                      <Badge variant="outline" className="text-[9px] bg-indigo-50 border-indigo-200 text-indigo-700 font-mono">
                        {selectedPathogen?.rank || "species"}
                      </Badge>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">界 / 域 (Kingdom)</span>
                      <span className="text-xs font-bold text-slate-800">{selectedPathogen?.taxonomy.superkingdom}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">门 (Phylum)</span>
                      <span className="text-xs font-bold text-slate-800">{selectedPathogen?.taxonomy.phylum}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">纲 (Class)</span>
                      <span className="text-xs font-bold text-slate-800">{selectedPathogen?.taxonomy.class}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">目 (Order)</span>
                      <span className="text-xs font-bold text-slate-800">{selectedPathogen?.taxonomy.order}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">科 (Family)</span>
                      <span className="text-xs font-bold text-slate-800">{selectedPathogen?.taxonomy.family}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">属 (Genus)</span>
                      <span className="text-xs font-bold text-indigo-600">{selectedPathogen?.taxonomy.genus}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">种 (Species)</span>
                      <span className="text-xs font-bold text-slate-900">{selectedPathogen?.taxonomy.species}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border tech-border">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">数据来源与更新</span>
                      <span className="text-[10px] tech-mono font-medium text-slate-600">{selectedPathogen?.source} · {selectedPathogen?.updateTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Medical & Pathogenicity */}
              <Card className="tech-border overflow-hidden">
                <CardHeader className="bg-muted/30 py-3 px-4 border-b">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    致病性与流行病学
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">相关疾病</label>
                      <p className="text-xs leading-relaxed">{selectedPathogen?.relatedDiseases}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">致病机制</label>
                      <p className="text-xs leading-relaxed text-muted-foreground">{selectedPathogen?.pathogenicity}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">传播途径</label>
                      <p className="text-xs leading-relaxed">{selectedPathogen?.transmission}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">易感人群</label>
                      <p className="text-xs leading-relaxed">{selectedPathogen?.susceptiblePopulation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-muted/20 flex justify-end">
            <Button onClick={() => setIsDetailOpen(false)} className="tech-mono text-xs h-8 px-6">
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
