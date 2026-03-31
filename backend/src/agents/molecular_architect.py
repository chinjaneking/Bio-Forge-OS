"""Molecular Architect Agent - Protein/Enzyme Analysis & Design"""
from typing import Dict, Any, Optional
from lib.ai_client import get_ai_client

class MolecularArchitectAgent:
    """
    Molecular Architect specializes in:
    - Protein structure analysis
    - Enzyme catalytic mechanism interpretation
    - Mutation design and stability prediction
    - Binding site identification
    """

    def __init__(self):
        self.system_prompt = """You are the Molecular Architect Agent for Bio-Forge, specializing in protein and enzyme engineering.

Your expertise includes:
- Protein structure-function relationships
- Enzyme catalytic mechanisms and kinetics
- Rational design of mutations for improved activity/stability/specificity
- Analysis of protein structures from PDB
- Interpretation of UniProt sequence and annotation data

When analyzing a protein:
1. Identify key structural features (active sites, binding pockets, domains)
2. Explain catalytic mechanisms or functional roles
3. Suggest engineering strategies (mutations, truncations, fusions)
4. Consider stability, expression, and practical constraints
5. Provide molecular-level insights with scientific accuracy

Use clear scientific language. Reference specific residues, domains, and structural elements.
Be quantitative when possible (Km, kcat, ΔΔG estimates)."""

        self.conversation_history = []

    async def analyze_protein(self, query: str, request_headers: dict = None, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze a protein and provide molecular insights"""
        client = get_ai_client(request_headers)

        # Build context-aware prompt
        full_prompt = query
        if context and context.get("uniprot_data"):
            full_prompt += f"\n\nUniProt Data:\n{context['uniprot_data']}"
        if context and context.get("pdb_data"):
            full_prompt += f"\n\nPDB Structure Data:\n{context['pdb_data']}"

        # Add to history
        self.conversation_history.append({
            "role": "user",
            "parts": [{"text": full_prompt}]
        })

        # Generate response
        response = client.models.generate_content(
            model="smart",
            contents=self.conversation_history,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.4,
            }
        )

        assistant_message = response.text

        # Add to history
        self.conversation_history.append({
            "role": "model",
            "parts": [{"text": assistant_message}]
        })

        return {
            "analysis": assistant_message,
            "agent": "molecular_architect",
            "context_used": list(context.keys()) if context else []
        }

    async def design_mutations(self, protein_id: str, design_goal: str, request_headers: dict = None) -> Dict[str, Any]:
        """Design specific mutations for a protein"""
        client = get_ai_client(request_headers)

        prompt = f"""Design mutations for protein {protein_id} to achieve: {design_goal}

Provide:
1. Specific mutations (e.g., "V234A", "L156F")
2. Rationale for each mutation
3. Expected effects on stability, activity, specificity
4. Potential risks or trade-offs
5. Experimental validation strategy"""

        response = client.models.generate_content(
            model="smart",
            contents=prompt,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.5,
            }
        )

        return {
            "mutations": response.text,
            "protein_id": protein_id,
            "design_goal": design_goal
        }

    async def predict_structure_features(self, sequence: str, request_headers: dict = None) -> Dict[str, Any]:
        """Predict structural features from sequence"""
        client = get_ai_client(request_headers)

        prompt = f"""Analyze this protein sequence and predict key structural features:

Sequence:
{sequence}

Identify:
1. Secondary structure elements (helices, sheets, loops)
2. Potential active sites or binding pockets
3. Conserved motifs or domains
4. Unusual features or characteristics"""

        response = client.models.generate_content(
            model="smart",
            contents=prompt,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.3,
            }
        )

        return {
            "features": response.text,
            "sequence_length": len(sequence)
        }

    def reset(self):
        """Reset conversation history"""
        self.conversation_history = []
