import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

export interface IGuidFactory {
    getGuid(): string
}

@injectable()
export class GuidFactory implements IGuidFactory {

    constructor() {}

    getGuid(): string {
        return uuidv4();
    }
}