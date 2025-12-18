"""
VITAL Path AI Services - VITAL L5 Data Quality Tools

Data Quality & ETL: Great Expectations, Apache Airflow, Pandas Profiling
3 tools for data validation, ETL orchestration, and profiling.

Naming Convention:
- Class: DataQualityL5Tool
- Factory: create_data_quality_tool(tool_key)
"""

import os
from typing import Dict, Any
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType

DATA_QUALITY_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "great_expectations": ToolConfig(
        id="L5-GREATEXP",
        name="Great Expectations",
        slug="great-expectations",
        description="Data validation and documentation framework",
        category="data_quality",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.001,
        tags=["data_quality", "validation", "python", "testing"],
        vendor="Open Source",
        license="Apache-2.0",
        documentation_url="https://greatexpectations.io/",
    ),
    
    "airflow": ToolConfig(
        id="L5-AIRFLOW",
        name="Apache Airflow",
        slug="apache-airflow",
        description="Workflow orchestration and ETL scheduling",
        category="data_quality",
        tier=1,
        priority="high",
        adapter_type=AdapterType.REST_API,
        base_url=os.getenv("AIRFLOW_URL"),
        auth_type=AuthType.BASIC,
        auth_env_var="AIRFLOW_AUTH",
        rate_limit=50,
        cost_per_call=0.001,
        tags=["etl", "workflow", "orchestration", "scheduling"],
        vendor="Apache",
        license="Apache-2.0",
        documentation_url="https://airflow.apache.org/docs/",
    ),
    
    "pandas_profiling": ToolConfig(
        id="L5-PANDAS",
        name="Pandas Profiling",
        slug="pandas-profiling",
        description="Automated exploratory data analysis reports",
        category="data_quality",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=50,
        cost_per_call=0.002,
        tags=["data_quality", "eda", "python", "profiling"],
        vendor="Open Source",
        license="MIT",
        documentation_url="https://ydata-profiling.ydata.ai/",
    ),
}


class DataQualityL5Tool(L5BaseTool):
    """L5 Tool class for Data Quality & ETL."""
    
    def __init__(self, tool_key: str):
        if tool_key not in DATA_QUALITY_TOOL_CONFIGS:
            raise ValueError(f"Unknown data quality tool: {tool_key}")
        super().__init__(DATA_QUALITY_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_great_expectations(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Run Great Expectations validations."""
        try:
            # GE requires setup
            return {
                "status": "requires_setup",
                "message": "Great Expectations requires data context setup",
                "example_expectations": [
                    "expect_column_values_to_not_be_null",
                    "expect_column_values_to_be_unique",
                    "expect_column_values_to_be_in_set",
                    "expect_column_mean_to_be_between",
                ],
            }
        except ImportError:
            return {"error": "great_expectations not installed"}
    
    async def _execute_airflow(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query Airflow API."""
        import os
        endpoint = params.get("endpoint", "dags")
        
        auth = os.getenv("AIRFLOW_AUTH", "").split(":")
        if len(auth) != 2:
            return {"error": "AIRFLOW_AUTH not configured (format: user:pass)"}
        
        try:
            import base64
            auth_header = base64.b64encode(f"{auth[0]}:{auth[1]}".encode()).decode()
            data = await self._get(
                f"{self.config.base_url}/{endpoint}",
                headers={"Authorization": f"Basic {auth_header}"}
            )
            return {"data": data}
        except Exception as e:
            return {"error": str(e), "message": "Airflow must be running locally"}
    
    async def _execute_pandas_profiling(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate data profile."""
        data = params.get("data", [])
        
        if not data:
            return {
                "status": "requires_data",
                "message": "Provide data as list of dicts",
                "features": [
                    "Type inference",
                    "Missing values",
                    "Descriptive statistics",
                    "Correlations",
                    "Duplicates",
                    "Text analysis",
                ],
            }
        
        try:
            import pandas as pd
            from ydata_profiling import ProfileReport
            
            df = pd.DataFrame(data)
            profile = ProfileReport(df, minimal=True)
            
            return {
                "rows": len(df),
                "columns": len(df.columns),
                "dtypes": df.dtypes.astype(str).to_dict(),
                "missing": df.isnull().sum().to_dict(),
                "stats": df.describe().to_dict(),
            }
        except ImportError:
            return {"error": "ydata-profiling not installed. Run: pip install ydata-profiling"}


def create_data_quality_tool(tool_key: str) -> DataQualityL5Tool:
    return DataQualityL5Tool(tool_key)

DATA_QUALITY_TOOL_KEYS = list(DATA_QUALITY_TOOL_CONFIGS.keys())
