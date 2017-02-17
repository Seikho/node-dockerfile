import { Builder } from '../src'
import { expect } from 'chai'

describe('instruction tests', () => {
    const b = new Builder();

    it('will emit FROM', () => {
        expect(emit(b.from, 'test')).to.equal('FROM test\n');
    });

    it('will emit MAINTAINER', () => {
        expect(emit(b.maintainer, 'seikho')).to.equal('MAINTAINER seikho\n');
    });

    it('will emit RUN with a single argument', () => {
        expect(emit(b.run, 'instruction')).to.equal('RUN instruction\n');
    });

    it('will emit RUN with multiple arguments', () => {
        expect(emit(b.run, ['abc', 'def'])).to.equal('RUN abc \\\n && def\n');
    });

    it('will emit CMD with single argument', () => {
        expect(emit(b.cmd, 'abc')).to.equal('CMD abc\n');
    });

    it('will emit CMD with multiple arguments', () => {
        expect(emit(b.cmd, ['abc', 'def'])).to.equal('CMD ["abc","def"]\n');
    });

    it('will emit LABEL', () => {
        expect(emit(b.label, 'key', 'value')).to.equal('LABEL key = value\n');
    });

    it('will emit EXPOSE', () => {
        expect(emit(b.expose, 8080)).to.equal('EXPOSE 8080\n');
    });

    it('will emit ENV', () => {
        expect(emit(b.env, 'key', 'value')).to.equal('ENV key="value"\n')
    });

    it('will emit ADD', () => {
        expect(emit(b.add, '/source', '/destination')).to.equal('ADD ["/source","/destination"]\n');
    });

    it('will emit COPY', () => {
        expect(emit(b.copy, '/source', '/destination')).to.equal('COPY /source /destination\n');
    });

    it('will emit ENTRYPOINT with a single argument', () => {
        expect(emit(b.entryPoint, 'bash')).to.equal('ENTRYPOINT bash\n');
    });

    it('will emit ENTRYPOINT with a multiple arguments', () => {
        expect(emit(b.entryPoint, ['sudo', 'bash', '-'])).to.equal('ENTRYPOINT ["sudo","bash","-"]\n');
    });

    it('will emit VOLUME', () => {
        expect(emit(b.volume, '/some/volume')).to.equal('VOLUME /some/volume\n');
    });

    it('will emit USER', () => {
        expect(emit(b.user, 'seikho')).to.equal('USER seikho\n');
    });

    it('will emit WORKDIR', () => {
        expect(emit(b.workDir, '/work/dir')).to.equal('WORKDIR /work/dir\n');
    });

    it('will emit ONBUILD', () => {
        expect(emit(b.onBuild, 'do a thing')).to.equal('ONBUILD do a thing\n');
    });

    it('will emit COMMENT', () => {
        expect(emit(b.comment, 'this is a comment')).to.equal('# this is a comment\n');
    });

    it('will emit a blank line', () => {
        expect(emit(b.newLine)).to.equal(' \n');
    });

});

function emit(command: (...args: any[]) => any, ...instructions: any[]) {
    const b = new Builder();

    command.apply(b, instructions);

    return b.writeStream()
        .read()
        .toString();
}