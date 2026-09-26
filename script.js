/* =====================================================
   LOGO INTRO → SPLASH SCREEN
===================================================== */

window.addEventListener("load", function () {

    const logoIntro =
        document.getElementById("logo-intro");

    const splash =
        document.getElementById("splash-screen");

    const mainWebsite =
        document.getElementById("main-website");

    if (mainWebsite) {
        mainWebsite.style.opacity = "0";
    }

    setTimeout(function () {

        if (logoIntro) {
            logoIntro.style.opacity = "0";
        }

        setTimeout(function () {

            if (logoIntro) {
                logoIntro.style.display = "none";
            }

            if (splash) {
                splash.style.opacity = "1";
            }

            setTimeout(function () {

                if (splash) {
                    splash.style.opacity = "0";
                }

                if (mainWebsite) {
                    mainWebsite.style.opacity = "1";
                }

                setTimeout(function () {

                    if (splash) {
                        splash.style.display = "none";
                    }

                }, 600);

            }, 1500);

        }, 400);

    }, 1000);

});


/* =====================================================
   PAGE SWITCHING
===================================================== */

function hideAllPages() {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.classList.add("hidden");
    });

}


/* =====================================================
   SHOW MODULE A
===================================================== */

function showModuleA() {

    hideAllPages();

    const moduleAPage =
        document.getElementById("module-a-page");

    if (moduleAPage) {
        moduleAPage.classList.remove("hidden");
    }

}


/* =====================================================
   SHOW MODULE B INPUT
===================================================== */

function showModuleBInput() {

    hideAllPages();

    const moduleBInputPage =
        document.getElementById("module-b-input-page");

    if (moduleBInputPage) {
        moduleBInputPage.classList.remove("hidden");
    }

    /* If CSV component is selected,
       automatically fill Module B values */

    if (window.selectedComponent) {

        const input0h =
            document.getElementById("module-b-0h");

        const input24h =
            document.getElementById("module-b-24h");

        if (input0h) {
            input0h.value =
                window.selectedComponent.value0h;
        }

        if (input24h) {
            input24h.value =
                window.selectedComponent.value24h;
        }

        console.log(
            "Module B using CSV component:",
            window.selectedComponent
        );
    }

}


/* =====================================================
   SHOW MODULE B RESULT
===================================================== */

function showModuleB(predictionResult) {

    hideAllPages();

    const moduleBPage =
        document.getElementById("module-b-page");

    if (moduleBPage) {
        moduleBPage.classList.remove("hidden");
    }

    if (!predictionResult) {
        return;
    }


    /* =========================================
       GET INPUT VALUES
    ========================================= */

    const input0hElement =
        document.getElementById("module-b-0h");

    const input24hElement =
        document.getElementById("module-b-24h");

    const value0h =
        parseFloat(input0hElement.value);

    const value24h =
        parseFloat(input24hElement.value);

    const predicted168h =
        predictionResult.predicted_168h;


    /* =========================================
       CALCULATE DRIFT
    ========================================= */

    const drift =
        predicted168h - value24h;

    const absoluteDrift =
        Math.abs(drift);


    /* =========================================
       CREATE TRAJECTORY
    ========================================= */

    const value96h =
        value24h +
        (predicted168h - value24h) * 0.43;

    window.trajectory = {

        value0h: value0h,

        value24h: value24h,

        value96h: value96h,

        value168h: predicted168h

    };


    /* =========================================
       STORE MODULE B RESULTS
    ========================================= */

    window.moduleBRisk =
        predictionResult.defect_risk;

    window.predicted168h =
        predictionResult.predicted_168h;

    window.moduleBDrift =
        drift;


    /* =========================================
       DISPLAY 168h
    ========================================= */

    const predictedElement =
        document.getElementById("predicted-168h");

    if (predictedElement) {

        predictedElement.textContent =
            predicted168h.toFixed(2) + " µA";

    }


    /* =========================================
       DISPLAY 0h / 24h / 96h
    ========================================= */

    const result0h =
        document.getElementById("module-b-0h-result");

    const result24h =
        document.getElementById("module-b-24h-result");

    const result96h =
        document.getElementById("estimated-96h");

    if (result0h) {

        result0h.textContent =
            value0h.toFixed(2) + " µA";

    }

    if (result24h) {

        result24h.textContent =
            value24h.toFixed(2) + " µA";

    }

    if (result96h) {

        result96h.textContent =
            value96h.toFixed(2) + " µA";

    }


    /* =========================================
       DISPLAY RISK
    ========================================= */

    const riskElement =
        document.getElementById("module-b-risk");

    if (riskElement) {

        riskElement.textContent =
            predictionResult.defect_risk.toFixed(3);

    }


    /* =========================================
       STATUS
    ========================================= */

    const statusBox =
        document.getElementById("module-b-status");

    const statusTitle =
        document.getElementById("module-b-status-title");

    const statusMessage =
        document.getElementById("module-b-status-message");


    if (
        statusBox &&
        statusTitle &&
        statusMessage
    ) {

        if (predictionResult.defect_risk >= 0.8) {

            statusBox.classList.add("warning");

            statusTitle.textContent =
                "⚠ HIGH DEFECT RISK";

            statusMessage.textContent =
                "Predicted trajectory shows a high probability of abnormal behaviour.";

        }

        else if (
            predictionResult.defect_risk >= 0.5 ||
            absoluteDrift >= 5
        ) {

            statusBox.classList.add("warning");

            statusTitle.textContent =
                "⚠ ABNORMAL DRIFT DETECTED";

            statusMessage.textContent =
                "Predicted trajectory shows significant deviation from the 24h measurement.";

        }

        else {

            statusBox.classList.remove("warning");

            statusTitle.textContent =
                "✓ NORMAL TRAJECTORY";

            statusMessage.textContent =
                "Predicted trajectory remains within the current risk range.";

        }

    }

}


/* =====================================================
   RUN MODULE B PREDICTION
===================================================== */

async function runModuleBPrediction() {

    let value0h;
    let value24h;


    /* =========================================
       CSV DATA
    ========================================= */

    if (window.selectedComponent) {

        value0h =
            parseFloat(
                window.selectedComponent.value0h
            );

        value24h =
            parseFloat(
                window.selectedComponent.value24h
            );

    }


    /* =========================================
       MANUAL DATA
    ========================================= */

    else {

        const input0h =
            document.getElementById("module-b-0h");

        const input24h =
            document.getElementById("module-b-24h");

        if (!input0h || !input24h) {

            alert(
                "Module B input fields were not found."
            );

            return;

        }

        value0h =
            parseFloat(input0h.value);

        value24h =
            parseFloat(input24h.value);

    }


    /* =========================================
       VALIDATE
    ========================================= */

    if (
        isNaN(value0h) ||
        isNaN(value24h)
    ) {

        alert(
            "Please enter valid 0h and 24h values."
        );

        return;

    }


    /* =========================================
       SHOW ACTUAL VALUES
    ========================================= */

    const input0h =
        document.getElementById("module-b-0h");

    const input24h =
        document.getElementById("module-b-24h");

    if (input0h) {
        input0h.value = value0h;
    }

    if (input24h) {
        input24h.value = value24h;
    }


    /* =========================================
       CALL BACKEND
    ========================================= */

    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        value_0h:
                            value0h,

                        value_24h:
                            value24h

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend returned an error."
            );

        }


        const result =
            await response.json();


        console.log(
            "Module B Prediction:",
            result
        );


        showModuleB(result);


    }

    catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        alert(
            "Could not connect to the Drift Filter backend."
        );

    }

}


/* =====================================================
   COMBINED RISK
===================================================== */

function calculateCombinedRisk(
    moduleARisk,
    moduleBRisk
) {

    const combinedRisk =
        1 -
        (
            (1 - moduleARisk) *
            (1 - moduleBRisk)
        );

    return combinedRisk;

}


/* =====================================================
   SHOW FINAL REPORT
===================================================== */

function showFinalReport() {

    hideAllPages();

    const finalPage =
        document.getElementById(
            "final-report-page"
        );

    if (finalPage) {
        finalPage.classList.remove("hidden");
    }


    /* =========================================
       RISKS
    ========================================= */

    const moduleARisk =
        window.moduleARisk ?? 0;

    const moduleBRisk =
        window.moduleBRisk ?? 0;


    const combinedRisk =
        calculateCombinedRisk(
            moduleARisk,
            moduleBRisk
        );


    /* =========================================
       MODULE A RESULTS
    ========================================= */

    const finalMedian =
        document.getElementById(
            "final-module-a-median"
        );

    const finalMAD =
        document.getElementById(
            "final-module-a-mad"
        );

    const finalZ =
        document.getElementById(
            "final-module-a-zscore"
        );

    const finalARisk =
        document.getElementById(
            "final-module-a-risk"
        );


    if (
        finalMedian &&
        window.moduleAMedian != null
    ) {

        finalMedian.textContent =
            window.moduleAMedian.toFixed(2) +
            " µA";

    }

    if (
        finalMAD &&
        window.moduleAMAD != null
    ) {

        finalMAD.textContent =
            window.moduleAMAD.toFixed(2) +
            " µA";

    }

    if (
        finalZ &&
        window.moduleAZScore != null
    ) {

        finalZ.textContent =
            window.moduleAZScore.toFixed(2) +
            "σ";

    }

    if (finalARisk) {

        finalARisk.textContent =
            moduleARisk.toFixed(3);

    }


    /* =========================================
       MODULE B RESULTS
    ========================================= */

    const finalBRisk =
        document.getElementById(
            "final-module-b-risk"
        );

    const final168h =
        document.getElementById(
            "final-predicted-168h"
        );

    const final0h =
        document.getElementById(
            "final-module-b-0h"
        );

    const final24h =
        document.getElementById(
            "final-module-b-24h"
        );

    const final96h =
        document.getElementById(
            "final-module-b-96h"
        );


    if (finalBRisk) {

        finalBRisk.textContent =
            moduleBRisk.toFixed(3);

    }


    if (
        final168h &&
        window.predicted168h != null
    ) {

        final168h.textContent =
            "PREDICTED: " +
            window.predicted168h.toFixed(2) +
            " µA";

    }


    if (
        final0h &&
        window.trajectory
    ) {

        final0h.textContent =
            window.trajectory.value0h.toFixed(2) +
            " µA";

    }


    if (
        final24h &&
        window.trajectory
    ) {

        final24h.textContent =
            window.trajectory.value24h.toFixed(2) +
            " µA";

    }


    if (
        final96h &&
        window.trajectory
    ) {

        final96h.textContent =
            "ESTIMATED: " +
            window.trajectory.value96h.toFixed(2) +
            " µA";

    }


    /* =========================================
       COMPONENT ID
    ========================================= */

    const reportComponentId =
        window.selectedComponent?.partId ??
        window.manualComponentId ??
        "--";


    const reportLotId =
        window.selectedComponent?.lotId ??
        window.manualLotId ??
        "--";


    const componentElement =
        document.getElementById(
            "final-report-component-id"
        );

    const lotElement =
        document.getElementById(
            "final-lot-id"
        );


    if (componentElement) {

        componentElement.textContent =
            reportComponentId;

    }

    if (lotElement) {

        lotElement.textContent =
            reportLotId;

    }


    /* =========================================
       COMBINED RISK
    ========================================= */

    const combinedRiskElement =
        document.getElementById(
            "combined-risk"
        );

    if (combinedRiskElement) {

        combinedRiskElement.textContent =
            combinedRisk.toFixed(3);

    }


    /* =========================================
       FINAL DECISION
    ========================================= */

    const decisionElement =
        document.getElementById(
            "final-decision"
        );

    const finalReason =
        document.getElementById(
            "final-reason"
        );


    const reasons = [];


    /* =========================================
       MODULE A EXPLANATION
    ========================================= */

    if (moduleARisk >= 0.8) {

        reasons.push(
            "Module A shows a strong deviation from the normal lot behaviour."
        );

    }

    else if (moduleARisk >= 0.5) {

        reasons.push(
            "Module A shows measurable deviation from the normal lot envelope."
        );

    }

    else {

        reasons.push(
            "Module A indicates that the component is within the normal lot behaviour."
        );

    }


    /* =========================================
       MODULE B EXPLANATION
    ========================================= */

    if (moduleBRisk >= 0.8) {

        reasons.push(
            "Module B predicts a high probability of abnormal behaviour at 168h."
        );

    }

    else if (
        moduleBRisk >= 0.5 ||
        Math.abs(window.moduleBDrift ?? 0) >= 5
    ) {

        reasons.push(
            "Module B shows significant predicted drift from the 24h measurement."
        );

    }

    else {

        reasons.push(
            "Module B predicts a stable trajectory within the current risk range."
        );

    }


    /* =========================================
       COMBINED DECISION
    ========================================= */

    if (combinedRisk >= 0.8) {

        if (decisionElement) {
            decisionElement.textContent =
                "REJECT";
        }

        reasons.unshift(
            "Combined risk exceeds the rejection threshold."
        );

    }

    else if (combinedRisk >= 0.4) {

        if (decisionElement) {
            decisionElement.textContent =
                "REVIEW";
        }

        reasons.unshift(
            "Combined risk falls within the review range."
        );

    }

    else {

        if (decisionElement) {
            decisionElement.textContent =
                "PASS";
        }

        reasons.unshift(
            "Combined risk remains below the review threshold."
        );

    }


    /* =========================================
       DISPLAY REASONS
    ========================================= */

    if (finalReason) {

        finalReason.innerHTML =
            reasons
                .map(function (reason) {
                    return `<li>${reason}</li>`;
                })
                .join("");

    }

}


/* =====================================================
   MANUAL ENTRY
===================================================== */

function startManualEntry() {

    hideAllPages();

    const manualPage =
        document.getElementById(
            "manual-page"
        );

    if (manualPage) {

        manualPage.classList.remove(
            "hidden"
        );

    }


    /* Clear previous CSV selection */

    window.csvData = null;
    window.selectedComponent = null;


    /* Clear previous manual data */

    window.manualComponentId = null;
    window.manualLotId = null;


    /* Clear previous results */

    window.moduleARisk = null;
    window.moduleBRisk = null;

    window.moduleAMedian = null;
    window.moduleAMAD = null;
    window.moduleAZScore = null;

    window.predicted168h = null;
    window.moduleBDrift = null;
    window.trajectory = null;

}


function showManualModuleAInput() {

    hideAllPages();

    const page =
        document.getElementById(
            "manual-module-a-input-page"
        );

    if (page) {

        page.classList.remove(
            "hidden"
        );

    }

}


function runManualModuleA() {

    const componentInputElement =
        document.getElementById(
            "manual-component-id"
        );

    const lotInputElement =
        document.getElementById(
            "manual-lot-id"
        );

    const lotValuesElement =
        document.getElementById(
            "manual-lot-values"
        );

    const componentValueElement =
        document.getElementById(
            "manual-component-value"
        );


    if (
        !componentInputElement ||
        !lotInputElement ||
        !lotValuesElement ||
        !componentValueElement
    ) {

        console.error(
            "Manual Module A input element missing."
        );

        alert(
            "Some Manual Module A fields are missing."
        );

        return;

    }


    const componentId =
        componentInputElement.value.trim();

    const lotId =
        lotInputElement.value.trim();

    const lotInput =
        lotValuesElement.value;

    const componentInput =
        componentValueElement.value;


    window.manualComponentId =
        componentId;

    window.manualLotId =
        lotId;


    const lotValues =
        lotInput
            .split(",")
            .map(function (value) {
                return parseFloat(
                    value.trim()
                );
            })
            .filter(function (value) {
                return !isNaN(value);
            });


    const componentValue =
        parseFloat(componentInput);


    if (lotValues.length === 0) {

        alert(
            "Please enter valid lot values."
        );

        return;

    }


    if (isNaN(componentValue)) {

        alert(
            "Please enter a valid component 0h value."
        );

        return;

    }


    /* Show Module A page */

    showModuleA();


    /* Run Module A */

    runModuleAPrediction(
        lotValues,
        componentValue
    );

}


/* =====================================================
   BACK TO DASHBOARD
===================================================== */

function goToDashboard() {

    hideAllPages();

    const dashboard =
        document.getElementById(
            "dashboard-page"
        );

    if (dashboard) {

        dashboard.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   CSV UPLOAD
===================================================== */

const csvInput =
    document.getElementById(
        "csv-input"
    );


if (csvInput) {

    csvInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            if (
                !file.name
                    .toLowerCase()
                    .endsWith(".csv")
            ) {

                alert(
                    "Please upload a CSV file."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                async function (e) {

                    try {

                        const csvText =
                            e.target.result;


                        const rows =
                            csvText
                                .trim()
                                .split(/\r?\n/)
                                .map(function (row) {

                                    return row.split(",");

                                });


                        if (rows.length < 2) {

                            alert(
                                "CSV file does not contain data."
                            );

                            return;

                        }


                        const headers =
                            rows[0].map(
                                function (header) {
                                    return header.trim();
                                }
                            );


                        const partIndex =
                            headers.indexOf(
                                "Part_ID"
                            );

                        const lotIndex =
                            headers.indexOf(
                                "Lot_ID"
                            );

                        const value0Index =
                            headers.indexOf(
                                "Value_0h"
                            );

                        const value24Index =
                            headers.indexOf(
                                "Value_24h"
                            );


                        if (
                            partIndex === -1 ||
                            lotIndex === -1 ||
                            value0Index === -1 ||
                            value24Index === -1
                        ) {

                            alert(
                                "CSV must contain Part_ID, Lot_ID, Value_0h and Value_24h columns."
                            );

                            return;

                        }


                        const data =
                            rows
                                .slice(1)
                                .filter(function (row) {

                                    return (
                                        row.length >=
                                        headers.length
                                    );

                                })
                                .map(function (row) {

                                    return {

                                        partId:
                                            row[
                                                partIndex
                                            ]
                                                .trim(),

                                        lotId:
                                            row[
                                                lotIndex
                                            ]
                                                .trim(),

                                        value0h:
                                            parseFloat(
                                                row[
                                                    value0Index
                                                ]
                                            ),

                                        value24h:
                                            parseFloat(
                                                row[
                                                    value24Index
                                                ]
                                            )

                                    };

                                })
                                .filter(function (row) {

                                    return (
                                        !isNaN(
                                            row.value0h
                                        ) &&
                                        !isNaN(
                                            row.value24h
                                        )
                                    );

                                });


                        if (data.length === 0) {

                            alert(
                                "No valid component data found in the CSV."
                            );

                            return;

                        }


                        console.log(
                            "CSV Data:",
                            data
                        );


                        /* =========================================
                           STORE CSV DATA
                        ========================================= */

                        window.csvData =
                            data;


                        /* =========================================
                           COMPONENT SELECT
                        ========================================= */

                        const componentSelect =
                            document.getElementById(
                                "component-select"
                            );


                        if (componentSelect) {

                            componentSelect.innerHTML =
                                '<option value="">Select a component</option>';


                            data.forEach(
                                function (
                                    component,
                                    index
                                ) {

                                    const option =
                                        document.createElement(
                                            "option"
                                        );

                                    option.value =
                                        index;

                                    option.textContent =
                                        component.partId +
                                        " — " +
                                        component.lotId;

                                    componentSelect.appendChild(
                                        option
                                    );

                                }
                            );

                        }


                        /* =========================================
                           SELECT FIRST COMPONENT
                        ========================================= */

                        const selectedComponent =
                            data[0];


                        window.selectedComponent =
                            selectedComponent;


                        if (componentSelect) {

                            componentSelect.value =
                                "0";

                        }


                        /* =========================================
                           UPDATE COMPONENT ID
                        ========================================= */

                        const componentIdElement =
                            document.getElementById(
                                "final-component-id"
                            );


                        if (componentIdElement) {

                            componentIdElement.textContent =
                                selectedComponent.partId;

                        }


                        /* =========================================
                           UPDATE LOT ID
                        ========================================= */

                        const lotIdElement =
                            document.getElementById(
                                "selected-lot-id"
                            );


                        if (lotIdElement) {

                            lotIdElement.textContent =
                                selectedComponent.lotId;

                        }


                        /* =========================================
                           BUILD LOT VALUES
                        ========================================= */

                        const lotValues =
                            data
                                .filter(
                                    function (row) {

                                        return (
                                            row.lotId ===
                                            selectedComponent.lotId
                                        );

                                    }
                                )
                                .map(
                                    function (row) {

                                        return row.value0h;

                                    }
                                );


                        console.log(
                            "Selected Component:",
                            selectedComponent
                        );


                        console.log(
                            "Lot Values:",
                            lotValues
                        );


                        /* =========================================
                           SHOW MODULE A
                        ========================================= */

                        showModuleA();


                        /* =========================================
                           RUN MODULE A
                        ========================================= */

                        await runModuleAPrediction(
                            lotValues,
                            selectedComponent.value0h
                        );

                    }

                    catch (error) {

                        console.error(
                            "CSV processing error:",
                            error
                        );

                        alert(
                            "There was a problem processing the CSV file."
                        );

                    }

                };


            reader.readAsText(file);

        }
    );

}


/* =====================================================
   COMPONENT SELECTION CHANGE
===================================================== */

const componentSelect =
    document.getElementById(
        "component-select"
    );


if (componentSelect) {

    componentSelect.addEventListener(
        "change",
        async function (event) {

            const selectedIndex =
                parseInt(
                    event.target.value
                );


            if (
                isNaN(selectedIndex) ||
                !window.csvData
            ) {

                return;

            }


            const selectedComponent =
                window.csvData[
                    selectedIndex
                ];


            if (!selectedComponent) {

                return;

            }


            window.selectedComponent =
                selectedComponent;


            const lotValues =
                window.csvData
                    .filter(function (row) {

                        return (
                            row.lotId ===
                            selectedComponent.lotId
                        );

                    })
                    .map(function (row) {

                        return row.value0h;

                    });


            console.log(
                "New Selected Component:",
                selectedComponent
            );


            console.log(
                "New Lot Values:",
                lotValues
            );


            const componentIdElement =
                document.getElementById(
                    "final-component-id"
                );


            const lotIdElement =
                document.getElementById(
                    "selected-lot-id"
                );


            if (componentIdElement) {

                componentIdElement.textContent =
                    selectedComponent.partId;

            }


            if (lotIdElement) {

                lotIdElement.textContent =
                    selectedComponent.lotId;

            }


            await runModuleAPrediction(
                lotValues,
                selectedComponent.value0h
            );

        }
    );

}


/* =====================================================
   RUN MODULE A PREDICTION
===================================================== */

async function runModuleAPrediction(
    lotValues,
    componentValue
) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/module-a",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        lot_values:
                            lotValues,

                        component_value:
                            componentValue

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Module A backend returned an error."
            );

        }


        const result =
            await response.json();


        console.log(
            "Module A Result:",
            result
        );


        /* =========================================
           STORE RESULTS
        ========================================= */

        window.moduleARisk =
            result.risk;

        window.moduleAMedian =
            result.median;

        window.moduleAMAD =
            result.mad;

        window.moduleAZScore =
            result.modified_z;


        /* =========================================
           DISPLAY RESULTS
        ========================================= */

        const medianElement =
            document.getElementById(
                "module-a-median"
            );

        const madElement =
            document.getElementById(
                "module-a-mad"
            );

        const zscoreElement =
            document.getElementById(
                "module-a-zscore"
            );

        const riskElement =
            document.getElementById(
                "module-a-risk"
            );


        if (medianElement) {

            medianElement.textContent =
                result.median.toFixed(2) +
                " µA";

        }


        if (madElement) {

            madElement.textContent =
                result.mad.toFixed(2) +
                " µA";

        }


        if (zscoreElement) {

            zscoreElement.textContent =
                result.modified_z.toFixed(2) +
                "σ";

        }


        if (riskElement) {

            riskElement.textContent =
                result.risk.toFixed(3);

        }


        /* =========================================
           STATUS
        ========================================= */

        const statusBox =
            document.getElementById(
                "module-a-status"
            );

        const statusTitle =
            document.getElementById(
                "module-a-status-title"
            );

        const statusMessage =
            document.getElementById(
                "module-a-status-message"
            );


        const absoluteZ =
            Math.abs(
                result.modified_z
            );


        if (
            statusBox &&
            statusTitle &&
            statusMessage
        ) {

            if (result.risk >= 0.8) {

                statusBox.classList.add(
                    "warning"
                );

                statusTitle.textContent =
                    "⚠ HIGH ANOMALY RISK";

                statusMessage.textContent =
                    "The component shows a strong deviation from the normal lot behaviour.";

            }

            else if (
                result.risk >= 0.5 ||
                absoluteZ >= 3
            ) {

                statusBox.classList.add(
                    "warning"
                );

                statusTitle.textContent =
                    "⚠ ANOMALY DETECTED";

                statusMessage.textContent =
                    "The component shows measurable deviation from the normal lot envelope.";

            }

            else {

                statusBox.classList.remove(
                    "warning"
                );

                statusTitle.textContent =
                    "✓ NORMAL COMPONENT";

                statusMessage.textContent =
                    "The component remains within the current lot behaviour.";

            }

        }


        return result;


    }

    catch (error) {

        console.error(
            "Module A prediction error:",
            error
        );

        alert(
            "Could not connect to the Drift Filter backend."
        );

        return null;

    }

}