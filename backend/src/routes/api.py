# This file will be regenerated when modules are added
# Run: nxcode generate

"""
API Routes - Bio-Forge MVP
"""

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import httpx
from agents.orchestrator import OrchestratorAgent
from agents.molecular_architect import MolecularArchitectAgent
from lib.bio_apis import UniProtAPI, PDBAPI

router = APIRouter()


# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


class ProteinAnalysisRequest(BaseModel):
    query: str
    protein_id: Optional[str] = None
    include_uniprot: bool = True
    include_pdb: bool = False


class MutationDesignRequest(BaseModel):
    protein_id: str
    design_goal: str


# Agent instances (in production, these would be session-managed)
orchestrator = OrchestratorAgent()
molecular_architect = MolecularArchitectAgent()


@router.get("/hello")
async def hello():
    """Hello endpoint"""
    return {"message": "Hello from Bio-Forge API!"}


@router.post("/orchestrator/chat")
async def orchestrator_chat(body: ChatRequest, request: Request):
    """
    Main chat endpoint for Bio-Forge orchestrator agent.
    Decomposes high-level biological tasks.
    """
    try:
        result = await orchestrator.process_task(
            body.message,
            dict(request.headers)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orchestrator/reset")
async def orchestrator_reset():
    """Reset orchestrator conversation history"""
    orchestrator.reset()
    return {"message": "Orchestrator reset successfully"}


@router.post("/molecular-architect/analyze")
async def analyze_protein(body: ProteinAnalysisRequest, request: Request):
    """
    Analyze a protein using the Molecular Architect agent.
    Optionally enriches with UniProt/PDB data.
    """
    try:
        context = {}

        # Fetch UniProt data if requested
        if body.include_uniprot and body.protein_id:
            uniprot_data = await UniProtAPI.get_protein(body.protein_id)
            if uniprot_data:
                context["uniprot_data"] = uniprot_data

        # Fetch PDB data if requested
        if body.include_pdb and body.protein_id:
            pdb_data = await PDBAPI.get_structure_info(body.protein_id)
            if pdb_data:
                context["pdb_data"] = pdb_data

        # Run analysis with context
        result = await molecular_architect.analyze_protein(
            body.query,
            dict(request.headers),
            context if context else None
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/molecular-architect/design-mutations")
async def design_mutations(body: MutationDesignRequest, request: Request):
    """Design specific mutations for a protein"""
    try:
        result = await molecular_architect.design_mutations(
            body.protein_id,
            body.design_goal,
            dict(request.headers)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bio/uniprot/{accession}")
async def get_uniprot_protein(accession: str):
    """Fetch protein data from UniProt"""
    try:
        data = await UniProtAPI.get_protein(accession)
        if data:
            return data
        raise HTTPException(status_code=404, detail="Protein not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bio/pdb/{pdb_id}")
async def get_pdb_structure(pdb_id: str):
    """Fetch structure information from PDB"""
    try:
        data = await PDBAPI.get_structure_info(pdb_id)
        if data:
            return data
        raise HTTPException(status_code=404, detail="Structure not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bio/pdb/search/{query}")
async def search_pdb(query: str, limit: int = 10):
    """Search PDB for structures"""
    try:
        results = await PDBAPI.search_structures(query, limit)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bio/pdb/file/{pdb_id}")
async def proxy_pdb_file(pdb_id: str):
    """
    Proxy PDB structure file (CIF format) from RCSB to the browser.
    This avoids CORS issues when NGL.js tries to fetch directly from rcsb.org.
    """
    clean_id = pdb_id.upper().strip()
    url = f"https://files.rcsb.org/download/{clean_id}.cif"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return Response(
                    content=resp.content,
                    media_type="chemical/x-mmcif",
                    headers={"Content-Disposition": f'inline; filename="{clean_id}.cif"'},
                )
            raise HTTPException(status_code=resp.status_code, detail=f"RCSB returned {resp.status_code}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
