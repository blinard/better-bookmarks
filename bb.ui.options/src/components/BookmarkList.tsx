import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Bookmark from './Bookmark';
import { BookmarkMap } from '@bit/blinard.better-bookmarks.bb.models';

export interface IBookmarkListProps {
    bookmarks: BookmarkMap
}

class BookmarkList extends React.Component<IBookmarkListProps, {}, any> {
    constructor(props: IBookmarkListProps, context?: any) {
        super(props, context);
    }

    public componentDidMount() {
        // do something
    }

    public render() {
        return (
            
            <div style={{ padding: 8 }}>
                <Grid container={true} spacing={8}>
                    <Bookmark />
                </Grid>
            </div>
        );
    }
}

export default BookmarkList;