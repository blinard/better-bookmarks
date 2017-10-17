import { Container } from "../node_modules/inversify/dts/inversify";
import TYPES from "./types";
import { IBookmarkDataAccess } from "./dataAccess/IBookmarkDataAccess";
import { ChromeFacade } from "./business/chromeFacade";
import { IBookmarkRepository, BookmarkRepository } from "./dataAccess/bookmarkRepository";
import { IBookmarkManager, BookmarkManager } from "./business/bookmarkManager";

var container = new Container();
container.bind<IBookmarkDataAccess>(TYPES.IBookmarkDataAccess).to(ChromeFacade);
container.bind<IBookmarkRepository>(TYPES.IBookmarkRepository).to(BookmarkRepository);
container.bind<IBookmarkManager>(TYPES.IBookmarkManager).to(BookmarkManager);

export default container;