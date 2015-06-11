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
        var line = combine(source, destination);
        this.instructions.push(makeInstruction("COPY", line));
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
    Builder.prototype.write = function (location, replaceExisting) {
        //TODO: Refactor
        var file = buildInstructionsString(this.instructions);
        writeDockerfile(location, replaceExisting);
        return file;
    };
    return Builder;
})();
function writeDockerfile(location, replaceExisting) {
    if (!location)
        return;
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
