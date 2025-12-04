"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Loader2, Send, FileText, Edit2, ImageIcon, Save, X } from "lucide-react"
import { extractStructuredData } from "@/lib/mock-ai"
import type { Requirement } from "@/types"

interface RequirementInputProps {
  mode?: "create" | "edit"
  initialData?: Requirement["structured"]
  onSubmit?: (requirement: Requirement) => void
  onSave?: (data: Partial<Requirement["structured"]>) => void
  onCancel?: () => void
}

export function RequirementInput({ mode = "create", initialData, onSubmit, onSave, onCancel }: RequirementInputProps) {
  const [inputType, setInputType] = useState<"text" | "voice" | "image">("text")
  const [rawInput, setRawInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [structuredData, setStructuredData] = useState<Requirement["structured"] | null>(
    mode === "edit" && initialData ? initialData : null,
  )
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [parsingProgress, setParsingProgress] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setStructuredData(initialData)
    }
  }, [mode, initialData])

  const handleVoiceInput = async () => {
    setIsRecording(true)
    setParsingProgress("正在录音...")

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsRecording(false)
    setParsingProgress("语音转文字中...")

    const voiceText =
      "客户是做智慧交通的，想在路口部署边缘计算，大概50个路口，需要识别车牌和行人，预算大概200万，想用昇腾的卡。"

    let currentText = ""
    for (let i = 0; i < voiceText.length; i += 5) {
      currentText = voiceText.substring(0, i + 5)
      setRawInput(currentText)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setRawInput(voiceText)
    setInputType("voice")
    setParsingProgress("")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setParsingProgress("正在上传图片...")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    setInputType("image")

    setParsingProgress("OCR识别中...")
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setParsingProgress("提取关键信息...")

    const extractedText = "客户需求：智慧医疗影像识别系统\n预算：150万\n场景：CT/MRI图像分析\n硬件偏好：昇腾910B"

    let currentText = ""
    for (let i = 0; i < extractedText.length; i += 8) {
      currentText = extractedText.substring(0, i + 8)
      setRawInput(currentText)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setRawInput(extractedText)
    setIsUploading(false)
    setParsingProgress("")
  }

  const handleAIProcess = async () => {
    if (!rawInput.trim()) return

    setIsProcessing(true)
    setParsingProgress("AI分析中...")

    try {
      setParsingProgress("识别客户行业...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      setParsingProgress("分析技术需求...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      setParsingProgress("评估项目规模...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      const structured = await extractStructuredData(rawInput)
      setStructuredData(structured)
      setParsingProgress("分析完成")

      setTimeout(() => setParsingProgress(""), 1000)
    } catch (error) {
      console.error("AI processing error:", error)
      setParsingProgress("分析失败，请重试")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublish = () => {
    if (!structuredData) return

    const requirement: Requirement = {
      id: `req-${Date.now()}`,
      createdAt: new Date(),
      status: "pending",
      rawInput: {
        type: inputType,
        content: rawInput,
        attachments: uploadedImage ? [uploadedImage] : undefined,
      },
      structured: structuredData,
    }

    onSubmit?.(requirement)

    setRawInput("")
    setStructuredData(null)
    setUploadedImage(null)
    setParsingProgress("")
  }

  const handleSave = () => {
    if (!structuredData) return
    onSave?.(structuredData)
  }

  const updateStructuredField = (path: string, value: any) => {
    if (!structuredData) return

    setStructuredData((prev) => {
      if (!prev) return prev
      const updated = { ...prev }
      const keys = path.split(".")
      let current: any = updated

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value

      return updated
    })
  }

  return (
    <div className="space-y-6">
      {mode === "create" && (
        <Card className="floating-card border-border/50">
          <CardHeader>
            <CardTitle className="text-[#333333]">需求录入</CardTitle>
            <CardDescription className="text-[#8C8C8C]">通过语音、文本或图片快速记录客户需求</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={isRecording ? "default" : "outline"}
                className={`flex-1 ${isRecording ? "bg-[#2E6BE6] hover:bg-[#0036C3]" : "border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 hover:border-[#2E6BE6]"}`}
                onClick={handleVoiceInput}
                disabled={isProcessing || isUploading}
              >
                {isRecording ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    录音中...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    语音输入
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 hover:border-[#2E6BE6] bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    上传图片
                  </>
                )}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {uploadedImage && (
              <div className="relative rounded-lg overflow-hidden border border-[#E8EAED]">
                <img src={uploadedImage || "/placeholder.svg"} alt="上传的图片" className="w-full h-48 object-cover" />
              </div>
            )}

            {parsingProgress && (
              <div className="flex items-center gap-2 text-sm text-[#2E6BE6] bg-[#2E6BE6]/5 px-3 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{parsingProgress}</span>
              </div>
            )}

            <div>
              <Textarea
                placeholder="粘贴客户需求、微信聊天记录或手动输入...&#10;&#10;例如：客户是做智慧交通的，想在路口部署边缘计算，大概50个路口，需要识别车牌和行人，预算大概200万，想用昇腾的卡。"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="min-h-[120px] resize-none border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333] placeholder:text-[#8C8C8C]"
                disabled={isProcessing || isUploading}
              />
            </div>

            <Button
              className="w-full bg-[#2E6BE6] hover:bg-[#0036C3] text-white"
              onClick={handleAIProcess}
              disabled={!rawInput.trim() || isProcessing || isUploading || !!parsingProgress}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI分析中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  AI智能分析
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {structuredData && (
        <Card className="floating-card border-[#2E6BE6]/50 tech-glow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#333333]">
              <span>{mode === "edit" ? "编辑需求信息" : "AI结构化分析结果"}</span>
              <Badge className="bg-[#2E6BE6]/10 text-[#2E6BE6] border-[#2E6BE6]/20">
                <Edit2 className="h-3 w-3 mr-1" />
                可编辑
              </Badge>
            </CardTitle>
            <CardDescription className="text-[#8C8C8C]">
              {mode === "edit" ? "修改需求信息后点击保存" : "请核对并修改AI提取的信息，确认无误后发布"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">客户背景</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">行业</label>
                  <Input
                    value={structuredData.industry}
                    onChange={(e) => updateStructuredField("industry", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">企业类型</label>
                  <Input
                    value={structuredData.companyType}
                    onChange={(e) => updateStructuredField("companyType", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-[#8C8C8C]">决策特征</label>
                  <Input
                    value={structuredData.decisionStyle}
                    onChange={(e) => updateStructuredField("decisionStyle", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8EAED]" />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">痛点分析</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">当前状态</label>
                  <Textarea
                    value={structuredData.currentState}
                    onChange={(e) => updateStructuredField("currentState", e.target.value)}
                    className="min-h-[60px] resize-none border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">目标状态</label>
                  <Textarea
                    value={structuredData.targetState}
                    onChange={(e) => updateStructuredField("targetState", e.target.value)}
                    className="min-h-[60px] resize-none border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8EAED]" />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">技术需求</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">昇腾型号（逗号分隔）</label>
                  <Input
                    value={structuredData.computePower.model.join(", ")}
                    onChange={(e) =>
                      updateStructuredField(
                        "computePower.model",
                        e.target.value.split(",").map((s) => s.trim()),
                      )
                    }
                    placeholder="例如：昇腾310, 昇腾910"
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333] placeholder:text-[#8C8C8C]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8C8C8C]">算力类型</label>
                    <select
                      value={structuredData.computePower.type}
                      onChange={(e) => updateStructuredField("computePower.type", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-[#E8EAED] bg-background px-3 py-1 text-sm text-[#333333] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2E6BE6]"
                    >
                      <option value="training">训练</option>
                      <option value="inference">推理</option>
                      <option value="both">训练+推理</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8C8C8C]">算力容量</label>
                    <Input
                      value={structuredData.computePower.capacity}
                      onChange={(e) => updateStructuredField("computePower.capacity", e.target.value)}
                      className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">应用场景（逗号分隔）</label>
                  <Input
                    value={structuredData.scenario.join(", ")}
                    onChange={(e) =>
                      updateStructuredField(
                        "scenario",
                        e.target.value.split(",").map((s) => s.trim()),
                      )
                    }
                    placeholder="例如：车牌识别, 行人检测"
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333] placeholder:text-[#8C8C8C]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8EAED]" />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">项目边界</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">预算金额</label>
                  <Input
                    value={structuredData.budget.amount}
                    onChange={(e) => updateStructuredField("budget.amount", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">预算范围</label>
                  <select
                    value={structuredData.budget.range}
                    onChange={(e) => updateStructuredField("budget.range", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[#E8EAED] bg-background px-3 py-1 text-sm text-[#333333] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2E6BE6]"
                  >
                    <option value="low">有限</option>
                    <option value="medium">中等</option>
                    <option value="high">充足</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">节点数量</label>
                  <Input
                    type="number"
                    value={structuredData.scale.nodes}
                    onChange={(e) => updateStructuredField("scale.nodes", Number.parseInt(e.target.value) || 0)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">并发数</label>
                  <Input
                    type="number"
                    value={structuredData.scale.concurrent}
                    onChange={(e) => updateStructuredField("scale.concurrent", Number.parseInt(e.target.value) || 0)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">时间线</label>
                  <Input
                    value={structuredData.timeline}
                    onChange={(e) => updateStructuredField("timeline", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">紧急程度</label>
                  <select
                    value={structuredData.urgency}
                    onChange={(e) => updateStructuredField("urgency", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[#E8EAED] bg-background px-3 py-1 text-sm text-[#333333] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2E6BE6]"
                  >
                    <option value="low">不急</option>
                    <option value="medium">一般</option>
                    <option value="high">紧急</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {mode === "create" ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 hover:border-[#2E6BE6] bg-transparent"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    仅保存
                  </Button>
                  <Button className="flex-1 bg-[#2E6BE6] hover:bg-[#0036C3] text-white" onClick={handlePublish}>
                    <Send className="mr-2 h-4 w-4" />
                    发布需求
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#8C8C8C]/30 text-[#8C8C8C] hover:bg-[#8C8C8C]/10 bg-transparent"
                    onClick={onCancel}
                  >
                    <X className="mr-2 h-4 w-4" />
                    取消
                  </Button>
                  <Button className="flex-1 bg-[#2E6BE6] hover:bg-[#0036C3] text-white" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    保存修改
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
