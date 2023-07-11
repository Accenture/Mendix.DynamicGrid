/* eslint-disable */
import { createElement } from "react";
import "./ui/DynamicGrid.css";

import DynamicGridComponent from './components/DynamicGridComponent';
import { SelectedRowsSetMapper_Pipes } from './components/SelectedRowsSetMappers';

export function DynamicGrid(props) {
    props.selectedRowsSetMapper = SelectedRowsSetMapper_Pipes;
    return (
        <DynamicGridComponent {...props} />
    );
}
