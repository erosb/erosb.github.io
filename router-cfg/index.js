"use strict";
let programLines, symbolTable;
let lineNo;
let output;
let warnings;

function warn(warning) {
    console.warn(warning)
    warnings.push(warning)
}

function substVars(line) {
    var matches = line.matchAll(/<([a-zA-Z0-9_]+)>/g)
    if (matches !== null) {
        for (let match of matches) {
            let toBeReplaced = match[0];
            let varName = match[1];
            let resolvedSymbol = symbolTable[varName];
            if (resolvedSymbol === undefined) {
                throw `undefined variable ${varName} found at line ${lineNo}`
            } else if (resolvedSymbol.type === "scalar") {
                line = line.replaceAll(toBeReplaced, symbolTable[varName].value);
            } else if (resolvedSymbol.type === "list") {
                throw "cannot print list " + varName
            } else if (resolvedSymbol.type === "dictionary") {
                throw "cannot print dictionary " + varName
            }
        }
    }
    return line;
}

function currentLine() {
    return programLines[lineNo].trim();
}

function currentLineIsEndIf() {
    return currentLine().match(/^#\s*endif\s*$/i) !== null
}

function currentLineIsEndFor() {
    return currentLine().match(/^#\s*endfor\s*$/i) !== null
}

function currentLineIsUnless() {
    return currentLine().match(/^#\s*unless\s*$/i) !== null
}

function processUntilEndIf(condition) {
    if (condition) {
        ++lineNo;
        while (!(currentLineIsEndIf() || currentLineIsUnless())) {
            processCurrentLine()
            ++lineNo;
        };
        if (currentLineIsUnless()) {
            do {
                ++lineNo;
            } while (!currentLineIsEndIf())
        }
    } else {
        do {
            ++lineNo;
        } while (!(currentLineIsEndIf() || currentLineIsUnless()))
        if (currentLineIsUnless()) {
            ++lineNo;
            while (!currentLineIsEndIf()) {
                processCurrentLine()
                ++lineNo;
            };
        }
    }
}

function processIf(line) {
    let match = line.trim().match(/^#\s*if\s*<([a-zA-Z0-9_]+)>\s*$/i)
    if (match === null) {
        warn(`cannot process line ${line}`)
        return;
    }
    let varName = match[1]
    let condition;
    if (symbolTable[varName] === undefined) {
        warn(`undefined variable ${varName} referenced in #if at line ${lineNo}`)
        condition = false;
    } else {
        condition = symbolTable[varName].value
    }
    processUntilEndIf(condition)
}

function processForEach(line) {
    let match = line.match(/^#\s*foreach\s+(<([a-zA-Z0-9_]+)>\s*,\s*)?<([a-zA-Z0-9_]+)>\s+in\s+<([a-zA-Z0-9_]+)>/i)
    if (match === null) {
        warn(`cannot process line ${line}`)
        return;
    }
    let loopKeyVar = match[2], loopValueVar = match[3];
    let iterableName = match[4];
    let iterableSymbol = symbolTable[iterableName];
    if (iterableSymbol === undefined) {
        throw `cannot iterate on nonexistent variable ${iterableName} on line ${lineNo}`
    }
    let listItems = iterableSymbol.value;
    if (iterableSymbol.type === "scalar") {
        listItems = [listItems];
    }
    let loopBodyStart = ++lineNo;
    symbolTable[loopKeyVar] = {
        value: null,
        type: "scalar"
    }
    symbolTable[loopValueVar] = {
        value: null,
        type: "scalar"
    }
    for (let itemIndex in listItems) {
        lineNo = loopBodyStart
        let item = listItems[itemIndex]
        if (loopKeyVar !== null) {
            symbolTable[loopKeyVar].value = itemIndex
        }
        symbolTable[loopValueVar].value = item
        do {
            processCurrentLine();
            ++lineNo;
        } while (!currentLineIsEndFor());
    }
    delete symbolTable[loopKeyVar]
    delete symbolTable[loopValueVar]
}

function processDefine(line) {
    let match = line.match(/^#\s*define\s+([a-z-A-Z0-9_]+)(\s*=\s*(.*))?/i)
    let varName = match[1]
    let varValue = match[3]
    if (varValue === undefined) {
        varValue = true;
    } else if (varValue.trim() === "false") {
        varValue = false
    } else {
        varValue = varValue.trim()
    }
    symbolTable[varName] = {
        type: "scalar",
        value: varValue
    }
}

function processIfDef(line) {
    let match = line.match(/^#\s*ifdef\s+([a-zA-Z0-9_]+)/i)
    let varName = match[1];
    processUntilEndIf(symbolTable[varName] != undefined);
}

function processCurrentLine() {
    let line = programLines[lineNo].trim();
    if (line.trim() === "!") {
        return;
    }
    if (line.startsWith("#")) {
        let command = line.substring(1).trim();
        if (command.toLowerCase().startsWith("ifdef")) {
            processIfDef(line)
        } else if (command.toLowerCase().startsWith("if")) {
            processIf(line)
        } else if (command.toLowerCase().startsWith("foreach")) {
            processForEach(line)
        } else if (command.toLowerCase().startsWith("define")) {
            processDefine(line)
        } else {
            warn(`cannot process line ${lineNo}: ${line}`)
        }
    } else {
        output.push(substVars(programLines[lineNo]))
    }
}

function parseVariables(rawVars) {
    let retval = {};
    rawVars = rawVars.trim();
    for (let line of rawVars.split("\n")) {
        if (line.trim() === "") {
            continue;
        }
        let eqIdx = line.indexOf("=");
        if (eqIdx == -1) {
            throw "invalid variable definition: " + line
        }
        let varName = line.substring(0, eqIdx).trim();
        let rawValue = line.substring(eqIdx + 1).trim();
        if (retval[varName]) {
            throw `duplicate variable definition: ${varName}`
        }
        let parsedSymbol = {};
        if (rawValue.indexOf(",") === -1) {
            if (rawValue === "false") {
                rawValue = false;
            }
            parsedSymbol = {
                type: "scalar",
                value: rawValue
            }
        } else {
            let items = rawValue.split(",");
            let listItems = [];
            let kvPairs = {};
            let kvPairMode = null;
            for (let item of items) {
                let colonIdx = item.indexOf(":");
                if (colonIdx === -1) {
                    if (kvPairMode === true) {
                        throw `ambiguous variable ${varName}: cannot determine if it is a list or dictionary`
                    }
                    listItems.push(item);
                    kvPairMode = false
                } else {
                    if (kvPairMode === false) {
                        throw `ambiguous variable ${varName}: cannot determine if it is a list or dictionary`
                    }
                    let key = item.substring(0, colonIdx).trim();
                    let val = item.substring(colonIdx + 1).trim();
                    kvPairs[key] = val;
                    kvPairMode = true;
                }
            }
            if (kvPairMode === true) {
                parsedSymbol = {
                    type: "dictionary",
                    value: kvPairs
                }
            } else if (kvPairMode === false) {
                parsedSymbol = {
                    type: "list",
                    value: listItems
                }
            }
        }
        retval[varName] = parsedSymbol
    }
    return retval
}

function preprocessLines(prog) {
    let lines = prog.trim().split("\n");
    let retval = [];
    for (let i = 0; i < lines.length; ++i) {
        let line = lines[i].trim();
        let prevLine = retval[retval.length - 1];
        if (prevLine !== undefined && prevLine.endsWith("\\")) {
            retval[retval.length - 1] = prevLine.substring(0, prevLine.length - 1) + line
        } else {
            retval.push(line)
        }
    }
    return retval;
}

function main(prog, vars) {
    programLines = preprocessLines(prog)
    symbolTable = parseVariables(vars);
    lineNo = 0;
    output = [];
    warnings = [];
    while (lineNo < programLines.length) {
        processCurrentLine();
        ++lineNo;
    }
    return output.join("\r\n")
}

function mainWithWarnings(prog, vars) {
    let error, output;
    try {
        output = main(prog, vars);
    } catch (err) {
        console.error(err)
        error = err;
    }
    return {
        output: output,
        warnings: warnings,
        error: error
    }
}

document.addEventListener("DOMContentLoaded", (e) => {
    let warningsCnt = null, warningsUl;
    let runMain = (e) => {
        if (e.keyCode == 10 && e.ctrlKey) {
            warningsCnt.style.display = "none"
            if (warningsUl) {
                warningsCnt.removeChild(warningsUl)
            }
            var result = mainWithWarnings(
                document.getElementsByName("txt-src")[0].value,
                document.getElementsByName("txt-variables")[0].value
            );
            document.getElementsByName("txt-output")[0].value = result.output;
console.log(result)

            warningsUl = document.createElement("UL");
            warningsCnt.appendChild(warningsUl)
            if (result.error) {
                warningsCnt.style.display = "block";
                let errorLi = document.createElement("LI");
                errorLi.appendChild(document.createTextNode(result.error))
                errorLi.style.color = "red";
                warningsUl.appendChild(errorLi)
            }
            if (result.warnings.length > 0) {
                warningsCnt.style.display = "block";
                result.warnings.map(w => document.createElement("LI").appendChild(document.createTextNode(w)))
                    .forEach(w => warningsUl.appendChild(w))
            }
        }
    }

    if (document.getElementsByName("txt-output").length > 0) {
        warningsCnt = document.getElementById("cnt-warnings");
        warningsUl = document.querySelector("#cnt-warnings ul");
        document.getElementsByName("txt-src")[0].addEventListener("keypress", runMain);
        document.getElementsByName("txt-variables")[0].addEventListener("keypress", runMain);
    }

});