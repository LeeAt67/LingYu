/**
 * 密码强度指示器组件
 * 显示密码强度和要求提示
 */
import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "至少8个字符", test: (p) => p.length >= 8 },
  { label: "包含大写字母", test: (p) => /[A-Z]/.test(p) },
  { label: "包含小写字母", test: (p) => /[a-z]/.test(p) },
  { label: "包含数字", test: (p) => /\d/.test(p) },
  { label: "包含特殊字符", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const { strength, metRequirements } = useMemo(() => {
    const met = requirements.filter((req) => req.test(password)).length;
    let strengthLevel = 0;

    if (met >= 5) strengthLevel = 4; // 强
    else if (met >= 4) strengthLevel = 3; // 中等
    else if (met >= 2) strengthLevel = 2; // 弱
    else if (met >= 1) strengthLevel = 1; // 很弱

    return { strength: strengthLevel, metRequirements: met };
  }, [password]);

  const getStrengthColor = () => {
    switch (strength) {
      case 4:
        return "bg-green-500";
      case 3:
        return "bg-blue-500";
      case 2:
        return "bg-yellow-500";
      case 1:
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 4:
        return "强";
      case 3:
        return "中等";
      case 2:
        return "弱";
      case 1:
        return "很弱";
      default:
        return "";
    }
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* 强度条 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">密码强度</span>
          {strength > 0 && (
            <span
              className={`font-medium ${
                strength >= 3 ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {getStrengthText()}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-colors ${
                level <= strength ? getStrengthColor() : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 要求列表 */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {isMet ? (
                <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
              <span className={isMet ? "text-green-600" : "text-text-tertiary"}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
