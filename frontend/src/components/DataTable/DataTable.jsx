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
        pageSizeOptions={[5, 10, 20, 50, 100]}
        sx={{ 
          border: 0, 
          backgroundColor: '#18434E', 
          color: '#a9c7d2',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#000 !important',
            color: '#18434E',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
          },
          '& .MuiTablePagination-root, .MuiIconButton-root': {
            color: '#a9c7d2',
          },
        }}
      />
    </Paper>
  );
};

export default DataTable;