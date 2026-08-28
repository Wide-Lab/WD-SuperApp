from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class ApplicationORM(Base):
    __tablename__ = "T002_APPLICATIONS"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    description: Mapped[str] = mapped_column(String(160), nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # `delete-orphan` porque ApplicationRepository.delete apaga pelo ORM: sem ele o
    # SQLAlchemy tentaria órfãs com application_id = NULL. `passive_deletes` deixa o
    # CASCADE do banco fazer o trabalho, em vez de carregar cada filho para apagar.
    examples: Mapped[list["ApplicationExampleORM"]] = relationship(
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ApplicationExampleORM.position",
    )


class ApplicationExampleORM(Base):
    __tablename__ = "T003_APPLICATION_EXAMPLES"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    application_id: Mapped[str] = mapped_column(
        ForeignKey("T002_APPLICATIONS.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    label: Mapped[str] = mapped_column(String(40), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    application: Mapped["ApplicationORM"] = relationship(back_populates="examples")
