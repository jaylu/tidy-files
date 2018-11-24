# tidy-files

tidy-files is a command line tool to tidy up the files in folder, organized and move them to sub-folders by extension name. I found my Download folder on my mac is messy, this tool help it goes slightly better.  

e.g. you have a folder with files like below:  

    /Download/a.txt  
    /Download/b.txt  
    /Download/c.doc  
    /Download/d.doc
    /Download/e.jpg

after running the command

```bash
tidy-files
```

It will be tidy up as below (grouping by file name extension)

    /Download/txt/a.txt  
    /Download/txt/b.txt  
    /Download/doc/c.doc  
    /Download/doc/d.doc
    /Download/jpg/e.jpg
  
If the target file path already existed, it will append the timestamp to the file name to avoid overwriting. e.g  

    /Download/jpg/e.jpg (existing file)
    /Download/jpg/e-20181114_152311.jpg (new moved file)
  
## Limitation

* Only test on MAC, haven't try out on Windows yet
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

if you want to rollback the changes, run  

```shell
tidy-files --rollback
```
