import { useState } from "react";
import { 
  Search, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Maximize2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { DictionaryType, DictionaryValue } from "@/src/types";

// Mock Data for Dictionary Types
const MOCK_TYPES: DictionaryType[] = [
  { id: "1977997117852205057", code: "exp_type_code", name: "实验类型", remark: "规定实验的类型", status: "active", updatedAt: "2025-10-14 15:17:17" },
  { id: "1957746977404084226", code: "node_execution_status", name: "流程节点执行状态", remark: "由管理员或系统标记的、流程中单个节点的实时运行状态", status: "active", updatedAt: "2025-08-19 18:44:57" },
  { id: "38", code: "knowledge_type_code", name: "知识库分类", remark: "知识库的分类信息", status: "active", updatedAt: "2025-07-30 15:49:24" },
  { id: "37", code: "resource_type_status", name: "预约资源状态", remark: "预约资源状态", status: "active", updatedAt: "2025-07-20 16:30:24" },
  { id: "36", code: "resource_type_code", name: "预约资源类型", remark: "预约资源类型", status: "active", updatedAt: "2025-07-20 16:28:11" },
  { id: "34", code: "payment_group", name: "支付方式分组", remark: "对支付方式进行的逻辑分组", status: "active", updatedAt: "2025-07-18 09:43:46" },
  { id: "35", code: "messages_actions", name: "聊天消息动作类型", remark: "", status: "active", updatedAt: "2025-07-16 18:20:38" },
  { id: "33", code: "laboratory_maintenance_type", name: "实验室维护类型", remark: "针对整个实验室环境的维护操作分类", status: "active", updatedAt: "2025-07-15 17:41:54" },
  { id: "32", code: "storage_condition", name: "存储条件", remark: "定义物料或样品的推荐存储环境", status: "active", updatedAt: "2025-07-11 13:36:45" },
  { id: "31", code: "material_type", name: "物料类型", remark: "定义耗材或样品的物理或化学分类", status: "active", updatedAt: "2025-07-11 13:36:45" },
];

// Mock Data for Dictionary Values
const MOCK_VALUES: DictionaryValue[] = [
  { id: "v1", typeId: "1977997117852205057", value: "OTHER", name: "其它", status: "disabled", sort: 6, remark: "Other", updatedAt: "2025-10-14 15:21:33" },
  { id: "v2", typeId: "1977997117852205057", value: "ELISA_IMM", name: "ELISA与免疫检测", status: "active", sort: 5, remark: "ELISA & Immunoassays", updatedAt: "2025-10-14 15:21:33" },
  { id: "v3", typeId: "1977997117852205057", value: "EKA", name: "酶动力学分析", status: "active", sort: 4, remark: "Enzyme Kinetics Analysis", updatedAt: "2025-10-14 15:21:33" },
  { id: "v4", typeId: "1977997117852205057", value: "NAPQ", name: "核酸与蛋白定量", status: "active", sort: 3, remark: "Nucleic Acid & Protein Quantifi...", updatedAt: "2025-10-14 15:21:33" },
  { id: "v5", typeId: "1977997117852205057", value: "GMD", name: "基因分型", status: "active", sort: 2, remark: "Gene Mutation Detection", updatedAt: "2025-11-14 09:46:10" },
  { id: "v6", typeId: "1977997117852205057", value: "GEA", name: "基因相对表达量", status: "active", sort: 1, remark: "Gene Expression Analysis", updatedAt: "2025-11-14 09:45:56" },
  { id: "v7", typeId: "1977997117852205057", value: "ygdl", name: "荧光共振能量转移", status: "active", sort: 0, remark: "", updatedAt: "2025-10-21 11:56:27" },
];

// Custom Switch Component
const Switch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#02A1C8]' : 'bg-gray-300'}`}
  >
    <span className="sr-only">Toggle status</span>
    <span 
      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} 
    />
    <span className={`absolute text-[9px] font-bold text-white transition-opacity ${checked ? 'left-1.5 opacity-100' : 'left-1.5 opacity-0'}`}>启用</span>
    <span className={`absolute text-[9px] font-bold text-white transition-opacity ${checked ? 'right-1.5 opacity-0' : 'right-1.5 opacity-100'}`}>禁用</span>
  </button>
);

export function DictionaryManagement() {
  const [types, setTypes] = useState<DictionaryType[]>(MOCK_TYPES);
  const [values, setValues] = useState<DictionaryValue[]>(MOCK_VALUES);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<DictionaryType | null>(null);
  const [typeFormData, setTypeFormData] = useState({ code: "", name: "", remark: "" });

  const [selectedType, setSelectedType] = useState<DictionaryType | null>(null);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<DictionaryValue | null>(null);
  const [valueFormData, setValueFormData] = useState({ value: "", name: "", remark: "", sort: 0 });

  const [valueSearchTerm, setValueSearchTerm] = useState("");

  // Handlers for Types
  const handleOpenTypeDialog = (type?: DictionaryType) => {
    if (type) {
      setEditingType(type);
      setTypeFormData({ code: type.code, name: type.name, remark: type.remark || "" });
    } else {
      setEditingType(null);
      setTypeFormData({ code: "", name: "", remark: "" });
    }
    setIsTypeDialogOpen(true);
  };

  const handleSaveType = () => {
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    if (editingType) {
      setTypes(types.map(t => t.id === editingType.id ? { ...t, ...typeFormData, updatedAt: now } : t));
    } else {
      const newType: DictionaryType = {
        id: Math.random().toString(36).substr(2, 9),
        ...typeFormData,
        status: 'active',
        updatedAt: now
      };
      setTypes([newType, ...types]);
    }
    setIsTypeDialogOpen(false);
  };

  const toggleTypeStatus = (id: string) => {
    setTypes(types.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'disabled' : 'active' } : t));
  };

  // Handlers for Values
  const handleOpenValueDialog = (val?: DictionaryValue) => {
    if (val) {
      setEditingValue(val);
      setValueFormData({ value: val.value, name: val.name, remark: val.remark || "", sort: val.sort });
    } else {
      setEditingValue(null);
      setValueFormData({ value: "", name: "", remark: "", sort: 0 });
    }
    setIsValueDialogOpen(true);
  };

  const handleSaveValue = () => {
    if (!selectedType) return;
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    if (editingValue) {
      setValues(values.map(v => v.id === editingValue.id ? { ...v, ...valueFormData, updatedAt: now } : v));
    } else {
      const newVal: DictionaryValue = {
        id: Math.random().toString(36).substr(2, 9),
        typeId: selectedType.id,
        ...valueFormData,
        status: 'active',
        updatedAt: now
      };
      setValues([newVal, ...values]);
    }
    setIsValueDialogOpen(false);
  };

  const toggleValueStatus = (id: string) => {
    setValues(values.map(v => v.id === id ? { ...v, status: v.status === 'active' ? 'disabled' : 'active' } : v));
  };

  const filteredTypes = types.filter(t => 
    (t.name.includes(searchTerm) || t.code.includes(searchTerm) || (t.remark && t.remark.includes(searchTerm))) &&
    (statusFilter === "all" || (statusFilter === "active" && t.status === "active") || (statusFilter === "disabled" && t.status === "disabled"))
  );

  const filteredValues = values.filter(v => 
    v.typeId === selectedType?.id &&
    (v.name.includes(valueSearchTerm) || v.value.includes(valueSearchTerm))
  );

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen text-sm">
      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 whitespace-nowrap">关键字:</span>
          <Input 
            placeholder="编码/名称/备注" 
            className="w-48 h-8 text-xs" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 whitespace-nowrap">禁用:</span>
          <select 
            className="h-8 border rounded px-2 text-xs w-32 outline-none focus:ring-1 focus:ring-[#02A1C8]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">请选择</option>
            <option value="active">启用</option>
            <option value="disabled">禁用</option>
          </select>
        </div>
        <Button className="bg-[#02A1C8] hover:bg-[#02A1C8]/90 h-8 text-xs px-4" onClick={() => {}}>
          <Search className="w-3 h-3 mr-1" /> 查询
        </Button>
        <Button variant="outline" className="h-8 text-xs px-4" onClick={() => {setSearchTerm(""); setStatusFilter("all");}}>
          <RotateCcw className="w-3 h-3 mr-1" /> 重置
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button className="bg-[#02A1C8] hover:bg-[#02A1C8]/90 h-8 text-xs px-4" onClick={() => handleOpenTypeDialog()}>
            <Plus className="w-3 h-3 mr-1" /> 新建
          </Button>
          <Button variant="outline" className="h-8 text-xs px-4 text-gray-400 border-gray-200" disabled>
            <Trash2 className="w-3 h-3 mr-1" /> 批量删除
          </Button>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Maximize2 className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          <RefreshCw className="w-4 h-4 cursor-pointer hover:text-gray-600" />
        </div>
      </div>

      {/* Main Table */}
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"><input type="checkbox" /></TableHead>
              <TableHead className="font-bold text-gray-700">ID</TableHead>
              <TableHead className="font-bold text-gray-700">编码</TableHead>
              <TableHead className="font-bold text-gray-700">名称</TableHead>
              <TableHead className="font-bold text-gray-700">备注</TableHead>
              <TableHead className="font-bold text-gray-700">状态</TableHead>
              <TableHead className="font-bold text-gray-700">更新时间</TableHead>
              <TableHead className="font-bold text-gray-700 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTypes.map((type) => (
              <TableRow key={type.id} className="hover:bg-gray-50 group">
                <TableCell><input type="checkbox" /></TableCell>
                <TableCell className="text-gray-500 text-xs">{type.id}</TableCell>
                <TableCell className="text-[#02A1C8] font-medium cursor-pointer hover:underline" onClick={() => setSelectedType(type)}>
                  {type.code}
                </TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell className="text-gray-500 max-w-xs truncate">{type.remark}</TableCell>
                <TableCell>
                  <Switch checked={type.status === 'active'} onChange={() => toggleTypeStatus(type.id)} />
                </TableCell>
                <TableCell className="text-gray-500 text-xs">{type.updatedAt}</TableCell>
                <TableCell className="text-right">
                  <button className="text-[#02A1C8] hover:underline text-xs" onClick={() => handleOpenTypeDialog(type)}>编辑</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 text-xs text-gray-500 pt-4">
        <span>共{filteredTypes.length}条</span>
        <div className="flex items-center border rounded">
          <button className="p-1 border-r hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
          <button className="px-2 py-1 bg-[#02A1C8] text-white">1</button>
          <button className="px-2 py-1 border-l hover:bg-gray-50">2</button>
          <button className="px-2 py-1 border-l hover:bg-gray-50">3</button>
          <button className="px-2 py-1 border-l hover:bg-gray-50">4</button>
          <button className="p-1 border-l hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <select className="border rounded px-1 h-7 outline-none">
          <option>10 条/页</option>
          <option>20 条/页</option>
        </select>
        <span>跳至</span>
        <input type="text" className="w-10 border rounded h-7 text-center outline-none" defaultValue="1" />
        <span>页</span>
      </div>

      {/* Type Dialog */}
      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingType ? "编辑字典类型" : "新建字典类型"}</DialogTitle>
            <DialogDescription>填写字典类型的基本信息。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">编码</Label>
              <Input id="code" value={typeFormData.code} onChange={(e) => setTypeFormData({...typeFormData, code: e.target.value})} className="col-span-3 h-8" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">名称</Label>
              <Input id="name" value={typeFormData.name} onChange={(e) => setTypeFormData({...typeFormData, name: e.target.value})} className="col-span-3 h-8" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remark" className="text-right">备注</Label>
              <Input id="remark" value={typeFormData.remark} onChange={(e) => setTypeFormData({...typeFormData, remark: e.target.value})} className="col-span-3 h-8" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTypeDialogOpen(false)}>取消</Button>
            <Button className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={handleSaveType}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Values Sheet (Drawer) */}
      <Sheet open={!!selectedType} onOpenChange={(open) => !open && setSelectedType(null)}>
        <SheetContent side="right" className="w-[50%] sm:max-w-[50%] p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">×</span> 字典值
              </SheetTitle>
              <SheetDescription className="hidden" />
            </SheetHeader>
            
            <div className="p-4 space-y-4 flex-1 overflow-auto">
              {/* Value Search Bar */}
              <div className="flex flex-wrap items-center gap-4 border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 whitespace-nowrap">关键字:</span>
                  <Input 
                    placeholder="关键字" 
                    className="w-48 h-8 text-xs" 
                    value={valueSearchTerm}
                    onChange={(e) => setValueSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 whitespace-nowrap">禁用:</span>
                  <select className="h-8 border rounded px-2 text-xs w-32 outline-none focus:ring-1 focus:ring-[#02A1C8]">
                    <option>请选择</option>
                  </select>
                </div>
                <Button className="bg-[#02A1C8] hover:bg-[#02A1C8]/90 h-8 text-xs px-4">
                  <Search className="w-3 h-3 mr-1" /> 查询
                </Button>
                <Button variant="outline" className="h-8 text-xs px-4" onClick={() => setValueSearchTerm("")}>
                  <RotateCcw className="w-3 h-3 mr-1" /> 重置
                </Button>
              </div>

              {/* Value Action Bar */}
              <div className="flex items-center gap-2">
                <Button className="bg-[#02A1C8] hover:bg-[#02A1C8]/90 h-8 text-xs px-4" onClick={() => handleOpenValueDialog()}>
                  <Plus className="w-3 h-3 mr-1" /> 新建
                </Button>
                <Button variant="outline" className="h-8 text-xs px-4 text-gray-400 border-gray-200" disabled>
                  <Trash2 className="w-3 h-3 mr-1" /> 批量删除
                </Button>
              </div>

              {/* Value Table */}
              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10"><input type="checkbox" /></TableHead>
                      <TableHead className="font-bold text-gray-700">值</TableHead>
                      <TableHead className="font-bold text-gray-700">名称</TableHead>
                      <TableHead className="font-bold text-gray-700">状态</TableHead>
                      <TableHead className="font-bold text-gray-700">排序</TableHead>
                      <TableHead className="font-bold text-gray-700">备注</TableHead>
                      <TableHead className="font-bold text-gray-700">更新时间</TableHead>
                      <TableHead className="font-bold text-gray-700 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredValues.map((val) => (
                      <TableRow key={val.id} className="hover:bg-gray-50">
                        <TableCell><input type="checkbox" /></TableCell>
                        <TableCell className="text-gray-500 text-xs">{val.value}</TableCell>
                        <TableCell>{val.name}</TableCell>
                        <TableCell>
                          <Switch checked={val.status === 'active'} onChange={() => toggleValueStatus(val.id)} />
                        </TableCell>
                        <TableCell>{val.sort}</TableCell>
                        <TableCell className="text-gray-500 text-xs max-w-[100px] truncate">{val.remark}</TableCell>
                        <TableCell className="text-gray-500 text-xs">{val.updatedAt}</TableCell>
                        <TableCell className="text-right">
                          <button className="text-[#02A1C8] hover:underline text-xs" onClick={() => handleOpenValueDialog(val)}>编辑</button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right text-xs text-gray-500">共计 {filteredValues.length} 条</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Value Dialog */}
      <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingValue ? "编辑字典值" : "新建字典值"}</DialogTitle>
            <DialogDescription>填写字典值的具体内容。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="v-value" className="text-right">值</Label>
              <Input id="v-value" value={valueFormData.value} onChange={(e) => setValueFormData({...valueFormData, value: e.target.value})} className="col-span-3 h-8" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="v-name" className="text-right">名称</Label>
              <Input id="v-name" value={valueFormData.name} onChange={(e) => setValueFormData({...valueFormData, name: e.target.value})} className="col-span-3 h-8" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="v-sort" className="text-right">排序</Label>
              <Input id="v-sort" type="number" value={valueFormData.sort} onChange={(e) => setValueFormData({...valueFormData, sort: parseInt(e.target.value)})} className="col-span-3 h-8" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="v-remark" className="text-right">备注</Label>
              <Input id="v-remark" value={valueFormData.remark} onChange={(e) => setValueFormData({...valueFormData, remark: e.target.value})} className="col-span-3 h-8" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsValueDialogOpen(false)}>取消</Button>
            <Button className="bg-[#02A1C8] hover:bg-[#02A1C8]/90" onClick={handleSaveValue}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
