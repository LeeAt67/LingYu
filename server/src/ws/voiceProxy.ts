import type { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import logger from '../utils/logger';

/**
 * Setup WebSocket proxy for voice call integration
 * Forwards client WebSocket connections to Qwen-Omni realtime API
 * 
 * @param server - HTTP server instance
 */
export function setupVoiceProxy(server: Server): void {
  const wss = new WebSocketServer({ server, path: '/realtime/ws' });

  logger.info('Voice WebSocket proxy initialized on path: /realtime/ws');

  wss.on('connection', async (client: WebSocket, req: any) => {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.info(`[${clientId}] New client connection from ${req.socket.remoteAddress}`);

    try {
      // Validate API key
      const apiKey = process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        logger.error(`[${clientId}] Connection rejected: missing API key`);
        client.close(1011, 'missing api key');
        return;
      }

      // Parse request URL and extract model parameter
      const url = new URL(req.url || '', 'http://localhost');
      const model = (
        url.searchParams.get('model') || 
        process.env.REALTIME_MODEL || 
        'qwen3-omni-flash-realtime'
      ).trim();
      
      const base = process.env.REALTIME_BASE || 'wss://dashscope.aliyuncs.com/api-ws/v1/realtime';
      const upstreamUrl = `${base}?model=${encodeURIComponent(model)}`;

      logger.info(`[${clientId}] Connecting to upstream: ${upstreamUrl}`);

      // Create upstream connection with authorization
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
      };

      const upstream = new WebSocket(upstreamUrl, { headers });
      let pingTimer: NodeJS.Timeout | null = null;

      // Upstream connection opened
      upstream.on('open', () => {
        logger.info(`[${clientId}] Upstream connection established`);
        
        // Setup keepalive ping to prevent idle close
        pingTimer = setInterval(() => {
          try {
            if (upstream.readyState === WebSocket.OPEN) {
              (upstream as any).ping?.();
            }
          } catch (error) {
            logger.error(`[${clientId}] Ping error:`, error);
          }
        }, 20000);

        // Notify client that upstream is ready
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'upstream.open' }));
        }
      });

      // Forward upstream messages to client
      upstream.on('message', (data: any, isBinary: boolean) => {
        try {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data, { binary: isBinary });
          }
        } catch (error) {
          logger.error(`[${clientId}] Error forwarding upstream message to client:`, error);
        }
      });

      // Handle upstream errors
      upstream.on('error', (err: Error) => {
        logger.error(`[${clientId}] Upstream error:`, err.message);
        try {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
              type: 'upstream.error', 
              message: err.message || 'upstream error' 
            }));
            client.close(1011, 'upstream error');
          }
        } catch (error) {
          logger.error(`[${clientId}] Error handling upstream error:`, error);
        }
      });

      // Handle upstream close
      upstream.on('close', (code: number, reason: Buffer) => {
        const reasonStr = reason.toString();
        logger.info(`[${clientId}] Upstream closed: code=${code}, reason=${reasonStr}`);
        
        try {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
              type: 'upstream.close', 
              code, 
              reason: reasonStr 
            }));
            // Use 1000 (normal closure) if upstream code is 1005 (no status received)
            const closeCode = code === 1005 ? 1000 : code;
            client.close(closeCode, reasonStr);
          }
        } catch (error) {
          logger.error(`[${clientId}] Error handling upstream close:`, error);
        }
        
        // Cleanup ping timer
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = null;
        }
      });

      // Forward client messages to upstream
      client.on('message', (data: any, isBinary: boolean) => {
        try {
          if (upstream.readyState === WebSocket.OPEN) {
            upstream.send(data, { binary: isBinary });
          } else {
            logger.warn(`[${clientId}] Cannot forward message: upstream not ready (state=${upstream.readyState})`);
          }
        } catch (error) {
          logger.error(`[${clientId}] Error forwarding client message to upstream:`, error);
        }
      });

      // Handle client close
      client.on('close', (code: number, reason: Buffer) => {
        logger.info(`[${clientId}] Client closed: code=${code}, reason=${reason.toString()}`);
        
        try {
          if (upstream.readyState === WebSocket.OPEN) {
            upstream.close();
          }
        } catch (error) {
          logger.error(`[${clientId}] Error closing upstream on client close:`, error);
        }
        
        // Cleanup ping timer
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = null;
        }
      });

      // Handle client errors
      client.on('error', (err: Error) => {
        logger.error(`[${clientId}] Client error:`, err.message);
        
        try {
          if (upstream.readyState === WebSocket.OPEN) {
            upstream.close();
          }
        } catch (error) {
          logger.error(`[${clientId}] Error closing upstream on client error:`, error);
        }
        
        // Cleanup ping timer
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = null;
        }
      });

    } catch (error) {
      logger.error(`[${clientId}] Proxy initialization error:`, error);
      try {
        client.close(1011, 'proxy init error');
      } catch (closeError) {
        logger.error(`[${clientId}] Error closing client after init error:`, closeError);
      }
    }
  });

  // Handle WebSocket server errors
  wss.on('error', (error: Error) => {
    logger.error('WebSocket server error:', error);
  });
}
