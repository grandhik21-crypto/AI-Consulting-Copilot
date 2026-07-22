import uuid

import pandas as pd

_store: dict[str, pd.DataFrame] = {}


def store_dataframe(df: pd.DataFrame) -> str:
    sheet_id = uuid.uuid4().hex
    _store[sheet_id] = df
    return sheet_id


def get_dataframe(sheet_id: str) -> pd.DataFrame | None:
    return _store.get(sheet_id)


def remove_dataframe(sheet_id: str) -> None:
    _store.pop(sheet_id, None)
