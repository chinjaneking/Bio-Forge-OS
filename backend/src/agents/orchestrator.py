"""Orchestrator Agent - Hierarchical Task Decomposition"""
from typing import List, Dict, Any
from lib.ai_client import get_ai_client

class OrchestratorAgent:
    """
    Orchestrator Agent decomposes high-level biological design goals
    into specific sub-tasks and coordinates specialized agents.
    """

    def __init__(self):
        self.system_prompt = """You are the Orchestrator Agent for Bio-Forge, an AI system for molecular design.

Your role is to:
1. Decompose complex biological design tasks into actionable sub-tasks
2. Determine which specialized agents to invoke (Molecular Architect, etc.)
3. Synthesize results from multiple agents into coherent insights
4. Maintain context across the design workflow

Available specialized agents:
- Molecular Architect: Protein/enzyme analysis, structure prediction, mutation design

When given a biological design goal, analyze it and create a structured plan with:
- Task breakdown
- Agent assignments
- Expected outputs
- Dependencies between steps

Be precise, scientific, and actionable."""

        self.conversation_history = []

    async def process_task(self, user_input: str, request_headers: dict = None) -> Dict[str, Any]:
        """Process a high-level biological task and decompose it"""
        client = get_ai_client(request_headers)

        # Add user input to history
        self.conversation_history.append({
            "role": "user",
            "parts": [{"text": user_input}]
        })

        # Generate response with task decomposition
        response = client.models.generate_content(
            model="smart",  # Use smart model for complex reasoning
            contents=self.conversation_history,
            config={
                "system_instruction": self.system_prompt,
                "temperature": 0.3,  # Lower temperature for more focused responses
            }
        )

        assistant_message = response.text

        # Add to history
        self.conversation_history.append({
            "role": "model",
            "parts": [{"text": assistant_message}]
        })

        # Parse the response to extract structured task plan
        # For MVP, return raw text; production would parse into structured tasks
        return {
            "response": assistant_message,
            "task_plan": self._extract_task_plan(assistant_message),
            "conversation_id": id(self.conversation_history)
        }

    def _extract_task_plan(self, response: str) -> List[Dict[str, str]]:
        """Extract structured task plan from agent response"""
        # Simple extraction logic for MVP
        # Production version would use structured output or better parsing
        tasks = []
        lines = response.split('\n')

        for line in lines:
            line = line.strip()
            if line.startswith(('1.', '2.', '3.', '4.', '5.', '-', '*')):
                tasks.append({
                    "description": line.lstrip('0123456789.-* '),
                    "status": "pending"
                })

        return tasks

    async def route_to_specialist(self, task: str, specialist_type: str, request_headers: dict = None) -> Dict[str, Any]:
        """Route a specific task to a specialized agent"""
        # This would invoke the appropriate specialist agent
        # For MVP, we'll implement Molecular Architect routing

        if specialist_type == "molecular_architect":
            from .molecular_architect import MolecularArchitectAgent
            architect = MolecularArchitectAgent()
            return await architect.analyze_protein(task, request_headers)

        return {"error": f"Unknown specialist type: {specialist_type}"}

    def reset(self):
        """Reset conversation history"""
        self.conversation_history = []
