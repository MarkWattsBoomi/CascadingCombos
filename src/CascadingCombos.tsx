import React, { CSSProperties } from 'react';

import { eLoadingState, FlowComponent, FlowObjectDataArray, FlowObjectData, FlowOutcome,  FlowDisplayColumn, FlowMessageBox, modalDialogButton } from 'flow-component-model';
import FlowContextMenu from 'flow-component-model/lib/Dialogs/FlowContextMenu';
import CascadingCombo from './CascadingCombo';
import './CascadingCombos.css';
import ValueTree from './ValueTree';

//declare const manywho: IManywho;
declare const manywho: any;

export default class CascadingCombos extends FlowComponent {
    version: string="1.0.0";
    context: any;

    lastContent: any = (<div></div>);
   
    contextMenu: FlowContextMenu;
    messageBox: FlowMessageBox;
   
    // this contains the master copy of the model data, it doesn't change unless data reloaded
    valTree: ValueTree;

    // this contains the master copy of the display colmuns in order, it doesn't change unless data reloaded
    colMap: Map<string,FlowDisplayColumn> = new Map();

    // map of child combo objects
    combos: Map<string,any> = new Map();

    // array of child combo DOM elements
    comboElements: Array<any> = [];

    constructor(props: any) {
        super(props);
        this.flowMoved = this.flowMoved.bind(this);    
    }

    

    // stores / deletes a ref to a table row as it's created or destroyed
    setCombo(key: string, element: any) {
        if(element){
            this.combos.set(key, element);
        }
        else {
            if(this.combos.has(key)) {
                this.combos.delete(key);
            }
        }
    }

    async flowMoved(xhr: any, request: any) {
        let me: any = this;
        if(xhr.invokeType==="FORWARD") {
            if(this.loadingState !== eLoadingState.ready){
                window.setTimeout(function() {me.flowMoved(xhr, request)},500);
            }
            else {
                this.buildCoreTable();
            }
        }
        
    }

    async componentDidMount() {
        //will get this from a component attribute
        await super.componentDidMount();
        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
        // build tree
        this.model.displayColumns.forEach((col: FlowDisplayColumn) => {
            this.colMap.set(col.developerName,col);
        });
        this.buildCoreTable();
        this.forceUpdate();
    }

    
    async componentWillUnmount() {
        await super.componentWillUnmount();
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////
    // reads the model
    // constructs the a flat a map of rows ready for searching, sorting and direct access
    // also builds the display column map
    ///////////////////////////////////////////////////////////////////////////////////////////
    buildCoreTable(){
        this.valTree = new ValueTree(this, this.model.displayColumns);
        this.valTree.addItems(this.model.dataSource);
  
        // we just loaded the core row data, create the child combo objects based on the colMap
        this.buildCombos();
    }

    
    /////////////////////////////////////////////////////////////////////
    // Builds the rowElements from the currentRowMap and forces a redraw
    ////////////////////////////////////////////////////////////////////
    buildCombos() {
        this.comboElements = [];
        //loop over colMap adding child objects
        this.valTree.getColumns().forEach((column: string) => {
            this.comboElements.push(
                <CascadingCombo
                    key={column}
                    columnName={column}
                    root={this}
                    parents={this.valTree.getAncestors(column)}
                    ref={(element: CascadingCombo) => {this.setCombo(column,element)}}
                />
            );
        });
    }

    getOptions(columnName: string) : string[] {
        let items: string[] = [];

        
        return items;
    }

    
    async doOutcome(outcomeName: string, selectedItem? : string) {
        if(this.outcomes[outcomeName]) {
            await this.triggerOutcome(outcomeName);
        }
        else {
            manywho.component.handleEvent(
                this,
                manywho.model.getComponent(
                    this.componentId,
                    this.flowKey,
                ),
                this.flowKey,
                null,
            );
        }
        this.forceUpdate();
    }  

    async selectionChanged(internalId: string) {
        console.log("k="+ internalId);
        let objData: FlowObjectData;
        if(internalId) {
            this.model.dataSource.items.forEach((item: FlowObjectData) => {
                if(item.internalId===internalId){
                    objData = item;
                }
            });
        }
        await this.setStateValue(objData);
        manywho.engine.sync(this.flowKey);
    }
    
    render() {
        
        if(this.loadingState !== eLoadingState.ready) {
            return this.lastContent;
        }
        
        
        

        //handle classes attribute and hidden and size
        let classes: string = "cascoms " + this.getAttribute("classes","");
        let style: CSSProperties = {};
        style.width = "-webkit-fill-available";
        style.height = "-webkit-fill-available";

        if(this.model.visible === false) {
            style.display = "none";
        }
        if(this.model.width) {
            style.width=this.model.width + "px"
        }
        if(this.model.height) {
            style.height=this.model.height + "px"
        }

        if(this.getAttribute("direction","row").toLowerCase()==="column") {
            classes += " cascoms-column ";
        }
        else {
            classes += " cascoms-row ";
        }
             
        let title:  string = this.model.label || "";
        
        this.lastContent = (
            <div
                className={classes}
                style={style}
            >
                <FlowMessageBox
                    parent={this}
                    ref={(element: FlowMessageBox) => {this.messageBox = element}}
                />
                <FlowContextMenu
                    parent={this}
                    ref={(element: FlowContextMenu) => {this.contextMenu = element}}
                />
                {this.comboElements}
            </div>
        );
        return this.lastContent;
    }

}

manywho.component.register('CascadingCombos', CascadingCombos);