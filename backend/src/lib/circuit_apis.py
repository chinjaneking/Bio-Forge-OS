"""Phase 2 — Genetic Circuit & Pathway API Integrations"""
import httpx
from typing import Dict, Any, Optional, List


class KEGGAPI:
    """
    Interface to KEGG (Kyoto Encyclopedia of Genes and Genomes).
    Fetches metabolic pathways, reactions, and enzyme data.
    """
    BASE_URL = "https://rest.kegg.jp"

    @staticmethod
    async def get_pathway(pathway_id: str) -> Optional[Dict[str, Any]]:
        """Fetch pathway info, e.g. pathway_id='map00010' (Glycolysis)."""
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(f"{KEGGAPI.BASE_URL}/get/{pathway_id}")
                if resp.status_code == 200:
                    return KEGGAPI._parse_flat_file(resp.text, pathway_id)
                return None
        except Exception as e:
            print(f"KEGG pathway error: {e}")
            return None

    @staticmethod
    async def search_pathway(query: str) -> List[Dict[str, str]]:
        """Search KEGG pathways by keyword."""
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(
                    f"{KEGGAPI.BASE_URL}/find/pathway/{query.replace(' ', '%20')}"
                )
                if resp.status_code == 200:
                    results = []
                    for line in resp.text.strip().split("\n"):
                        if "\t" in line:
                            pid, name = line.split("\t", 1)
                            results.append({"id": pid.strip(), "name": name.strip()})
                    return results[:15]
                return []
        except Exception as e:
            print(f"KEGG search error: {e}")
            return []

    @staticmethod
    async def get_enzyme(enzyme_id: str) -> Optional[Dict[str, Any]]:
        """Fetch enzyme entry, e.g. enzyme_id='ec:1.1.1.1'."""
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(f"{KEGGAPI.BASE_URL}/get/{enzyme_id}")
                if resp.status_code == 200:
                    return KEGGAPI._parse_flat_file(resp.text, enzyme_id)
                return None
        except Exception as e:
            print(f"KEGG enzyme error: {e}")
            return None

    @staticmethod
    async def get_reaction(reaction_id: str) -> Optional[Dict[str, Any]]:
        """Fetch reaction entry, e.g. reaction_id='rn:R00200'."""
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(f"{KEGGAPI.BASE_URL}/get/{reaction_id}")
                if resp.status_code == 200:
                    return KEGGAPI._parse_flat_file(resp.text, reaction_id)
                return None
        except Exception as e:
            print(f"KEGG reaction error: {e}")
            return None

    @staticmethod
    async def get_pathway_image_url(pathway_id: str) -> str:
        """Return KEGG pathway map image URL."""
        # KEGG provides pathway images at a standard URL
        clean = pathway_id.replace("path:", "").replace("map", "map")
        return f"https://www.genome.jp/kegg/pathway/map/{clean}.png"

    @staticmethod
    def _parse_flat_file(text: str, entry_id: str) -> Dict[str, Any]:
        """Parse KEGG flat-file format into a structured dict."""
        result: Dict[str, Any] = {"id": entry_id, "raw": text[:2000]}
        current_key = None
        current_val: List[str] = []

        for line in text.split("\n"):
            if not line:
                continue
            if line.startswith("///"):
                break
            if line[0] != " " and line[0] != "\t":
                if current_key and current_val:
                    result[current_key.lower()] = " ".join(current_val).strip()
                parts = line.split(None, 1)
                current_key = parts[0]
                current_val = [parts[1]] if len(parts) > 1 else []
            else:
                current_val.append(line.strip())

        if current_key and current_val:
            result[current_key.lower()] = " ".join(current_val).strip()

        return result


class BioBricksAPI:
    """
    Lightweight client for iGEM BioBricks / Parts Registry.
    Uses the public parts.igem.org REST API.
    """
    BASE_URL = "https://parts.igem.org/cgi/xml/part.cgi"

    @staticmethod
    async def get_part(part_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a BioBrick part by ID, e.g. 'BBa_J23101'."""
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    f"{BioBricksAPI.BASE_URL}?part={part_id}"
                )
                if resp.status_code == 200:
                    return BioBricksAPI._parse_xml(resp.text, part_id)
                return None
        except Exception as e:
            print(f"BioBricks API error: {e}")
            return None

    @staticmethod
    def _parse_xml(xml_text: str, part_id: str) -> Dict[str, Any]:
        """Extract key fields from BioBricks XML response."""
        import re

        def extract(tag: str) -> str:
            m = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", xml_text, re.DOTALL)
            return m.group(1).strip() if m else ""

        return {
            "part_id": part_id,
            "name": extract("part_name") or extract("name") or part_id,
            "description": extract("part_short_desc") or extract("description"),
            "type": extract("part_type"),
            "author": extract("part_author"),
            "rating": extract("part_rating"),
            "sequence": extract("seq_data"),
            "url": f"https://parts.igem.org/Part:{part_id}",
        }

    @staticmethod
    def get_common_parts() -> List[Dict[str, str]]:
        """Return a curated list of commonly used parts (no API call needed)."""
        return [
            # Promoters
            {"id": "BBa_J23100", "type": "promoter", "name": "J23100", "strength": "1.00", "notes": "Constitutive, strongest Anderson"},
            {"id": "BBa_J23101", "type": "promoter", "name": "J23101", "strength": "0.70", "notes": "Constitutive, high"},
            {"id": "BBa_J23106", "type": "promoter", "name": "J23106", "strength": "0.47", "notes": "Constitutive, medium"},
            {"id": "BBa_J23117", "type": "promoter", "name": "J23117", "strength": "0.06", "notes": "Constitutive, weak"},
            {"id": "BBa_R0010",  "type": "promoter", "name": "Plac",   "strength": "inducible", "notes": "IPTG-inducible lac promoter"},
            {"id": "BBa_R0040",  "type": "promoter", "name": "Ptet",   "strength": "inducible", "notes": "aTc-inducible tet promoter"},
            {"id": "BBa_K1893008","type": "promoter","name": "T7",     "strength": "very high",  "notes": "T7 RNAP-dependent, extremely strong"},
            # RBS
            {"id": "BBa_B0034",  "type": "rbs", "name": "B0034",  "strength": "1.00", "notes": "Strong RBS (Elowitz)"},
            {"id": "BBa_B0032",  "type": "rbs", "name": "B0032",  "strength": "0.30", "notes": "Medium RBS"},
            {"id": "BBa_B0031",  "type": "rbs", "name": "B0031",  "strength": "0.07", "notes": "Weak RBS"},
            # Terminators
            {"id": "BBa_B0015",  "type": "terminator", "name": "B0015", "strength": "strong", "notes": "Double terminator (B0010+B0012)"},
            {"id": "BBa_B0010",  "type": "terminator", "name": "B0010", "strength": "medium", "notes": "rrnBT1 terminator"},
            # Reporters
            {"id": "BBa_E0040",  "type": "reporter", "name": "GFPmut3b", "strength": "—", "notes": "Green fluorescent protein"},
            {"id": "BBa_E1010",  "type": "reporter", "name": "mRFP1",    "strength": "—", "notes": "Red fluorescent protein"},
            {"id": "BBa_K325909","type": "reporter", "name": "mCherry",  "strength": "—", "notes": "Bright red FP, low toxicity"},
        ]


class NCBIPartsAPI:
    """Lightweight NCBI Entrez interface for gene/sequence lookup."""
    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    @staticmethod
    async def search_gene(query: str, organism: str = "Escherichia coli") -> List[Dict[str, Any]]:
        """Search NCBI Gene database."""
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                search_resp = await client.get(
                    f"{NCBIPartsAPI.BASE_URL}/esearch.fcgi",
                    params={
                        "db": "gene",
                        "term": f"{query}[Gene Name] AND {organism}[Organism]",
                        "retmode": "json",
                        "retmax": 5,
                    }
                )
                if search_resp.status_code != 200:
                    return []

                data = search_resp.json()
                ids = data.get("esearchresult", {}).get("idlist", [])
                if not ids:
                    return []

                # Fetch summaries
                summary_resp = await client.get(
                    f"{NCBIPartsAPI.BASE_URL}/esummary.fcgi",
                    params={"db": "gene", "id": ",".join(ids), "retmode": "json"}
                )
                if summary_resp.status_code != 200:
                    return []

                summaries = summary_resp.json().get("result", {})
                results = []
                for uid in ids:
                    s = summaries.get(uid, {})
                    results.append({
                        "uid": uid,
                        "name": s.get("name", ""),
                        "description": s.get("description", ""),
                        "organism": s.get("organism", {}).get("scientificname", ""),
                        "chromosome": s.get("chromosome", ""),
                        "maplocation": s.get("maplocation", ""),
                    })
                return results
        except Exception as e:
            print(f"NCBI search error: {e}")
            return []
