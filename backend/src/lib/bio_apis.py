"""Biological Database API Integrations"""
import httpx
from typing import Dict, Any, Optional, List

class UniProtAPI:
    """Interface to UniProt protein database"""

    BASE_URL = "https://rest.uniprot.org/uniprotkb"

    @staticmethod
    async def get_protein(accession: str) -> Optional[Dict[str, Any]]:
        """Fetch protein data from UniProt"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{UniProtAPI.BASE_URL}/{accession}.json"
                )
                if response.status_code == 200:
                    data = response.json()
                    return UniProtAPI._extract_key_info(data)
                return None
        except Exception as e:
            print(f"UniProt API error: {e}")
            return None

    @staticmethod
    def _extract_key_info(raw_data: Dict) -> Dict[str, Any]:
        """Extract key information from UniProt response"""
        return {
            "accession": raw_data.get("primaryAccession"),
            "name": raw_data.get("uniProtkbId"),
            "protein_name": raw_data.get("proteinDescription", {}).get("recommendedName", {}).get("fullName", {}).get("value", "Unknown"),
            "organism": raw_data.get("organism", {}).get("scientificName", "Unknown"),
            "sequence": raw_data.get("sequence", {}).get("value", ""),
            "length": raw_data.get("sequence", {}).get("length", 0),
            "gene": raw_data.get("genes", [{}])[0].get("geneName", {}).get("value", "") if raw_data.get("genes") else "",
            "function": UniProtAPI._extract_function(raw_data),
            "catalytic_activity": UniProtAPI._extract_catalytic_activity(raw_data),
            "subcellular_location": UniProtAPI._extract_location(raw_data),
            "features": UniProtAPI._extract_features(raw_data),
        }

    @staticmethod
    def _extract_function(data: Dict) -> str:
        """Extract function description"""
        comments = data.get("comments", [])
        for comment in comments:
            if comment.get("commentType") == "FUNCTION":
                texts = comment.get("texts", [])
                if texts:
                    return texts[0].get("value", "")
        return ""

    @staticmethod
    def _extract_catalytic_activity(data: Dict) -> List[str]:
        """Extract catalytic activity information"""
        activities = []
        comments = data.get("comments", [])
        for comment in comments:
            if comment.get("commentType") == "CATALYTIC ACTIVITY":
                reaction = comment.get("reaction", {})
                name = reaction.get("name", "")
                if name:
                    activities.append(name)
        return activities

    @staticmethod
    def _extract_location(data: Dict) -> List[str]:
        """Extract subcellular location"""
        locations = []
        comments = data.get("comments", [])
        for comment in comments:
            if comment.get("commentType") == "SUBCELLULAR LOCATION":
                locs = comment.get("subcellularLocations", [])
                for loc in locs:
                    location = loc.get("location", {}).get("value", "")
                    if location:
                        locations.append(location)
        return locations

    @staticmethod
    def _extract_features(data: Dict) -> List[Dict[str, Any]]:
        """Extract important features (active sites, binding sites, domains)"""
        features = []
        raw_features = data.get("features", [])
        important_types = ["ACTIVE_SITE", "BINDING", "DOMAIN", "REGION", "SITE"]

        for feature in raw_features:
            feat_type = feature.get("type")
            if feat_type in important_types:
                features.append({
                    "type": feat_type,
                    "description": feature.get("description", ""),
                    "location": feature.get("location", {}),
                })

        return features[:20]  # Limit to first 20 features


class PDBAPI:
    """Interface to Protein Data Bank"""

    BASE_URL = "https://data.rcsb.org/rest/v1/core"
    FILES_URL = "https://files.rcsb.org/download"

    @staticmethod
    async def get_structure_info(pdb_id: str) -> Optional[Dict[str, Any]]:
        """Fetch structure information from PDB"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{PDBAPI.BASE_URL}/entry/{pdb_id.upper()}"
                )
                if response.status_code == 200:
                    data = response.json()
                    return PDBAPI._extract_structure_info(data, pdb_id.upper())
                return None
        except Exception as e:
            print(f"PDB API error: {e}")
            return None

    @staticmethod
    def _extract_structure_info(raw_data: Dict, pdb_id: str) -> Dict[str, Any]:
        """Extract key structure information from PDB response"""
        struct = raw_data.get("struct", {})
        exptl = raw_data.get("exptl", [{}])[0] if raw_data.get("exptl") else {}
        refine = raw_data.get("refine", [{}])[0] if raw_data.get("refine") else {}

        return {
            "pdb_id": pdb_id,
            "title": struct.get("title", ""),
            "experimental_method": exptl.get("method", ""),
            "resolution": refine.get("ls_d_res_high"),
            "deposition_date": raw_data.get("rcsb_accession_info", {}).get("deposit_date"),
            "structure_file_url": f"{PDBAPI.FILES_URL}/{pdb_id}.cif",
            "visualization_url": f"https://www.rcsb.org/3d-view/{pdb_id}",
            "polymer_entities": PDBAPI._extract_polymer_info(raw_data),
        }

    @staticmethod
    def _extract_polymer_info(data: Dict) -> List[Dict[str, Any]]:
        """Extract polymer (protein/nucleic acid) entity information"""
        entities = []
        polymer_entities = data.get("rcsb_entry_info", {}).get("polymer_entity_count", 0)

        # This is simplified; full implementation would fetch entity details
        return [{
            "count": polymer_entities,
            "type": "protein"  # Would need to determine actual type
        }]

    @staticmethod
    async def search_structures(query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search PDB for structures matching query"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                search_url = "https://search.rcsb.org/rcsbsearch/v2/query"
                payload = {
                    "query": {
                        "type": "terminal",
                        "service": "full_text",
                        "parameters": {
                            "value": query
                        }
                    },
                    "return_type": "entry",
                    "request_options": {
                        "return_all_hits": False,
                        "results_content_type": ["experimental"],
                        "sort": [{"sort_by": "score", "direction": "desc"}],
                        "scoring_strategy": "combined"
                    }
                }

                response = await client.post(search_url, json=payload)
                if response.status_code == 200:
                    results = response.json()
                    pdb_ids = [item["identifier"] for item in results.get("result_set", [])[:limit]]
                    return [{"pdb_id": pdb_id} for pdb_id in pdb_ids]
                return []
        except Exception as e:
            print(f"PDB search error: {e}")
            return []
