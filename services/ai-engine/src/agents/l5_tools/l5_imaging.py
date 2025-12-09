"""
VITAL Path AI Services - VITAL L5 Medical Imaging Tools

Medical Imaging: OHIF Viewer, 3D Slicer
2 tools for DICOM viewing and medical image analysis.

Naming Convention:
- Class: ImagingL5Tool
- Factory: create_imaging_tool(tool_key)
"""

from typing import Dict, Any
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType

IMAGING_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "ohif": ToolConfig(
        id="L5-OHIF",
        name="OHIF Viewer",
        slug="ohif-viewer",
        description="Open Health Imaging Foundation DICOM viewer",
        category="imaging",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        auth_type=AuthType.NONE,
        rate_limit=50,
        cost_per_call=0.002,
        tags=["medical_imaging", "dicom", "viewer", "web"],
        vendor="Open Source",
        license="MIT",
        documentation_url="https://docs.ohif.org/",
    ),
    
    "slicer_3d": ToolConfig(
        id="L5-3DSLICER",
        name="3D Slicer",
        slug="3d-slicer",
        description="Medical image computing platform for visualization and analysis",
        category="imaging",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.NONE,
        rate_limit=10,
        cost_per_call=0.005,
        tags=["medical_imaging", "visualization", "analysis", "segmentation"],
        vendor="Open Source",
        license="BSD",
        documentation_url="https://slicer.org/",
    ),
}


class ImagingL5Tool(L5BaseTool):
    """L5 Tool class for Medical Imaging."""
    
    def __init__(self, tool_key: str):
        if tool_key not in IMAGING_TOOL_CONFIGS:
            raise ValueError(f"Unknown imaging tool: {tool_key}")
        super().__init__(IMAGING_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_ohif(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query OHIF Viewer API."""
        operation = params.get("operation", "info")
        study_uid = params.get("study_uid")
        
        return {
            "status": "requires_dicom_server",
            "message": "OHIF requires connection to DICOM server (Orthanc, DCM4CHEE)",
            "supported_modalities": ["CT", "MR", "US", "XR", "MG", "PT", "NM"],
            "features": [
                "Multi-planar reconstruction (MPR)",
                "3D volume rendering",
                "Measurements and annotations",
                "DICOM SR support",
                "Hanging protocols",
            ],
        }
    
    async def _execute_slicer_3d(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Run 3D Slicer operations."""
        operation = params.get("operation", "info")
        
        return {
            "status": "requires_local",
            "message": "3D Slicer requires local installation",
            "python_api": "slicer.util, slicer.modules",
            "common_modules": [
                "Segmentations",
                "Volume Rendering",
                "DICOM",
                "Models",
                "Transforms",
                "Markups",
            ],
            "extensions": [
                "SlicerRT (radiation therapy)",
                "SlicerIGT (image-guided therapy)",
                "SlicerDMRI (diffusion MRI)",
                "SlicerMorph (morphometrics)",
            ],
        }


def create_imaging_tool(tool_key: str) -> ImagingL5Tool:
    return ImagingL5Tool(tool_key)

IMAGING_TOOL_KEYS = list(IMAGING_TOOL_CONFIGS.keys())
