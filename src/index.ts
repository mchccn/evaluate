import { MalformedExpression } from "./utils/errors";
import * as parens from "./utils/parens";

const ops: Record<string, (a: number, b: number) => number> = {
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "^": (a, b) => a ** b,
};

const binop = /^((?:[+-])?(?:\d+(?:\.?\d*)?|\.\d+))([*/^+-])((?:[+-])?(?:\d+(?:\.?\d*)?|\.\d+))$/;

function evaluate(expression: string) {
    let tokens = reduce();

    const [, a, op, b] = binop.exec(tokens.join("")) ?? [];

    if (a && op && b) {
        if (!ops[op]) throw new MalformedExpression(`Unknown operator '${op}'.`);

        const result = ops[op](Number(a), Number(b));

        return result;
    }

    function reduce() {
        const tokens = expression
            .replace(/(\d|\))\s*\(/g, "$1 * (")
            .split(/([()^*/+-])/)
            .map((token) => token.trim())
            .filter(($) => !!$);

        const indices = parens.indices(tokens).sort(([ax, ay], [bx, by]) => (ay - ax === by - bx ? ax - bx : ay - ax - by + bx));

        let shift = 0;

        const replacements = [] as [number, number, string][];

        while (indices.length) {
            const [i, j] = indices.shift()!;

            const term = tokens.slice(i - shift, j + 1);

            if (term[0] === "(" && term[term.length - 1] === ")") {
                term.pop();
                term.shift();
            }

            if (binop.test(term.join(""))) {
                const result = evaluate(term.join(""));

                replacements.push([i, j, result.toString()]);
            } else {
                let skip = 0;

                term.forEach((token, i) => {
                    if (skip) return skip--;

                    if (/^[\^*/]$/.test(token)) {
                        const [a, b] = parens.closest(term, i);

                        term.splice(a, 0, "(");
                        term.splice(b, 0, ")");

                        skip = b;
                    }

                    return;
                });
            }

            console.log(term.join(" "));
        }

        replacements
            .sort(([ax, ay], [bx, by]) => (ay - ax === by - bx ? ax - bx : ay - ax - by + bx))
            .reverse()
            .forEach(([i, j, result]) => {
                tokens.splice(i, j - i, result);
            });

        return tokens;
    }

    if (tokens.includes("(")) tokens = reduce();

    console.log(tokens.join(" "));

    return 0;
}

evaluate("1 + 1(10 + 2(10 / 5(2 + 2))) + 2(2 * 3)");

export default evaluate;
module.exports = evaluate;
exports.default = evaluate;
