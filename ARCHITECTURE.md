# Bio-Forge Technical Architecture

## System Overview

Bio-Forge is a full-stack generative biology platform designed for molecular design and engineering. The MVP demonstrates a hierarchical multi-agent system for enzyme engineering with real-time 3D visualization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│                    (Next.js 15 + React)                      │
├───────────────┬─────────────────┬──────────────────────────┤
│  Bio-Lingo    │  Holo-Studio    │  Protein Explorer        │
│  Console      │  (NGL.js 3D)    │  (UniProt Search)        │
└───────┬───────┴────────┬────────┴──────────┬───────────────┘
        │                 │                    │
        │   HTTP/REST     │                    │
        │   (via Proxy)   │                    │
        │                 │                    │
┌───────▼─────────────────▼────────────────────▼───────────────┐
│                      Backend Layer                            │
│                   (FastAPI + Python)                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Multi-Agent Orchestration                  │   │
│  │                                                       │   │
│  │  ┌──────────────────┐    ┌────────────────────┐    │   │
│  │  │  Orchestrator    │───>│ Molecular          │    │   │
│  │  │  Agent           │    │ Architect Agent    │    │   │
│  │  │                  │    │                    │    │   │
│  │  │  - Task          │    │ - Structure        │    │   │
│  │  │    Decomposition │    │   Analysis         │    │   │
│  │  │  - Agent Routing │    │ - Mutation Design  │    │   │
│  │  │  - Context Mgmt  │    │ - Mechanism Study  │    │   │
│  │  └──────────────────┘    └────────────────────┘    │   │
│  │                                                       │   │
│  └───────────────────┬───────────────────────────────┬─┘   │
│                      │                               │      │
│                      │ Nxcode AI Gateway            │      │
│                      │ (Google GenAI)               │      │
│                      │                               │      │
│  ┌──────────────────▼───────────────┬───────────────▼─────┐│
│  │   Biological Data Integration    │   Data Layer        ││
│  │                                   │                     ││
│  │  ┌───────────┐  ┌────────────┐  │  ┌──────────────┐  ││
│  │  │ UniProt   │  │  PDB API   │  │  │  SQLite DB   │  ││
│  │  │ REST API  │  │  REST API  │  │  │  (Dev)       │  ││
│  │  └───────────┘  └────────────┘  │  └──────────────┘  ││
│  │                                   │                     ││
│  └───────────────────────────────────┴─────────────────────┘│
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### 1. Bio-Lingo Console (`BioLingoConsole.tsx`)
**Purpose**: Natural language interface for molecular design tasks

**Key Features**:
- Real-time chat interface with message history
- Task plan visualization
- Context-aware conversations
- Gradient-based UI with scientific theming

**State Management**:
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  taskPlan?: Array<{ description: string; status: string }>
}
```

**API Integration**:
- `POST /api/orchestrator/chat`: Main conversation endpoint
- Automatic scrolling and loading states
- Error handling with user feedback

#### 2. Holo-Studio (`HoloStudio.tsx`)
**Purpose**: Interactive 3D protein structure visualization

**Key Features**:
- NGL.js integration for molecular rendering
- Multiple representation modes (cartoon, ball+stick, surface, ribbon)
- Interactive controls (rotate, zoom, pan)
- Screenshot export
- Fullscreen mode

**Rendering Pipeline**:
```typescript
Stage → Load PDB/CIF → Apply Representation → Auto View → Interactive
```

**Performance Optimizations**:
- Lazy loading of structures
- Efficient re-rendering on representation change
- Responsive viewport handling

#### 3. Protein Explorer (`ProteinExplorer.tsx`)
**Purpose**: Search and browse UniProt protein database

**Key Features**:
- Real-time search with UniProt ID
- Quick-load presets for common proteins
- Detailed protein information display
- Sequence viewer with monospace font

**Data Flow**:
```
User Input → API Call → UniProt Response → Parse → Display
```

### Backend Architecture

#### 1. Agent System

##### Orchestrator Agent (`orchestrator.py`)
**Responsibilities**:
- Decompose high-level biological tasks into sub-tasks
- Route tasks to specialized agents
- Maintain conversation context
- Synthesize multi-agent results

**System Prompt Strategy**:
- Role definition: "Orchestrator for Bio-Forge"
- Available agents listing
- Expected output format
- Scientific accuracy emphasis

**Key Methods**:
```python
async def process_task(user_input: str, request_headers: dict) -> Dict
async def route_to_specialist(task: str, specialist_type: str) -> Dict
def reset() -> None
```

**Context Management**:
- Conversation history stored as list of message dicts
- Each message: `{role: str, parts: List[{text: str}]}`
- History passed to AI model for context-aware responses

##### Molecular Architect Agent (`molecular_architect.py`)
**Responsibilities**:
- Protein structure-function analysis
- Enzyme mechanism interpretation
- Mutation design with rationale
- Structure feature prediction

**System Prompt Strategy**:
- Domain expertise: protein engineering, catalysis, stability
- Output format: scientific with specific residues
- Quantitative when possible (ΔΔG, Km, kcat)

**Key Methods**:
```python
async def analyze_protein(query: str, context: Dict) -> Dict
async def design_mutations(protein_id: str, design_goal: str) -> Dict
async def predict_structure_features(sequence: str) -> Dict
```

**Context Enrichment**:
- Accepts optional UniProt and PDB data
- Integrates biological context into prompts
- Returns structured analysis with agent metadata

#### 2. AI Client Integration (`ai_client.py`)

**Authentication Strategy**:
```python
# Development: X-Workspace-Id + X-Session-Token
# Production: X-App-Id + Authorization header
```

**Configuration**:
- Endpoint: `https://studio-api.nxcode.io/api/ai-gateway`
- API Key: `"nxcode"` (placeholder, gateway handles auth)
- Custom headers for workspace/app identification

**Model Selection**:
- `fast`: Quick responses (default)
- `smart`: Complex reasoning (used for agents)

#### 3. Biological API Integration (`bio_apis.py`)

##### UniProt API Client
**Features**:
- Async HTTP requests with httpx
- JSON parsing and key info extraction
- Timeout handling (30s)
- Error resilience

**Data Extraction**:
```python
extract_key_info() → {
  accession, name, protein_name, organism, sequence,
  function, catalytic_activity, subcellular_location, features
}
```

**Feature Filtering**:
- Focus on important features (ACTIVE_SITE, BINDING, DOMAIN, REGION, SITE)
- Limit to first 20 features for performance

##### PDB API Client
**Features**:
- Structure metadata retrieval
- Search functionality
- Structure file URLs (CIF format)
- Experimental method and resolution data

**Search Implementation**:
```python
POST https://search.rcsb.org/rcsbsearch/v2/query
{
  "query": {"type": "terminal", "service": "full_text"},
  "return_type": "entry",
  "request_options": {"sort": [{"sort_by": "score"}]}
}
```

### API Layer (`routes/api.py`)

**Endpoint Organization**:

1. **Agent Endpoints**:
   - `/api/orchestrator/chat`: Main conversation
   - `/api/orchestrator/reset`: Clear history
   - `/api/molecular-architect/analyze`: Protein analysis
   - `/api/molecular-architect/design-mutations`: Mutation design

2. **Biological Data Endpoints**:
   - `/api/bio/uniprot/{accession}`: Fetch protein
   - `/api/bio/pdb/{pdb_id}`: Fetch structure
   - `/api/bio/pdb/search/{query}`: Search structures

**Request/Response Models**:
```python
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ProteinAnalysisRequest(BaseModel):
    query: str
    protein_id: Optional[str] = None
    include_uniprot: bool = True
    include_pdb: bool = False
```

**Error Handling**:
- HTTP exceptions with proper status codes
- Detailed error messages
- Graceful degradation for external API failures

## Data Flow Examples

### Example 1: Protein Analysis Workflow

```
User: "Analyze lysozyme's active site"
  │
  ▼
Bio-Lingo Console → POST /api/orchestrator/chat
  │
  ▼
Orchestrator Agent
  │ (identifies need for molecular analysis)
  ▼
Routes to Molecular Architect
  │
  ▼
Molecular Architect
  │ (requests protein data)
  ▼
GET /api/bio/uniprot/P00698
  │
  ▼
UniProt API Client → UniProt REST API
  │
  ▼
Parse Response → Extract Features
  │
  ▼
Enrich AI Prompt with Protein Context
  │
  ▼
Nxcode AI Gateway (GenAI)
  │
  ▼
Generate Analysis with:
  - Active site residues
  - Catalytic mechanism
  - Substrate binding
  │
  ▼
Return to Orchestrator → Return to User
  │
  ▼
Display in Bio-Lingo Console with Task Plan
```

### Example 2: 3D Structure Visualization

```
User: Clicks "Lysozyme C" in Protein Explorer
  │
  ▼
GET /api/bio/uniprot/P00698
  │
  ▼
Display Protein Info
  │
  ▼
User: Switches to Split View
  │
  ▼
Holo-Studio Component Initialized
  │
  ▼
NGL.Stage Created with dark background
  │
  ▼
Load Structure: https://files.rcsb.org/download/1AKI.cif
  │
  ▼
NGL Downloads and Parses CIF File
  │
  ▼
Apply Representation: Cartoon + Color by Chain
  │
  ▼
Apply Ligand Representation: Ball+Stick
  │
  ▼
Auto View (center and zoom)
  │
  ▼
User Interaction: Mouse controls for rotate/pan/zoom
```

## Technology Decisions

### Why Next.js 15?
- App Router for improved routing
- Server Components for better performance
- Built-in API proxy (rewrites) for CORS
- Excellent developer experience

### Why FastAPI?
- Async support for external API calls
- Automatic API documentation
- Type safety with Pydantic
- Fast performance for agent orchestration

### Why NGL.js?
- Purpose-built for molecular visualization
- WebGL-based rendering (high performance)
- Rich feature set (multiple representations)
- Active community and maintenance

### Why SQLite (MVP)?
- Zero configuration
- File-based (portable)
- Sufficient for development
- Easy migration to PostgreSQL for production

### Why Nxcode AI Gateway?
- Unified LLM access (multiple models)
- Built-in authentication
- Cost management
- Agent-friendly API

## Performance Considerations

### Frontend Optimizations
- React lazy loading for heavy components
- Debounced API calls in search
- Efficient re-renders with proper React keys
- NGL.js viewport recycling

### Backend Optimizations
- Async/await throughout for I/O operations
- Connection pooling for database (production)
- Caching strategy for biological data
- Efficient JSON parsing with Pydantic

### Network Optimizations
- API call batching where possible
- Gzip compression on responses
- CDN for static assets (production)
- Proxy to avoid CORS preflight

## Security Considerations

### Current Implementation
- CORS configured for development (`allow_origins: ["*"]`)
- No authentication (MVP)
- Environment-based AI Gateway auth

### Production Requirements
- Implement user authentication
- API rate limiting
- Input validation and sanitization
- HTTPS enforcement
- Restricted CORS origins
- SQL injection prevention (parameterized queries)
- XSS prevention (React handles by default)

## Scalability Path

### Immediate Next Steps
1. Add PostgreSQL for production data
2. Implement Redis for caching
3. Add authentication middleware
4. Deploy to Cloudflare (edge computing)

### Future Enhancements
1. **Agent System**:
   - Add more specialized agents (Pathway Designer, Process Optimizer)
   - Implement agent-to-agent communication
   - Add agent result caching

2. **Data Layer**:
   - Integrate AlphaFold API for structure prediction
   - Add sequence alignment tools (BLAST-like)
   - Implement result versioning

3. **UI/UX**:
   - Add project management (save/load workflows)
   - Implement export functionality (PDF reports, FASTA, PDB)
   - Add collaborative features (shared projects)

4. **Performance**:
   - Server-side rendering for initial load
   - WebSocket for real-time agent updates
   - Background job processing for long computations

## Testing Strategy

### Frontend Testing
- Component tests with React Testing Library
- E2E tests with Playwright
- Visual regression tests for 3D viewer

### Backend Testing
- Unit tests for agents with mocked AI responses
- Integration tests for API endpoints
- Load testing for concurrent users

### External API Testing
- Mock responses for UniProt/PDB in tests
- Fallback handling tests
- Timeout scenario testing

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│            Cloudflare Global Network            │
├─────────────────┬───────────────────────────────┤
│   Workers       │   Containers                  │
│   (Frontend)    │   (Backend)                   │
│                 │                               │
│   Next.js       │   FastAPI                     │
│   Static Site   │   Python Runtime              │
│                 │                               │
└─────────────────┴───────────────────────────────┘
         │                   │
         ▼                   ▼
    ┌────────────────────────────────┐
    │    Cloudflare Services         │
    │  - D1 (Database)               │
    │  - KV (Cache)                  │
    │  - R2 (Object Storage)         │
    └────────────────────────────────┘
```

## Conclusion

Bio-Forge's architecture demonstrates a modern, scalable approach to building AI-powered scientific applications. The separation of concerns, modular design, and use of industry-standard tools provide a solid foundation for future expansion into a comprehensive bio-manufacturing platform.
