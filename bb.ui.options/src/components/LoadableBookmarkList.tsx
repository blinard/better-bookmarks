// src/components/provideBookmarkMap.tsx

import * as React from 'react';
import { Loadable } from 'react-loadable';
import Loading from './Loading';
import axios from 'axios';
import BookmarkList from './BookmarkList';

import { BookmarkMap } from '@bit/blinard.better-bookmarks.bb.models';
import { IBookmarkRepository } from '@bit/blinard.better-bookmarks.bb.dataaccess';
import container from '../inversify.config';

const LoadableBookmarkList = LoadableExport({
    loader: {
        bookmarkData: () => {
            const bookmarkRepo = container.get<IBookmarkRepository>();
            return bookmarkRepo.getAll();
        }
    },
    render(loaded: any, props: any) {
        const bookmarkData = loaded.bookmarkData;
        return <BookmarkList bookmarks={bookmarkData} {...props} />;
    }
});

// () {
//     // Load BookmarkMap
//     let bookmarks: BookmarkMap;
//     const bookmarkRepository = container.get<IBookmarkRepository>();
//     bookmarkRepository.getAll()

//     return (props: any) => {
//         return <UxComponent bookmarks={bookmarks} {...props} />
//     };
// }

export default LoadableBookmarkList;