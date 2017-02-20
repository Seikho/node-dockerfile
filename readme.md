### Node-dockerfile

[![NPM version](http://img.shields.io/npm/v/node-dockerfile.svg?style=flat)](https://www.npmjs.org/package/node-dockerfile)
[![Travis build status](https://travis-ci.org/Seikho/node-dockerfile.svg?branch=master)](https://travis-ci.org/Seikho/node-dockerfile)   
A small library for programmatic generation of Dockerfiles using Node.

Node-dockerfile allows you to dynamically create Dockerfile files.  
This library was designed to allow us to dynamically create docker images to assist deployment automation.
  
Written in TypeScript by Carl Winkler

#### Installation

```javascript
npm install node-dockerfile --save
```

#### Example usage
```javascript
import { Builder } from 'node-dockerfile'
const dockerfile = new Builder();

// Let's just add in a bunch of funky commands for a bit of fun
dockerfile
	.from("node:6")
	.newLine()
	.comment("Clone and install dockerfile")
	.run([
		"apt-get install -y git",
		"git clone https://github.com/seikho/node-dockerfile /code/node-dockerfile"
 	])
	.newLine()
	.run(["cd /code/node-dockerfile", "npm install"]);
	.run("npm install -g http-server")
	.newLine()
	.workDir("/code/node-dockerfile")
	.cmd("http-server");
	
// .write takes a callback which takes 'error' and 'content'.
// Content being the content of the generated filed.
const cb = function(err, content) {
	if (err) console.log("Failed to write: %s", err);
	else console.log("Successfully wrote the dockerfile!"); 
}
// .write takes 3 arguments: 'location', 'replaceExisting' and the callback above.

dockerfile.write(".", true, cb);

// If all goes well...
// Console: >> 'Successfully wrote to dockerfile!' 
```

#### API

**from(image: string)**
```javascript
myFdockerfileile.from("ubuntu:latest");
// FROM ubuntu:latest  
```

**maintainer(maintainerName: string)**
```javascript
dockerfile.maintainer("Carl Winkler");
// MAINTAINER Carl Winkler
```

**run(instructions: string|string[])**
```javascript
dockerfile.run("apt-get intall -y curl");
// RUN apt-get install -y curl

// We can create multi-line run commands
dockerfile.run([
	"apt-get install -y git",
	"git clone https://github.com/seikho/node-dockerfile.git"
]);
/**
 * RUN apt-get install -y git \
 * && git clone https://github.com/seikho/node-dockerfile.git
 */
```

**comment(comment: string)** Adds a comment to the file
```javascript
dockerfile.comment("This is a comment");
// # This is a comment
```

**newLine()** Adds a new line to the Dockerfile -- purely cosmetic

**cmd(instructions: string|string[])**
```javascript
dockerfile.cmd("node --harmony index.js");
// CMD node --harmony index.js

dockerfile.cmd(["node", "--harmony", "index.js"]);
// '["node", "--harmony", "index.js"]'
```

**label(key: string, label: string)**
```javascript
dockerfile.label("someLabel", "someValue");
// LABEL someLabel=someValue
```

**expose(port: number)**
```javascript
dockerfile.expose(8080);
// EXPOSE 8080
```

**arg(key: string, value: string)**
```javascript
dockerfile.arg("user", "docker");
// ARG user=docker
```


**env(key: string, value: string)**
```javascript
dockerfile.env("DOCKER_CERT_PATH", "/root/.docker/");
// ENV DOCKER_CERT_PATH=/root/.docker/
```

**add(source: string, destination: string)**
```javascript
dockerfile.add("hom*", "/mydir");
// ADD hom* /mydir/
```

**copy(source: string, destination: string)**
```javascript
// current working directory: /home/carl/projects/node-dockerfile
var dynamicPath = path.resolve("../my-library"); // /home/carl/projects/my-library
dockerfile.copy(dynamicPath, "/code/my-library");
// COPY /home/carl/projects/my-library /code/my-library
```

**entryPoint(instructions: string|string[])**
```javascript
dockerfile.entryPoint("top -b");
// ENTRYPOINT top -b

dockerfile.entryPoint(["top","-b"]);
// ENTRYPOINT ["top", "-b"]
```

**volume(volume: string)**
```javascript
dockerfile.volume("/some/volume");
// VOLUME /some/volume
```

**workDir(path: string)**
```javascript
dockerfile.workDir("/some/volume");
// WORKDIR /some/volume
```

**user(user: string)**
```javascript
dockerfile.user("carl");
// USER carl
```

**onBuild(instructions: string)**
```javascript
dockerfile.onBuild("ADD . /app/src");
// ONBUILD ADD . /app/src
```

**write(writeLocation: string, replaceExisting: boolean, callback: (error, content) => void))**

```javascript
dockerfile.write("../my-image", true, function(err, content) {
	if (err) doSomethingElse();
	else doSuccessFunction();
});
```

**writeStream()**

```javascript
var fs = require('fs');

dockerfile.writeStream()
      .pipe(fs.createWriteStream('Dockerfile'));
```