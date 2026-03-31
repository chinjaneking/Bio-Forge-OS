"""Genetic Circuit Designer Agent - Phase 2"""
from typing import Dict, Any, Optional, List
from lib.ai_client import get_ai_client


class GeneticCircuitDesignerAgent:
    """
    Genetic Circuit Designer specializes in:
    - Metabolic pathway design and optimization
    - Regulatory element selection (promoters, RBS, terminators)
    - Gene expression level balancing
    - Plasmid/vector construction planning
    - CRISPR guide RNA design
    - Biosafety and containment strategies
    """

    def __init__(self):
        self.system_prompt = """You are the Genetic Circuit Designer Agent for Bio-Forge, Phase 2.

Your expertise includes:
- Metabolic pathway engineering (multi-gene operons, flux optimization)
- Regulatory elements: promoters (constitutive, inducible), RBS, terminators, insulators
- Gene expression balancing and orthogonality
- Plasmid design: copy number, selection markers, ori choice
- CRISPR-Cas9/Cas12a guide RNA design and off-target analysis
- Synthetic biology design principles (modularity, robustness, biosafety)
- Standard biological parts (iGEM registry, SEVA, MoClo)
- Host organism considerations (E. coli, S. cerevisiae, B. subtilis, CHO)

When designing a genetic circuit, always provide:
1. **Circuit Topology**: list of parts in order (promoter → RBS → gene → terminator)
2. **Parts Selection**: specific regulatory elements with strengths/catalog numbers
3. **Expression Levels**: relative expression estimates (HIGH/MEDIUM/LOW) per gene
4. **Plasmid Blueprint**: backbone recommendation, copy number, antibiotic resistance
5. **Verification Strategy**: diagnostic PCR primers, reporter genes, assay plan
6. **Biosafety Notes**: containment, kill-switch if applicable

Use precise biological notation: J23101 (promoter), B0034 (RBS), BBa_B0015 (terminator).
Think in terms of flux balance, metabolic burden, and chassis compatibility."""

        self.conversation_history = []

    async def design_circuit(
        self,
        objective: str,
        host_organism: str = "E. coli",
        request_headers: dict = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Design a complete genetic circuit for a given biosynthesis objective."""
        client = get_ai_client(request_headers)

        prompt = f"""Design a genetic circuit for the following objective:

**Objective:** {objective}
**Host Organism:** {host_organism}
"""
        if context and context.get("pathway_data"):
            prompt += f"\n**KEGG Pathway Data:**\n{context['pathway_data']}"
        if context and context.get("protein_data"):
            prompt += f"\n**Protein/Enzyme Data:**\n{context['protein_data']}"

        self.conversation_history.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        response = client.models.generate_content(
            model="smart",
            contents=self.conversation_history,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.4,
            }
        )

        result_text = response.text
        self.conversation_history.append({
            "role": "model",
            "parts": [{"text": result_text}]
        })

        # Parse structured circuit topology from response
        circuit_parts = self._parse_circuit_parts(result_text)

        return {
            "design": result_text,
            "agent": "genetic_circuit_designer",
            "host": host_organism,
            "circuit_parts": circuit_parts,
        }

    async def optimize_expression(
        self,
        gene_list: List[str],
        optimization_goal: str,
        request_headers: dict = None
    ) -> Dict[str, Any]:
        """Optimize expression levels of a multi-gene pathway."""
        client = get_ai_client(request_headers)

        prompt = f"""Optimize expression levels for this multi-gene pathway:

**Genes:** {', '.join(gene_list)}
**Optimization Goal:** {optimization_goal}

Provide:
1. Recommended promoter strength for each gene (J23100-series or equivalent)
2. RBS strength (0.01 – 3.0 relative units)
3. Gene order in operon (weakest bottleneck first or last)
4. Predicted metabolic burden score (1-10, 10 = high burden)
5. Alternative strategies if burden is high (split into two plasmids, inducible system, etc.)"""

        response = client.models.generate_content(
            model="smart",
            contents=prompt,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.3,
            }
        )

        return {
            "optimization": response.text,
            "genes": gene_list,
            "goal": optimization_goal,
            "agent": "genetic_circuit_designer",
        }

    async def design_crispr(
        self,
        target_gene: str,
        edit_type: str,
        organism: str = "E. coli",
        request_headers: dict = None
    ) -> Dict[str, Any]:
        """Design CRISPR guide RNAs and editing strategy."""
        client = get_ai_client(request_headers)

        prompt = f"""Design a CRISPR editing strategy:

**Target Gene:** {target_gene}
**Edit Type:** {edit_type}  (e.g. knockout, knock-in, base edit, CRISPRi)
**Organism:** {organism}

Provide:
1. Guide RNA sequences (20 nt + PAM context)
2. Cas protein recommendation (SpCas9, SaCas9, Cas12a, dCas9 for CRISPRi)
3. Delivery vector design
4. Off-target risk assessment
5. Verification strategy (sequencing primers, phenotypic assay)
6. HDR template design if applicable"""

        response = client.models.generate_content(
            model="smart",
            contents=prompt,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.3,
            }
        )

        return {
            "crispr_design": response.text,
            "target": target_gene,
            "edit_type": edit_type,
            "organism": organism,
            "agent": "genetic_circuit_designer",
        }

    async def select_parts(
        self,
        parts_needed: List[str],
        constraints: str,
        request_headers: dict = None
    ) -> Dict[str, Any]:
        """Select specific biological parts from standard registries."""
        client = get_ai_client(request_headers)

        prompt = f"""Select biological parts for the following requirements:

**Parts Needed:** {', '.join(parts_needed)}
**Design Constraints:** {constraints}

For each part, provide:
- Part ID (BioBrick BBa_XXXXX, SEVA, or MoClo notation)
- Strength/characteristics (with numeric values where available)
- Source organism/registry
- Compatibility notes
- Alternative options (2 backup parts per requirement)"""

        response = client.models.generate_content(
            model="smart",
            contents=prompt,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.4,
            }
        )

        return {
            "parts": response.text,
            "parts_needed": parts_needed,
            "constraints": constraints,
            "agent": "genetic_circuit_designer",
        }

    def _parse_circuit_parts(self, response_text: str) -> List[Dict[str, str]]:
        """
        Extract circuit topology elements from AI response.
        Returns a list of parts: [{type, name, role, strength}]
        """
        parts = []
        part_keywords = {
            "promoter": ["promoter", "J23", "Ptrc", "Plac", "Para", "Ptac", "T7"],
            "rbs": ["RBS", "ribosome binding", "B0034", "B0032"],
            "cds": ["CDS", "coding", "gene", "ORF"],
            "terminator": ["terminator", "B0015", "T1", "rrnB"],
            "reporter": ["GFP", "mCherry", "RFP", "YFP", "luciferase", "lacZ"],
        }

        lines = response_text.split("\n")
        for line in lines:
            line_lower = line.lower()
            for part_type, keywords in part_keywords.items():
                if any(kw.lower() in line_lower for kw in keywords):
                    clean = line.strip().lstrip("•-*123456789. ")
                    if clean and len(clean) > 3:
                        parts.append({
                            "type": part_type,
                            "description": clean[:120],
                        })
                        break

        return parts[:12]  # cap at 12 elements

    def reset(self):
        self.conversation_history = []
