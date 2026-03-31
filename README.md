# Bio-Forge MVP

**Generative Biology Platform for Molecular Design**

Bio-Forge is an ambitious "OS for Bio-Manufacturing" that aims to automate the entire lifecycle of synthetic biology—from molecular design to industrial scale-up. This MVP focuses on Phase 1: **Molecular Blueprint** (Enzyme Engineering).

## 🎯 Features

### 1. **Bio-Lingo Console**
A natural language interface for scientists to interact with the system using plain English. Scientists can describe their molecular design goals, and the system decomposes them into actionable tasks.

### 2. **Multi-Agent System**

#### **Orchestrator Agent**
- Hierarchical task decomposition
- Routes tasks to specialized agents
- Maintains context across the design workflow
- Synthesizes results from multiple agents

#### **Molecular Architect Agent**
- Protein structure-function analysis
- Enzyme catalytic mechanism interpretation
- Rational mutation design
- Binding site identification
- Structure prediction from sequence

### 3. **Holo-Studio 3D Visualization**
Interactive 3D protein structure viewer powered by NGL.js:
- Multiple rendering modes (cartoon, ball+stick, surface, ribbon)
- Real-time structure manipulation
- Screenshot export
- Fullscreen mode

### 4. **Biological Data Integration**
- **UniProt API**: Fetch protein sequences, functions, annotations
- **PDB API**: Access 3D structure data, experimental methods
- Intelligent caching for performance

### 5. **Protein Explorer**
Search and explore proteins from UniProt with quick-load presets for common proteins.

## 🏗️ Architecture

```
bio-forge/
├── frontend/          # Next.js 15 + Tailwind CSS
│   ├── src/
│   │   ├── app/      # Next.js App Router
│   │   ├── components/
│   │   │   ├── BioLingoConsole.tsx   # Natural language interface
│   │   │   ├── HoloStudio.tsx        # 3D protein viewer
│   │   │   └── ProteinExplorer.tsx   # UniProt search
│   │   └── modules/  # AI module
│
└── backend/           # FastAPI + Python
    ├── src/
    │   ├── agents/
    │   │   ├── orchestrator.py         # Task decomposition agent
    │   │   └── molecular_architect.py  # Protein analysis agent
    │   ├── lib/
    │   │   ├── ai_client.py    # Nxcode AI Gateway integration
    │   │   └── bio_apis.py     # UniProt & PDB API clients
    │   └── routes/
    │       └── api.py          # REST API endpoints
```

## 🚀 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **NGL.js**: 3D molecular visualization
- **Lucide Icons**: Modern icon library

### Backend
- **FastAPI**: Modern Python API framework
- **Google GenAI SDK**: AI agent system via Nxcode Gateway
- **httpx**: Async HTTP client for bio APIs
- **SQLite**: Development database (PostgreSQL for production)

### APIs
- **Nxcode AI Gateway**: LLM integration for agents
- **UniProt REST API**: Protein data
- **PDB REST API**: Structure data

## 📋 API Endpoints

### Agent Endpoints

#### `POST /api/orchestrator/chat`
Main chat interface with the Orchestrator Agent.

**Request:**
```json
{
  "message": "Design a more thermostable variant of lysozyme",
  "context": {}
}
```

**Response:**
```json
{
  "response": "I'll help you design a thermostable lysozyme variant...",
  "task_plan": [
    {"description": "Fetch lysozyme structure from PDB", "status": "pending"},
    {"description": "Analyze thermal stability factors", "status": "pending"}
  ],
  "conversation_id": 12345
}
```

#### `POST /api/molecular-architect/analyze`
Analyze a protein with enriched biological data.

**Request:**
```json
{
  "query": "What are the key active site residues?",
  "protein_id": "P00698",
  "include_uniprot": true,
  "include_pdb": false
}
```

#### `POST /api/molecular-architect/design-mutations`
Design specific mutations for a protein.

**Request:**
```json
{
  "protein_id": "P00698",
  "design_goal": "Increase thermostability by 10°C"
}
```

### Biological Data Endpoints

#### `GET /api/bio/uniprot/{accession}`
Fetch protein data from UniProt.

**Example:** `/api/bio/uniprot/P00698`

**Response:**
```json
{
  "accession": "P00698",
  "protein_name": "Lysozyme C",
  "organism": "Gallus gallus",
  "sequence": "KVFGRCELAAAMKRHGLDNYRGYSLGNWVCAAKFESNFNTQATNRNTDGSTDYGILQINSRWWCNDGRTPGSRNLCNIPCSALLSSDITASVNCAKKIVSDGNGMNAWVAWRNRCKGTDVQAWIRGCRL",
  "length": 147,
  "gene": "LYZ",
  "function": "Bacteriolytic enzyme..."
}
```

#### `GET /api/bio/pdb/{pdb_id}`
Fetch structure information from PDB.

#### `GET /api/bio/pdb/search/{query}`
Search PDB for structures matching a query.

## 🧪 Example Workflows

### 1. Enzyme Stability Engineering

**User Input:**
> "I need to improve the thermostability of hen egg white lysozyme (UniProt: P00698) for industrial applications at 60°C."

**System Response:**
The Orchestrator Agent will:
1. Fetch protein data from UniProt
2. Route to Molecular Architect for structure analysis
3. Identify stability-critical regions
4. Propose specific mutations (e.g., "V110A", "I23L")
5. Display structure in Holo-Studio for visualization

### 2. Active Site Analysis

**User Input:**
> "Analyze the catalytic mechanism of chymotrypsinogen A (UniProt: P00766)"

**System Response:**
1. Fetch sequence and function data
2. Identify catalytic triad (His57, Asp102, Ser195)
3. Explain mechanism with molecular details
4. Visualize active site in 3D

## 🎨 UI Features

### Bio-Lingo Console
- Real-time chat interface
- Conversation history
- Task plan visualization
- Gradient-based dark theme with indigo/purple accents

### Holo-Studio
- Interactive 3D rotation, zoom, pan
- Multiple rendering styles
- Ligand highlighting
- Screenshot export
- Fullscreen mode

### View Modes
- **Console Only**: Focus on conversation
- **Split View**: Console + 3D viewer side-by-side
- **Studio Only**: Full 3D visualization

## 🔧 Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm

### Setup

1. **Install Frontend Dependencies:**
```bash
cd frontend
npm install
```

2. **Install Backend Dependencies:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -e .
pip install httpx psycopg2-binary google-genai
```

3. **Start Backend Server:**
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 3001 --reload
```

4. **Start Frontend Server:**
```bash
cd frontend
npm run dev -- --hostname 0.0.0.0
```

5. **Access the Application:**
Open http://localhost:5173 in your browser.

## 🌐 Deployment

### Frontend (Cloudflare Workers)
```bash
nxcode deploy --type frontend --dir frontend
```

### Backend (Cloudflare Containers)
```bash
nxcode deploy --type backend-container --dir backend
```

## 📊 Database Schema

### Tables
- **projects**: Design projects
- **tasks**: Task tracking with agent assignments
- **proteins**: Cached UniProt data
- **structures**: Cached PDB data
- **analyses**: Analysis results and history

## 🔐 Environment Variables

### Backend
- `NXCODE_APP_ID`: Set after deployment for AI Gateway authentication
- `THREAD_ID`: Automatically set in development

### Frontend
- Automatically configured via Next.js

## 🎯 Roadmap

### Phase 1: Molecular Blueprint ✅ (Current MVP)
- ✅ Natural language interface (Bio-Lingo)
- ✅ Multi-agent system (Orchestrator + Molecular Architect)
- ✅ 3D visualization (Holo-Studio)
- ✅ Biological database integration (UniProt, PDB)

### Phase 2: Genetic Circuit Designer (Future)
- Pathway design and optimization
- Regulatory element prediction
- Plasmid construction planning

### Phase 3: Process Optimizer (Future)
- Fermentation parameter optimization
- Media composition design
- Scale-up modeling

### Phase 4: Factory Floor (Future)
- Real-time bioreactor monitoring
- Automated process control
- Quality control integration

## 🤝 Contributing

This is an MVP demonstration. For production use, consider:
- PostgreSQL instead of SQLite
- Comprehensive error handling
- Rate limiting for API calls
- Authentication and authorization
- Caching layer (Redis)
- Comprehensive testing suite

## 📄 License

MIT License

## 🙏 Acknowledgments

- **Nxcode Platform**: AI Gateway and deployment infrastructure
- **UniProt**: Protein sequence database
- **RCSB PDB**: Protein structure database
- **NGL Viewer**: 3D molecular visualization library

---

**Built with Bio-Forge** 🧬 - Revolutionizing molecular design through AI
