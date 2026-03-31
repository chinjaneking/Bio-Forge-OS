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
from agents.genetic_circuit_designer import GeneticCircuitDesignerAgent
from lib.bio_apis import UniProtAPI, PDBAPI
from lib.circuit_apis import KEGGAPI, BioBricksAPI, NCBIPartsAPI

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
circuit_designer = GeneticCircuitDesignerAgent()


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


# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — GENETIC CIRCUIT DESIGNER
# ─────────────────────────────────────────────────────────────────────────────

class CircuitDesignRequest(BaseModel):
    objective: str
    host_organism: str = "E. coli"
    context: Optional[Dict[str, Any]] = None

class ExpressionOptimizationRequest(BaseModel):
    gene_list: List[str]
    optimization_goal: str

class CRISPRDesignRequest(BaseModel):
    target_gene: str
    edit_type: str
    organism: str = "E. coli"

class PartsSelectionRequest(BaseModel):
    parts_needed: List[str]
    constraints: str


@router.post("/circuit/design")
async def design_circuit(body: CircuitDesignRequest, request: Request):
    """Design a complete genetic circuit for a biosynthesis objective."""
    try:
        result = await circuit_designer.design_circuit(
            body.objective, body.host_organism, dict(request.headers), body.context,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/circuit/optimize-expression")
async def optimize_expression(body: ExpressionOptimizationRequest, request: Request):
    """Optimize expression levels for a multi-gene pathway."""
    try:
        result = await circuit_designer.optimize_expression(
            body.gene_list, body.optimization_goal, dict(request.headers),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/circuit/crispr")
async def design_crispr(body: CRISPRDesignRequest, request: Request):
    """Design CRISPR guide RNAs and editing strategy."""
    try:
        result = await circuit_designer.design_crispr(
            body.target_gene, body.edit_type, body.organism, dict(request.headers),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/circuit/select-parts")
async def select_parts(body: PartsSelectionRequest, request: Request):
    """Select biological parts from standard registries."""
    try:
        result = await circuit_designer.select_parts(
            body.parts_needed, body.constraints, dict(request.headers),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/circuit/reset")
async def circuit_reset():
    circuit_designer.reset()
    return {"message": "Circuit designer reset successfully"}


# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — KEGG PATHWAY ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/bio/kegg/search/{query}")
async def search_kegg_pathways(query: str):
    """Search KEGG pathways by keyword."""
    try:
        results = await KEGGAPI.search_pathway(query)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bio/kegg/pathway/{pathway_id:path}")
async def get_kegg_pathway(pathway_id: str):
    """Fetch a KEGG pathway entry (e.g. map00010 for Glycolysis)."""
    try:
        data = await KEGGAPI.get_pathway(pathway_id)
        if data:
            return data
        raise HTTPException(status_code=404, detail="Pathway not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bio/kegg/enzyme/{enzyme_id:path}")
async def get_kegg_enzyme(enzyme_id: str):
    """Fetch a KEGG enzyme entry (e.g. ec:1.1.1.1)."""
    try:
        data = await KEGGAPI.get_enzyme(enzyme_id)
        if data:
            return data
        raise HTTPException(status_code=404, detail="Enzyme not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — BIOLOGICAL PARTS ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/bio/parts/common")
async def get_common_parts():
    """Return the curated list of commonly used BioBrick parts."""
    return {"parts": BioBricksAPI.get_common_parts()}


@router.get("/bio/parts/{part_id}")
async def get_biobrick_part(part_id: str):
    """Fetch a BioBrick part from the iGEM registry."""
    try:
        data = await BioBricksAPI.get_part(part_id)
        if data:
            return data
        raise HTTPException(status_code=404, detail="Part not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bio/ncbi/gene/{query}")
async def search_ncbi_gene(query: str, organism: str = "Escherichia coli"):
    """Search NCBI Gene database for a gene."""
    try:
        results = await NCBIPartsAPI.search_gene(query, organism)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
