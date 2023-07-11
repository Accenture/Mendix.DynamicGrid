/* eslint-disable */
/* mappers for SelectedRowsSet:
{
  toString: (set) => <String>,  // Set to String
  fromString: (str) => <Set>    // Set from String
}
*/

// default mapper for SelectedRowsSet: Json array, e.g.: '[1,2,3]'
export const SelectedRowsSetMapper_JsonArray = {
  toString: (set) => JSON.stringify(Array.from(set)),
  fromString: (str) => new Set(str ? JSON.parse(str) : [])
}

// mapper for pipes serialization, e.g.: '|1|2|3|'; empty: '|'
export const SelectedRowsSetMapper_Pipes =
{
  toString: (set) => set.size ? `|${Array.from(set).join('|')}|` : '|',
  fromString: (str) => new Set(str.split('|').slice(1, -1))
}
