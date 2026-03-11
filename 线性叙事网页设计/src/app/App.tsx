import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  Activity, AlertTriangle, CheckCircle2, ChevronRight, Clock,
  Cpu, FileText, Settings, ShieldAlert, Zap, Thermometer,
  Wind, Power, Check, Server, ArrowRight, BarChart3
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Assets
import imgA0102 from "figma:asset/1b95d409dcd591a9a2eded1c8d8680d0289feb67.png";
import img7Eb8C65 from "figma:asset/3b22f3c1eb8b817ad386422de8a5e9a2678e6530.png";

// --- Data ---
const CHART_DATA = [
  { time: "00:00", value: 20 },
  { time: "04:00", value: 25 },
  { time: "08:00", value: 30 },
  { time: "12:00", value: 45 },
  { time: "16:00", value: 65 },
  { time: "20:00", value: 92 }, // Fault spike
  { time: "24:00", value: 95 },
];

const ALERTS = [
  { id: "A01", type: "error", title: "温度过高预警", desc: "节点 A01 核心温度突破 90°C", time: "10:24:00", value: "95°C", icon: Thermometer },
  { id: "B03", type: "warning", title: "风扇转速异常", desc: "节点 B03 散热风扇停转", time: "09:12:30", value: "0 RPM", icon: Wind },
  { id: "C02", type: "info", title: "电压波动", desc: "机柜 C02 输入电压不稳", time: "08:45:15", value: "245V", icon: Power },
];

const HISTORY_DATA = [
  { id: "HD-2023101", device: "服务器机柜 A01", issue: "冷却液泄漏导致核心过热", time: "2023-10-12 14:30", status: "Resolved", duration: "45 min" },
  { id: "HD-2023098", device: "交换机节点 B02", issue: "光转模块光衰告警", time: "2023-10-10 09:15", status: "Resolved", duration: "1h 20m" },
  { id: "HD-2023095", device: "存储阵列 C05", issue: "磁盘阵列 I/O 延迟过高", time: "2023-10-08 16:40", status: "Resolved", duration: "30 min" },
];

const OVERVIEW_CARDS = [
  { title: "智能预警", en: "Intelligent Warning", desc: "实时监测设备状态，多维度指标异常预警，防患于未然。" },
  { title: "故障诊断", en: "Fault Diagnosis", desc: "结合专家经验与AI算法，快速定位故障原因，提供修复方案。" },
  { title: "预测维护", en: "Predictive Maintenance", desc: "基于历史数据与劣化模型，预测设备剩余寿命。" },
  { title: "知识沉淀", en: "Knowledge Accumulation", desc: "建立故障知识库，沉淀专家经验，提升排障能力。" },
];

// --- Components ---

function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12 relative">
      <h2 className="text-3xl font-bold text-[#20232A] flex flex-col gap-1 relative z-10">
        <span className="text-[#2B6AFF] font-black text-xl tracking-widest uppercase">{subtitle}</span>
        {title}
      </h2>
      <div className="w-12 h-2 bg-[#2B6AFF] mt-4 rounded-full" />
    </div>
  );
}

export default function App() {
  const [activeAlert, setActiveAlert] = useState(ALERTS[0]);
  const [showAI, setShowAI] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const chartRef = useRef(null);
  const isChartInView = useInView(chartRef, { once: true, margin: "-100px" });

  const handleAlertClick = (alert: typeof ALERTS[0]) => {
    setActiveAlert(alert);
    setSelectedPoint(alert.id);
    setShowAI(false); // Reset AI state
    
    // Smooth scroll to collaboration section
    document.getElementById("collaboration")?.scrollIntoView({ behavior: "smooth" });
    
    // Simulate loading AI suggestion
    setTimeout(() => {
      setShowAI(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-['PingFang_SC',sans-serif] text-[#5B6373] selection:bg-[#2B6AFF]/20">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#E5EEFF] blur-[120px] opacity-60" />
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4E3FF] blur-[100px] opacity-40" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-white/20 z-50 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2B6AFF] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-[#20232A]">Nexus<span className="text-[#2B6AFF]">Twin</span></span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-sm">
          <a href="#overview" className="text-[#20232A] hover:text-[#2B6AFF] transition-colors">概述 Overview</a>
          <a href="#awareness" className="text-[#20232A] hover:text-[#2B6AFF] transition-colors">预警 Awareness</a>
          <a href="#collaboration" className="text-[#20232A] hover:text-[#2B6AFF] transition-colors">诊断 Collaboration</a>
          <a href="#reflection" className="text-[#20232A] hover:text-[#2B6AFF] transition-colors">复盘 Reflection</a>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
           <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=100" alt="User" />
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-32">
        
        {/* HERO & AWARENESS (发现问题) */}
        <section id="awareness" className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-24 min-h-[90vh] flex flex-col justify-center">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-[#20232A] tracking-tight mb-4 uppercase">
              <span className="text-[#2B6AFF]">Fault</span> Diagnosis<br/>Management
            </h1>
            <p className="text-xl text-[#5B6373] tracking-wide">故障诊断管理系统 · 设备 · 预警 · 分析</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* 3D Server Asset (Linkage Area) */}
            <div className="lg:col-span-7 relative h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[#E5EEFF] to-transparent rounded-[40px] -z-10" />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img src={imgA0102} alt="3D Server Rack" className="h-[90%] object-contain drop-shadow-2xl" />
                
                {/* Interactive Hotspots */}
                <div 
                  onClick={() => handleAlertClick(ALERTS[0])}
                  className={cn(
                    "absolute top-[35%] left-[48%] w-10 h-10 -ml-5 -mt-5 rounded-full cursor-pointer flex items-center justify-center group transition-all",
                    selectedPoint === 'A01' ? "scale-125" : "hover:scale-110"
                  )}
                >
                  <div className="absolute inset-0 bg-[#F54A45] rounded-full animate-ping opacity-30" />
                  <div className="w-4 h-4 bg-[#F54A45] rounded-full border-2 border-white shadow-lg relative z-10" />
                  <div className="absolute left-full ml-3 bg-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold text-[#F54A45] pointer-events-none">
                    Node A01 - Critical
                  </div>
                </div>

                <div 
                  onClick={() => handleAlertClick(ALERTS[1])}
                  className={cn(
                    "absolute top-[60%] left-[52%] w-10 h-10 -ml-5 -mt-5 rounded-full cursor-pointer flex items-center justify-center group transition-all",
                    selectedPoint === 'B03' ? "scale-125" : "hover:scale-110"
                  )}
                >
                  <div className="absolute inset-0 bg-[#FF9900] rounded-full animate-ping opacity-30" />
                  <div className="w-4 h-4 bg-[#FF9900] rounded-full border-2 border-white shadow-lg relative z-10" />
                  <div className="absolute left-full ml-3 bg-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold text-[#FF9900] pointer-events-none">
                    Node B03 - Warning
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Real-time Alerts */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#20232A]">实时预警看板</h3>
                <span className="flex items-center gap-2 text-sm text-[#F54A45] font-medium bg-[#F54A45]/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#F54A45] animate-pulse" />
                  Live
                </span>
              </div>

              {ALERTS.map((alert, idx) => {
                const Icon = alert.icon;
                const isSelected = activeAlert.id === alert.id;
                return (
                  <Card 
                    key={alert.id} 
                    onClick={() => handleAlertClick(alert)}
                    className={cn(
                      "p-5 flex items-center gap-4 group",
                      isSelected ? "border-[#2B6AFF] shadow-md ring-1 ring-[#2B6AFF]" : "hover:border-[#2B6AFF]/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      alert.type === 'error' ? "bg-[#F54A45]/10 text-[#F54A45]" : 
                      alert.type === 'warning' ? "bg-[#FF9900]/10 text-[#FF9900]" : "bg-[#2B6AFF]/10 text-[#2B6AFF]"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-[#20232A] group-hover:text-[#2B6AFF] transition-colors">{alert.title}</h4>
                        <span className="text-xs text-[#8A92A6]">{alert.time}</span>
                      </div>
                      <p className="text-sm text-[#5B6373]">{alert.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "font-bold text-lg",
                        alert.type === 'error' ? "text-[#F54A45]" : 
                        alert.type === 'warning' ? "text-[#FF9900]" : "text-[#2B6AFF]"
                      )}>{alert.value}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* OVERVIEW & DESIGN GOALS */}
        <section id="overview" className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-24 py-24 bg-white/50 backdrop-blur-sm border-y border-white">
          <SectionLabel subtitle="Project Overview" title="项目概况" />
          
          <div className="mb-16 max-w-4xl text-lg leading-relaxed text-[#5B6373]">
            <p>本系统旨在解决工厂设备管理过程中的痛点，通过对设备运行状态的实时监测、数据分析和算法模型构建，实现设备的智能预警、故障诊断和预测性维护，降低非计划停机时间，提升设备利用率和运维效率，赋能企业数字化转型与高质量发展。</p>
          </div>

          <h3 className="text-2xl font-bold text-[#20232A] mb-8">产品定位 Product Positioning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OVERVIEW_CARDS.map((card, i) => (
              <Card key={i} className="p-8 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 group-hover:bg-[#2B6AFF] transition-colors" />
                <div className="w-12 h-12 rounded-full bg-[#E5EEFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-[#2B6AFF] font-bold text-xl">{i+1}</span>
                </div>
                <h4 className="text-xl font-bold text-[#20232A] mb-2">{card.title}</h4>
                <p className="text-xs text-[#8A92A6] font-medium mb-4 uppercase tracking-wider">{card.en}</p>
                <p className="text-sm text-[#5B6373] leading-relaxed">{card.desc}</p>
              </Card>
            ))}
          </div>

          {/* Design Goals Diagram Simulation */}
          <div className="mt-24 pt-16 border-t border-gray-200 flex flex-col items-center">
            <SectionLabel subtitle="Design Goal" title="设计目标" />
            <div className="relative w-[600px] h-[400px] flex items-center justify-center">
               <div className="absolute w-[240px] h-[240px] rounded-full border-[3px] border-[#2B6AFF] bg-[#2B6AFF]/5 mix-blend-multiply flex items-center justify-center -ml-[120px] -mt-[60px] group hover:-translate-y-2 transition-transform cursor-default">
                  <div className="text-center">
                    <span className="block font-bold text-[#20232A] text-xl">产品侧</span>
                    <span className="text-sm text-[#5B6373]">易用 · 高效</span>
                  </div>
               </div>
               <div className="absolute w-[240px] h-[240px] rounded-full border-[3px] border-[#4684FF] bg-[#4684FF]/5 mix-blend-multiply flex items-center justify-center ml-[120px] -mt-[60px] group hover:-translate-y-2 transition-transform cursor-default">
                  <div className="text-center">
                    <span className="block font-bold text-[#20232A] text-xl">业务侧</span>
                    <span className="text-sm text-[#5B6373]">提效 · 降本</span>
                  </div>
               </div>
               <div className="absolute w-[240px] h-[240px] rounded-full border-[3px] border-[#74A3FF] bg-[#74A3FF]/5 mix-blend-multiply flex items-center justify-center mt-[120px] group hover:-translate-y-2 transition-transform cursor-default">
                  <div className="text-center">
                    <span className="block font-bold text-[#20232A] text-xl">体验侧</span>
                    <span className="text-sm text-[#5B6373]">统一 · 规范</span>
                  </div>
               </div>
               {/* Center intersection text */}
               <div className="absolute mt-[20px] text-center max-w-[200px] bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg z-10 border border-gray-100">
                 <p className="text-sm font-bold text-[#2B6AFF]">建立标准化的设计规范体系，提升协作效率，保证多终端体验一致性。</p>
               </div>
            </div>
          </div>
        </section>

        {/* COLLABORATION / DIAGNOSTICS (协同处理) */}
        <section id="collaboration" className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-24 py-24">
          <SectionLabel subtitle="Collaboration" title="诊断与协同处理" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-8">
              <Card className="p-8 h-[500px] flex flex-col">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-[#20232A]">故障劣化趋势图</h3>
                    <p className="text-[#8A92A6] text-sm mt-1">监测节点: {activeAlert.id} | 当前状态: <span className={activeAlert.type === 'error' ? "text-[#F54A45]" : "text-[#FF9900]"}>{activeAlert.value}</span></p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#5B6373]">
                      <span className="w-3 h-3 rounded-full bg-[#2B6AFF]" /> 正常阈值
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#5B6373]">
                      <span className="w-3 h-3 rounded-full bg-[#F54A45]" /> 危险阈值
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative" ref={chartRef}>
                  {isChartInView && (
                    <motion.div 
                      initial={{ clipPath: 'inset(0 100% 0 0)' }}
                      animate={{ clipPath: 'inset(0 0% 0 0)' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="w-full h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2B6AFF" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2B6AFF" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F54A45" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#F54A45" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                          <XAxis dataKey="time" stroke="#8A92A6" tick={{ fill: '#8A92A6', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="#8A92A6" tick={{ fill: '#8A92A6', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#F2F4F7', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                          {/* Alert threshold line */}
                          <line x1="0" y1="15%" x2="100%" y2="15%" stroke="#F54A45" strokeDasharray="5 5" strokeWidth={1} />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={activeAlert.type === 'error' ? "#F54A45" : "#2B6AFF"} 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill={activeAlert.type === 'error' ? "url(#colorError)" : "url(#colorValue)"} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </div>
              </Card>
            </div>

            {/* AI Suggestion & Work Order Area */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <Card className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-[#2B6AFF] to-[#4684FF] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#20232A]">AI 智能诊断方案</h3>
                </div>

                <div className="flex-1">
                  {!showAI ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#8A92A6] gap-4">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <Settings className="w-8 h-8 opacity-50" />
                      </motion.div>
                      <p className="text-sm">正在结合历史库生成诊断建议...</p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-[#F54A45]/5 border border-[#F54A45]/20 p-4 rounded-xl">
                        <p className="text-sm text-[#F54A45] font-bold mb-1">根因分析</p>
                        <p className="text-sm text-[#5B6373]">根据波形特征与历史样本比对，92%概率为 <span className="font-bold text-[#20232A]">冷却系统循环泵轴承磨损</span> 导致液压下降，进而引发核心过热。</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-[#20232A]">推荐修复步骤：</p>
                        <ul className="text-sm text-[#5B6373] space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#15C689] shrink-0 mt-0.5" />
                            远程降低 {activeAlert.id} 节点负载至 30%
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#15C689] shrink-0 mt-0.5" />
                            调度备用机柜承接核心业务流
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#15C689] shrink-0 mt-0.5" />
                            现场更换型号为 PC-802 的循环泵组件
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-[#8A92A6] mb-3">分配处理人员</p>
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Tech" />
                      <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Tech" />
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-[#5B6373] font-medium">+3</div>
                    </div>
                    <span className="text-sm text-[#2B6AFF] font-medium cursor-pointer hover:underline">在线协同群组</span>
                  </div>
                  <button className="w-full py-3 bg-[#2B6AFF] hover:bg-[#1A5AE5] text-white rounded-xl font-bold transition-all duration-300 shadow-[0_4px_14px_rgba(43,106,255,0.3)] hover:shadow-[0_6px_20px_rgba(43,106,255,0.4)] active:scale-[0.98] flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    一键下发工单
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* REFLECTION & HISTORY (复盘记录) */}
        <section id="reflection" className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-24 py-24 bg-white">
          <SectionLabel subtitle="Reflection" title="历史事件闭环" />
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F2F4F7] text-[#8A92A6] text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium pl-6">事件编号</th>
                    <th className="p-4 font-medium">报警设备</th>
                    <th className="p-4 font-medium">故障原因 (知识库归档)</th>
                    <th className="p-4 font-medium">发生时间</th>
                    <th className="p-4 font-medium">处理时长</th>
                    <th className="p-4 font-medium text-right pr-6">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {HISTORY_DATA.map((item, i) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group hover:bg-[#F8FAFC] transition-colors cursor-default"
                    >
                      <td className="p-4 pl-6 text-[#20232A] font-bold text-sm">{item.id}</td>
                      <td className="p-4 text-[#5B6373] text-sm flex items-center gap-2">
                        <Server className="w-4 h-4 text-[#8A92A6]" />
                        {item.device}
                      </td>
                      <td className="p-4 text-[#5B6373] text-sm max-w-xs truncate group-hover:text-[#2B6AFF] transition-colors">
                        {item.issue}
                      </td>
                      <td className="p-4 text-[#8A92A6] text-sm">{item.time}</td>
                      <td className="p-4 text-[#5B6373] text-sm font-medium">{item.duration}</td>
                      <td className="p-4 pr-6 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#15C689]/10 text-[#15C689]">
                          <Check className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-[#F8FAFC] flex justify-between items-center text-sm text-[#8A92A6]">
              <span>显示 1-3 条，共 128 条记录</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors">上一页</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors">下一页</button>
              </div>
            </div>
          </Card>
        </section>

        {/* Design System Footer Note */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-24 mt-12 pb-12 flex justify-between items-center text-sm text-[#8A92A6] border-t border-gray-200 pt-8">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2B6AFF]" /> Brand Primary</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F54A45]" /> Semantic Error</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#15C689]" /> Semantic Success</span>
          </div>
          <span>Font: PingFang SC, DIN | Grid: 1440px Fluid</span>
        </div>

      </main>
    </div>
  );
}
