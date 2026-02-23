import React from 'react';
import SmartLearningAssistant from '../components/SmartLearningAssistant';

const SmartLearningPage: React.FC = () => {
  // 这里应该从认证状态或路由参数中获取用户ID
  const userId = 'user-id-placeholder'; // 实际项目中应该从认证状态获取

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            智能学习助手
          </h1>
          <p className="text-gray-600">
            基于你的个人知识库，提供智能问答、知识关联和学习建议
          </p>
        </div>
        
        <SmartLearningAssistant userId={userId} />
      </div>
    </div>
  );
};

export default SmartLearningPage;
