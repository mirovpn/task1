import { useState } from 'react';
import { StepId } from './types';
import { TechnicalPreparation, MaterialPickup, TubeAssembly, CageInstallation, Inspection, ConnectivityTest, InitialMeasurement } from './components/Step421';
import { PrepAndSafety, InstrumentSetting } from './components/Step422';
import { DataProcessing, ReportCompilation, MultiPeriodAnalysis } from './components/Step423';
import { ReportPage, generateMockReport } from './components/ReportPage';
import { Modal, Button } from './components/Common';
import { Layout, ShieldCheck, Activity, FileText, Settings, ChevronRight, Menu, Award, FolderOpen, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>('4.2.1-1');
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [currentStepReadyData, setCurrentStepReadyData] = useState<any>(null);

  const handleFinish = () => {
    setReportData(generateMockReport("张三", stepData));
    setShowReport(true);
  };

  const steps: { id: StepId; label: string; section: string; description: string }[] = [
    { id: '4.2.1-1', label: '前期技术准备', section: '4.2.1 监测与准备', description: '任务说明：请在平面布置图中选择测斜管的布设位置，并填写测点间距。' },
    { id: '4.2.1-2-1', label: '取料区域', section: '4.2.1 监测与准备', description: '任务说明：请在施工现场选择正确的监测管及配件存放区域。' },
    { id: '4.2.1-2-2', label: '管材拼装', section: '4.2.1 监测与准备', description: '任务说明：请选择正确的监测管、连接头及拼装工艺参数。' },
    { id: '4.2.1-2-3', label: '导管安装到钢筋笼', section: '4.2.1 监测与准备', description: '任务说明：请在钢筋笼截面图中选择安装位置，并设置绑扎参数。' },
    { id: '4.2.1-3-1', label: '管口验收', section: '4.2.1 监测与准备', description: '任务说明：请对安装完成的监测管进行管口标高、坐标及导槽方向验收。' },
    { id: '4.2.1-3-2', label: '通畅性测试', section: '4.2.1 监测与准备', description: '任务说明：请使用标准测头对监测管进行全深度通畅性测试。' },
    { id: '4.2.1-4', label: '初测(基准测量)', section: '4.2.1 监测与准备', description: '任务说明：请对监测管进行初始基准测量，并确认测量数据。' },
    { id: '4.2.2-1', label: '测斜数据采集流程', section: '4.2.2 数据采集', description: '任务说明：请按照规范流程进行深层水平位移数据采集。' },
    { id: '4.2.2-2', label: '读数分析', section: '4.2.2 数据采集', description: '任务说明：请对采集到的原始读数进行初步分析与校验。' },
    { id: '4.2.3-1', label: '数据导入与预处理', section: '4.2.3 数据处理', description: '任务说明：将采集数据导入系统并进行偏差修正与预处理。' },
    { id: '4.2.3-2', label: '监测日报表填写', section: '4.2.3 数据处理', description: '任务说明：根据处理后的数据填写监测日报表并提交。' },
    { id: '4.2.3-3', label: '多期数据分析', section: '4.2.3 数据处理', description: '任务说明：对多期监测数据进行趋势分析与预警判定。' },
  ];

  const handleStepComplete = (data: any) => {
    setCurrentStepReadyData(data);
    setCanGoNext(true);
  };

  const handleNext = () => {
    if (currentStep === '4.2.1-4' && !showFinalConfirm && !showTransition) {
      setShowFinalConfirm(true);
      return;
    }
    
    if (currentStepReadyData) {
      setStepData(prev => ({ ...prev, [currentStep]: currentStepReadyData }));
    }

    if (currentStep === '4.2.1-4' && showFinalConfirm) {
      setShowFinalConfirm(false);
      setShowTransition(true);
      return;
    }

    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      setCanGoNext(false);
      setCurrentStepReadyData(null);
      setShowFinalConfirm(false);
      setShowTransition(false);
    } else {
      handleFinish();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case '4.2.1-1': return <TechnicalPreparation onNext={handleStepComplete} />;
      case '4.2.1-2-1': return <MaterialPickup onNext={handleStepComplete} />;
      case '4.2.1-2-2': return <TubeAssembly onNext={handleStepComplete} />;
      case '4.2.1-2-3': return <CageInstallation onNext={handleStepComplete} />;
      case '4.2.1-3-1': return <Inspection onNext={handleStepComplete} />;
      case '4.2.1-3-2': return <ConnectivityTest onNext={handleStepComplete} />;
      case '4.2.1-4': return <InitialMeasurement onNext={handleStepComplete} />;
      case '4.2.2-1': return <PrepAndSafety onNext={handleStepComplete} />;
      case '4.2.2-2': return <InstrumentSetting onNext={handleStepComplete} />;
      case '4.2.3-1': return <DataProcessing onNext={handleStepComplete} />;
      case '4.2.3-2': return <ReportCompilation onNext={handleStepComplete} />;
      case '4.2.3-3': return <MultiPeriodAnalysis onNext={handleStepComplete} />;
      default: return <div>Step not implemented</div>;
    }
  };

  const currentStepInfo = steps.find(s => s.id === currentStep);

  if (showReport && reportData) {
    return <ReportPage data={reportData} onBack={() => { setShowReport(false); setCurrentStep('4.2.1-1'); setCanGoNext(false); }} />;
  }

  if (showTransition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-bg p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border-2 border-industrial-fg p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] text-center space-y-6"
        >
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-widest">实操一已完成！</h2>
          <p className="text-sm opacity-70 leading-relaxed">
            即将进入专项实操二：测斜数据采集与处理
          </p>
          <Button 
            className="w-full py-4 text-sm font-bold uppercase tracking-widest"
            onClick={handleNext}
          >
            进入实操二 →
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-industrial-bg text-industrial-fg selection:bg-industrial-fg selection:text-industrial-bg">
      {/* Header */}
      <header className="h-14 border-b border-industrial-fg bg-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-industrial-bg transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-widest">{currentStepInfo?.label}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="secondary" 
            className="flex items-center space-x-2 text-[10px] h-8"
            onClick={() => setShowMaterials(true)}
          >
            <FolderOpen size={14} />
            <span>项目资料</span>
          </Button>
          <Button 
            disabled={!canGoNext}
            className="flex items-center space-x-2 text-[10px] h-8"
            onClick={handleNext}
          >
            <span>{currentStep === '4.2.1-4' ? '提交并完成实操一' : '下一步'}</span>
            <ChevronRight size={14} />
          </Button>
        </div>
      </header>

      <div className="h-10 border-b border-industrial-fg bg-industrial-bg/10 flex items-center px-6 text-[11px] font-medium">
        <div className="flex items-center space-x-2">
          <FileText size={14} className="text-industrial-fg/60" />
          <span className="opacity-80">{currentStepInfo?.description}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-industrial-fg bg-white overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-industrial-fg bg-industrial-bg/20">
                <span className="technical-label">实训进度 / PROGRESS</span>
                <div className="mt-2 h-1 bg-industrial-fg/10 relative">
                  <div 
                    className="absolute inset-y-0 left-0 bg-industrial-fg transition-all duration-500" 
                    style={{ width: `${(steps.findIndex(s => s.id === currentStep) + 1) / steps.length * 100}%` }}
                  ></div>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {Array.from(new Set(steps.map(s => s.section))).map(section => (
                  <div key={section} className="mb-4">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest opacity-40">{section}</div>
                    {steps.filter(s => s.section === section).map(step => (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[11px] uppercase tracking-wider transition-all flex items-center justify-between group",
                          currentStep === step.id 
                            ? "bg-industrial-fg text-industrial-bg font-bold" 
                            : "hover:bg-industrial-bg opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{step.label}</span>
                          {steps.indexOf(step) < steps.findIndex(s => s.id === currentStep) && (
                            <CheckCircle2 size={12} className="text-green-600" />
                          )}
                        </div>
                        {currentStep === step.id && <ChevronRight size={12} />}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Background Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Modal 
        isOpen={showMaterials} 
        onClose={() => setShowMaterials(false)} 
        title="📁 项目资料"
      >
        <div className="space-y-6 text-xs leading-relaxed">
          <div>
            <h4 className="font-bold border-b border-industrial-fg/20 pb-1 mb-2">▼ 工程背景</h4>
            <p className="opacity-80">
              某工程深基坑监测项目，开挖深度20m。根据设计要求，需在围护结构内布设监测管，监测基坑开挖过程中围护结构的水平位移变化。
            </p>
          </div>
          <div>
            <h4 className="font-bold border-b border-industrial-fg/20 pb-1 mb-2">▼ 设计图纸</h4>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>基坑支护平面布置图.pdf</li>
              <li>监测管埋设设计图.pdf</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold border-b border-industrial-fg/20 pb-1 mb-2">▼ 规范参考</h4>
            <ul className="list-disc list-inside opacity-80 space-y-1">
              <li>GB 50497-2019 基坑工程监测技术规范</li>
              <li>JGJ 120-2012 建筑基坑支护技术规程</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFinalConfirm}
        onClose={() => setShowFinalConfirm(false)}
        title="确认提交"
      >
        <div className="space-y-4">
          <p className="text-xs leading-relaxed">
            确认提交实操一全部答案？提交后不可修改。
          </p>
          <div className="flex space-x-3 pt-2">
            <Button className="flex-1" onClick={handleNext}>确认提交</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowFinalConfirm(false)}>取消</Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="h-8 border-t border-industrial-fg bg-industrial-bg px-6 flex items-center justify-end text-[10px] font-mono z-50">
        <button 
          onClick={handleFinish}
          className="px-2 py-0.5 bg-industrial-fg text-industrial-bg hover:opacity-80 transition-all font-bold text-[9px] uppercase tracking-tighter"
        >
          查看评估报告
        </button>
      </footer>
    </div>
  );
}
