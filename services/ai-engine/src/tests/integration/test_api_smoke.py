"""
ASGI smoke tests for key API endpoints using the http_client fixture.
"""

import pytest


@pytest.mark.asyncio
async def test_health_endpoint(http_client):
    resp = await http_client.get("/health")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_openapi_json(http_client):
    resp = await http_client.get("/openapi.json")
    assert resp.status_code == 200
