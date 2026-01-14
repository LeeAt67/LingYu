import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/constants/languages";

interface LanguageSelectorProps {
  type: "source" | "target";
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * 语言选择器组件
 * 提供下拉菜单选择源语言或目标语言
 */
export const LanguageSelector = ({
  type,
  value,
  onChange,
  disabled = false,
}: LanguageSelectorProps) => {
  const label = type === "source" ? "源语言" : "目标语言";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`选择${label}`} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LANGUAGES).map(([name, code]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
