/**
 * 对战WebSocket客户端
 */
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:5000'

class BattleSocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  /**
   * 连接WebSocket
   */
  connect() {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    })

    this.socket.on('connect', () => {
      console.log('对战Socket连接成功')
    })

    this.socket.on('disconnect', () => {
      console.log('对战Socket断开连接')
    })

    // 注册所有事件监听器
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback)
      })
    })
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * 加入匹配队列
   */
  joinBattle(userId: string, userName: string, wordCount: number) {
    this.socket?.emit('battle:join', { userId, userName, wordCount })
  }

  /**
   * 玩家准备
   */
  ready(battleId: string) {
    this.socket?.emit('battle:ready', { battleId })
  }

  /**
   * 提交答案
   */
  submitAnswer(battleId: string, wordId: string, isCorrect: boolean, timeSpent: number) {
    this.socket?.emit('battle:answer', { battleId, wordId, isCorrect, timeSpent })
  }

  /**
   * 完成对战
   */
  completeBattle(battleId: string) {
    this.socket?.emit('battle:complete', { battleId })
  }

  /**
   * 监听事件
   */
  on(event: string, callback: Function) {
    // 保存监听器
    const callbacks = this.listeners.get(event) || []
    callbacks.push(callback)
    this.listeners.set(event, callbacks)

    // 如果socket已连接，立即注册
    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  /**
   * 移除监听器
   */
  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = this.listeners.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
        this.listeners.set(event, callbacks)
      }
      this.socket?.off(event, callback as any)
    } else {
      this.listeners.delete(event)
      this.socket?.off(event)
    }
  }
}

// 导出单例
export const battleSocket = new BattleSocketService()

// 事件类型定义
export interface BattleMatchedEvent {
  battleId: string
  opponent: {
    player1: { userId: string; name: string }
    player2: { userId: string; name: string }
  }
}

export interface BattleWordsEvent {
  words: Array<{
    id: string
    word: string
    options: Array<{
      type?: string
      meaning: string
    }>
  }>
}

export interface BattleScoreUpdateEvent {
  player1Score: number
  player2Score: number
}

export interface BattleResultEvent {
  player1: {
    userId: string
    name: string
    score: number
    isWin: boolean
  }
  player2: {
    userId: string
    name: string
    score: number
    isWin: boolean
  } | null
}
