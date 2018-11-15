# tidy-files

tidy-files is a command line tool to tidy up the files in folder, organized and move them to sub-folders by extension name. I found my Download folder on my mac is messy, this tool help it goes slightly better.  

e.g. you have a folder with files like below:  

    /Download/a.txt  
    /Download/b.txt  
    /Download/c.doc  
    /Download/d.jpg  

after running the command

```bash
tidy-files
```

It will be tidy up to  

    /Download/txt/a.txt  
    /Download/txt/b.txt  
    /Download/doc/c.doc  
    /Download/jpg/d.jpg  
  
It the target file path already existed, it will append the timestamp on the file name before moving. e.g  

    /Download/jpg/d.jpg (existing file)
    /Download/jpg/d-20181114_152311.jpg (new moved file)
  
## Limitation

* Only test on mac, haven't try out on windows yet
* As util.promisify is used in source code, only **node 8** or greater is supported.  

## Install and run

```shell
npm install -g tidy-files
tidy-files  
```

if you get npx installed, try

```shell
npx tidy-files
```
