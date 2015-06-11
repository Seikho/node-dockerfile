declare module "node-dockerfile" {
	export = DockerFileBuilder;
}

interface DockerFileBuilder {
	from(image: string): DockerFileBuilder;
	maintainer(maintainer: string): DockerFileBuilder;
	run(instructions: string|string[]): DockerFileBuilder;
	cmd(instructions: string|string[]): DockerFileBuilder;
	label(label: string|string[]): DockerFileBuilder;
	expose(port: number): DockerFileBuilder;
	env(key: string, value: string): DockerFileBuilder;
	add(source: string, destination: string): DockerFileBuilder;
	copy(source: string, destination: string): DockerFileBuilder;
	entryPoint(instructions: string|string[]): DockerFileBuilder;
	volume(volume: string): DockerFileBuilder;
	workDir(path: string): DockerFileBuilder;
	onBuild(instructions: string): DockerFileBuilder;
	write(writeLocation?: string, replaceExisting?: boolean): string;
}