import { MalformedExpression } from "./errors";
import * as parens from "./parens";

const ops: Record<string, (a: number, b: number) => number> = {
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "^": (a, b) => a ** b,
};

const number = /^((?:[+-])?(?:\d+(?:\.?\d*)?|\.\d+))$/;

const evaluate = (expression: string) =>
    (function reduce(): number {
        const tokens = expression
            .replace(/(\d|\))\s*\(/g, "$1 * (")
            .replace(/e/gi, Math.E.toString())
            .replace(/pi|π/gi, Math.PI.toString())
            .split(/([()^*/+-])/)
            .map((token) => token.trim())
            .filter(($) => !!$);

        tokens.forEach((token) => {
            if (!number.test(token) && !/^[()^*/+-]$/.test(token)) {
            }
        });

        const indices = parens.indices(tokens).sort(([ax, ay], [bx, by]) => (ay - ax === by - bx ? ax - bx : ay - ax - by + bx));

        const [i, j] = indices.find(([, , d]) => d === Math.max(...indices.map(([, , d]) => d))) ?? [];

        const term = typeof i !== "undefined" && typeof j !== "undefined" ? tokens.slice(i + 1, j) : tokens;

        term.forEach((token, index) => {
            const a = term[index - 1];
            const b = term[index + 1];

            if (/^[\^*/+-]$/.test(token)) {
                if (!a || !b) throw new MalformedExpression(`Missing operand on operator '${token}'.`);

                if (!number.test(a) || !number.test(b)) throw new MalformedExpression(`Invalid operand on operator '${token}'.`);
            }
        });

        function execute(operators: string[]) {
            while (operators.some((op) => term.includes(op)))
                for (const [index, token] of Object.entries(term)) {
                    if (operators.includes(token)) {
                        const a = term[+index - 1];
                        const b = term[+index + 1];

                        const results = ops[token](Number(a), Number(b));

                        term.splice(+index - 1, 3, results.toString());

                        break;
                    }
                }
        }

        execute(["^"]);

        execute(["*", "/"]);

        execute(["+", "-"]);

        if (typeof i !== "undefined" && typeof j !== "undefined") tokens.splice(i, j - i + 1, term.join(""));

        expression = tokens.join(" ");

        if (!number.test(expression)) return reduce();

        return Number(expression);
    })();

export default evaluate;
module.exports = evaluate;
exports.default = evaluate;
