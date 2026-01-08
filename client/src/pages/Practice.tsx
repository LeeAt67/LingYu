/**
 * Practice练习页面
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getPracticeWords,
  submitPracticeAnswer,
  type PracticeWord,
} from "@/api/practice";

const Practice = () => {
  const navigate = useNavigate();

  const [words, setWords] = useState<PracticeWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [showBubble, setShowBubble] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化练习单词
  useEffect(() => {
    const initPractice = async () => {
      const practiceWords = await getPracticeWords({ count: 10 });
      if (practiceWords.length > 0) {
        setWords(practiceWords);
        setStartTime(Date.now());
      }
      setIsLoading(false);
    };
    initPractice();
  }, []);

  // 气泡显示2秒后隐藏
  useEffect(() => {
    if (words.length === 0) return;
    setShowBubble(true);
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentWordIndex, words.length]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOptionClick = async (optionIndex: number) => {
    if (isAnswered || words.length === 0) return;

    setIsAnswered(true);
    setSelectedOptionIndex(optionIndex);

    const currentWord = words[currentWordIndex];
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // 判断答案是否正确（第一个选项为正确答案，isCorrect为true）
    const correctOptionIndex = currentWord.options.findIndex(
      (opt) => opt.isCorrect
    );
    const isCorrect = optionIndex === correctOptionIndex;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    // 提交答案
    await submitPracticeAnswer({
      wordId: currentWord.id,
      isCorrect,
      timeSpent,
    });

    // 1.5秒后跳转到下一题
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedOptionIndex(null);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        // 练习完成,返回首页
        navigate("/");
      }
    }, 1500);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // 获取选项的样式
  const getOptionStyle = (optionIndex: number) => {
    if (words.length === 0) return "";

    const currentWord = words[currentWordIndex];
    const correctOptionIndex = currentWord.options.findIndex(
      (opt) => opt.isCorrect
    );

    if (!isAnswered && !showAnswer) {
      return "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black";
    }

    // 显示答案或已答题后显示正确/错误
    if (optionIndex === correctOptionIndex) {
      return "bg-green-500 text-white border border-green-600";
    }
    if (
      optionIndex === selectedOptionIndex &&
      optionIndex !== correctOptionIndex
    ) {
      return "bg-red-500 text-white border border-red-600";
    }
    return "bg-gray-50 opacity-60 border border-gray-200 text-gray-500";
  };

  // 加载中界面
  if (isLoading || words.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="text-black text-center">
          <div className="mb-8">
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">正在加载练习...</h2>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[currentWordIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-gray-100 border-b border-gray-300">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black">练习</h1>
        <div className="w-10" /> {/* 占位元素保持居中 */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* 单词卡片 */}
        <div className="w-full max-w-md mb-8 relative">
          {/* 气泡提示 */}
          {showBubble && currentWord.practiceCount > 0 && (
            <div className="absolute -top-2 -right-2 z-10 animate-bounce">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap">
                已练习 {currentWord.practiceCount} 次~
                {/* 小三角 */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-indigo-500" />
              </div>
            </div>
          )}

          <div className="bg-gray-100 border-2 border-gray-300 rounded-3xl p-8 shadow-lg">
            <h2 className="text-5xl font-light text-black mb-3 tracking-wide">
              {currentWord.word}
            </h2>
            <p className="text-gray-600 text-base mb-4">
              {currentWord.phonetic}
            </p>
            <p className="text-gray-500 text-sm">
              先回想词义再选择，想不起来↓看答案↓
            </p>
          </div>
        </div>

        {/* 选项列表 */}
        <div className="w-full max-w-md space-y-3">
          {currentWord.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isAnswered || showAnswer}
              className={`w-full rounded-2xl py-4 px-5 text-left transition-all ${getOptionStyle(
                index
              )}`}
            >
              <div className="text-sm mb-1">{option.type}</div>
              <div className="text-base font-medium">{option.meaning}</div>
            </button>
          ))}
        </div>

        {/* 看答案按钮 */}
        {!isAnswered && !showAnswer && (
          <button
            onClick={handleShowAnswer}
            className="mt-6 text-blue-600 text-base font-medium underline underline-offset-4 hover:text-blue-700 transition-colors"
          >
            看答案
          </button>
        )}
      </div>

      {/* 底部进度 */}
      <div className="px-6 pb-6">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{
              width: `${((currentWordIndex + 1) / words.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-black text-center text-sm mt-2">
          第 {currentWordIndex + 1} / {words.length} 题 · 正确 {correctCount} 题
        </p>
      </div>
    </div>
  );
};

export default Practice;
