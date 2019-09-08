#!/usr/bin/env node

const { ArgumentParser } = require('argparse')
const fs = require('fs')
const Package = require('./package.json')
const path = require('path')
require('paint-console')


// Taken from: http://paulbourke.net/geometry/pointlineplane/
function intersect(segA, segB) {
    const determinate = (
        (segB.end.y - segB.start.y) * (segA.end.x - segA.start.x) -
        (segB.end.x - segB.start.x) * (segA.end.y - segA.start.y)
    )
    if (determinate !== 0) { // check for parallel
        const ua = (
            (segB.end.x - segB.start.x) * (segA.start.y - segB.start.y) -
            (segB.end.y - segB.start.y) * (segA.start.x - segB.start.x)
        ) / determinate
        const ub = (
            (segA.end.x - segA.start.x) * (segA.start.y - segB.start.y) -
            (segA.end.y - segA.start.y) * (segA.start.x - segB.start.x)
        ) / determinate
        return [
            segA.start.x + ua * (segA.end.x - segA.start.x),
            segA.start.y + ua * (segA.end.y - segA.start.y)
        ]
    }
    return false
}

const intersectionsBetween = function(lineA, lineB) {
    const nodes = []
    for (let i = 0; i < lineA.length - 1; i++) {
        for (let j = 0; j < lineB.length - 1; j++) {
            const node = intersect(
                {
                    start: { x: lineA[i][0],   y: lineA[i][1] },
                    end:   { x: lineA[i+1][0], y: lineA[i+1][1] }
                },
                {
                    start: { x: lineB[j][0],   y: lineB[j][1] },
                    end:   { x: lineB[j+1][0], y: lineB[j+1][1] }
                }
            )
            if (node) {
                nodes.push(node)
            }
        }
    }
    return nodes
}

const getGeometryEndNodes = function(geometry) {
    return [
        geometry.coordinates[0],
        geometry.coordinates[geometry.coordinates.length - 1],
    ]
}

const getFeatureEndNodes = function(features) {
    let nodes = []
    features.forEach(feature => {
        const endNodes = getGeometryEndNodes(feature.geometry)
        nodes = [...nodes, ...endNodes]
    })
    return nodes
}

const getIntersectionNodes = function(features) {
    let nodes = []
    for (const featureA of features) {
        for (const featureB of features) {
            if (featureA.id === featureB.id) {
                continue
            } else {
                const intersections = intersectionsBetween(
                    featureA.geometry.coordinates,
                    featureB.geometry.coordinates
                )
                nodes = [...nodes, ...intersections]
            }
        }
    }
    return nodes
}

const getFeatureNodes = function(features) {
    const Allnodes = [
        ...getFeatureEndNodes(features),
        ...getIntersectionNodes(features)
    ]
    // Debuplicate by encoding as JSON, adding to a set, and decoding
    return Array.from(
        Allnodes.reduce((unique, node) => {
            unique.add(JSON.stringify(node))
            return unique
        }, new Set())
    ).map(nodeStr => JSON.parse(nodeStr))
}

const getData = function(filepath) {
    return fs.readFileSync(filepath)
}

const main = function({ verbose, input }) {
    const data = JSON.parse(getData(input))
    if (verbose) {
        console.info(`Parsing: ${input}, ${data.type}`)
    }
    const nodes = getFeatureNodes(data.features)
    console.info('Identified nodes:', nodes)
}

if (require.main === module) {
    const parser = new ArgumentParser({
        version: Package.version,
        addHelp: true,
        description: Package.description
    })
    parser.addArgument(
        '--verbose',
        { help: 'Enable extra logging', action: 'storeTrue' }
    )
    parser.addArgument(
        '--input',
        {
            help: 'Input file',
            defaultValue: path.join('data', 'example.json')
        }
    )
    const args = parser.parseArgs()
    if (args.verbose) {
        console.info(`=== BEGIN: ${Package.name} ===`)
    }
    main(args)
    if (args.verbose) {
        console.info(`~~~ END: ${Package.name} ~~~`)
    }
}
