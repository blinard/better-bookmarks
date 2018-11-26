import {addAuthListeners} from './authListener'
import {addOmniboxListeners} from './omniboxListeners'
import {addOptionsListeners} from './optionsListeners';

addOmniboxListeners();
addAuthListeners();
addOptionsListeners();