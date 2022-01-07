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
        this.forceUpdate();
        this.select.selectedIndex = 0;
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
        root.valTree.setListener(this.props.columnName, this);
    }

    componentWillUnmount() {
        const root: CascadingCombos = this.props.root;
        root.valTree.setListener(this.props.columnName, undefined);
    }

    render() {
        const root: CascadingCombos = this.props.root;
        const options: any[] = root.valTree.getOptions(this.props.columnName);
        let disabled: boolean = true;
        if (root.valTree.hasAncestors(this.props.columnName)) {
            disabled = false;
        }
        return(
            <div
                className="cascom"
            >
                <div
                    className="cascom-title"
                >
                    <span
                        className="cascom-title-label"
                    >
                        {root.colMap.get(this.props.columnName).label + ':'}
                    </span>
                    <span
                        style={{color: 'red', marginRight: '1rem'}}
                    >
                        {'*'}
                    </span>
                </div>
                <div
                    className="cascom-sel"
                >
                    <select
                        className="cascom-select"
                        disabled={disabled}
                        onChange={this.valueChanged}
                        onFocus={(event: any) => {event.target.selectedIndex = -1; }}
                        ref={(element: HTMLSelectElement) => {this.select = element; }}
                    >
                        {options}
                    </select>
                </div>

            </div>
        );
    }
}
