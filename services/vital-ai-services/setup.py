from setuptools import setup, find_namespace_packages

setup(
    name="vital-ai-services",
    version="0.1.0",
    description="Shared AI services library for VITAL platform",
    author="VITAL Platform Team",
    packages=find_namespace_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "pydantic>=2.0.0",
        "structlog>=23.0.0",
        "openai>=1.0.0",
        "langchain>=0.1.0",
        "langchain-openai>=0.0.5",
        "langchain-core>=0.1.0",
        "pinecone-client>=3.0.0",
        "supabase>=2.0.0",
        "redis>=5.0.0",
        "numpy>=1.24.0",
        "aiohttp>=3.9.0",
        "tenacity>=8.2.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "ruff>=0.1.0",
            "mypy>=1.0.0",
        ]
    },
    python_requires=">=3.11",
)

