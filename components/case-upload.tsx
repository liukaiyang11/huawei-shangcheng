"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Video, Loader2, X, Save, Send } from "lucide-react"
import type { Case } from "@/types"

interface CaseUploadProps {
  mode?: "create" | "edit"
  initialData?: Case
  onSubmit?: (data: any) => void
  onSave?: (data: Partial<Case>) => void
  onCancel?: () => void
}

export function CaseUpload({ mode = "create", initialData, onSubmit, onSave, onCancel }: CaseUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; url: string }[]>([])
  const [parsingProgress, setParsingProgress] = useState("")
  const [hasAIParsed, setHasAIParsed] = useState(false)

  const pptInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [manualData, setManualData] = useState({
    title: "",
    industry: "",
    scenario: "",
    softwareScenario: "",
    hardware: "",
    hardwareQuantity: "",
    hardwareNodes: "",
    software: "",
    softwarePlatform: "",
    concurrent: "",
    throughput: "",
    customerPain: "",
    technicalArchitecture: "",
    implementation: "",
    results: "",
    efficiencyIncrease: "",
    costReduction: "",
    deliveryTime: "",
    stability: "",
    pptUrl: "",
    videoUrl: "",
  })

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setManualData({
        title: initialData.title,
        industry: initialData.industry,
        scenario: initialData.scenarioTags.join(", "),
        softwareScenario: initialData.softwareScenario,
        hardware: initialData.hardware.model,
        hardwareQuantity: initialData.hardware.quantity.toString(),
        hardwareNodes: initialData.hardware.nodes.toString(),
        software: initialData.software.framework,
        softwarePlatform: initialData.software.platform,
        concurrent: initialData.capability?.concurrent?.toString() || "",
        throughput: initialData.capability?.throughput || "",
        customerPain: initialData.customerPainPoint,
        technicalArchitecture: initialData.technicalArchitecture,
        implementation: initialData.implementationDetails,
        results: initialData.results,
        efficiencyIncrease: initialData.roi.efficiencyIncrease,
        costReduction: initialData.roi.costReduction,
        deliveryTime: initialData.roi.deliveryTime,
        stability: initialData.roi.stability,
        pptUrl: initialData.resources.pptUrl || "",
        videoUrl: initialData.resources.videoUrl || "",
      })
      setHasAIParsed(true)
    }
  }, [mode, initialData])

  const handleFileUpload = async (file: File, type: "ppt" | "video") => {
    setIsUploading(true)
    setParsingProgress(type === "ppt" ? "正在解析PPT文档..." : "正在处理视频...")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const fileUrl = URL.createObjectURL(file)
    setUploadedFiles((prev) => [...prev, { name: file.name, type, url: fileUrl }])

    if (type === "ppt") {
      setParsingProgress("提取项目标题和行业信息...")
      await new Promise((resolve) => setTimeout(resolve, 800))
      setManualData((prev) => ({
        ...prev,
        title: "某银行OCR票据识别项目",
        industry: "金融",
      }))

      setParsingProgress("分析应用场景和技术栈...")
      await new Promise((resolve) => setTimeout(resolve, 800))
      setManualData((prev) => ({
        ...prev,
        scenario: "OCR识别, 私有化部署, 票据处理",
        softwareScenario:
          "基于MindSpore深度学习框架，实现票据的文字识别、信息提取和智能分类。支持多种格式票据（发票、支票、汇票），通过自然语言处理技术实现结构化数据输出。",
      }))

      setParsingProgress("提取硬件配置和架构信息...")
      await new Promise((resolve) => setTimeout(resolve, 800))
      setManualData((prev) => ({
        ...prev,
        hardware: "Atlas 800 (Model 9000)",
        hardwareQuantity: "8",
        hardwareNodes: "8",
        software: "MindSpore",
        softwarePlatform: "华为AI决策方案平台",
        concurrent: "1000",
        throughput: "10万张/小时",
      }))

      setParsingProgress("分析客户痛点和技术架构...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setManualData((prev) => ({
        ...prev,
        customerPain: "人工票据审核效率低下，每天需处理10万+票据，错误率达5%，速度慢影响业务流程，且人力成本高昂。",
        technicalArchitecture:
          "昇腾910B训练卡 + 昇腾310推理部署，云边端三层架构。采用分布式训练加速模型迭代，边缘侧部署轻量化推理模型。",
      }))

      setParsingProgress("提取实施方案和成果数据...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setManualData((prev) => ({
        ...prev,
        implementation:
          "部署8节点Atlas 800集群用于模型训练，50个边缘节点用于推理。采用联邦学习保护数据隐私，模型准确率达98%以上。",
        results: "系统上线后日处理量提升500%，识别准确率98%+，人工审核工作量减少90%，年节省人力成本约300万元。",
        efficiencyIncrease: "500%",
        costReduction: "30%",
        deliveryTime: "45天",
        stability: "99.99%",
        pptUrl: "/demo/solution.pdf",
        videoUrl: "/demo/product-demo.mp4",
      }))

      setHasAIParsed(true)
    }

    setParsingProgress("解析完成！")
    await new Promise((resolve) => setTimeout(resolve, 500))
    setParsingProgress("")
    setIsUploading(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (mode === "edit") {
      onSave?.({
        title: manualData.title,
        industry: manualData.industry,
        scenarioTags: manualData.scenario.split(",").map((s) => s.trim()),
        softwareScenario: manualData.softwareScenario,
        hardware: {
          model: manualData.hardware,
          quantity: Number.parseInt(manualData.hardwareQuantity) || 0,
          nodes: Number.parseInt(manualData.hardwareNodes) || 0,
        },
        software: {
          framework: manualData.software,
          platform: manualData.softwarePlatform,
        },
        capability: {
          concurrent: Number.parseInt(manualData.concurrent) || 0,
          throughput: manualData.throughput,
        },
        customerPainPoint: manualData.customerPain,
        technicalArchitecture: manualData.technicalArchitecture,
        implementationDetails: manualData.implementation,
        results: manualData.results,
        roi: {
          efficiencyIncrease: manualData.efficiencyIncrease,
          costReduction: manualData.costReduction,
          deliveryTime: manualData.deliveryTime,
          stability: manualData.stability,
        },
        resources: {
          pptUrl: manualData.pptUrl,
          videoUrl: manualData.videoUrl,
          productLinks: [],
        },
      })
    } else {
      onSubmit?.({
        ...manualData,
        hardwareQuantity: Number.parseInt(manualData.hardwareQuantity) || 0,
        hardwareNodes: Number.parseInt(manualData.hardwareNodes) || 0,
        concurrent: Number.parseInt(manualData.concurrent) || 0,
      })
    }
  }

  return (
    <div className="space-y-6">
      {mode === "create" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#2E6BE6]/30 rounded-lg p-8 text-center hover:border-[#2E6BE6] transition-colors">
                  <Upload className="h-12 w-12 text-[#2E6BE6] mx-auto mb-4" />
                  <p className="text-sm text-[#8C8C8C] mb-4">
                    上传方案PPT、Word文档或演示视频
                    <br />
                    AI将自动解析文档内容并填充到下方输入框
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pptInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      选择文档
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      选择视频
                    </Button>
                  </div>
                  <input
                    ref={pptInputRef}
                    type="file"
                    accept=".ppt,.pptx,.doc,.docx,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "ppt")
                    }}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "video")
                    }}
                  />
                </div>

                {parsingProgress && (
                  <div className="flex items-center gap-2 text-sm text-[#2E6BE6] bg-[#2E6BE6]/5 px-4 py-3 rounded-lg border border-[#2E6BE6]/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{parsingProgress}</span>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#333333]">已上传文件</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-[#F5F7FA] rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          {file.type === "ppt" ? (
                            <FileText className="h-4 w-4 text-[#2E6BE6]" />
                          ) : (
                            <Video className="h-4 w-4 text-[#2E6BE6]" />
                          )}
                          <span className="text-sm text-[#333333]">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-[#8C8C8C] hover:text-[#FF4D4F]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!hasAIParsed && uploadedFiles.length === 0 && (
            <div className="text-center text-sm text-[#8C8C8C] py-2">请上传文档后，AI将自动填充下方表单</div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-semibold text-[#333333]">
          {mode === "edit" ? "编辑案例信息" : hasAIParsed ? "AI解析结果（可编辑）" : "案例信息"}
        </h4>

        <div className="grid gap-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">基本信息</h5>
            <div className="space-y-2">
              <label className="text-sm text-[#8C8C8C]">项目标题</label>
              <Input
                value={manualData.title}
                onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                placeholder="例如：某银行OCR票据识别项目"
                className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">行业</label>
                <Input
                  value={manualData.industry}
                  onChange={(e) => setManualData({ ...manualData, industry: e.target.value })}
                  placeholder="例如：金融"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">应用场景标签（逗号分隔）</label>
                <Input
                  value={manualData.scenario}
                  onChange={(e) => setManualData({ ...manualData, scenario: e.target.value })}
                  placeholder="例如：OCR识别, 私有化部署"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#8C8C8C]">软件场景描述</label>
              <Textarea
                value={manualData.softwareScenario}
                onChange={(e) => setManualData({ ...manualData, softwareScenario: e.target.value })}
                placeholder="描述使用的框架、算法和具体功能模块..."
                className="min-h-[100px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
              />
            </div>
          </div>

          {/* 硬核配置 */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">硬核配置</h5>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">硬件型号</label>
                <Input
                  value={manualData.hardware}
                  onChange={(e) => setManualData({ ...manualData, hardware: e.target.value })}
                  placeholder="Atlas 800"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">数量（台）</label>
                <Input
                  type="number"
                  value={manualData.hardwareQuantity}
                  onChange={(e) => setManualData({ ...manualData, hardwareQuantity: e.target.value })}
                  placeholder="8"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">节点数</label>
                <Input
                  type="number"
                  value={manualData.hardwareNodes}
                  onChange={(e) => setManualData({ ...manualData, hardwareNodes: e.target.value })}
                  placeholder="8"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">软件框架</label>
                <Input
                  value={manualData.software}
                  onChange={(e) => setManualData({ ...manualData, software: e.target.value })}
                  placeholder="MindSpore"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">软件平台</label>
                <Input
                  value={manualData.softwarePlatform}
                  onChange={(e) => setManualData({ ...manualData, softwarePlatform: e.target.value })}
                  placeholder="华为AI决策方案平台"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">并发数</label>
                <Input
                  type="number"
                  value={manualData.concurrent}
                  onChange={(e) => setManualData({ ...manualData, concurrent: e.target.value })}
                  placeholder="1000"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">吞吐量</label>
                <Input
                  value={manualData.throughput}
                  onChange={(e) => setManualData({ ...manualData, throughput: e.target.value })}
                  placeholder="500路视频流实时分析"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>
          </div>

          {/* 客户痛点与方案 */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">客户痛点与方案</h5>
            <div className="space-y-2">
              <label className="text-sm text-[#8C8C8C]">客户痛点</label>
              <Textarea
                value={manualData.customerPain}
                onChange={(e) => setManualData({ ...manualData, customerPain: e.target.value })}
                placeholder="描述客户面临的主要问题..."
                className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#8C8C8C]">技术架构</label>
              <Textarea
                value={manualData.technicalArchitecture}
                onChange={(e) => setManualData({ ...manualData, technicalArchitecture: e.target.value })}
                placeholder="描述技术架构和系统设计..."
                className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#8C8C8C]">实施细节</label>
              <Textarea
                value={manualData.implementation}
                onChange={(e) => setManualData({ ...manualData, implementation: e.target.value })}
                placeholder="描述实施过程和部署细节..."
                className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#8C8C8C]">项目成果</label>
              <Textarea
                value={manualData.results}
                onChange={(e) => setManualData({ ...manualData, results: e.target.value })}
                placeholder="描述项目交付成果和效果..."
                className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
              />
            </div>
          </div>

          {/* 价值量化 */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">价值量化</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">效率提升</label>
                <Input
                  value={manualData.efficiencyIncrease}
                  onChange={(e) => setManualData({ ...manualData, efficiencyIncrease: e.target.value })}
                  placeholder="500%"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">成本降低</label>
                <Input
                  value={manualData.costReduction}
                  onChange={(e) => setManualData({ ...manualData, costReduction: e.target.value })}
                  placeholder="30%"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">交付时间</label>
                <Input
                  value={manualData.deliveryTime}
                  onChange={(e) => setManualData({ ...manualData, deliveryTime: e.target.value })}
                  placeholder="45天"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">系统稳定性</label>
                <Input
                  value={manualData.stability}
                  onChange={(e) => setManualData({ ...manualData, stability: e.target.value })}
                  placeholder="99.99%"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>
          </div>

          {/* 可复制资源 */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">可复制资源</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">方案PPT链接</label>
                <Input
                  value={manualData.pptUrl}
                  onChange={(e) => setManualData({ ...manualData, pptUrl: e.target.value })}
                  placeholder="/demo/solution.pdf"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">演示视频链接</label>
                <Input
                  value={manualData.videoUrl}
                  onChange={(e) => setManualData({ ...manualData, videoUrl: e.target.value })}
                  placeholder="/demo/product-demo.mp4"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          className="flex-1 border-[#8C8C8C]/30 text-[#8C8C8C] hover:bg-[#8C8C8C]/10 bg-transparent"
          onClick={onCancel}
        >
          <FileText className="mr-2 h-4 w-4" />
          仅保存
        </Button>
        <Button className="flex-1 bg-[#2E6BE6] hover:bg-[#0036C3] text-white" onClick={handleSave}>
          {mode === "edit" ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存修改
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              发布案例
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
