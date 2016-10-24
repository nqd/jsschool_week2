# Dropbox

This is a basic Dropbox clone to sync files across multiple remote folders.

Time spent: `12`

## Features

### Required

- [x] Completed Requireds marked with `[x]`
- [x] Walkthrough Gif embedded in README
- [x] README `Time spent:` includes the number of hours spent on the assignment
- [x] Client can make GET requests to get file or directory contents
- [x] Client can download a directory as an archive
- [x] Client can make HEAD request to get just the GET headers 
- [x] Client can make ~~PUT~~ POST requests to create new directories and files with content
- [x] Client can make ~~POST~~ PUT requests to update the contents of a file
- [x] Client can make DELETE requests to delete files and folders
- [x] Server will serve from `--dir` or cwd as root
- [ ] Note: will not implement since this requirement confict with following requirement. Server will sync `HTTP` modifications over TCP to the Client
- [x] Server will sync watched file modifications (e.g., `fs.watch`) over TCP to the Client

### Optional

- [x] Client supports multiple connected clients
- [ ] Client does not need to make additional `GET` request on `"write"` update
- [ ] Client and User will be redirected from HTTP to HTTPS
- [ ] Client will sync back to Server over TCP
- [ ] Client will preserve a 'Conflict' file when pushed changes preceeding local edits
- [ ] Client can stream and scrub video files (e.g., on iOS)
- [ ] Client can create a directory with an archive
- [ ] User can connect to the server using an FTP client


## Walkthrough

### create and edit

![](https://raw.githubusercontent.com/nqd/jsschool_week2/master/gif/create-edit.gif)


### get

![](https://raw.githubusercontent.com/nqd/jsschool_week2/master/gif/get.gif)


### del

![](https://raw.githubusercontent.com/nqd/jsschool_week2/master/gif/del.gif)

### server event

![](https://raw.githubusercontent.com/nqd/jsschool_week2/master/gif/serverEvent.gif)

### dropbox client

![](https://raw.githubusercontent.com/nqd/jsschool_week2/master/gif/client.gif)
