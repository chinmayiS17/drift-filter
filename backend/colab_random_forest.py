# ============================================================
# MODEL 1: RANDOM FOREST  (Colab-ready)
# ============================================================
# Before running, upload these two files to the Colab file panel
# (left sidebar -> folder icon -> upload):
#   - sih_test_input_early.csv   (Part_ID, Lot_ID, Value_0h, Value_24h)
#   - sih_test_answer_key.csv    (Part_ID, Lot_ID, Value_168h, Is_Defect)

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (mean_absolute_error, mean_squared_error, r2_score,
                              accuracy_score, precision_score, recall_score, f1_score,
                              confusion_matrix)

RANDOM_STATE = 42

# ---- Load & merge the two files on Part_ID ----
early = pd.read_csv("sih_test_input_early.csv")
answers = pd.read_csv("sih_test_answer_key.csv")

df = early.merge(answers[["Part_ID", "Value_168h", "Is_Defect"]], on="Part_ID")

# ---- Feature engineering ----
# Raw values alone under-use the signal; the *rate* of early drift is what
# actually distinguishes a healthy part from a part beginning to fail.
df["delta_24_0"] = df["Value_24h"] - df["Value_0h"]      # absolute change 0h->24h
df["rate_24_0"] = df["delta_24_0"] / 24.0                 # drift rate (uA/hour)
FEATURES = ["Value_0h", "Value_24h", "delta_24_0", "rate_24_0"]

X = df[FEATURES]
y_reg = df["Value_168h"]
y_clf = df["Is_Defect"].astype(int)

# Stratified split so both train and test keep the same defect ratio
X_train, X_test, yreg_train, yreg_test, yclf_train, yclf_test = train_test_split(
    X, y_reg, y_clf, test_size=0.3, random_state=RANDOM_STATE, stratify=y_clf
)

# ------------------------------------------------------------
# TASK 1: Regression -- predict Value_168h from early checkpoints
# ------------------------------------------------------------
reg = RandomForestRegressor(
    n_estimators=300,
    max_depth=6,
    min_samples_leaf=2,
    random_state=RANDOM_STATE,
)
reg.fit(X_train, yreg_train)
pred_reg = reg.predict(X_test)

mae = mean_absolute_error(yreg_test, pred_reg)
rmse = np.sqrt(mean_squared_error(yreg_test, pred_reg))
r2 = r2_score(yreg_test, pred_reg)

print("=" * 60)
print("RANDOM FOREST — Drift Prediction (Value_168h)")
print("=" * 60)
print(f"MAE:  {mae:.3f} uA")
print(f"RMSE: {rmse:.3f} uA")
print(f"R2:   {r2:.4f}")

# ------------------------------------------------------------
# TASK 2: Classification -- predict Is_Defect from early checkpoints
# ------------------------------------------------------------
# class_weight="balanced" matters: defects are a small minority of parts,
# and an unweighted model would just predict "healthy" for everyone and
# still look accurate while missing every real defect.
clf = RandomForestClassifier(
    n_estimators=300,
    max_depth=6,
    min_samples_leaf=2,
    random_state=RANDOM_STATE,
    class_weight="balanced",
)
clf.fit(X_train, yclf_train)
pred_clf = clf.predict(X_test)

acc = accuracy_score(yclf_test, pred_clf)
prec = precision_score(yclf_test, pred_clf, zero_division=0)
rec = recall_score(yclf_test, pred_clf, zero_division=0)
f1 = f1_score(yclf_test, pred_clf, zero_division=0)
tn, fp, fn, tp = confusion_matrix(yclf_test, pred_clf).ravel()

print()
print("=" * 60)
print("RANDOM FOREST — Defect Classification (Is_Defect)")
print("=" * 60)
print(f"Accuracy:        {acc:.4f}")
print(f"Precision:       {prec:.4f}")
print(f"Recall:          {rec:.4f}   <-- priority metric (a miss is catastrophic)")
print(f"F1:              {f1:.4f}")
print(f"Confusion matrix: TP={tp}  FN={fn}  FP={fp}  TN={tn}")

# ------------------------------------------------------------
# Explainability: which features actually drove the decision
# ------------------------------------------------------------
print()
print("Feature importances (regression):    ",
      dict(zip(FEATURES, np.round(reg.feature_importances_, 3))))
print("Feature importances (classification):",
      dict(zip(FEATURES, np.round(clf.feature_importances_, 3))))
      
import joblib

joblib.dump(reg, "regression_model.pkl")
joblib.dump(clf, "classification_model.pkl")

print("Models saved successfully!")