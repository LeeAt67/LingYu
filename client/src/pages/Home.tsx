/**
 * 首页 - 学习中心 Web 版
 * 显示随机单词和翻译器入口
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRandomWord } from "@/api/words";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [randomWord, setRandomWord] = useState({
    word: "Edge",
    meaning: "边缘；优势",
  });

  // 组件加载时获取随机单词
  useEffect(() => {
    const fetchData = async () => {
      const word = await getRandomWord();
      if (word) {
        setRandomWord(word);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部栏 */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">学习中心</h2>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-all cursor-pointer"
          >
            {user?.name ? (
              <div className="w-full h-full bg-black flex items-center justify-center text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-sm">
                ?
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* 中间 - 随机单词 */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-serif font-light text-black mb-4 tracking-wide">
            {randomWord.word}
          </h1>
          <p className="text-gray-600 text-xl">{randomWord.meaning}</p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* 翻译器卡片 */}
          <button
            onClick={() => navigate("/translator")}
            className="bg-gray-50 rounded-xl p-8 text-left hover:bg-gray-100 transition-all hover:shadow-md border border-gray-200"
          >
            <h3 className="text-black text-2xl font-semibold mb-2">
              AI 翻译器
            </h3>
            <p className="text-gray-600 text-sm">支持 200+ 种语言的实时翻译</p>
          </button>

          {/* AI 对话卡片 */}
          <button
            onClick={() => navigate("/chat")}
            className="bg-gray-50 rounded-xl p-8 text-left hover:bg-gray-100 transition-all hover:shadow-md border border-gray-200"
          >
            <h3 className="text-black text-2xl font-semibold mb-2">AI 对话</h3>
            <p className="text-gray-600 text-sm">智能语音和文字对话助手</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
