// Compiles every variation (in both slots) plus the post/copy shaders with glslangValidator
// as GLSL ES 1.00. Usage: node tests/validate-shaders.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { feedbackFragment, POST_FRAG, COPY_FRAG, VERT, VARIATIONS, slotLayout, SLOT_VEC4 } from '../engine/shaders.js';

const dir = mkdtempSync(join(tmpdir(), 'fractility-glsl-'));
let fail = 0, n = 0;
function check(name, src, stage = 'frag') {
    const f = join(dir, name + '.' + stage);
    writeFileSync(f, '#version 100\n' + src);
    n++;
    try { execFileSync('glslangValidator', [f], { stdio: 'pipe' }); }
    catch (e) { fail++; console.error('FAIL', name, '\n' + (e.stdout || '') + (e.stderr || '')); }
}
check('vert', VERT, 'vert');
check('post', POST_FRAG);
check('copy', COPY_FRAG);
for (const v of VARIATIONS) {
    const keys = slotLayout(v.id);
    if (keys.length > SLOT_VEC4 * 4) { fail++; console.error('slot overflow', v.id); }
    check(`varA_${v.id}`, feedbackFragment(v.id, 1));
    check(`varB_${v.id}`, feedbackFragment(0, v.id));
}
console.log(`${n - fail}/${n} shaders compiled`);
process.exit(fail ? 1 : 0);
