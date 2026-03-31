<div align="center">

# 🧬 Bio-Forge

**分子设计平台 · Molecular Design Platform**

*生物制造操作系统 · OS for Bio-Manufacturing*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org/)
[![Phase](https://img.shields.io/badge/Phase-2%20Complete-10b981)](https://github.com/chinjaneking/Bio-Forge-OS)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

[English](#english) · [中文](#中文)

</div>

---

<a name="english"></a>

## English

### Overview

Bio-Forge is an ambitious **"OS for Bio-Manufacturing"** — an AI-powered platform designed to automate the entire lifecycle of synthetic biology, from molecular design to industrial scale-up.

The platform now covers **Phase 1: Molecular Blueprint** (enzyme engineering) and **Phase 2: Genetic Circuit Designer** (gene circuit design, expression optimization, CRISPR editing, and metabolic pathway exploration).

### ✨ Key Features

#### Phase 1 — Molecular Blueprint

##### 1. Bio-Lingo Console
A natural language interface for molecular design. Scientists describe biological goals in plain English; the AI system decomposes them into structured, executable tasks.

##### 2. Hierarchical Multi-Agent System

| Agent | Role |
|---|---|
| **Orchestrator** | Decomposes high-level tasks, routes to specialists, maintains context |
| **Molecular Architect** | Protein/enzyme analysis, mutation design, catalytic mechanism interpretation |

##### 3. Holo-Studio — 3D Visualization
Interactive protein structure viewer powered by **NGL.js**:
- Cartoon · Ball+Stick · Surface · Ribbon · Licorice rendering modes
- Rotate, zoom, pan with mouse controls
- PDB ID search with in-app input
- Screenshot export & fullscreen mode

##### 4. Protein Explorer
Search and browse the **UniProt** database:
- Fetch by UniProt accession (e.g. `P00698`)
- View sequence, function, catalytic activity, gene info
- Quick-load presets: Lysozyme C · Chymotrypsinogen A · Hemoglobin α · Insulin

##### 5. Biological Database Integration

| Database | Data |
|---|---|
| **UniProt** | Protein sequences, functions, annotations, active sites |
| **RCSB PDB** | 3D structure metadata, experimental methods, resolution |

---

#### Phase 2 — Genetic Circuit Designer

##### 6. Genetic Circuit Designer Console
AI-powered multi-mode chat interface for gene circuit engineering:

| Mode | Function |
|---|---|
| **Circuit Design** | Design complete gene circuits for biosynthesis objectives |
| **Optimize Expression** | Balance multi-gene expression levels for metabolic pathways |
| **CRISPR Design** | Generate guide RNAs and editing strategies for gene knockouts/edits |
| **Select Parts** | Recommend standard biological parts (promoters, RBS, terminators) |

- Host organism selector: E. coli · S. cerevisiae · B. subtilis · P. putida · CHO · HEK293
- Inline circuit topology visualization: `▶ PROM ── ◉ RBS ── ▬ CDS ── ◀ TERM`

##### 7. Expression Simulator
Interactive expression-level modeling with visual feedback:
- SVG-rendered circuit track with colored gene part boxes
- Per-gene expression sliders (0–100%)
- Metabolic Burden Index meter (green / amber / red)
- Horizontal expression bar chart
- Parts Library sidebar with standard Anderson promoters, RBS, terminators
- Default Lycopene pathway template (crtE / crtB / crtI + GFP reporter)

##### 8. Pathway Explorer
Metabolic pathway browser powered by the **KEGG** database:
- Keyword search across 500+ KEGG pathway maps
- Quick-load buttons for key pathways (Glycolysis, TCA, Oxidative Phosphorylation, etc.)
- Displays pathway map images from KEGG
- KEGG flat-file raw preview
- Direct links to KEGG website

##### 9. Biological Parts Integration

| Registry | Data |
|---|---|
| **KEGG** | Metabolic pathways, enzymes, reactions |
| **iGEM BioBricks** | Standard biological parts (promoters, RBS, CDSs, terminators, reporters) |
| **NCBI Entrez** | Gene search for any organism |

---

### 🏗️ Architecture

```
bio-forge/
├── frontend/                    # Next.js 15 + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Main dashboard — Phase 1/2 switcher
│       │   └── layout.tsx
│       └── components/
│           ├── BioLingoConsole.tsx        # Phase 1: Natural language chat
│           ├── HoloStudio.tsx             # Phase 1: NGL.js 3D protein viewer
│           ├── ProteinExplorer.tsx        # Phase 1: UniProt search panel
│           ├── CircuitDesignerConsole.tsx # Phase 2: Gene circuit AI console
│           ├── ExpressionSimulator.tsx    # Phase 2: Expression level simulator
│           └── PathwayExplorer.tsx        # Phase 2: KEGG pathway browser
│
└── backend/                     # FastAPI + Python
    └── src/
        ├── agents/
        │   ├── orchestrator.py               # Task decomposition agent
        │   ├── molecular_architect.py        # Protein analysis specialist
        │   └── genetic_circuit_designer.py   # Gene circuit engineering agent
        ├── lib/
        │   ├── ai_client.py       # Nxcode AI Gateway (google-genai)
        │   ├── bio_apis.py        # UniProt & PDB REST clients
        │   └── circuit_apis.py    # KEGG, BioBricks, NCBI clients
        └── routes/
            └── api.py             # All REST API endpoints
```

### 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15, React, Tailwind CSS, NGL.js, Lucide Icons |
| **Backend** | FastAPI, Python 3.11, uvicorn, httpx |
| **AI** | Google GenAI SDK, Nxcode AI Gateway |
| **APIs** | UniProt REST, RCSB PDB REST, KEGG REST, iGEM BioBricks, NCBI Entrez |

### 📡 API Reference

#### Agent Endpoints

```
POST /api/orchestrator/chat
POST /api/orchestrator/reset
POST /api/molecular-architect/analyze
POST /api/molecular-architect/design-mutations
POST /api/circuit/design
POST /api/circuit/optimize-expression
POST /api/circuit/crispr
POST /api/circuit/select-parts
POST /api/circuit/reset
```

#### Biological Data Endpoints

```
GET  /api/bio/uniprot/{accession}        # UniProt protein data
GET  /api/bio/pdb/{pdb_id}              # PDB structure metadata
GET  /api/bio/pdb/file/{pdb_id}         # Proxy CIF file (avoids CORS)
GET  /api/bio/pdb/search/{query}        # Search PDB

GET  /api/bio/kegg/pathway/{id}         # KEGG pathway entry
GET  /api/bio/kegg/search/{query}       # Search KEGG pathways
GET  /api/bio/kegg/enzyme/{id}          # KEGG enzyme entry

GET  /api/bio/parts/common              # Curated BioBrick parts list
GET  /api/bio/parts/{part_id}           # Fetch BioBrick part from iGEM
GET  /api/bio/ncbi/gene/{query}         # NCBI Gene search
```

### 🛠️ Local Development

**Prerequisites:** Node.js 18+, Python 3.11+

```bash
# Clone the repository
git clone https://github.com/chinjaneking/Bio-Forge-OS.git
cd Bio-Forge-OS

# --- Backend ---
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -e .
pip install httpx google-genai

# Start backend (port 3001)
uvicorn src.main:app --host 0.0.0.0 --port 3001 --reload

# --- Frontend (new terminal) ---
cd frontend
npm install

# Start frontend (port 5173)
npm run dev -- --hostname 0.0.0.0
```

Open **http://localhost:5173** in your browser.

### 🗺️ Roadmap

| Phase | Focus | Status |
|---|---|---|
| **Phase 1** | Molecular Blueprint (Enzyme Engineering) | ✅ Complete |
| **Phase 2** | Genetic Circuit Designer | ✅ Complete |
| **Phase 3** | Process Optimizer (Fermentation) | 🔜 Planned |
| **Phase 4** | Factory Floor (Real-time monitoring) | 🔜 Planned |

---

<a name="中文"></a>

## 中文

### 项目简介

Bio-Forge 是一个雄心勃勃的 **"生物制造操作系统"** —— 一个由 AI 驱动的平台，旨在自动化合成生物学的全生命周期，从分子设计到工业规模化生产。

平台目前已完成 **第一阶段：分子蓝图**（酶工程）与 **第二阶段：基因回路设计器**（基因回路设计、表达优化、CRISPR 编辑、代谢通路探索）。

### ✨ 核心功能

#### 第一阶段 — 分子蓝图

##### 1. Bio-Lingo 自然语言控制台
面向分子设计的自然语言交互界面。科学家用日常语言描述生物学目标，AI 系统自动将其分解为结构化的可执行任务。

##### 2. 层级式多智能体系统

| 智能体 | 职责 |
|---|---|
| **编排者 (Orchestrator)** | 分解高层任务，路由至专家智能体，维护设计上下文 |
| **分子架构师 (Molecular Architect)** | 蛋白质/酶分析、突变设计、催化机制解析 |

##### 3. Holo-Studio — 3D 可视化工作室
基于 **NGL.js** 的交互式蛋白质结构查看器：
- 卡通 · 球棍 · 表面 · 丝带 · 甘草糖 等多种渲染模式
- 鼠标旋转、缩放、平移操作
- 直接输入 PDB ID 加载结构
- 截图导出 & 全屏模式

##### 4. 蛋白质探索器
搜索和浏览 **UniProt** 数据库：
- 通过 UniProt 登录号获取数据（如 `P00698`）
- 查看序列、功能、催化活性、基因信息
- 快速加载预设：溶菌酶 C · 胰凝乳蛋白酶原 A · 血红蛋白 α · 胰岛素

##### 5. 生物数据库集成

| 数据库 | 数据内容 |
|---|---|
| **UniProt** | 蛋白质序列、功能注释、活性位点 |
| **RCSB PDB** | 三维结构元数据、实验方法、分辨率 |

---

#### 第二阶段 — 基因回路设计器

##### 6. 基因回路设计控制台
AI 驱动的多模式对话界面，用于基因回路工程：

| 模式 | 功能 |
|---|---|
| **回路设计 (Circuit Design)** | 为生物合成目标设计完整基因回路 |
| **表达优化 (Optimize Expression)** | 平衡多基因代谢通路中的表达水平 |
| **CRISPR 设计** | 生成 gRNA 序列及基因敲除/编辑策略 |
| **元件选择 (Select Parts)** | 推荐标准生物元件（启动子、RBS、终止子等） |

- 宿主菌株选择器：大肠杆菌 · 酿酒酵母 · 枯草芽孢杆菌 · 恶臭假单胞菌 · CHO · HEK293
- 内联回路拓扑可视化：`▶ PROM ── ◉ RBS ── ▬ CDS ── ◀ TERM`

##### 7. 表达模拟器
可交互的基因表达水平建模工具：
- SVG 渲染的回路轨道，含彩色基因元件图块
- 每个基因独立表达强度滑块（0–100%）
- 代谢负担指数仪表（绿色 / 琥珀 / 红色预警）
- 横向表达量柱状图
- 标准元件库侧边栏（Anderson 启动子系列、RBS、终止子）
- 默认模板：番茄红素合成通路（crtE / crtB / crtI + GFP 报告基因）

##### 8. 代谢通路探索器
基于 **KEGG** 数据库的代谢通路浏览器：
- 关键词搜索 500+ KEGG 通路图
- 快速加载按钮（糖酵解、TCA 循环、氧化磷酸化等）
- 展示 KEGG 通路图像
- KEGG flat-file 原始数据预览
- 直接跳转 KEGG 官网链接

##### 9. 生物元件数据库集成

| 注册表 | 数据内容 |
|---|---|
| **KEGG** | 代谢通路、酶、反应 |
| **iGEM BioBricks** | 标准生物元件（启动子、RBS、CDS、终止子、报告基因） |
| **NCBI Entrez** | 任意物种的基因搜索 |

---

### 🏗️ 架构说明

```
bio-forge/
├── frontend/                    # Next.js 15 + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # 主界面 — 第一/二阶段切换器
│       │   └── layout.tsx
│       └── components/
│           ├── BioLingoConsole.tsx        # 第一阶段：自然语言对话界面
│           ├── HoloStudio.tsx             # 第一阶段：NGL.js 3D 蛋白质查看器
│           ├── ProteinExplorer.tsx        # 第一阶段：UniProt 搜索面板
│           ├── CircuitDesignerConsole.tsx # 第二阶段：基因回路 AI 控制台
│           ├── ExpressionSimulator.tsx    # 第二阶段：表达强度模拟器
│           └── PathwayExplorer.tsx        # 第二阶段：KEGG 通路浏览器
│
└── backend/                     # FastAPI + Python
    └── src/
        ├── agents/
        │   ├── orchestrator.py               # 任务分解编排智能体
        │   ├── molecular_architect.py        # 蛋白质分析专家智能体
        │   └── genetic_circuit_designer.py   # 基因回路工程智能体
        ├── lib/
        │   ├── ai_client.py       # Nxcode AI 网关（google-genai）
        │   ├── bio_apis.py        # UniProt & PDB REST 客户端
        │   └── circuit_apis.py    # KEGG、BioBricks、NCBI 客户端
        └── routes/
            └── api.py             # 全部 REST API 路由
```

### 🚀 技术栈

| 层级 | 技术 |
|---|---|
| **前端** | Next.js 15、React、Tailwind CSS、NGL.js、Lucide Icons |
| **后端** | FastAPI、Python 3.11、uvicorn、httpx |
| **AI** | Google GenAI SDK、Nxcode AI 网关 |
| **外部 API** | UniProt REST、RCSB PDB REST、KEGG REST、iGEM BioBricks、NCBI Entrez |

### 📡 API 文档

#### 智能体接口

```
POST /api/orchestrator/chat               # 与编排者对话
POST /api/orchestrator/reset              # 重置对话历史
POST /api/molecular-architect/analyze     # 蛋白质分析
POST /api/molecular-architect/design-mutations  # 突变设计
POST /api/circuit/design                  # 基因回路设计
POST /api/circuit/optimize-expression     # 表达优化
POST /api/circuit/crispr                  # CRISPR 设计
POST /api/circuit/select-parts            # 元件选择
POST /api/circuit/reset                   # 重置回路设计器
```

#### 生物数据接口

```
GET  /api/bio/uniprot/{accession}    # UniProt 蛋白质数据
GET  /api/bio/pdb/{pdb_id}          # PDB 结构元数据
GET  /api/bio/pdb/file/{pdb_id}     # 代理 CIF 文件（解决 CORS）
GET  /api/bio/pdb/search/{query}    # 搜索 PDB

GET  /api/bio/kegg/pathway/{id}     # KEGG 通路条目
GET  /api/bio/kegg/search/{query}   # 搜索 KEGG 通路
GET  /api/bio/kegg/enzyme/{id}      # KEGG 酶条目

GET  /api/bio/parts/common          # BioBrick 常用元件列表
GET  /api/bio/parts/{part_id}       # 从 iGEM 获取元件数据
GET  /api/bio/ncbi/gene/{query}     # NCBI 基因搜索
```

### 🛠️ 本地开发

**环境要求：** Node.js 18+、Python 3.11+

```bash
# 克隆仓库
git clone https://github.com/chinjaneking/Bio-Forge-OS.git
cd Bio-Forge-OS

# --- 后端 ---
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -e .
pip install httpx google-genai

# 启动后端（端口 3001）
uvicorn src.main:app --host 0.0.0.0 --port 3001 --reload

# --- 前端（新终端）---
cd frontend
npm install

# 启动前端（端口 5173）
npm run dev -- --hostname 0.0.0.0
```

在浏览器中打开 **http://localhost:5173**

### 🗺️ 开发路线图

| 阶段 | 聚焦方向 | 状态 |
|---|---|---|
| **第一阶段** | 分子蓝图（酶工程） | ✅ 已完成 |
| **第二阶段** | 基因回路设计器 | ✅ 已完成 |
| **第三阶段** | 工艺优化器（发酵） | 🔜 规划中 |
| **第四阶段** | 工厂车间（实时监控） | 🔜 规划中 |

### 🎯 使用示例

**示例 1 — 酶稳定性工程（第一阶段）**
> 在 Bio-Lingo 控制台输入：
> *"我需要改造溶菌酶（UniProt: P00698），使其在 60°C 的工业环境下保持活性，请推荐热稳定性突变方案。"*

**示例 2 — 番茄红素合成回路（第二阶段）**
> 切换至第二阶段 → 回路设计器，选择 E. coli 为宿主，输入：
> *"Design a gene circuit to produce lycopene via the MEP pathway"*

**示例 3 — 表达均衡优化（第二阶段）**
> 切换至表达模拟器，调整 crtE / crtB / crtI 三个基因的滑块，观察代谢负担指数变化。

**示例 4 — CRISPR 敲除（第二阶段）**
> 在回路设计器中切换至 CRISPR 模式，输入：
> *"Knockout lacZ in E. coli MG1655"*

---

<div align="center">

### 致谢 · Acknowledgements

| 资源 | 说明 |
|---|---|
| [Nxcode Platform](https://nxcode.io) | AI 网关与部署基础设施 |
| [UniProt](https://uniprot.org) | 蛋白质序列与功能数据库 |
| [RCSB PDB](https://rcsb.org) | 蛋白质三维结构数据库 |
| [NGL Viewer](https://nglviewer.org) | WebGL 分子可视化库 |
| [KEGG](https://www.kegg.jp) | 代谢通路与酶数据库 |
| [iGEM Registry](https://parts.igem.org) | 标准生物元件注册表 |
| [NCBI](https://www.ncbi.nlm.nih.gov) | 基因与生物序列数据库 |

---

**用 Bio-Forge 重新定义分子设计 · Redefining Molecular Design with Bio-Forge** 🧬

</div>
