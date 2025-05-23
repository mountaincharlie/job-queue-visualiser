import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import './DataTable.scss';


// data table component made using Material UI's DataGrid
const DataTable = ({ columns=[], rows=[], rowsPerPage=5 }) => {

  const paginationModel = { page: 0, pageSize: rowsPerPage };

  return(
    <Paper sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0, backgroundColor: '#18434E', color: '#a9c7d2' }}
      />
    </Paper>
  );
};

export default DataTable;