import { MalformedExpression } from "./errors";

export function indices(tokens: string[]) {
    const matches = [] as [string, number][];
    const parens = [] as [number, number][];

    tokens.forEach((token, i) => {
        if (token === "(") return matches.push([token, i]);

        if (token === ")") {
            const [, j] = matches.pop() ?? [];

            if (j) parens.push([j, i]);
        }

        return;
    });

    if (matches.length !== 0) throw new MalformedExpression(`Mismatched parentheses.`);

    return parens;
}

export function closest(term: string[], i: number) {
    const astack = [] as [number, string][];
    const a = [...astack];

    for (let j = i; j > 0; j--) {
        const token = term[j];

        if (token === ")") {
            astack.push([j, token]);
            a.push([j, token]);
        } else if (token === "(") {
            astack.pop();
        }
    }

    const bstack = [] as [number, string][];
    const b = [...astack];

    for (let j = i; j < term.length; j++) {
        const token = term[j];

        if (token === ")") {
            bstack.push([j, token]);
            b.push([j, token]);
        } else if (token === "(") {
            bstack.pop();
        }
    }

    return [(a[a.length - 1]?.[0] ?? i) - 1, (b[b.length - 1]?.[0] ?? i) + 3];
}
