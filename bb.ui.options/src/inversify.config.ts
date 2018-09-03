import { Container } from "inversify";
import { IBookmarkDataAccess, IBookmarkRepository, BookmarkRepository } from "@bit/blinard.better-bookmarks.bb.dataaccess";
import { ChromeFacade } from "@bit/blinard.better-bookmarks.bb.browserfacades-chrome";
import { DataAccessTypes } from "@bit/blinard.better-bookmarks.bb.dataaccess";
import { IBookmarkManager, BookmarkManager, IBrowserFacade } from "@bit/blinard.better-bookmarks.bb.business";
import { BusinessTypes } from "@bit/blinard.better-bookmarks.bb.business";

const container = new Container();
container.bind<IBookmarkDataAccess>(DataAccessTypes.IBookmarkDataAccess).to(ChromeFacade);
container.bind<IBookmarkRepository>(DataAccessTypes.IBookmarkRepository).to(BookmarkRepository);
container.bind<IBookmarkManager>(BusinessTypes.IBookmarkManager).to(BookmarkManager);
container.bind<IBrowserFacade>(BusinessTypes.IBrowserFacade).to(ChromeFacade);
export default container;