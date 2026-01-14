import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  fileName: string;
  progress: number;
}

/**
 * 进度条组件
 * 显示模型文件加载进度
 */
export const ProgressBar = ({ fileName, progress }: ProgressBarProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{fileName}</span>
        <span className="font-medium">{progress.toFixed(2)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
