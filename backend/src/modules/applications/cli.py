import argparse
import logging

from src.core.config import get_config
from src.core.logging import setup_logging
from src.core.storage import storage

logger = logging.getLogger(__name__)


def ensure_bucket() -> None:
    config = get_config()
    setup_logging(config.LOG_LEVEL)
    storage.init()
    storage.ensure_bucket(config.APPLICATIONS_BUCKET_NAME)
    logger.info(
        "Bucket '%s' verificado/criado com policy de leitura pública.",
        config.APPLICATIONS_BUCKET_NAME,
    )


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m src.modules.applications.cli")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("ensure-bucket")
    args = parser.parse_args()
    if args.command == "ensure-bucket":
        ensure_bucket()


if __name__ == "__main__":
    main()
