from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import pandas as pd
import os

from module_a import calculate_module_a_risk


# =====================================================
# PATHS
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.dirname(BASE_DIR)


# =====================================================
# FLASK APP
# =====================================================

app = Flask(__name__)
CORS(app)


# =====================================================
# LOAD TRAINED MODELS
# =====================================================

reg = joblib.load(
    os.path.join(BASE_DIR, "regression_model.pkl")
)

clf = joblib.load(
    os.path.join(BASE_DIR, "classification_model.pkl")
)


# =====================================================
# FRONTEND
# =====================================================

@app.route("/")
def home():

    return send_from_directory(
        FRONTEND_DIR,
        "index.html"
    )


@app.route("/<path:filename>")
def frontend_files(filename):

    return send_from_directory(
        FRONTEND_DIR,
        filename
    )


# =====================================================
# TEST BACKEND
# =====================================================

@app.route("/api/test", methods=["GET"])
def test():

    return jsonify({
        "message": "Drift Filter backend is connected!"
    })


# =====================================================
# MODULE B — DRIFT PREDICTION
# =====================================================

@app.route("/api/predict", methods=["POST"])
def predict():

    data = request.json

    value_0h = float(data["value_0h"])
    value_24h = float(data["value_24h"])

    delta_24_0 = value_24h - value_0h

    rate_24_0 = delta_24_0 / 24.0

    X = pd.DataFrame([{
        "Value_0h": value_0h,
        "Value_24h": value_24h,
        "delta_24_0": delta_24_0,
        "rate_24_0": rate_24_0
    }])

    predicted_168h = reg.predict(X)[0]

    defect_prediction = clf.predict(X)[0]

    defect_risk = clf.predict_proba(X)[0][1]

    return jsonify({

        "predicted_168h": float(predicted_168h),

        "defect_prediction": int(
            defect_prediction
        ),

        "defect_risk": float(
            defect_risk
        )

    })


# =====================================================
# MODULE A — OUTLIER / LOT RISK
# =====================================================

@app.route("/api/module-a", methods=["POST"])
def module_a():

    data = request.json

    lot_values = data["lot_values"]

    component_value = float(
        data["component_value"]
    )

    result = calculate_module_a_risk(
        lot_values,
        component_value
    )

    return jsonify(result)


# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":

    app.run(debug=True)