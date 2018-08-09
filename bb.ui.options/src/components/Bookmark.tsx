// src/components/Bookmark.tsx

import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

function Bookmark(props: any) {
    return (
        <Grid container={true} spacing={8}>
            <Grid item={true}>
                <Typography variant="body1" gutterBottom={true}>
                    One
                </Typography>
            </Grid>
            <Grid item={true}>
                <Typography variant="body1" gutterBottom={true}>
                    Two
                </Typography>
            </Grid>
            <Grid item={true}>
                <Typography variant="body1" gutterBottom={true}>
                    Three
                </Typography>
            </Grid>
        </Grid>
    );
}

export default Bookmark;