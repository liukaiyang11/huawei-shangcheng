import type { Case, Requirement } from "@/types"

export const mockCases: Case[] = [
  {
    id: "case-1",
    createdAt: new Date("2024-01-15"),
    title: "某银行OCR票据识别项目",
    industry: "金融",
    scenarioTags: ["OCR识别", "私有化部署", "票据处理"],
    softwareScenario:
      "基于MindSpore深度学习框架，实现票据的文字识别、信息提取和智能分类。支持多种票据格式（发票、支票、汇票），通过自然语言处理技术实现结构化数据输出。",

    hardware: {
      model: "Atlas 800 (Model 9000)",
      quantity: 8,
      nodes: 8,
    },
    software: {
      framework: "MindSpore",
      platform: "华为AI解决方案平台",
    },
    capability: {
      concurrent: 1000,
      throughput: "1000路视频流实时分析",
    },

    roi: {
      efficiencyIncrease: "500%",
      costReduction: "30%",
      deliveryTime: "45天",
      stability: "99.99%",
    },

    resources: {
      pptUrl: "/demo/bank-ocr-proposal.pdf",
      videoUrl: "/demo/bank-ocr-demo.mp4",
      productLinks: ["/products/atlas-800", "/products/mindspore"],
    },

    customerPainPoint: "人工票据审核效率低下，每天需要处理10万+票据，错误率高达5%",
    technicalArchitecture: "昇腾910B训练 + 昇腾310推理部署，云边端三层架构",
    implementationDetails: "部署8节点Atlas 800集群用于模型训练，50个边缘节点用于推理",
    results: "票据识别准确率达到99.5%，处理速度提升5倍，人力成本降低30%",
  },
  {
    id: "case-2",
    createdAt: new Date("2024-02-20"),
    title: "智慧交通路口监控识别系统",
    industry: "智慧交通",
    scenarioTags: ["计算机视觉", "边缘计算", "车牌识别"],
    softwareScenario:
      "采用YOLO目标检测算法，结合OCR车牌识别技术，实时分析路口视频流。软件包含违章检测、流量统计、事件预警等功能模块，通过边缘AI实现毫秒级响应。",

    hardware: {
      model: "Atlas 500 (昇腾310)",
      quantity: 50,
      nodes: 50,
    },
    software: {
      framework: "TensorFlow + 昇腾适配",
      platform: "华为边缘计算平台",
    },
    capability: {
      concurrent: 200,
      throughput: "200路视频同时处理",
    },

    roi: {
      efficiencyIncrease: "300%",
      costReduction: "40%",
      deliveryTime: "60天",
      stability: "99.9%",
    },

    resources: {
      pptUrl: "/demo/traffic-proposal.pdf",
      productLinks: ["/products/atlas-500"],
    },

    customerPainPoint: "路口监控需要人工巡查，违章识别效率低，无法实时响应",
    technicalArchitecture: "边缘计算架构，每个路口部署Atlas 500，集中管理平台",
    implementationDetails: "50个路口部署边缘计算盒子，实时识别车牌、行人、违章行为",
    results: "识别准确率95%+，实时响应延迟<100ms，大幅提升交通管理效率",
  },
  {
    id: "case-3",
    createdAt: new Date("2024-03-10"),
    title: "电力巡检无人机缺陷识别",
    industry: "电力能源",
    scenarioTags: ["计算机视觉", "缺陷检测", "模型训练"],
    softwareScenario:
      "使用ResNet和Faster R-CNN进行电力设备缺陷检测，支持绝缘子破损、导线断股、塔材锈蚀等多种缺陷类型识别。模型训练采用迁移学习，推理部署在无人机端实现实时检测。",

    hardware: {
      model: "Atlas 800 (昇腾910B)",
      quantity: 4,
      nodes: 4,
    },
    software: {
      framework: "PyTorch + MindSpore",
      platform: "华为ModelArts",
    },
    capability: {
      concurrent: 500,
      throughput: "500张图片/秒",
    },

    roi: {
      efficiencyIncrease: "400%",
      costReduction: "50%",
      deliveryTime: "90天",
      stability: "99.95%",
    },

    resources: {
      pptUrl: "/demo/power-inspection.pdf",
      videoUrl: "/demo/power-demo.mp4",
      productLinks: ["/products/atlas-800", "/products/modelarts"],
    },

    customerPainPoint: "传统人工巡检危险系数高、效率低，无法覆盖全部线路",
    technicalArchitecture: "云端训练 + 边缘推理，无人机搭载昇腾推理模块",
    implementationDetails: "使用昇腾910B训练缺陷识别模型，部署到无人机端昇腾310芯片",
    results: "缺陷识别准确率98%，巡检效率提升4倍，人工成本降低50%",
  },
]

export const mockRequirements: Requirement[] = [
  {
    id: "req-1",
    createdAt: new Date("2024-11-20"),
    status: "pending",
    rawInput: {
      type: "voice",
      content:
        "客户是做智慧交通的，想在路口部署边缘计算，大概50个路口，需要识别车牌和行人，预算大概200万，想用昇腾的卡。",
    },
    structured: {
      industry: "智慧交通",
      companyType: "企业",
      decisionStyle: "技术导向",
      currentState: "完全人工操作",
      targetState: "实现95%以上自动识别率",
      computePower: {
        type: "inference",
        model: ["昇腾310"],
        capacity: "50节点集群",
      },
      scenario: ["计算机视觉", "边缘计算"],
      technicalRequirements: "车牌识别、行人检测、实时处理",
      budget: {
        amount: "200万元",
        range: "high",
      },
      scale: {
        nodes: 50,
        concurrent: 200,
      },
      timeline: "3个月内",
      urgency: "medium",
    },
  },
  {
    id: "req-2",
    createdAt: new Date("2024-11-22"),
    status: "pending",
    rawInput: {
      type: "text",
      content:
        "某三甲医院想做医疗影像AI诊断，CT和X光片自动分析，需要训练模型，数据量大概10万张片子，希望准确率达到95%以上",
    },
    structured: {
      industry: "医疗健康",
      companyType: "医院",
      decisionStyle: "准确性优先",
      currentState: "医生人工阅片，平均每张5分钟",
      targetState: "AI辅助诊断，准确率95%+，速度提升10倍",
      computePower: {
        type: "training",
        model: ["昇腾910B"],
        capacity: "8卡集群",
      },
      scenario: ["医疗影像", "深度学习", "模型训练"],
      technicalRequirements: "ResNet/VGG架构，支持CT/X光多模态，DICOM格式支持",
      budget: {
        amount: "150万元",
        range: "medium",
      },
      scale: {
        nodes: 8,
        dataSize: "10万张影像",
      },
      timeline: "6个月内",
      urgency: "high",
    },
  },
  {
    id: "req-3",
    createdAt: new Date("2024-11-25"),
    status: "pending",
    rawInput: {
      type: "voice",
      content:
        "制造业客户，想做产品质检，流水线上有20个工位需要视觉检测，主要检测表面缺陷和尺寸，要求实时响应，预算不多大概80万",
    },
    structured: {
      industry: "智能制造",
      companyType: "制造企业",
      decisionStyle: "成本敏感",
      currentState: "人工质检，效率低且误检率高",
      targetState: "自动化视觉检测，实时反馈，准确率98%",
      computePower: {
        type: "inference",
        model: ["昇腾310"],
        capacity: "20节点边缘部署",
      },
      scenario: ["工业视觉", "缺陷检测", "边缘计算"],
      technicalRequirements: "实时图像采集，毫秒级推理，支持多工位并行",
      budget: {
        amount: "80万元",
        range: "low",
      },
      scale: {
        nodes: 20,
        concurrent: 20,
      },
      timeline: "2个月内",
      urgency: "high",
    },
  },
  {
    id: "req-4",
    createdAt: new Date("2024-11-28"),
    status: "pending",
    rawInput: {
      type: "text",
      content: "电商平台需要做智能客服，要能理解用户问题并自动回复，日均咨询量5万次，需要接入现有CRM系统",
    },
    structured: {
      industry: "电商零售",
      companyType: "互联网企业",
      decisionStyle: "效率优先",
      currentState: "人工客服，响应慢，成本高",
      targetState: "AI智能客服，7x24小时服务，解决率80%+",
      computePower: {
        type: "inference",
        model: ["昇腾310", "昇腾910"],
        capacity: "混合部署，支持5万QPS",
      },
      scenario: ["自然语言处理", "对话系统", "大模型应用"],
      technicalRequirements: "NLP语义理解，多轮对话，知识库检索，CRM集成",
      budget: {
        amount: "120万元",
        range: "medium",
      },
      scale: {
        concurrent: 5000,
        qps: "50000/日",
      },
      timeline: "4个月内",
      urgency: "medium",
    },
  },
  {
    id: "req-5",
    createdAt: new Date("2024-12-01"),
    status: "pending",
    rawInput: {
      type: "voice",
      content: "金融风控项目，需要实时识别欺诈交易，每秒处理1000笔交易，要用大数据+AI模型，延迟要求100ms以内",
    },
    structured: {
      industry: "金融",
      companyType: "银行/金融机构",
      decisionStyle: "安全优先",
      currentState: "规则引擎，误报率高，无法应对新型欺诈",
      targetState: "AI实时风控，准确识别欺诈，误报率降低50%",
      computePower: {
        type: "inference",
        model: ["昇腾310", "昇腾910"],
        capacity: "高并发推理集群",
      },
      scenario: ["异常检测", "实时推理", "大数据分析"],
      technicalRequirements: "图神经网络，实时特征工程，流式计算",
      budget: {
        amount: "300万元",
        range: "high",
      },
      scale: {
        nodes: 16,
        qps: "1000交易/秒",
        concurrent: 1000,
      },
      timeline: "6个月内",
      urgency: "high",
    },
  },
  {
    id: "req-6",
    createdAt: new Date("2024-12-03"),
    status: "pending",
    rawInput: {
      type: "text",
      content: "智慧园区项目，需要人脸识别门禁+行为分析，覆盖50个出入口和200个监控点，要求私有化部署",
    },
    structured: {
      industry: "智慧园区",
      companyType: "政府/大型园区",
      decisionStyle: "安全可控",
      currentState: "传统门禁卡，无法统计人流和异常行为",
      targetState: "人脸识别+行为分析，实时预警，数据可视化",
      computePower: {
        type: "inference",
        model: ["昇腾310"],
        capacity: "边缘+中心混合部署",
      },
      scenario: ["人脸识别", "行为分析", "视频监控"],
      technicalRequirements: "人脸检测识别，异常行为检测，隐私保护",
      budget: {
        amount: "180万元",
        range: "medium",
      },
      scale: {
        nodes: 50,
        cameras: 200,
      },
      timeline: "3个月内",
      urgency: "medium",
    },
  },
  {
    id: "req-7",
    createdAt: new Date("2024-12-05"),
    status: "pending",
    rawInput: {
      type: "voice",
      content: "农业科技公司，想用无人机做农作物病虫害识别，覆盖10万亩农田，需要边缘计算能力，实时分析",
    },
    structured: {
      industry: "智慧农业",
      companyType: "农业科技企业",
      decisionStyle: "创新导向",
      currentState: "人工巡田，发现滞后，损失大",
      targetState: "无人机+AI识别，提前预警，精准施药",
      computePower: {
        type: "inference",
        model: ["昇腾310"],
        capacity: "边缘计算，无人机端部署",
      },
      scenario: ["计算机视觉", "边缘AI", "图像分类"],
      technicalRequirements: "病虫害分类，轻量化模型，低功耗推理",
      budget: {
        amount: "60万元",
        range: "low",
      },
      scale: {
        nodes: 10,
        coverage: "10万亩",
      },
      timeline: "2个月内",
      urgency: "high",
    },
  },
]
