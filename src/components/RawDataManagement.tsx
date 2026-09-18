import { useState } from "react";
import { 
  Search, 
  Plus, 
  Download, 
  FileCode, 
  FolderSearch, 
  Upload, 
  RefreshCw,
  Database,
  FileText,
  Calendar,
  HardDrive,
  Edit
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RawDataRecord } from "@/src/types";

const MOCK_RAW_DATA: RawDataRecord[] = [
  {
    id: "RAW-001",
    fileName: "SAM-001_R1.rawfq.gz",
    filePath: "/data/sequencing/20240414/SAM-001_R1.rawfq.gz",
    fileSize: "2.4 GB",
    sampleId: "SAM-001",
    batchNumber: "SEQ-20240414",
    sequencingMode: "双端",
    uploadTime: "2024-04-14 10:00",
    source: "auto-scan",
    uploadStatus: "上传成功",
    uploadProgress: 100
  },
  {
    id: "RAW-002",
    fileName: "SAM-001_R2.rawfq.gz",
    filePath: "/data/sequencing/20240414/SAM-001_R2.rawfq.gz",
    fileSize: "2.5 GB",
    sampleId: "SAM-001",
    batchNumber: "SEQ-20240414",
    sequencingMode: "双端",
    uploadTime: "2024-04-14 10:00",
    source: "auto-scan",
    uploadStatus: "上传中",
    uploadProgress: 65
  },
  {
    id: "RAW-003",
    fileName: "SAM-002_R1.rawfq.gz",
    filePath: "/data/sequencing/manual/SAM-002_R1.rawfq.gz",
    fileSize: "1.8 GB",
    sampleId: "SAM-002",
    batchNumber: "SEQ-20240414",
    sequencingMode: "单端",
    uploadTime: "2024-04-14 11:30",
    source: "manual-upload",
    uploadStatus: "上传失败",
    uploadProgress: 45
  },
  {
    id: "RAW-004",
    fileName: "SAM-003_R1.rawfq.gz",
    filePath: "/data/sequencing/manual/SAM-003_R1.rawfq.gz",
    fileSize: "2.1 GB",
    sampleId: "SAM-003",
    batchNumber: "SEQ-20240415",
    sequencingMode: "双端",
    uploadTime: "2024-04-15 09:15",
    source: "manual-upload",
    uploadStatus: "待上传",
    uploadProgress: 0
  }
];

export function RawDataManagement() {
  const [data, setData] = useState<RawDataRecord[]>(MOCK_RAW_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RawDataRecord | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const MOCK_SAMPLE_OPTIONS = ["SAM-001", "SAM-002", "SAM-003", "SAM-004", "SAM-005"];
  const MOCK_BATCH_OPTIONS = ["SEQ-20240414", "SEQ-20240415", "SEQ-20240416", "SEQ-20240501"];

  const handleEdit = (record: RawDataRecord) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // In a real app, this would update the backend/state
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  const filteredData = data.filter(item => 
    item.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-6 min-w-0 w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">原始数据管理</h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1">
            测序原始 RawFQ 文件的入库、检索及导出管理。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="tech-mono text-[10px]"
            onClick={handleScan}
            disabled={isScanning}
          >
            <RefreshCw className={`w-3 h-3 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? '正在扫描目录...' : '自动扫描入库'}
          </Button>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger className={cn(buttonVariants({ size: "sm" }), "tech-mono text-[10px] bg-[#02A1C8] hover:bg-[#02A1C8]/90")}>
              <Upload className="w-3 h-3 mr-2" />
              手动上传 RawFQ
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="tech-header text-sm">手动上传数据</DialogTitle>
                <DialogDescription className="text-xs tech-mono">
                  手动选择本地 RawFQ 文件并关联样本信息。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs">选择文件</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 bg-muted/30">
                    <FileCode className="w-8 h-8 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground tech-mono">点击或拖拽文件至此处上传</p>
                    <Button variant="outline" size="sm" className="h-7 text-[10px]">选择文件</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">关联样本 ID</Label>
                    <Input className="h-8 text-xs" placeholder="SAM-XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">测序批次</Label>
                    <Input className="h-8 text-xs" placeholder="SEQ-XXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">测序模式</Label>
                  <Select defaultValue="双端">
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="选择测序模式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="单端">单端 (Single-end)</SelectItem>
                      <SelectItem value="双端">双端 (Paired-end)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setIsUploadDialogOpen(false)}>取消</Button>
                <Button size="sm" className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={() => setIsUploadDialogOpen(false)}>开始上传</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索样本ID、测序批次、文件名..."
            className="pl-8 tech-mono text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="tech-mono text-[10px]">
          <Download className="w-3 h-3 mr-2" />
          导出数据列表
        </Button>
      </div>

      <Card className="tech-border bg-card shadow-sm w-full min-w-0 overflow-hidden">
        <CardHeader className="pb-2 border-b tech-bg-soft">
          <CardTitle className="text-sm tech-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#02A1C8]" />
              <span>RawFQ 数据仓库</span>
            </div>
            <Badge variant="outline" className="text-[10px] tech-mono bg-white">
              共 {filteredData.length} 个文件
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full overflow-hidden">
          <ScrollArea className="h-[600px] w-full">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader className="tech-bg-soft sticky top-0 z-10 border-b">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="tech-header whitespace-nowrap">文件名</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">样本ID</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">测序批次</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">测序模式</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">文件大小</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">上传状态</TableHead>
                    <TableHead className="tech-header whitespace-nowrap" style={{ width: '120px' }}>上传进度</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">入库来源</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">上传/扫描时间</TableHead>
                    <TableHead className="tech-header whitespace-nowrap">存储路径</TableHead>
                    <TableHead className="tech-header whitespace-nowrap text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="tech-mono text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          {item.fileName}
                        </div>
                      </TableCell>
                      <TableCell className="tech-mono text-xs">{item.sampleId}</TableCell>
                      <TableCell className="tech-mono text-xs">{item.batchNumber}</TableCell>
                      <TableCell className="tech-mono text-xs">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0 tech-mono shadow-none border-none",
                            item.sequencingMode === '双端' ? "bg-[#02A1C8]/10 text-[#02A1C8]" : "bg-orange-100 text-orange-600"
                          )}
                        >
                          {item.sequencingMode}
                        </Badge>
                      </TableCell>
                      <TableCell className="tech-mono text-xs">
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-muted-foreground" />
                          {item.fileSize}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-2 py-0.5 border-none",
                            item.uploadStatus === '上传成功' ? "bg-green-100 text-green-700" :
                            item.uploadStatus === '上传中' ? "bg-blue-100 text-blue-700 font-medium" :
                            item.uploadStatus === '上传失败' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {item.uploadStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex flex-col gap-1">
                          <Progress 
                            value={item.uploadStatus === '上传失败' ? 100 : item.uploadProgress} 
                            className="h-1.5"
                            indicatorClassName={cn(
                              item.uploadStatus === '上传成功' ? "bg-green-500" :
                              item.uploadStatus === '上传中' ? "bg-[#02A1C8]" :
                              item.uploadStatus === '上传失败' ? "bg-red-500" : "bg-slate-300"
                            )}
                          />
                          <span className={cn(
                            "text-[9px] tech-mono font-medium",
                            item.uploadStatus === '上传失败' ? "text-red-500 text-right" : "text-muted-foreground text-right"
                          )}>
                            {item.uploadStatus === '上传失败' ? '失败' : `${item.uploadProgress}%`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] px-1.5 py-0 border-none ${
                            item.source === 'auto-scan' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.source === 'auto-scan' ? '自动扫描' : '手动上传'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground tech-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.uploadTime}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground tech-mono max-w-[200px] truncate">
                        {item.filePath}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-[#02A1C8] hover:text-[#02A1C8]/80 hover:bg-[#02A1C8]/10"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground tech-mono text-xs">
                        未找到匹配的数据文件
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="tech-header text-sm">编辑数据关联</DialogTitle>
            <DialogDescription className="text-xs tech-mono">
              手动调整数据文件关联的样本 ID 与测序批次信息。
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg border tech-border space-y-1">
                <div className="flex items-center justify-between text-[10px] tech-mono text-muted-foreground uppercase">
                  <span>当前处理文件</span>
                  <span>{selectedRecord.id}</span>
                </div>
                <div className="text-xs font-bold truncate tech-mono flex items-center gap-2">
                  <FileText className="w-3 h-3 text-[#02A1C8]" />
                  {selectedRecord.fileName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">选择样本 ID</Label>
                  <Select defaultValue={selectedRecord.sampleId}>
                    <SelectTrigger className="h-8 text-xs tech-mono">
                      <SelectValue placeholder="请选择样本" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_SAMPLE_OPTIONS.map(id => (
                        <SelectItem key={id} value={id} className="text-xs tech-mono">{id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">选择测序批次</Label>
                  <Select defaultValue={selectedRecord.batchNumber}>
                    <SelectTrigger className="h-8 text-xs tech-mono">
                      <SelectValue placeholder="请选择批次" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_BATCH_OPTIONS.map(batch => (
                        <SelectItem key={batch} value={batch} className="text-xs tech-mono">{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">验证测序模式</Label>
                <Select defaultValue={selectedRecord.sequencingMode}>
                  <SelectTrigger className="h-8 text-xs tech-mono">
                    <SelectValue placeholder="核对测序模式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="单端" className="text-xs tech-mono">单端 (Single-end)</SelectItem>
                    <SelectItem value="双端" className="text-xs tech-mono">双端 (Paired-end)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
            <Button size="sm" className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={handleSaveEdit}>保存关联</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
