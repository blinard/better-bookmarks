import {ChromeFacade} from './business/chromeFacade';

namespace Background {
    let chromeFacade = new ChromeFacade();
    chromeFacade.addOmniboxListeners();
}
