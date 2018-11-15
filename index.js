#!/usr/bin/env node

const util = require('util');
const fs = require('fs');
const path = require('path')
const format = require('date-fns/format');
const args = require('minimist')(process.argv.slice(2))

const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);
const stat = util.promisify(fs.stat);
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const cwd = process.cwd()
const LOG_FILE = '.tf_log'
const LOG_PATH = path.join(cwd, LOG_FILE)
const IGNORE_FILE_LIST = ['.DS_Store', LOG_FILE]


async function getLog() {
    if (fs.existsSync(LOG_PATH)) {
        let logContent = await readFile(LOG_PATH)
        return JSON.parse(logContent)
    } else {
        return {
            createdFolderPath: [],
            movedRecords: []
        }
    }
}

async function writeLog(log) {
    try {
        await writeFile(LOG_PATH, JSON.stringify(log, null, 4))    
        console.log(`log file written to ${LOG_PATH}, you may run 'tidy-files --rollback' to rollback the tidy action base on this log. `);
    } catch (error) {
        console.error('fail to write log')
    }
}

async function isFolderEmpty(path) {
    const files = await readdir(path)
    return files.length === 0
}

function getCurrentTime() {
    return format(new Date(), 'YYYYMMDD_HHmmss')
}

function createFolderIfNotExist(dir, log) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir)
        log.createdFolderPath.push(dir)
        console.log(`folder created: ${dir}`);
    }
}

function extensionFolderPath(parent, extension = '.none') {
    return path.join(parent, extension.replace('.', ''))
}

async function getNewPath(cwd, extensionFolder, baseName, extension) {
    const newPath = path.join(cwd, extensionFolder, `${baseName}${extension}`)
    if (fs.existsSync(newPath)) {
        const fileStat = await stat(newPath)
        if (fileStat.isFile()) {
            return path.join(cwd, extensionFolder, `${baseName}-${getCurrentTime()}${extension}`)
        } 
    }
    return newPath
}

async function doMove(log) {
    const files = await readdir(cwd)

    for (file of files) {

        const originalPath = path.join(cwd, file)
        const fileStat = await stat(originalPath)

        if (fileStat.isFile()) {

            const extension = path.extname(originalPath)
            const extensionFolder = extension.replace('.', '') || 'none'
            const baseName = path.basename(originalPath, extension)

            if (IGNORE_FILE_LIST.indexOf(baseName) >= 0) {
                continue
            }

            try {

                createFolderIfNotExist(extensionFolderPath(cwd, extensionFolder), log)
                let newPath = await getNewPath(cwd, extensionFolder, baseName, extension)
                await rename(originalPath, newPath) // move file

                log.movedRecords.push({
                    from: originalPath,
                    to: newPath
                })

                console.log('file moved to: ', newPath);
            } catch (error) {
                console.log(error);
            }
        }       
    }

    await writeLog(log)
}

async function doRollback(log) {

    for (const record of log.movedRecords) {
        if (!fs.existsSync(record.from)) {
            await rename(record.to, record.from) // move file
            console.log(`rollback file to: ${record.from}`);
        }
    }

    for (const path of log.createdFolderPath) {
        if (await isFolderEmpty(path)) {
            fs.rmdirSync(path) 
            console.log(`remove folder: ${path}`)
        }
    }

    fs.unlinkSync(LOG_PATH)
}

async function main() {
   
    let log = await getLog(LOG_PATH)

    if (args && args['rollback']) {
        await doRollback(log)
    } else {
        await doMove(log)
    }
}


main()
    .then(() => {
        console.log('action completed!!');
    })
    .catch(error => {
        console.error(error);
    })


