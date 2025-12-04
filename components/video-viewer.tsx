"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, Download } from "lucide-react"

interface VideoViewerProps {
  videoUrl: string
  title: string
}

export function VideoViewer({ videoUrl, title }: VideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          await videoRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        // Silently catch AbortError when play is interrupted
        console.log("[v0] Video play interrupted:", error)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen()
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#333333]">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 bg-transparent"
        >
          <Download className="h-4 w-4 mr-2" />
          下载视频
        </Button>
      </div>

      {/* Video player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          poster="/product-demo-thumbnail.png"
        >
          <source src={videoUrl} type="video/mp4" />
          您的浏览器不支持视频播放
        </video>

        {/* Custom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="space-y-2">
            {/* Progress bar */}
            <div className="relative h-1 bg-white/30 rounded-full cursor-pointer">
              <div
                className="absolute h-full bg-[#2E6BE6] rounded-full"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video description */}
      <div className="bg-[#F5F7FA] rounded-lg p-4">
        <h4 className="font-semibold text-sm text-[#333333] mb-2">演示说明</h4>
        <p className="text-sm text-[#8C8C8C] leading-relaxed">
          本视频展示了完整的产品功能演示，包括系统部署、实时识别效果、管理平台操作等核心功能模块。
        </p>
      </div>
    </div>
  )
}
