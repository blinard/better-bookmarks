import {addAuthListeners} from './authListener';
import {addOmniboxListeners} from './omniboxListeners';
import {addOptionsListeners} from './optionsListeners';
import {addSyncListeners} from './syncListeners';

addOmniboxListeners();
addAuthListeners();
addOptionsListeners();
addSyncListeners();