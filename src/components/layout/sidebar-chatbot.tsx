"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  text: string;
  type: "bot" | "usr";
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    type: "bot",
    text: "Hey there! 👋 I'm your Propnex AI assistant.\n\nAsk me anything about campaigns, agents, analytics, or your dashboard."
  }
];

const BUBBLE_MESSAGES = [
  '👋 Need any help?',
  '🚀 Start a campaign',
  '🤖 Explore agents',
  '🤖 I\'m here!'
];

export function SidebarChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [bubbleText, setBubbleText] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const bubbleIndex = useRef(0);
  
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // Bubble rotation logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const showNextBubble = () => {
      if (isOpen) return;
      setBubbleText(BUBBLE_MESSAGES[bubbleIndex.current % BUBBLE_MESSAGES.length]);
      setShowBubble(true);
      bubbleIndex.current++;
      
      timeoutId = setTimeout(() => {
        setShowBubble(false);
      }, 3200);
    };

    // Initial delay then start interval
    const initialDelay = setTimeout(() => {
      showNextBubble();
      const intervalId = setInterval(showNextBubble, 7000);
      return () => clearInterval(intervalId);
    }, 2000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (msgsEndRef.current) {
      msgsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), text, type: "usr" };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "Coming soon 🤖 — Full AI responses are being integrated. Stay tuned!", 
        type: "bot" 
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1400 + Math.random() * 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTagClick = (tag: string) => {
    setInputValue(tag.replace(/^[^\w]*/, ''));
    // Need a tiny delay to let state update before sending
    setTimeout(() => handleSend(), 50);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══ ROUND FAB WIDGET ═══ */
        .fab-wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:0;margin-bottom:24px;margin-top:12px}
        .fab-bubble{
          position:absolute;bottom:calc(100% + 16px);left:50%;transform:translateX(-50%) translateY(6px) scale(.92);
          background:#18181b;border:1px solid rgba(255,255,255,.13);color:#f4f4f5;
          padding:8px 14px;border-radius:14px;font-size:.72rem;font-weight:500;
          white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.5);
          opacity:0;pointer-events:none;transition:opacity .35s,transform .35s cubic-bezier(.34,1.56,.64,1);
          z-index:99999
        }
        .fab-bubble.show{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}
        .fab-bubble::after{content:'';position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:rgba(255,255,255,.13)}
        .fab-bubble::before{content:'';position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#18181b;z-index:1}
        
        .fab{position:relative;width:56px;height:56px;cursor:pointer}
        .fab-ring{position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(255,255,255,.12);animation:ring-expand 3s ease-out infinite}
        .fab-ring:nth-child(2){inset:-12px;animation-delay:.8s;border-color:rgba(255,255,255,.06)}
        .fab-ring:nth-child(3){inset:-20px;animation-delay:1.6s;border-color:rgba(255,255,255,.03)}
        @keyframes ring-expand{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.3)}}
        
        .fab-circle{
          width:56px;height:56px;border-radius:50%;
          background:#18181b;
          border:1px solid rgba(255,255,255,.13);
          display:flex;align-items:center;justify-content:center;
          position:relative;z-index:2;
          animation:fab-float 4s ease-in-out infinite;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,border-color .3s;
          box-shadow:0 4px 20px rgba(0,0,0,.5);
        }
        .fab-wrap:hover .fab-circle{
          transform:scale(1.15) translateY(-4px);
          border-color:rgba(255,255,255,.4);
          box-shadow:0 16px 40px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.1);
        }
        @keyframes fab-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        
        .fab-glow{
          position:absolute;inset:-2px;border-radius:50%;
          background:conic-gradient(from var(--a,0deg),transparent 60%,rgba(255,255,255,.35),transparent 80%);
          animation:conic-spin 4s linear infinite;
          z-index:1;
        }
        @property --a{syntax:'<angle>';initial-value:0deg;inherits:false}
        @keyframes conic-spin{to{--a:360deg}}
        .fab-glow-mask{position:absolute;inset:2px;border-radius:50%;background:#18181b;z-index:1}
        
        .fab-icon{font-size:1.35rem;z-index:3;position:relative;animation:icon-pulse 3s ease-in-out infinite;transition:transform 0.2s}
        .fab-wrap:hover .fab-icon{animation:icon-wiggle .6s ease-in-out infinite}
        @keyframes icon-pulse{0%,100%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.1) rotate(-3deg)}75%{transform:scale(1.05) rotate(3deg)}}
        @keyframes icon-wiggle{0%,100%{transform:scale(1.15) rotate(0deg)}25%{transform:scale(1.25) rotate(-15deg)}75%{transform:scale(1.25) rotate(15deg)}}
        
        .fab-scan{position:absolute;left:8px;right:8px;height:1.5px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent);border-radius:2px;animation:fab-scan 2.5s ease-in-out infinite;z-index:4}
        @keyframes fab-scan{0%{top:10px;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:44px;opacity:0}}
        
        .fab-hand{position:absolute;bottom:-2px;right:-2px;font-size:16px;transform-origin:70% 80%;animation:hand 2.2s ease-in-out infinite;z-index:5;filter:drop-shadow(0 2px 5px rgba(0,0,0,.6))}
        @keyframes hand{0%,50%,100%{transform:rotate(0) scale(1)}8%{transform:rotate(28deg) scale(1.25)}16%{transform:rotate(-14deg) scale(1.15)}24%{transform:rotate(24deg) scale(1.2)}32%{transform:rotate(-10deg) scale(1.12)}40%{transform:rotate(18deg) scale(1.1)}}
        
        .fab-label{font-size:.68rem;font-weight:500;color:#a1a1aa;letter-spacing:.3px;margin-top:8px;display:flex;align-items:center;gap:4px}
        .fab-dot{width:5px;height:5px;background:#4ade80;border-radius:50%;animation:dot-blink 2s ease-in-out infinite}
        @keyframes dot-blink{0%,100%{opacity:1}50%{opacity:.3}}
        
        /* ═══ BACKDROP ═══ */
        .chat-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:99998;opacity:0;pointer-events:none;transition:opacity .4s}
        .chat-backdrop.show{opacity:1;pointer-events:all}
        
        /* ═══ CHAT PANEL ═══ */
        .chat-window{
          position:fixed;
          bottom:32px;left:var(--sidebar-width, 280px);
          margin-left:24px;
          width:400px;
          background:#111113;
          border:1px solid rgba(255,255,255,.13);
          border-radius:28px;
          overflow:hidden;
          display:flex;flex-direction:column;
          z-index:99999;
          box-shadow:0 0 0 1px rgba(255,255,255,.03),0 40px 80px rgba(0,0,0,.8),0 0 60px rgba(255,255,255,.02);
          opacity:0;pointer-events:none;
          transform:translateY(20px) scale(.95);
          transform-origin:bottom left;
          transition:opacity .45s cubic-bezier(.16,1,.3,1),transform .45s cubic-bezier(.16,1,.3,1);
          height:560px;
        }
        .chat-window.open{opacity:1;pointer-events:all;transform:translateY(0) scale(1)}
        
        .ch-head{
          position:relative;overflow:hidden;
          padding:28px 24px 20px;
          border-bottom:1px solid rgba(255,255,255,.07);
          flex-shrink:0;
        }
        .ch-head-bg{
          position:absolute;inset:0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%,rgba(255,255,255,.06) 0%,transparent 70%),
            radial-gradient(ellipse at 100% 100%,rgba(255,255,255,.03) 0%,transparent 50%);
        }
        .ch-orb{
          position:absolute;width:120px;height:120px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%);
          top:-40px;right:-20px;animation:orb-drift 8s ease-in-out infinite;
        }
        @keyframes orb-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(-15px,10px)}}
        
        .ch-agent{display:flex;align-items:center;gap:14px;position:relative;z-index:1}
        .ch-av-wrap{position:relative;flex-shrink:0}
        .ch-av{
          width:52px;height:52px;border-radius:50%;
          background:#18181b;border:1px solid rgba(255,255,255,.13);
          display:flex;align-items:center;justify-content:center;
          font-size:1.5rem;
          animation:ch-av-float 5s ease-in-out infinite;
        }
        @keyframes ch-av-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .ch-av-ring{position:absolute;inset:-4px;border-radius:50%;border:1px solid rgba(255,255,255,.12);animation:ch-ring 3s ease-in-out infinite}
        .ch-av-ring2{position:absolute;inset:-9px;border-radius:50%;border:1px solid rgba(255,255,255,.05);animation:ch-ring 3s ease-in-out infinite 1s}
        @keyframes ch-ring{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        
        .ch-info h3{font-size:1rem;font-weight:700;letter-spacing:-.2px;color:#f4f4f5;margin:0;}
        .ch-status{display:flex;align-items:center;gap:5px;font-size:.72rem;color:#a1a1aa;margin-top:3px}
        .ch-dot{width:5px;height:5px;background:#4ade80;border-radius:50%;animation:dot-blink 2s ease-in-out infinite}
        
        .ch-actions{position:absolute;top:20px;right:20px;display:flex;gap:6px;z-index:2}
        .ch-btn{width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#52525b;transition:.15s}
        .ch-btn:hover{background:rgba(255,255,255,.1);color:#f4f4f5}
        
        .ch-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:16px;position:relative;z-index:1}
        .ch-tag{padding:5px 12px;border:1px solid rgba(255,255,255,.07);border-radius:20px;font-size:.7rem;font-weight:500;color:#a1a1aa;cursor:pointer;background:rgba(255,255,255,.03);transition:.2s;white-space:nowrap}
        .ch-tag:hover{background:rgba(255,255,255,.09);color:#f4f4f5;border-color:rgba(255,255,255,.13)}
        
        .ch-msgs{flex:1;overflow-y:auto;padding:20px 20px 8px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.06) transparent}
        .ch-msgs::-webkit-scrollbar{width:3px}
        .ch-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.07);border-radius:3px}
        
        .mrow{display:flex;gap:9px;animation:min .4s cubic-bezier(.16,1,.3,1) both}
        @keyframes min{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .mrow.usr{flex-direction:row-reverse}
        .mav{width:26px;height:26px;border-radius:8px;background:#18181b;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0;margin-top:2px}
        .mbub{max-width:80%;padding:10px 14px;font-size:.855rem;line-height:1.55;white-space:pre-wrap;}
        .mbub.bot{background:#18181b;border:1px solid rgba(255,255,255,.07);border-radius:16px;border-top-left-radius:4px;color:#f4f4f5}
        .mbub.usr{background:#f4f4f5;color:#09090b;font-weight:500;border-radius:16px;border-top-right-radius:4px}
        
        .type-row{display:flex;gap:9px;align-items:flex-end}
        .type-bub{background:#18181b;border:1px solid rgba(255,255,255,.07);border-radius:16px;border-top-left-radius:4px;padding:12px 14px;display:none;gap:4px;align-items:center}
        .type-bub.show{display:flex}
        .td{width:5px;height:5px;background:#52525b;border-radius:50%;animation:tb 1.3s ease-in-out infinite}
        .td:nth-child(2){animation-delay:.18s}.td:nth-child(3){animation-delay:.36s}
        @keyframes tb{0%,60%,100%{transform:translateY(0);background:#52525b}30%{transform:translateY(-6px);background:#a1a1aa}}
        
        .ch-inp-wrap{padding:12px 16px 16px;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;background:#111113}
        .ch-inp{display:flex;align-items:flex-end;gap:8px;background:#18181b;border:1px solid rgba(255,255,255,.13);border-radius:18px;padding:8px 8px 8px 16px;transition:border-color .2s,box-shadow .2s}
        .ch-inp:focus-within{border-color:rgba(255,255,255,.25);box-shadow:0 0 0 3px rgba(255,255,255,.04)}
        .ch-ta{flex:1;background:none;border:none;outline:none;color:#f4f4f5;font-size:.86rem;font-family:'Inter',sans-serif;resize:none;min-height:22px;max-height:90px;line-height:1.5;padding-bottom:2px}
        .ch-ta::placeholder{color:#52525b}
        .ch-send{width:34px;height:34px;flex-shrink:0;background:#f4f4f5;color:#09090b;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s}
        .ch-send:hover{transform:scale(1.1);background:#d4d4d8}
        .ch-send:active{transform:scale(.92)}
        .ch-hint{text-align:center;font-size:.63rem;color:#52525b;margin-top:8px;letter-spacing:.2px}
      `}} />

      {/* ROUND FAB WIDGET */}
      <div className="fab-wrap" onClick={() => { setIsOpen(true); setShowBubble(false); }}>
        <div className={cn("fab-bubble", showBubble && "show")}>
          {bubbleText}
        </div>
        <div className="fab">
          <div className="fab-ring"></div>
          <div className="fab-ring"></div>
          <div className="fab-ring"></div>
          <div className="fab-circle">
            <div className="fab-glow"></div>
            <div className="fab-glow-mask"></div>
            <div className="fab-scan"></div>
            <span className="fab-icon">🤖</span>
          </div>
          <span className="fab-hand">👋</span>
        </div>
        <div className="fab-label"><div className="fab-dot"></div>Propnex AI</div>
      </div>

      {mounted && createPortal(
        <>
          {/* BACKDROP */}
          <div 
            className={cn("chat-backdrop", isOpen && "show")} 
            onClick={() => setIsOpen(false)}
          ></div>

          {/* CHAT PANEL */}
          <div className={cn("chat-window", isOpen && "open")}>
            <div className="ch-head">
              <div className="ch-head-bg"></div>
              <div className="ch-orb"></div>
              <div className="ch-actions">
                <div className="ch-btn" onClick={() => setIsOpen(false)}>
                  <X className="size-[13px] text-zinc-400" />
                </div>
              </div>
              <div className="ch-agent">
                <div className="ch-av-wrap">
                  <div className="ch-av-ring2"></div>
                  <div className="ch-av-ring"></div>
                  <div className="ch-av">🤖</div>
                </div>
                <div className="ch-info">
                  <h3>Propnex AI</h3>
                  <div className="ch-status"><div className="ch-dot"></div>Online & active</div>
                </div>
              </div>
              {messages.length <= 1 && (
                <div className="ch-tags">
                  <div className="ch-tag" onClick={() => handleTagClick("🚀 Setup campaign")}>🚀 Setup campaign</div>
                  <div className="ch-tag" onClick={() => handleTagClick("🤖 Agent library")}>🤖 Agent library</div>
                  <div className="ch-tag" onClick={() => handleTagClick("📊 Analytics")}>📊 Analytics</div>
                  <div className="ch-tag" onClick={() => handleTagClick("💳 Billing")}>💳 Billing</div>
                </div>
              )}
            </div>

            <div className="ch-msgs">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("mrow", msg.type)}>
                  {msg.type === "bot" && <div className="mav">🤖</div>}
                  <div className={cn("mbub", msg.type)}>{msg.text}</div>
                </div>
              ))}
              
              <div className="type-row">
                <div className="mav" style={{ flexShrink: 0, opacity: isTyping ? 1 : 0, transition: 'opacity 0.2s' }}>🤖</div>
                <div className={cn("type-bub", isTyping && "show")}>
                  <div className="td"></div><div className="td"></div><div className="td"></div>
                </div>
              </div>
              <div ref={msgsEndRef} />
            </div>

            <div className="ch-inp-wrap">
              <div className="ch-inp">
                <textarea 
                  className="ch-ta" 
                  rows={1} 
                  placeholder="Message Propnex AI…" 
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                />
                <button className="ch-send" onClick={handleSend} disabled={isTyping || !inputValue.trim()}>
                  <Send className="size-3.5 text-zinc-900" />
                </button>
              </div>
              <div className="ch-hint">Propnex AI · Demo mode</div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
