import { atom } from 'nanostores';

export type LikedItemsState = {
    items: string[];
    likesCounts: Record<string, number>;
    errors: string[];
    isLoading: boolean;
}

export const likedItemsState = atom<LikedItemsState>({ items: [], likesCounts: {}, errors: [], isLoading: false });

export function setLikedItems(items: string[]): void {
    const state = likedItemsState.get();
    likedItemsState.set({ ...state, items });
}

export function setLikesCounts(likesCounts: Record<string, number>): void {
    const state = likedItemsState.get();
    likedItemsState.set({ ...state, likesCounts });
}

export function addLikedItem(item: string): void {
    const state = likedItemsState.get();
    const likesCount = state.likesCounts[item] || 0;
    state.likesCounts[item] = likesCount + 1;
    likedItemsState.set({ 
        ...state, 
        items: [...state.items, item], 
        likesCounts: { ...state.likesCounts } 
    });
}

export function removeLikedItem(item: string): void {
    const state = likedItemsState.get();
    const likesCount = state.likesCounts[item] || 0;
    state.likesCounts[item] = likesCount - 1;
    likedItemsState.set({ 
        ...state, 
        items: state.items.filter(i => i !== item), 
        likesCounts: { ...state.likesCounts } 
    });
}

export function addLikedItemsError(error: string): void {
    const state = likedItemsState.get();
    likedItemsState.set({ ...state, errors: [...state.errors, error] });
}

export function setIsLoading(isLoading: boolean): void {
    const state = likedItemsState.get();
    likedItemsState.set({ ...state, isLoading });
}