import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const List = () => {
    return (
        <div>
            <DataGrid
                columns={col}
                rows={data}
                checkboxSelection
                onRowSelectionModelChange={(e) => console.log('select event ', e)}
                getRowId={(row) => row.number}
            />
        </div>
    );
};

export default List;