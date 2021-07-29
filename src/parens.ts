import { MalformedExpression } from "./errors";

export function indices(tokens: string[]) {
    const matches = [] as [string, number][];
    const parens = [] as [opening: number, closing: number, depth: number][];

    let depth = 0;

    tokens.forEach((token, i) => {
        if (token === "(") {
            depth++;
            return matches.push([token, i]);
        }

        if (token === ")") {
            const [, j] = matches.pop() ?? [];

            if (j) parens.push([j, i, depth--]);
        }

        return;
    });

    if (matches.length !== 0) throw new MalformedExpression(`Mismatched parentheses.`);

    return parens;
}
