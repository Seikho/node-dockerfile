### Node-dockerfile
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
var Dockerfile = require("node-dockerfile");
var myFile = new Dockerfile();

// Let's just add in a bunch of funky commands for a bit of fun
myFile.from("node:0.12.4");

myFile.run([
	"apt-get install -y git",
	"git clone https://github.com/seikho/node-dockerfile /code/node-dockerfile"
 ]);
 
myFile.run(["cd /code/node-dockerfile", "npm install"]);

// method chaining!
myFile
	.run("npm install -g http-server")
	.workDir("/code/node-dockerfile")
	.cmd("http-server");
	
// .write takes a callback which takes 'error' and 'content'.
// Content being the content of the generated filed.
var cb = function(err, content) {
	if (err) console.log("Failed to write: %s", err);
	else console.log("Successfully wrote the dockerfile!"); 
}
// .write takes 3 arguments: 'location', 'replaceExisting' and the callback above.

myFile.write(".", true, cb);

// If all goes well...
// Console: >> 'Successfully wrote to dockerfile!' 
```

#### API

**from(image: string)**
```javascript
myFile.from("ubuntu:latest");
// FROM ubuntu:latest  
```

**maintainer(maintainerName: string)**
```javascript
myFile.maintainer("Carl Winkler");
// MAINTAINER Carl Winkler
```

**run(instructions: string|string[])**
```javascript
`myFile.run("apt-get intall -y curl");`
// RUN apt-get install -y curl

// We can create multi-line run commands
myFile.run([
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
myFile.comment("This is a comment");
// # This is a comment
```

**newLine()** Adds a new line to the Dockerfile -- purely cosmetic

**cmd(instructions: string|string[])**
```javascript
myFile.cmd("node --harmony index.js");
// CMD node --harmony index.js

myFile.cmd(["node", "--harmony", "index.js"]);
// '["node", "--harmony", "index.js"]'
```

**label(key: string, label: string)**
```javascript
myFile.label("someLabel", "someValue");
// LABEL someLabel=someValue
```

**expose(port: number)**
```javascript
myFile.expose(8080);
// EXPOSE 8080
```

**env(key: string, value: string)**
```javascript
myFile.env("DOCKER_CERT_PATH", "/root/.docker/");
// ENV DOCKER_CERT_PATH=/root/.docker/
```

**add(source: string, destination: string)**
```javascript
myFile.add("hom*, "/mydir");
// ADD hom* /mydir/
```

**copy(source: string, destination: string)**
```javascript
// current working directory: /home/carl/projects/node-dockerfile
var dynamicPath = path.resolve("../my-library"); // /home/carl/projects/my-library
myFile.copy(dynamicPath, "/code/my-library");
// COPY /home/carl/projects/my-library /code/my-library
```

**entryPoint(instructions: string|string[])**
```javascript
myFile.entryPoint("top -b");
// ENTRYPOINT top -b

myFile.entryPoint(["top","-b"]);
// ENTRYPOINT ["top", "-b"]
```

**volume(volume: string)**
```javascript
myFile.volume("/some/volume");
// VOLUME /some/volume
```

**workDir(path: string)**
```javascript
myFile.workDir("/some/volume");
// WORKDIR /some/volume
```

**user(user: string)**
```javascript
myFile.user("carl");
// USER carl
```

**onBuild(instructions: string)**
```javascript
myFile.onBuild("ADD . /app/src");
// ONBUILD ADD . /app/src
```

**write(writeLocation: string, replaceExisting: boolean, callback: (error, content) => void))**
```javascript
myFile.write("../my-image", true, function(err, content) {
	if (err) doSomethingElse();
	else doSuccessFunction();
});
```
