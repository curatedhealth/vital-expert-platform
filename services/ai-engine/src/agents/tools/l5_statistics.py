"""
VITAL Path AI Services - VITAL L5 Statistics Tools

Statistics tools: R, SPSS, Calculator Suite
3 tools for statistical analysis and calculations.

Naming Convention:
- Class: StatisticsL5Tool
- Factory: create_statistics_tool(tool_key)
"""

from typing import Dict, Any, List
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


STATISTICS_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "r_stats": ToolConfig(
        id="L5-R",
        name="R Statistical Software",
        slug="r-statistical-software",
        description="R environment for statistical computing and graphics",
        category="statistics",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.R_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=20,
        timeout=300,
        cost_per_call=0.005,
        cache_ttl=0,
        tags=["statistics", "r", "clinical_trials", "biostatistics"],
        vendor="R Foundation",
        license="GPL-2+",
        documentation_url="https://www.r-project.org/",
    ),
    
    "spss": ToolConfig(
        id="L5-SPSS",
        name="IBM SPSS Statistics",
        slug="ibm-spss-statistics",
        description="Statistical analysis software for social and health sciences",
        category="statistics",
        tier=2,
        priority="high",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.LICENSE_KEY,
        rate_limit=10,
        cost_per_call=0.01,
        cache_ttl=0,
        tags=["statistics", "pro_validation", "psychometric", "survey"],
        vendor="IBM",
        license="Commercial",
        documentation_url="https://www.ibm.com/spss",
    ),
    
    "calculator": ToolConfig(
        id="L5-CALC",
        name="Calculator Suite",
        slug="calculator",
        description="Built-in statistical and medical calculations",
        category="statistics",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.NONE,
        rate_limit=1000,
        cost_per_call=0.0001,
        cache_ttl=3600,
        tags=["statistics", "calculations", "dose", "sample_size", "power"],
        vendor="Internal",
        license="Proprietary",
    ),
}


class StatisticsL5Tool(L5BaseTool):
    """L5 Tool class for Statistics sources."""
    
    def __init__(self, tool_key: str):
        if tool_key not in STATISTICS_TOOL_CONFIGS:
            raise ValueError(f"Unknown statistics tool: {tool_key}")
        super().__init__(STATISTICS_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_r_stats(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute R code or functions."""
        operation = params.get("operation", "info")
        code = params.get("code", "")
        
        return {
            "status": "requires_r_bridge",
            "message": "R execution requires R runtime and rpy2 bridge",
            "operation": operation,
            "common_packages": [
                "survival", "ggplot2", "dplyr", "tidyr",
                "lme4", "meta", "netmeta", "survminer",
            ],
        }
    
    async def _execute_spss(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute SPSS syntax."""
        syntax = params.get("syntax", "")
        
        return {
            "status": "requires_local",
            "message": "SPSS requires local installation and license",
            "syntax": syntax,
        }
    
    async def _execute_calculator(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Built-in statistical calculations."""
        calculation = params.get("calculation", "")
        
        import math
        
        calculations = {
            "sample_size_proportion": self._calc_sample_size_proportion,
            "sample_size_means": self._calc_sample_size_means,
            "power_analysis": self._calc_power,
            "confidence_interval": self._calc_ci,
            "relative_risk": self._calc_rr,
            "odds_ratio": self._calc_or,
            "nnt": self._calc_nnt,
            "bmi": self._calc_bmi,
            "bsa": self._calc_bsa,
            "creatinine_clearance": self._calc_crcl,
            "gfr": self._calc_gfr,
        }
        
        calc_func = calculations.get(calculation)
        if calc_func:
            return calc_func(params)
        
        return {
            "available_calculations": list(calculations.keys()),
            "error": f"Unknown calculation: {calculation}",
        }
    
    def _calc_sample_size_proportion(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Sample size for comparing two proportions."""
        import math
        
        p1 = params.get("p1", 0.5)  # Control proportion
        p2 = params.get("p2", 0.3)  # Treatment proportion
        alpha = params.get("alpha", 0.05)
        power = params.get("power", 0.8)
        
        # Z values
        z_alpha = 1.96 if alpha == 0.05 else 2.576 if alpha == 0.01 else 1.645
        z_beta = 0.84 if power == 0.8 else 1.28 if power == 0.9 else 1.645
        
        p_bar = (p1 + p2) / 2
        effect = abs(p1 - p2)
        
        n = ((z_alpha * math.sqrt(2 * p_bar * (1 - p_bar)) + 
              z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) / effect) ** 2
        
        return {
            "calculation": "sample_size_proportion",
            "n_per_group": math.ceil(n),
            "total_n": math.ceil(n) * 2,
            "inputs": {"p1": p1, "p2": p2, "alpha": alpha, "power": power},
        }
    
    def _calc_sample_size_means(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Sample size for comparing two means."""
        import math
        
        delta = params.get("delta", 0.5)  # Effect size
        sd = params.get("sd", 1.0)  # Standard deviation
        alpha = params.get("alpha", 0.05)
        power = params.get("power", 0.8)
        
        z_alpha = 1.96 if alpha == 0.05 else 2.576
        z_beta = 0.84 if power == 0.8 else 1.28
        
        n = 2 * ((z_alpha + z_beta) * sd / delta) ** 2
        
        return {
            "calculation": "sample_size_means",
            "n_per_group": math.ceil(n),
            "total_n": math.ceil(n) * 2,
            "inputs": {"delta": delta, "sd": sd, "alpha": alpha, "power": power},
        }
    
    def _calc_power(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate statistical power."""
        n = params.get("n", 100)
        effect_size = params.get("effect_size", 0.5)
        alpha = params.get("alpha", 0.05)
        
        # Simplified power calculation
        import math
        z_alpha = 1.96 if alpha == 0.05 else 2.576
        z = effect_size * math.sqrt(n / 2) - z_alpha
        
        # Approximate normal CDF
        power = 0.5 * (1 + math.erf(z / math.sqrt(2)))
        
        return {
            "calculation": "power_analysis",
            "power": round(power, 3),
            "inputs": {"n": n, "effect_size": effect_size, "alpha": alpha},
        }
    
    def _calc_ci(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate confidence interval."""
        import math
        
        mean = params.get("mean", 0)
        sd = params.get("sd", 1)
        n = params.get("n", 30)
        confidence = params.get("confidence", 0.95)
        
        z = 1.96 if confidence == 0.95 else 2.576 if confidence == 0.99 else 1.645
        se = sd / math.sqrt(n)
        margin = z * se
        
        return {
            "calculation": "confidence_interval",
            "lower": round(mean - margin, 4),
            "upper": round(mean + margin, 4),
            "margin_of_error": round(margin, 4),
            "inputs": {"mean": mean, "sd": sd, "n": n, "confidence": confidence},
        }
    
    def _calc_rr(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate relative risk."""
        import math
        
        a = params.get("a", 10)  # Exposed with outcome
        b = params.get("b", 90)  # Exposed without outcome
        c = params.get("c", 5)   # Unexposed with outcome
        d = params.get("d", 95)  # Unexposed without outcome
        
        risk_exposed = a / (a + b)
        risk_unexposed = c / (c + d)
        rr = risk_exposed / risk_unexposed
        
        # 95% CI
        se = math.sqrt(1/a - 1/(a+b) + 1/c - 1/(c+d))
        ci_lower = math.exp(math.log(rr) - 1.96 * se)
        ci_upper = math.exp(math.log(rr) + 1.96 * se)
        
        return {
            "calculation": "relative_risk",
            "rr": round(rr, 3),
            "ci_95": [round(ci_lower, 3), round(ci_upper, 3)],
            "risk_exposed": round(risk_exposed, 4),
            "risk_unexposed": round(risk_unexposed, 4),
        }
    
    def _calc_or(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate odds ratio."""
        import math
        
        a = params.get("a", 10)
        b = params.get("b", 90)
        c = params.get("c", 5)
        d = params.get("d", 95)
        
        odds_ratio = (a * d) / (b * c)
        se = math.sqrt(1/a + 1/b + 1/c + 1/d)
        ci_lower = math.exp(math.log(odds_ratio) - 1.96 * se)
        ci_upper = math.exp(math.log(odds_ratio) + 1.96 * se)
        
        return {
            "calculation": "odds_ratio",
            "or": round(odds_ratio, 3),
            "ci_95": [round(ci_lower, 3), round(ci_upper, 3)],
        }
    
    def _calc_nnt(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate number needed to treat."""
        import math
        
        cer = params.get("cer", 0.2)  # Control event rate
        eer = params.get("eer", 0.1)  # Experimental event rate
        
        arr = cer - eer  # Absolute risk reduction
        nnt = 1 / arr if arr != 0 else float('inf')
        
        return {
            "calculation": "nnt",
            "nnt": round(nnt, 1),
            "arr": round(arr, 4),
            "rrr": round((cer - eer) / cer, 4) if cer != 0 else None,
        }
    
    def _calc_bmi(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate BMI."""
        weight_kg = params.get("weight_kg", 70)
        height_m = params.get("height_m", 1.75)
        
        bmi = weight_kg / (height_m ** 2)
        
        category = (
            "Underweight" if bmi < 18.5 else
            "Normal" if bmi < 25 else
            "Overweight" if bmi < 30 else
            "Obese"
        )
        
        return {
            "calculation": "bmi",
            "bmi": round(bmi, 1),
            "category": category,
        }
    
    def _calc_bsa(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate body surface area (Mosteller)."""
        import math
        
        weight_kg = params.get("weight_kg", 70)
        height_cm = params.get("height_cm", 175)
        
        bsa = math.sqrt((height_cm * weight_kg) / 3600)
        
        return {
            "calculation": "bsa",
            "bsa_m2": round(bsa, 2),
            "formula": "Mosteller",
        }
    
    def _calc_crcl(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate creatinine clearance (Cockcroft-Gault)."""
        age = params.get("age", 50)
        weight_kg = params.get("weight_kg", 70)
        scr = params.get("serum_creatinine", 1.0)
        is_female = params.get("is_female", False)
        
        crcl = ((140 - age) * weight_kg) / (72 * scr)
        if is_female:
            crcl *= 0.85
        
        return {
            "calculation": "creatinine_clearance",
            "crcl_ml_min": round(crcl, 1),
            "formula": "Cockcroft-Gault",
        }
    
    def _calc_gfr(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate eGFR (CKD-EPI 2021)."""
        scr = params.get("serum_creatinine", 1.0)
        age = params.get("age", 50)
        is_female = params.get("is_female", False)
        
        # CKD-EPI 2021 (race-free)
        if is_female:
            if scr <= 0.7:
                gfr = 142 * (scr / 0.7) ** -0.241 * 0.9938 ** age * 1.012
            else:
                gfr = 142 * (scr / 0.7) ** -1.200 * 0.9938 ** age * 1.012
        else:
            if scr <= 0.9:
                gfr = 142 * (scr / 0.9) ** -0.302 * 0.9938 ** age
            else:
                gfr = 142 * (scr / 0.9) ** -1.200 * 0.9938 ** age
        
        stage = (
            "G1" if gfr >= 90 else
            "G2" if gfr >= 60 else
            "G3a" if gfr >= 45 else
            "G3b" if gfr >= 30 else
            "G4" if gfr >= 15 else
            "G5"
        )
        
        return {
            "calculation": "gfr",
            "egfr_ml_min_173m2": round(gfr, 1),
            "ckd_stage": stage,
            "formula": "CKD-EPI 2021",
        }


def create_statistics_tool(tool_key: str) -> StatisticsL5Tool:
    return StatisticsL5Tool(tool_key)

STATISTICS_TOOL_KEYS = list(STATISTICS_TOOL_CONFIGS.keys())
