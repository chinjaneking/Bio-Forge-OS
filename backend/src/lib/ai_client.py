"""AI Client for Bio-Forge agents"""
import os
from google import genai
from google.genai import types

AI_ENDPOINT = "https://studio-api.nxcode.io/api/ai-gateway"

def get_ai_client(request_headers: dict = None) -> genai.Client:
    """Create AI client with proper authentication for both dev and production."""
    headers = {}

    app_id = os.environ.get("NXCODE_APP_ID", "")
    workspace_id = os.environ.get("THREAD_ID", "")

    if app_id:
        # Production: deployed to Cloudflare Containers
        headers["X-App-Id"] = app_id
        if request_headers:
            auth = request_headers.get("Authorization", "")
            if auth:
                headers["Authorization"] = auth
    elif workspace_id:
        # Development: running in Nxcode workspace container
        headers["X-Workspace-Id"] = workspace_id
        if request_headers:
            session_token = request_headers.get("X-Session-Token", "")
            if session_token:
                headers["X-Session-Token"] = session_token

    return genai.Client(
        api_key="nxcode",  # Placeholder, gateway handles auth
        http_options={
            "api_endpoint": AI_ENDPOINT,
            "headers": headers
        }
    )
