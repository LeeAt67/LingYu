/**
 * 首页 - 学习中心
 * 显示随机单词和Practice卡片
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRandomWord } from "@/api/words";
import { getPracticeStats } from "@/api/practice";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [randomWord, setRandomWord] = useState({
    word: "Edge",
    meaning: "边缘；优势",
  });
  const [practiceTotal, setPracticeTotal] = useState(0);

  // 组件加载时获取随机单词和统计数据
  useEffect(() => {
    const fetchData = async () => {
      // 获取随机单词
      const word = await getRandomWord();
      if (word) {
        setRandomWord(word);
      }

      // 获取练习统计
      const practiceStats = await getPracticeStats();
      setPracticeTotal(practiceStats.totalPractice);
    };

    fetchData();
  }, []);

  // 点击头像进入个人中心
  const handleAvatarClick = () => {
    console.log("头像被点击了，准备跳转到个人中心");
    navigate("/profile");
  };

  // 点击Practice卡片
  const handlePracticeClick = () => {
    navigate("/practice");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white">
      {/* 头部 - 头像 */}
      <div className="relative z-20 p-6">
        <button
          onClick={handleAvatarClick}
          className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 hover:border-gray-500 transition-all hover:scale-105 cursor-pointer"
        >
          {user?.name ? (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xl">
              ?
            </div>
          )}
        </button>
      </div>

      {/* 中间 - 随机单词 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 -mt-20">
        <div className="text-center">
          <h1 className="text-6xl font-serif font-light text-black mb-3 tracking-wide">
            {randomWord.word}
          </h1>
          <p className="text-gray-700 text-lg">{randomWord.meaning}</p>
        </div>
      </div>

      {/* 底部 - Practice 卡片 */}
      <div className="relative z-10 px-6 pb-24">
        {/* Practice 卡片 */}
        <button
          onClick={handlePracticeClick}
          className="w-full bg-gray-100 rounded-2xl p-6 text-left hover:bg-gray-200 transition-all active:scale-95 border border-gray-300"
        >
          <h3 className="text-black text-2xl font-semibold mb-2">Practice</h3>
          <p className="text-blue-600 text-3xl font-bold">{practiceTotal}</p>
        </button>
      </div>
    </div>
  );
};

export default Home;
