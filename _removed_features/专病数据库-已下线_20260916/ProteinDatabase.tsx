import React, { useState } from 'react';
import { 
  Search, 
  Database, 
  ExternalLink, 
  Info, 
  RefreshCw,
  BookOpen,
  Edit,
  Trash2,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Gemini Service ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateProteinData(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a detailed JSON object for a protein search result based on this query: "${query}". 
      The protein should be real if possible, or scientifically plausible.
      Include:
      - basicInfo: name, uniprotId, organism, length (aa), sequence (FASTA)
      - msaResults: array of { id, db (BFD, UniRef90, UniRef50, MGnify), identity (%), coverage (%) }
      - pdbTemplates: array of { id, chain, resolution (Å), identity (%) }
      - annotation: description, family, biologicalProcess (GO terms), pathways (array of strings), publications (array of { id, title })
      - externalLinks: { uniprot, pdb, mgnify }
      
      Return ONLY the JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            basicInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                uniprotId: { type: Type.STRING },
                organism: { type: Type.STRING },
                length: { type: Type.STRING },
                sequence: { type: Type.STRING }
              }
            },
            msaResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  db: { type: Type.STRING },
                  identity: { type: Type.STRING },
                  coverage: { type: Type.STRING }
                }
              }
            },
            pdbTemplates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  chain: { type: Type.STRING },
                  resolution: { type: Type.STRING },
                  identity: { type: Type.STRING }
                }
              }
            },
            annotation: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                family: { type: Type.STRING },
                biologicalProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
                pathways: { type: Type.ARRAY, items: { type: Type.STRING } },
                publications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            externalLinks: {
              type: Type.OBJECT,
              properties: {
                uniprot: { type: Type.STRING },
                pdb: { type: Type.STRING },
                mgnify: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

// --- Mock Data ---

const DATABASES = [
  {
    id: 'bfd',
    name: 'BigFantasticDatabase (BFD)',
    type: 'Sequence',
    status: '已内置',
    count: '2.5B entries',
    updateTime: '2024-01-15',
    description: 'A massive collection of protein sequences for MSA generation, including metagenomic data.',
    url: 'https://bfd.mmseqs.com/'
  },
  {
    id: 'uniref90',
    name: 'UniRef90',
    type: 'Sequence',
    status: '已内置',
    count: '150M clusters',
    updateTime: '2024-03-10',
    description: 'UniProt Reference Clusters (UniRef90) provide clustered sets of sequences from UniProtKB.',
    url: 'https://www.uniprot.org/help/uniref'
  },
  {
    id: 'uniclust30',
    name: 'Uniclust30',
    type: 'Sequence',
    status: '已内置',
    count: '30M clusters',
    updateTime: '2023-11-20',
    description: 'Clustered UniProtKB sequences at 30% identity level, optimized for homology search.',
    url: 'https://uniclust.mmseqs.com/'
  },
  {
    id: 'mgnify',
    name: 'MGnify',
    type: 'Sequence',
    status: '已内置',
    count: '1.2B proteins',
    updateTime: '2024-02-05',
    description: 'A resource for the analysis and publication of metagenomic, metatranscriptomic and metabarcoding data.',
    url: 'https://www.ebi.ac.uk/metagenomics/'
  },
  {
    id: 'pdb70',
    name: 'PDB70',
    type: 'Structure',
    status: '已内置',
    count: '70,000 clusters',
    updateTime: '2024-03-01',
    description: 'PDB sequences clustered at 70% identity, used for template-based modeling.',
    url: 'https://www.rcsb.org/'
  },
  {
    id: 'pdb_mmcif',
    name: 'pdb_mmcif',
    type: 'Structure',
    status: '已内置',
    count: '210,000 structures',
    updateTime: '2024-03-15',
    description: 'The standard PDB structure database in mmCIF format.',
    url: 'https://www.rcsb.org/'
  },
  {
    id: 'uniprot',
    name: 'UniProt',
    type: 'Annotation',
    status: '已内置',
    count: '250M entries',
    updateTime: '2024-03-20',
    description: 'The comprehensive resource for protein sequence and functional information.',
    url: 'https://www.uniprot.org/'
  }
];

const SEARCH_RESULT = {
  basicInfo: {
    name: 'Hemoglobin subunit alpha',
    uniprotId: 'P69905',
    organism: 'Homo sapiens (Human)',
    length: '142 aa',
    sequence: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR'
  },
  msaResults: [
    { id: 'UniRef90_P69905', db: 'UniRef90', identity: '100%', coverage: '100%' },
    { id: 'BFD_129384', db: 'BFD', identity: '98.5%', coverage: '99.2%' },
    { id: 'MGN_992831', db: 'MGnify', identity: '95.2%', coverage: '100%' },
    { id: 'UniRef90_Q12345', db: 'UniRef90', identity: '88.1%', coverage: '97.5%' },
  ],
  pdbTemplates: [
    { id: '1A00', chain: 'A', resolution: '2.00 Å', identity: '100%' },
    { id: '2HHB', chain: 'A', resolution: '1.74 Å', identity: '100%' },
    { id: '1HBA', chain: 'A', resolution: '2.50 Å', identity: '99%' },
  ],
  annotation: {
    description: 'Involved in oxygen transport from the lung to the various peripheral tissues.',
    family: 'Globin family',
    biologicalProcess: ['Oxygen transport', 'Heme binding', 'Iron ion binding'],
    publications: [
      { id: 'PMID: 1234567', title: 'Structure of human hemoglobin at 1.74 A resolution.' },
      { id: 'PMID: 7654321', title: 'The molecular basis of oxygen transport.' }
    ]
  }
};

// --- Edit Dialog Component ---

function EditDbDialog({ db, onSave }: { db: any, onSave: (db: any) => void }) {
  const [formData, setFormData] = useState({ ...db });
  const [open, setOpen] = useState(false);

  return (
    <DialogContent className="tech-mono max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-[#02A1C8]">
          <Edit className="w-5 h-5" />
          编辑数据库信息
        </DialogTitle>
        <DialogDescription className="text-xs">
          修改数据库的详细信息，更新后将同步至系统列表
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold">数据库名称</Label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="h-8 text-xs font-bold bg-muted/20" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold">数据库类型</Label>
            <Input 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="h-8 text-xs bg-muted/20" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold">条目数量</Label>
            <Input 
              value={formData.count} 
              onChange={e => setFormData({...formData, count: e.target.value})}
              className="h-8 text-xs bg-muted/20" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold">更新时间</Label>
            <Input 
              value={formData.updateTime} 
              onChange={e => setFormData({...formData, updateTime: e.target.value})}
              className="h-8 text-xs bg-muted/20" 
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold">官方链接</Label>
            <Input 
              value={formData.url} 
              onChange={e => setFormData({...formData, url: e.target.value})}
              className="h-8 text-xs bg-muted/20" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground uppercase font-bold">数据库详细说明</Label>
          <Textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="text-xs min-h-[100px] bg-muted/20 resize-none" 
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button 
              className="h-8 text-[10px] tech-gradient-blue shadow-lg shadow-blue-500/20"
              onClick={() => onSave(formData)}
            >
              保存修改
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
}

export function ProteinDatabase({ isAdmin = false }: { isAdmin?: boolean }) {
  const [databases, setDatabases] = useState(DATABASES);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [proteinData, setProteinData] = useState<any>(null);

  const handleUpdateDb = (updatedDb: any) => {
    setDatabases(prev => prev.map(db => db.id === updatedDb.id ? updatedDb : db));
  };

  const handleDeleteDb = (id: string) => {
    setDatabases(prev => prev.filter(db => db.id !== id));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowResults(false);
    
    const data = await generateProteinData(searchQuery);
    if (data) {
      setProteinData(data);
      setShowResults(true);
    }
    setIsSearching(false);
  };

  return (
    <div className="p-6 space-y-6 tech-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tech-header tracking-tight text-[#02A1C8]">蛋白质结构预测专用数据库</h2>
          <p className="text-sm text-muted-foreground mt-1">集成全球主流蛋白序列、结构及功能注释数据库，支持高精度结构预测前置查询</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Required buttons removed per request */}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Database className="w-3 h-3 mr-2" /> 数据库总览
          </TabsTrigger>
          <TabsTrigger value="query" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Search className="w-3 h-3 mr-2" /> 蛋白查询
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card className="tech-border bg-background/50 backdrop-blur">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" /> 内置数据库列表
                  </CardTitle>
                  <CardDescription className="text-[10px]">当前系统已收录并索引的生物信息学数据库</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input placeholder="检索数据库..." className="h-7 w-48 pl-7 text-[10px] bg-muted/30" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Filter className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-muted">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">数据库名称</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">数据库类型</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">数据状态</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">条目数量</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">更新时间</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databases.map((db) => (
                    <TableRow key={db.id} className="group hover:bg-muted/30 transition-colors border-b border-muted/50">
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{db.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] font-normal px-1.5 py-0 h-4 ${
                          db.type === 'Sequence' ? 'border-blue-500/50 text-blue-500 bg-blue-500/5' :
                          db.type === 'Structure' ? 'border-purple-500/50 text-purple-500 bg-purple-500/5' :
                          'border-green-500/50 text-green-500 bg-green-500/5'
                        }`}>
                          {db.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[9px] font-normal px-1.5 py-0 h-4 bg-muted/80 text-muted-foreground border-none">
                          {db.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] font-medium">{db.count}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{db.updateTime}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-[10px] flex items-center gap-1 hover:bg-primary/10 hover:text-primary")}>
                              <Info className="w-3 h-3" />
                              详情
                            </DialogTrigger>
                            <DialogContent className="tech-mono max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-[#02A1C8]">
                                  <Database className="w-5 h-5" />
                                  数据库详情
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                  查看该数据库的详细元数据与收录范围
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">数据库名称</span>
                                    <p className="text-xs font-bold">{db.name}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">数据库类型</span>
                                    <p className="text-xs font-medium">{db.type}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">数据库条目数量</span>
                                    <p className="text-xs font-medium">{db.count}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">更新时间</span>
                                    <p className="text-xs font-medium">{db.updateTime}</p>
                                  </div>
                                  <div className="space-y-1 col-span-2">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">官方链接</span>
                                    <a href={db.url} target="_blank" rel="noreferrer" className="text-xs text-[#02A1C8] flex items-center gap-1 hover:underline">
                                      访问官网 <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                                <Separator className="bg-muted/50" />
                                <div className="space-y-2">
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold">数据库详细说明</span>
                                  <p className="text-xs leading-relaxed text-foreground/80">{db.description}</p>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold">主要应用场景</span>
                                  <ul className="text-xs list-disc list-inside space-y-1 text-foreground/70">
                                    <li>用于蛋白质结构预测中的多序列比对 (MSA) 生成</li>
                                    <li>提供高可信度的同源模板检索</li>
                                    <li>支持下游功能注释与文献溯源</li>
                                  </ul>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {isAdmin && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 text-[10px] flex items-center gap-1 hover:bg-blue-500/10 hover:text-blue-500">
                                    <Edit className="w-3 h-3" />
                                    编辑
                                  </Button>
                                </DialogTrigger>
                                <EditDbDialog db={db} onSave={handleUpdateDb} />
                              </Dialog>

                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-[10px] flex items-center gap-1 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteDb(db.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                                删除
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="mt-6 space-y-6">
          <Card className="tech-border bg-background/50 backdrop-blur overflow-hidden">
            <div className="h-1 bg-primary/20 w-full overflow-hidden">
              {isSearching && <motion.div 
                className="h-full bg-primary"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />}
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" /> 蛋白质序列查询
                  </CardTitle>
                  <CardDescription className="text-[10px]">输入蛋白质序列、UniProt ID 或蛋白名称进行多库联合检索</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-bold">示例:</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="h-6 px-2 text-[9px] border-[#02A1C8]/30 text-[#02A1C8] hover:bg-[#02A1C8]/5"
                      onClick={() => setSearchQuery('P69905')}
                    >
                      P69905
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-6 px-2 text-[9px] border-[#02A1C8]/30 text-[#02A1C8] hover:bg-[#02A1C8]/5"
                      onClick={() => setSearchQuery('MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR')}
                    >
                      FASTA序列
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <textarea 
                    placeholder="输入蛋白质序列 (FASTA 格式) 或 UniProt ID (例如: P69905)"
                    className="w-full min-h-[120px] p-3 text-xs tech-mono bg-muted/30 border rounded-md focus:ring-1 focus:ring-primary outline-none resize-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] bg-background/50">SEQUENCE</Badge>
                    <Badge variant="outline" className="text-[8px] bg-background/50">UNIPROT ID</Badge>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    className="h-9 px-8 text-xs font-bold tech-gradient-blue shadow-lg shadow-blue-500/20"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Search className="w-3 h-3 mr-2" />}
                    执行检索
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {showResults && proteinData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <Card className="tech-border bg-background/50 backdrop-blur h-full">
                    <CardHeader className="pb-2 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                          <Info className="w-3 h-3 text-primary" /> 基本信息
                        </CardTitle>
                        <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">UniProtKB Verified</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div className="space-y-1">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">蛋白名称</span>
                          <p className="text-xs font-bold">{proteinData?.basicInfo?.name}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">UniProt ID</span>
                          <p className="text-xs font-mono text-primary font-bold">{proteinData?.basicInfo?.uniprotId}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">物种</span>
                          <p className="text-xs italic">{proteinData?.basicInfo?.organism}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">序列长度</span>
                          <p className="text-xs">{proteinData?.basicInfo?.length}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">氨基酸序列</span>
                        <div className="p-2 bg-muted/50 rounded border border-muted font-mono text-[10px] break-all leading-relaxed relative group">
                          {proteinData?.basicInfo?.sequence}
                          <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Annotation Summary */}
                  <Card className="tech-border bg-background/50 backdrop-blur">
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                        <BookOpen className="w-3 h-3 text-primary" /> 功能注释 (UniProt)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">功能描述</span>
                        <p className="text-[11px] leading-relaxed text-foreground/80">{proteinData?.annotation?.description}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">蛋白家族</span>
                        <p className="text-[11px]">{proteinData?.annotation?.family}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">通路信息 (Pathways)</span>
                        <div className="flex flex-wrap gap-1">
                          {proteinData?.annotation?.pathways?.map((path: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[8px] font-normal px-1.5 py-0 h-4 border-blue-500/30 text-blue-500">{path}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">生物过程 (GO)</span>
                        <div className="flex flex-wrap gap-1">
                          {proteinData?.annotation?.biologicalProcess?.map((go: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[8px] font-normal px-1.5 py-0 h-4 bg-muted/80">{go}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">文献支持</span>
                        <div className="space-y-2">
                          {proteinData?.annotation?.publications?.map((pub: any, i: number) => (
                            <div key={i} className="p-2 bg-muted/30 rounded border border-muted/50 group hover:border-primary/30 transition-colors">
                              <p className="text-[9px] font-bold text-primary mb-1">{pub.id}</p>
                              <p className="text-[9px] text-muted-foreground line-clamp-2">{pub.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
