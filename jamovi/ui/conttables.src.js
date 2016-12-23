'use strict';

var options = require("./conttables.options");


const view = View.extend({

    initialize: function(ui) {
        ui.ciWidth.setEnabled(ui.logOdds.value());
    },

    events: [
        {
            onChange : "logOdds", execute : function(ui) {
                ui.ciWidth.setEnabled(ui.logOdds.value());
            }
        }
    ]
});

view.layout = ui.extend({

    label: "Contingency Tables",
    type: "root",
    stage: 0,
    controls: [
        {
            type: "variablesupplier",
            persistentItems: false,
            stretchFactor: 1,
            controls: [
                {
                    type:"variabletargetlistbox",
                    name: "rows",
                    label: "Rows",
                    showColumnHeaders: false,
                    maxItemCount: 1,
                    itemDropBehaviour: "overwrite",
                    columns: [
                        { type: "listitem.variablelabel", name: 'column1', label: "", format: FormatDef.variable, stretchFactor: 1 },
                    ]
                },
                {
                    type:"variabletargetlistbox",
                    name: "cols",
                    label: "Columns",
                    showColumnHeaders: false,
                    maxItemCount: 1,
                    itemDropBehaviour: "overwrite",
                    columns: [
                        { type: "listitem.variablelabel", name: 'column1', label: "", format: FormatDef.variable, stretchFactor: 1 },
                    ]
                },
                {
                    type:"variabletargetlistbox",
                    name: "counts",
                    label: "Counts (optional)",
                    showColumnHeaders: false,
                    maxItemCount: 1,
                    itemDropBehaviour: "overwrite",
                    columns: [
                        { type: "listitem.variablelabel", name: 'column1', label: "", format: FormatDef.variable, stretchFactor: 1 },
                    ]
                },
                {
                    type:"variabletargetlistbox",
                    name: "layers",
                    label: "Layers",
                    showColumnHeaders: false,
                    columns: [
                        { type: "listitem.variablelabel", name: 'column1', label: "", format: FormatDef.variable, stretchFactor: 1 },
                    ]
                },
            ]
        },
        {
            type: "layoutbox",
            margin: "large",
            stretchFactor: 1,
            controls: [
                {
                    type: "collapsebox",
                    label: "Statistics",
                    stretchFactor: 1,
                    collapsed: true,
                    controls: [
                        {
                            type: "label",
                            cell: [0, 0],
                            controls : [
                                { type:"checkbox", name: "chiSq", label: "χ²" },
                                { type:"checkbox", name: "chiSqCorr", label: "χ² continuity correction" },
                                { type:"checkbox", name: "likeRat", label: "Likelihood ratio" },
                            ]
                        },
                        {
                            type: "label",
                            cell: [1, 0],
                            controls : [
                                {
                                    type:"checkbox", name: "logOdds", label: "Log odds ratio (2x2 only)", controls: [
                                        { type:"textbox", name: "ciWidth", label: "Confidence level", suffix: "%", format: FormatDef.number, inputPattern: "[0-9]+" }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "label",
                            label: "Nominal",
                            cell: [0, 1],
                            controls : [
                                { type:"checkbox", name: "contCoef", label: "Contingency coefficient" },
                                { type:"checkbox", name: "phiCra", label: "Phi and Cramer's V" }
                            ]
                        },
                        {
                            type: "label",
                            label: "Ordinal",
                            cell: [1, 1],
                            controls : [
                                { type:"checkbox", name: "gamma", label: "Gamma" },
                                { type:"checkbox", name: "taub", label: "Kendall's tau-b" }
                            ]
                        }
                    ]
                },
                {
                    type: "collapsebox",
                    label: "Cells",
                    stretchFactor: 1,
                    collapsed: true,
                    controls : [
                        {
                            type: "label",
                            label: "Counts",
                            controls : [
                                { type:"checkbox", name: "obs", label: "Observed" },
                                { type:"checkbox", name: "exp", label: "Expected" }
                            ]
                        },
                        {
                            type: "label",
                            label: "Percentages",
                            cell: [1, 0],
                            controls : [
                                { type:"checkbox", name: "pcRow", label: "Row" },
                                { type:"checkbox", name: "pcCol", label: "Column" },
                                { type:"checkbox", name: "pcTot", label: "Total" }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


module.exports = { view : view, options: options };
