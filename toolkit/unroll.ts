// deno-lint-ignore-file no-explicit-any
import { computed, Member, Sync } from "@purifyjs/core";

export type SyncUnroll<T> = Sync<T> extends T
	? SyncUnroll_Infinite<Extract<T, Sync<any>>> | SyncUnroll_Finite<Exclude<T, Sync<any>>>
	: SyncUnroll_Finite<T>;

type SyncUnroll_Finite<T> = T extends Sync<infer U> ? SyncUnroll_Finite<U> : T;
type SyncUnroll_Infinite<T, SyncExcluded = Exclude<T, Sync<any>>> = [SyncExcluded] extends [never]
	? T extends Sync<infer U> ? SyncUnroll_Infinite<U> : T
	: SyncExcluded;

export function unroll<T>(signal: T): Sync<SyncUnroll<T>>;
export function unroll(signal: Sync<unknown>) {
	return computed(() => {
		let value: unknown = signal;
		while (value instanceof Sync) {
			value = value.get();
		}
		return value;
	});
}

// Tests
type sym = typeof sym;
declare const sym: unique symbol;

declare const test_1: SyncUnroll<Sync<Sync<Sync<Sync<"world"> | number>> | sym>>;
test_1 satisfies "world" | number | sym;
declare const test_2: SyncUnroll<Sync<Sync<Member>>>;
test_2 satisfies Member;
declare const test_3: SyncUnroll<Sync<Sync<string>>>;
test_3 satisfies string;
declare const test_4: SyncUnroll<Sync<Sync<Sync<"world"> | number>> | sym>;
test_4 satisfies "world" | number | sym;
declare const test_5: SyncUnroll<Sync<Sync<Member>> | sym>;
test_5 satisfies Member | sym;
