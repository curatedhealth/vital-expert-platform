from setuptools import setup, find_namespace_packages

setup(
    name="vital-shared-kernel",
    version="0.1.0",
    description="Shared multi-tenant kernel for VITAL platform",
    author="VITAL Platform Team",
    packages=find_namespace_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "pydantic>=2.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "pytest-asyncio>=0.21.0",
        ]
    },
    python_requires=">=3.9",
)

