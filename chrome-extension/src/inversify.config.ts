import { Container } from "inversify";
import TYPES from "./types";
import { IBookmarkDataAccess, IBookmarkRepository, BookmarkRepository } from "bb.dataaccess";
import { ChromeFacade } from "./business/chromeFacade";
import { Types as daTypes } from "bb.dataaccess";
import { IBookmarkManager, BookmarkManager } from "./business/bookmarkManager";

var container = new Container();
container.bind<IBookmarkDataAccess>(daTypes.IBookmarkDataAccess).to(ChromeFacade);
container.bind<IBookmarkRepository>(daTypes.IBookmarkRepository).to(BookmarkRepository);
container.bind<IBookmarkManager>(TYPES.IBookmarkManager).to(BookmarkManager);

export default container;