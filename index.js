const cells = document.getElementsByClassName("cell");
const inputDisplay = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const history = document.querySelector("#history-screen p");
const historyModal = document.querySelector("#history-modal .modal-body");
const sound = document.getElementById("sound");
let resultArray = [];
const maxHistory = 10;
const operators = ["+", "-", "x", "/"];
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const parse = (expression) => {
    const reg =
        /^-?(?:\d+(?:\.(?=\d+)\d+)?)(?:(?:\s[+\-\/x]\s)-?(?:\d+(?:\.(?=\d+)\d+)?))*/;
    return expression.match(reg)[0];
};

const calculate = (expression) => {
    expression = expression.replace(/\+\s-(?=\d+)/, "- ").split(" ");
    console.info(`%c[TRACK]:`, "color: #1591ea; font-weight: bold", expression);

    const priority = { x: 5, "/": 6, "+": 3, "-": 4 };
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
        //console.log([...expression].toSpliced(start, 3, evaluation));

        expression = [...expression].toSpliced(start, 3, evaluation);
    });
    return expression;
};

const erase = () => {
    inputDisplay.textContent = "0";
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
            inputDisplay.innerText = inputAfterErase || "0";

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
                const newExpression = parse(expression);
                expressionDisplay.textContent = newExpression;
                let [result] = calculate(newExpression);
                if (!Number.isInteger(parseFloat(result))) {
                    result = new Intl.NumberFormat("en-US", {
                        style: "decimal",
                        maximumFractionDigits: 4,
                    }).format(parseFloat(result));
                }
                inputDisplay.textContent = result;
                expressionDisplay.textContent += ` = ${result}`;

                resultArray.unshift(expressionDisplay.textContent);
                const expressions = resultArray.reduce((prev, current) => {
                    return prev + "\n---------------\n" + current;
                });
                history.innerText = expressions;
                historyModal.innerText = expressions;

                if (resultArray.length === maxHistory) {
                    resultArray = resultArray.slice(0, maxHistory - 1);
                }
            }
            break;
        case "AC":
            erase();
            break;
        default:
            //populate input display
            if (!expression.includes("=")) {
                if (
                    ["+", "-", "x", "/"].includes(input) ||
                    (["+", "-", "x", "/"].includes(expression.at(-1)) &&
                        ![undefined, "+", "-", "x", "/"].includes(
                            expression.at(-3)
                        ))
                )
                    inputDisplay.textContent = input;
                else {
                    const prevInput = inputDisplay.textContent.trim();

                    if (prevInput.includes(".") && input === ".") {
                        return;
                    }

                    inputDisplay.textContent = (prevInput + input).replace(
                        /^0(?=\d)/,
                        ""
                    );
                }
            } else {
                inputDisplay.textContent = input;
            }

            //populate the expression display
            if (!expression.includes("=")) {
                const prevExpression = expressionDisplay.textContent;
                if (
                    digits.includes(expression.at(-1)) &&
                    operators.includes(input)
                ) {
                    expressionDisplay.textContent =
                        prevExpression + ` ${input} `;
                } else if (
                    (operators.includes(expression.at(-1)) ||
                        expression.slice(-3) === "- -") &&
                    ["+", "x", "/"].includes(input)
                ) {
                    expressionDisplay.textContent = expression.replace(
                        /(?<=\s).+$/,
                        `${input} `
                    );
                } else {
                    if (expression.slice(-3) === "- -" && input === "-") {
                        return;
                    }

                    expressionDisplay.textContent = (
                        prevExpression + input
                    ).replace(/\b0/, "");
                }
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

    $(".btn-outline-danger").on("click", () => {
        resultArray = [];
        history.innerText = "";
        historyModal.innerText = "";
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
            $("#clear-history").trigger("click");
        }
    });
});
