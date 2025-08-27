(function () {
    "use strict";

    /**
     * Calculator state
     */
    let currentOperandText = "0";
    let previousOperandText = "";
    let selectedOperation = null; // One of "+", "-", "*", "/" or null
    let justEvaluated = false;

    /** DOM elements */
    const previousElement = document.getElementById("previous");
    const currentElement = document.getElementById("current");
    const keysContainer = document.querySelector(".keys");

    function resetAll() {
        currentOperandText = "0";
        previousOperandText = "";
        selectedOperation = null;
        justEvaluated = false;
        updateDisplay();
    }

    function deleteLastDigit() {
        if (justEvaluated) {
            // After evaluation, DEL should clear the result to 0
            currentOperandText = "0";
            justEvaluated = false;
            updateDisplay();
            return;
        }
        if (currentOperandText.length <= 1) {
            currentOperandText = "0";
        } else {
            currentOperandText = currentOperandText.slice(0, -1);
        }
        updateDisplay();
    }

    function appendDigitOrDot(value) {
        if (justEvaluated) {
            // Starting fresh after equals if a number/dot is pressed
            currentOperandText = value === "." ? "0." : value;
            justEvaluated = false;
            updateDisplay();
            return;
        }

        if (value === ".") {
            if (currentOperandText.includes(".")) return;
            currentOperandText += ".";
            updateDisplay();
            return;
        }

        if (currentOperandText === "0") {
            currentOperandText = value;
        } else {
            currentOperandText += value;
        }
        updateDisplay();
    }

    function chooseOperation(op) {
        if (op !== "+" && op !== "-" && op !== "*" && op !== "/") return;

        if (selectedOperation && previousOperandText !== "") {
            // Chain operations: compute previous first
            evaluate();
        }

        selectedOperation = op;
        previousOperandText = currentOperandText;
        currentOperandText = "0";
        justEvaluated = false;
        updateDisplay();
    }

    function evaluate() {
        if (selectedOperation == null || previousOperandText === "") {
            // Nothing to compute
            return;
        }
        const prev = Number(previousOperandText);
        const curr = Number(currentOperandText);

        let result;
        switch (selectedOperation) {
            case "+":
                result = prev + curr;
                break;
            case "-":
                result = prev - curr;
                break;
            case "*":
                result = prev * curr;
                break;
            case "/":
                if (curr === 0) {
                    result = "Error";
                } else {
                    result = prev / curr;
                }
                break;
            default:
                return;
        }

        if (typeof result === "number") {
            // Limit to 12 significant digits to avoid floating artifacts
            const formatted = Number(result.toPrecision(12)).toString();
            currentOperandText = formatted;
        } else {
            currentOperandText = String(result);
        }

        previousOperandText = "";
        selectedOperation = null;
        justEvaluated = true;
        updateDisplay();
    }

    function updateDisplay() {
        previousElement.textContent = selectedOperation && previousOperandText !== ""
            ? `${previousOperandText} ${symbolForOperation(selectedOperation)}`
            : "";
        currentElement.textContent = currentOperandText;
    }

    function symbolForOperation(op) {
        switch (op) {
            case "+": return "+";
            case "-": return "−";
            case "*": return "×";
            case "/": return "÷";
            default: return op;
        }
    }

    // Click handling via event delegation
    keysContainer.addEventListener("click", function (event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.hasAttribute("data-number")) {
            appendDigitOrDot(target.textContent.trim());
            return;
        }

        if (target.hasAttribute("data-operation")) {
            chooseOperation(target.getAttribute("data-operation"));
            return;
        }

        if (target.hasAttribute("data-all-clear")) {
            resetAll();
            return;
        }

        if (target.hasAttribute("data-delete")) {
            deleteLastDigit();
            return;
        }

        if (target.hasAttribute("data-equals")) {
            evaluate();
            return;
        }
    });

    // Keyboard support
    window.addEventListener("keydown", function (event) {
        const key = event.key;
        if (/^[0-9]$/.test(key)) {
            appendDigitOrDot(key);
            event.preventDefault();
            return;
        }
        if (key === ".") {
            appendDigitOrDot(".");
            event.preventDefault();
            return;
        }
        if (key === "+" || key === "-" || key === "*" || key === "/") {
            chooseOperation(key);
            event.preventDefault();
            return;
        }
        if (key === "Enter" || key === "=") {
            evaluate();
            event.preventDefault();
            return;
        }
        if (key === "Backspace") {
            deleteLastDigit();
            event.preventDefault();
            return;
        }
        if (key === "Escape") {
            resetAll();
            event.preventDefault();
            return;
        }
        if (key.toLowerCase() === "x") {
            chooseOperation("*");
            event.preventDefault();
            return;
        }
    });

    // Initialize
    updateDisplay();
})();

