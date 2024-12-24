const cells = document.getElementsByClassName("cell");
const inputDisplay = document.getElementById("input");
const expressionDisplay = document.getElementById("expression");
const history = document.querySelector("#history-screen p");
const sound = document.getElementById("sound");
let resultArray = [];
const maxHistory = 10;
const operators = ["+", "-", "x", "/"];

const calculate = (expression) => {
    console.log(expression);
    expression = expression.split(" ");
    console.log(expression);

    // const x = [...expression].toSpliced(0, 3, expression[0] * expression[2])
    // expression = x
    // const y = [...expression].toSpliced(2, 5, expression[2] * expression[4])
    // expression = y
    // const z = [...expression].toSpliced(0, 3, expression[0] + expression[2])
    // console.log(x, y, z)

    const priority = { x: 5, "/": 6, "+": 4, "-": 3 };
    const operators = expression.filter((item) =>
        Object.keys(priority).includes(item)
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

const erase = () => {
    inputDisplay.textContent = "";
    expressionDisplay.textContent = "";
};

function handleClick() {
    const input = this.innerText;
    sound.currentTime = 0;
    sound.play();

    const expression = expressionDisplay.innerText;
    switch (input) {
        case "":
            const inputText = inputDisplay.innerText;
            const inputAfterErase = inputText.slice(0, inputText.length - 1);
            inputDisplay.innerText = inputAfterErase || "\n";

            let expressionAfterErase;
            if (operators.includes(expression.at(-2))) {
                expressionAfterErase = expression.slice(
                    0,
                    expression.length - 2
                );
            } else {
                expressionAfterErase = expression.slice(
                    0,
                    expression.length - 1
                );
            }
            expressionDisplay.textContent = expressionAfterErase;
            break;
        case "=":
            if (!expression.includes("=")) {
                let [result] = calculate(expression);
                if (!Number.isInteger(parseFloat(result))) {
                    result = parseFloat(result).toFixed(2);
                }
                inputDisplay.textContent = result;
                expressionDisplay.textContent += ` = ${result}`;

                resultArray.unshift(expressionDisplay.textContent);
                const expressions = resultArray.reduce((prev, current) => {
                    return prev + "\n---------------\n" + current;
                });
                history.innerText = expressions;

                if (resultArray.length === maxHistory) {
                    resultArray = resultArray.slice(0, maxHistory - 1);
                }
            }
            break;
        case "AC":
            erase();
            break;
        default:
            if (
                [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "0",
                    "-",
                    ".",
                ].includes(expression.at(-1)) &&
                !["+", "-", "x", "/"].includes(input) &&
                !expression.includes("=")
            ) {
                inputDisplay.textContent += input;
            } else {
                inputDisplay.textContent = input;
            }
            if (!expression.includes("=")) {
                if (
                    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(
                        expression.at(-1)
                    ) &&
                    ["+", "-", "x", "/"].includes(input)
                )
                    expressionDisplay.textContent += ` ${input} `;
                else expressionDisplay.textContent += input;
            } else {
                if (["+", "-", "x", "/"].includes(input)) {
                    const [prevResult] = expression.match(
                        /(?<=\=\s*)-?\d+\.?\d*/
                    );
                    expressionDisplay.textContent = `${prevResult} ${input} `;
                } else {
                    expressionDisplay.textContent = input;
                }
            }
    }
}

[...cells].forEach((cell) => {
    cell.addEventListener("click", handleClick);
});

$(document).ready(function () {
    const grabArea = $("#grab-area");
    const maxWidth = 480;
    const minWidth = 20;
    let open = false;

    let mousedown;
    let originalXPosition;

    grabArea.one("mousedown", (event) => {
        originalXPosition = event.clientX;
    });

    grabArea.on("dblclick", () => {
        if (open) {
            $("html").attr("style", `--translate-size: ${minWidth}px`);
        } else {
            $("html").attr("style", `--translate-size: ${maxWidth}px`);
        }
        open = !open;
    });

    grabArea.on("mousedown", (event) => {
        mousedown = true;
    });

    $(this).on("mouseup", (event) => {
        mousedown = false;
    });

    $(this).on("mousemove", (event) => {
        if (mousedown) {
            let offsetX = event.clientX - originalXPosition;

            if (offsetX > maxWidth / 2) {
                open = true;
            } else {
                open = false;
            }

            offsetX += minWidth;
            if (offsetX > minWidth && offsetX < maxWidth) {
                $("html").attr("style", `--translate-size: ${offsetX}px`);
            }
        }
    });

    $("#clear").on("click", () => {
        resultArray = [];
        history.innerText = "";
    });

    $(this).on("keypress", (event) => {
        let keyCode = event.which;
        if (keyCode === 61) {
            keyCode = 13;
        }
        if (keyCode === 42) {
            keyCode = 120;
        }
        $(`div[data-code=${keyCode}]`).trigger("click");
    });

    $(this).on("keydown", (event) => {
        console.log(event.which);
        const keyCode = event.which;
        if (keyCode === 39) {
            $("html").attr("style", `--translate-size: ${maxWidth}px`);
        }
        if (keyCode === 37) {
            $("html").attr("style", `--translate-size: ${minWidth}px`);
        }

        if (keyCode === 8) {
            $(`div[data-code=${keyCode}]`).trigger("click");
        }

        if (keyCode === 46) {
            $("#clear").trigger("click");
        }
    });
});
