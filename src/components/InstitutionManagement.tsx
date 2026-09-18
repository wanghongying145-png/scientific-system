import { useState } from "react";
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Edit2, 
  Trash2, 
  Layers, 
  Building,
  CheckCircle2,
  Trash,
  ChevronRight,
  Info,
  SlidersHorizontal,
  FolderTree,
  AlertTriangle
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Institution {
  id: string;
  name: string;
  province: string;
  level: string; // e.g., "官方唯一省级分中心医院"
  departments: string[];
  contactPerson?: string;
  phone?: string;
  status: "active" | "inactive";
}

const INITIAL_INSTITUTIONS: Institution[] = [
  { id: "inst-1", province: "北京", name: "解放军总医院第八医学中心", level: "官方唯一省级分中心医院", departments: ["结核病科", "呼吸与危重症医学科", "胸外科", "检验科", "医学影像科"], status: "active", contactPerson: "张主任", phone: "010-66781234" },
  { id: "inst-2", province: "天津", name: "天津市海河医院", level: "官方唯一省级分中心医院", departments: ["感染性疾病科", "呼吸科", "重症医学科", "检验科"], status: "active", contactPerson: "王主任", phone: "022-24881122" },
  { id: "inst-3", province: "河北", name: "河北省胸科医院", level: "官方唯一省级分中心医院", departments: ["结核一科", "结核二科", "胸外科", "呼吸科", "临床基因组学中心"], status: "active", contactPerson: "李主任", phone: "0311-86911234" },
  { id: "inst-4", province: "山西", name: "太原市第四人民医院", level: "官方唯一省级分中心医院", departments: ["重症结核科", "感染性疾病科", "检验分子诊断科"], status: "active", contactPerson: "赵科长", phone: "0351-5631122" },
  { id: "inst-5", province: "内蒙古", name: "内蒙古自治区第四医院", level: "官方唯一省级分中心医院", departments: ["呼吸与危重症科", "结核病防治科", "基础实验室"], status: "active", contactPerson: "孙大夫", phone: "0471-4951111" },
  { id: "inst-6", province: "辽宁", name: "沈阳市第十人民医院（沈阳市胸科医院）", level: "官方唯一省级分中心医院", departments: ["结核内科", "肿瘤胸外科", "临床微分子检验中心"], status: "active", contactPerson: "周主任", phone: "024-88312233" },
  { id: "inst-7", province: "吉林", name: "吉林省结核病医院（吉林省传染病医院）", level: "官方唯一省级分中心医院", departments: ["结核病科", "传染病诊疗中心", "检验科"], status: "active", contactPerson: "吴主任", phone: "0431-82883344" },
  { id: "inst-8", province: "黑龙江", name: "黑龙江省传染病防治院（省四院）", level: "官方唯一省级分中心医院", departments: ["结核内科", "呼吸内科", "重症医学科", "药学部"], status: "active", contactPerson: "郑主任", phone: "0451-57121122" },
  { id: "inst-9", province: "上海", name: "上海市肺科医院", level: "官方唯一省级分中心医院", departments: ["呼吸与危重症医学科", "胸外科", "肺循环科", "检验科", "基因测序中心"], status: "active", contactPerson: "冯教授", phone: "021-65115006" },
  { id: "inst-10", province: "江苏", name: "南京市第二医院", level: "官方唯一省级分中心医院", departments: ["感染性疾病科", "肝病科", "结核科", "分子诊断实验室"], status: "active", contactPerson: "陈主任", phone: "025-83626123" },
  { id: "inst-11", province: "浙江", name: "浙江大学医学院附属第一医院", level: "官方唯一省级分中心医院", departments: ["传染病科", "呼吸内科", "检验医学中心", "重症医学科"], status: "active", contactPerson: "蒋主任", phone: "0571-87236123" },
  { id: "inst-12", province: "安徽", name: "安徽省胸科医院", level: "官方唯一省级分中心医院", departments: ["结核科", "呼吸内科", "胸腔镜室", "检验中心"], status: "active", contactPerson: "韩科长", phone: "0551-63631234" },
  { id: "inst-13", province: "福建", name: "福州肺科医院", level: "官方唯一省级分中心医院", departments: ["结核内科", "呼吸与危重症科", "胸外科", "药剂科"], status: "active", contactPerson: "沈主任", phone: "0591-83411234" },
  { id: "inst-14", province: "江西", name: "江西省胸科医院", level: "官方唯一省级分中心医院", departments: ["结核内科", "呼吸科", "肿瘤科", "分子诊断科"], status: "active", contactPerson: "朱医生", phone: "0791-88411234" },
  { id: "inst-15", province: "山东", name: "山东省公共卫生临床中心（山东省胸科医院）", level: "官方唯一省级分中心医院", departments: ["结核病中心", "呼吸与危重症医学中心", "医学检验中心", "重症医学中心"], status: "active", contactPerson: "秦主任", phone: "0531-86511234" },
  { id: "inst-16", province: "河南", name: "河南省胸科医院（中原分中心）", level: "官方唯一省级分中心医院", departments: ["胸外科", "心血管外科", "结核内科", "呼吸科", "微生物实验室"], status: "active", contactPerson: "许主任", phone: "0371-65611234" },
  { id: "inst-17", province: "湖北", name: "武汉市肺科医院", level: "官方唯一省级分中心医院", departments: ["结核一科", "呼吸内科", "重症医学科", "病原微生物实验室"], status: "active", contactPerson: "何主任", phone: "027-83611234" },
  { id: "inst-18", province: "湖南", name: "湖南省胸科医院", level: "官方唯一省级分中心医院", departments: ["结核内科", "耐药结核科", "胸外科", "检验科"], status: "active", contactPerson: "张处长", phone: "0731-88861234" },
  { id: "inst-19", province: "广东", name: "广州市第八人民医院（华南区域分中心）", level: "官方唯一省级分中心医院", departments: ["感染病科", "结核科", "重症医学科", "病原免疫研究中心"], status: "active", contactPerson: "魏主任", phone: "020-83811234" },
  { id: "inst-20", province: "广西", name: "广西壮族自治区胸科医院（龙潭医院）", level: "官方唯一省级分中心医院", departments: ["结核内科", "呼吸科", "胸外科", "分子检验室"], status: "active", contactPerson: "廖主任", phone: "0772-3111234" },
  { id: "inst-21", province: "海南", name: "海南医学院第二附属医院", level: "官方唯一省级分中心医院", departments: ["感染性疾病科", "呼吸内科", "海南省热带病研究中心", "检验科"], status: "active", contactPerson: "赖主任", phone: "0898-66811234" },
  { id: "inst-22", province: "重庆", name: "重庆市公共卫生医疗救治中心", level: "官方唯一省级分中心医院", departments: ["结核内科", "感染科", "重症医学科", "基因诊断实验室"], status: "active", contactPerson: "金主任", phone: "023-65311234" },
  { id: "inst-23", province: "四川", name: "成都市公共卫生临床医疗中心（西南区域分中心）", level: "官方唯一省级分中心医院", departments: ["结核大科", "感染大科", "重症医学科", "分子生物学实验室"], status: "active", contactPerson: "彭主任", phone: "028-84511234" },
  { id: "inst-24", province: "贵州", name: "贵州省人民医院", level: "官方唯一省级分中心医院", departments: ["呼吸与危重症医学科", "感染科", "检验医学科", "临床基因组中心"], status: "active", contactPerson: "常主任", phone: "0851-85911234" },
  { id: "inst-25", province: "云南", name: "昆明市第三人民医院", level: "官方唯一省级分中心医院", departments: ["结核病防治中心", "感染性疾病科", "重症医学科", "检验科"], status: "active", contactPerson: "段大夫", phone: "0871-63511234" },
  { id: "inst-26", province: "西藏", name: "西藏自治区第三人民医院", level: "官方唯一省级分中心医院", departments: ["高原结核病科", "传染病内科", "分子诊断实验室"], status: "active", contactPerson: "巴桑主任", phone: "0891-6831234" },
  { id: "inst-27", province: "陕西", name: "陕西省结核病防治院（陕西省第五人民医院）", level: "官方唯一省级分中心医院", departments: ["耐药结核病科", "中西医结合结核科", "胸外科", "检验科"], status: "active", contactPerson: "崔主任", phone: "029-85811234" },
  { id: "inst-28", province: "甘肃", name: "兰州市肺科医院", level: "官方唯一省级分中心医院", departments: ["结核内科", "呼吸科", "重症医学科", "检验医学科"], status: "active", contactPerson: "石主任", phone: "0931-8461234" },
  { id: "inst-29", province: "青海", name: "青海省第四人民医院", level: "官方唯一省级分中心医院", departments: ["包虫病与结核科", "呼吸内科", "病原微生物诊断科"], status: "active", contactPerson: "马大夫", phone: "0971-8211234" },
  { id: "inst-30", province: "宁夏", name: "宁夏回族自治区第四人民医院", level: "官方唯一省级分中心医院", departments: ["结核内科", "呼吸科", "重症科", "检验分子诊断中心"], status: "active", contactPerson: "杨主任", phone: "0951-2011234" },
  { id: "inst-31", province: "新疆", name: "新疆医科大学第八附属医院（自治区传染病医院）", level: "官方唯一省级分中心医院", departments: ["结核科", "传染病诊疗中心", "重症医学科", "药学部", "基因诊断实验室"], status: "active", contactPerson: "阿布都主任", phone: "0991-4311234" }
];

const ALL_PROVINCES = [
  "全部地区", "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", 
  "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", 
  "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", 
  "青海", "宁夏", "新疆"
];

export function InstitutionManagement() {
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("全部地区");
  
  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  
  // Edit Institution Form state
  const [editForm, setEditForm] = useState({
    name: "",
    province: "",
    level: "官方唯一省级分中心医院",
    contactPerson: "",
    phone: "",
    status: "active" as "active" | "inactive"
  });

  // Department management state
  const [deptInst, setDeptInst] = useState<Institution | null>(null);
  const [newDeptName, setNewDeptName] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  // Add or Edit Institution
  const handleOpenEdit = (inst?: Institution) => {
    if (inst) {
      setEditingInst(inst);
      setEditForm({
        name: inst.name,
        province: inst.province,
        level: inst.level,
        contactPerson: inst.contactPerson || "",
        phone: inst.phone || "",
        status: inst.status
      });
    } else {
      setEditingInst(null);
      setEditForm({
        name: "",
        province: "北京",
        level: "官方唯一省级分中心医院",
        contactPerson: "",
        phone: "",
        status: "active"
      });
    }
    setIsEditOpen(true);
  };

  const handleSaveInstitution = () => {
    if (!editForm.name.trim()) {
      showToast("错误：机构名称不能为空！");
      return;
    }

    if (editingInst) {
      // Edit
      setInstitutions(prev => prev.map(inst => 
        inst.id === editingInst.id 
          ? { ...inst, ...editForm } 
          : inst
      ));
      showToast(`已成功修改机构: ${editForm.name}`);
    } else {
      // Add
      const newInst: Institution = {
        id: `inst-${Date.now()}`,
        name: editForm.name,
        province: editForm.province,
        level: editForm.level,
        departments: ["内科", "外科", "检验科"],
        contactPerson: editForm.contactPerson,
        phone: editForm.phone,
        status: editForm.status
      };
      setInstitutions(prev => [newInst, ...prev]);
      showToast(`已成功新增机构: ${editForm.name}`);
    }
    setIsEditOpen(false);
  };

  const handleDeleteInstitution = (id: string, name: string) => {
    if (confirm(`确定要删除机构“${name}”吗？此操作无法撤销。`)) {
      setInstitutions(prev => prev.filter(inst => inst.id !== id));
      showToast(`已删除机构: ${name}`);
    }
  };

  // Department Management
  const handleOpenDeptMgmt = (inst: Institution) => {
    setDeptInst(inst);
    setIsDeptOpen(true);
  };

  const handleAddDept = () => {
    if (!newDeptName.trim()) return;
    if (!deptInst) return;

    if (deptInst.departments.includes(newDeptName.trim())) {
      showToast("错误：该科室已存在");
      return;
    }

    const updatedDepts = [...deptInst.departments, newDeptName.trim()];
    
    setInstitutions(prev => prev.map(inst => 
      inst.id === deptInst.id 
        ? { ...inst, departments: updatedDepts } 
        : inst
    ));

    setDeptInst(prev => prev ? { ...prev, departments: updatedDepts } : null);
    setNewDeptName("");
    showToast(`成功添加科室: ${newDeptName}`);
  };

  const handleRemoveDept = (deptName: string) => {
    if (!deptInst) return;

    const updatedDepts = deptInst.departments.filter(d => d !== deptName);
    
    setInstitutions(prev => prev.map(inst => 
      inst.id === deptInst.id 
        ? { ...inst, departments: updatedDepts } 
        : inst
    ));

    setDeptInst(prev => prev ? { ...prev, departments: updatedDepts } : null);
    showToast(`已移除科室: ${deptName}`);
  };

  // Filter Institutions
  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = 
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.departments.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesProvince = selectedProvince === "全部地区" || inst.province === selectedProvince;
    
    return matchesSearch && matchesProvince;
  });

  const activeCount = filteredInstitutions.filter(i => i.status === "active").length;

  return (
    <div className="space-y-6 p-6 min-w-0 w-full overflow-x-hidden relative">
      
      {/* Toast feedback */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0F172A] border border-slate-800 text-white shadow-xl px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#02A1C8]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Title Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2.5">
            <Building2 className="w-5.5 h-5.5 text-[#02A1C8]" />
            机构管理
          </h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1.5 max-w-2xl">
            配置和维护生信分析系统中关联的所有协作医疗机构、省级分中心医院以及各医院对应的科室(Departments)信息，支持平级扁平化检索和管理。
          </p>
        </div>

        <Button 
          onClick={() => handleOpenEdit()}
          size="sm" 
          className="tech-mono text-[11px] bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold h-9 rounded-lg shadow-sm shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          新增机构
        </Button>
      </div>

      {/* Search and Filters Card Block */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Input searching */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="搜索机构名称、科室关键字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-[#02A1C8] w-full"
            />
          </div>

          {/* Right: Quick clear */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                }}
                className="h-9 text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 hover:bg-rose-50/40"
              >
                清空重置
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Main Table view of Institutions */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 text-slate-400 border-b border-slate-100">
              <TableRow className="border-b border-slate-100">
                <TableHead className="text-slate-500 font-bold text-xs h-11 w-20 pl-6">省份</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs h-11 min-w-[280px]">合作机构名称</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs h-11 w-48">机构级别 / 类型</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs h-11 min-w-[320px]">对应科室列表 ({filteredInstitutions.length > 0 ? "已设" : "0"})</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs h-11 w-28">状态</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs h-11 w-40 text-right pr-6">管理操作</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {filteredInstitutions.length > 0 ? (
                filteredInstitutions.map((inst) => (
                  <TableRow key={inst.id} className="hover:bg-slate-50/30 border-b border-slate-50 text-left">
                    {/* Province badge */}
                    <TableCell className="pl-6 py-4">
                      <Badge className="bg-blue-50 text-[#02A1C8] hover:bg-blue-100/50 border-none font-bold text-[10px] rounded px-2.5 py-0.5">
                        {inst.province}
                      </Badge>
                    </TableCell>

                    {/* Hospital Name */}
                    <TableCell className="py-4 font-bold text-slate-700 text-xs">
                      {inst.name}
                    </TableCell>

                    {/* Designation level */}
                    <TableCell className="py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100/40">
                        <Building className="w-3.5 h-3.5" />
                        {inst.level}
                      </span>
                    </TableCell>

                    {/* Departments list tags */}
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[500px]">
                        {inst.departments.map((dept, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="bg-slate-100/80 text-slate-600 border border-slate-200/40 shadow-none font-medium text-[10px] px-2 py-0.5"
                          >
                            {dept}
                          </Badge>
                        ))}
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenDeptMgmt(inst)}
                          className="h-5 text-[10px] text-[#02A1C8] hover:text-[#017ea0] font-bold px-1.5 py-0 hover:bg-blue-50/40 border border-dashed border-blue-200 hover:border-blue-400 rounded"
                        >
                          + 配置
                        </Button>
                      </div>
                    </TableCell>

                    {/* Status Toggle Badge */}
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "text-[10px] px-2 py-0.5 font-bold shadow-none rounded border",
                        inst.status === "active" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      )}>
                        {inst.status === "active" ? "运行中" : "已停用"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="管理科室"
                          onClick={() => handleOpenDeptMgmt(inst)}
                          className="h-8 w-8 text-slate-500 border-slate-200 hover:text-[#02A1C8] hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="编辑机构"
                          onClick={() => handleOpenEdit(inst)}
                          className="h-8 w-8 text-slate-500 border-slate-200 hover:text-[#02A1C8] hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="删除机构"
                          onClick={() => handleDeleteInstitution(inst.id, inst.name)}
                          className="h-8 w-8 text-slate-400 border-slate-200 hover:text-rose-500 hover:bg-rose-50/30 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400 font-medium">
                    没有找到符合筛选条件的机构信息
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* -------------------- 弹窗1：新增/编辑机构 -------------------- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl p-6 border-slate-100 text-left">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#02A1C8]" />
              {editingInst ? "编辑合作机构" : "新增合作机构"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">
              请填写合作医院或检验中心的登记配置信息。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">机构名称</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="例如：解放军总医院第八医学中心"
                className="h-9 text-xs border-slate-200 focus-visible:ring-[#02A1C8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">省份/地区</Label>
                <select
                  value={editForm.province}
                  onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#02A1C8]"
                >
                  {ALL_PROVINCES.filter(p => p !== "全部地区").map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">状态</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "active" | "inactive" })}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#02A1C8]"
                >
                  <option value="active">运行中 (Active)</option>
                  <option value="inactive">已停用 (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">级别类型</Label>
              <Input
                value={editForm.level}
                onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                placeholder="官方唯一省级分中心医院"
                className="h-9 text-xs border-slate-200 focus-visible:ring-[#02A1C8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">联系人姓名</Label>
                <Input
                  value={editForm.contactPerson}
                  onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                  placeholder="请输入主任/负责人"
                  className="h-9 text-xs border-slate-200 focus-visible:ring-[#02A1C8]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">联系人电话</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="座机或手机号码"
                  className="h-9 text-xs border-slate-200 focus-visible:ring-[#02A1C8]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-50 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditOpen(false)}
              className="h-9 text-xs font-bold px-4 border-slate-200"
            >
              取消
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveInstitution}
              className="h-9 text-xs font-bold px-5 bg-[#02A1C8] hover:bg-[#017ea0] text-white"
            >
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------- 弹窗2：科室管理 -------------------- */}
      <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl p-6 border-slate-100 text-left">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#02A1C8]" />
              科室配置管理
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">
              管理 <strong className="text-slate-700 font-bold">{deptInst?.name}</strong> 对应的业务科室列表。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Add new Department block */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">新增关联科室</Label>
              <div className="flex gap-2">
                <Input
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="例如：分子诊断诊断实验室"
                  className="h-9 text-xs border-slate-200 focus-visible:ring-[#02A1C8]"
                />
                <Button
                  onClick={handleAddDept}
                  size="sm"
                  className="bg-[#02A1C8] hover:bg-[#017ea0] text-white font-bold h-9 px-4 cursor-pointer"
                >
                  添加
                </Button>
              </div>
            </div>

            {/* Current departments list */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">当前已设置科室 ({deptInst?.departments.length || 0})</Label>
              <ScrollArea className="h-44 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                {deptInst && deptInst.departments.length > 0 ? (
                  <div className="space-y-1.5">
                    {deptInst.departments.map((dept, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 shadow-3xs"
                      >
                        <span className="text-slate-700 font-bold">{dept}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDept(dept)}
                          className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded"
                          title="移除科室"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                    <FolderTree className="w-8 h-8 text-slate-300 mb-1.5" />
                    <p className="text-[11px]">暂无已登记的科室</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-50">
            <Button 
              size="sm" 
              onClick={() => setIsDeptOpen(false)}
              className="h-9 text-xs font-bold px-5 bg-[#02A1C8] hover:bg-[#017ea0] text-white w-full"
            >
              关闭并保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
