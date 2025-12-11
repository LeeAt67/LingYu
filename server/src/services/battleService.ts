/**
 * 对战服务 - 管理实时对战逻辑
 */
import { Server as SocketIOServer, Socket } from 'socket.io'
import { prisma } from '../index'

// 对战房间接口
interface BattleRoom {
  id: string
  wordCount: number
  player1: {
    userId: string
    socketId: string
    name: string
    score: number
    ready: boolean
  }
  player2?: {
    userId: string
    socketId: string
    name: string
    score: number
    ready: boolean
  }
  status: 'WAITING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED'
  words: any[]
  currentWordIndex: number
  createdAt: Date
}

// 等待匹配的玩家队列
const waitingQueue: Map<number, string[]> = new Map() // wordCount -> [socketId]

// 活跃的对战房间
const battleRooms: Map<string, BattleRoom> = new Map()

// 用户socket映射
const userSockets: Map<string, string> = new Map() // userId -> socketId

/**
 * 初始化WebSocket对战服务
 */
export const initBattleSocket = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log('用户连接:', socket.id)

    // 用户加入匹配队列
    socket.on('battle:join', async (data: { userId: string; userName: string; wordCount: number }) => {
      const { userId, userName, wordCount } = data

      // 保存用户socket映射
      userSockets.set(userId, socket.id)

      // 检查是否有等待的玩家
      const waitingPlayers = waitingQueue.get(wordCount) || []

      if (waitingPlayers.length > 0) {
        // 匹配到对手
        const opponentSocketId = waitingPlayers.shift()!
        waitingQueue.set(wordCount, waitingPlayers)

        // 创建对战房间
        const battleId = `battle_${Date.now()}`
        const opponentSocket = io.sockets.sockets.get(opponentSocketId)

        if (!opponentSocket) {
          // 对手已断开，继续等待
          waitingPlayers.push(socket.id)
          waitingQueue.set(wordCount, waitingPlayers)
          socket.emit('battle:waiting')
          return
        }

        // 获取对手信息
        const opponentData = (opponentSocket as any).battleData

        // 创建房间
        const room: BattleRoom = {
          id: battleId,
          wordCount,
          player1: {
            userId: opponentData.userId,
            socketId: opponentSocketId,
            name: opponentData.userName,
            score: 0,
            ready: false
          },
          player2: {
            userId,
            socketId: socket.id,
            name: userName,
            score: 0,
            ready: false
          },
          status: 'WAITING',
          words: [],
          currentWordIndex: 0,
          createdAt: new Date()
        }

        battleRooms.set(battleId, room)

        // 双方加入房间
        socket.join(battleId)
        opponentSocket.join(battleId)

        // 通知双方匹配成功
        io.to(battleId).emit('battle:matched', {
          battleId,
          opponent: {
            player1: { userId: room.player1.userId, name: room.player1.name },
            player2: room.player2 ? { userId: room.player2.userId, name: room.player2.name } : null
          }
        })

        // 获取单词列表
        const words = await getRandomWords(wordCount)
        room.words = words

        // 发送单词列表给双方
        io.to(battleId).emit('battle:words', { words })

      } else {
        // 加入等待队列
        waitingPlayers.push(socket.id)
        waitingQueue.set(wordCount, waitingPlayers)

          // 保存用户数据到socket
          ; (socket as any).battleData = { userId, userName, wordCount }

        socket.emit('battle:waiting')
      }
    })

    // 玩家准备
    socket.on('battle:ready', (data: { battleId: string }) => {
      const { battleId } = data
      const room = battleRooms.get(battleId)

      if (!room) return

      // 标记玩家为准备状态
      if (room.player1.socketId === socket.id) {
        room.player1.ready = true
      } else if (room.player2?.socketId === socket.id) {
        room.player2.ready = true
      }

      // 检查双方是否都准备好
      if (room.player1.ready && room.player2?.ready) {
        room.status = 'IN_PROGRESS'
        io.to(battleId).emit('battle:start')
      }
    })

    // 玩家提交答案
    socket.on('battle:answer', async (data: {
      battleId: string
      wordId: string
      isCorrect: boolean
      timeSpent: number
    }) => {
      const { battleId, wordId, isCorrect, timeSpent } = data
      const room = battleRooms.get(battleId)

      if (!room) return

      // 更新分数
      let userId = ''
      if (room.player1.socketId === socket.id) {
        if (isCorrect) room.player1.score++
        userId = room.player1.userId
      } else if (room.player2?.socketId === socket.id) {
        if (isCorrect) room.player2.score++
        userId = room.player2.userId
      }

      // 保存答题记录到数据库
      await prisma.battleWord.create({
        data: {
          battleId,
          wordId,
          userId,
          isCorrect,
          timeSpent
        }
      })

      // 广播分数更新
      io.to(battleId).emit('battle:score-update', {
        player1Score: room.player1.score,
        player2Score: room.player2?.score || 0
      })
    })

    // 玩家完成对战
    socket.on('battle:complete', async (data: { battleId: string }) => {
      const { battleId } = data
      const room = battleRooms.get(battleId)

      if (!room) return

      room.status = 'COMPLETED'

      // 计算胜负
      const player1Win = room.player1.score > (room.player2?.score || 0)
      const player2Win = (room.player2?.score || 0) > room.player1.score

      // 更新数据库
      await prisma.battleRecord.update({
        where: { id: battleId },
        data: {
          status: 'COMPLETED',
          userScore: room.player1.score,
          opponentScore: room.player2?.score || 0,
          isWin: player1Win
        }
      })

      // 如果有player2，也创建他的记录
      if (room.player2) {
        await prisma.battleRecord.create({
          data: {
            id: `${battleId}_p2`,
            userId: room.player2.userId,
            wordCount: room.wordCount,
            userScore: room.player2.score,
            opponentScore: room.player1.score,
            isWin: player2Win,
            status: 'COMPLETED'
          }
        })
      }

      // 通知双方对战结果
      io.to(battleId).emit('battle:result', {
        player1: {
          userId: room.player1.userId,
          name: room.player1.name,
          score: room.player1.score,
          isWin: player1Win
        },
        player2: room.player2 ? {
          userId: room.player2.userId,
          name: room.player2.name,
          score: room.player2.score,
          isWin: player2Win
        } : null
      })

      // 清理房间
      battleRooms.delete(battleId)
    })

    // 玩家断开连接
    socket.on('disconnect', () => {
      console.log('用户断开:', socket.id)

      // 从等待队列中移除
      waitingQueue.forEach((queue, wordCount) => {
        const index = queue.indexOf(socket.id)
        if (index > -1) {
          queue.splice(index, 1)
          waitingQueue.set(wordCount, queue)
        }
      })

      // 从房间中移除
      battleRooms.forEach((room, battleId) => {
        if (room.player1.socketId === socket.id || room.player2?.socketId === socket.id) {
          // 通知对手玩家已离开
          io.to(battleId).emit('battle:opponent-left')
          battleRooms.delete(battleId)
        }
      })

      // 清理用户映射
      userSockets.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          userSockets.delete(userId)
        }
      })
    })
  })
}

/**
 * 获取随机单词
 */
async function getRandomWords(count: number) {
  const totalWords = await prisma.word.count()
  const skip = Math.max(0, Math.floor(Math.random() * (totalWords - count)))

  const words = await prisma.word.findMany({
    skip,
    take: count,
    include: {
      options: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  return words.map(word => ({
    id: word.id,
    word: word.word,
    options: word.options.map(opt => ({
      type: opt.type,
      meaning: opt.meaning
    }))
  }))
}
