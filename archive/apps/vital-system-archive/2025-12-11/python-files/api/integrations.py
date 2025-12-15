"""
VITAL Path External Integrations
Healthcare systems integration for EHR, FHIR, and third-party medical APIs
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import json
import logging
import httpx
from abc import ABC, abstractmethod
import xml.etree.ElementTree as ET
from pydantic import BaseModel, Field
import uuid

logger = logging.getLogger(__name__)

class IntegrationType(str, Enum):
    EHR = "ehr"
    FHIR = "fhir"
    DICOM = "dicom"
    HL7 = "hl7"
    MEDICAL_API = "medical_api"
    PHARMACY = "pharmacy"
    LAB = "lab"
    IMAGING = "imaging"

class DataFormat(str, Enum):
    JSON = "json"
    XML = "xml"
    HL7 = "hl7"
    FHIR = "fhir"
    DICOM = "dicom"

class AuthenticationType(str, Enum):
    OAUTH2 = "oauth2"
    API_KEY = "api_key"
    BASIC = "basic"
    CERTIFICATE = "certificate"
    SAML = "saml"

@dataclass
class IntegrationConfig:
    integration_id: str
    name: str
    type: IntegrationType
    endpoint_url: str
    auth_type: AuthenticationType
    credentials: Dict[str, Any]
    data_format: DataFormat
    timeout: int = 30
    retry_attempts: int = 3
    rate_limit_per_minute: int = 60
    active: bool = True
    metadata: Dict[str, Any] = None

@dataclass
class IntegrationRequest:
    request_id: str
    integration_id: str
    operation: str
    parameters: Dict[str, Any]
    patient_id: Optional[str] = None
    timestamp: datetime = None
    priority: str = "medium"
    metadata: Dict[str, Any] = None

@dataclass
class IntegrationResponse:
    request_id: str
    integration_id: str
    status: str
    data: Optional[Any]
    error: Optional[str]
    processing_time: float
    timestamp: datetime
    raw_response: Optional[str] = None
    metadata: Dict[str, Any] = None

class FHIRResource(BaseModel):
    resourceType: str
    id: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    text: Optional[Dict[str, Any]] = None

class Patient(FHIRResource):
    resourceType: str = "Patient"
    identifier: List[Dict[str, Any]] = Field(default_factory=list)
    name: List[Dict[str, Any]] = Field(default_factory=list)
    gender: Optional[str] = None
    birthDate: Optional[str] = None
    address: List[Dict[str, Any]] = Field(default_factory=list)
    telecom: List[Dict[str, Any]] = Field(default_factory=list)

class Observation(FHIRResource):
    resourceType: str = "Observation"
    status: str
    code: Dict[str, Any]
    subject: Dict[str, Any]
    valueQuantity: Optional[Dict[str, Any]] = None
    valueString: Optional[str] = None
    effectiveDateTime: Optional[str] = None

class BaseIntegration(ABC):
    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.client = httpx.AsyncClient(timeout=config.timeout)
        self.last_request_time = 0
        self.request_count = 0

    @abstractmethod
    async def authenticate(self) -> bool:
        """Authenticate with the external system"""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test connection to the external system"""
        pass

    @abstractmethod
    async def execute_request(self, request: IntegrationRequest) -> IntegrationResponse:
        """Execute a request to the external system"""
        pass

    async def _rate_limit_check(self):
        """Check and enforce rate limiting"""
        current_time = datetime.now().timestamp()
        if current_time - self.last_request_time < 60:
            if self.request_count >= self.config.rate_limit_per_minute:
                wait_time = 60 - (current_time - self.last_request_time)
                await asyncio.sleep(wait_time)
                self.request_count = 0
                self.last_request_time = current_time
        else:
            self.request_count = 0
            self.last_request_time = current_time

        self.request_count += 1

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

class FHIRIntegration(BaseIntegration):
    def __init__(self, config: IntegrationConfig):
        super().__init__(config)
        self.auth_token = None

    async def authenticate(self) -> bool:
        try:
            if self.config.auth_type == AuthenticationType.OAUTH2:
                auth_data = {
                    "grant_type": "client_credentials",
                    "client_id": self.config.credentials["client_id"],
                    "client_secret": self.config.credentials["client_secret"],
                    "scope": self.config.credentials.get("scope", "read")
                }

                response = await self.client.post(
                    f"{self.config.endpoint_url}/auth/token",
                    data=auth_data
                )
                response.raise_for_status()

                token_data = response.json()
                self.auth_token = token_data["access_token"]
                return True

            elif self.config.auth_type == AuthenticationType.API_KEY:
                self.auth_token = self.config.credentials["api_key"]
                return True

            return False

        except Exception as e:
            logger.error(f"FHIR authentication failed: {e}")
            return False

    async def test_connection(self) -> bool:
        try:
            headers = self._get_auth_headers()
            response = await self.client.get(
                f"{self.config.endpoint_url}/metadata",
                headers=headers
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"FHIR connection test failed: {e}")
            return False

    async def execute_request(self, request: IntegrationRequest) -> IntegrationResponse:
        start_time = datetime.now()
        await self._rate_limit_check()

        try:
            headers = self._get_auth_headers()
            url = f"{self.config.endpoint_url}/{request.operation}"

            if request.operation == "Patient":
                response = await self._get_patient(request.parameters.get("patient_id"), headers)
            elif request.operation == "Observation":
                response = await self._get_observations(request.parameters, headers)
            elif request.operation == "search":
                response = await self._search_resources(request.parameters, headers)
            else:
                response = await self.client.get(url, headers=headers, params=request.parameters)

            response.raise_for_status()
            data = response.json()

            return IntegrationResponse(
                request_id=request.request_id,
                integration_id=self.config.integration_id,
                status="success",
                data=data,
                error=None,
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now(),
                raw_response=response.text,
                metadata={"status_code": response.status_code}
            )

        except Exception as e:
            logger.error(f"FHIR request failed: {e}")
            return IntegrationResponse(
                request_id=request.request_id,
                integration_id=self.config.integration_id,
                status="error",
                data=None,
                error=str(e),
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now()
            )

    def _get_auth_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/fhir+json"}

        if self.config.auth_type == AuthenticationType.OAUTH2:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        elif self.config.auth_type == AuthenticationType.API_KEY:
            headers["X-API-Key"] = self.auth_token

        return headers

    async def _get_patient(self, patient_id: str, headers: Dict[str, str]):
        return await self.client.get(
            f"{self.config.endpoint_url}/Patient/{patient_id}",
            headers=headers
        )

    async def _get_observations(self, params: Dict[str, Any], headers: Dict[str, str]):
        return await self.client.get(
            f"{self.config.endpoint_url}/Observation",
            headers=headers,
            params=params
        )

    async def _search_resources(self, params: Dict[str, Any], headers: Dict[str, str]):
        resource_type = params.pop("resourceType", "Patient")
        return await self.client.get(
            f"{self.config.endpoint_url}/{resource_type}",
            headers=headers,
            params=params
        )

class HL7Integration(BaseIntegration):
    def __init__(self, config: IntegrationConfig):
        super().__init__(config)

    async def authenticate(self) -> bool:
        # HL7 typically uses connection-based authentication
        return await self.test_connection()

    async def test_connection(self) -> bool:
        try:
            # Send a basic HL7 test message
            test_message = self._create_ack_message()
            response = await self.client.post(
                self.config.endpoint_url,
                content=test_message,
                headers={"Content-Type": "application/hl7-v2+er7"}
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"HL7 connection test failed: {e}")
            return False

    async def execute_request(self, request: IntegrationRequest) -> IntegrationResponse:
        start_time = datetime.now()
        await self._rate_limit_check()

        try:
            if request.operation == "send_adt":
                message = self._create_adt_message(request.parameters)
            elif request.operation == "send_orm":
                message = self._create_orm_message(request.parameters)
            elif request.operation == "send_oru":
                message = self._create_oru_message(request.parameters)
            else:
                raise ValueError(f"Unsupported HL7 operation: {request.operation}")

            response = await self.client.post(
                self.config.endpoint_url,
                content=message,
                headers={"Content-Type": "application/hl7-v2+er7"}
            )

            response.raise_for_status()

            return IntegrationResponse(
                request_id=request.request_id,
                integration_id=self.config.integration_id,
                status="success",
                data={"ack_received": True, "response": response.text},
                error=None,
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now(),
                raw_response=response.text
            )

        except Exception as e:
            logger.error(f"HL7 request failed: {e}")
            return IntegrationResponse(
                request_id=request.request_id,
                integration_id=self.config.integration_id,
                status="error",
                data=None,
                error=str(e),
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now()
            )

    def _create_ack_message(self) -> str:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"MSH|^~\\&|VITAL_PATH|SYSTEM|RECEIVER|SYSTEM|{timestamp}||ACK|{uuid.uuid4()}|P|2.5\r"

    def _create_adt_message(self, params: Dict[str, Any]) -> str:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        patient_id = params.get("patient_id", "UNKNOWN")

        msh = f"MSH|^~\\&|VITAL_PATH|SYSTEM|RECEIVER|SYSTEM|{timestamp}||ADT^A08|{uuid.uuid4()}|P|2.5"
        evn = f"EVN||{timestamp}|||"
        pid = f"PID|1||{patient_id}^^^MRN||{params.get('last_name', '')}^{params.get('first_name', '')}||{params.get('dob', '')}|{params.get('gender', '')}"

        return f"{msh}\r{evn}\r{pid}\r"

    def _create_orm_message(self, params: Dict[str, Any]) -> str:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        order_id = params.get("order_id", str(uuid.uuid4()))

        msh = f"MSH|^~\\&|VITAL_PATH|SYSTEM|RECEIVER|SYSTEM|{timestamp}||ORM^O01|{uuid.uuid4()}|P|2.5"
        pid = f"PID|1||{params.get('patient_id', '')}^^^MRN"
        orc = f"ORC|NW|{order_id}|{order_id}|"
        obr = f"OBR|1|{order_id}|{order_id}|{params.get('procedure_code', '')}^{params.get('procedure_name', '')}"

        return f"{msh}\r{pid}\r{orc}\r{obr}\r"

    def _create_oru_message(self, params: Dict[str, Any]) -> str:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

        msh = f"MSH|^~\\&|VITAL_PATH|SYSTEM|RECEIVER|SYSTEM|{timestamp}||ORU^R01|{uuid.uuid4()}|P|2.5"
        pid = f"PID|1||{params.get('patient_id', '')}^^^MRN"
        obr = f"OBR|1|||{params.get('test_code', '')}^{params.get('test_name', '')}"
        obx = f"OBX|1|ST|{params.get('result_code', '')}^{params.get('result_name', '')}||{params.get('result_value', '')}|||N|||F"

        return f"{msh}\r{pid}\r{obr}\r{obx}\r"

class EHRIntegration(BaseIntegration):
    def __init__(self, config: IntegrationConfig):
        super().__init__(config)
        self.session_token = None

    async def authenticate(self) -> bool:
        try:
            auth_data = {
                "username": self.config.credentials["username"],
                "password": self.config.credentials["password"],
                "client_id": self.config.credentials.get("client_id", "vital_path")
            }

            response = await self.client.post(
                f"{self.config.endpoint_url}/api/auth/login",
                json=auth_data
            )
            response.raise_for_status()

            auth_response = response.json()
            self.session_token = auth_response.get("token")
            return self.session_token is not None

        except Exception as e:
            logger.error(f"EHR authentication failed: {e}")
            return False

    async def test_connection(self) -> bool:
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = await self.client.get(
                f"{self.config.endpoint_url}/api/system/status",
                headers=headers
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"EHR connection test failed: {e}")
            return False

    async def execute_request(self, request: IntegrationRequest) -> IntegrationResponse:
        start_time = datetime.now()
        await self._rate_limit_check()

        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}

            if request.operation == "get_patient":
                url = f"{self.config.endpoint_url}/api/patients/{request.parameters['patient_id']}"
                response = await self.client.get(url, headers=headers)
            elif request.operation == "get_medical_history":
                url = f"{self.config.endpoint_url}/api/patients/{request.parameters['patient_id']}/history"
                response = await self.client.get(url, headers=headers, params=request.parameters)
            elif request.operation == "create_encounter":
                url = f"{self.config.endpoint_url}/api/encounters"
                response = await self.client.post(url, headers=headers, json=request.parameters)
            else:
                raise ValueError(f"Unsupported EHR operation: {request.operation}")

            response.raise_for_status()
            data = response.json()

            return IntegrationResponse(
                request_id=request.request_id,
                integration_id=self.config.integration_id,
                status="success",
                data=data,
                error=None,
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now(),
                raw_response=response.text
            )

        except Exception as e:
            logger.error(f"EHR request failed: {e}")
            return IntegrationResponse(
                request_id=request.request_id,
                integration_id=self.config.integration_id,
                status="error",
                data=None,
                error=str(e),
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now()
            )

class IntegrationManager:
    def __init__(self):
        self.integrations: Dict[str, BaseIntegration] = {}
        self.configs: Dict[str, IntegrationConfig] = {}

    async def add_integration(self, config: IntegrationConfig) -> bool:
        try:
            if config.type == IntegrationType.FHIR:
                integration = FHIRIntegration(config)
            elif config.type == IntegrationType.HL7:
                integration = HL7Integration(config)
            elif config.type == IntegrationType.EHR:
                integration = EHRIntegration(config)
            else:
                logger.error(f"Unsupported integration type: {config.type}")
                return False

            # Test authentication and connection
            if await integration.authenticate() and await integration.test_connection():
                self.integrations[config.integration_id] = integration
                self.configs[config.integration_id] = config
                logger.info(f"Integration added successfully: {config.name}")
                return True
            else:
                logger.error(f"Integration setup failed: {config.name}")
                await integration.close()
                return False

        except Exception as e:
            logger.error(f"Error adding integration {config.name}: {e}")
            return False

    async def execute_integration_request(self, request: IntegrationRequest) -> IntegrationResponse:
        if request.integration_id not in self.integrations:
            return IntegrationResponse(
                request_id=request.request_id,
                integration_id=request.integration_id,
                status="error",
                data=None,
                error="Integration not found",
                processing_time=0,
                timestamp=datetime.now()
            )

        integration = self.integrations[request.integration_id]
        return await integration.execute_request(request)

    async def get_integration_status(self, integration_id: str) -> Dict[str, Any]:
        if integration_id not in self.integrations:
            return {"status": "not_found"}

        integration = self.integrations[integration_id]
        config = self.configs[integration_id]

        try:
            is_connected = await integration.test_connection()
            return {
                "status": "connected" if is_connected else "disconnected",
                "name": config.name,
                "type": config.type,
                "last_checked": datetime.now(),
                "active": config.active
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "last_checked": datetime.now()
            }

    async def list_integrations(self) -> List[Dict[str, Any]]:
        return [
            {
                "integration_id": config.integration_id,
                "name": config.name,
                "type": config.type,
                "active": config.active,
                "endpoint": config.endpoint_url
            }
            for config in self.configs.values()
        ]

    async def close_all_integrations(self):
        for integration in self.integrations.values():
            await integration.close()
        self.integrations.clear()
        self.configs.clear()

# Global integration manager instance
integration_manager = IntegrationManager()