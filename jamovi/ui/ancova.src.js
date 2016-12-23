
'use strict';

const options = require('./ancova.options');
const view = require('./ancova.actions');

view.layout = ui.extend({

    label: "ANCOVA",
    type: "root",
    stage: 1,
    controls: [
        {
            type: "variablesupplier",
            name: "variableSupplier",
            persistentItems: false,
            stretchFactor: 1,
            suggested: ["continuous", "nominal", "ordinal"],
            controls: [
                {
                    name: "dependent",
                    type: "variabletargetlistbox",
                    label: "Dependent Variable",
                    showColumnHeaders: false,
                    maxItemCount: 1,
                    itemDropBehaviour: "overwrite",
                    columns: [
                        { type: "listitem.variablelabel", name: "column1", label: "", stretchFactor: 1 }
                    ]
                },
                {
                    name: "fixedFactors",
                    type:"variabletargetlistbox",
                    label: "Fixed Factors",
                    showColumnHeaders: false,
                    columns: [
                        { type: "listitem.variablelabel", name: "column1", label: "", stretchFactor: 1 }
                    ]
                },
                {
                    name: "covariates",
                    type:"variabletargetlistbox",
                    label: "Covariates",
                    showColumnHeaders: false,
                    columns: [
                        { type: "listitem.variablelabel", name: "column1", label: "", stretchFactor: 1 }
                    ]
                }
            ]
        },
        {
            type: "label",
            label: "Effect Size",
            style: "list-inline",
            margin: "large",
            controls: [
                { name: "etaSq",   type:"checkbox", label: "η²" },
                { name: "etaSqP",  type:"checkbox", label: "partial η²" },
                { name: "omegaSq", type:"checkbox", label: "ω²" }
            ]
        },
        {
            type: "collapsebox",
            label: "Model",
            collapsed: true,
            stretchFactor: 1,
            controls : [
                {
                    type: "supplier",
                    name: "modelSupplier",
                    label: "Componets",
                    persistentItems: true,
                    stretchFactor: 1,
                    controls: [
                        {
                            type:"targetlistbox",
                            name: "modelTerms",
                            label: "Model Terms",
                            showColumnHeaders: false,
                            valueFilter: "unique",
                            itemDropBehaviour: "empty_space",
                            columns: [
                                { type: "listitem.termlabel", name: "column1", label: "", stretchFactor: 1 }
                            ]
                        }
                    ]
                },
                {
                    type: "layoutbox",
                    controls: [
                        { name: "ss", type:"combobox", label: "Sum of squares", options: [
                            { label: 'Type 1', value: '1' },
                            { label: 'Type 2', value: '2' },
                            { label: 'Type 3', value: '3' }
                        ] }
                    ]
                }
            ]
        },
        {
            type: "collapsebox",
            label: "Assumption Checks",
            collapsed: true,
            stretchFactor: 1,
            controls : [
                { name: "homo", type:"checkbox", label: "Homogeneity tests" },
                { name: "qq", type:"checkbox", label: "Q-Q plot of residuals" }
            ]
        },
        {
            type: "collapsebox",
            label: "Contrasts",
            collapsed: true,
            stretchFactor: 1,
            controls : [
                {
                    type:"listbox",
                    name: "contrasts",
                    label: "Factors",
                    showColumnHeaders: false,
                    columns: [
                        { type: "listitem.variablelabel", name: "var", label: "", format: FormatDef.variable, selectable: false, stretchFactor: 0.5 },
                        { type: "listitem.combobox", name: "type", label: "", format: FormatDef.string, selectable: false, stretchFactor: 1, options: ['none', 'deviation', 'simple', 'difference', 'helmert', 'repeated', 'polynomial'] }
                    ]
                }
            ]
        },
        {
            type: "collapsebox",
            label: "Post Hoc Tests",
            collapsed: true,
            stretchFactor: 1,
            controls : [
                {
                    type: "supplier",
                    name: "postHocSupplier",
                    persistentItems: false,
                    stretchFactor: 1,
                    controls: [
                        {
                            type:"targetlistbox",
                            name: "postHoc",
                            showColumnHeaders: false,
                            columns: [
                                { type: "listitem.variablelabel", name: "column1", label: "", format: FormatDef.variable, stretchFactor: 1 }
                            ]
                        }
                    ]
                },
                {
                    type: "label",
                    label: "Correction",
                    controls: [
                        { name: "corrTukey", type:"checkbox", label: "Tukey" },
                        { name: "corrScheffe", type:"checkbox", label: "Scheffe" },
                        { name: "corrBonf", type:"checkbox", label: "Bonferroni" },
                        { name: "corrHolm", type:"checkbox", label: "Holm" }
                    ]
                }
            ]
        },
        {
            type: "collapsebox",
            label: "Descriptive Plots",
            collapsed: true,
            stretchFactor: 1,
            controls : [
                {
                    type: "supplier",
                    name: "plotsSupplier",
                    label: "Factors",
                    stretchFactor: 1,
                    persistentItems: false,
                    controls: [
                        {
                            type:"targetlistbox",
                            name: "descPlotsHAxis",
                            label: "Horizontal axis",
                            showColumnHeaders: false,
                            maxItemCount: 1,
                            itemDropBehaviour: "overwrite",
                            columns: [
                                { type: "listitem.variablelabel", name: "column1", label: "", format: FormatDef.variable, stretchFactor: 1 }
                            ]
                        },
                        {
                            type:"targetlistbox",
                            name: "descPlotsSepLines",
                            label: "Separate lines",
                            showColumnHeaders: false,
                            maxItemCount: 1,
                            itemDropBehaviour: "overwrite",
                            columns: [
                                { type: "listitem.variablelabel", name: "column1", label: "", format: FormatDef.variable, stretchFactor: 1 }
                            ]
                        },
                        {
                            type:"targetlistbox",
                            name: "descPlotsSepPlots",
                            label: "Separate plots",
                            showColumnHeaders: false,
                            maxItemCount: 1,
                            itemDropBehaviour: "overwrite",
                            columns: [
                                { type: "listitem.variablelabel", name: "column1", label: "", format: FormatDef.variable, stretchFactor: 1 }
                            ]
                        }
                    ]
                },
                {
                    type: "label",
                    label: "Display",
                    controls: [
                        {
                            name: "errBarDef_ci", optionId: "plotError", type:"radiobutton", checkedValue: "ci", label: "Confidence interval",
                            controls: [ { name: "ciWidth", type:"textbox", label: "Interval", suffix: "%", format: FormatDef.number, inputPattern: "[0-9]+" } ]
                        },
                        { name: "errBarDef_se", optionId: "plotError", type:"radiobutton", checkedValue: "se", label: "Standard Error" }
                    ]
                }
            ]
        },
        {
            type: "collapsebox",
            label: "Additional Options",
            collapsed: true,
            stretchFactor: 1,
            controls : [
                {
                    name: "compMain", label: "Compare main effects", type:"checkbox",
                    controls: [
                        { name: "compMainCorr", type:"combobox", label: "Correction", options: [
                            { label: "None", value: "none" },
                            { label: "Tukey", value: "tukey" },
                            { label: "Bonferroni", value: "bonferroni" },
                            { label: "Scheffe", value: "scheffe" },
                            { label: "Sidak", value: "sidak" } ] }
                    ]
                },
                {
                    type: "label",
                    label: "Display",
                    controls: [
                        { name: "descStats", type:"checkbox", label: "Descriptive statistics" }
                    ]
                }
            ]
        }
    ],
});

module.exports = { view : view, options: options };
