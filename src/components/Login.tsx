import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, Lock, User, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 模拟登录逻辑
    setTimeout(() => {
      if ((username === "admin" && password === "admin123") || (username === "user" && password === "user123")) {
        onLogin(username);
      } else {
        setError("账号或密码错误 (提示: admin/admin123)");
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden font-sans">
      {/* Left Column: Illustration & Brand */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[60%] relative bg-[#f8fafc] items-center justify-center overflow-hidden border-r border-slate-100"
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 tech-grid-bg opacity-[0.4]" />
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-blue-100/50 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-[#02A1C8]/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 w-full max-w-2xl p-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#02A1C8] rounded-xl flex items-center justify-center shadow-lg shadow-[#02A1C8]/20">
                <FlaskConical className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tech-mono tracking-tight">RESEARCH_SYSTEM</h2>
                <p className="text-[10px] text-[#02A1C8] font-bold tech-mono tracking-[0.2em] uppercase">v2.5.0 Stable Release</p>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                科研数据分析<br />
                <span className="text-[#02A1C8]">通用型基础平台</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-md leading-relaxed">
                整合高通量测序数据、蛋白质组学与生物信息学工具，为基础科研提供一站式数字化协作环境。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "安全沙箱环境" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "多组学数据整合" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "可视化管线管理" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "分布式计算加速" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <span className="text-[#02A1C8]">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements to mimic the illustration in the image */}
        <div className="absolute right-0 bottom-0 w-full h-[50%] opacity-20 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="none">
            <path d="M0,500 L0,400 L200,300 L400,350 L600,250 L800,300 L1000,200 L1000,500 Z" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#02A1C8', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#02A1C8', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[400px] flex flex-col items-center"
        >
          {/* Mobile Logo Only */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mx-auto w-12 h-12 bg-[#02A1C8] rounded-xl flex items-center justify-center mb-4">
              <FlaskConical className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tech-mono">RESEARCH_SYSTEM</h1>
          </div>

          <div className="w-full space-y-2 mb-10 text-left">
            <h2 className="text-[44px] font-medium text-slate-800 leading-none lowercase tracking-tighter">
              welcome!
            </h2>
            <p className="text-slate-500 text-lg font-light">
              通用型基础科研系统
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 text-xs p-4 rounded-lg flex items-center gap-3 border border-red-100"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">账号 / Username</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="请输入账号" 
                    className="h-12 pl-11 bg-slate-50/50 border-slate-200 focus-visible:ring-0 focus-visible:border-[#02A1C8]/50 rounded-xl transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 focus-within:scale-[1.01] transition-transform">
                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">密码 / Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="请输入密码" 
                    className="h-12 pl-11 pr-12 bg-slate-50/50 border-slate-200 focus-visible:ring-0 focus-visible:border-[#02A1C8]/50 rounded-xl transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center group-hover:border-[#02A1C8] transition-colors relative">
                  <input type="checkbox" className="absolute inset-0 opacity-0 cursor-pointer peer" />
                  <div className="w-2.5 h-2.5 bg-[#02A1C8] rounded-sm scale-0 peer-checked:scale-100 transition-transform" />
                </div>
                <span className="group-hover:text-slate-700">7天内自动登陆</span>
              </label>
              <a href="#" className="text-slate-400 hover:text-[#02A1C8] transition-colors">忘记密码?</a>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#02A1C8] hover:bg-[#02A1C8]/90 text-white font-bold rounded-xl shadow-lg shadow-[#02A1C8]/20 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>验证中...</span>
                </div>
              ) : (
                "登 陆"
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 w-full text-center">
            <p className="text-[10px] text-slate-300 font-bold tech-mono uppercase tracking-[0.2em]">
              &copy; 2026 OXTIUM BIOTECH - SECURE TERMINAL
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
