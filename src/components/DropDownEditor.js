/* eslint-disable */
import { createElement, useState } from 'react';

export default function DropDownEditor({ key, options, row, onRowChange }) {
  return (
    <select
      value={row[key]}
      onChange={(event) => {
        const vals = { ...row };
        vals[key] = event.target.value;
        onRowChange(vals, true);
      }}
      autoFocus
    >
      {options.map((title) => (
        <option key={title} value={title}>
          {title}
        </option>
      ))}
    </select>
  );
}