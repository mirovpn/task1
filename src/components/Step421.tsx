import React, { useState, useEffect } from 'react';
import { TechnicalCard, Button, TechnicalInput, Modal } from './Common';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { MapPin, Info, CheckCircle2, ChevronRight } from 'lucide-react';

export const TechnicalPreparation: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [confirmedHotspot, setConfirmedHotspot] = useState<string | null>(null);
  const [spacing, setSpacing] = useState('');
  const [showSpacingInput, setShowSpacingInput] = useState(false);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [hotspotViewed, setHotspotViewed] = useState<string[]>([]);
  const [modifyCount, setModifyCount] = useState(0);

  const hotspots = [
    { 
      id: 'CX1', 
      name: '冠梁', 
      x: '20%', 
      y: '35%', 
      desc: '冠梁是连接各围护桩/墙顶部的钢筋混凝土梁，位于基坑围护结构的顶部，沿基坑周圈设置。',
      isCorrect: true
    },
    { 
      id: 'CX2', 
      name: '周边道路', 
      x: '45%', 
      y: '85%', 
      desc: '基坑外侧的市政道路区域，地下分布有污水干管DN300等市政管线，地面有施工车辆通行。',
      isCorrect: false
    },
    { 
      id: 'CX3', 
      name: '基坑开挖区', 
      x: '40%', 
      y: '55%', 
      desc: '基坑开挖区域内部，当前开挖深度12m，底部为基坑作业面。',
      isCorrect: false
    },
    { 
      id: 'CX4', 
      name: '周边建筑', 
      x: '85%', 
      y: '60%', 
      desc: '基坑东侧邻近商业楼，距基坑边缘约12m，为既有多层建筑。',
      isCorrect: false
    },
  ];

  const handleHotspotClick = (id: string) => {
    if (confirmedHotspot && confirmedHotspot !== id) {
      if (window.confirm('重新选择将清除当前选择，是否继续？')) {
        setConfirmedHotspot(null);
        setSpacing('');
        setShowSpacingInput(false);
      } else {
        return;
      }
    }
    setSelectedHotspot(id);
    setShowHotspotModal(true);
    if (!hotspotViewed.includes(id)) {
      setHotspotViewed([...hotspotViewed, id]);
    }
  };

  useEffect(() => {
    if (confirmedHotspot && spacing) {
      handleSubmit();
    }
  }, [confirmedHotspot, spacing]);

  const handleConfirmHotspot = () => {
    setConfirmedHotspot(selectedHotspot);
    setShowHotspotModal(false);
  };

  const handleConfirmSpacing = () => {
    if (!spacing || isNaN(parseInt(spacing))) return;
    if (spacing.includes('.')) {
      alert('请输入整数');
      return;
    }
    if (parseInt(spacing) <= 0) {
      alert('请输入大于0的数值');
      return;
    }
    
    if (spacing) {
      setModifyCount(prev => prev + 1);
    }
    setShowSpacingInput(false);
  };

  const handleSubmit = () => {
    const spacingNum = parseInt(spacing);
    const score1 = confirmedHotspot === 'CX1' ? 3 : 0;
    const score2 = (spacingNum >= 20 && spacingNum <= 60) ? 2 : 0;
    
    onNext({
      stepId: 'step1',
      stepName: '前期技术准备',
      submittedAt: new Date().toISOString(),
      answers: [
        {
          questionId: '1-1-1',
          type: 'choice',
          label: '平面图选点',
          userAnswer: confirmedHotspot,
          correctAnswer: 'CX1',
          score: score1,
          maxScore: 3
        },
        {
          questionId: '1-1-2',
          type: 'fill',
          label: '测点间距',
          userAnswer: spacing,
          correctRange: [20, 60],
          unit: 'm',
          score: score2,
          maxScore: 2,
          modifyCount: Math.max(0, modifyCount - 1)
        }
      ],
      hotspotViewed,
      totalScore: score1 + score2,
      maxScore: 5
    });
  };

  const currentHotspotData = hotspots.find(h => h.id === selectedHotspot);
  const confirmedHotspotData = hotspots.find(h => h.id === confirmedHotspot);

  return (
    <div className="space-y-6">
      <TechnicalCard title="基坑支护平面布置图 / SITE PLAN">
        <div className="relative aspect-[21/9] bg-[#f0f0f0] border-2 border-industrial-fg overflow-hidden group">
          {/* Drawing Background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#141414 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
          
          {/* Site Elements */}
          <div className="absolute inset-0 p-8 font-mono text-[10px] uppercase tracking-tighter pointer-events-none">
            <div className="absolute top-4 left-10 border-b border-industrial-fg/40 pb-1">旧住宅楼 (距基坑约8m)</div>
            <div className="absolute top-16 left-10 text-industrial-fg/40">── 污水干管 DN300 ──────────────────────────</div>
            <div className="absolute top-10 right-20 text-industrial-fg/40">DN400 给水管</div>
            <div className="absolute bottom-10 right-10 border border-industrial-fg/40 p-2 bg-white/50">施工出入口</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-industrial-fg/40">周边道路</div>
          </div>

          {/* Excavation Area */}
          <div className="absolute inset-x-[15%] inset-y-[25%] border-2 border-industrial-fg border-dashed bg-industrial-fg/5 flex items-center justify-center">
            <div className="text-center">
              <div className="font-bold text-xs opacity-40 uppercase tracking-widest">基坑开挖区</div>
              <div className="text-[9px] opacity-30 mt-1">(开挖深度 12m)</div>
            </div>
          </div>

          {/* Hotspots */}
          {hotspots.map((hp) => (
            <button
              key={hp.id}
              onClick={() => handleHotspotClick(hp.id)}
              onMouseEnter={() => !confirmedHotspot && setHoveredHotspot(hp.id)}
              onMouseLeave={() => setHoveredHotspot(null)}
              className={cn(
                "absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center transition-all duration-300 z-20",
                confirmedHotspot === hp.id ? "scale-110" : "hover:scale-125",
                confirmedHotspot && confirmedHotspot !== hp.id && "opacity-30 grayscale pointer-events-none"
              )}
              style={{ left: hp.x, top: hp.y }}
            >
              <div className={cn(
                "absolute inset-0 rounded-full border-2 border-industrial-fg animate-ping opacity-20",
                confirmedHotspot === hp.id && "hidden"
              )} />
              <div className={cn(
                "w-full h-full rounded-full border-2 border-industrial-fg flex items-center justify-center font-bold text-[10px] transition-colors shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]",
                confirmedHotspot === hp.id ? "bg-green-500 text-white" : 
                selectedHotspot === hp.id ? "bg-industrial-fg text-white" : "bg-white"
              )}>
                {hp.id}
              </div>
              
              {/* [?]/[v] Marker */}
              {confirmedHotspot === hp.id && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center space-x-2 whitespace-nowrap z-30">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpacingInput(true);
                    }}
                    className={cn(
                      "flex items-center space-x-1 px-2 py-1 rounded-full border border-industrial-fg text-[10px] font-bold transition-all",
                      spacing ? "bg-green-100 text-green-700" : "bg-white text-industrial-fg animate-breathing"
                    )}
                  >
                    {spacing ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>监测间距已配置 ({spacing}m)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 rounded-full bg-industrial-fg text-white flex items-center justify-center text-[8px]">?</span>
                        <span>请布置监测间距</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tooltip on hover */}
              {hoveredHotspot === hp.id && !confirmedHotspot && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-industrial-fg text-white px-2 py-1 text-[9px] whitespace-nowrap rounded shadow-lg z-30">
                  {hp.name}
                </div>
              )}
            </button>
          ))}
        </div>
      </TechnicalCard>

      {/* Spacing Input Modal */}
      <Modal
        isOpen={showSpacingInput}
        onClose={() => setShowSpacingInput(false)}
        title="布置监测间距 / SET SPACING"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <TechnicalInput 
              label="测点间距 / SPACING" 
              value={spacing} 
              onChange={(val) => setSpacing(val.replace(/[^\d]/g, ''))} 
              unit="M"
              placeholder="请输入整数"
            />
            <p className="text-xs opacity-50">提示：请根据设计图纸要求，填写合理的监测点布设间距。</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleConfirmSpacing} className="w-full">确认配置</Button>
            <Button variant="secondary" onClick={() => setShowSpacingInput(false)} className="w-full">取消</Button>
          </div>
        </div>
      </Modal>

      {/* Hotspot Detail Modal */}
      <Modal 
        isOpen={showHotspotModal} 
        onClose={() => setShowHotspotModal(false)} 
        title={`${currentHotspotData?.id} — ${currentHotspotData?.name}`}
      >
        <div className="space-y-6">
          <div className="border-b border-industrial-fg pb-4">
            <p className="text-xs leading-relaxed opacity-80">
              {currentHotspotData?.desc}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleConfirmHotspot} className="w-full">选择此点位</Button>
            <Button variant="secondary" onClick={() => setShowHotspotModal(false)} className="w-full">取消</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const MaterialPickup: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [confirmedArea, setConfirmedArea] = useState<string | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionAnswer, setInspectionAnswer] = useState<string | null>(null);

  const areas = [
    { 
      id: 'A', 
      name: '基坑坡顶平台', 
      x: '20%', 
      y: '30%', 
      desc: '基坑开挖边线外侧的硬化平台，紧邻基坑边缘，设有安全围挡和警示标识，地面可见测量控制桩和施工放线标记。' 
    },
    { 
      id: 'B', 
      name: '现场材料库房内', 
      x: '60%', 
      y: '25%', 
      desc: '施工现场的封闭式临时库房，室内配有通风窗和温湿度计，各类材料分架存放，设有材料台账和领料登记簿。' 
    },
    { 
      id: 'C', 
      name: '钢筋笼绑扎区', 
      x: '25%', 
      y: '75%', 
      desc: '施工现场的钢筋笼预制加工区域，地面摆放有已成型和待绑扎的钢筋笼，旁边有绑扎工具和铁丝等辅材。' 
    },
    { 
      id: 'D', 
      name: '材料暂存区顶棚下方', 
      x: '75%', 
      y: '65%', 
      desc: '施工现场的露天材料暂存区域，上方有简易顶棚遮蔽，地面铺设枕木隔潮，各类建材按品种分区码放，设有材料标识牌。' 
    },
  ];

  const inspectionOptions = [
    { id: 'A', text: '核对产品合格证与装箱清单' },
    { id: 'B', text: '检查管体有无扭曲变形' },
    { id: 'C', text: '测量管体实际长度' },
    { id: 'D', text: '清洗管体内外表面' },
  ];

  useEffect(() => {
    if (confirmedArea && inspectionAnswer) {
      handleSubmit();
    }
  }, [confirmedArea, inspectionAnswer]);

  const handleAreaClick = (id: string) => {
    if (confirmedArea && confirmedArea !== id) {
      if (window.confirm('重新选择将清除当前选择，是否继续？')) {
        setConfirmedArea(null);
        setInspectionAnswer(null);
      } else {
        return;
      }
    }
    setSelectedArea(id);
    setShowAreaModal(true);
  };

  const handleConfirmArea = () => {
    setConfirmedArea(selectedArea);
    setShowAreaModal(false);
  };

  const handleSubmit = () => {
    const score1 = confirmedArea === 'B' ? 1 : 0;
    const score2 = inspectionAnswer === 'B' ? 1 : 0;
    
    onNext({
      stepId: 'step2a',
      stepName: '取料区域',
      answers: [
        {
          questionId: '1-2-1',
          type: 'choice',
          label: '取料区域热点选取',
          userAnswer: confirmedArea,
          correctAnswer: 'B',
          score: score1,
          maxScore: 1
        },
        {
          questionId: '1-2-1b',
          type: 'choice',
          label: '领料检查',
          userAnswer: inspectionAnswer,
          correctAnswer: 'B',
          score: score2,
          maxScore: 1
        }
      ]
    });
  };

  const currentAreaData = areas.find(a => a.id === selectedArea);
  const confirmedAreaData = areas.find(a => a.id === confirmedArea);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <TechnicalCard title="施工现场场景图 / SITE SCENE">
            <div className="relative aspect-[21/9] bg-[#f0f0f0] border-2 border-industrial-fg overflow-hidden group">
              {/* Scene Background Mock */}
              <div className="absolute inset-0 bg-neutral-200">
                <div className="absolute inset-x-[20%] inset-y-[40%] border-4 border-industrial-fg/10 flex items-center justify-center">
                  <span className="text-4xl font-black opacity-5 uppercase tracking-[1em]">基坑区域</span>
                </div>
              </div>
              
              {/* Hotspots */}
              {areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleAreaClick(area.id)}
                  className={cn(
                    "absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center transition-all duration-300 z-20",
                    confirmedArea === area.id ? "scale-110" : "hover:scale-125",
                    confirmedArea && confirmedArea !== area.id && "opacity-30 grayscale pointer-events-none"
                  )}
                  style={{ left: area.x, top: area.y }}
                >
                  <div className={cn(
                    "w-full h-full border-2 border-industrial-fg flex items-center justify-center font-bold text-xs transition-colors shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]",
                    confirmedArea === area.id ? "bg-green-500 text-white" : 
                    selectedArea === area.id ? "bg-industrial-fg text-white" : "bg-white"
                  )}>
                    {area.id}
                  </div>

                  {/* [?]/[v] Marker */}
                  {confirmedArea === area.id && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center space-x-2 whitespace-nowrap z-30">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowInspectionModal(true);
                        }}
                        className={cn(
                          "flex items-center space-x-1 px-2 py-1 rounded-full border border-industrial-fg text-[10px] font-bold transition-all",
                          inspectionAnswer ? "bg-green-100 text-green-700" : "bg-white text-industrial-fg animate-breathing"
                        )}
                      >
                        {inspectionAnswer ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>领料检查已完成 ({inspectionAnswer})</span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 h-4 rounded-full bg-industrial-fg text-white flex items-center justify-center text-[8px]">?</span>
                            <span>请完成领料检查</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TechnicalCard>
        </div>

        <div className="space-y-6">
          <TechnicalCard title="已选区域 / SELECTED AREA">
            {confirmedArea ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-bold text-sm text-green-800">{confirmedAreaData?.name}</div>
                  <div className="text-[10px] text-green-600 uppercase font-mono mt-1">Area Confirmed</div>
                  <button 
                    onClick={() => {
                      if (window.confirm('重新选择将清除当前选择，是否继续？')) {
                        setConfirmedArea(null);
                        setInspectionAnswer(null);
                      }
                    }}
                    className="text-[10px] text-industrial-fg underline mt-2 hover:opacity-70"
                  >
                    重新选择
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs opacity-50 italic">请在场景中选择取料区域...</p>
            )}
          </TechnicalCard>
        </div>
      </div>

      {/* Area Detail Modal */}
      <Modal 
        isOpen={showAreaModal} 
        onClose={() => setShowAreaModal(false)} 
        title={`${currentAreaData?.id} — ${currentAreaData?.name}`}
      >
        <div className="space-y-6">
          <div className="border-b border-industrial-fg pb-4">
            <p className="text-xs leading-relaxed opacity-80">
              {currentAreaData?.desc}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleConfirmArea} className="w-full">确认选择</Button>
            <Button variant="secondary" onClick={() => setShowAreaModal(false)} className="w-full">取消</Button>
          </div>
        </div>
      </Modal>

      {/* Inspection Modal */}
      <Modal 
        isOpen={showInspectionModal} 
        onClose={() => setShowInspectionModal(false)} 
        title="领料检查 / MATERIAL INSPECTION"
      >
        <div className="space-y-6">
          <p className="text-xs font-bold">到达存放区域后，领取测斜管前应首先进行什么操作？</p>
          <div className="space-y-2">
            {inspectionOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setInspectionAnswer(opt.id)}
                className={cn(
                  "w-full text-left p-3 text-xs border transition-all",
                  inspectionAnswer === opt.id 
                    ? "border-industrial-fg bg-industrial-fg text-white" 
                    : "border-industrial-fg/20 hover:border-industrial-fg"
                )}
              >
                <span className="font-bold mr-2">{opt.id}.</span>
                {opt.text}
              </button>
            ))}
          </div>
          <Button 
            onClick={() => setShowInspectionModal(false)} 
            className="w-full"
            disabled={!inspectionAnswer}
          >
            确认
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export const TubeAssembly: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [viewed, setViewed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showDescModal, setShowDescModal] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [tempAnswers, setTempAnswers] = useState<any[]>([]);

  const hotspots = [
    { id: 'tube', name: '测斜管管体', title: '测斜管管体', desc: '测斜管的主体管节部分，是测斜探头上下滑行的通道。管节内壁设有导槽结构，用于引导探头定向运动。不同工程对管材材质、口径和壁厚有不同要求。' },
    { id: 'connector', name: '连接头', title: '接头管', desc: '用于连接相邻两节管材的短管件，套在两根管节的对接处。接头管内壁结构须与管节导槽配合，确保探头通过时连续顺畅。' },
    { id: 'bottomCap', name: '底盖连接', title: '底盖与第一管连接处', desc: '底盖封堵管串最下端管口，是混凝土浇筑时承受液压最大的部位。底盖与第一根管节之间的连接需要完成密封、操作和机械固定三项设置。' },
    { id: 'joint', name: '管节连接', title: '管节与接头管连接处', desc: '相邻管节通过接头管对接，是管串中数量最多的连接部位。每个连接处需要完成密封、操作和机械固定三项设置，并保证导槽方向连续。' }
  ];

  const tubeOptions = [
    { id: 'A', text: 'PVC-U测斜管 Φ70mm', sub: '外径70mm，内径58mm，壁厚6mm；内壁设有十字形导槽，管节长度2m/根；材质：硬聚氯乙烯，抗压强度高，耐腐蚀', correct: true },
    { id: 'B', text: 'PVC给水管 Φ75mm', sub: '外径75mm，内径71mm，壁厚2mm；内壁光滑无导槽，管节长度4m/根；材质：普通PVC，用于建筑给水工程，壁薄', correct: false },
    { id: 'C', text: 'PE双壁波纹管 Φ110mm', sub: '外径110mm，内径95mm，波纹结构；内壁光滑无导槽，外壁环形波纹加强，管节长度6m/根；材质：高密度聚乙烯，用于市政排水工程', correct: false },
    { id: 'D', text: 'ABS测斜管 Φ58mm', sub: '外径58mm，内径50mm，壁厚4mm；内壁设有十字形导槽，管节长度1.5m/根；材质：ABS工程塑料，韧性好，耐低温', correct: false }
  ];

  const connectorOptions = [
    { id: 'A', text: 'PVC-U测斜管专用接头 Φ70mm', sub: '内径与Φ70mm管体外径匹配，承插式结构；内壁设有十字形导槽延续段，长度120mm；材质：PVC-U，与管体同材质，胶水粘接使用', correct: true },
    { id: 'B', text: 'PVC给水管直通接头 Φ75mm', sub: '内径匹配Φ75mm给水管，承插式光滑内壁；无导槽结构，长度100mm；材质：普通PVC，用于给水管道对接', correct: false },
    { id: 'C', text: '橡胶软接头 Φ70mm', sub: '内径70mm，柔性橡胶材质，可弯曲；无导槽结构，管箍式卡紧，长度150mm；材质：三元乙丙橡胶，用于管道柔性连接及减震', correct: false },
    { id: 'D', text: 'ABS测斜管专用接头 Φ58mm', sub: '内径与Φ58mm管体外径匹配，承插式结构；内壁设有十字形导槽延续段，长度100mm；材质：ABS工程塑料，与ABS管体配套使用', correct: false }
  ];

  const bottomCapQuestions = [
    {
      q: '底盖与管体的连接方式？',
      options: [
        { id: 'A', text: 'PVC专用胶水粘接', correct: true },
        { id: 'B', text: '螺纹旋接', correct: false },
        { id: 'C', text: '热熔焊接', correct: false },
        { id: 'D', text: '卡扣连接', correct: false }
      ]
    },
    {
      q: '底盖插入管体后应如何操作？',
      options: [
        { id: 'A', text: '旋转15°~30°再旋回（旋转润胶），然后静置初凝', correct: true },
        { id: 'B', text: '旋转至导槽对齐位置后静置', correct: false },
        { id: 'C', text: '插入后直接静置，不做任何旋转', correct: false },
        { id: 'D', text: '反复旋转直至胶水从接口溢出', correct: false }
      ]
    },
    {
      q: '底盖固定件如何安装？',
      options: [
        { id: 'A', text: '圆周均布4颗自攻螺丝（间距约90°）', correct: true },
        { id: 'B', text: '对称安装2颗螺丝即可', correct: false },
        { id: 'C', text: '仅缠防水胶带，不装固定件', correct: false },
        { id: 'D', text: '用铁丝绑扎固定', correct: false }
      ]
    }
  ];

  const jointQuestions = [
    {
      q: '管节间的连接方式？',
      options: [
        { id: 'A', text: 'PVC专用胶水粘接', correct: true },
        { id: 'B', text: '螺纹旋接', correct: false },
        { id: 'C', text: '热熔焊接', correct: false },
        { id: 'D', text: '卡扣连接', correct: false }
      ]
    },
    {
      q: '管节插入接头管后应如何操作？',
      options: [
        { id: 'A', text: '先旋转润胶（旋15°~30°再旋回），再旋转至导槽对齐', correct: true },
        { id: 'B', text: '直接旋转至导槽对齐（跳过旋转润胶）', correct: false },
        { id: 'C', text: '先对齐导槽，再来回旋转润胶', correct: false },
        { id: 'D', text: '插入后直接静置，无需旋转', correct: false }
      ]
    },
    {
      q: '管节固定件如何安装？',
      options: [
        { id: 'A', text: '接头管上下两段各3~4颗，合计6~8颗', correct: true },
        { id: 'B', text: '接头管中部一圈安装4颗即可', correct: false },
        { id: 'C', text: '仅缠防水胶带，不装固定件', correct: false },
        { id: 'D', text: '用铁丝绑扎固定', correct: false }
      ]
    }
  ];

  const isUnlocked = (id: string) => {
    if (id === 'tube') return true;
    if (id === 'connector') return completed['tube'];
    if (id === 'bottomCap' || id === 'joint') return completed['connector'];
    return false;
  };

  const handleHotspotClick = (id: string) => {
    if (!isUnlocked(id)) return;
    setShowDescModal(id);
  };

  const confirmDesc = () => {
    if (showDescModal) {
      setViewed({ ...viewed, [showDescModal]: true });
      setShowDescModal(null);
    }
  };

  const openQuestion = (id: string) => {
    setShowQuestionModal(id);
    setWizardStep(0);
    setTempAnswers(answers[id] || []);
  };

  const handleSingleSubmit = (id: string, answer: any) => {
    const newAnswers = { ...answers, [id]: answer };
    setAnswers(newAnswers);
    setCompleted({ ...completed, [id]: true });
    setShowQuestionModal(null);
  };

  const handleWizardSubmit = (id: string) => {
    const newAnswers = { ...answers, [id]: tempAnswers };
    setAnswers(newAnswers);
    setCompleted({ ...completed, [id]: true });
    setShowQuestionModal(null);
  };

  const handleSubmit = () => {
    const scoreMap: Record<string, number> = {
      tube: tubeOptions.find(o => o.id === answers.tube)?.correct ? 1 : 0,
      connector: connectorOptions.find(o => o.id === answers.connector)?.correct ? 1 : 0,
    };

    const bottomCapScore = (answers.bottomCap || []).reduce((acc: number, ans: string, idx: number) => {
      return acc + (bottomCapQuestions[idx].options.find(o => o.id === ans)?.correct ? 1 : 0);
    }, 0);

    const jointScore = (answers.joint || []).reduce((acc: number, ans: string, idx: number) => {
      return acc + (jointQuestions[idx].options.find(o => o.id === ans)?.correct ? 1 : 0);
    }, 0);

    const totalScore = scoreMap.tube + scoreMap.connector + bottomCapScore + jointScore;

    onNext({
      id: '4.2.1-2-2',
      name: '管材拼装',
      score: totalScore,
      maxScore: 8,
      answers: [
        { id: '2-2-1', label: '管材选型', score: scoreMap.tube, maxScore: 1, correct: scoreMap.tube === 1, userAnswer: answers.tube, correctAnswer: 'A' },
        { id: '2-2-2', label: '连接头选型', score: scoreMap.connector, maxScore: 1, correct: scoreMap.connector === 1, userAnswer: answers.connector, correctAnswer: 'A' },
        { id: '2-2-3', label: '底盖连接设置', score: bottomCapScore, maxScore: 3, correct: bottomCapScore === 3, userAnswer: (answers.bottomCap || []).join(','), correctAnswer: 'A,A,A' },
        { id: '2-2-4', label: '管节连接设置', score: jointScore, maxScore: 3, correct: jointScore === 3, userAnswer: (answers.joint || []).join(','), correctAnswer: 'A,A,A' }
      ]
    });
  };

  useEffect(() => {
    if (Object.keys(completed).length === 4) {
      handleSubmit();
    }
  }, [completed]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-industrial-fg/5 border-l-4 border-industrial-fg">
        <p className="text-xs font-bold">任务说明：请完成测斜管的管材选型与拼装操作，点击图中各部件了解详情后完成配置。</p>
      </div>

      <TechnicalCard title="测斜管拼装示意图 / ASSEMBLY DIAGRAM">
        <div className="relative w-full max-w-2xl mx-auto py-12 flex flex-col items-center space-y-0">
          <div className="space-y-0 flex flex-col items-center">
            {/* Tube 1 */}
            <div 
              onClick={() => handleHotspotClick('tube')}
              className={cn(
                "w-24 h-40 border-2 transition-all cursor-pointer relative group",
                viewed['tube'] ? "border-industrial-fg bg-industrial-fg/10" : "border-industrial-fg/30 hover:border-industrial-fg/60",
                !isUnlocked('tube') && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-px w-px bg-industrial-fg opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">(1) 测斜管</span>
              </div>
              
              {viewed['tube'] && (
                <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                  {!completed['tube'] ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); openQuestion('tube'); }}
                      className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                    >
                      <span className="text-lg font-bold">[?]</span>
                      <span className="text-[10px] whitespace-nowrap">请完成管材选型</span>
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); openQuestion('tube'); }}
                      className="flex items-center space-x-1 text-green-600"
                    >
                      <span className="text-lg font-bold">[v]</span>
                      <span className="text-[10px] whitespace-nowrap">管材已选型 ({answers.tube === 'A' ? 'PVC-U Φ70' : '已选'})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Joint/Connector Area */}
            <div className="relative w-32 h-16 flex items-center justify-center">
              <div 
                onClick={() => handleHotspotClick('connector')}
                className={cn(
                  "w-28 h-12 border-2 transition-all cursor-pointer flex items-center justify-center group",
                  viewed['connector'] ? "border-industrial-fg bg-industrial-fg/20" : "border-industrial-fg/30 hover:border-industrial-fg/60",
                  !isUnlocked('connector') && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">(2) 连接头</span>
                
                {viewed['connector'] && (
                  <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                    {!completed['connector'] ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openQuestion('connector'); }}
                        className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                      >
                        <span className="text-lg font-bold">[?]</span>
                        <span className="text-[10px] whitespace-nowrap">请完成连接头选型</span>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openQuestion('connector'); }}
                        className="flex items-center space-x-1 text-green-600"
                      >
                        <span className="text-lg font-bold">[v]</span>
                        <span className="text-[10px] whitespace-nowrap">连接头已选型</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Joint Hotspot */}
              <div 
                onClick={() => handleHotspotClick('joint')}
                className={cn(
                  "absolute -left-24 top-1/2 -translate-y-1/2 p-2 border-2 transition-all cursor-pointer group",
                  viewed['joint'] ? "border-industrial-fg bg-industrial-fg/10" : "border-industrial-fg/30 hover:border-industrial-fg/60",
                  !isUnlocked('joint') && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">(4) 管节连接</span>
                {viewed['joint'] && (
                  <div className="absolute -left-32 top-1/2 -translate-y-1/2">
                    {!completed['joint'] ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openQuestion('joint'); }}
                        className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                      >
                        <span className="text-[10px] whitespace-nowrap">请完成管节连接设置</span>
                        <span className="text-lg font-bold">[?]</span>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openQuestion('joint'); }}
                        className="flex items-center space-x-1 text-green-600"
                      >
                        <span className="text-[10px] whitespace-nowrap">管节连接已设置 ({(answers.joint || []).length}/3)</span>
                        <span className="text-lg font-bold">[v]</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tube 2 */}
            <div className="w-24 h-40 border-2 border-industrial-fg/30 relative">
              <div className="absolute inset-y-0 left-1/2 -translate-x-px w-px bg-industrial-fg opacity-20"></div>
            </div>

            {/* Bottom Cap Area */}
            <div 
              onClick={() => handleHotspotClick('bottomCap')}
              className={cn(
                "w-24 h-12 border-2 transition-all cursor-pointer flex items-center justify-center group",
                viewed['bottomCap'] ? "border-industrial-fg bg-industrial-fg/20" : "border-industrial-fg/30 hover:border-industrial-fg/60",
                !isUnlocked('bottomCap') && "opacity-40 cursor-not-allowed"
              )}
            >
              <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">(3) 底盖连接</span>
              {viewed['bottomCap'] && (
                <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                  {!completed['bottomCap'] ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); openQuestion('bottomCap'); }}
                      className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                    >
                      <span className="text-lg font-bold">[?]</span>
                      <span className="text-[10px] whitespace-nowrap">请完成底盖连接设置</span>
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); openQuestion('bottomCap'); }}
                      className="flex items-center space-x-1 text-green-600"
                    >
                      <span className="text-lg font-bold">[v]</span>
                      <span className="text-[10px] whitespace-nowrap">底盖连接已设置 ({(answers.bottomCap || []).length}/3)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </TechnicalCard>

      {/* Description Modal */}
      <Modal 
        isOpen={!!showDescModal} 
        onClose={() => setShowDescModal(null)}
        title={hotspots.find(h => h.id === showDescModal)?.title || ''}
      >
        <div className="space-y-6">
          <p className="text-xs leading-relaxed opacity-80">
            {hotspots.find(h => h.id === showDescModal)?.desc}
          </p>
          <div className="flex space-x-3">
            <Button onClick={confirmDesc} className="flex-1">确认</Button>
            <Button variant="secondary" onClick={() => setShowDescModal(null)} className="flex-1">取消</Button>
          </div>
        </div>
      </Modal>

      {/* Question Modals */}
      <AnimatePresence>
        {showQuestionModal === 'tube' && (
          <Modal isOpen={true} onClose={() => setShowQuestionModal(null)} title="选择管材型号">
            <div className="space-y-4">
              {tubeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSingleSubmit('tube', opt.id)}
                  className={cn(
                    "w-full text-left p-4 border transition-all flex items-start space-x-4",
                    answers.tube === opt.id ? "border-industrial-fg bg-industrial-fg/5" : "border-industrial-fg/10 hover:border-industrial-fg/30"
                  )}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-industrial-fg mt-1 flex items-center justify-center">
                    {answers.tube === opt.id && <div className="w-2 h-2 bg-industrial-fg rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{opt.id}. {opt.text}</span>
                    </div>
                    <p className="text-[10px] opacity-60 leading-relaxed">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {showQuestionModal === 'connector' && (
          <Modal isOpen={true} onClose={() => setShowQuestionModal(null)} title="选择连接头型号">
            <div className="space-y-4">
              {connectorOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSingleSubmit('connector', opt.id)}
                  className={cn(
                    "w-full text-left p-4 border transition-all flex items-start space-x-4",
                    answers.connector === opt.id ? "border-industrial-fg bg-industrial-fg/5" : "border-industrial-fg/10 hover:border-industrial-fg/30"
                  )}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-industrial-fg mt-1 flex items-center justify-center">
                    {answers.connector === opt.id && <div className="w-2 h-2 bg-industrial-fg rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{opt.id}. {opt.text}</span>
                    </div>
                    <p className="text-[10px] opacity-60 leading-relaxed">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {(showQuestionModal === 'bottomCap' || showQuestionModal === 'joint') && (
          <Modal 
            isOpen={true} 
            onClose={() => setShowQuestionModal(null)} 
            title={showQuestionModal === 'bottomCap' ? "底盖与第一管连接设置" : "管节与接头管连接设置"}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center text-[10px] font-mono opacity-40 uppercase tracking-widest">
                <span>Question {wizardStep + 1} / 3</span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={cn("w-8 h-1", i <= wizardStep ? "bg-industrial-fg" : "bg-industrial-fg/10")} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold">
                  {(showQuestionModal === 'bottomCap' ? bottomCapQuestions : jointQuestions)[wizardStep].q}
                </p>
                <div className="space-y-2">
                  {(showQuestionModal === 'bottomCap' ? bottomCapQuestions : jointQuestions)[wizardStep].options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        const newTemp = [...tempAnswers];
                        newTemp[wizardStep] = opt.id;
                        setTempAnswers(newTemp);
                      }}
                      className={cn(
                        "w-full text-left p-3 text-xs border transition-all",
                        tempAnswers[wizardStep] === opt.id 
                          ? "border-industrial-fg bg-industrial-fg text-white" 
                          : "border-industrial-fg/20 hover:border-industrial-fg"
                      )}
                    >
                      <span className="font-bold mr-2">{opt.id}.</span>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-industrial-fg/10">
                {wizardStep > 0 && (
                  <Button variant="secondary" onClick={() => setWizardStep(wizardStep - 1)} className="flex-1">
                    上一题
                  </Button>
                )}
                {wizardStep < 2 ? (
                  <Button 
                    onClick={() => setWizardStep(wizardStep + 1)} 
                    className="flex-1"
                    disabled={!tempAnswers[wizardStep]}
                  >
                    下一题
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleWizardSubmit(showQuestionModal!)} 
                    className="flex-1"
                    disabled={!tempAnswers[wizardStep]}
                  >
                    确认提交
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CageInstallation: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [viewed, setViewed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showDescModal, setShowDescModal] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<string | null>(null);

  const sectionHotspots = [
    { id: 'A', title: '笼体内侧主筋处', desc: '钢筋笼迎向基坑内侧的纵筋位置。该处位于笼体内侧，下孔过程中不直接接触孔壁。测斜管固定在此处后随钢筋笼整体下放。', correct: true },
    { id: 'B', title: '笼体基坑侧面', desc: '钢筋笼朝向基坑开挖面的一侧。该侧是围护结构承受侧向土压力的受力面，距开挖面最近。', correct: false },
    { id: 'C', title: '笼体外侧主筋处', desc: '钢筋笼背向基坑的外侧纵筋位置。该处在下孔时靠近孔壁或导墙，空间相对紧凑。', correct: false },
    { id: 'D', title: '笼体土侧面', desc: '钢筋笼朝向保留土体的一侧。该侧远离基坑开挖面，土压力方向与位移监测主方向存在夹角。', correct: false }
  ];

  const heightHotspots = [
    { id: '1', title: '方案①', name: '底至笼底、顶超出地面0.5m', desc: '测斜管从钢筋笼底部延伸至地面以上约0.5m。管体覆盖钢筋笼全长，顶口高出地面便于后续测量入孔。', correct: true },
    { id: '2', title: '方案②', name: '底至笼底、顶与地面齐平', desc: '测斜管从钢筋笼底部延伸至地面标高。管体覆盖钢筋笼全长，但顶口与地面齐平，无预留。', correct: false },
    { id: '3', title: '方案③', name: '底高于笼底2m、顶超出地面0.5m', desc: '测斜管底部距笼底约2m，顶部超出地面0.5m。管体未覆盖笼底段。', correct: false },
    { id: '4', title: '方案④', name: '底至笼底、顶低于地面1m', desc: '测斜管从笼底延伸至地面以下约1m处。管体覆盖笼底但顶口在地面以下。', correct: false }
  ];

  const spacingOptions = [
    { id: 'A', text: '每隔1.0~1.5m设一道绑扎点', correct: true },
    { id: 'B', text: '仅在管顶和管底各绑一道', correct: false },
    { id: 'C', text: '每隔3~4m设一道绑扎点', correct: false },
    { id: 'D', text: '每隔0.3m密集绑扎', correct: false }
  ];

  const tightnessOptions = [
    { id: 'A', text: '适度绑扎，固定但不压迫管壁', correct: true },
    { id: 'B', text: '尽量扎紧，防止任何松动', correct: false },
    { id: 'C', text: '松散绑扎，允许管体自由滑动', correct: false },
    { id: 'D', text: '用钢丝直接焊接在钢筋上', correct: false }
  ];

  const handleHotspotClick = (type: 'section' | 'height', id: string) => {
    if (type === 'height' && !completed['section']) return;
    setShowDescModal(`${type}:${id}`);
  };

  const confirmDesc = () => {
    if (showDescModal) {
      const [type, id] = showDescModal.split(':');
      setAnswers({ ...answers, [type]: id });
      setCompleted({ ...completed, [type]: true });
      setShowDescModal(null);
    }
  };

  const handleQuestionSubmit = (type: 'spacing' | 'tightness', id: string) => {
    setAnswers({ ...answers, [type]: id });
    setCompleted({ ...completed, [type]: true });
    setShowQuestionModal(null);
  };

  const handleSubmit = () => {
    const scoreMap = {
      section: sectionHotspots.find(h => h.id === answers.section)?.correct ? 1 : 0,
      height: heightHotspots.find(h => h.id === answers.height)?.correct ? 1 : 0,
      spacing: spacingOptions.find(o => o.id === answers.spacing)?.correct ? 1 : 0,
      tightness: tightnessOptions.find(o => o.id === answers.tightness)?.correct ? 1 : 0
    };

    onNext({
      id: '4.2.1-2-3',
      name: '安装到钢筋笼',
      score: scoreMap.section + scoreMap.height + scoreMap.spacing + scoreMap.tightness,
      maxScore: 4,
      answers: [
        { id: '2-3-1', label: '截面安装位置', score: scoreMap.section, maxScore: 1, correct: scoreMap.section === 1, userAnswer: answers.section, correctAnswer: 'A' },
        { id: '2-3-2', label: '高度布置方案', score: scoreMap.height, maxScore: 1, correct: scoreMap.height === 1, userAnswer: answers.height, correctAnswer: '1' },
        { id: '2-3-3', label: '绑扎间距', score: scoreMap.spacing, maxScore: 1, correct: scoreMap.spacing === 1, userAnswer: answers.spacing, correctAnswer: 'A' },
        { id: '2-3-4', label: '绑扎松紧度', score: scoreMap.tightness, maxScore: 1, correct: scoreMap.tightness === 1, userAnswer: answers.tightness, correctAnswer: 'A' }
      ]
    });
  };

  useEffect(() => {
    if (Object.keys(completed).length === 4) {
      handleSubmit();
    }
  }, [completed]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-industrial-fg/5 border-l-4 border-industrial-fg">
        <p className="text-xs font-bold">任务说明：请在截面图中选择测斜管安装位置，然后在立面图中完成高度和绑扎设置。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Section View */}
        <TechnicalCard title="截面图（基坑与钢筋笼） / SECTION VIEW">
          <div className="relative aspect-square bg-white border border-industrial-fg/20 flex items-center justify-center p-8">
            {/* Excavation Edge */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-industrial-fg/40 flex items-center justify-center">
              <span className="text-[8px] bg-white px-2 uppercase tracking-widest opacity-40">════ 基坑边 ════</span>
            </div>

            {/* Rebar Cage Section */}
            <div className="w-48 h-48 border-4 border-industrial-fg/20 relative flex items-center justify-center">
              <div className="absolute inset-4 border-2 border-industrial-fg/10 border-dashed"></div>
              <span className="text-[10px] font-bold opacity-20 uppercase">钢筋笼截面</span>

              {/* Hotspots */}
              {sectionHotspots.map((h, i) => {
                const positions = [
                  { top: '0', left: '50%', transform: 'translate(-50%, -50%)' }, // A - Inner
                  { top: '50%', right: '0', transform: 'translate(50%, -50%)' }, // B - Pit Side
                  { bottom: '0', left: '50%', transform: 'translate(-50%, 50%)' }, // C - Outer
                  { top: '50%', left: '0', transform: 'translate(-50%, -50%)' }  // D - Soil Side
                ];
                return (
                  <button
                    key={h.id}
                    onClick={() => handleHotspotClick('section', h.id)}
                    className={cn(
                      "absolute w-8 h-8 border-2 flex items-center justify-center transition-all z-10",
                      answers.section === h.id 
                        ? "bg-industrial-fg border-industrial-fg text-white" 
                        : "bg-white border-industrial-fg/30 hover:border-industrial-fg animate-breathing"
                    )}
                    style={positions[i]}
                  >
                    <span className="text-xs font-bold">{h.id}</span>
                  </button>
                );
              })}

              {/* Labels */}
              <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-[8px] opacity-40 rotate-90">← 基坑侧</span>
            </div>

            {/* Status Marker */}
            {completed['section'] && (
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-green-600">
                <span className="text-lg font-bold">[v]</span>
                <span className="text-[10px]">安装位置：{sectionHotspots.find(h => h.id === answers.section)?.title}</span>
              </div>
            )}
          </div>
        </TechnicalCard>

        {/* Right: Elevation View */}
        <TechnicalCard title="立面图（钢筋笼立面） / ELEVATION VIEW">
          <div className={cn(
            "relative h-[400px] bg-white border border-industrial-fg/20 flex flex-col items-center justify-between py-12 transition-opacity",
            !completed['section'] && "opacity-40"
          )}>
            {/* Ground Line */}
            <div className="w-full h-px bg-industrial-fg/40 relative">
              <span className="absolute -top-4 left-4 text-[8px] opacity-40">── 地面 ──</span>
            </div>

            {/* Rebar Cage Profile */}
            <div className="w-24 flex-1 border-x-2 border-industrial-fg/20 relative flex flex-col items-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold opacity-10 rotate-90 uppercase tracking-widest">钢筋笼立面</span>
              </div>

              {/* Tube Display (after height selection) */}
              {completed['height'] && (
                <div className={cn(
                  "absolute w-4 bg-industrial-fg/20 border-x border-industrial-fg transition-all",
                  answers.height === '1' && "top-[-20px] bottom-0",
                  answers.height === '2' && "top-0 bottom-0",
                  answers.height === '3' && "top-[-20px] bottom-8",
                  answers.height === '4' && "top-8 bottom-0"
                )}>
                  <div className="absolute inset-0 flex flex-col justify-around opacity-20">
                    {[...Array(10)].map((_, i) => <div key={i} className="h-px bg-industrial-fg w-full" />)}
                  </div>
                </div>
              )}

              {/* Height Hotspots */}
              {completed['section'] && !completed['height'] && (
                <div className="absolute inset-y-0 -right-16 flex flex-col justify-around">
                  {heightHotspots.map(h => (
                    <button
                      key={h.id}
                      onClick={() => handleHotspotClick('height', h.id)}
                      className="flex items-center space-x-2 group"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-industrial-fg flex items-center justify-center bg-white group-hover:bg-industrial-bg transition-all animate-breathing">
                        <span className="text-[10px] font-bold">{h.id}</span>
                      </div>
                      <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Markers for Spacing & Tightness */}
              {completed['height'] && (
                <div className="absolute -right-24 top-1/2 -translate-y-1/2 space-y-8">
                  {/* Spacing */}
                  <div className="flex items-center space-x-2">
                    {!completed['spacing'] ? (
                      <button 
                        onClick={() => setShowQuestionModal('spacing')}
                        className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                      >
                        <span className="text-lg font-bold">[?]</span>
                        <span className="text-[10px] whitespace-nowrap">绑扎间距</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1 text-green-600">
                        <span className="text-lg font-bold">[v]</span>
                        <span className="text-[10px] whitespace-nowrap">间距：{spacingOptions.find(o => o.id === answers.spacing)?.text.split('m')[0]}m</span>
                      </div>
                    )}
                  </div>

                  {/* Tightness */}
                  {completed['spacing'] && (
                    <div className="flex items-center space-x-2">
                      {!completed['tightness'] ? (
                        <button 
                          onClick={() => setShowQuestionModal('tightness')}
                          className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                        >
                          <span className="text-lg font-bold">[?]</span>
                          <span className="text-[10px] whitespace-nowrap">绑扎松紧度</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1 text-green-600">
                          <span className="text-lg font-bold">[v]</span>
                          <span className="text-[10px] whitespace-nowrap">松紧：适度</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cage Bottom Line */}
            <div className="w-full h-px bg-industrial-fg/40 relative">
              <span className="absolute -bottom-4 left-4 text-[8px] opacity-40">── 笼底 ──</span>
            </div>

            {/* Status Marker Height */}
            {completed['height'] && (
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-green-600">
                <span className="text-lg font-bold">[v]</span>
                <span className="text-[10px]">高度：{heightHotspots.find(h => h.id === answers.height)?.title}</span>
              </div>
            )}
          </div>
        </TechnicalCard>
      </div>

      {/* Description Modal */}
      <Modal 
        isOpen={!!showDescModal} 
        onClose={() => setShowDescModal(null)}
        title={(() => {
          if (!showDescModal) return '';
          const [type, id] = showDescModal.split(':');
          return type === 'section' 
            ? sectionHotspots.find(h => h.id === id)?.title || ''
            : heightHotspots.find(h => h.id === id)?.title || '';
        })()}
      >
        <div className="space-y-6">
          <p className="text-xs leading-relaxed opacity-80">
            {(() => {
              if (!showDescModal) return '';
              const [type, id] = showDescModal.split(':');
              return type === 'section' 
                ? sectionHotspots.find(h => h.id === id)?.desc
                : heightHotspots.find(h => h.id === id)?.desc;
            })()}
          </p>
          <div className="flex space-x-3">
            <Button onClick={confirmDesc} className="flex-1">确认</Button>
            <Button variant="secondary" onClick={() => setShowDescModal(null)} className="flex-1">取消</Button>
          </div>
        </div>
      </Modal>

      {/* Question Modals */}
      <AnimatePresence>
        {showQuestionModal && (
          <Modal 
            isOpen={true} 
            onClose={() => setShowQuestionModal(null)} 
            title={showQuestionModal === 'spacing' ? "绑扎间距" : "绑扎松紧度"}
          >
            <div className="space-y-6">
              <p className="text-xs font-bold">
                {showQuestionModal === 'spacing' 
                  ? "测斜管绑扎点的间距应如何设置？" 
                  : "测斜管与钢筋笼的绑扎松紧度应如何控制？"}
              </p>
              <div className="space-y-2">
                {(showQuestionModal === 'spacing' ? spacingOptions : tightnessOptions).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleQuestionSubmit(showQuestionModal as any, opt.id)}
                    className={cn(
                      "w-full text-left p-3 text-xs border transition-all",
                      answers[showQuestionModal] === opt.id 
                        ? "border-industrial-fg bg-industrial-fg text-white" 
                        : "border-industrial-fg/20 hover:border-industrial-fg"
                    )}
                  >
                    <span className="font-bold mr-2">{opt.id}.</span>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Inspection: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [viewed, setViewed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showDescModal, setShowDescModal] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<string | null>(null);

  const holes = [
    {
      id: 'CX-01',
      title: '方向偏转',
      desc: '孔号：CX-01\n位置：基坑北侧冠梁\n外露高度：约0.5m\n保护盖：在位\n\nA+方向标识可见，标识箭头指向与设计监测方向（垂直基坑边）存在约45°夹角，偏向东北方向。\n\n管口完好无破损，管口周边整洁。',
      options: [
        { id: 'A', text: '方向有偏差但在允许范围内，可通过软件校正补偿，不必现场处理，直接进入测量', correct: false },
        { id: 'B', text: '方向偏转超限，应记录实际偏差角度并上报，由技术负责人确认后重新标定A+方向再进行后续工作', correct: true },
        { id: 'C', text: '方向偏转，应在管口处旋转管体将导槽对准设计方向后固定', correct: false },
        { id: 'D', text: '方向偏转，该孔不可修复，应判废并在旁边重新钻孔埋管', correct: false }
      ]
    },
    {
      id: 'CX-02',
      title: '盖帽缺失',
      desc: '孔号：CX-02\n位置：基坑北侧冠梁\n外露高度：约0.5m\n保护盖：无\n\n管口处无保护盖，管口敞开，可见管内十字形导槽，顶口完好无破损。\n\n管口周边有少量施工碎屑散落。',
      options: [
        { id: 'A', text: '管口敞开但导槽可见且完好，说明管体未受损，可直接进入通槽复测', correct: false },
        { id: 'B', text: '管口敞开，应先用高压气枪吹净管内杂物，再加装保护盖', correct: false },
        { id: 'C', text: '管口敞开且有碎屑，应先清理管口碎屑防止落入管内，再加装专用保护盖封堵', correct: true },
        { id: 'D', text: '管口敞开，应用塑料薄膜和胶带临时封口即可，正式保护盖可后续补装', correct: false }
      ]
    },
    {
      id: 'CX-03',
      title: '混凝土堵塞',
      desc: '孔号：CX-03\n位置：基坑北侧冠梁\n外露高度：可辨认但被覆盖\n保护盖：被混凝土包裹\n\n管口被一层混凝土浆覆盖，无法看到导槽和A+标识。管口周围有浇筑溢出痕迹。',
      options: [
        { id: 'A', text: '管口被混凝土覆盖，应使用电钻在管口位置钻透混凝土层，快速恢复管口通道', correct: false },
        { id: 'B', text: '管口被混凝土覆盖，应使用高压水枪冲洗溶解混凝土浆，避免机械损伤', correct: false },
        { id: 'C', text: '管口被混凝土完全覆盖，管体大概率已被压损，应判废该孔', correct: false },
        { id: 'D', text: '管口被混凝土覆盖，应人工小心凿除管口周围混凝土，清理后检查管口和导槽完整性再恢复保护', correct: true }
      ]
    },
    {
      id: 'CX-04',
      title: '状态合格',
      desc: '孔号：CX-04\n位置：基坑北侧冠梁\n外露高度：约0.5m\n保护盖：完好\n\n管口保护盖完好。A+方向标识清晰，指向与设计监测方向一致。\n\n管口周边整洁无杂物。',
      options: [
        { id: 'A', text: '外观合格，但应加做一次方向复核以确保万无一失', correct: false },
        { id: 'B', text: '外观合格，但保护盖应更换为金属盖帽以提高防护等级', correct: false },
        { id: 'C', text: '外观合格，状态满足验收要求，可进入通槽复测', correct: true },
        { id: 'D', text: '外观合格，但外露高度0.5m偏高，应截短至与地面齐平以防碰撞', correct: false }
      ]
    }
  ];

  const handleHotspotClick = (id: string) => {
    setShowDescModal(id);
  };

  const confirmDesc = () => {
    if (showDescModal) {
      setViewed({ ...viewed, [showDescModal]: true });
      setShowDescModal(null);
    }
  };

  const handleQuestionSubmit = (id: string, answerId: string) => {
    setAnswers({ ...answers, [id]: answerId });
    setCompleted({ ...completed, [id]: true });
    setShowQuestionModal(null);
  };

  const handleSubmit = () => {
    const holeResults = holes.map((h, idx) => {
      const isCorrect = h.options.find(o => o.id === answers[h.id])?.correct || false;
      return {
        id: `1-3-${idx + 1}`,
        label: `${h.id} 管口验收处理`,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        correct: isCorrect,
        userAnswer: answers[h.id],
        correctAnswer: h.options.find(o => o.correct)?.id || ''
      };
    });

    const totalScore = holeResults.reduce((acc, r) => acc + r.score, 0);

    onNext({
      id: '4.2.1-3-1',
      name: '管口验收',
      score: totalScore,
      maxScore: 4,
      answers: holeResults
    });
  };

  useEffect(() => {
    if (Object.keys(completed).length === 4) {
      handleSubmit();
    }
  }, [completed]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-industrial-fg/5 border-l-4 border-industrial-fg">
        <p className="text-xs font-bold">任务说明：请逐一检查各测斜孔的管口状态，识别缺陷并选择正确的处理方案。</p>
      </div>

      <TechnicalCard title="基坑边俯视场景图 / SITE OVERVIEW">
        <div className="relative w-full h-[400px] bg-white border border-industrial-fg/20 flex flex-col items-center justify-center p-8 overflow-hidden">
          {/* Excavation Edge */}
          <div className="absolute top-12 left-0 right-0 h-2 bg-industrial-fg/40 flex items-center justify-center">
            <span className="text-[10px] bg-white px-4 uppercase tracking-[0.2em] font-bold opacity-60">══════ 基坑边 ══════</span>
          </div>

          {/* Holes Layout */}
          <div className="grid grid-cols-4 gap-12 w-full max-w-4xl relative z-10 mt-12">
            {holes.map(h => (
              <div key={h.id} className="flex flex-col items-center space-y-4">
                <span className="text-[10px] font-bold opacity-60">{h.id}</span>
                
                {/* Hole Visual */}
                <div 
                  onClick={() => handleHotspotClick(h.id)}
                  className={cn(
                    "w-20 h-20 border-2 flex items-center justify-center transition-all cursor-pointer relative group",
                    viewed[h.id] ? "border-industrial-fg bg-industrial-fg/5" : "border-industrial-fg/30 hover:border-industrial-fg/60 animate-breathing"
                  )}
                >
                  {/* Visual Representation based on ID */}
                  {h.id === 'CX-01' && (
                    <div className="relative w-12 h-12 border border-industrial-fg/20 rounded-full flex items-center justify-center">
                      <div className="absolute top-0 w-px h-4 bg-industrial-fg/20"></div>
                      <div className="absolute rotate-45 flex flex-col items-center">
                        <div className="w-px h-8 bg-industrial-fg"></div>
                        <ChevronRight size={10} className="-rotate-90 -mt-1 text-industrial-fg" />
                        <span className="text-[8px] font-bold mt-1">A+</span>
                      </div>
                      <div className="w-2 h-2 rounded-full border border-industrial-fg"></div>
                    </div>
                  )}
                  {h.id === 'CX-02' && (
                    <div className="relative w-12 h-12 border border-industrial-fg/20 rounded-full flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <div className="w-full h-px bg-industrial-fg"></div>
                        <div className="h-full w-px bg-industrial-fg"></div>
                      </div>
                      <div className="absolute -bottom-2 flex space-x-1">
                        <div className="w-1 h-1 bg-industrial-fg/40 rounded-full"></div>
                        <div className="w-0.5 h-0.5 bg-industrial-fg/40 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  {h.id === 'CX-03' && (
                    <div className="relative w-12 h-12 border border-industrial-fg/20 rounded-full bg-industrial-fg/10 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-industrial-fg/20 flex flex-wrap gap-1 p-1">
                        {[...Array(16)].map((_, i) => <div key={i} className="w-2 h-2 bg-industrial-fg/30 rounded-sm" />)}
                      </div>
                      <span className="text-[8px] font-bold relative z-10 bg-white/80 px-1">CONCRETE</span>
                    </div>
                  )}
                  {h.id === 'CX-04' && (
                    <div className="relative w-12 h-12 border border-industrial-fg/20 rounded-full flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <ChevronRight size={10} className="-rotate-90 text-industrial-fg" />
                        <div className="w-px h-6 bg-industrial-fg"></div>
                        <span className="text-[8px] font-bold mt-1">A+</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Label */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-industrial-fg text-white text-[8px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    点击查看详情
                  </div>
                </div>

                <span className="text-[10px] font-medium opacity-80 text-center h-8 flex items-center">{h.title}</span>

                {/* Markers */}
                <div className="flex items-center space-x-2">
                  {viewed[h.id] && !completed[h.id] ? (
                    <button 
                      onClick={() => setShowQuestionModal(h.id)}
                      className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                    >
                      <span className="text-lg font-bold">[?]</span>
                      <span className="text-[10px] uppercase tracking-wider">验收判定</span>
                    </button>
                  ) : completed[h.id] ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <span className="text-lg font-bold">[v]</span>
                      <span className="text-[10px] uppercase tracking-wider">已处理</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Background Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
      </TechnicalCard>

      {/* Description Modal */}
      <Modal 
        isOpen={!!showDescModal} 
        onClose={() => setShowDescModal(null)}
        title={`${showDescModal} 管口现场状态`}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Diagram */}
          <div className="w-full md:w-1/2 aspect-square bg-industrial-bg/5 border border-industrial-fg/10 flex flex-col items-center justify-center p-6 relative">
            <span className="absolute top-4 left-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">管口俯视图</span>
            
            {/* Dynamic Diagram based on showDescModal */}
            <div className="w-48 h-48 border-2 border-industrial-fg/20 rounded-full flex items-center justify-center relative">
              {showDescModal === 'CX-01' && (
                <>
                  <div className="absolute top-4 flex flex-col items-center opacity-40">
                    <span className="text-[8px] mb-1">设计方向</span>
                    <ChevronRight size={12} className="-rotate-90" />
                    <div className="w-px h-8 bg-industrial-fg"></div>
                  </div>
                  <div className="absolute rotate-45 flex flex-col items-center">
                    <div className="w-px h-24 bg-industrial-fg"></div>
                    <ChevronRight size={16} className="-rotate-90 -mt-2 text-industrial-fg" />
                    <span className="text-[10px] font-bold mt-2">实测 A+</span>
                  </div>
                </>
              )}
              {showDescModal === 'CX-02' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-industrial-fg/40"></div>
                    <div className="h-full w-px bg-industrial-fg/40 absolute"></div>
                  </div>
                  <span className="text-[10px] font-bold bg-white px-2 relative z-10">导槽可见 (敞开)</span>
                  <div className="absolute bottom-8 flex space-x-2">
                    <div className="w-2 h-2 bg-industrial-fg/20 rounded-full"></div>
                    <div className="w-1 h-1 bg-industrial-fg/20 rounded-full"></div>
                  </div>
                </>
              )}
              {showDescModal === 'CX-03' && (
                <div className="absolute inset-0 bg-industrial-fg/20 flex items-center justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest bg-white/80 px-4 py-2 border border-industrial-fg/20">混凝土覆盖</span>
                </div>
              )}
              {showDescModal === 'CX-04' && (
                <div className="flex flex-col items-center">
                  <span className="text-[8px] mb-1 opacity-40">设计与实测一致</span>
                  <ChevronRight size={16} className="-rotate-90 text-industrial-fg" />
                  <div className="w-px h-24 bg-industrial-fg"></div>
                  <span className="text-[10px] font-bold mt-2">A+</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="opacity-40 uppercase tracking-wider block">孔号</span>
                <span className="font-bold">{showDescModal}</span>
              </div>
              <div>
                <span className="opacity-40 uppercase tracking-wider block">位置</span>
                <span className="font-bold">基坑北侧冠梁</span>
              </div>
              <div>
                <span className="opacity-40 uppercase tracking-wider block">外露高度</span>
                <span className="font-bold">{showDescModal === 'CX-03' ? '可辨认但被覆盖' : '约0.5m'}</span>
              </div>
              <div>
                <span className="opacity-40 uppercase tracking-wider block">保护盖</span>
                <span className="font-bold">
                  {showDescModal === 'CX-01' ? '在位' : 
                   showDescModal === 'CX-02' ? '无' : 
                   showDescModal === 'CX-03' ? '被混凝土包裹' : '完好'}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-industrial-fg/10">
              <p className="text-xs leading-relaxed opacity-80 whitespace-pre-line">
                {holes.find(h => h.id === showDescModal)?.desc.split('\n\n')[1]}
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button onClick={confirmDesc} className="flex-1">确认</Button>
              <Button variant="secondary" onClick={() => setShowDescModal(null)} className="flex-1">取消</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <Modal 
            isOpen={true} 
            onClose={() => setShowQuestionModal(null)} 
            title={`${showQuestionModal} 问题识别与处理`}
          >
            <div className="space-y-6">
              <p className="text-xs font-bold">该孔位存在什么问题？应如何处理？</p>
              <div className="space-y-2">
                {holes.find(h => h.id === showQuestionModal)?.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleQuestionSubmit(showQuestionModal!, opt.id)}
                    className={cn(
                      "w-full text-left p-3 text-xs border transition-all flex items-start space-x-3",
                      answers[showQuestionModal!] === opt.id 
                        ? "border-industrial-fg bg-industrial-fg text-white" 
                        : "border-industrial-fg/20 hover:border-industrial-fg"
                    )}
                  >
                    <span className="font-bold mt-0.5">{opt.id}.</span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ConnectivityTest: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [viewed, setViewed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showDescModal, setShowDescModal] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<string | null>(null);

  const holes = [
    {
      id: 'CX-01',
      title: '全程顺畅到底',
      depth: '20m',
      prevStatus: '已处理',
      desc: '探头从管口放入，靠自重缓慢下降。\n全程下降顺畅，无明显阻力。\n探头顺利到达孔底20m。\n上提过程同样顺畅，升降自如。',
      diagram: { maxDepth: 20, stopDepth: 20, status: 'success' },
      options: [
        { id: 'A', text: '通槽合格，可进行初始值测量', correct: true },
        { id: 'B', text: '虽然顺畅，但因管口验收时有方向偏转问题，通槽结果不可信，需重新检测', correct: false },
        { id: 'C', text: '顺畅到底只能说明无堵塞，还需加做水密性测试才能判定合格', correct: false },
        { id: 'D', text: '顺畅到底但应在8m和16m处各停留观察5分钟，确认无缓慢卡滞后再判定', correct: false }
      ]
    },
    {
      id: 'CX-02',
      title: '8m处受阻',
      depth: '20m',
      prevStatus: '已处理',
      desc: '探头从管口放入，初始下降正常。\n下降至约8m处，探头突然受阻，无法继续下降。\n反复尝试提升后重新下放，仍在同一位置受阻。',
      diagram: { maxDepth: 20, stopDepth: 8, status: 'error' },
      options: [
        { id: 'A', text: '通槽不合格，8m处可能为管体断裂，该孔应判废', correct: false },
        { id: 'B', text: '通槽不合格，可加大下压力强行推过受阻点', correct: false },
        { id: 'C', text: '通槽不合格，8m处受阻可能为落入碎屑或接头错位，应记录受阻深度并上报，安排疏通后复测', correct: true },
        { id: 'D', text: '通槽不合格，应立即拔出管体更换新管重新埋设', correct: false }
      ]
    },
    {
      id: 'CX-03',
      title: '全程阻力偏大',
      depth: '20m',
      prevStatus: '已处理',
      desc: '探头从管口放入，下降过程中全程均感到明显的摩擦阻力，下降速度比正常情况慢。\n探头最终可到达孔底20m，但上提时同样阻力偏大。',
      diagram: { maxDepth: 20, stopDepth: 20, status: 'warning' },
      options: [
        { id: 'A', text: '能到底即为合格，阻力偏大不影响后续测量', correct: false },
        { id: 'B', text: '通槽不合格，全程阻力偏大说明管体已严重变形，该孔应判废', correct: false },
        { id: 'C', text: '通槽有条件合格，但应记录阻力异常情况，评估是否影响测斜探头正常读数，必要时复测确认', correct: true },
        { id: 'D', text: '通槽不合格，应向管内注水冲洗以降低摩擦阻力', correct: false }
      ]
    },
    {
      id: 'CX-04',
      title: '16m处受阻',
      depth: '20m',
      prevStatus: '合格',
      desc: '探头从管口放入，初始下降正常。\n下降至约16m处，探头突然受阻，无法继续下降。\n反复尝试提升后重新下放，仍在同一位置受阻。\n管口验收时该孔外观完全正常。',
      diagram: { maxDepth: 20, stopDepth: 16, status: 'error' },
      options: [
        { id: 'A', text: '管口验收合格则管体应无问题，可能是探头故障，更换探头后重新检测即可', correct: false },
        { id: 'B', text: '通槽不合格，16m处受阻可能为深部接头错位或变形，应记录受阻深度并上报，安排检查处理', correct: true },
        { id: 'C', text: '通槽不合格，但16m已超过基坑开挖深度，不影响监测范围，可判定合格', correct: false },
        { id: 'D', text: '通槽不合格，16m以下数据不可用，将该孔有效深度改为16m继续使用即可', correct: false }
      ]
    }
  ];

  const handleHotspotClick = (id: string) => {
    setShowDescModal(id);
  };

  const confirmDesc = () => {
    if (showDescModal) {
      setViewed({ ...viewed, [showDescModal]: true });
      setShowDescModal(null);
    }
  };

  const handleQuestionSubmit = (id: string, answerId: string) => {
    setAnswers({ ...answers, [id]: answerId });
    setCompleted({ ...completed, [id]: true });
    setShowQuestionModal(null);
  };

  const handleSubmit = () => {
    const testResults = holes.map((h, idx) => {
      const isCorrect = h.options.find(o => o.id === answers[h.id])?.correct || false;
      return {
        id: `1-3-${idx + 5}`,
        label: `${h.id} 通槽判定`,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        correct: isCorrect,
        userAnswer: answers[h.id],
        correctAnswer: h.options.find(o => o.correct)?.id || ''
      };
    });

    const totalScore = testResults.reduce((acc, r) => acc + r.score, 0);

    onNext({
      id: '4.2.1-3-2',
      name: '通槽复测',
      score: totalScore,
      maxScore: 4,
      answers: testResults
    });
  };

  useEffect(() => {
    if (Object.keys(completed).length === 4) {
      handleSubmit();
    }
  }, [completed]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-industrial-fg/5 border-l-4 border-industrial-fg">
        <p className="text-xs font-bold">任务说明：对各测斜孔逐一进行通槽检测，点击孔位查看检测结果并判定结论。</p>
      </div>

      <TechnicalCard title="基坑边俯视场景图 / SITE OVERVIEW">
        <div className="relative w-full h-[400px] bg-white border border-industrial-fg/20 flex flex-col items-center justify-center p-8 overflow-hidden">
          {/* Excavation Edge */}
          <div className="absolute top-12 left-0 right-0 h-2 bg-industrial-fg/40 flex items-center justify-center">
            <span className="text-[10px] bg-white px-4 uppercase tracking-[0.2em] font-bold opacity-60">══════ 基坑边 ══════</span>
          </div>

          {/* Holes Layout */}
          <div className="grid grid-cols-4 gap-12 w-full max-w-4xl relative z-10 mt-12">
            {holes.map(h => (
              <div key={h.id} className="flex flex-col items-center space-y-4">
                <span className="text-[10px] font-bold opacity-60">{h.id}</span>
                
                {/* Hole Visual - All look OK in 3b */}
                <div 
                  onClick={() => handleHotspotClick(h.id)}
                  className={cn(
                    "w-20 h-20 border-2 flex items-center justify-center transition-all cursor-pointer relative group",
                    viewed[h.id] ? "border-industrial-fg bg-industrial-fg/5" : "border-industrial-fg/30 hover:border-industrial-fg/60 animate-breathing"
                  )}
                >
                  <div className="relative w-12 h-12 border border-industrial-fg/20 rounded-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <ChevronRight size={10} className="-rotate-90 text-industrial-fg" />
                      <div className="w-px h-6 bg-industrial-fg"></div>
                      <span className="text-[8px] font-bold mt-1">A+</span>
                    </div>
                  </div>

                  {/* Hover Label */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-industrial-fg text-white text-[8px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    点击查看检测结果
                  </div>
                </div>

                <span className="text-[10px] font-medium opacity-80 text-center h-8 flex items-center">
                  {completed[h.id] ? "已完成" : viewed[h.id] ? "待判定" : "待检测"}
                </span>

                {/* Markers */}
                <div className="flex items-center space-x-2">
                  {viewed[h.id] && !completed[h.id] ? (
                    <button 
                      onClick={() => setShowQuestionModal(h.id)}
                      className="flex items-center space-x-1 text-industrial-fg animate-breathing"
                    >
                      <span className="text-lg font-bold">[?]</span>
                      <span className="text-[10px] uppercase tracking-wider">通槽判定</span>
                    </button>
                  ) : completed[h.id] ? (
                    <button 
                      onClick={() => setShowQuestionModal(h.id)}
                      className="flex items-center space-x-1 text-green-600"
                    >
                      <span className="text-lg font-bold">[v]</span>
                      <span className="text-[10px] uppercase tracking-wider">判定完成</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Background Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
      </TechnicalCard>

      {/* Description Modal */}
      <Modal 
        isOpen={!!showDescModal} 
        onClose={() => setShowDescModal(null)}
        title={`${showDescModal} 通槽检测结果`}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Probe Diagram */}
          <div className="w-full md:w-1/2 aspect-[3/4] bg-industrial-bg/5 border border-industrial-fg/10 flex flex-col items-center p-6 relative">
            <span className="absolute top-4 left-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">探头下放示意</span>
            
            <div className="flex-1 w-full flex items-start justify-center pt-8">
              <div className="relative h-full w-12 border-x-2 border-industrial-fg/20 bg-white flex flex-col">
                {/* Depth Markers */}
                {[0, 5, 10, 15, 20].map(d => (
                  <div key={d} className="absolute w-full border-t border-industrial-fg/10 flex items-center" style={{ top: `${(d / 20) * 100}%` }}>
                    <span className="absolute -right-8 text-[10px] font-mono">{d}m</span>
                  </div>
                ))}

                {/* Probe Path */}
                {showDescModal && (
                  <motion.div 
                    initial={{ y: 0 }}
                    animate={{ y: `${(holes.find(h => h.id === showDescModal)!.diagram.stopDepth / 20) * 100}%` }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-full w-8 flex flex-col items-center"
                  >
                    <div className="w-px h-24 border-l border-dashed border-industrial-fg/40"></div>
                    <div className="w-6 h-10 bg-industrial-fg rounded-b-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Status Marker at stop point */}
                    <div className="absolute top-full mt-2 whitespace-nowrap">
                      {holes.find(h => h.id === showDescModal)!.diagram.status === 'success' && (
                        <span className="text-[10px] font-bold text-green-600">✓ 到底</span>
                      )}
                      {holes.find(h => h.id === showDescModal)!.diagram.status === 'error' && (
                        <span className="text-[10px] font-bold text-red-600">✖ 受阻</span>
                      )}
                      {holes.find(h => h.id === showDescModal)!.diagram.status === 'warning' && (
                        <span className="text-[10px] font-bold text-industrial-warning">↓↓ 阻力偏大</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="opacity-40 uppercase tracking-wider block">孔号</span>
                <span className="font-bold">{showDescModal}</span>
              </div>
              <div>
                <span className="opacity-40 uppercase tracking-wider block">孔深</span>
                <span className="font-bold">{holes.find(h => h.id === showDescModal)?.depth}</span>
              </div>
              <div className="col-span-2">
                <span className="opacity-40 uppercase tracking-wider block">管口验收</span>
                <span className="font-bold">{holes.find(h => h.id === showDescModal)?.prevStatus}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-industrial-fg/10">
              <span className="opacity-40 uppercase tracking-wider block text-[11px] mb-2">检测过程</span>
              <p className="text-xs leading-relaxed opacity-80 whitespace-pre-line">
                {holes.find(h => h.id === showDescModal)?.desc}
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button onClick={confirmDesc} className="flex-1">确认</Button>
              <Button variant="secondary" onClick={() => setShowDescModal(null)} className="flex-1">取消</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <Modal 
            isOpen={true} 
            onClose={() => setShowQuestionModal(null)} 
            title={`${showQuestionModal} 通槽复测判定`}
          >
            <div className="space-y-6">
              <p className="text-xs font-bold">该孔通槽复测结论如何？应如何处理？</p>
              <div className="space-y-2">
                {holes.find(h => h.id === showQuestionModal)?.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleQuestionSubmit(showQuestionModal!, opt.id)}
                    className={cn(
                      "w-full text-left p-3 text-xs border transition-all flex items-start space-x-3",
                      answers[showQuestionModal!] === opt.id 
                        ? "border-industrial-fg bg-industrial-fg text-white" 
                        : "border-industrial-fg/20 hover:border-industrial-fg"
                    )}
                  >
                    <span className="font-bold mt-0.5">{opt.id}.</span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export const InitialMeasurement: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [viewed, setViewed] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const hotspots = [
    {
      id: 'condition',
      title: '📋 测量条件',
      summary: [
        '测孔编号：CX-03-06',
        '测量日期：2026-03-15',
        '工程状态：围护结构完成',
        '开挖状态：尚未开挖'
      ],
      details: {
        sections: [
          {
            title: '■ 工程进度',
            content: '基坑围护结构（地下连续墙）已浇筑完成，混凝土养护已满14天。冠梁施工完成，测斜管已预埋并通过通槽检测。第一道混凝土支撑尚未施工。'
          },
          {
            title: '■ 开挖状态',
            content: '基坑尚未开始土方开挖。项目部计划3天后正式开挖。周边建筑物沉降监测点已布设完成。'
          },
          {
            title: '■ 现场条件',
            content: '近一周无大面积降雨，地下水位稳定。场地周边无打桩、爆破等大型振动源施工。测量当日天气晴朗，气温18°C。'
          }
        ]
      },
      question: {
        id: '1-4-1',
        title: '初测时机判断',
        text: '根据当前测量条件，以下说法正确的是？',
        options: [
          { id: 'A', text: '应立即测量，这是开挖前最后的窗口期，测完即可开挖' },
          { id: 'B', text: '应在开挖前完成初测，且至少连续测量2~3次确认数据稳定后方可作为基准' },
          { id: 'C', text: '应等第一层土方开挖后再测，开挖前围护结构无变形，测了也是零值无意义' },
          { id: 'D', text: '混凝土养护仅14天未达28天设计强度，此时测量数据不可靠，应等强度达标后再测' }
        ],
        correct: 'B'
      }
    },
    {
      id: 'data',
      title: '📊 测量数据',
      summary: [
        '孔深：20.0m',
        '测段长：0.5m',
        '测量次数：1次'
      ],
      table: [
        { depth: '0.5', a: '+0.023', b: '-0.015' },
        { depth: '1.0', a: '+0.045', b: '-0.032' },
        { depth: '...', a: '...', b: '...' },
        { depth: '20.0', a: '+0.012', b: '-0.008' }
      ],
      footer: '正反测差值：部分测段差值 > 0.5mm',
      details: {
        sections: [
          {
            title: '■ 测量参数',
            content: '测孔编号：CX-03-06，孔深：20.0m，测段长：0.5m，共40个测段。测量方法：A向+B向正测，测量次数：仅测量1次。'
          },
          {
            title: '■ 数据概况',
            content: 'A向读数范围：+0.012 ~ +0.089；B向读数范围：-0.008 ~ -0.067。各测段读数总体平稳，无突变或跳跃值。'
          },
          {
            title: '■ 正反测信息',
            content: '本次仅完成正测（A→B方向），未进行反测（B→A方向）。无法计算正反测差值，无法校验数据重复性。'
          }
        ]
      },
      question: {
        id: '1-4-2',
        title: '基准数据有效性判断',
        text: '根据测量数据概况，该数据能否作为后续监测的基准？',
        options: [
          { id: 'A', text: '可以，数据平稳无突变，满足基准要求' },
          { id: 'B', text: '不可以，仅测量1次且未做正反测，无法验证数据重复性和探头标定，应补做正反测并至少再测1~2次' },
          { id: 'C', text: '不可以，A向和B向读数符号相反说明探头方向装反，数据全部作废需重新测量' },
          { id: 'D', text: '可以，正反测只是精度加分项并非必须，1次测量数据平稳即可作为基准' }
        ],
        correct: 'B'
      }
    }
  ];

  const handleConfirmDetail = (id: string) => {
    if (!viewed.includes(id)) {
      setViewed(prev => [...prev, id]);
    }
    setActiveModal(null);
  };

  const handleAnswer = (hotspotId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [hotspotId]: optionId }));
    if (!completed.includes(hotspotId)) {
      setCompleted(prev => [...prev, hotspotId]);
    }
    setActiveQuestion(null);
  };

  const allCompleted = completed.length === hotspots.length;

  const handleSubmit = () => {
    const finalAnswers = hotspots.map(h => {
      const userAnswer = answers[h.id];
      const isCorrect = userAnswer === h.question.correct;
      return {
        questionId: h.question.id,
        type: 'choice',
        label: h.question.title,
        userAnswer,
        correctAnswer: h.question.correct,
        score: isCorrect ? 2 : 0,
        maxScore: 2
      };
    });

    onNext({
      stepId: 'step4',
      stepName: '初测（基准测量）',
      submittedAt: new Date().toISOString(),
      answers: finalAnswers,
      totalScore: finalAnswers.reduce((acc, curr) => acc + curr.score, 0),
      maxScore: 4
    });
  };

  useEffect(() => {
    if (allCompleted) {
      handleSubmit();
    }
  }, [completed]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotspots.map((h) => (
          <div key={h.id} className="relative group">
            <TechnicalCard 
              title={h.title}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:border-industrial-info",
                viewed.includes(h.id) ? "border-green-500/50" : "border-industrial-fg/20"
              )}
              headerAction={
                <div className="flex items-center space-x-2">
                  {viewed.includes(h.id) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQuestion(h.id);
                      }}
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold border transition-colors",
                        completed.includes(h.id) 
                          ? "bg-green-500 text-white border-green-600" 
                          : "bg-industrial-info text-white border-industrial-info/80 animate-pulse"
                      )}
                    >
                      {completed.includes(h.id) ? '[v] 已判定' : '[?] 待判定'}
                    </button>
                  )}
                  <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              }
            >
              <div onClick={() => setActiveModal(h.id)} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {h.summary.map((s, i) => (
                    <div key={i} className="text-[11px] opacity-70 font-mono">{s}</div>
                  ))}
                </div>

                {h.table && (
                  <div className="mt-4 border border-industrial-fg/10">
                    <table className="w-full text-[10px] font-mono">
                      <thead>
                        <tr className="bg-industrial-bg/10 border-b border-industrial-fg/10">
                          <th className="p-1 text-left">深度(m)</th>
                          <th className="p-1 text-left">A向读数</th>
                          <th className="p-1 text-left">B向读数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {h.table.map((row, i) => (
                          <tr key={i} className="border-b border-industrial-fg/5">
                            <td className="p-1">{row.depth}</td>
                            <td className="p-1">{row.a}</td>
                            <td className="p-1">{row.b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {h.footer && (
                      <div className="p-1 text-[9px] italic opacity-60 bg-industrial-bg/5">{h.footer}</div>
                    )}
                  </div>
                )}
              </div>
            </TechnicalCard>
          </div>
        ))}
      </div>

      {/* Description Modals */}
      <AnimatePresence>
        {activeModal && (
          <Modal 
            isOpen={!!activeModal} 
            onClose={() => setActiveModal(null)}
            title={hotspots.find(h => h.id === activeModal)?.title + " 详情"}
          >
            <div className="space-y-6">
              {hotspots.find(h => h.id === activeModal)?.details.sections.map((s, i) => (
                <div key={i}>
                  <h4 className="text-xs font-bold border-b border-industrial-fg/10 pb-1 mb-2">{s.title}</h4>
                  <p className="text-[11px] leading-relaxed opacity-80">{s.content}</p>
                </div>
              ))}
              <div className="flex space-x-3 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => handleConfirmDetail(activeModal)}
                >
                  确认
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => setActiveModal(null)}
                >
                  取消
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Question Modals */}
      <AnimatePresence>
        {activeQuestion && (
          <Modal
            isOpen={!!activeQuestion}
            onClose={() => setActiveQuestion(null)}
            title={hotspots.find(h => h.id === activeQuestion)?.question.title}
          >
            <div className="space-y-4">
              <p className="text-xs font-medium leading-relaxed">
                {hotspots.find(h => h.id === activeQuestion)?.question.text}
              </p>
              <div className="space-y-2">
                {hotspots.find(h => h.id === activeQuestion)?.question.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(activeQuestion, opt.id)}
                    className={cn(
                      "w-full text-left p-3 text-[11px] border transition-all flex items-start space-x-3 group",
                      answers[activeQuestion] === opt.id
                        ? "bg-industrial-fg text-industrial-bg border-industrial-fg"
                        : "hover:bg-industrial-bg border-industrial-fg/10"
                    )}
                  >
                    <span className="font-bold mt-0.5">{opt.id}.</span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
