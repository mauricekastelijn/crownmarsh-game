import {execFileSync} from 'node:child_process';
for(const name of ['engine','game','visuals','software'])execFileSync(process.execPath,['--check',`dist/${name}.js`],{stdio:'inherit'});
console.log('All game modules parse successfully.');
