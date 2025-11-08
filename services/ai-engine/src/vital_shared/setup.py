"""
Setup configuration for vital-shared package
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="vital-shared",
    version="1.0.0",
    author="VITAL Path Team",
    author_email="team@vitalpath.ai",
    description="Shared libraries for VITAL AI services",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/vitalpath/vital-shared",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.11",
    install_requires=[
        "pydantic>=2.0.0",
        "langchain>=0.1.0",
        "langchain-openai>=0.1.0",
        "langchain-core>=0.1.0",
        "langgraph>=0.1.0",
        "supabase>=2.0.0",
        "pinecone-client>=3.0.0",
        "structlog>=24.0.0",
        "prometheus-client>=0.19.0",
        "openai>=1.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
            "pytest-mock>=3.12.0",
            "black>=23.0.0",
            "ruff>=0.1.0",
            "mypy>=1.0.0",
            "types-requests",
        ],
        "test": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
            "pytest-mock>=3.12.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "vital-shared=vital_shared.cli:main",
        ],
    },
)

