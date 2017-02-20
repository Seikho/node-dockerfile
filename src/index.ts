import * as fs from 'fs'
import * as stream from 'stream'

export type Instruction = {
  command: string
  instruction: string
}

export interface DockerCallback {
  (error: any, content: string): void;
}

export class Builder {

  instructions: Instruction[] = [];

  from(image: string) {
    this.instructions.push(makeInstruction("FROM", image));
    return this;
  }

  maintainer(maintainer: string) {
    this.instructions.push(makeInstruction("MAINTAINER", maintainer));
    return this;
  }

  run(instructions: string | string[]) {
    const lines = makeMultiInstructions("RUN", instructions);
    this.instructions = this.instructions.concat(lines);
    return this;
  }

  cmd(instructions: string | string[]) {
    this.instructions.push(makeInstruction("CMD", instructions));
    return this;
  }

  label(key: string, value: string) {
    this.instructions.push(makeInstruction("LABEL", `${key} = ${value}`));
    return this;
  }

  expose(port: number) {
    this.instructions.push(makeInstruction("EXPOSE", port));
    return this;
  }

  env(key: string, value: string) {
    this.instructions.push(makeInstruction("ENV", `${key}="${value}"`));
    return this;
  }

  add(source: string, destination: string) {
    var line = combine(source, destination);
    this.instructions.push(makeInstruction("ADD", line));
    return this;
  }

  arg(key: string, value?: string) {
    this.instructions.push(makeInstruction("ARG", `${key}=${value || ''}`))
    return this
  }

  copy(source: string, destination: string) {
    this.instructions.push(makeInstruction("COPY", `${source} ${destination}`));
    return this;
  }

  entryPoint(instructions: string | string[]) {
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

  comment(comment: string) {
    this.instructions.push(makeInstruction("#", comment));
    return this;
  }

  newLine() {
    this.instructions.push(makeInstruction("", ""));
    return this;
  }

  write(location: string, replaceExisting: boolean, callback: DockerCallback) {
    var content = buildInstructionsString(this.instructions);
    writeDockerfile(content, location, replaceExisting, callback);
  }

  writeStream() {
    var content = buildInstructionsString(this.instructions);

    return new StringStream(content);
  }
}

class StringStream extends stream.Readable {
  buffer: string | null = null;

  constructor(buffer: string) {
    super();

    this.buffer = buffer;
  }

  _read(_: number): void {
    if (this.buffer !== null) {
      this.push(this.buffer);
      this.buffer = null;
    }

    this.push(null);
  }
}

function writeDockerfile(content: string, location: string, replaceExisting: boolean, callback: DockerCallback) {
  if (!location) {
    return
  }

  fs.readFile(location, readErr => {

    // Dockerfile doesn't exist, try and write it
    if (readErr) {
      const writeOpts = {
        encoding: "utf8"
      };

      fs.writeFile(
        location,
        content,
        writeOpts,
        writeErr => {
          callback(writeErr, content);
        });
      return;
    }

    // Dockerfile exists and we have permission to overwrite it
    if (replaceExisting) {
      fs.writeFile(location, content, writeErr => {
        callback(writeErr, content);
      });
      return;
    }

    //Dockerfile exists and we do not have permission to overwrite it
    callback("Error: Dockerfile already exists and do not have permission to overwrite", content);
    return;
  });
}

function buildInstructionsString(lines: { command: string, instruction: string }[]) {
  let file = "";
  for (const line of lines) {
    file += line.command + " " + line.instruction + "\n";
  }
  return file;
}

function combine(left: string, right: string) {
  return JSON.stringify([left, right]);
}

function makeInstruction(command: string, instructions: string | string[] | number): Instruction {
  const line = {
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

function makeMultiInstructions(command: string, instructions: string | string[]) {
  if (typeof instructions === 'string') {
    return [makeInstruction(command, instructions)];
  }

  const lines: Instruction[] = [];
  let lastIndex = instructions.length - 1;
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];

    // Only the first line of a multi-line command contains the 'command'.
    if (i === 0) {
      lines.push(makeInstruction(command, instruction + " \\"));
      continue;
    }

    // All lines except the first in a multi-line instruction are prefixed with '&&'.
    // All lines except the last in a multi-line instruction are suffixed with '\'
    const suffix = i === lastIndex ? "" : " \\";
    lines.push(makeInstruction("", "&& " + instruction + suffix));
  }
  return lines;
}