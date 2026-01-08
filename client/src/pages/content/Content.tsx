/**
 * 我的内容页面 - Content
 * 展示用户的学习内容、词书、句库、笔记等
 */
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Sun,
  BookOpen,
  CheckCircle,
  Folder,
  MessageSquare,
  Edit3,
  ChevronRight,
} from "lucide-react";

const ContentPage = () => {
  const navigate = useNavigate();

  // 学习统计数据
  const learningStats = [
    {
      id: "cascade",
      name: "随斯",
      icon: "🌊",
      color: "from-orange-500 to-orange-600",
      stats: [
        { label: "回顾", count: 0, unit: "词" },
        { label: "预习", count: 40, unit: "词" },
      ],
    },
    {
      id: "listen",
      name: "听写",
      icon: "🎧",
      color: "from-cyan-500 to-cyan-600",
      stats: [{ label: "随堂测", count: 0, unit: "词" }],
    },
  ];

  // 内容分类
  const contentSections = [
    {
      id: "vocabulary",
      icon: BookOpen,
      label: "在学词书",
      count: 4755,
      unit: "词",
      color: "text-cyan-600",
    },
    {
      id: "recent",
      icon: CheckCircle,
      label: "近日已学",
      count: null,
      subLabel: "最近没有学习",
      color: "text-yellow-600",
    },
    {
      id: "all",
      icon: CheckCircle,
      label: "全部已学",
      count: 220,
      unit: "词",
      color: "text-yellow-600",
    },
  ];

  const resourceSections = [
    {
      id: "notebook",
      icon: Folder,
      label: "单词本",
      count: 1,
      unit: "本",
      color: "text-blue-600",
    },
    {
      id: "sentences",
      icon: MessageSquare,
      label: "句库",
      count: 0,
      unit: "句",
      color: "text-blue-600",
    },
    {
      id: "notes",
      icon: Edit3,
      label: "笔记",
      count: 16,
      unit: "条",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-300">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium">我的内容</h1>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Sun className="w-6 h-6" />
        </button>
      </div>

      {/* Learning Stats Cards */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {learningStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-gray-100 rounded-2xl p-4 border border-gray-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className="font-medium">{stat.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {stat.stats.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-3 border border-gray-200"
                >
                  <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold">{item.count}</span>
                    <span className="text-xs text-gray-600">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="px-4 mt-6 space-y-3">
        {contentSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className="w-full bg-gray-100 rounded-2xl p-4 border border-gray-300 flex items-center justify-between hover:bg-gray-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${section.color}`} />
                <span className="font-medium">{section.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {section.count !== null ? (
                  <span className="text-gray-600">
                    {section.count} {section.unit}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    {section.subLabel}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Resource Sections */}
      <div className="px-4 mt-6 space-y-3">
        {resourceSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className="w-full bg-gray-100 rounded-2xl p-4 border border-gray-300 flex items-center justify-between hover:bg-gray-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${section.color}`} />
                <span className="font-medium">{section.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  {section.count} {section.unit}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContentPage;
