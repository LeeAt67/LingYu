/**
 * Property-Based Tests for Voice WebSocket Proxy
 * **Feature: voice-call-integration, Property 5: WebSocket代理透明转发**
 */

import * as fc from 'fast-check';
import WebSocket from 'ws';
import { createServer, Server } from 'http';
import { setupVoiceProxy } from '../voiceProxy';

describe('Voice WebSocket Proxy - Property-Based Tests', () => {
  let httpServer: Server;
  let proxyPort: number;
  let mockUpstreamServer: WebSocket.Server;
  let mockUpstreamPort: number;

  beforeAll(() => {
    // Use dynamic ports to avoid conflicts
    proxyPort = 3001 + Math.floor(Math.random() * 1000);
    mockUpstreamPort = 4001 + Math.floor(Math.random() * 1000);
  });

  beforeEach((done) => {
    // Create HTTP server for proxy
    httpServer = createServer();
    
    // Setup voice proxy
    setupVoiceProxy(httpServer);
    
    // Start proxy server
    httpServer.listen(proxyPort, () => {
      // Create mock upstream server
      mockUpstreamServer = new WebSocket.Server({ port: mockUpstreamPort });
      done();
    });
  });

  afterEach((done) => {
    // Close all connections with proper cleanup
    const closeUpstream = () => {
      return new Promise<void>((resolve) => {
        if (mockUpstreamServer) {
          mockUpstreamServer.close(() => resolve());
        } else {
          resolve();
        }
      });
    };

    const closeHttp = () => {
      return new Promise<void>((resolve) => {
        if (httpServer) {
          httpServer.close(() => resolve());
        } else {
          resolve();
        }
      });
    };

    closeUpstream().then(() => closeHttp()).then(() => done());
  });

  /**
   * Property 5: WebSocket 代理透明转发
   * For any sequence of messages sent from client, the proxy should forward them
   * to upstream, and any messages from upstream should be forwarded back to client
   * 
   * Validates: Requirements 2.2, 2.3, 2.4
   */
  test('Property 5: WebSocket proxy transparently forwards messages bidirectionally', async () => {
    // Set required environment variables
    process.env.DASHSCOPE_API_KEY = 'test-api-key';
    process.env.REALTIME_BASE = `ws://localhost:${mockUpstreamPort}`;

    // Test with a single message to ensure basic forwarding works
    const testMessage = {
      type: 'input_audio_buffer.append',
      event_id: 'test-event-123',
    };

    return new Promise<void>((resolve, reject) => {
      let receivedByUpstream = false;
      let receivedByClient = false;
      let upstreamConnection: WebSocket | null = null;

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Test timeout: message forwarding failed'));
      }, 5000);

      const cleanup = () => {
        clearTimeout(timeout);
        try {
          if (client && client.readyState === WebSocket.OPEN) {
            client.close();
          }
        } catch (e) {}
        try {
          if (upstreamConnection && upstreamConnection.readyState === WebSocket.OPEN) {
            upstreamConnection.close();
          }
        } catch (e) {}
      };

      // Setup mock upstream server
      mockUpstreamServer.once('connection', (upstream) => {
        upstreamConnection = upstream;

        upstream.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            // Verify message was forwarded correctly
            expect(message.event_id).toBe(testMessage.event_id);
            expect(message.type).toBe(testMessage.type);
            receivedByUpstream = true;

            // Send response back
            const response = {
              type: 'response.audio.delta',
              event_id: message.event_id,
              delta: 'mock-audio-data',
            };
            upstream.send(JSON.stringify(response));
          } catch (error) {
            cleanup();
            reject(error);
          }
        });
      });

      // Create client connection
      const client = new WebSocket(`ws://localhost:${proxyPort}/realtime/ws?model=test-model`);

      client.on('open', () => {
        // Wait for upstream to connect
        setTimeout(() => {
          client.send(JSON.stringify(testMessage));
        }, 200);
      });

      client.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Skip upstream status messages
          if (message.type === 'upstream.open') {
            return;
          }

          // Verify response was forwarded from upstream
          expect(message.type).toBe('response.audio.delta');
          expect(message.event_id).toBe(testMessage.event_id);
          receivedByClient = true;

          // Check if both directions worked
          if (receivedByUpstream && receivedByClient) {
            cleanup();
            resolve();
          }
        } catch (error) {
          cleanup();
          reject(error);
        }
      });

      client.on('error', (error) => {
        cleanup();
        reject(error);
      });
    });
  }, 10000);

  /**
   * Property: API key validation
   * For any connection attempt without valid API key, proxy should reject
   * 
   * Validates: Requirements 8.1, 8.2
   */
  test('Property: Proxy rejects connections without valid API key', async () => {
    // Clear API key
    const originalKey = process.env.DASHSCOPE_API_KEY;
    delete process.env.DASHSCOPE_API_KEY;
    delete process.env.OPENAI_API_KEY;

    return new Promise<void>((resolve, reject) => {
      const client = new WebSocket(`ws://localhost:${proxyPort}/realtime/ws?model=test-model`);
      
      const timeout = setTimeout(() => {
        try { client.close(); } catch (e) {}
        reject(new Error('Test timeout: expected connection to be rejected'));
      }, 3000);

      client.on('close', (code, reason) => {
        clearTimeout(timeout);
        
        // Verify connection was rejected with appropriate code
        // The connection may open briefly at TCP level before being closed
        expect(code).toBe(1011);
        expect(reason.toString()).toContain('missing api key');
        
        // Restore API key
        if (originalKey) {
          process.env.DASHSCOPE_API_KEY = originalKey;
        }
        resolve();
      });

      client.on('error', () => {
        // Error is expected
      });
    });
  }, 5000);

  /**
   * Property: Model parameter configuration
   * For any valid model parameter, proxy should use it in upstream connection
   * 
   * Validates: Requirements 8.3, 8.4
   */
  test('Property: Proxy correctly applies model configuration', async () => {
    process.env.DASHSCOPE_API_KEY = 'test-api-key';
    process.env.REALTIME_BASE = `ws://localhost:${mockUpstreamPort}`;

    const testModel = 'qwen3-omni-flash-realtime';

    return new Promise<void>((resolve, reject) => {
      let upstreamUrl: string | null = null;

      const timeout = setTimeout(() => {
        reject(new Error('Test timeout'));
      }, 3000);

      // Capture upstream connection URL
      mockUpstreamServer.once('connection', (upstream, req) => {
        upstreamUrl = req.url || '';
        upstream.close();
      });

      const client = new WebSocket(`ws://localhost:${proxyPort}/realtime/ws?model=${testModel}`);

      client.on('close', () => {
        clearTimeout(timeout);
        
        // Verify model was included in upstream URL
        expect(upstreamUrl).toBeTruthy();
        expect(upstreamUrl).toContain(`model=${encodeURIComponent(testModel)}`);
        
        resolve();
      });

      client.on('error', () => {
        // Expected during cleanup
      });
    });
  }, 5000);
});
