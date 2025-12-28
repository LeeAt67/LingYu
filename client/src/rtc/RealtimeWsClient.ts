export type WsEvents = {
  onOpen?: () => void;
  onClose?: (code?: number, reason?: string) => void;
  onError?: (err: any) => void;
  onMessage?: (data: any) => void;
};

export class RealtimeWsClient {
  private ws: WebSocket | null = null;
  private events: WsEvents;

  constructor(events: WsEvents = {}) {
    this.events = events;
  }

  connect(model: string, _voice: string) {
    // 使用环境变量配置的 WebSocket 地址
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 
                      (import.meta.env.VITE_API_URL?.replace('http', 'ws').replace('/api', '')) ||
                      'ws://localhost:5000';
    const url = `${wsBaseUrl}/realtime/ws?model=${encodeURIComponent(model)}`;
    
    console.log('🔌 连接 WebSocket:', url);
    
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';
    this.ws.onopen = () => this.events.onOpen?.();
    this.ws.onclose = (ev) => this.events.onClose?.(ev.code, ev.reason);
    this.ws.onerror = (ev) => this.events.onError?.(ev);
    this.ws.onmessage = (ev) => {
      try {
        const text = typeof ev.data === 'string' ? ev.data : '';
        const json = text ? JSON.parse(text) : null;
        this.events.onMessage?.(json ?? ev.data);
      } catch {
        this.events.onMessage?.(ev.data);
      }
    };
  }

  sendJson(payload: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  close() {
    try { this.ws?.close(); } catch {}
    this.ws = null;
  }
}
