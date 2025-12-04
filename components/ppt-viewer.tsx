"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react"

interface PPTViewerProps {
  pptUrl: string
  title: string
}

export function PPTViewer({ pptUrl, title }: PPTViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [zoom, setZoom] = useState(100)

  // Mock slides - in production, you'd parse the actual PPT
  const totalSlides = 12
  const mockSlides = [
    { title: "项目概述", content: "客户背景与需求分析" },
    { title: "技术方案", content: "昇腾算力底座架构设计" },
    { title: "硬件配置", content: "Atlas 800 集群部署方案" },
    { title: "软件架构", content: "MindSpore + AI平台" },
    { title: "实施计划", content: "4个阶段实施路线图" },
    { title: "成本分析", content: "投资回报率(ROI)分析" },
  ]

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(1, prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(totalSlides, prev + 1))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#333333]">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#8C8C8C] min-w-[60px] text-center">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            下载
          </Button>
        </div>
      </div>

      {/* Slide viewer */}
      <div className="relative bg-[#F5F7FA] rounded-lg p-8 min-h-[500px] flex items-center justify-center">
        <div className="bg-white shadow-lg rounded p-12 max-w-4xl w-full" style={{ transform: `scale(${zoom / 100})` }}>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#0036C3] mb-4">
                {mockSlides[(currentSlide - 1) % mockSlides.length].title}
              </h2>
              <p className="text-xl text-[#333333]">{mockSlides[(currentSlide - 1) % mockSlides.length].content}</p>
            </div>

            {/* Placeholder for slide content */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="h-32 bg-[#2E6BE6]/10 rounded flex items-center justify-center text-[#8C8C8C]">
                图表区域
              </div>
              <div className="h-32 bg-[#2E6BE6]/10 rounded flex items-center justify-center text-[#8C8C8C]">
                数据展示
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevSlide}
          disabled={currentSlide === 1}
          className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一页
        </Button>

        <span className="text-sm text-[#8C8C8C]">
          {currentSlide} / {totalSlides}
        </span>

        <Button
          variant="outline"
          onClick={handleNextSlide}
          disabled={currentSlide === totalSlides}
          className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 bg-transparent"
        >
          下一页
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
