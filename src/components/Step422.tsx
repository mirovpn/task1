import React, { useState, useEffect } from 'react';
import { TechnicalCard, Button, Modal } from './Common';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Shield, Cloud, Gauge, CheckCircle2, AlertCircle, User } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  desc: string;
  image: string;
  layerImage?: string;
  isCorrect: boolean;
  details?: Record<string, string>;
}

interface Weather {
  id: string;
  name: string;
  desc: string;
  image: string;
  bgImage: string;
  isCorrect: boolean;
  details: Record<string, string>;
}

export const PrepAndSafety: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [selectedSafety, setSelectedSafety] = useState<string[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  
  const [activeModal, setActiveModal] = useState<{ type: 'weather' | 'safety' | 'instrument'; id: string } | null>(null);
  const [browseHistory, setBrowseHistory] = useState<{ weather: string[]; safety: string[]; instrument: string[] }>({
    weather: [],
    safety: [],
    instrument: []
  });

  const weatherOptions: Weather[] = [
    {
      id: 'A',
      name: '多云微风',
      desc: '适宜测量。天气多云，气温18°C，风力2级。',
      image: 'https://picsum.photos/seed/weather-a/200/150',
      bgImage: 'https://picsum.photos/seed/bg-a/800/600?blur=2',
      isCorrect: true,
      details: { '天气': '多云', '气温': '18°C', '湿度': '65%', '风力': '2级（东南风）', '降水': '无' }
    },
    {
      id: 'B',
      name: '暴雨强风',
      desc: '应暂停。持续大雨，风力5级。',
      image: 'https://picsum.photos/seed/weather-b/200/150',
      bgImage: 'https://picsum.photos/seed/bg-b/800/600?grayscale',
      isCorrect: false,
      details: { '天气': '暴雨', '气温': '15°C', '湿度': '95%', '风力': '5级', '降水': '持续大雨' }
    },
    {
      id: 'C',
      name: '6级大风',
      desc: '应暂停。风力6级，地面扬尘。',
      image: 'https://picsum.photos/seed/weather-c/200/150',
      bgImage: 'https://picsum.photos/seed/bg-c/800/600?sepia',
      isCorrect: false,
      details: { '天气': '晴', '气温': '22°C', '湿度': '40%', '风力': '6级', '降水': '无' }
    },
    {
      id: 'D',
      name: '大雾低能见',
      desc: '安全风险。浓雾弥漫，能见度极低。',
      image: 'https://picsum.photos/seed/weather-d/200/150',
      bgImage: 'https://picsum.photos/seed/bg-d/800/600?blur=8',
      isCorrect: false,
      details: { '天气': '大雾', '气温': '12°C', '湿度': '98%', '风力': '1级', '降水': '无' }
    }
  ];

  const safetyOptions: Equipment[] = [
    {
      id: '1',
      name: '安全帽',
      desc: '建筑施工现场头部防护装备，防止物体打击和坠落伤害。',
      image: 'https://picsum.photos/seed/safety-1/200/150',
      layerImage: 'https://img.icons8.com/color/200/hard-hat.png',
      isCorrect: true,
      details: { '标准': 'GB 2811-2019' }
    },
    {
      id: '2',
      name: '反光背心',
      desc: '高可视性警示服，使穿着者在施工现场更易被识别。',
      image: 'https://picsum.photos/seed/safety-2/200/150',
      layerImage: 'https://img.icons8.com/color/200/safety-vest.png',
      isCorrect: true,
      details: { '标准': 'GB 20653-2006' }
    },
    {
      id: '3',
      name: '防毒面具',
      desc: '呼吸防护装备，用于过滤有毒有害气体和粉尘。',
      image: 'https://picsum.photos/seed/safety-3/200/150',
      layerImage: 'https://img.icons8.com/color/200/gas-mask.png',
      isCorrect: false,
      details: { '标准': 'GB 2890-2009' }
    },
    {
      id: '4',
      name: '护目镜',
      desc: '眼部防护装备，防止飞溅物、粉尘对眼睛造成伤害。',
      image: 'https://picsum.photos/seed/safety-4/200/150',
      layerImage: 'https://img.icons8.com/color/200/safety-glasses.png',
      isCorrect: false,
      details: { '标准': 'GB 14866-2006' }
    }
  ];

  const instrumentOptions: Equipment[] = [
    {
      id: 'A',
      name: '滑动式测斜仪',
      desc: '利用重力加速度传感器测量管内各深度点倾斜角，逐点推算水平位移累积量。',
      image: 'https://picsum.photos/seed/inst-a/200/150',
      layerImage: 'https://img.icons8.com/color/200/measuring-tape.png', // Placeholder for instrument
      isCorrect: true,
      details: { '类型': '手持测量仪器', '精度': '±0.02mm/500mm', '量程': '0°~53°' }
    },
    {
      id: 'B',
      name: '固定式测斜仪',
      desc: '多个传感器固定安装在测斜管内不同深度，通过数据线实时传输各点倾斜角变化。',
      image: 'https://picsum.photos/seed/inst-b/200/150',
      layerImage: 'https://img.icons8.com/color/200/sensor.png',
      isCorrect: false,
      details: { '类型': '固定安装传感器', '精度': '±0.01mm/500mm', '量程': '0°~30°' }
    },
    {
      id: 'C',
      name: '静力水准仪',
      desc: '基于连通器原理，通过液面高度差测量各监测点的竖向沉降量。',
      image: 'https://picsum.photos/seed/inst-c/200/150',
      layerImage: 'https://img.icons8.com/color/200/level.png',
      isCorrect: false,
      details: { '类型': '固定安装传感器', '精度': '±0.05mm', '量程': '±50mm' }
    },
    {
      id: 'D',
      name: '收敛计',
      desc: '测量两点之间的距离变化，获取断面收敛变形量。',
      image: 'https://picsum.photos/seed/inst-d/200/150',
      layerImage: 'https://img.icons8.com/color/200/ruler.png',
      isCorrect: false,
      details: { '类型': '手持测量仪器', '精度': '±0.1mm', '量程': '0~30m' }
    }
  ];

  const handleCardClick = (type: 'weather' | 'safety' | 'instrument', id: string) => {
    setActiveModal({ type, id });
    setBrowseHistory(prev => ({
      ...prev,
      [type]: [...prev[type], id]
    }));
  };

  const handleEquip = () => {
    if (!activeModal) return;
    const { type, id } = activeModal;
    if (type === 'weather') {
      setSelectedWeather(id);
    } else if (type === 'safety') {
      setSelectedSafety(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else if (type === 'instrument') {
      setSelectedInstrument(id);
    }
    setActiveModal(null);
  };

  const handleSubmit = () => {
    const scoreInstrument = selectedInstrument === 'A' ? 2 : 0;
    const isSafetyCorrect = selectedSafety.length === 2 && 
                           selectedSafety.includes('1') && 
                           selectedSafety.includes('2');
    const scoreSafety = isSafetyCorrect ? 2 : 0;

    const weatherData = weatherOptions.find(w => w.id === selectedWeather);

    onNext({
      stepId: '4.2.2-1',
      stepName: '测前准备 — 装备选择',
      submittedAt: new Date().toISOString(),
      totalScore: scoreInstrument + scoreSafety,
      maxScore: 4,
      answers: [
        {
          questionId: '2-1-1',
          type: 'equipment',
          label: '测量仪器',
          userAnswer: instrumentOptions.find(i => i.id === selectedInstrument)?.name || '未选',
          correctAnswer: '滑动式测斜仪',
          score: scoreInstrument,
          maxScore: 2
        },
        {
          questionId: '2-1-2',
          type: 'equipment-multi',
          label: '安全防护',
          userAnswer: selectedSafety.map(id => safetyOptions.find(s => s.id === id)?.name),
          correctAnswer: ['安全帽', '反光背心'],
          score: scoreSafety,
          maxScore: 2
        }
      ],
      weatherCheck: {
        userAnswer: selectedWeather,
        userLabel: weatherData?.name,
        correctAnswer: 'A',
        correctLabel: '多云微风'
      },
      browseHistory,
    });
  };

  const canDepart = selectedWeather !== null && selectedSafety.length > 0 && selectedInstrument !== null;

  const activeOption = activeModal ? (
    activeModal.type === 'weather' ? weatherOptions.find(o => o.id === activeModal.id) :
    activeModal.type === 'safety' ? safetyOptions.find(o => o.id === activeModal.id) :
    instrumentOptions.find(o => o.id === activeModal.id)
  ) : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
        {/* Left: Character Preview */}
        <div className="relative border-2 border-industrial-fg bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          {/* Background Layer */}
          <div 
            className="absolute inset-0 transition-all duration-700 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: selectedWeather ? `url(${weatherOptions.find(w => w.id === selectedWeather)?.bgImage})` : 'none',
              backgroundColor: !selectedWeather ? '#f3f4f6' : 'transparent'
            }}
          />
          
          {/* Character Container */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-full h-full max-w-[400px] flex items-center justify-center">
              {/* Base Character */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <User size={320} className="text-industrial-fg/20" strokeWidth={0.5} />
                {/* In a real app, this would be <img src="char_base.png" ... /> */}
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] opacity-20 uppercase tracking-widest">
                  [ 监测人员立绘底图 ]
                </div>
              </div>

              {/* Safety Layers */}
              {selectedSafety.map(id => {
                const opt = safetyOptions.find(s => s.id === id);
                return (
                  <motion.img
                    key={id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={opt?.layerImage}
                    alt={opt?.name}
                    className="absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                );
              })}

              {/* Instrument Layer */}
              {selectedInstrument && (
                <motion.img
                  key={selectedInstrument}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  src={instrumentOptions.find(i => i.id === selectedInstrument)?.layerImage}
                  className="absolute inset-0 z-30 w-full h-full object-contain pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-40">
            <div className="bg-white/80 backdrop-blur-sm border border-industrial-fg p-2 text-[10px] font-mono">
              <div className="flex items-center space-x-2">
                <Cloud size={12} />
                <span>环境: {selectedWeather ? weatherOptions.find(w => w.id === selectedWeather)?.name : '未确认'}</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-industrial-fg p-2 text-[10px] font-mono text-right">
              <div>装备: {selectedSafety.length} 项</div>
              <div>仪器: {selectedInstrument ? instrumentOptions.find(i => i.id === selectedInstrument)?.name : '未装备'}</div>
            </div>
          </div>
        </div>

        {/* Right: Checklist */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Environment */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-industrial-fg pb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center">
                <Cloud size={14} className="mr-2" /> 环境确认 <span className="ml-2 text-[10px] opacity-50 font-normal">[单选]</span>
              </h3>
              {selectedWeather && <span className="text-[10px] text-green-600 font-bold">已确认: {weatherOptions.find(w => w.id === selectedWeather)?.name}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {weatherOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleCardClick('weather', opt.id)}
                  className={cn(
                    "group relative p-2 border-2 transition-all text-left",
                    selectedWeather === opt.id 
                      ? "border-green-500 bg-green-50 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)]" 
                      : "border-industrial-fg/20 hover:border-industrial-fg bg-white"
                  )}
                >
                  <div className="aspect-video bg-gray-100 mb-2 overflow-hidden">
                    <img src={opt.image} alt={opt.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-[10px] font-bold uppercase">{opt.name}</div>
                  {selectedWeather === opt.id && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Safety */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-industrial-fg pb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center">
                <Shield size={14} className="mr-2" /> 安全防护 <span className="ml-2 text-[10px] opacity-50 font-normal">[多选]</span>
              </h3>
              {selectedSafety.length > 0 && <span className="text-[10px] text-green-600 font-bold">已选: {selectedSafety.length} 项</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {safetyOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleCardClick('safety', opt.id)}
                  className={cn(
                    "group relative p-2 border-2 transition-all text-left",
                    selectedSafety.includes(opt.id)
                      ? "border-green-500 bg-green-50 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)]" 
                      : "border-industrial-fg/20 hover:border-industrial-fg bg-white"
                  )}
                >
                  <div className="aspect-video bg-gray-100 mb-2 overflow-hidden">
                    <img src={opt.image} alt={opt.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-[10px] font-bold uppercase">{opt.name}</div>
                  {selectedSafety.includes(opt.id) && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Instruments */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-industrial-fg pb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center">
                <Gauge size={14} className="mr-2" /> 测量仪器 <span className="ml-2 text-[10px] opacity-50 font-normal">[单选]</span>
              </h3>
              {selectedInstrument && <span className="text-[10px] text-green-600 font-bold">已装备: {instrumentOptions.find(i => i.id === selectedInstrument)?.name}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {instrumentOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleCardClick('instrument', opt.id)}
                  className={cn(
                    "group relative p-2 border-2 transition-all text-left",
                    selectedInstrument === opt.id 
                      ? "border-green-500 bg-green-50 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)]" 
                      : "border-industrial-fg/20 hover:border-industrial-fg bg-white"
                  )}
                >
                  <div className="aspect-video bg-gray-100 mb-2 overflow-hidden">
                    <img src={opt.image} alt={opt.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-[10px] font-bold uppercase">{opt.name}</div>
                  {selectedInstrument === opt.id && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex justify-end pt-4 border-t border-industrial-fg/10">
        <Button 
          disabled={!canDepart}
          onClick={handleSubmit}
          className="px-12 py-6 text-sm font-bold uppercase tracking-[0.2em]"
        >
          出发 →
        </Button>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeOption?.name || ''}
      >
        {activeOption && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-video bg-gray-100 border border-industrial-fg overflow-hidden">
                <img src={activeOption.image} alt={activeOption.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="space-y-2">
                  {Object.entries(activeOption.details || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-[11px] border-b border-industrial-fg/10 pb-1">
                      <span className="opacity-50">{key}:</span>
                      <span className="font-bold">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs leading-relaxed opacity-80">
                  {activeOption.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button 
                onClick={handleEquip}
                className="w-full"
              >
                {activeModal?.type === 'weather' ? '确认环境' : 
                 (activeModal?.type === 'safety' && selectedSafety.includes(activeModal.id) ? '卸下装备' : '装备')}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setActiveModal(null)}
                className="w-full"
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const InstrumentSetting: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
  // --- State: Device & Connection ---
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showCableModal, setShowCableModal] = useState(false);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);

  // --- State: LCD Navigation ---
  const [lcdScreen, setLcdScreen] = useState<'main' | 'params' | 'probe' | 'collect' | 're-measure' | 'off'>('off');
  const [cursorIndex, setCursorIndex] = useState(0);
  const [paramEditIndex, setParamEditIndex] = useState<number | null>(null);

  // --- State: Parameters & Settings ---
  const [params, setParams] = useState({
    area: '01',
    hole: '01',
    depth: 25,
    spacing: 1.0
  });
  const [settings, setSettings] = useState({
    mode: 'up' as 'up' | 'down',
    orientation: null as 'A+' | 'A-' | null
  });
  const [alignment, setAlignment] = useState<'N' | 'S' | 'E' | 'W' | null>(null);

  // --- State: Measurement Process ---
  const [phase, setPhase] = useState(1); // 1-7
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementType, setMeasurementType] = useState<'positive' | 'reverse' | 're-measure' | null>(null);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [collectProgress, setCollectProgress] = useState(0);
  const [collectTimeLeft, setCollectTimeLeft] = useState(0);
  const [collectStatus, setCollectStatus] = useState('');
  const [readings, setReadings] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryChecks, setSummaryChecks] = useState({ lift: false, disconnect: false, powerOff: false });

  // --- State: Scoring ---
  const [scores, setScores] = useState<Record<string, number>>({});

  // --- Constants ---
  const cableOptions = [
    { id: 'A', name: '5针圆形插头线', desc: '5针圆形航空插头，适配滑动式测斜仪探头接口。', image: 'https://picsum.photos/seed/cable-a/200/150', isCorrect: true },
    { id: 'B', name: '3针圆形插头线', desc: '3针圆形航空插头，适配固定式传感器串联接口。', image: 'https://picsum.photos/seed/cable-b/200/150', isCorrect: false },
    { id: 'C', name: '7针矩形插头线', desc: '7针矩形接口，适配水位计数据传输。', image: 'https://picsum.photos/seed/cable-c/200/150', isCorrect: false },
    { id: 'D', name: '9针D-sub插头线', desc: '9针D-sub串口线，适配PC数据导出。', image: 'https://picsum.photos/seed/cable-d/200/150', isCorrect: false },
  ];

  const menuItems = ['1. 开始新的测量', '2. 测孔参数设置', '3. 探头设置', '4. 补测数据点', '5. 时间设置'];

  // --- Effects ---
  useEffect(() => {
    if (isPoweredOn && isConnected && phase === 1) {
      setPhase(2);
      setLcdScreen('main');
    }
  }, [isPoweredOn, isConnected, phase]);

  // --- Handlers: Device Buttons ---
  const handlePower = () => {
    if (!isPoweredOn) {
      setIsPoweredOn(true);
      if (isConnected) {
        setLcdScreen('main');
        setPhase(Math.max(phase, 2));
      } else {
        setLcdScreen('off'); // Still off content but "powered"
      }
    } else {
      setIsPoweredOn(false);
      setLcdScreen('off');
    }
  };

  const handleNav = (dir: 'up' | 'down' | 'ok' | 'back') => {
    if (!isPoweredOn || !isConnected) return;

    if (lcdScreen === 'main') {
      if (dir === 'up') setCursorIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
      if (dir === 'down') setCursorIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
      if (dir === 'ok') {
        if (cursorIndex === 0) {
          // Start measurement
          if (phase >= 3) {
            setLcdScreen('collect');
            startMeasurement();
          }
        } else if (cursorIndex === 1) {
          setLcdScreen('params');
          setCursorIndex(0);
        } else if (cursorIndex === 2) {
          setLcdScreen('probe');
          setCursorIndex(0);
        } else if (cursorIndex === 3) {
          if (phase === 6) {
            setLcdScreen('re-measure');
          }
        }
      }
    } else if (lcdScreen === 'params') {
      if (dir === 'back') setLcdScreen('main');
      if (dir === 'up') setCursorIndex(prev => (prev > 0 ? prev - 1 : 4)); // 4 is "Save"
      if (dir === 'down') setCursorIndex(prev => (prev < 4 ? prev + 1 : 0));
      if (dir === 'ok') {
        if (cursorIndex === 4) {
          // Save and return
          const s = { ...scores };
          if (params.area === '03') s['2-2-2'] = 1;
          if (params.hole === '06') s['2-2-3'] = 1;
          if (params.depth === 20) s['2-2-4'] = 1;
          if (params.spacing === 0.5) s['2-2-5'] = 1;
          setScores(s);
          setLcdScreen('main');
          if (phase === 2) setPhase(3);
        } else {
          // Toggle edit mode for params
          setParamEditIndex(cursorIndex === paramEditIndex ? null : cursorIndex);
        }
      }
      // Value adjustment logic would go here if needed, simplified for now
    } else if (lcdScreen === 'probe') {
      if (dir === 'back') setLcdScreen('main');
      if (dir === 'up') setCursorIndex(prev => (prev > 0 ? prev - 1 : 2));
      if (dir === 'down') setCursorIndex(prev => (prev < 2 ? prev + 1 : 0));
      if (dir === 'ok') {
        if (cursorIndex === 2) {
          // Save
          const s = { ...scores };
          if (settings.mode === 'up') s['2-2-6'] = 1;
          if (settings.orientation === 'A+') s['2-2-7'] = 1;
          setScores(s);
          setLcdScreen('main');
          if (phase === 3) setPhase(4);
        } else if (cursorIndex === 0) {
          setSettings(prev => ({ ...prev, mode: prev.mode === 'up' ? 'down' : 'up' }));
        } else if (cursorIndex === 1) {
          setSettings(prev => ({ ...prev, orientation: prev.orientation === 'A+' ? 'A-' : 'A+' }));
        }
      }
    } else if (lcdScreen === 'collect') {
      if (dir === 'back' && !isMeasuring) setLcdScreen('main');
    } else if (lcdScreen === 're-measure') {
      if (dir === 'back') setLcdScreen('main');
      if (dir === 'ok') {
        startMeasurement('re-measure');
      }
    }
  };

  // --- Handlers: Measurement Logic ---
  const startMeasurement = (typeOverride?: 're-measure') => {
    const type = typeOverride || (phase === 4 ? 'positive' : 'reverse');
    setMeasurementType(type);
    setIsMeasuring(true);
    setCurrentDepth(0);
    setCollectProgress(0);
    
    // Scoring for orientation and alignment
    const s = { ...scores };
    if (type === 'positive') {
      if (alignment === 'N') s['2-3-1'] = 1;
      if (settings.orientation === 'A+') s['2-3-2'] = 1;
    } else if (type === 'reverse') {
      if (alignment === 'S') s['2-4-1'] = 1;
      if (settings.orientation === 'A-') s['2-4-2'] = 1;
    }
    setScores(s);

    if (type === 're-measure') {
      // Only re-measure at 12.5m
      setCurrentDepth(12.5);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setCollectProgress(progress);
        setCollectStatus('正在补测 12.5m...');
        
        if (progress >= 100) {
          clearInterval(interval);
          
          setReadings(prev => {
            const updated = [...prev];
            const index = updated.findIndex(r => r.depth === 12.5);
            if (index !== -1) {
              const posA = updated[index].posA || 0;
              const posB = updated[index].posB || 0;
              const negA = -posA + (Math.random() * 2 - 1);
              const negB = -posB + (Math.random() * 2 - 1);
              const checksum = Math.abs((posA + negA) - (posB + negB));
              
              updated[index] = {
                ...updated[index],
                negA,
                negB,
                checksum: Math.round(checksum)
              };
            }
            return updated;
          });
          
          setCollectStatus('补测完成');
          setTimeout(() => {
            setIsMeasuring(false);
            finishStep('re-measure');
          }, 1000);
        }
      }, 200);
      return;
    }

    let step = 0;
    const totalSteps = 41; // 0 to 20m with 0.5m interval
    
    const interval = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(interval);
        setIsMeasuring(false);
        finishStep(type);
        return;
      }

      const depth = step * 0.5;
      setCurrentDepth(depth);

      // Simulation of wait times
      if (step === 0) {
        setCollectStatus('⏳ 探头稳定中...');
        // In real time this is 60s, but for UX we speed it up slightly or just show progress
        setCollectProgress(prev => Math.min(prev + 5, 100));
        if (collectProgress < 100) return;
      } else if (step <= 4) {
        setCollectStatus('采集数据中...');
        setCollectProgress(prev => Math.min(prev + 20, 100));
        if (collectProgress < 100) return;
      } else {
        setCollectStatus('快速采集...');
        setCollectProgress(100);
      }

      // Record data
      const newReading = {
        depth,
        posA: Math.random() * 10,
        posB: Math.random() * 5,
        negA: Math.random() * 10,
        negB: Math.random() * 5,
        checksum: depth === 12.5 && type === 'reverse' ? 847 : Math.floor(Math.random() * 40)
      };

      setReadings(prev => {
        const existing = prev.findIndex(r => r.depth === depth);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], ...newReading };
          return updated;
        }
        return [...prev, newReading];
      });

      step++;
      setCollectProgress(0);
    }, 100); // Speeded up for demo
  };

  const finishStep = (type: string) => {
    const s = { ...scores };
    if (type === 'positive') {
      s['2-3-3'] = 2; // 正测稳定后读数
      setPhase(5);
    } else if (type === 'reverse') {
      s['2-4-3'] = 2; // 反测稳定后读数
      setPhase(6);
    } else if (type === 're-measure') {
      s['2-5-1'] = 3; // 发现异常并补测
      setPhase(7);
      setShowSummary(true);
    }
    setScores(s);
    setLcdScreen('main');
  };

  const handleFinalSubmit = () => {
    const finalScores = { ...scores };
    if (summaryChecks.lift) finalScores['2-6-1'] = 1;
    if (summaryChecks.disconnect) finalScores['2-6-2'] = 1;
    if (summaryChecks.powerOff) finalScores['2-6-3'] = 1;
    
    const totalScore = Object.values(finalScores).reduce((a: number, b: number) => a + b, 0);
    onNext({
      stepId: '4.2.2-2',
      stepName: '读数仪设置与数据采集',
      submittedAt: new Date().toISOString(),
      scores: finalScores,
      totalScore,
      maxScore: 21,
      readings
    });
  };

  // --- Sub-components ---
  const LCDContent = () => {
    if (!isPoweredOn) return <div className="w-full h-full bg-black" />;
    if (!isConnected) return (
      <div className="w-full h-full bg-[#9da832] p-2 font-mono text-[10px] flex items-center justify-center text-center">
        CX-READER V3.2<br/>请连接线材...
      </div>
    );

    switch (lcdScreen) {
      case 'main':
        return (
          <div className="w-full h-full bg-[#9da832] p-1 font-mono text-[10px] flex flex-col">
            <div className="border-b border-black/20 pb-0.5 mb-1 flex justify-between">
              <span>CX-READER V3.2</span>
              <span>{params.hole}</span>
            </div>
            <div className="flex-1 space-y-0.5">
              {menuItems.map((item, i) => (
                <div key={i} className={cn("px-1", cursorIndex === i && "bg-black text-[#9da832]")}>
                  {cursorIndex === i ? '> ' : '  '}{item}
                </div>
              ))}
            </div>
            <div className="border-t border-black/20 pt-0.5 mt-1 text-[7px] flex flex-col space-y-0.5">
              <div className="flex justify-between">
                <span>🔋 82%</span>
                <span>连接: 已连接 ● CX-{params.hole}</span>
              </div>
              <div className="flex justify-between opacity-70">
                <span>模式: {settings.mode === 'up' ? '向上' : '向下'}</span>
                <span>朝向: {settings.orientation || '--'}</span>
              </div>
            </div>
          </div>
        );
      case 'params':
        return (
          <div className="w-full h-full bg-[#9da832] p-1 font-mono text-[10px] flex flex-col">
            <div className="border-b border-black/20 pb-0.5 mb-1">测孔参数设置</div>
            <div className="flex-1 space-y-1">
              <div className={cn("px-1 flex justify-between", cursorIndex === 0 && "bg-black text-[#9da832]")}>
                <span>测区:</span>
                <select 
                  value={params.area} 
                  onChange={(e) => setParams(p => ({ ...p, area: e.target.value }))}
                  className="bg-transparent border-none outline-none text-right"
                >
                  {['01', '02', '03', '04', '05'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className={cn("px-1 flex justify-between", cursorIndex === 1 && "bg-black text-[#9da832]")}>
                <span>孔号:</span>
                <select 
                  value={params.hole} 
                  onChange={(e) => setParams(p => ({ ...p, hole: e.target.value }))}
                  className="bg-transparent border-none outline-none text-right"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className={cn("px-1 flex justify-between", cursorIndex === 2 && "bg-black text-[#9da832]")}>
                <span>孔深:</span>
                <input 
                  type="number" 
                  value={params.depth} 
                  onChange={(e) => setParams(p => ({ ...p, depth: Number(e.target.value) }))}
                  className="bg-transparent border-none outline-none text-right w-12"
                /> m
              </div>
              <div className={cn("px-1 flex justify-between", cursorIndex === 3 && "bg-black text-[#9da832]")}>
                <span>间距:</span>
                <input 
                  type="number" 
                  step="0.1"
                  value={params.spacing} 
                  onChange={(e) => setParams(p => ({ ...p, spacing: Number(e.target.value) }))}
                  className="bg-transparent border-none outline-none text-right w-12"
                /> m
              </div>
              <div className={cn("mt-2 px-1 text-center border border-black", cursorIndex === 4 && "bg-black text-[#9da832]")}>
                [保存并返回]
              </div>
            </div>
          </div>
        );
      case 'probe':
        return (
          <div className="w-full h-full bg-[#9da832] p-1 font-mono text-[10px] flex flex-col">
            <div className="border-b border-black/20 pb-0.5 mb-1">探头设置</div>
            <div className="flex-1 space-y-2">
              <div className={cn("px-1", cursorIndex === 0 && "bg-black text-[#9da832]")}>
                模式: {settings.mode === 'up' ? '(●) 向上' : '( ) 向上'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{settings.mode === 'down' ? '(●) 向下' : '( ) 向下'}
              </div>
              <div className={cn("px-1", cursorIndex === 1 && "bg-black text-[#9da832]")}>
                朝向: {settings.orientation === 'A+' ? '(●) A+朝上' : '( ) A+朝上'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{settings.orientation === 'A-' ? '(●) A-朝上' : '( ) A-朝上'}
              </div>
              <div className={cn("mt-1 px-1 text-center border border-black", cursorIndex === 2 && "bg-black text-[#9da832]")}>
                [保存并返回]
              </div>
            </div>
          </div>
        );
      case 'collect':
        return (
          <div className="w-full h-full bg-[#9da832] p-1 font-mono text-[10px] flex flex-col">
            <div className="border-b border-black/20 pb-0.5 mb-1 flex justify-between">
              <span>数据采集 — {measurementType === 'positive' ? '正测' : '反测'}</span>
              <span>{currentDepth.toFixed(1)}m</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
              <div className="text-[8px]">{collectStatus}</div>
              <div className="w-full h-3 border border-black p-0.5">
                <div className="h-full bg-black transition-all duration-300" style={{ width: `${collectProgress}%` }} />
              </div>
              <div className="text-[8px]">已采集: {readings.length} / 41 点</div>
            </div>
            <div className="flex justify-around border-t border-black/20 pt-1">
              <span className="border border-black px-1">暂停</span>
              <span className="border border-black px-1">终止</span>
            </div>
          </div>
        );
      case 're-measure':
        return (
          <div className="w-full h-full bg-[#9da832] p-1 font-mono text-[10px] flex flex-col">
            <div className="border-b border-black/20 pb-0.5 mb-1">补测数据点</div>
            <div className="flex-1 space-y-1">
              <div className="text-[8px] text-red-700 font-bold">⚠ 12.5m 校验和超限: 847</div>
              <div className="text-[8px] opacity-60">(容许范围: ±50)</div>
              <div className="mt-2 text-[8px]">补测深度: [ 12.5 ] m</div>
              <div className="mt-4 flex space-x-2">
                <div className="flex-1 border border-black text-center bg-black text-[#9da832]">[开始补测]</div>
                <div className="flex-1 border border-black text-center">[返回]</div>
              </div>
            </div>
          </div>
        );
      case 'summary':
        return (
          <div className="w-full h-full bg-[#9da832] p-1 font-mono text-[10px] flex flex-col">
            <div className="border-b border-black/20 pb-0.5 mb-1">采集完成</div>
            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
              <div>正测: 41点</div>
              <div>反测: 41点</div>
              <div>补测: 1点</div>
              <div className="mt-2 animate-pulse">[请关机并收工]</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Description Bar */}
      <div className="bg-industrial-fg/5 border-l-4 border-industrial-fg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <AlertCircle size={18} className="text-industrial-fg" />
          <p className="text-sm font-medium">
            任务说明：请使用读数仪完成测孔CX-06的正反测数据采集，发现异常数据需进行补测。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile & Controls */}
        <div className="lg:col-span-7 space-y-4">
          <TechnicalCard title="测斜管剖面图 / PIPE PROFILE">
            <div className="relative h-[400px] bg-[#f8f9fa] border-2 border-industrial-fg overflow-hidden flex">
              {/* Left Label */}
              <div className="w-12 border-r border-industrial-fg/10 flex items-center justify-center">
                <div className="rotate-180 [writing-mode:vertical-lr] text-[10px] font-bold opacity-30 uppercase tracking-widest">基坑侧 / EXCAVATION SIDE</div>
              </div>
              
              {/* Pipe Visualization */}
              <div className="flex-1 relative flex justify-center">
                <div className="w-16 h-full bg-gray-200 border-x-2 border-industrial-fg relative">
                  {/* Depth Markers */}
                  {[0, 5, 10, 15, 20].map(d => (
                    <div key={d} className="absolute w-full border-t border-industrial-fg/20 flex items-center" style={{ top: `${(d / 20) * 100}%` }}>
                      <span className="absolute -left-8 text-[9px] font-mono">{d.toFixed(1)}m</span>
                    </div>
                  ))}
                  
                  {/* Probe */}
                  <motion.div 
                    animate={{ top: `${(currentDepth / 20) * 100}%` }}
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-12 bg-industrial-fg z-10 flex items-center justify-center"
                  >
                    <div className="w-1 h-8 bg-white/20" />
                  </motion.div>

                  {/* Cable */}
                  <motion.div 
                    animate={{ height: `${(currentDepth / 20) * 100}%` }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-industrial-fg/40"
                  />
                </div>
              </div>

              {/* Right Label */}
              <div className="w-12 border-l border-industrial-fg/10 flex items-center justify-center">
                <div className="[writing-mode:vertical-lr] text-[10px] font-bold opacity-30 uppercase tracking-widest">围护侧 / RETAINING SIDE</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 p-4 bg-white border-2 border-industrial-fg shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="secondary" className="h-8 text-[10px] px-3">▲ 上提</Button>
                  <Button variant="secondary" className="h-8 text-[10px] px-3">▼ 下放</Button>
                </div>
                <div className="flex items-center space-x-4 font-mono text-xs">
                  <div>间距: <span className="font-bold border-b border-industrial-fg px-2">{params.spacing}m</span></div>
                  <div>当前深度: <span className="font-bold text-lg">{currentDepth.toFixed(1)}m</span></div>
                </div>
              </div>
            </div>
          </TechnicalCard>
        </div>

        {/* Right: Device & Plane View */}
        <div className="lg:col-span-5 space-y-6">
          {/* Simulated Inclinometer */}
          <div className="relative aspect-[4/5] bg-[#2c3e50] rounded-3xl p-6 shadow-2xl border-4 border-[#1a252f] flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-6">
              <button 
                onClick={handlePower}
                className={cn(
                  "w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all shadow-inner",
                  isPoweredOn ? "bg-red-500 border-red-700 text-white" : "bg-gray-700 border-gray-800 text-gray-500"
                )}
              >
                <div className="text-[10px] font-bold">⏻</div>
              </button>
              <div className="text-white/20 text-[8px] font-mono text-right">
                MODEL: CX-READER V3<br/>S/N: 20260408
              </div>
            </div>

            {/* LCD Screen Container */}
            <div className="flex-1 bg-[#1a252f] rounded-lg p-3 shadow-inner border-2 border-black/50">
              <div className="w-full h-full rounded border-4 border-[#2c3e50] overflow-hidden">
                <LCDContent />
              </div>
            </div>

            {/* Buttons Area */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="col-start-2 flex flex-col items-center space-y-4">
                <button onClick={() => handleNav('up')} className="w-12 h-12 bg-gray-700 rounded-full border-b-4 border-gray-900 active:translate-y-1 active:border-b-0 flex items-center justify-center text-white">↑</button>
                <div className="flex space-x-4">
                  <button onClick={() => handleNav('back')} className="w-12 h-12 bg-gray-700 rounded-full border-b-4 border-gray-900 active:translate-y-1 active:border-b-0 flex items-center justify-center text-white">←</button>
                  <button onClick={() => handleNav('ok')} className="w-12 h-12 bg-industrial-fg rounded-full border-b-4 border-black active:translate-y-1 active:border-b-0 flex items-center justify-center text-white font-bold">OK</button>
                </div>
                <button onClick={() => handleNav('down')} className="w-12 h-12 bg-gray-700 rounded-full border-b-4 border-gray-900 active:translate-y-1 active:border-b-0 flex items-center justify-center text-white">↓</button>
              </div>
            </div>

            {/* Ports */}
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col space-y-4">
              <div className="w-4 h-8 bg-gray-800 rounded-l-md border-y border-l border-black/50" />
              <button 
                onClick={() => setShowCableModal(true)}
                className={cn(
                  "w-6 h-12 rounded-l-md border-y border-l transition-all flex items-center justify-center",
                  isConnected ? "bg-blue-500 border-blue-700" : "bg-gray-800 border-black/50"
                )}
              >
                <div className="rotate-90 text-[8px] text-white font-bold whitespace-nowrap">测量口</div>
              </button>
              <div className="w-4 h-8 bg-gray-800 rounded-l-md border-y border-l border-black/50" />
            </div>
          </div>

          {/* Plane View */}
          <TechnicalCard title="测斜管平面图 / PLANE VIEW">
            <div className="relative aspect-square bg-white border-2 border-industrial-fg flex flex-col items-center justify-center">
              <div className="absolute top-2 text-[10px] font-bold opacity-40">基坑侧 (N)</div>
              <div className="absolute bottom-2 text-[10px] font-bold opacity-40">围护侧 (S)</div>
              
              <div className="relative w-32 h-32 border-2 border-industrial-fg rounded-full flex items-center justify-center">
                {/* Axes */}
                <div className="absolute w-full h-0.5 bg-industrial-fg/10" />
                <div className="absolute h-full w-0.5 bg-industrial-fg/10" />
                
                {/* Direction Buttons */}
                {['N', 'E', 'S', 'W'].map((dir, i) => {
                  const pos = [
                    { top: '-1rem', left: '50%', transform: 'translateX(-50%)' },
                    { top: '50%', right: '-1rem', transform: 'translateY(-50%)' },
                    { bottom: '-1rem', left: '50%', transform: 'translateX(-50%)' },
                    { top: '50%', left: '-1rem', transform: 'translateY(-50%)' },
                  ][i];
                  return (
                    <button
                      key={dir}
                      onClick={() => setAlignment(dir as any)}
                      className={cn(
                        "absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all z-10",
                        alignment === dir ? "bg-industrial-fg text-white border-industrial-fg" : "bg-white border-industrial-fg/20 hover:border-industrial-fg"
                      )}
                      style={pos}
                    >
                      {dir}
                    </button>
                  );
                })}

                {/* Center Point */}
                <div className="w-4 h-4 bg-industrial-fg rounded-full shadow-lg" />
              </div>

              <div className="mt-8 text-[9px] font-mono opacity-60 text-center">
                A+/A- 垂直于围护结构 (位移主方向)<br/>
                B+/B- 平行于围护结构
              </div>
            </div>
          </TechnicalCard>
        </div>
      </div>

      {/* Data Table */}
      <div className="border-2 border-industrial-fg bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="bg-industrial-fg text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex justify-between items-center">
          <span>数据采集表 / DATA COLLECTION</span>
          <div className="flex space-x-4">
            <span>测区: {params.area}</span>
            <span>孔号: CX-{params.hole}</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
          <table className="w-full text-[10px] font-mono text-center border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-20">
              <tr className="border-b border-industrial-fg/20">
                <th className="p-2 border-r border-industrial-fg/10">深度(m)</th>
                <th className="p-2 border-r border-industrial-fg/10 bg-blue-50">正测 A+</th>
                <th className="p-2 border-r border-industrial-fg/10 bg-blue-50">正测 A-</th>
                <th className="p-2 border-r border-industrial-fg/10 bg-orange-50">反测 A+</th>
                <th className="p-2 border-r border-industrial-fg/10 bg-orange-50">反测 A-</th>
                <th className="p-2">校验和</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr key={i} className={cn("border-b border-industrial-fg/5", r.checksum > 50 && "bg-red-50")}>
                  <td className="p-1.5 border-r border-industrial-fg/10 font-bold">{r.depth.toFixed(1)}</td>
                  <td className="p-1.5 border-r border-industrial-fg/10">{r.posA?.toFixed(2) || '-'}</td>
                  <td className="p-1.5 border-r border-industrial-fg/10">{r.posB?.toFixed(2) || '-'}</td>
                  <td className="p-1.5 border-r border-industrial-fg/10">{r.negA?.toFixed(2) || '-'}</td>
                  <td className="p-1.5 border-r border-industrial-fg/10">{r.negB?.toFixed(2) || '-'}</td>
                  <td className={cn("p-1.5 font-bold", r.checksum > 50 ? "text-red-600" : "text-green-600")}>
                    {r.checksum || '-'}
                    {r.checksum > 50 && <span className="ml-1">⚠</span>}
                  </td>
                </tr>
              ))}
              {readings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center opacity-30 italic">暂无采集数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cable Modal */}
      <Modal
        isOpen={showCableModal}
        onClose={() => setShowCableModal(false)}
        title="选择线材 / SELECT CABLE"
      >
        <div className="grid grid-cols-2 gap-4">
          {cableOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                if (opt.isCorrect) {
                  setIsConnected(true);
                  setSelectedCableId(opt.id);
                  setShowCableModal(false);
                  const s = { ...scores };
                  s['2-2-1'] = 1;
                  setScores(s);
                } else {
                  alert('连接失败：线材型号不匹配');
                }
              }}
              className="group p-3 border-2 border-industrial-fg/20 hover:border-industrial-fg transition-all text-left bg-white"
            >
              <div className="aspect-video bg-gray-100 mb-2 overflow-hidden">
                <img src={opt.image} alt={opt.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
              </div>
              <div className="text-[10px] font-bold uppercase mb-1">{opt.name}</div>
              <p className="text-[9px] opacity-60 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>
      </Modal>

      {/* Summary Modal */}
      <Modal
        isOpen={showSummary}
        onClose={() => {}}
        title="数据采集完成 / COLLECTION COMPLETE"
      >
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 border border-industrial-fg/10 space-y-2">
            <div className="text-[10px] font-bold opacity-50 uppercase">本次采集摘要</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>测区: <span className="font-bold">03区</span></div>
              <div>孔号: <span className="font-bold">CX-06</span></div>
              <div>正测点: <span className="font-bold text-green-600">41个 ✅</span></div>
              <div>反测点: <span className="font-bold text-green-600">41个 ✅</span></div>
              <div>补测点: <span className="font-bold text-green-600">1个 ✅</span></div>
              <div>超限点: <span className="font-bold">0个</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold opacity-50 uppercase">收工确认清单</div>
            {[
              { id: 'lift', label: '已提起探头至管口' },
              { id: 'disconnect', label: '已断开线材连接' },
              { id: 'powerOff', label: '已关闭读数仪电源' }
            ].map(item => (
              <label key={item.id} className="flex items-center space-x-3 p-3 border border-industrial-fg/10 rounded cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  checked={(summaryChecks as any)[item.id]} 
                  onChange={(e) => setSummaryChecks(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  className="w-4 h-4 accent-industrial-fg"
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>

          <Button 
            disabled={!summaryChecks.lift || !summaryChecks.disconnect || !summaryChecks.powerOff}
            onClick={handleFinalSubmit}
            className="w-full py-4 text-sm font-bold uppercase"
          >
            确认收工并提交
          </Button>
        </div>
      </Modal>

      {/* Global Submit (Hidden until phase 7) */}
      <div className="flex justify-end pt-4 border-t border-industrial-fg/10">
        <Button 
          disabled={phase < 7}
          onClick={handleFinalSubmit}
          className="px-12 py-6 text-sm font-bold uppercase tracking-[0.2em]"
        >
          提交本步 ✓
        </Button>
      </div>
    </div>
  );
};
