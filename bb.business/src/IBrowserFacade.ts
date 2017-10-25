import { OmniboxObservables } from "bb.models";

export interface IBrowserFacade {
    addOmniboxListeners(): OmniboxObservables
    getCurrentTabUrl(): Promise<string>
    navigateCurrentTab(url: string): void
    postNotification(title: string, message: string, key?: string, iconUrl?: string): void
}
