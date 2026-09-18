import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Database,
  ExternalLink,
  Github
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const modelData = [
  { name: "DrugCLIP", status: "激活", type: "虚拟筛选", license: "Apache-2.0", accuracy: 94 },
  { name: "LyMOI", status: "激活", type: "靶点发现", license: "Proprietary", accuracy: 89 },
  { name: "MAMMAL", status: "激活", type: "靶点验证", license: "Commercial", accuracy: 92 },
  { name: "REINVENT 4", status: "激活", type: "分子生成", license: "Commercial", accuracy: 95 },
];

const performanceData = [
  { time: "00:00", value: 45 },
  { time: "04:00", value: 52 },
  { time: "08:00", value: 48 },
  { time: "12:00", value: 61 },
  { time: "16:00", value: 55 },
  { time: "20:00", value: 67 },
  { time: "23:59", value: 59 },
];

export function AIDrugDiscovery() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI药物发现平台</h2>
          <p className="text-muted-foreground tech-mono text-xs mt-1">
            AI 驱动的药物发现和靶点验证系统。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="tech-mono text-[10px] gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            GPU 集群：在线
          </Badge>
          <Badge variant="outline" className="tech-mono text-[10px] gap-1">
            <Cpu className="w-3 h-3" />
            8x H100 运行中
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {modelData.map((model) => (
          <Card key={model.name} className="tech-border bg-card/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 tech-bg-soft">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold tech-mono">{model.name}</CardTitle>
                <Badge variant="outline" className="text-[9px] tech-mono border-[#418FC8]/30 text-[#418FC8] bg-[#418FC8]/5">{model.status}</Badge>
              </div>
              <CardDescription className="text-[10px] tech-mono">{model.type}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] tech-mono">
                  <span className="text-muted-foreground">准确率</span>
                  <span className="font-bold text-[#02A1C8]">{model.accuracy}%</span>
                </div>
                <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                  <div 
                    className="tech-gradient-blue h-full transition-all" 
                    style={{ width: `${model.accuracy}%` }} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <span className="text-[9px] text-muted-foreground tech-mono">{model.license}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Github className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4 tech-border">
          <CardHeader>
            <CardTitle className="text-sm tech-header">系统吞吐量 (分子/秒)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      borderColor: "hsl(var(--border))",
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)"
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#02A1C8" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 tech-border">
          <CardHeader>
            <CardTitle className="text-sm tech-header">数据库统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 tech-bg-soft rounded border border-[#96C2E1]/20">
                  <Database className="w-4 h-4 text-[#02A1C8]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium leading-none">病原体数据库</p>
                  <p className="text-[10px] text-muted-foreground tech-mono">已索引 20,000+ 物种</p>
                </div>
                <div className="text-xs font-bold tech-mono text-[#02A1C8]">98.2%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 tech-bg-soft rounded border border-[#96C2E1]/20">
                  <Zap className="w-4 h-4 text-[#02A1C8]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium leading-none">蛋白质结构</p>
                  <p className="text-[10px] text-muted-foreground tech-mono">1.2M 预测模型</p>
                </div>
                <div className="text-xs font-bold tech-mono text-[#02A1C8]">84.5%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 tech-bg-soft rounded border border-[#96C2E1]/20">
                  <ShieldCheck className="w-4 h-4 text-[#02A1C8]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium leading-none">已验证靶点</p>
                  <p className="text-[10px] text-muted-foreground tech-mono">450 高置信度</p>
                </div>
                <div className="text-xs font-bold tech-mono text-[#02A1C8]">100%</div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6 tech-mono text-[10px] h-8">
              查看所有数据库
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
