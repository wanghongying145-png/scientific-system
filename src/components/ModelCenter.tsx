import { useState } from "react";
import { 
  Search, 
  Filter,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  '全部', 'Antibody', 'CRISPR', 'Image', 'Peptide', 'Protein', 'RNA', 'Molecule', 'Scaffold Hopping', 'Target', 'Target Prediction', 'MS_embedding', 'agent', 'evaluate 3D structure'
];

interface ModelItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  image: string;
}

const INITIAL_MODELS: ModelItem[] = [
  {
    id: "m13",
    title: "合成路线规划",
    description: "基于候选分子结构生成可执行的逆合成路线，并结合靶标分析结果辅助筛选",
    category: "Molecule",
    tags: ["Retrosynthesis", "Structure-guided", "Drug Discovery"],
    image: "https://picsum.photos/seed/retrosynthesis/800/450"
  },
  {
    id: "m11",
    title: "骨架跃迁分子生成",
    description: "支持输入药物分子成先导化合物，通过骨架跃迁的方法生成新颖化合物，并保持分子活性",
    category: "Scaffold Hopping",
    tags: ["Scaffold Hopping", "Molecule Generation", "RDKit", "Fragment Replacement"],
    image: "https://picsum.photos/seed/scaffold-hopping/800/450"
  },
  {
    id: "m10",
    title: "靶点发现模型",
    description: "基于深度学习的分子—靶标识别模型，对输入小分子进行潜在作用靶标预测，快速输出候选靶标排名、作用分数及置信度信息，辅助开展靶标假设生成、脱靶风险分析与后续实验验证。",
    category: "Target Prediction",
    tags: ["Target Prediction", "Deep Learning", "Off-target"],
    image: "https://picsum.photos/seed/potential-target/800/450"
  },
  {
    id: "m9",
    title: "靶标发现与验证模型",
    description: "基于多组学与自然语言处理的靶标发现与验证",
    category: "Target",
    tags: ["Target", "Omics", "NLP"],
    image: "https://picsum.photos/seed/target-discovery/800/450"
  },
  {
    id: "m12",
    title: "强化学习小分子生成模型",
    description: "面向指定靶点与目标属性，生成并优化候选小分子，提高高价值分子的产出效率。",
    category: "Molecule",
    tags: ["Molecule Generation"],
    image: "https://picsum.photos/seed/small-molecule-generation/800/450"
  },
  {
    id: "m1",
    title: "蛋白质结构预测模型",
    description: "基于改良AlphaFold2架构，提供亚原子级精度的蛋白质三维结构预测，支持多链复合物建模。",
    category: "Protein",
    image: "https://picsum.photos/seed/protein-struct/800/450"
  },
  {
    id: "m2",
    title: "基于结构的虚拟筛选",
    description: "基于 AutoDock Vina 的分子对接与虚拟筛选模型",
    category: "Molecule",
    tags: ["Molecule", "Structure-based", "Docking"],
    image: "https://picsum.photos/seed/virtual-screen/800/450"
  },
  {
    id: "m14",
    title: "基于结构的虚拟筛选2",
    description: "受体-配体高通量分子对接与大型配体库虚拟筛选任务配置，采用高性能 AutoDock Vina 1.2 计算引擎",
    category: "Molecule",
    tags: ["Molecule", "Structure-based", "Docking", "Vina"],
    image: "https://picsum.photos/seed/virtual-screen-2/800/450"
  }
];

export function ModelCenter({ onSelectModel }: { onSelectModel: (id: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchTerm, setSearchTerm] = useState("");
  const filteredModels = INITIAL_MODELS.filter(m => {
    const matchesCategory = activeCategory === "全部" || m.category === activeCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search and Header Section */}
      <div className="p-6 border-b space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-2 h-6 tech-gradient-blue rounded-full mr-2" />
             <h2 className="text-xl font-bold tracking-tight">模型中心</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder="搜索模型名称或描述..." 
                   className="pl-8 w-64 h-9 text-xs tech-mono"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Categories / Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs tech-mono transition-all border",
                activeCategory === cat 
                  ? "bg-[#F0F9FB] text-[#02A1C8] border-[#02A1C8] font-bold" 
                  : "bg-white text-muted-foreground border-transparent hover:border-muted-foreground/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <div className="flex-1 overflow-auto p-6 bg-[#F8FAFB]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredModels.map((model) => (
              <motion.div
                key={model.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  onClick={() => onSelectModel(model.id)}
                  className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer relative rounded-xl h-full flex flex-col"
                >
                  {/* Image Container */}
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img 
                      src={model.image} 
                      alt={model.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <CardContent className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-3 flex-1">
                      <h3 className="font-bold text-lg text-[#0F172A] group-hover:text-[#02A1C8] transition-colors line-clamp-1">
                        {model.title}
                      </h3>
                      <p className="text-sm text-[#475569] leading-relaxed line-clamp-3 min-h-[3rem]">
                        {model.description}
                      </p>
                      
                      <div className="pt-2">
                         <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200">
                            {model.category}
                         </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredModels.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground">未找到相关模型</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">请尝试更换关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  );
}
