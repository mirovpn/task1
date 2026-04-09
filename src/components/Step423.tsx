import React, { useState, useMemo } from 'react';
import { TechnicalCard, Button, TechnicalInput } from './Common';
import ReactECharts from 'echarts-for-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, Settings, Download, Database, TrendingUp, 
  ClipboardCheck, CheckCircle2, AlertTriangle, ChevronRight, 
  ChevronDown, Info, Link, Unlink, Battery, Zap, FileText,
  Search, Activity, BookOpen, X, AlertCircle, FileSpreadsheet,
  LineChart, LayoutList
} from 'lucide-react';

// --- Types & Constants ---

interface MeasurementRow {
  depth: number;
  group: string;
  aPlus: number;
  aMinus: number;
  checksum: number | null;
  status: 'normal' | 'warning' | 'handled';
}

const CHECKSUM_LIMIT = 1.5; // ±30 units corresponds to ±1.5mm in this simulation

// --- Phase 1: Data Import & Pre-processing ---

export const DataProcessing: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedHole, setSelectedHole] = useState('');
  const [data, setData] = useState<MeasurementRow[]>([]);
  const [checksumCalculated, setChecksumCalculated] = useState(false);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [selectedAnomalyIndex, setSelectedAnomalyIndex] = useState<number | null>(null);
  const [anomalyForm, setAnomalyForm] = useState({ reason: '', solution: '' });
  const [manualOpen, setManualOpen] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    import: 0,
    checksum: 0,
    anomaly1: 0,
    anomaly2: 0
  });

  const mockRawData: MeasurementRow[] = [
    { depth: 0.5, group: '测组1', aPlus: 12.5, aMinus: -12.3, checksum: null, status: 'normal' },
    { depth: 1.0, group: '测组1', aPlus: 12.8, aMinus: -12.6, checksum: null, status: 'normal' },
    { depth: 1.5, group: '测组1', aPlus: 45.2, aMinus: -12.9, checksum: null, status: 'normal' }, // Anomaly 1
    { depth: 2.0, group: '测组1', aPlus: 12.9, aMinus: -12.7, checksum: null, status: 'normal' },
    { depth: 2.5, group: '测组1', aPlus: 13.0, aMinus: -42.8, checksum: null, status: 'normal' }, // Anomaly 2
    { depth: 3.0, group: '测组1', aPlus: 13.2, aMinus: -13.0, checksum: null, status: 'normal' },
    { depth: 3.5, group: '测组1', aPlus: 12.8, aMinus: -12.6, checksum: null, status: 'normal' },
    { depth: 4.0, group: '测组1', aPlus: 12.7, aMinus: -12.5, checksum: null, status: 'normal' },
  ];

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleImport = () => {
    setData(mockRawData);
    setScores(prev => ({ ...prev, import: 2 }));
  };

  const calculateChecksum = () => {
    setData(prev => prev.map(d => {
      const sum = d.aPlus + d.aMinus;
      return { 
        ...d, 
        checksum: Number(sum.toFixed(2)), 
        status: Math.abs(sum) > CHECKSUM_LIMIT ? 'warning' : 'normal' 
      };
    }));
    setChecksumCalculated(true);
    setScores(prev => ({ ...prev, checksum: 3 }));
  };

  const handleRowClick = (index: number) => {
    if (data[index].status === 'warning') {
      setSelectedAnomalyIndex(index);
      setShowAnomalyModal(true);
    }
  };

  const submitAnomaly = () => {
    if (selectedAnomalyIndex !== null) {
      if (anomalyForm.reason === 'probe_unstable' && anomalyForm.solution === 'remeasure') {
        setData(prev => prev.map((d, i) => i === selectedAnomalyIndex ? { ...d, status: 'handled' } : d));
        setShowAnomalyModal(false);
        
        const anomalyKey = selectedAnomalyIndex === 2 ? 'anomaly1' : 'anomaly2';
        setScores(prev => ({ ...prev, [anomalyKey]: 5 }));
        setAnomalyForm({ reason: '', solution: '' });
      } else {
        // Use a more subtle feedback than alert
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-xl z-[100] font-bold animate-bounce';
        errorMsg.innerText = '处理方案不符合规范，请重新分析原因并选择解决办法！';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
      }
    }
  };

  const allHandled = data.length > 0 && data.filter(d => d.status === 'warning').length === 0 && checksumCalculated;

  const handleNext = () => {
    const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
    onNext({
      stepId: '4.2.3-1',
      stepName: '数据导入与预处理',
      submittedAt: new Date().toISOString(),
      scores,
      totalScore,
      maxScore: 15,
      answers: [
        { id: '3-1-1', label: '数据导入', type: 'choice', score: scores.import, maxScore: 2, correct: scores.import === 2, userAnswer: '已导入', correctAnswer: '已导入' },
        { id: '3-1-2', label: '校验和计算', type: 'choice', score: scores.checksum, maxScore: 3, correct: scores.checksum === 3, userAnswer: '已计算', correctAnswer: '已计算' },
        { id: '3-1-3', label: '异常1处理', type: 'choice', score: scores.anomaly1, maxScore: 5, correct: scores.anomaly1 === 5, userAnswer: scores.anomaly1 === 5 ? '已处理' : '未处理', correctAnswer: '已处理' },
        { id: '3-1-4', label: '异常2处理', type: 'choice', score: scores.anomaly2, maxScore: 5, correct: scores.anomaly2 === 5, userAnswer: scores.anomaly2 === 5 ? '已处理' : '未处理', correctAnswer: '已处理' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Manual - Sticky/Expandable */}
      <div className={cn(
        "fixed right-6 top-20 z-40 transition-all duration-300",
        manualOpen ? "w-80" : "w-12"
      )}>
        <div className="bg-white border-2 border-industrial-fg shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
          <button 
            onClick={() => setManualOpen(!manualOpen)}
            className="w-full h-12 flex items-center justify-center bg-industrial-fg text-industrial-bg hover:opacity-90 transition-colors"
          >
            <BookOpen size={20} />
            {manualOpen && <span className="ml-2 font-bold text-xs uppercase tracking-widest">User Manual</span>}
          </button>
          {manualOpen && (
            <div className="p-4 text-[11px] space-y-4 max-h-[60vh] overflow-y-auto font-mono">
              <div className="border-b border-industrial-fg/20 pb-2">
                <h5 className="font-bold uppercase text-industrial-info">1. 连接设备 / CONNECT</h5>
                <p className="opacity-70">点击「连接」按钮建立通讯。若连接失败，请检查蓝牙/串口设置。连接成功后方可选择测区与孔号。</p>
              </div>
              <div className="border-b border-industrial-fg/20 pb-2">
                <h5 className="font-bold uppercase text-industrial-warning">2. 数据校验 / CHECKSUM</h5>
                <p className="opacity-70">校验和 = A+ + A-。正常范围应在 ±1.50mm (±30单位) 以内。超限数据需手动标记并处理。</p>
              </div>
              <div className="border-b border-industrial-fg/20 pb-2">
                <h5 className="font-bold uppercase text-red-600">3. 异常处理 / ANOMALY</h5>
                <p className="opacity-70">点击红色高亮行进行标记。需说明异常原因（如探头未稳、导槽杂物）并选择处理方式（如补测）。</p>
              </div>
              <div className="pt-2">
                <p className="text-[9px] opacity-40 italic">System Version: v1.3.0-stable</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <TechnicalCard title="连接状态 / CONNECTION">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="opacity-60">设备ID: YQ02125072</span>
                <span className={isConnected ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {isConnected ? "● ONLINE" : "○ OFFLINE"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono opacity-60">
                <div className="flex items-center space-x-1"><Battery size={10} /><span>88%</span></div>
                <div className="flex items-center space-x-1"><Zap size={10} /><span>12.4V</span></div>
              </div>
              <Button 
                variant={isConnected ? 'secondary' : 'primary'} 
                className="w-full"
                onClick={isConnected ? () => setIsConnected(false) : handleConnect}
              >
                {isConnected ? "断开连接 / DISCONNECT" : "连接读数仪 / CONNECT"}
              </Button>
            </div>
          </TechnicalCard>

          <TechnicalCard title="测区选择 / SITE INFO">
            <div className="space-y-4">
              <div>
                <label className="technical-label">测区选择</label>
                <select 
                  disabled={!isConnected}
                  className="w-full border border-industrial-fg p-2 text-xs bg-white disabled:opacity-30"
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                >
                  <option value="">请选择...</option>
                  <option value="01">01区 (北侧基坑)</option>
                  <option value="02">02区 (东侧基坑)</option>
                  <option value="03">03区 (南侧基坑)</option>
                </select>
              </div>
              <div>
                <label className="technical-label">孔号选择</label>
                <select 
                  disabled={!selectedArea}
                  className="w-full border border-industrial-fg p-2 text-xs bg-white disabled:opacity-30"
                  value={selectedHole}
                  onChange={e => setSelectedHole(e.target.value)}
                >
                  <option value="">请选择...</option>
                  <option value="CX1">CX1 (深度20m)</option>
                  <option value="CX2">CX2 (深度20m)</option>
                  <option value="CX3">CX3 (深度20m)</option>
                </select>
              </div>
              <Button 
                disabled={!selectedHole || data.length > 0} 
                className="w-full"
                onClick={handleImport}
              >
                导入原始数据 / IMPORT
              </Button>
            </div>
          </TechnicalCard>
        </div>

        <div className="lg:col-span-3">
          <TechnicalCard title="原始数据校验表 / DATA VERIFICATION">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-industrial-fg bg-industrial-bg/30">
                    <th className="p-2 text-left">深度(m)</th>
                    <th className="p-2 text-left">组号</th>
                    <th className="p-2 text-left">A+(mm)</th>
                    <th className="p-2 text-left">A-(mm)</th>
                    <th className="p-2 text-left">校验和</th>
                    <th className="p-2 text-left">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-industrial-fg/10">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center opacity-30 italic">
                        <div className="flex flex-col items-center space-y-2">
                          <Database size={24} />
                          <span>等待数据导入... / WAITING FOR DATA</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, i) => (
                      <tr 
                        key={i} 
                        onClick={() => handleRowClick(i)}
                        className={cn(
                          "transition-colors",
                          row.status === 'warning' ? "bg-red-50 cursor-pointer hover:bg-red-100" : 
                          row.status === 'handled' ? "bg-green-50" : "hover:bg-industrial-bg/5"
                        )}
                      >
                        <td className="p-2">{row.depth.toFixed(1)}</td>
                        <td className="p-2">{row.group}</td>
                        <td className="p-2">{row.aPlus.toFixed(2)}</td>
                        <td className="p-2">{row.aMinus.toFixed(2)}</td>
                        <td className="p-2 font-bold">
                          {row.checksum !== null ? (
                            <span className={cn(Math.abs(row.checksum) > CHECKSUM_LIMIT && row.status !== 'handled' ? "text-red-600" : "")}>
                              {row.checksum.toFixed(2)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-2">
                          {row.status === 'warning' ? (
                            <span className="text-red-600 flex items-center font-bold animate-pulse">
                              <AlertTriangle size={10} className="mr-1" /> 异常
                            </span>
                          ) : row.status === 'handled' ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle2 size={10} className="mr-1" /> 已处理
                            </span>
                          ) : (
                            <span className="opacity-40">正常</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {data.length > 0 && !checksumCalculated && (
              <div className="mt-4 flex justify-center">
                <Button onClick={calculateChecksum} className="px-8">计算校验和 / CALCULATE CHECKSUM</Button>
              </div>
            )}
          </TechnicalCard>
        </div>
      </div>

      <div className="flex justify-end">
        <Button disabled={!allHandled} onClick={handleNext}>
          下一步：编写监测日报表 <ChevronRight size={14} className="ml-2" />
        </Button>
      </div>

      {/* Anomaly Handling Modal */}
      <AnimatePresence>
        {showAnomalyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-2 border-industrial-fg w-full max-w-md overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
            >
              <div className="bg-industrial-fg text-industrial-bg p-3 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center">
                  <AlertCircle size={14} className="mr-2 text-red-500" />
                  异常数据处理 / ANOMALY HANDLING
                </h3>
                <button onClick={() => setShowAnomalyModal(false)} className="hover:bg-white/20 p-1"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 text-[11px] font-mono">
                  <div className="flex justify-between mb-1">
                    <span className="opacity-60">深度:</span>
                    <span className="font-bold">{selectedAnomalyIndex !== null && data[selectedAnomalyIndex].depth}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">校验和:</span>
                    <span className="font-bold text-red-600">{selectedAnomalyIndex !== null && data[selectedAnomalyIndex].checksum}</span>
                  </div>
                </div>
                <div>
                  <label className="technical-label">异常原因分析 / REASON</label>
                  <select 
                    className="w-full border border-industrial-fg p-2 text-xs bg-white"
                    value={anomalyForm.reason}
                    onChange={e => setAnomalyForm({...anomalyForm, reason: e.target.value})}
                  >
                    <option value="">请选择原因...</option>
                    <option value="probe_unstable">探头读数未稳定即记录</option>
                    <option value="debris">导槽内有异物或积水</option>
                    <option value="operator_error">操作员拉线速度不均</option>
                    <option value="equipment_fault">传感器零漂或故障</option>
                  </select>
                </div>
                <div>
                  <label className="technical-label">处理方式 / SOLUTION</label>
                  <select 
                    className="w-full border border-industrial-fg p-2 text-xs bg-white"
                    value={anomalyForm.solution}
                    onChange={e => setAnomalyForm({...anomalyForm, solution: e.target.value})}
                  >
                    <option value="">请选择处理方式...</option>
                    <option value="remeasure">立即在该深度补测</option>
                    <option value="average">取前后点均值插值</option>
                    <option value="mark_invalid">标记为无效数据</option>
                    <option value="ignore">经核实后保留(特殊地层)</option>
                  </select>
                </div>
                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    disabled={!anomalyForm.reason || !anomalyForm.solution}
                    onClick={submitAnomaly}
                  >
                    确认处理 / CONFIRM
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Phase 2: Monitoring Daily Report ---

export const ReportCompilation: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [form, setForm] = useState({
    holeNo: 'CX1',
    period: '12',
    reportNo: 'REP-20260403-01',
    weather: '晴',
    observer: '张三',
    calculator: '李四',
    checker: '王五',
    model: 'GK-604D',
    serialNo: 'SN-9928',
    validDate: '2026-12-31',
    thisTime: '2026-04-03',
    lastTime: '2026-03-27',
    condition: '第二层土方开挖至-12m，第二道支撑已施加',
    conclusion: '',
    level: '',
    rates: { r1: '', r2: '', r3: '' }
  });
  const [showPrev, setShowPrev] = useState(false);

  const keyPoints = [
    { depth: 0.5, currentCum: 1.25, lastCum: 0.85, change: 0.40, id: 'r1' },
    { depth: 10.0, currentCum: 18.20, lastCum: 14.50, change: 3.70, id: 'r2' },
    { depth: 20.0, currentCum: 0.15, lastCum: 0.10, change: 0.05, id: 'r3' },
  ];

  const handleRateChange = (id: string, val: string) => setForm({ ...form, rates: { ...form.rates, [id]: val } });

  const isRatesCorrect = useMemo(() => {
    const check = (val: string, expected: number) => {
      const num = parseFloat(val);
      return !isNaN(num) && Math.abs(num - expected) < 0.01;
    };
    // Rate = Change / Days (7 days between 03-27 and 04-03)
    return check(form.rates.r1, 0.40 / 7) && check(form.rates.r2, 3.70 / 7) && check(form.rates.r3, 0.05 / 7);
  }, [form.rates]);

  const handleNext = () => {
    const rateScore = isRatesCorrect ? 9 : 0;
    const conclusionScore = form.conclusion === 'increasing' ? 3 : 0;
    const levelScore = form.level === '黄色预警 (YELLOW)' ? 3 : 0;
    const totalScore = rateScore + conclusionScore + levelScore;

    onNext({
      stepId: '4.2.3-2',
      stepName: '监测日报表填写',
      submittedAt: new Date().toISOString(),
      totalScore,
      maxScore: 15,
      answers: [
        { id: '3-2-1', label: '位移速率计算', type: 'input', score: rateScore, maxScore: 9, correct: isRatesCorrect, userAnswer: `${form.rates.r1}, ${form.rates.r2}, ${form.rates.r3}`, correctAnswer: '0.057, 0.529, 0.007' },
        { id: '3-2-2', label: '综合分析结论', type: 'choice', score: conclusionScore, maxScore: 3, correct: conclusionScore === 3, userAnswer: form.conclusion, correctAnswer: 'increasing' },
        { id: '3-2-3', label: '预警等级判定', type: 'choice', score: levelScore, maxScore: 3, correct: levelScore === 3, userAnswer: form.level, correctAnswer: '黄色预警 (YELLOW)' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-industrial-fg bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <button 
          onClick={() => setShowPrev(!showPrev)} 
          className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase hover:bg-industrial-bg transition-colors"
        >
          <div className="flex items-center space-x-2">
            <ClipboardCheck size={14} className="text-industrial-info" />
            <span>查看上期日报表 (第11期) / PREVIOUS REPORT</span>
          </div>
          {showPrev ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <AnimatePresence>
          {showPrev && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden border-t border-industrial-fg p-4 bg-industrial-bg/5 text-[9px] font-mono space-y-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div><span className="opacity-50">监测日期:</span> 2026-03-27</div>
                <div><span className="opacity-50">报表编号:</span> REP-20260327-01</div>
              </div>
              <div className="border-t border-industrial-fg/10 pt-2">
                <p className="font-bold mb-1">关键深度累计位移:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-1 border border-industrial-fg/10">0.5m: 0.85mm</div>
                  <div className="bg-white p-1 border border-industrial-fg/10">10.0m: 14.50mm</div>
                  <div className="bg-white p-1 border border-industrial-fg/10">20.0m: 0.10mm</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TechnicalCard title="本期监测日报表编制 / REPORT COMPILATION">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TechnicalInput label="孔号" value={form.holeNo} onChange={v => setForm({...form, holeNo: v})} />
            <TechnicalInput label="监测期数" value={form.period} onChange={v => setForm({...form, period: v})} />
            <TechnicalInput label="报表编号" value={form.reportNo} onChange={v => setForm({...form, reportNo: v})} />
            <TechnicalInput label="天气" value={form.weather} onChange={v => setForm({...form, weather: v})} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border-2 border-industrial-fg overflow-x-auto">
              <table className="w-full text-[10px] font-mono">
                <thead className="bg-industrial-bg/50 border-b-2 border-industrial-fg">
                  <tr>
                    <th className="p-2 border-r border-industrial-fg">深度(m)</th>
                    <th className="p-2 border-r border-industrial-fg">本期累计(mm)</th>
                    <th className="p-2 border-r border-industrial-fg">本次变化(mm)</th>
                    <th className="p-2">位移速率(mm/d)</th>
                  </tr>
                </thead>
                <tbody>
                  {keyPoints.map(p => (
                    <tr key={p.depth} className="border-b border-industrial-fg/10">
                      <td className="p-2 border-r border-industrial-fg/10 text-center font-bold">{p.depth.toFixed(1)}</td>
                      <td className="p-2 border-r border-industrial-fg/10 text-center">{p.currentCum.toFixed(2)}</td>
                      <td className="p-2 border-r border-industrial-fg/10 text-center text-industrial-info">{p.change.toFixed(2)}</td>
                      <td className="p-2">
                        <input 
                          className="w-full bg-yellow-50 text-center outline-none p-1 border border-dashed border-industrial-fg/20 focus:border-industrial-fg" 
                          placeholder="计算并填写..." 
                          value={form.rates[p.id as keyof typeof form.rates]} 
                          onChange={e => handleRateChange(p.id, e.target.value)} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 bg-industrial-bg/10 text-[8px] opacity-60 text-center">
                * 速率计算公式: (本期累计 - 上期累计) / 间隔天数 (7天)
              </div>
            </div>
            <div className="border-2 border-industrial-fg p-4 bg-white flex flex-col items-center justify-center relative">
              <div className="absolute top-2 left-2 flex items-center space-x-1">
                <LineChart size={12} className="opacity-40" />
                <span className="text-[9px] font-bold opacity-40 uppercase">Curve Preview</span>
              </div>
              <svg viewBox="0 0 100 100" className="w-full h-32">
                <path d="M 50,0 Q 85,50 50,100" fill="none" stroke="#141414" strokeWidth="2" strokeDasharray="4 2" className="opacity-20" />
                <path d="M 50,0 Q 95,50 50,100" fill="none" stroke="#141414" strokeWidth="3" />
                <circle cx="50" cy="0" r="2" fill="#141414" />
                <circle cx="95" cy="50" r="2" fill="#141414" />
                <circle cx="50" cy="100" r="2" fill="#141414" />
              </svg>
              <div className="mt-2 text-[8px] font-mono opacity-40">CX1 深度-位移曲线 (本期)</div>
            </div>
          </div>

          <div className="space-y-4 border-t-2 border-industrial-fg pt-4">
            <TechnicalInput label="现场工况描述 / SITE CONDITION" value={form.condition} onChange={v => setForm({...form, condition: v})} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="technical-label">综合分析结论 / CONCLUSION</label>
                <select 
                  className="w-full border border-industrial-fg p-2 text-xs bg-white" 
                  value={form.conclusion} 
                  onChange={e => setForm({...form, conclusion: e.target.value})}
                >
                  <option value="">请选择结论...</option>
                  <option value="stable">位移已收敛，结构处于安全状态</option>
                  <option value="increasing">位移持续增大，需加强巡视与监测</option>
                  <option value="warning">位移速率超限，建议启动应急预案</option>
                </select>
              </div>
              <div>
                <label className="technical-label">预警等级判定 / WARNING LEVEL</label>
                <div className="grid grid-cols-2 gap-2">
                  {['安全 (GREEN)', '黄色预警 (YELLOW)', '橙色预警 (ORANGE)', '红色预警 (RED)'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => setForm({...form, level: l})} 
                      className={cn(
                        "p-2 border-2 text-[9px] font-bold transition-all", 
                        form.level === l ? "bg-industrial-fg text-industrial-bg scale-[1.02]" : "bg-white hover:bg-industrial-bg/10"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleNext} 
              disabled={!form.level || !isRatesCorrect || !form.conclusion}
              className="px-10"
            >
              提交并存档 / SUBMIT & ARCHIVE
            </Button>
          </div>
        </div>
      </TechnicalCard>
    </div>
  );
};

// --- Phase 3: Multi-period Data Analysis ---

export const MultiPeriodAnalysis: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('本期 (2026-04-03)');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', level: '', measures: [] as string[] });
  const [markedRows, setMarkedRows] = useState<number[]>([]);

  const handleNext = () => {
    const markScore = markedRows.includes(1) && markedRows.length === 1 ? 5 : 0;
    const q1Score = answers.q1 === '10.0' ? 5 : 0;
    const q2Score = answers.q2 === 'belly' ? 5 : 0;
    const levelScore = answers.level === '黄色预警' ? 5 : 0;
    const totalScore = markScore + q1Score + q2Score + levelScore;

    onNext({
      stepId: '4.2.3-3',
      stepName: '多期数据分析',
      submittedAt: new Date().toISOString(),
      totalScore,
      maxScore: 20,
      answers: [
        { id: '3-3-1', label: '异常点位识别', type: 'hotspot', score: markScore, maxScore: 5, correct: markScore === 5, userAnswer: markedRows.join(','), correctAnswer: '1 (10.0m)' },
        { id: '3-3-2', label: '最大位移深度', type: 'choice', score: q1Score, maxScore: 5, correct: q1Score === 5, userAnswer: answers.q1, correctAnswer: '10.0' },
        { id: '3-3-3', label: '曲线形态识别', type: 'choice', score: q2Score, maxScore: 5, correct: q2Score === 5, userAnswer: answers.q2, correctAnswer: 'belly' },
        { id: '3-3-4', label: '预警等级判定', type: 'choice', score: levelScore, maxScore: 5, correct: levelScore === 5, userAnswer: answers.level, correctAnswer: '黄色预警' }
      ]
    });
  };

  const periods = [
    { name: '本期 (2026-04-03)', color: '#141414', opacity: 1, width: 3 },
    { name: '第11期 (2026-03-27)', color: '#141414', opacity: 0.7, width: 1.5 },
    { name: '第10期 (2026-03-20)', color: '#141414', opacity: 0.5, width: 1.2 },
    { name: '第09期 (2026-03-13)', color: '#141414', opacity: 0.3, width: 1 },
    { name: '第08期 (2026-03-06)', color: '#141414', opacity: 0.2, width: 1 },
  ];

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(20, 20, 20, 0.9)',
      borderColor: '#141414',
      textStyle: { color: '#FFFFFF', fontSize: 10, fontFamily: 'monospace' }
    },
    legend: { 
      bottom: 0, 
      data: periods.map(p => p.name),
      textStyle: { fontSize: 9, fontFamily: 'monospace' },
      itemWidth: 20,
      itemHeight: 10
    },
    grid: { top: 40, bottom: 60, left: 50, right: 30 },
    xAxis: { 
      type: 'value', 
      name: '位移(mm)', 
      nameLocation: 'middle', 
      nameGap: 25,
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.1 } }
    },
    yAxis: { 
      type: 'value', 
      name: '深度(m)', 
      inverse: true,
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.1 } }
    },
    series: periods.map(p => ({
      name: p.name, 
      type: 'line', 
      smooth: true, 
      symbol: 'none',
      lineStyle: { color: p.color, width: p.width, opacity: p.opacity },
      data: p.name.includes('本期') 
        ? [[0, 0], [5, 2], [18.2, 10], [12, 15], [2, 20]] 
        : p.name.includes('11')
        ? [[0, 0], [4, 2], [14.5, 10], [10, 15], [1.5, 20]]
        : [[0, 0], [Math.random()*3, 2], [Math.random()*12, 10], [Math.random()*2, 20]]
    }))
  };

  const tableData = [
    { depth: 0.5, cum: 1.25, change: 0.40, rate: 0.06, isWarning: false },
    { depth: 10.0, cum: 18.20, change: 3.70, rate: 0.53, isWarning: true },
    { depth: 20.0, cum: 0.15, change: 0.05, rate: 0.01, isWarning: false },
  ];

  const toggleMark = (index: number) => {
    if (markedRows.includes(index)) {
      setMarkedRows(markedRows.filter(i => i !== index));
    } else {
      setMarkedRows([...markedRows, index]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TechnicalCard title="多期深度-累积位移曲线 / MULTI-PERIOD CURVES">
          <div className="bg-white p-2">
            <ReactECharts option={chartOption} style={{ height: '450px' }} />
          </div>
        </TechnicalCard>
        
        <div className="space-y-6">
          <TechnicalCard title={`数据分析面板 / ANALYSIS PANEL - ${selectedPeriod}`}>
            <div className="space-y-4">
              <p className="text-[10px] opacity-60">请核对本期关键深度数据，并点击<span className="text-red-600 font-bold">异常行</span>进行标记：</p>
              <div className="border-2 border-industrial-fg overflow-hidden">
                <table className="w-full text-[10px] font-mono">
                  <thead className="bg-industrial-bg/50 border-b-2 border-industrial-fg">
                    <tr>
                      <th className="p-2 border-r border-industrial-fg">深度(m)</th>
                      <th className="p-2 border-r border-industrial-fg">累计(mm)</th>
                      <th className="p-2 border-r border-industrial-fg">速率(mm/d)</th>
                      <th className="p-2">异常标记</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i} className={cn("border-b border-industrial-fg/10 transition-colors", markedRows.includes(i) ? "bg-red-50" : "")}>
                        <td className="p-2 border-r border-industrial-fg/10 text-center font-bold">{row.depth.toFixed(1)}</td>
                        <td className="p-2 border-r border-industrial-fg/10 text-center">{row.cum.toFixed(2)}</td>
                        <td className="p-2 border-r border-industrial-fg/10 text-center">{row.rate.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <button 
                            onClick={() => toggleMark(i)} 
                            className={cn(
                              "p-1 border-2 transition-all", 
                              markedRows.includes(i) ? "bg-red-600 border-red-600 text-white" : "bg-white border-industrial-fg/20 hover:border-industrial-fg"
                            )}
                          >
                            <AlertTriangle size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TechnicalCard>

          <TechnicalCard title="趋势识别与预警决策 / DECISION MAKING">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="technical-label">1. 最大位移发生深度</label>
                  <select 
                    className="w-full border border-industrial-fg p-2 text-xs bg-white" 
                    value={answers.q1}
                    onChange={e => setAnswers({...answers, q1: e.target.value})}
                  >
                    <option value="">请选择...</option>
                    <option value="0.5">0.5m (孔口附近)</option>
                    <option value="10.0">10.0m (基坑中部)</option>
                    <option value="20.0">20.0m (孔底附近)</option>
                  </select>
                </div>
                <div>
                  <label className="technical-label">2. 变形曲线形态识别</label>
                  <select 
                    className="w-full border border-industrial-fg p-2 text-xs bg-white" 
                    value={answers.q2}
                    onChange={e => setAnswers({...answers, q2: e.target.value})}
                  >
                    <option value="">请选择...</option>
                    <option value="belly">内凸鼓肚型 (Belly Shape)</option>
                    <option value="cantilever">悬臂型 (Cantilever)</option>
                    <option value="kick">踢脚型 (Kick-out)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="technical-label">3. 综合预警等级判定</label>
                <div className="grid grid-cols-2 gap-2">
                  {['安全', '黄色预警', '橙色预警', '红色预警'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => setAnswers({...answers, level: l})} 
                      className={cn(
                        "p-2 border-2 text-[10px] font-bold transition-all", 
                        answers.level === l ? "bg-industrial-fg text-industrial-bg scale-[1.02]" : "bg-white hover:bg-industrial-bg/10"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <Button 
                  className="w-full py-4" 
                  disabled={!answers.level || !answers.q1 || !answers.q2 || markedRows.length === 0}
                  onClick={handleNext}
                >
                  完成所有实操并生成报告 / FINISH & GENERATE REPORT
                </Button>
              </div>
            </div>
          </TechnicalCard>
        </div>
      </div>
    </div>
  );
};
