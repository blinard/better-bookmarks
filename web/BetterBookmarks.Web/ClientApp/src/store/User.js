

const userAuthenticatedType = 'USER_AUTHENTICATED';
const initialState = {
    accessToken: null,
    idToken: null,
    expiresAt: 0
};

export const actionCreators = {
    updateUser: (accessToken, idToken, expiresAt) => ({ type: userAuthenticatedType, accessToken, idToken, expiresAt })
};

export const reducer = (state, action) => {
    state = state || initialState;

    if (action.type === userAuthenticatedType) {
        return { ...state, accessToken: action.accessToken, idToken: action.idToken, expiresAt: action.expiresAt };
    }

    return state;
};