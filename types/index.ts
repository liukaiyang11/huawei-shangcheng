// 需求数据结构
export interface Requirement {
  id: string
  createdAt: Date
  status: "pending" | "matching" | "completed"

  // 原始输入
  rawInput: {
    type: "voice" | "text" | "image"
    content: string
    attachments?: string[]
  }

  // AI结构化后的数据
  structured: {
    // Who - 身份与背景
    industry: string // 行业
    companyType: string // 企业类型
    decisionStyle: string // 决策链特征

    // Why - 痛点/落差
    currentState: string // 现状
    targetState: string // 目标

    // What - 具体需求
    computePower: {
      type: "training" | "inference" | "both"
      model: string[] // 昇腾型号
      capacity: string // 算力需求
    }
    scenario: string[] // 应用场景标签
    technicalRequirements: string // 技术指标

    // How Much - 边界条件
    budget: {
      amount: string
      range: "low" | "medium" | "high"
    }
    scale: {
      nodes: number
      concurrent: number
    }
    timeline: string
    urgency: "low" | "medium" | "high"
  }

  // 匹配结果
  matchedCases?: string[] // 匹配到的案例ID
  generatedProposal?: string // 生成的方案PDF链接

  assignedTo?: string // 分配给的方案专家
}

// 落地案例数据结构
export interface Case {
  id: string
  createdAt: Date

  // 场景锚点
  title: string // 一句话标题
  industry: string
  scenarioTags: string[] // 场景标签
  softwareScenario: string // 软件场景描述

  // 硬核配置
  hardware: {
    model: string // 硬件型号
    quantity: number
    nodes: number
  }
  software: {
    framework: string // 框架
    platform: string // 平台
  }
  capability: {
    concurrent: number
    throughput: string
  }

  // 价值量化
  roi: {
    efficiencyIncrease: string // 效率提升
    costReduction: string // 成本降低
    deliveryTime: string // 交付时间
    stability: string // 稳定性
  }

  // 可复制性
  resources: {
    pptUrl?: string
    videoUrl?: string
    productLinks: string[]
  }

  // 详细信息
  customerPainPoint: string // 客户痛点
  technicalArchitecture: string // 技术路线
  implementationDetails: string // 实施细节
  results: string // 成果

  // 向量化（用于语义检索）
  embedding?: number[] // 实际使用时需要真实的向量
}
