#!/usr/bin/env node

const util = require('util');
const fs = require('fs');
const path = require('path')
const format = require('date-fns/format');

const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);
const stat = util.promisify(fs.stat);

const IGNORE_FILE_LIST = ['.DS_Store']

function getCurrentTime() {
    return format(new Date(), 'YYYYMMDD_HHmmss')
}

function createFolderIfNotExist(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir)
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

async function main() {

    const cwd = process.cwd()
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
                createFolderIfNotExist(extensionFolderPath(cwd, extensionFolder))
            } catch (error) {
                console.error(`Fail to create folder: ${extensionFolderPath(cwd, extensionFolder)}`);
            }

            try {
                let newPath = await getNewPath(cwd, extensionFolder, baseName, extension)
                await rename(originalPath, newPath)
                console.log('file moved to: ', newPath);
            } catch (error) {
                console.log(error);
            }
        }
    }
    
    
}


main()
    .then(() => {
        console.log('tidy files completed!!');
    })
    .catch(error => {
        console.error(error);
    })