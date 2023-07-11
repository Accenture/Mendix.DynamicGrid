/* eslint-disable */
import { createElement, useState } from "react";
import DataGrid, { SelectColumn, TextEditor, SelectCellFormatter, HeaderRenderer } from "react-data-grid";
import DropDownEditor from "./DropDownEditor";
import { SelectedRowsSetMapper_JsonArray } from "./SelectedRowsSetMappers";
import format from 'date-fns/format'



const ROW_HEIGHT_HEADER = 90;
const ROW_HEIGHT = 55;

function DynamicGridComponent(props) {

  // helpers
  const canGet = prop => prop && prop.status === "available";
  const canSet = prop => prop && prop.status === "available" && !prop.readOnly;
  const canExe = prop => prop && prop.canExecute;
  const tryGet = (prop, def) => (canGet(prop) ? prop.value : def);
  const trySet = (prop, val) => {
    if (canSet(prop)) prop.setValue(val);
  };
  const tryExe = prop => {
    if (canExe(prop)) prop.execute();
  };

  // props
  const selectedRowsSetMapper = props.selectedRowsSetMapper || SelectedRowsSetMapper_JsonArray; // JsonArray by default

  const IN_ROWS = tryGet(props.IN_ROWS, "[]");
  const IN_COLS = tryGet(props.IN_COLS, "[]");

  const IN_USE_SELECT_COL = tryGet(props.IN_USE_SELECT_COL, false);
  const IN_USE_ACTION_COL = tryGet(props.IN_USE_ACTION_COL, false);
  const IN_USE_SUBHEADERS = tryGet(props.IN_USE_SUBHEADERS, false);

  const {
    INOUT_SELECTED_ROWS,
    OUT_SELECT_ALL_CHECKED,
    ON_SELECT_ALL_CHANGE,
    ON_SELECTED_ROWS_CHANGE,

    INOUT_SORT_COL,
    ON_SORT_COL_CHANGE,

    OUT_CHANGE,
    ON_CHANGE,

    IN_ACTION_ROWS_DS,
    IN_ACTION_ROW_ID,
    IN_ACTION_ROW_WIDGET,

    IN_HEADER_COLS_DS,
    IN_HEADER_COL_ID,
    IN_HEADER_COL_WIDGET
  } = props;

  // // (debug: loading props)
  // const _loading = Object.keys(props).filter(k => typeof props[k] === 'object' && props[k].hasOwnProperty('status') && props[k].status !== 'available');
  // if (_loading.length) { console.log("### ### loading props: ", _loading); }

  // action column
  const canUseActionCol =
    IN_USE_ACTION_COL && canGet(IN_ACTION_ROWS_DS) && IN_ACTION_ROW_ID && IN_ACTION_ROW_WIDGET ? true : false;
  const actionColFormatter = canUseActionCol
    ? props => {
      const rowIdStr = props.row._ID.toString();
      const rowItem = IN_ACTION_ROWS_DS.items.find(i => {
        const rowItemId = IN_ACTION_ROW_ID.get(i);
        return rowItemId && rowItemId.value === rowIdStr;
      });
      return rowItem ? IN_ACTION_ROW_WIDGET.get(rowItem) : null;
    }
    : null;


  // headers
  const canUseCustomHdr =
    IN_USE_SUBHEADERS && canGet(IN_HEADER_COLS_DS) && IN_HEADER_COL_ID && IN_HEADER_COL_WIDGET ? true : false;
  const hdrRendererImpl = (props, custom) => {
    return (
      <div>
        <div title={props.column.name}>{HeaderRenderer({ ...props, isCellSelected: false })}</div>
        <div className="rgd-subheader-wrapper">{custom}</div>
      </div>
    );
  };
  const hdrRendererDefault = props => hdrRendererImpl(props);
  const hdrRendererCustom = props => {
    const colIdStr = props.column.key.toString();
    const colItem = IN_HEADER_COLS_DS.items.find(i => {
      const colItemId = IN_HEADER_COL_ID.get(i);
      return colItemId && colItemId.value === colIdStr;
    });
    const custom = colItem ? IN_HEADER_COL_WIDGET.get(colItem) : null;
    return hdrRendererImpl(props, custom);
  };

  const classNameCellFormatter = props => {
    if( props.row.cssClasname !== undefined) {
      return <div class={props.row.cssClasname}>{props.row[props.column.key]}</div> 
    }else {
      return <div>{props.row[props.column.key]}</div>
    }
  }

  // prepare rows and cols
  let rows = JSON.parse(IN_ROWS);
  let cols = JSON.parse(IN_COLS).map(col => {
    if (col.editable) col.editor = TextEditor;
    if (col.options) col.editor = p => DropDownEditor({ key: col.key, options: col.options, ...p });
    if (col.action && canUseActionCol) col.formatter = actionColFormatter;
    col.headerRenderer = col.subheader && canUseCustomHdr ? hdrRendererCustom : hdrRendererDefault;
    if (col.cssClasname !== undefined) col.formatter = classNameCellFormatter;
    // format dates
    if (col.dateFormat) col.formatter = props => format(new Date(props.row[col.key]), col.dateFormat);
    return col;
  });

  if (!IN_USE_ACTION_COL) cols = cols.filter(c => !c.action);
  if (!cols.length) return "";
  const col1st = cols[0];

  // selection column
  if (IN_USE_SELECT_COL) {
    SelectColumn.headerRenderer = props => {
      return (canSet(OUT_SELECT_ALL_CHECKED) || canExe(ON_SELECT_ALL_CHANGE)) ? (
        <SelectCellFormatter
          aria-label="Select All"
          isCellSelected={props.isCellSelected}
          value={props.allRowsSelected}
          onChange={(checked, isShiftClick) => {
            // skip default impl; instead delegate to configured handlers
            //props.onAllRowsSelectionChange(checked, isShiftClick);
            trySet(OUT_SELECT_ALL_CHECKED, checked);
            tryExe(ON_SELECT_ALL_CHANGE);
          }}
        />
      ) : null;
    };
    cols = [SelectColumn].concat(cols);
  }

  // selected rows
  const selectedRows = selectedRowsSetMapper.fromString(tryGet(INOUT_SELECTED_ROWS, ""));
  function onSelectedRowsChange(selectedRows) {
    trySet(INOUT_SELECTED_ROWS, selectedRowsSetMapper.toString(selectedRows));
    tryExe(ON_SELECTED_ROWS_CHANGE);
  }

  // on change
  function onRowsChange(rows, data) {
    const row = rows[data.indexes[0]];
    const col = data.column;
    const key = col.key;
    trySet(OUT_CHANGE, JSON.stringify({ rowId: row._ID, columnKey: key, value: row[key] }));
    tryExe(ON_CHANGE);
  }

  // sorting
  const sc = tryGet(INOUT_SORT_COL, "");
  const [sortColumns, setSortColumns] = canGet(INOUT_SORT_COL)
    ? useState([sc ? JSON.parse(sc) : { columnKey: col1st.key, direction: "ASC" }])
    : [[], () => { }];
  function onSortColumnsChange(sortCols) {
    // hack: no multi-col sorting; take the last one only
    const sortColsLast = sortCols.slice(-1);
    // hack: sorting is always determined:
    // replace 3 steps cycle (ASC => DESC => empty)
    // by 2 steps cycle (ASC <=> DESC)
    const sortColsNew = sortColsLast.length
      ? sortColsLast
      : [{ columnKey: sortColumns[0].columnKey, direction: "ASC" }];
    setSortColumns(sortColsNew);

    trySet(INOUT_SORT_COL, JSON.stringify(sortColsNew[0]));
    tryExe(ON_SORT_COL_CHANGE);
  }

  // render
  return (
    <DataGrid
      className={IN_USE_SUBHEADERS ? "rdg-light rdg-subheaders" : "rdg-light"}
      headerRowHeight={IN_USE_SUBHEADERS ? ROW_HEIGHT_HEADER : undefined}
      rowHeight={ROW_HEIGHT}
      columns={cols}
      rows={rows}
      rowKeyGetter={row => row._ID.toString()}
      onRowsChange={onRowsChange}
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      sortColumns={sortColumns}
      onSortColumnsChange={onSortColumnsChange}
    />
  );
}

export default DynamicGridComponent;