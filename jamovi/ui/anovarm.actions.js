
var rma_cell = require('./rmacell');

var actions = Actions.extend({

    events: [
        {
            onChange: "spherCorrs", execute: function(ui) {
                var value = ui.spherCorrs.value();
                ui.spherCorrNone.setEnabled(value);
                ui.spherCorrGreenGsser.setEnabled(value);
                ui.spherCorrHuyFdt.setEnabled(value);
            }
        },
        {
            onChange: "dispErrBars", execute: function(ui) {
                var value = ui.dispErrBars.value();
                ui.errBarDef_se.setEnabled(value);
                ui.errBarDef_ci.setEnabled(value);
            }
        },
        {
            onChange: ["dispErrBars", "errBarDef"], execute: function(ui) {
                ui.ciWidth.setEnabled(ui.dispErrBars.value() && ui.errBarDef.value() === "ci");
            }
        },
        {
            onChange: "rm", execute: function(ui) {
                var value = ui.rm.value();
                if (value === null)
                    return;

                var data = []
                var indices = []
                for (var i = 0; i < value.length; i++) {
                    indices[i] = 0;
                }

                var end = false;
                var pos = 0;
                while (end === false) {
                    var cell = []
                    for (var k = 0; k < indices.length; k++) {
                        cell.push(value[k].levels[indices[k]])
                    }
                    data.push(cell);
                    pos += 1;
                    var zeroCount = 0;

                    var r = indices.length - 1;
                    if (r < 0)
                        end = true;
                    while (r >= 0) {
                        indices[r] = (indices[r] + 1) % value[r].levels.length;
                        if (indices[r] === 0)
                            r -= 1;
                        else
                            break;

                        if (r === -1)
                            end = true;
                    }
                }

                this._factorCells = data;
                this.filterCells(ui);
            }
        },
        {
            onChange: "rmCells", execute: function(ui) {
                this.filterCells(ui);
            }
        },
        {
            onChange: ["bs", "cov", "rm"], execute: function(ui) {
                this.calcModelTerms(ui);
            }
        },
        {
            onChange: "rmTerms", execute: function(ui) {
                this.filterModelRMTerms(ui);
            }
        },
        {
            onChange: "bsTerms", execute: function(ui) {
                this.filterModelTerms(ui);
            }
        },
        {
            onEvent: "rmCells.changing", execute: function(ui, data) {
                if (data.key.length === 1 && data.value === null) {
                    let oldValue = this.clone(ui.rmCells.value(data.key));
                    oldValue["measure"] = null;
                    data.value = oldValue;
                }
            }
        },
        {
            onEvent: "bsTerms.preprocess", execute: function(ui, data) {
                if (data.intoSelf === false)
                    data.items = this.getItemCombinations(data.items);
            }
        },
        {
            onEvent: "rmTerms.preprocess", execute: function(ui, data) {
                if (data.intoSelf === false)
                    data.items = this.getItemCombinations(data.items);
            }
        },
        {
            onEvent: "view.loaded", execute: function(ui) {
                this._loaded = true;
            }
        },
        {
            onEvent: "view.data-initialising", execute: function(ui) {
                this._lastVariableList = null;
                this._lastRMTerms = null;
                this._lastFactorsList = null;
                this._lastCombinedList = null;
                this._lastCombinedList2 = null;
                this._lastCovariatesList = null;
                this._lastCurrentList = null;
                this._initialising = true;
            }
        },
        {
            onEvent: "view.data-initialised", execute: function(ui) {
                if (this._lastFactorsList === null || this._lastVariableList === null || this._lastCombinedList === null || this._lastCombinedList2 === null || this._lastCovariatesList === null)
                    this.calcModelTerms(ui);

                if (this._lastCurrentList === null)
                    this.filterModelTerms(ui);

                if (this._lastRMTerms === null)
                    this.filterModelRMTerms(ui);

                this._initialising = false;
            }
        }
    ],

    calcRMTerms : function(ui, factorList) {

        var diff = { removed: [], added: [] };
        if (this._lastFactorsList !== null)
            diff = this.findDifferences(this._lastFactorsList, factorList, FormatDef.term);
        this._lastFactorsList = factorList;

        if (this._initialising || !this._loaded)
            return;

        var termsList = this.clone(ui.rmTerms.value());
        if (termsList === null)
            termsList = [];

        var termsChanged = false;

        for (var i = 0; i < diff.removed.length; i++) {
            for (var j = 0; j < termsList.length; j++) {
                if (FormatDef.term.contains(termsList[j], diff.removed[i])) {
                    termsList.splice(j, 1);
                    termsChanged = true;
                    j -= 1;
                }
            }
        }

        for (var i = 0; i < diff.added.length; i++) {
            var listLength = termsList.length;
            for (var j = 0; j < listLength; j++) {
                var newTerm = this.clone(termsList[j]);
                newTerm.push(diff.added[i])
                termsList.push(newTerm);
            }
            termsList.push([diff.added[i]]);
            termsChanged = true;
        }

        if (termsChanged)
            ui.rmTerms.setValue(termsList);
    },

    calcModelTerms : function(ui) {
        var variableList = this.clone(ui.bs.value());
        if (variableList === null)
            variableList = [];

        var covariatesList = this.clone(ui.cov.value());
        if (covariatesList === null)
            covariatesList = [];

        var factorList = this.clone(ui.rm.value());
        var factorVarList = [];
        if (factorList === null)
            factorList = [];
        else {
            for(let i = 0; i < factorList.length; i++) {
                factorVarList[i] = factorList[i].label;
                factorList[i] = [factorList[i].label];
            }
        }

        var combinedList = variableList.concat(covariatesList);

        var combinedList2 = factorVarList.concat(variableList);

        ui.rmcModelSupplier.setValue(this.valuesToItems(factorVarList, FormatDef.variable))
        ui.bscModelSupplier.setValue(this.valuesToItems(combinedList, FormatDef.variable));
        ui.plotsSupplier.setValue(this.valuesToItems(combinedList2, FormatDef.variable));
        ui.postHocSupplier.setValue(this.valuesToItems(combinedList2, FormatDef.variable));

        this.calcRMTerms(ui, factorList);

        var diff = { removed: [], added: [] };
        if (this._lastVariableList !== null)
            diff = this.findDifferences(this._lastVariableList, variableList, FormatDef.variable);
        this._lastVariableList = variableList;

        var diff2 = { removed: [], added: [] };
        if (this._lastCovariatesList !== null)
            diff2 = this.findDifferences(this._lastCovariatesList, covariatesList, FormatDef.variable);
        this._lastCovariatesList = covariatesList;

        var combinedDiff = { removed: [], added: [] };
        if (this._lastCombinedList !== null)
            combinedDiff = this.findDifferences(this._lastCombinedList, combinedList, FormatDef.variable);
        this._lastCombinedList = combinedList;


        if (this._initialising || !this._loaded)
            return;

        var termsList = this.clone(ui.bsTerms.value());
        if (termsList === null)
            termsList = [];

        var termsChanged = false;

        for (var i = 0; i < combinedDiff.removed.length; i++) {
            for (var j = 0; j < termsList.length; j++) {
                if (FormatDef.term.contains(termsList[j], combinedDiff.removed[i])) {
                    termsList.splice(j, 1);
                    termsChanged = true;
                    j -= 1;
                }
            }
        }

        for (var i = 0; i < diff.added.length; i++) {
            var listLength = termsList.length;
            for (var j = 0; j < listLength; j++) {
                var newTerm = this.clone(termsList[j]);
                if (this.containsCovariate(newTerm, covariatesList) === false) {
                    newTerm.push(diff.added[i])
                    termsList.push(newTerm);
                }
            }
            termsList.push([diff.added[i]]);
            termsChanged = true;
        }

        for (var i = 0; i < diff2.added.length; i++) {
            termsList.push([diff2.added[i]]);
            termsChanged = true;
        }

        if (termsChanged)
            ui.bsTerms.setValue(termsList);

        this.updateContrasts(ui, combinedList2);
    },

    filterModelTerms: function(ui) {
        var termsList = this.clone(ui.bsTerms.value());
        if (termsList === null)
            termsList = [];

        var diff = null;
        if ( ! this._initialising && this._loaded)
            diff = this.findDifferences(this._lastCurrentList, termsList, FormatDef.term);
        this._lastCurrentList = termsList;

        if (this._initialising || !this._loaded)
            return;

        var changed = false;
        if (diff.removed.length > 0) {
            var itemsRemoved = false;
            for (var i = 0; i < diff.removed.length; i++) {
                var item = diff.removed[i];
                for (var j = 0; j < termsList.length; j++) {
                    if (FormatDef.term.contains(termsList[j], item)) {
                        termsList.splice(j, 1);
                        j -= 1;
                        itemsRemoved = true;
                    }
                }
            }

            if (itemsRemoved)
                changed = true;
        }

        if (this.sortArraysByLength(termsList))
            changed = true;

        if (changed)
            ui.bsTerms.setValue(termsList);
    },

    filterModelRMTerms: function(ui) {
        var termsList = this.clone(ui.rmTerms.value());
        if (termsList === null)
            termsList = [];

        var diff = null;
        if ( ! this._initialising && this._loaded)
            diff = this.findDifferences(this._lastRMTerms, termsList, FormatDef.term);
        this._lastRMTerms = termsList;

        if (this._initialising || !this._loaded)
            return;

        var changed = false;
        if (diff.removed.length > 0) {
            var itemsRemoved = false;
            for (var i = 0; i < diff.removed.length; i++) {
                var item = diff.removed[i];
                for (var j = 0; j < termsList.length; j++) {
                    if (FormatDef.term.contains(termsList[j], item)) {
                        termsList.splice(j, 1);
                        j -= 1;
                        itemsRemoved = true;
                    }
                }
            }

            if (itemsRemoved)
                changed = true;
        }

        if (this.sortArraysByLength(termsList))
            changed = true;

        if (changed)
            ui.rmTerms.setValue(termsList);
    },

    containsCovariate: function(value, covariates) {
        for (var i = 0; i < covariates.length; i++) {
            if (FormatDef.term.contains(value, covariates[i]))
                return true;
        }

        return false;
    },

    updateContrasts : function(ui, variableList) {
        var currentList = this.clone(ui.contrasts.value());
        if (currentList === null)
            currentList = [];

        var list3 = [];
        for (let i = 0; i < variableList.length; i++) {
            let found = null;
            for (let j = 0; j < currentList.length; j++) {
                if (currentList[j].var === variableList[i]) {
                    found = currentList[j];
                    break;
                }
            }
            if (found === null)
                list3.push({ var: variableList[i], type: "none" });
            else
                list3.push(found);
        }

        ui.contrasts.setValue(list3);
    },

    filterCells: function(ui) {

        if (this._factorCells === null)
            return;

        var cells = this.clone(ui.rmCells.value());
        if (cells === null)
            cells = [];

        var factorCells = this.clone(this._factorCells);

        var changed = false;
        for (var j = 0; j < factorCells.length; j++) {
            if (j < cells.length && cells[j] !== null) {
                if (rma_cell.isEqual(cells[j].cell, factorCells[j]) === false) {
                    cells[j].cell = factorCells[j];
                    changed = true;
                }
            }
            else {
                cells[j] = { measure: null, cell: factorCells[j] };
                changed = true;
            }
        }

        if (cells.length > factorCells.length) {
            cells.splice(factorCells.length, cells.length - factorCells.length);
            changed = true;
        }

        if (changed) {
            ui.rmCells.setValue(cells);
            ui.rmCells.setPropertyValue("maxItemCount", cells.length);
        }
    },

    _factorCells : null
});



module.exports = actions;