import React from 'react';
import { eContentType, FlowDisplayColumn, FlowObjectData, FlowObjectDataArray } from "flow-component-model";
import CascadingCombo from "./CascadingCombo";

export default class ValueTree {
    columns: Map<string,FlowDisplayColumn> = new Map();
    columnValues: Map<string,string>;

    // each value is an object data's display column values in order and keyed on internal id
    values: Map<string,Array<string>>;

    combos: Map<string,CascadingCombo> = new Map();

    constructor(columns: FlowDisplayColumn[]) {
        let cols: Array<FlowDisplayColumn> = columns.sort((a: any,b: any) => {
            switch(true) {
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
    }

    setListener(column: string, client: CascadingCombo) {
        if(client) {
            this.combos.set(column,client);
        }
        else {
            this.combos.delete(column);
        }
        
    }

    addItems(items: FlowObjectDataArray) {
        items.items.forEach((item: FlowObjectData) => {
            this.addItem(item);
        });
    }

    addItem(item: FlowObjectData) {
        let fields: Array<string> = [];
        this.columns.forEach((column: FlowDisplayColumn) => {
            fields.push((item.properties[column.developerName].value as string).trim());
        });
        this.values.set(item.internalId,fields);
    }

    setSelectedValue(column: string, value: string) {
        if(! value || value.length===0) {
            this.columnValues.delete(column);
        }
        else {
            this.columnValues.set(column,value);
        }

        let descendents: Array<string> = this.getDescendents(column);
        descendents.forEach((col: string) => {
            //remove any previous selection on children
            this.columnValues.delete(col);
            if(this.combos.has(col)){
                this.combos.get(col).refresh();
            }
        });
        this.columns.forEach((column: any, key: string) => {

        });
    }

    getColumns() : Array<string> {
        return Array.from(this.columns.keys());
    }

    getColumnPos(column: string) : number {
        let cols: Array<string> = Array.from(this.columns.keys());
        for(let pos = 0 ; pos < cols.length ; pos ++ ) {
            if(cols[pos] === column){
                return pos;
            }
        }
        return -1;
    }

    getAncestors(column: string) : Array<string> {
        let ancestors: Array<string> = [];
        let colArray: Array<string> = Array.from(this.columns.keys());
        for(let pos = 0 ; pos < colArray.length ; pos ++) {
            if(colArray[pos] === column) {
                break;
            }
            else {
                ancestors.push(colArray[pos])
            }
        }
        return ancestors;
    }

    getDescendents(column: string) : Array<string> {
        let descendents: Array<string> = [];
        let colArray: Array<string> = Array.from(this.columns.keys());
        for(let pos = colArray.length -1 ; pos > 0 ; pos --) {
            if(colArray[pos] === column) {
                break;
            }
            else {
                descendents.push(colArray[pos])
            }
        }
        return descendents;
    }

    getSelectedItem() : string {
        //based on all columnValues get the internal ID of the matching one
        this.values.forEach((value: Array<string>) => {

            
        });
        return "";
    }

    getOptions(column: string) : Array<any> {
        let options: Map<string,any> = new Map();
        let colPos: number = this.getColumnPos(column);
        let ancestors: Array<string> = this.getAncestors(column);
        
        if(this.hasAncestors(column, ancestors)) {
            options.set("",
                <option
                    selected={true}
                    value={""}
                >
                    Please select ...
                </option>
            );
            this.values.forEach((value: Array<string>) => {
                // must have matching ancestor values
                if(this.ancestorsMatch(column, ancestors, value)) {
                     // must be unique in list
                    if(!options.has(value[colPos])) {
                        options.set(value[colPos],
                        <option
                        value={value[colPos]}
                            selected={this.columnValues.has(column) && this.columnValues.get(column) === value[colPos]}
                        >
                            {value[colPos]}
                        </option>);
                    }
                } 
            });
        }
        else {
            options.set("",
                <option
                    value={""}
                    selected={true}
                >
                    Not available ...
                </option>
            );
        }
        return Array.from(options.values());
    }

    hasAncestors(column: string, ancestors?: Array<string>) : boolean {
        if(!ancestors) {
            ancestors = this.getAncestors(column);
        }
        let matches: boolean=true;
        for(let pos = 0 ; pos < ancestors.length ; pos ++) {
            // must have ancestor value
            if(!this.columnValues.has(ancestors[pos])) {
                matches=false;
            } 
        }

        return matches;
    }

    ancestorsMatch(column: string, ancestors: Array<string>, value: Array<string> ) : boolean {
        //make sure values for any ancestors match selected items
        let matches: boolean=true;
        for(let pos = 0 ; pos < ancestors.length ; pos ++) {
            // must have ancestor value
            if(this.columnValues.has(ancestors[pos])) {
                //yes ancestor value present
                if(this.columnValues.get(ancestors[pos]) !== value[pos] ) {
                    console.log("column=" + column + " NO pos=" + pos + " '" + this.columnValues.get(ancestors[pos]) +"' != '" +  value[pos] + "'");
                    matches=false;
                }
                else {
                    console.log("column=" + column + " YES pos=" + pos + "    " + this.columnValues.get(ancestors[pos]) +" == " +  value[pos]);
                }
            } 
            else {
                console.log("column=" + column + " NO pos=" + pos + " has ancestor value=" + this.columnValues.has(ancestors[pos]));
                matches=false;
            } 
        }

        return matches;
    }

    
}