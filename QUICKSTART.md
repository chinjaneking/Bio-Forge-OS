# Bio-Forge Quick Start Guide

Get up and running with Bio-Forge in 5 minutes!

## 🚀 Quick Start

The Bio-Forge MVP is already running! Here's what you can do:

### 1. Access the Application

**Preview URL:** https://ab4172e8-e77e-4a59-8a5f-15253b7d8aca.studio-api.nxcode.io/

The application features:
- **Bio-Lingo Console** (left): Natural language interface
- **Protein Explorer** (sidebar): Search UniProt database
- **Holo-Studio** (right): 3D protein visualization

## 🧪 Try These Examples

### Example 1: Analyze Lysozyme

1. In the **Protein Explorer**, click "Lysozyme C" quick-load button
2. Review the protein information that appears
3. In **Bio-Lingo Console**, type:
   ```
   Analyze the active site residues of lysozyme and explain its catalytic mechanism
   ```
4. Watch as the Orchestrator Agent decomposes the task and provides detailed molecular insights

### Example 2: Design Thermostable Enzyme

In the Bio-Lingo Console, type:
```
I need to engineer a more thermostable variant of chymotrypsinogen A that can function at 70°C. What mutations would you recommend?
```

The Molecular Architect will:
- Analyze the protein structure
- Identify stability-critical regions
- Propose specific mutations with rationale
- Estimate stability improvements

### Example 3: Explore Protein Structure

1. Load "Hemoglobin alpha" from quick-load buttons
2. Switch to **Split View** (top right toggle)
3. In Holo-Studio, try different representations:
   - **Cartoon**: Alpha helices and beta sheets
   - **Surface**: Molecular surface
   - **Ball+Stick**: All atoms visible
4. Use mouse to rotate, zoom, and explore

### Example 4: Custom Protein Search

1. In Protein Explorer, enter a UniProt ID:
   - `P01308` (Insulin)
   - `P69905` (Hemoglobin)
   - `P00766` (Chymotrypsinogen)
2. Click Search
3. Review the detailed protein information
4. Ask questions about it in Bio-Lingo Console

## 💡 Tips

### Navigation
- **View Modes**: Toggle between Console, Split View, and Studio in the top bar
- **Sidebar**: Click the menu icon to show/hide Protein Explorer
- **3D Controls**:
  - Left click + drag: Rotate
  - Right click + drag: Pan
  - Scroll: Zoom
  - Reset button: Return to default view

### Bio-Lingo Console
- Ask open-ended questions about molecular design
- Request specific analyses (stability, activity, binding)
- Design mutations for engineering goals
- The Orchestrator maintains conversation context

### Holo-Studio
- Switch representations for different insights
- Take screenshots for presentations
- Use fullscreen mode for detailed examination

## 🎯 Common Use Cases

### Use Case 1: Protein Engineering
**Goal**: Improve enzyme properties

**Workflow**:
1. Load target protein in Protein Explorer
2. Ask Bio-Lingo to analyze current properties
3. Specify design goals (stability, activity, specificity)
4. Review proposed mutations and rationale
5. Visualize changes in Holo-Studio

### Use Case 2: Structure-Function Analysis
**Goal**: Understand how a protein works

**Workflow**:
1. Search for protein by UniProt ID
2. Ask about catalytic mechanism or function
3. Request identification of key residues
4. Visualize active site in 3D
5. Explore binding pockets

### Use Case 3: Mutation Impact Assessment
**Goal**: Evaluate proposed mutations

**Workflow**:
1. Load wild-type protein
2. Describe mutation plan to Bio-Lingo
3. Request stability/activity predictions
4. Review molecular-level impacts
5. Iterate on design

## 🔧 Troubleshooting

### Backend Not Responding
Check if backend is running:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

Restart backend:
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 3001 --reload
```

### Frontend Not Loading
Check logs:
```bash
tail -f /tmp/frontend-dev.log
```

Restart frontend:
```bash
cd frontend
npm run dev -- --hostname 0.0.0.0
```

### 3D Viewer Not Loading Structures
- Check browser console for errors
- Verify PDB ID is valid (4 characters)
- Try a known structure like "1AKI"

## 📚 Next Steps

### Explore the Codebase
- **Frontend**: `/workspace/bio-forge/frontend/src/`
  - `components/BioLingoConsole.tsx`: Chat interface
  - `components/HoloStudio.tsx`: 3D viewer
  - `components/ProteinExplorer.tsx`: Protein search

- **Backend**: `/workspace/bio-forge/backend/src/`
  - `agents/orchestrator.py`: Task decomposition
  - `agents/molecular_architect.py`: Protein analysis
  - `lib/bio_apis.py`: UniProt & PDB integration

### Extend the MVP
- Add more specialized agents (Pathway Designer, etc.)
- Implement persistent project management
- Add export functionality (FASTA, PDB, reports)
- Integrate AlphaFold for structure prediction
- Add sequence alignment tools

### Deploy to Production
```bash
# Frontend
nxcode deploy --type frontend --dir frontend

# Backend
nxcode deploy --type backend-container --dir backend

# Set environment variables
nxcode secret set bio-forge-api NXCODE_APP_ID "<your-app-id>"
```

## 🎨 Customization

### Change Theme Colors
Edit `frontend/src/app/globals.css` to customize the color scheme.

### Add New Agents
1. Create agent class in `backend/src/agents/`
2. Add routes in `backend/src/routes/api.py`
3. Update Orchestrator routing logic

### Integrate Additional Databases
Add new API clients in `backend/src/lib/bio_apis.py`:
- KEGG for pathways
- ChEMBL for drug data
- AlphaFold for predicted structures

## 🆘 Support

For issues or questions:
1. Check the main README.md
2. Review API endpoint documentation
3. Examine backend logs: `/tmp/backend-dev.log`
4. Check frontend logs: `/tmp/frontend-dev.log`

---

**Happy Molecular Engineering!** 🧬✨
