import { computed, ref, Sync } from "@purifyjs/core";

export function awaited<T>(
    promise: Promise<T>
): Sync<T | null>;
export function awaited<T, const U>(
    promise: Promise<T>,
    until: U,
): Sync<T | U>;
export function awaited(
    promise: Promise<unknown>,
    until: unknown = null,
): Sync<unknown> {
    const state = ref(until);
    promise.then((value) => state.set(value));
    promise.catch(console.error);
    return computed(() => state.get());
}
