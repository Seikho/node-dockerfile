var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fs = require("fs");
var path = require("path");
var stream = require("stream");
var StringStream = (function (_super) {
    __extends(StringStream, _super);
    function StringStream(buffer) {
        _super.call(this);
        this.buffer = null;
        this.buffer = buffer;
    }
    StringStream.prototype._read = function (size) {
        if (this.buffer !== null) {
            this.push(this.buffer);
            this.buffer = null;
        }
        this.push(null);
    };
    return StringStream;
})(stream.Readable);
var Builder = (function () {
    function Builder() {
        this.instructions = [];
    }
    Builder.prototype.from = function (image) {
        this.instructions.push(makeInstruction("FROM", image));
        return this;
    };
    Builder.prototype.maintainer = function (maintainer) {
        this.instructions.push(makeInstruction("MAINTAINER", maintainer));
        return this;
    };
    Builder.prototype.run = function (instructions) {
        var lines = makeMultiInstructions("RUN", instructions);
        this.instructions = this.instructions.concat(lines);
        return this;
    };
    Builder.prototype.cmd = function (instructions) {
        this.instructions.push(makeInstruction("CMD", instructions));
        return this;
    };
    Builder.prototype.label = function (key, value) {
        this.instructions.push(makeInstruction("LABEL", key + "=" + value));
        return this;
    };
    Builder.prototype.expose = function (port) {
        this.instructions.push(makeInstruction("EXPOSE", port));
        return this;
    };
    Builder.prototype.env = function (key, value) {
        this.instructions.push(makeInstruction("ENV", key + "=" + value));
        return this;
    };
    Builder.prototype.add = function (source, destination) {
        var line = combine(source, destination);
        this.instructions.push(makeInstruction("ADD", line));
        return this;
    };
    Builder.prototype.copy = function (source, destination) {
        this.instructions.push(makeInstruction("COPY", source + " " + destination));
        return this;
    };
    Builder.prototype.entryPoint = function (instructions) {
        this.instructions.push(makeInstruction("ENTRYPOINT", instructions));
        return this;
    };
    Builder.prototype.volume = function (volume) {
        this.instructions.push(makeInstruction("VOLUME", volume));
        return this;
    };
    Builder.prototype.user = function (user) {
        this.instructions.push(makeInstruction("USER", user));
        return this;
    };
    Builder.prototype.workDir = function (path) {
        this.instructions.push(makeInstruction("WORKDIR", path));
        return this;
    };
    Builder.prototype.onBuild = function (instructions) {
        this.instructions.push(makeInstruction("ONBUILD", instructions));
        return this;
    };
    Builder.prototype.comment = function (comment) {
        this.instructions.push(makeInstruction("#", comment));
        return this;
    };
    Builder.prototype.newLine = function () {
        this.instructions.push(makeInstruction("", ""));
        return this;
    };
    Builder.prototype.write = function (location, replaceExisting, callback) {
        var content = buildInstructionsString(this.instructions);
        writeDockerfile(content, location, replaceExisting, callback);
    };
    Builder.prototype.writeStream = function () {
        var content = buildInstructionsString(this.instructions);
        return new StringStream(content);
    };
    return Builder;
})();
function writeDockerfile(content, location, replaceExisting, callback) {
    if (!location)
        return;
    var location = path.join(path.resolve(location), "Dockerfile");
    fs.readFile(location, function (readErr) {
        // Dockerfile doesn't exist, try and write it
        if (readErr) {
            var writeOpts = {
                encoding: "utf8"
            };
            fs.writeFile(location, content, writeOpts, function (writeErr) {
                callback(writeErr, content);
            });
            return;
        }
        // Dockerfile exists and we have permission to overwrite it
        if (replaceExisting) {
            fs.writeFile(location, content, function (writeErr) {
                callback(writeErr, content);
            });
            return;
        }
        //Dockerfile exists and we do not have permission to overwrite it
        callback("Error: Dockerfile already exists and do not have permission to overwrite", content);
        return;
    });
}
function buildInstructionsString(lines) {
    var file = "";
    for (var l in lines) {
        var line = lines[l];
        file += line.command + " " + line.instruction + "\n";
    }
    return file;
}
function combine(left, right) {
    return JSON.stringify([left, right]);
}
function makeInstruction(command, instructions) {
    var line = {
        command: command.toUpperCase(),
        instruction: ""
    };
    if (typeof instructions === 'string') {
        line.instruction = instructions;
    }
    if (instructions instanceof Array) {
        line.instruction = JSON.stringify(instructions);
    }
    if (typeof instructions === 'number') {
        line.instruction = instructions.toString();
    }
    return line;
}
function makeMultiInstructions(command, instructions) {
    if (typeof instructions === 'string') {
        return [makeInstruction(command, instructions)];
    }
    if (instructions instanceof Array) {
        var lines = [];
        var lastIndex = instructions.length - 1;
        for (var i = 0; i < instructions.length; i++) {
            var instruction = instructions[i];
            // Only the first line of a multi-line command contains the 'command'.
            if (i === 0) {
                lines.push(makeInstruction(command, instruction + " \\"));
                continue;
            }
            // All lines except the first in a multi-line instruction are prefixed with '&&'.
            // All lines except the last in a multi-line instruction are suffixed with '\'
            var suffix = i === lastIndex ? "" : " \\";
            lines.push(makeInstruction("", "&& " + instruction + suffix));
        }
        return lines;
    }
}
module.exports = Builder;
