<div align="center">

# 🧬 Bio-Forge

**分子设计平台 · Molecular Design Platform**

*生物制造操作系统 MVP · OS for Bio-Manufacturing MVP*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

[English](#english) · [中文](#中文)

</div>

---

<a name="english"></a>

## English

### Overview

Bio-Forge is an ambitious **"OS for Bio-Manufacturing"** — an AI-powered platform designed to automate the entire lifecycle of synthetic biology, from molecular design to industrial scale-up.

This MVP focuses on **Phase 1: Molecular Blueprint**, with a focus on enzyme engineering. It provides scientists with a natural language interface, a hierarchical multi-agent AI system, real-time 3D protein visualization, and integration with public biological databases.

### ✨ Key Features

#### 1. Bio-Lingo Console
A natural language interface for molecular design. Scientists describe biological goals in plain English; the AI system decomposes them into structured, executable tasks.

#### 2. Hierarchical Multi-Agent System

| Agent | Role |
|---|---|
| **Orchestrator** | Decomposes high-level tasks, routes to specialists, maintains context |
| **Molecular Architect** | Protein/enzyme analysis, mutation design, catalytic mechanism interpretation |

#### 3. Holo-Studio — 3D Visualization
Interactive protein structure viewer powered by **NGL.js**:
- Cartoon · Ball+Stick · Surface · Ribbon · Licorice rendering modes
- Rotate, zoom, pan with mouse controls
- PDB ID search with in-app input
- Screenshot export & fullscreen mode

#### 4. Protein Explorer
Search and browse the **UniProt** database:
- Fetch by UniProt accession (e.g. `P00698`)
- View sequence, function, catalytic activity, gene info
- Quick-load presets: Lysozyme C · Chymotrypsinogen A · Hemoglobin α · Insulin

#### 5. Biological Database Integration

| Database | Data |
|---|---|
| **UniProt** | Protein sequences, functions, annotations, active sites |
| **RCSB PDB** | 3D structure metadata, experimental methods, resolution |

### 🏗️ Architecture

```
bio-forge/
├── frontend/                    # Next.js 15 + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # Main dashboard (split/console/studio views)
│       │   └── layout.tsx
│       └── components/
│           ├── BioLingoConsole.tsx    # Natural language chat interface
│           ├── HoloStudio.tsx         # NGL.js 3D protein viewer
│           └── ProteinExplorer.tsx    # UniProt search panel
│
└── backend/                     # FastAPI + Python
    └── src/
        ├── agents/
        │   ├── orchestrator.py         # Task decomposition agent
        │   └── molecular_architect.py  # Protein analysis specialist
        ├── lib/
        │   ├── ai_client.py     # Nxcode AI Gateway (google-genai)
        │   └── bio_apis.py      # UniProt & PDB REST clients
        └── routes/
            └── api.py           # REST API endpoints
```

### 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15, React, Tailwind CSS, NGL.js, Lucide Icons |
| **Backend** | FastAPI, Python 3.11, uvicorn, httpx |
| **AI** | Google GenAI SDK, Nxcode AI Gateway |
| **Database** | SQLite (dev) → PostgreSQL (production) |
| **APIs** | UniProt REST, RCSB PDB REST |

### 📡 API Reference

#### Agent Endpoints

```
POST /api/orchestrator/chat
POST /api/orchestrator/reset
POST /api/molecular-architect/analyze
POST /api/molecular-architect/design-mutations
```

#### Biological Data Endpoints

```
GET  /api/bio/uniprot/{accession}       # Fetch protein from UniProt
GET  /api/bio/pdb/{pdb_id}             # Fetch structure metadata
GET  /api/bio/pdb/file/{pdb_id}        # Proxy CIF file (avoids CORS)
GET  /api/bio/pdb/search/{query}       # Search PDB
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
pip install httpx google-genai psycopg2-binary

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
| **Phase 1** | Molecular Blueprint (Enzyme Engineering) | ✅ MVP Complete |
| **Phase 2** | Genetic Circuit Designer | 🔜 Planned |
| **Phase 3** | Process Optimizer (Fermentation) | 🔜 Planned |
| **Phase 4** | Factory Floor (Real-time monitoring) | 🔜 Planned |

---

<a name="中文"></a>

## 中文

### 项目简介

Bio-Forge 是一个雄心勃勃的 **"生物制造操作系统"** —— 一个由 AI 驱动的平台，旨在自动化合成生物学的全生命周期，从分子设计到工业规模化生产。

本 MVP 聚焦于 **第一阶段：分子蓝图**，以酶工程为核心场景。为科学家提供自然语言交互界面、层级式多智能体 AI 系统、实时 3D 蛋白质可视化，以及与公开生物数据库的深度集成。

### ✨ 核心功能

#### 1. Bio-Lingo 自然语言控制台
面向分子设计的自然语言交互界面。科学家用日常语言描述生物学目标，AI 系统自动将其分解为结构化的可执行任务。

#### 2. 层级式多智能体系统

| 智能体 | 职责 |
|---|---|
| **编排者 (Orchestrator)** | 分解高层任务，路由至专家智能体，维护设计上下文 |
| **分子架构师 (Molecular Architect)** | 蛋白质/酶分析、突变设计、催化机制解析 |

#### 3. Holo-Studio — 3D 可视化工作室
基于 **NGL.js** 的交互式蛋白质结构查看器：
- 卡通 · 球棍 · 表面 · 丝带 · 甘草糖 等多种渲染模式
- 鼠标旋转、缩放、平移操作
- 直接输入 PDB ID 加载结构
- 截图导出 & 全屏模式

#### 4. 蛋白质探索器
搜索和浏览 **UniProt** 数据库：
- 通过 UniProt 登录号获取数据（如 `P00698`）
- 查看序列、功能、催化活性、基因信息
- 快速加载预设：溶菌酶 C · 胰凝乳蛋白酶原 A · 血红蛋白 α · 胰岛素

#### 5. 生物数据库集成

| 数据库 | 数据内容 |
|---|---|
| **UniProt** | 蛋白质序列、功能注释、活性位点 |
| **RCSB PDB** | 三维结构元数据、实验方法、分辨率 |

### 🏗️ 架构说明

```
bio-forge/
├── frontend/                    # Next.js 15 + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # 主界面（分屏/控制台/工作室 三种视图）
│       │   └── layout.tsx
│       └── components/
│           ├── BioLingoConsole.tsx    # 自然语言对话界面
│           ├── HoloStudio.tsx         # NGL.js 3D 蛋白质查看器
│           └── ProteinExplorer.tsx    # UniProt 搜索面板
│
└── backend/                     # FastAPI + Python
    └── src/
        ├── agents/
        │   ├── orchestrator.py         # 任务分解编排智能体
        │   └── molecular_architect.py  # 蛋白质分析专家智能体
        ├── lib/
        │   ├── ai_client.py     # Nxcode AI 网关（google-genai）
        │   └── bio_apis.py      # UniProt & PDB REST 客户端
        └── routes/
            └── api.py           # REST API 路由
```

### 🚀 技术栈

| 层级 | 技术 |
|---|---|
| **前端** | Next.js 15、React、Tailwind CSS、NGL.js、Lucide Icons |
| **后端** | FastAPI、Python 3.11、uvicorn、httpx |
| **AI** | Google GenAI SDK、Nxcode AI 网关 |
| **数据库** | SQLite（开发） → PostgreSQL（生产） |
| **外部 API** | UniProt REST、RCSB PDB REST |

### 📡 API 文档

#### 智能体接口

```
POST /api/orchestrator/chat               # 与编排者对话
POST /api/orchestrator/reset              # 重置对话历史
POST /api/molecular-architect/analyze     # 蛋白质分析
POST /api/molecular-architect/design-mutations  # 突变设计
```

#### 生物数据接口

```
GET  /api/bio/uniprot/{accession}    # 从 UniProt 获取蛋白质数据
GET  /api/bio/pdb/{pdb_id}          # 获取 PDB 结构元数据
GET  /api/bio/pdb/file/{pdb_id}     # 代理 CIF 文件（解决浏览器 CORS 问题）
GET  /api/bio/pdb/search/{query}    # 搜索 PDB 结构
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
pip install httpx google-genai psycopg2-binary

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
| **第一阶段** | 分子蓝图（酶工程） | ✅ MVP 已完成 |
| **第二阶段** | 基因回路设计器 | 🔜 规划中 |
| **第三阶段** | 工艺优化器（发酵） | 🔜 规划中 |
| **第四阶段** | 工厂车间（实时监控） | 🔜 规划中 |

### 🎯 使用示例

**示例 1 — 酶稳定性工程**
> 在 Bio-Lingo 控制台输入：
> *"我需要改造溶菌酶（UniProt: P00698），使其在 60°C 的工业环境下保持活性，请推荐热稳定性突变方案。"*

**示例 2 — 催化机制分析**
> *"分析胰凝乳蛋白酶原 A 的催化机制，重点说明催化三联体的作用。"*

**示例 3 — 3D 结构探索**
> 切换到 Holo-Studio，输入 PDB ID `4HHB`（血红蛋白），选择 Surface 渲染模式查看分子表面。

---

<div align="center">

### 致谢 · Acknowledgements

| 资源 | 说明 |
|---|---|
| [Nxcode Platform](https://nxcode.io) | AI 网关与部署基础设施 |
| [UniProt](https://uniprot.org) | 蛋白质序列与功能数据库 |
| [RCSB PDB](https://rcsb.org) | 蛋白质三维结构数据库 |
| [NGL Viewer](https://nglviewer.org) | WebGL 分子可视化库 |

---

**用 Bio-Forge 重新定义分子设计 · Redefining Molecular Design with Bio-Forge** 🧬

</div>
