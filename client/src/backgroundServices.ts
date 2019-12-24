import container from './dependencyInjection/inversify.config';
import TYPES from './dependencyInjection/types';

import { IAuthListener } from './authListener';
import { IOmniboxListener } from './omniboxListener';
import { IOptionsListener } from './optionsListener';
import { ISyncListener } from './syncListener';

let authListener = container.get<IAuthListener>(TYPES.IAuthListener);
let omniboxListener = container.get<IOmniboxListener>(TYPES.IOmniboxListener);
let optionsListener = container.get<IOptionsListener>(TYPES.IOptionsListener);
let syncListener = container.get<ISyncListener>(TYPES.ISyncListener);

authListener.addAuthListener();
omniboxListener.addOmniboxListeners();
optionsListener.addOptionsListener();
syncListener.addSyncListener();
