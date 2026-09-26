import numpy as np


def calculate_module_a_risk(lot_values, component_value):
    """
    Calculate Module A anomaly risk using
    median + MAD (Median Absolute Deviation).
    """

    lot_values = np.array(lot_values, dtype=float)

    median = np.median(lot_values)

    mad = np.median(np.abs(lot_values - median))

    # Avoid division by zero
    if mad == 0:
        if component_value == median:
            modified_z = 0
        else:
            modified_z = 10
    else:
        modified_z = (
            0.6745 * (component_value - median) / mad
        )

    # Convert anomaly magnitude into a 0–1 risk score
    risk = min(abs(modified_z) / 6.0, 1.0)

    return {
        "median": float(median),
        "mad": float(mad),
        "modified_z": float(modified_z),
        "risk": float(risk)
    }