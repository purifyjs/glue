import type { Lifecycle } from "@purifyjs/core";

declare global {
    interface DOMStringMap {
        scope?: string;
    }
}

export function css(...params: Parameters<typeof String.raw>) {
    return new CssTemplate(String.raw(...params));
}

export class CssTemplate {
    public readonly raw: string;

    constructor(raw: string) {
        this.raw = raw;
    }

    #sheetCache: CSSStyleSheet | undefined;
    public sheet(): CSSStyleSheet {
        if (this.#sheetCache) {
            return this.#sheetCache;
        }
        const sheet = (this.#sheetCache = new CSSStyleSheet());
        sheet.replaceSync(this.raw);
        return sheet;
    }

    #scopeId: string | undefined;
    public useScope(): Lifecycle.OnConnected {
        if (!this.#scopeId) {
            const scopeId = Math.random().toString(36).slice(2);
            const scopeRaw = `@scope ([data-scope="${scopeId}"]) to ([data-scope]) {${this.raw}}`;
            const scopeSheet = new CSSStyleSheet();
            scopeSheet.replaceSync(scopeRaw);
            document.adoptedStyleSheets.push(scopeSheet);
            this.#scopeId = scopeId;
        }

        return (element) => {
            if (element.dataset.scope === this.#scopeId) return;
            element.dataset.scope = this.#scopeId;
        };
    }
}

const SKIP = 'div[style="display:contents"]';
export function qss<TParent extends string, TCombinator extends "+" | "~" | ">", TChild extends string>(
    parent: TParent,
    combinator: TCombinator,
    child: TChild,
) {
    return `${parent} ${SKIP} ${combinator} ${child}:not(${parent} ${SKIP} ${combinator} ${child} ${child})` as const;
}
