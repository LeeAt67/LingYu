/**
 * 音频可视化组件
 * 功能: 实时显示音频波形
 *
 * @example
 * ```tsx
 * <AudioVisualizer
 *   analyser={analyserNode}
 *   type="input"
 *   isActive={true}
 * />
 * ```
 */
import { useEffect, useRef, memo } from "react";

interface AudioVisualizerProps {
  /** Web Audio API 的 AnalyserNode */
  analyser: AnalyserNode | null;
  /** 可视化类型 */
  type: "input" | "output";
  /** 是否激活 */
  isActive: boolean;
  /** 自定义类名 */
  className?: string;
}

const AudioVisualizer = ({
  analyser,
  type,
  isActive,
  className = "",
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 绘制波形
    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      if (!isActive || !analyser) {
        // 绘制静默状态（平直线）
        ctx.strokeStyle = type === "input" ? "#D1D5DB" : "#93C5FD";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // 获取音频数据
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // 绘制波形
      ctx.strokeStyle = type === "input" ? "#3B82F6" : "#10B981";
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, type, isActive]);

  return (
    <div
      className={`relative w-full h-20 bg-gray-50 rounded-lg overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        aria-label={`${type === "input" ? "输入" : "输出"}音频波形`}
      />
    </div>
  );
};

export default memo(AudioVisualizer);
