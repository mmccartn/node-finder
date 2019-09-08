# Node Finder

## Description
Find nodes all unique nodes in a GeoJSON track

## Install Node.js 10+ & Dependencies
 * Linux: `apt-get install -y nodejs` [Debian & Ubuntu](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
 * Windows: [Installer](https://nodejs.org/en/download/)
 * MacOS: `brew install node` with [brew](http://brew.sh/)

`npm install`

## Usage
```
$ node ./main.js --help
usage: main.js [-h] [-v] [--verbose] [--input INPUT]

Find nodes all unique nodes in a GeoJSON track

Optional arguments:
  -h, --help     Show this help message and exit.
  -v, --version  Show program's version number and exit.
  --verbose      Enable extra logging
  --input INPUT  Input file
```

## Other Caveats
- Do these linestrings have directionality? A highway overpass may cause an undesired node.
- Are they all interoperable? Roads vs shipping lines?
- How old are they? Has this country boundary been deprecated?

## Known Issues
- Deduplication by string conversion (JSON de/encoding) won't scale. This needs a custom container with set capabilities, but with a comparator that can identify equivalency between tuples.
    * Ex: `const compare = (a, b) => a[0] === b[1] && b[1])`
- Unnecessary object creation: the intersection test could pass coordinates by reference rather than creating new objects with start/end sub-points.
- Instead of a linear deduplication at the end, could keep a running index of all nodes
- Could solve this problem in a node-first manner: take a list of known valid nodes and see if any line segments form a straight line from A-Node-B

## Messy Data
Ideas for dealing with close, but not exact vertices:
- There's obviously going to need to be some threshold knobs when dealing with real-world sensor data
- Compare with other data sources
- Train a classifier to identify segment breaks similar to ones that others have manually connected in the past.
- Solve it during path generation instead: if there's an input signal to extend a path 1 unit away from the previous path point, but the shortest calculated route along connected segments is orders of magnitude longer, then give up and connect as the crow flies.

## Example Output:
```
Identified nodes: [
  [ -120.2, 38.2 ],
  [ -120.3, 38.2 ],
  [ -120.4, 38.3 ],
  [ -120.2, 38 ],
  [ -120.3, 38 ],
  [ -120.4, 38 ],
  [ -120.3, 38.4 ],
  [ -120.25, 38.4 ],
  [ -120.5, 38.2 ],
  [ -120.4, 38.2 ],
  [ -120.1, 38.2 ],
  [ -120.1, 37.79999999999997 ],
  [ -120.4, 38.1 ],
  [ -120.2, 37.899999999999984 ],
  [ -120.2, 38.1 ],
  [ -120.1, 38.3 ],
  [ -120.2, 38.3 ],
  [ -120.1, 38 ],
  [ -120.25, 38.2 ],
  [ -120.1, 38.25 ],
  [ -120.3, 38.1 ],
  [ -120.25, 38.1 ],
  [ -120.2, 38.25 ],
  [ -120.5, 38.1 ],
  [ -120.6, 38.3 ],
  [ -120.30000000000001, 38 ],
  [ -120.3, 37.999999999999986 ],
  [ -120.55, 38.25 ],
  [ -120.25, 37.94999999999999 ],
  [ -120.4, 38.25 ],
  [ -120.3, 38.3 ],
  [ -120.25, 38.3 ],
  [ -120.5, 38.3 ],
  [ -120.25, 38 ],
  [ -120.5, 38 ],
  [ -120.5, 38.25 ]
]
```
