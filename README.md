# DynamicGrid
Mendix wrapper for react-data-grid. The grid takes both the data and column metadata in JSON format as input, allowing user to dynamically build the grid definition. The data input as JSON can be useful when working with non-Mendix storage. The widget makes it easy to implement dynamic sorting and also allows for cell edition and row selection.

## Features
- dynamic column definition in JSON format
- data provided in JSON format
- cell editing
- dynamic sorting
- row selection
- action column support

## Usage
To use, provide data source attributes. Others are optional.

### Data Source
- `Columns JSON` - defines columns and their attributes. See example below:
   ```json
   [
     {
       "key":"_ID",
       "name":"ID",
       "sortable":true
     },
     {
       "key":"desc",
       "name":"Description",
       "editable":true,
       "sortable":true
     }
   ]
   ```
   `editable` and `sortable` attributes are optional.
  
- `Rows JSON` - defines data displayed in rows. The key of the attribute has to match the one provided in column definition. See example below:
   ```json
   [
     {
       "_ID":1,
       "desc":"Row 1"
     },
     {
       "_ID":2,
       "desc":"Row 2"
     }
   ]
   ```
   
### Editing (optional)
- `Changed value cell JSON` - output attribute that records information about change made in JSON format:
   ```json
   {
     "rowId": 1,
     "columnKey": "desc",
     "value": "updated value"
   }
   ```
- `On cell value change` - action to handle the change that was made.

### Sorting (optional)
- `Sort column JSON` - an input/output attribute that holds information about current sorting column and direction:
   ```json
   {
     "columnKey": "_ID",
     "direction": "ASC"
   }
   ```
- `On sort column change` - action to handle the sorting change.

### Selection (optional)
- `Use selection column` - boolean value that controls display of the selection column.
- `Selected rows string` - attribute that holds string with currently selected IDs seperated by `|`. Example:
  ```
  |1|2|3|
  ```
  When no row is selected, attribute is set to `|`.
- `On selected rows change` - action to handle change of selected rows (selection or deselection of one of the rows).
- `Select All checked` - attribute that keeps the state of the `Select All` checkbox.
- `On Select All changed` - action to handle change of the `Select All` checkbox (selection or deselection of all rows)

### Action column (optional)
- `Use action column` - boolean value that controls display of the action column. Useful when additional actions/buttons per each row are required.
- `Action column rows` - data source attribute for action cell of the row. For performance purposes, it is recommended to use simple object that holds the ID of the rows object.

### Custom subheaders (optional)
- `Use Subheaders` - boolean value that controls display of the subheaders. Useful when per-column filters are required.
- `Subheader columns` - data source attribute for subheader of the column.
