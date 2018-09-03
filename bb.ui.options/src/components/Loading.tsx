// src/components/Loading.tsx

import * as React from 'react';

function Loading(props: any) {
    if (props.error) {
        return <div>Error! <button onClick={ props.retry }>Retry</button></div>;
    } 

    if (props.pastDelay) {
        return <div>Loading...</div>;
    } 

    return null;
}

export default Loading;