// deno-lint-ignore-file no-explicit-any
import { computed, Member, Sync } from "@purifyjs/core";

export type SyncUnroll<T> = Sync<Extract<T, Sync<any>>> extends Extract<T, Sync<any>>
	? SyncUnroll_Recurvesive<Extract<T, Sync<any>>> | SyncUnroll_Normal<Exclude<T, Sync<any>>>
	: SyncUnroll_Normal<T>;

type SyncUnroll_Normal<T> = T extends Sync<infer U> ? SyncUnroll_Normal<U> : T;
type SyncUnroll_Recurvesive<T, SyncExcluded = Exclude<T, Sync<any>>> = [SyncExcluded] extends [never]
	? T extends Sync<infer U> ? SyncUnroll_Recurvesive<U> : T
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

type _1 = SyncUnroll<Sync<Sync<Sync<Sync<"world"> | number>> | sym>>;
type _2 = SyncUnroll<Sync<Sync<Member>>>;
type _3 = SyncUnroll<Sync<Sync<string>>>;
type _4 = SyncUnroll<Sync<Sync<Sync<"world"> | number>> | sym>;
type _5 = SyncUnroll<Sync<Sync<Member>> | sym>;
