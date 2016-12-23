/* eslint-disable */

'use strict';

const fs = require('fs');
const lineColumn = require('line-column');
const {
    indexOfRegex,
    lastIndexOfRegex
} = require('index-of-regex');

const FILE = 'lint.out';
const input = fs.readFileSync(FILE, 'utf8').trim();
const blocks = processInput(input);

blocks.forEach(block => {
    addFlowType(':any', block.filepath, block.positions);
});


function processInput(input) {
    const blocks = input.split('\n\n');
    const parsedBlocks = blocks.map(parseBlock);

    return parsedBlocks
}

function parseBlock(block) {
    const parsed = {
        filepath: null,
        positions: []
    };
    const parts = block.split('\n');
    parts.forEach(parseBlockLines.bind(null, parsed));

    return parsed;
}

function parseBlockLines(parsed, line, i) {
    if (!i) {
        parsed['filepath'] = line;
        return;
    }

    const position = line.trim().split(' ')[0];
    const postionParts = position.split(':');
    parsed.positions.push({
        line: parseInt(postionParts[0], 10),
        column: parseInt(postionParts[1], 10)
    });
}

var fileData;
function addFlowType(flowType, filepath, positions) {
    const fd = fs.openSync(filepath, 'r+');
    fileData = fs.readFileSync(fd, 'utf8');
    positions.forEach(addFlowTypeInOnePosition.bind(null, flowType));
    fs.writeFileSync(fd, fileData);
    fs.closeSync(fd);
}

function addFlowTypeInOnePosition(flowType, position) {
    let index = lineColumn(fileData).toIndex(position);
    index = indexOfRegex(fileData, /(\)\s?\{)|(\)\s?=>\s?\{)/, index);
    let startSlice = fileData.slice(0, index)
    let endSlice = fileData.slice(index + 1);
    endSlice = `)${flowType}${endSlice}`;
    fileData = `${startSlice}${endSlice}`;
}
