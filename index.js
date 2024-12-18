const cells = document.getElementsByClassName("cell");
const inputDisplay = document.getElementById("input");
const expressionDisplay = document.getElementById("expression");

const calculate = (expression) => {
    expression = expression.split(" ");
    console.log(expression);

    // const x = [...expression].toSpliced(0, 3, expression[0] * expression[2])
    // expression = x
    // const y = [...expression].toSpliced(2, 5, expression[2] * expression[4])
    // expression = y
    // const z = [...expression].toSpliced(0, 3, expression[0] + expression[2])
    // console.log(x, y, z)

    const priority = { x: 5, "/": 6, "+": 4, "-": 3 };
    const operators = expression.filter(
        (item) => item !== 0 && !parseInt(item)
    );
    const compareFn = (x, y) => {
        return priority[y] - priority[x];
    };
    operators.sort(compareFn);
    operators.forEach((operator) => {
        const index = expression.findIndex((item) => item === operator);
        const start = index - 1;
        const end = index + 2;
        let evaluation;

        switch (operator) {
            case "/":
                evaluation =
                    parseFloat(`${expression[start]}`) /
                    parseFloat(`${expression[end - 1]}`);
                break;
            case "x":
                evaluation =
                    parseFloat(`${expression[start]}`) *
                    parseFloat(`${expression[end - 1]}`);
                break;
            case "+":
                evaluation =
                    parseFloat(`${expression[start]}`) +
                    parseFloat(`${expression[end - 1]}`);
                break;
            case "-":
                evaluation =
                    parseFloat(`${expression[start]}`) -
                    parseFloat(`${expression[end - 1]}`);
                break;
            default:
                break;
        }
        // console.log([...expression].toSpliced(start, 3, evaluation));

        expression = [...expression].toSpliced(start, 3, evaluation);
    });
    return expression;
};

function handleClick() {
    const input = this.innerText;

    const expression = expressionDisplay.innerText;
    switch (input) {
        case "=":
            if (!expression.includes("=")) {
                const [result] = calculate(expression);
                inputDisplay.textContent = result;
                expressionDisplay.textContent += ` = ${result}`;
            }
            break;
        case "AC":
            inputDisplay.textContent = "";
            expressionDisplay.textContent = "";
            break;
        default:
            if (
                !["+", "-", "x", "/"].includes(expression.at(-1)) &&
                !["+", "-", "x", "/"].includes(input)
            ) {
                inputDisplay.textContent += input;
            } else {
                inputDisplay.textContent = input;
            }
            if (!expression.includes("=")) {
                if (["+", "-", "x", "/"].includes(input))
                    expressionDisplay.textContent += ` ${input} `;
                else expressionDisplay.textContent += input;
            } else {
                const [prevResult] = expression.match(/(?<=\=\s*)-?\d+\.?\d*/);
                expressionDisplay.textContent = `${prevResult} ${input} `;
            }
    }
}

[...cells].forEach((cell) => {
    cell.addEventListener("click", handleClick);
});
