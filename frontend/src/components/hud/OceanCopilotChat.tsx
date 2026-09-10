import React, { useState } from 'react';
import { Send, Bot, Sparkles, X, ChevronRight, CornerDownLeft } from 'lucide-react';
import { OceanVariable, CycloneEvent, OmniBuoy, ArgoFloat } from '../../types/ocean';

interface OceanCopilotChatProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeVariable: (v: OceanVariable) => void;
  onChangeDepth: (depth: number) => void;
  onOpenTransect: () => void;
  onOpenValidation: () => void;
  onSelectCyclone: (c: CycloneEvent | null) => void;
  onSelectBuoy: (b: OmniBuoy) => void;
  onSelectArgo: (a: ArgoFloat) => void;
  buoys: OmniBuoy[];
  argoFloats: ArgoFloat[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionText?: string;
  action?: () => void;
}

export const OceanCopilotChat: React.FC<OceanCopilotChatProps> = ({
  isOpen,
  onClose,
  onChangeVariable,
  onChangeDepth,
  onOpenTransect,
  onOpenValidation,
  onSelectCyclone,
  onSelectBuoy,
  onSelectArgo,
  buoys,
  argoFloats
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Greetings! I am **Ocean-AI Copilot** for AquaTwin 3D. Ask me about Indian Ocean physical dynamics, numerical model validation, thermocline layers, or extreme cyclone events.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    {
      text: 'Compare BD09 Buoy with ROMS Model',
      action: () => {
        onOpenValidation();
        const b = buoys.find(x => x.id === 'BD09');
        if (b) onSelectBuoy(b);
      },
      response: 'Opening Ground-Truth Validation Dashboard for Station BD09 in Bay of Bengal. Observed SST is 29.2°C with a minimal residual error of +0.18°C from ROMS simulation.'
    },
    {
      text: 'Slice depth to 200m Thermocline',
      action: () => {
        onChangeDepth(200);
      },
      response: 'Adjusting ocean depth slice to -200 meters. Notice the sharp thermal drop from 28°C down to 15.2°C across the seasonal thermocline barrier.'
    },
    {
      text: 'Open 3D Vertical Transect (Chennai → Port Blair)',
      action: () => {
        onOpenTransect();
      },
      response: 'Launching 3D Vertical Water Column Transect Slicer across the Bay of Bengal basin. Inspect the mixed layer depth and thermocline slope.'
    },
    {
      text: 'Inspect Argo Float 2902214 in Arabian Sea',
      action: () => {
        const float = argoFloats.find(f => f.wmo_id === '2902214');
        if (float) onSelectArgo(float);
      },
      response: 'Opening 3D CTD sensor curves for APEX Profiler WMO 2902214. It recently completed cycle #142 diving down to 2,000 meters in Central Arabian Sea.'
    }
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // User message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim()
    };

    // Find match or formulate AI response
    let aiResponse = "I've analyzed your oceanographic query. The Indian Ocean circulation is currently modulated by seasonal monsoon currents and thermocline depth variations.";
    let customAction: (() => void) | undefined;
    let actionLabel: string | undefined;

    const lower = text.toLowerCase();
    if (lower.includes('bd09') || lower.includes('validation') || lower.includes('accuracy')) {
      aiResponse = "Opening Ground-Truth Validation Dashboard. The numerical model (ROMS 4D) achieves a 94.6% skill score when verified against calibrated MoES OMNI buoys.";
      customAction = onOpenValidation;
      actionLabel = "Open Validation Dashboard";
    } else if (lower.includes('transect') || lower.includes('cross section') || lower.includes('thermocline')) {
      aiResponse = "Opening 3D Vertical Transect Slicer. Thermocline gradients in the Bay of Bengal and Arabian Sea show strong salinity stratification.";
      customAction = onOpenTransect;
      actionLabel = "Open Transect Slicer";
    } else if (lower.includes('argo') || lower.includes('float') || lower.includes('ctd')) {
      aiResponse = "Inspecting active Argo profiling floats. Active platforms transmit CTD (Conductivity, Temperature, Depth) profiles every 10 days via Iridium satellite.";
      customAction = () => {
        if (argoFloats.length > 0) onSelectArgo(argoFloats[0]);
      };
      actionLabel = "View Float Profile";
    } else if (lower.includes('depth') || lower.includes('slice')) {
      aiResponse = "Setting depth slice to -200m (thermocline layer).";
      customAction = () => onChangeDepth(200);
      actionLabel = "Slice to -200m";
    } else if (lower.includes('cyclone') || lower.includes('biparjoy')) {
      aiResponse = "Activating Cyclone Biparjoy track replay. Notice the severe upwelling wake causing up to -2.8°C SST cooling in the Arabian Sea.";
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiResponse,
      action: customAction,
      actionText: actionLabel
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputValue('');
  };

  return (
    <div className="absolute right-4 bottom-24 z-40 w-96 max-w-[calc(100vw-2rem)] glass-panel rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-sky-900/50 bg-slate-900/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              OceanCopilot AI
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                GPT-4o / MoES
              </span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Scientific Ocean Intelligence</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="p-3 space-y-3 max-h-72 overflow-y-auto text-xs font-mono">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-900/80 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              {m.text}

              {m.action && (
                <button
                  onClick={m.action}
                  className="mt-2 w-full px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <span>{m.actionText || 'Execute Action'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] text-slate-500 font-mono mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>SUGGESTED SCIENTIFIC QUERIES:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                qp.action();
                handleSend(qp.text);
              }}
              className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-900/90 text-cyan-300 hover:bg-cyan-950 border border-cyan-900/60 truncate max-w-full text-left transition-colors"
            >
              {qp.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-900/80 flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about ocean models, buoys, thermocline..."
          className="flex-1 bg-slate-950 text-slate-100 text-xs font-mono px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
