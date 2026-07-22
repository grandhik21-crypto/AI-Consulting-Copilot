import os
import uuid
from pathlib import Path

os.environ["MPLCONFIGDIR"] = str(
    Path(__file__).resolve().parent.parent.parent / "uploads" / ".matplotlib-cache"
)

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

CHART_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "charts"
CHART_DIR.mkdir(parents=True, exist_ok=True)


def generate_chart(
    df: pd.DataFrame,
    chart_type: str,
    x_column: str,
    y_column: str | None = None,
) -> str:
    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor("#09090b")
    ax.set_facecolor("#09090b")
    ax.tick_params(colors="#a1a1aa")
    ax.spines["bottom"].set_color("#27272a")
    ax.spines["left"].set_color("#27272a")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    if chart_type == "histogram":
        ax.hist(df[x_column].dropna(), bins=20, color="#6366f1", edgecolor="#09090b")
        ax.set_xlabel(x_column, color="#a1a1aa")
        ax.set_ylabel("Frequency", color="#a1a1aa")
        ax.set_title(f"Histogram of {x_column}", color="#e4e4e7")

    elif chart_type == "pie":
        data = df[x_column].value_counts()
        colors = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe"]
        wedges, texts, autotexts = ax.pie(
            data,
            labels=data.index,
            autopct="%1.1f%%",
            colors=colors[: len(data)],
            textprops={"color": "#e4e4e7", "fontsize": 9},
            pctdistance=0.75,
        )
        for at in autotexts:
            at.set_color("#09090b")
        ax.set_title(f"Distribution of {x_column}", color="#e4e4e7")

    elif chart_type == "line":
        if y_column:
            grouped = df.groupby(x_column)[y_column].sum().sort_index()
        else:
            grouped = df.groupby(x_column).size().sort_index()
        ax.plot(
            grouped.index.astype(str),
            grouped.values,
            color="#6366f1",
            linewidth=2,
            marker="o",
            markersize=4,
        )
        ax.set_xlabel(x_column, color="#a1a1aa")
        ax.set_ylabel(y_column or "Count", color="#a1a1aa")
        ax.set_title(f"{y_column or 'Count'} by {x_column}", color="#e4e4e7")
        plt.xticks(rotation=45, ha="right")

    else:
        if y_column:
            data = df.groupby(x_column)[y_column].sum().sort_values(ascending=False)
        else:
            data = df[x_column].value_counts()
        bars = ax.bar(data.index.astype(str), data.values, color="#6366f1")
        ax.set_xlabel(x_column, color="#a1a1aa")
        ax.set_ylabel(y_column or "Count", color="#a1a1aa")
        ax.set_title(
            f"{y_column or 'Count'} by {x_column}" if y_column else f"Value counts of {x_column}",
            color="#e4e4e7",
        )
        plt.xticks(rotation=45, ha="right")

    plt.tight_layout()

    filename = f"chart_{uuid.uuid4().hex}.png"
    path = CHART_DIR / filename
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)

    return filename
