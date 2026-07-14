import json
import logging
from typing import TYPE_CHECKING

import boto3
from botocore.client import Config as BotoConfig
from botocore.exceptions import ClientError

from src.core.config import get_config

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

logger = logging.getLogger(__name__)


def _public_read_policy(bucket: str) -> str:
    return json.dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket}/*"],
                }
            ],
        }
    )


class _Storage:
    def __init__(self) -> None:
        self._client: "S3Client | None" = None

    def init(self) -> None:
        if self._client is not None:
            return

        config = get_config()
        self._client = boto3.client(
            "s3",
            endpoint_url=config.APPLICATIONS_STORAGE_ENDPOINT_URL,
            aws_access_key_id=config.APPLICATIONS_STORAGE_ACCESS_KEY,
            aws_secret_access_key=config.APPLICATIONS_STORAGE_SECRET_KEY,
            config=BotoConfig(signature_version="s3v4", s3={"addressing_style": "path"}),
            region_name="us-east-1",  # MinIO ignora, boto3 exige algum valor
        )

    @property
    def client(self) -> "S3Client":
        if self._client is None:
            raise RuntimeError("Storage client not initialized.")
        return self._client

    def ensure_bucket(self, bucket: str) -> None:
        try:
            self.client.head_bucket(Bucket=bucket)
            logger.info("Bucket '%s' já existe.", bucket)
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "")
            if code not in ("404", "NoSuchBucket"):
                raise
            self.client.create_bucket(Bucket=bucket)
            logger.info("Bucket '%s' criado.", bucket)

        # Reaplicado sempre: idempotente, e reafirma a policy se algo a tiver resetado.
        self.client.put_bucket_policy(Bucket=bucket, Policy=_public_read_policy(bucket))

    def put_object(self, bucket: str, key: str, data: bytes, content_type: str) -> None:
        self.client.put_object(Bucket=bucket, Key=key, Body=data, ContentType=content_type)

    def delete_object(self, bucket: str, key: str) -> None:
        self.client.delete_object(Bucket=bucket, Key=key)


storage = _Storage()
