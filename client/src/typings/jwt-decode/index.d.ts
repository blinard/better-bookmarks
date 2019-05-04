declare namespace jwt_decode {
    interface Options {
        header: boolean;
    }
}

declare function jwt_decode<TTokenDto>(token: string, options?: jwt_decode.Options): TTokenDto;

export default jwt_decode;
export as namespace jwt_decode;
