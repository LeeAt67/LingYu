# 后端接口实现文档

本文档说明了根据前端需求新增的后端接口。

## 📋 概述

根据前端client的内容分析,新增了以下三个主要模块的接口:

1. **单词管理** (`/api/words`) - 单词库管理和查询
2. **练习功能** (`/api/practice`) - 单词练习相关功能
3. **对战功能** (`/api/battle`) - 单词对战相关功能

## 🗄️ 数据库模型

### 新增的Prisma模型

#### Word (单词表)
```prisma
model Word {
  id          String   @id @default(cuid())
  word        String   @unique
  phonetic    String?
  meaning     String
  type        String?  // 词性
  level       String?  // 词汇等级
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### UserWord (用户单词关系)
```prisma
model UserWord {
  id            String   @id @default(cuid())
  userId        String
  wordId        String
  seenCount     Int      @default(0)  // 见过次数
  correctCount  Int      @default(0)  // 答对次数
  wrongCount    Int      @default(0)  // 答错次数
  lastSeenAt    DateTime?
}
```

#### PracticeRecord (练习记录)
```prisma
model PracticeRecord {
  id          String   @id @default(cuid())
  userId      String
  wordId      String
  isCorrect   Boolean
  timeSpent   Int      // 答题耗时(秒)
  createdAt   DateTime @default(now())
}
```

#### BattleRecord (对战记录)
```prisma
model BattleRecord {
  id          String   @id @default(cuid())
  userId      String
  opponentId  String?  // 对手ID
  wordCount   Int      // 对战词汇量
  userScore   Int      @default(0)
  opponentScore Int    @default(0)
  isWin       Boolean?
  duration    Int?     // 对战时长(秒)
  status      BattleStatus @default(MATCHING)
}
```

## 🔌 API 接口详情

### 1. 单词管理接口 (`/api/words`)

#### GET `/api/words/random`
获取随机单词(用于首页展示)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "word": "Edge",
    "meaning": "边缘；优势"
  }
}
```

#### GET `/api/words`
获取单词列表(支持分页和筛选)

**查询参数:**
- `level`: 词汇等级(四级、六级、考研等)
- `page`: 页码(默认1)
- `limit`: 每页数量(默认20)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "words": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### GET `/api/words/:id`
获取单词详情

#### GET `/api/words/user/stats`
获取用户单词学习统计

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalWords": 4755,
    "studiedWords": 191,
    "practiceCount": 220
  }
}
```

#### POST `/api/words/:wordId/seen`
记录单词被查看

### 2. 练习功能接口 (`/api/practice`)

#### GET `/api/practice/words`
获取练习单词列表

**查询参数:**
- `count`: 获取单词数量(默认10)
- `level`: 词汇等级

**响应示例:**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "xxx",
        "word": "Abandon",
        "phonetic": "/əˈbændən/",
        "meaning": "放弃；抛弃",
        "type": "v.",
        "options": [
          { "type": "v.", "meaning": "放弃；抛弃", "isCorrect": true },
          { "type": "v.", "meaning": "获得；得到", "isCorrect": false }
        ],
        "practiceCount": 5,
        "correctCount": 3
      }
    ],
    "total": 10
  }
}
```

#### POST `/api/practice/submit`
提交练习答案

**请求体:**
```json
{
  "wordId": "xxx",
  "isCorrect": true,
  "timeSpent": 5
}
```

#### GET `/api/practice/history`
获取练习历史记录

**查询参数:**
- `page`: 页码
- `limit`: 每页数量

#### GET `/api/practice/stats`
获取练习统计

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalPractice": 220,
    "correctCount": 180,
    "todayPractice": 10,
    "accuracy": 81.82
  }
}
```

### 3. 对战功能接口 (`/api/battle`)

#### POST `/api/battle/start`
开始对战

**请求体:**
```json
{
  "wordCount": 30
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "battle_xxx",
    "userId": "user_xxx",
    "wordCount": 30,
    "userScore": 0,
    "opponentScore": 0,
    "status": "MATCHING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/battle/:battleId/words`
获取对战单词列表

**响应示例:**
```json
{
  "success": true,
  "data": {
    "battleId": "battle_xxx",
    "words": [
      {
        "id": "word_xxx",
        "word": "Abandon",
        "options": [
          { "meaning": "放弃" },
          { "meaning": "获得" }
        ],
        "seenCount": 3
      }
    ],
    "wordCount": 30
  }
}
```

#### POST `/api/battle/:battleId/answer`
提交对战答案

**请求体:**
```json
{
  "wordId": "xxx",
  "isCorrect": true,
  "timeSpent": 3
}
```

#### POST `/api/battle/:battleId/complete`
完成对战

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "battle_xxx",
    "userScore": 25,
    "opponentScore": 20,
    "isWin": true,
    "duration": 180,
    "status": "COMPLETED"
  }
}
```

#### GET `/api/battle/history`
获取对战历史

#### GET `/api/battle/stats`
获取对战统计

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalBattles": 147,
    "wins": 95,
    "losses": 52,
    "winRate": 64.63,
    "totalScore": 3500
  }
}
```

## 🚀 部署步骤

### 1. 更新数据库

运行Prisma迁移来创建新的数据表:

```bash
cd server
npx prisma migrate dev --name add_words_practice_battle
npx prisma generate
```

### 2. 初始化单词数据

需要向`Word`和`WordOption`表中导入单词数据。可以创建一个seed脚本:

```bash
npx prisma db seed
```

### 3. 启动服务器

```bash
npm run dev
```

服务器将在 `http://localhost:5000` 启动。

## 📝 前端集成

前端已创建对应的API调用文件:

- `client/src/api/words.ts` - 单词相关API
- `client/src/api/practice.ts` - 练习相关API
- `client/src/api/battle.ts` - 对战相关API

### 使用示例

```typescript
import { getRandomWord } from '@/api/words'
import { getPracticeWords, submitPracticeAnswer } from '@/api/practice'
import { startBattle, getBattleWords } from '@/api/battle'

// 获取随机单词
const word = await getRandomWord()

// 获取练习单词
const practiceWords = await getPracticeWords({ count: 10 })

// 开始对战
const battle = await startBattle(30)
```

## 🔐 认证

所有接口都需要JWT认证。请在请求头中包含:

```
Authorization: Bearer <token>
```

## 📊 Swagger文档

完整的API文档可以在以下地址查看:

```
http://localhost:5000/api-docs
```

## ⚠️ 注意事项

1. **Lint错误**: 当前代码中的TypeScript lint错误是因为Prisma Client还未根据新schema重新生成。运行`npx prisma generate`后这些错误会消失。

2. **单词数据**: 需要准备单词数据并导入数据库。建议创建seed脚本批量导入。

3. **对手模拟**: 当前对战功能中的对手是AI模拟的(70%正确率),未来可以扩展为真实玩家对战。

4. **性能优化**: 对于大量单词数据,建议添加数据库索引和缓存机制。

## 🎯 下一步工作

1. 创建单词数据seed脚本
2. 添加单词搜索功能
3. 实现真实玩家对战匹配
4. 添加学习曲线分析
5. 实现单词收藏和复习功能
