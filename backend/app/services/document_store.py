import uuid

_documents: dict[str, str] = {}


def store_document(text: str) -> str:
    doc_id = uuid.uuid4().hex
    _documents[doc_id] = text
    return doc_id


def get_document(doc_id: str) -> str | None:
    return _documents.get(doc_id)


def remove_document(doc_id: str) -> None:
    _documents.pop(doc_id, None)
