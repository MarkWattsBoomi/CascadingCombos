import React, { CSSProperties } from 'react';
import CascadingCombos from './CascadingCombos';

export default class CascadingCombo extends React.Component<any, any> {

    select: HTMLSelectElement;

    constructor(props: any) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
        this.setSelect = this.setSelect.bind(this);
    }

    // this is triggered by the ValueTree to tell us a parent combo's value changed
    refresh() {
        this.select.selectedIndex = 0;
        this.forceUpdate();
    }

    setSelect(select: HTMLSelectElement) {
        this.select = select;
    }

    valueChanged() {
        const root: CascadingCombos = this.props.root;
        const value: string = this.select?.options[this.select.selectedIndex].value;
        root.valTree.setSelectedValue(this.props.columnName, value);
    }

    componentDidMount() {
        const root: CascadingCombos = this.props.root;
        //root.valTree.setListener(this.props.columnName, this);
    }

    componentWillUnmount() {
        const root: CascadingCombos = this.props.root;
        //root.valTree.setListener(this.props.columnName, undefined);
    }

    gotFocus(e: any) {
        //e.currentTarget.selectedIndex = -1; 
    }

    render() {
        const root: CascadingCombos = this.props.root;
        const options: any[] = root.valTree.getOptions(this.props.columnName);
        let disabled: boolean = true;
        if (root.valTree.hasAncestors(this.props.columnName)) {
            disabled = false;
        }
        let className: string = "cascom";
        let style: CSSProperties = {};
        if(this.props.visible===false){
            style.visibility="hidden"
        }
        return(
            <div
                className={className}
                style={style}
            >
                <div
                    className="cascom-title"
                >
                    <span
                        className="cascom-title-label"
                    >
                        {root.colMap.get(this.props.columnName).label + ':'}
                    </span>
                </div>
                <div
                    className="cascom-sel"
                >
                    <select
                        className="cascom-select"
                        disabled={disabled}
                        onChange={this.valueChanged}
                        onFocus={this.gotFocus}
                        ref={(element: HTMLSelectElement) => {this.select = element; }}
                    >
                        {options}
                    </select>
                </div>

            </div>
        );
    }
}
