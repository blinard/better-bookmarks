import { Container } from "inversify";
import { IBookmarkDataAccess, IBookmarkRepository, BookmarkRepository } from "bb.dataaccess";
import { ChromeFacade } from "bb.browserfacades.chrome";
import { Types as daTypes } from "bb.dataaccess";
import { IBookmarkManager, BookmarkManager, IBrowserFacade } from "bb.business";
import { Types as busTypes } from "bb.business";

var container = new Container();
container.bind<IBookmarkDataAccess>(daTypes.IBookmarkDataAccess).to(ChromeFacade);
container.bind<IBookmarkRepository>(daTypes.IBookmarkRepository).to(BookmarkRepository);
container.bind<IBookmarkManager>(busTypes.IBookmarkManager).to(BookmarkManager);
container.bind<IBrowserFacade>(busTypes.IBrowserFacade).to(ChromeFacade);
export default container;