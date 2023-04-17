import { eContentType, FlowDisplayColumn, FlowObjectData, FlowObjectDataArray } from 'flow-component-model';
import React from 'react';
import CascadingCombo from './CascadingCombo';
import CascadingCombos from './CascadingCombos';

export default class ValueTree {
    columns: Map<string, FlowDisplayColumn> = new Map();
    columnValues: Map<string, string>;

    // each value is an object data's display column values in order and keyed on internal id
    values: Map<string, {values: string[], displayOrder: number}>;

    root: CascadingCombos;

    constructor(parent: CascadingCombos, columns: FlowDisplayColumn[]) {
        const cols: FlowDisplayColumn[] = columns.sort((a: any, b: any) => {
            switch (true) {
                case a.DisplayOrder > b.DisplayOrder:
                    return 1;
                case a.DisplayOrder === b.DisplayOrder:
                    return 0;
                default:
                    return -1;
            }
        });
        cols.forEach((col: FlowDisplayColumn) => {
            this.columns.set(col.developerName, col);
        });
        this.values = new Map();
        this.columnValues = new Map();
        this.root = parent;

        this.setSelectedValue = this.setSelectedValue.bind(this);
    }

    /*
    setListener(column: string, client: CascadingCombo) {
        if (client) {
            this.combos.set(column, client);
        } else {
            this.combos.delete(column);
        }

    }
    */

    addItems(items: FlowObjectDataArray, stateValue: FlowObjectData) {
        items.items.forEach((item: FlowObjectData) => {
            this.addItem(item);
        });
        if(stateValue){
            this.columns?.forEach((col: FlowDisplayColumn) => {
                this.columnValues.set(col.developerName, stateValue.properties[col.developerName]?.value as string)
            });
        }
    }

    addItem(item: FlowObjectData) {
        const fields: string[] = [];
        let order: number = 0;
        if (this.root.getAttribute('sortColumn')) {
            order = parseInt(item.properties[this.root.getAttribute('sortColumn')].value as string);
        }
        this.columns.forEach((column: FlowDisplayColumn) => {
            fields.push((item.properties[column.developerName].value as string).trim());
        });
        this.values.set(item.internalId, {values: fields, displayOrder: order});
    }

    setSelectedValue(column: string, value: string) {
        if (! value || value.length === 0) {
            this.columnValues.delete(column);
        } else {
            this.columnValues.set(column, value);
        }

        const descendents: string[] = this.getDescendents(column);
        for(let pos = 0 ; pos < descendents.length ; pos++) {
            // remove any previous selection on children
            this.columnValues.delete(descendents[pos]);
            if (this.root.combos.has(descendents[pos])) {
                this.root.combos.get(descendents[pos]).refresh();
            }
        }
        // if we have a selected value for every combo then we need to tell parent to update state
        let complete: boolean = true;
        this.columns.forEach((column: FlowDisplayColumn, key: string) => {
            if(column.visible) {
                if ((!this.columnValues.has(key)) || (this.columnValues.get(key)?.length === 0)) {
                    complete = false;
                }
            }
        });
        let selectedId: string;
        if (complete === true) {
            // let keys: Array<string> = Array.from(this.values.keys());
            const cols: string[] = Array.from(this.columns.keys());
            let item: string[];
            let matches: boolean = true;
            // check each item
            // for (let pos = 0 ; pos < keys.length ; pos++) {
            this.values.forEach((value: {values: string[], displayOrder: number}, key: string) => {
                matches = true;
                // item = this.values.get(keys[pos]);
                // compare each value in item to the values in columnValues
                for (let colpos = 0 ; colpos < cols.length ; colpos++) {
                    //we're only testing visible columns
                    if(this.columns.get(cols[colpos]).visible){
                        if (value.values[colpos] !== this.columnValues.get(cols[colpos])) {
                            matches = false;
                        }
                    }
                }
                if (matches === true) {
                    selectedId = key;
                }
            });
            this.root.selectionChanged(selectedId);
        }
        
    }

    getColumns(): FlowDisplayColumn[] {
        let cols: FlowDisplayColumn[] = [];
        this.columns.forEach((col: FlowDisplayColumn) => {
            if(col.visible === true) {
                cols.push(col);
            }
        });
        return cols;
    }

    getColumnPos(column: string): number {
        const cols: string[] = Array.from(this.columns.keys());
        for (let pos = 0 ; pos < cols.length ; pos ++) {
            if (cols[pos] === column) {
                return pos;
            }
        }
        return -1;
    }

    getAncestors(column: string): string[] {
        const ancestors: string[] = [];
        const colArray: string[] = Array.from(this.columns.keys());
        for (let pos = 0 ; pos < colArray.length ; pos ++) {
            if (colArray[pos] === column) {
                break;
            } else {
                ancestors.push(colArray[pos]);
            }
        }
        return ancestors;
    }

    getDescendents(column: string): string[] {
        const descendents: string[] = [];
        const colArray: string[] = Array.from(this.columns.keys());
        for (let pos = colArray.length - 1 ; pos > 0 ; pos --) {
            if (colArray[pos] === column) {
                break;
            } else {
                descendents.push(colArray[pos]);
            }
        }
        return descendents;
    }

    getSelectedItem(): string {
        // based on all columnValues get the internal ID of the matching one
        this.values.forEach((value: {values: string[], displayOrder: number}) => {

        });
        return '';
    }

    getOptions(column: string): any[] {
        const options: Map<string, any> = new Map();
        const colPos: number = this.getColumnPos(column);
        const ancestors: string[] = this.getAncestors(column);

        if (this.hasAncestors(column, ancestors)) {
            options.set('',
                <option
                    selected={true}
                    value={''}
                >
                    Please select ...
                </option>,
            );
            const matchingValues: Map<string, number> = new Map();

            this.values.forEach((value: {values: string[], displayOrder: number}) => {
                // must have matching ancestor values
                if (this.ancestorsMatch(column, ancestors, value.values)) {
                    // must be unique in list
                    if (!matchingValues.has(value.values[colPos])) {
                        matchingValues.set(value.values[colPos], value.displayOrder);
                    }
                    /*
                    if (!options.has(value[colPos])) {
                        options.set(value[colPos],
                        <option
                        value={value[colPos]}
                            selected={this.columnValues.has(column) && this.columnValues.get(column) === value[colPos]}
                        >
                            {value[colPos]}
                        </option>);
                    }
                    */
                }
            });

            // sort them
            let sortedmatchingValues = Array.from(matchingValues);
            if (this.root.getAttribute('sortColumn')) {
                sortedmatchingValues = sortedmatchingValues.sort((a, b) => {
                    if (a[1] > b[1]) { return 1; }
                    if (a[1] < b[1]) { return -1; }
                    return 0;
                });
            }

            sortedmatchingValues.forEach((value) => {
                options.set(value[0],
                    <option
                        value={value[0]}
                        selected={this.columnValues.has(column) && this.columnValues.get(column) === value[0]}
                    >
                        {value[0]}
                    </option>);
            });

        } else {
            options.set('',
                <option
                    value={''}
                    selected={true}
                >
                    Not available ...
                </option>,
            );
        }
        return Array.from(options.values());
    }

    hasAncestors(column: string, ancestors?: string[]): boolean {
        if (!ancestors) {
            ancestors = this.getAncestors(column);
        }
        let matches: boolean = true;
        for (let pos = 0 ; pos < ancestors.length ; pos ++) {
            // must have ancestor value
            if (!this.columnValues.has(ancestors[pos])) {
                matches = false;
            }
        }

        return matches;
    }

    ancestorsMatch(column: string, ancestors: string[], value: string[]): boolean {
        // make sure values for any ancestors match selected items
        let matches: boolean = true;
        for (let pos = 0 ; pos < ancestors.length ; pos ++) {
            // must have ancestor value
            if (this.columnValues.has(ancestors[pos])) {
                // yes ancestor value present
                if (this.columnValues.get(ancestors[pos]) !== value[pos]) {
                    matches = false;
                }
            } else {
               matches = false;
            }
        }

        return matches;
    }

}
