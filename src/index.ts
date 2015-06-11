import fs = require("fs");

class Builder implements DockerFileBuilder {
	constructor(){}
	instructions: { command: string, instruction: string }[] = [];
	
	from(image: string) {
		this.instructions.push(makeInstruction("FROM", image));
		return this;
	}
	
	maintainer(maintainer: string) {
		this.instructions.push(makeInstruction("MAINTAINER", maintainer));
		return this;
	}
	
	run(instructions: string|string[]) {
		var lines = makeMultiInstructions("RUN", instructions);
		this.instructions = this.instructions.concat(lines);
		return this;
	}
	
	cmd(instructions: string|string[]) {
		this.instructions.push(makeInstruction("CMD", instructions));
		return this;
	}
	
	label(key: string, value: string) {
		this.instructions.push(makeInstruction("LABEL", key + "=" + value));
		return this;
	}
	
	expose(port: number) {
		this.instructions.push(makeInstruction("EXPOSE", port));
		return this;
	}
	
	env(key: string, value: string) {
		this.instructions.push(makeInstruction("ENV", key + "=" + value));
		return this;
	}
	
	add(source: string, destination: string) {
		 var line = combine(source, destination);
		 this.instructions.push(makeInstruction("ADD", line));
		 return this;
	}
	
	copy(source: string, destination: string) {
		var line = combine(source, destination);
		this.instructions.push(makeInstruction("COPY", line));
		return this;
	}
	
	entryPoint(instructions: string|string[]) {
		this.instructions.push(makeInstruction("ENTRYPOINT", instructions))
		return this;
	}
	
	volume(volume: string) {
		this.instructions.push(makeInstruction("VOLUME", volume));
		return this;
	}
	
	user(user: string) {
		this.instructions.push(makeInstruction("USER", user));
		return this;
	}
	
	workDir(path: string) {
		this.instructions.push(makeInstruction("WORKDIR", path));
		return this;
	}
	
	onBuild(instructions: string) {
		this.instructions.push(makeInstruction("ONBUILD", instructions));
		return this;
	}
	
	write(location?: string, replaceExisting?: boolean) {
		//TODO: Refactor
		var file = buildInstructionsString(this.instructions);
		writeDockerfile(location, replaceExisting);
		return file;
	}
}

function writeDockerfile(location?: string, replaceExisting?: boolean) {
	if (!location) return;
	
}

function buildInstructionsString(lines: {command: string, instruction: string}[]) {
	var file = "";
	for (var l in lines) {
		var line = lines[l];
		file += line.command + " " + line.instruction + "\n";
	}
	return file;
}

function combine(left: string, right: string) {
	return JSON.stringify([left, right]);
}

function makeInstruction(command: string, instructions: string|string[]|number) {
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

function makeMultiInstructions(command: string, instructions: string|string[]) {
	if (typeof instructions === 'string') {
		return [makeInstruction(command, instructions)];
	}
	
	if (instructions instanceof Array) {
		var lines = [];
		var lastIndex = instructions.length-1;
		for (var i = 0;i < instructions.length; i++) {
			var instruction = instructions[i];
			
			// Only the first line of a multi-line command contains the 'command'.
			if (i === 0) {
				lines.push(makeInstruction(command, instruction + " \\"));
				continue;
			}
			
			// All lines except the first in a multi-line instruction are prefixed with '&&'.
			// All lines except the last in a multi-line instruction are suffixed with '\'
			var suffix = i === lastIndex? "":" \\";
			lines.push(makeInstruction("", "&& " + instruction + suffix));
		}
		return lines;
	}
}