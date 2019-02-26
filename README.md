# ELC demo

Demonstrates using [webpack] with the [ArcGIS API for JavaScript].

## Required software

* [git] client
* [NodeJS]
* Visual Studio Code (Recommended)

## Setup

1. Clone this repository to your computer.
2. Run `npm install` to install dependencies and build.


## Steps used to create this project

1. Create new folder on hard drive
2. `git init`
3. `npm init` to create project.json
4. Added `private: true` to project.json (to prevent accidental upload to npm package repository)
5. Use `npm import` to import packages
   * `@types/arcgis-js-api` - Provides extra type info to code editor. (Not *required* for this project but would be required for TypeScript projects.)
   * `webpack` & `webpack-cli` - [webpack] and its command-line-interface. Webpack is one of many "transpilers" that converts JavaScript modules into older-style JavaScript code that can be read by browsers.
   * `wsdot-elc` - sample module used by ArcGIS API application
 6. Created `webpack.config.js` by copying example at [webpack website][webpack].
 7. Added `libraryTarget: "amd"` line to `webpack.config.js` to make output an AMD module, which is the type that the ArcGIS API uses.
 8. Added build commands to `scripts` section of `package.json`.

    script name | purpose
    --|--
    prepare | The *prepare* script is automatically called by the `npm install` command after all modules have been loaded. In this project, it merely calls the *build* script.
    build | Executes the webpack build process
    watch | Starts the webpack "watch-mode" process. While this is running, the built output will continually be updated as the source files are updated. (Press Ctrl+C to stop the watching process.)

[git]:https://git-scm.com/downloads
[webpack]:https://webpack.js.org/
[ArcGIS API for JavaScript]:https://developers.arcgis.com/javascript/
[NodeJS]:https://nodejs.org/en/