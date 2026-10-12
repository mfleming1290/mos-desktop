// Local delivery helper; does not connect to or modify MOS.
import {mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import config from '../page/plugin.config.js';
const root = path.resolve(import.meta.dirname, '..');
const version = config.version;
assert.match(version,/^\d+\.\d+\.\d+$/);
const previousVersion=process.argv[2];
assert.match(previousVersion??'',/^\d+\.\d+\.\d+$/, 'Supply the installed rollback version');
const deliveryRoot=path.resolve(root,process.argv[3]??`artifacts/layout-test-${version}`);
assert(deliveryRoot.startsWith(path.join(root,'artifacts')+path.sep),'Delivery must be under artifacts');
const output = path.join(deliveryRoot, 'drop-in');
assert(!existsSync(output), 'Refusing to overwrite delivery');
const filename = `desktop_${version}-1+mos-plugin_all.deb`;
const source = path.join(deliveryRoot, filename);
const bytes = readFileSync(source);
const sha = createHash('sha256').update(bytes).digest('hex');
assert.equal(sha,readFileSync(source+'.sha256','utf8').trim().split(/\s+/)[0]);
const tag = path.join(output, 'desktop', version);
mkdirSync(tag, {recursive:true});
copyFileSync(source, path.join(tag, filename));
copyFileSync(path.join(root, 'page/plugin.config.js'), path.join(tag, 'plugin.config.js'));
writeFileSync(path.join(tag, filename+'.sha256'), `${sha}  ${filename}\n`);
writeFileSync(path.join(tag, filename+'.md5'), `${createHash('md5').update(bytes).digest('hex')}  ${filename}\n`);
writeFileSync(path.join(output, 'desktop/template.json'), JSON.stringify({
  name:'desktop', displayName:config.displayName, description:config.description,
  version, tag:version, repository:config.homepage, driver:false, settings:true,
  icon:config.icon, author:config.author, donate:null,
  support:config.homepage+'/issues', homepage:config.homepage
}, null, 2)+'\n');
writeFileSync(path.join(output, 'README.txt'), `MOS Desktop 0.2.3 LOCAL L1 TEST CANDIDATE — NOT ACCEPTED\n\nExtract this archive into a staging directory, NOT straight over /boot.\nIt contains desktop/template.json and desktop/0.2.3/{deb,checksums,plugin.config.js}.\nNo settings.json is supplied: preserve existing settings and browser layouts.\nNo functions/staticfiles are required by this frontend-only plugin.\n\nManual activation on MOS (root), after uploading/extracting under /tmp/mos-desktop-test:\n\ncd /tmp/mos-desktop-test/desktop/0.2.3\nsha256sum -c ${filename}.sha256\n# Stop if checksum verification fails.\n# Confirm existing installed metadata is 0.2.2 before continuing:\ncat /boot/optional/plugins/desktop/template.json\n# Stop if the backup name already exists; do not overwrite it.\ntest ! -e /boot/optional/plugins/desktop/template.pre-layout-0.2.3.json\n# Only continue when the preceding test succeeds.\ncp -p /boot/optional/plugins/desktop/template.json /boot/optional/plugins/desktop/template.pre-layout-0.2.3.json\n# Stop if the candidate destination already exists.\ntest ! -e /boot/optional/plugins/desktop/0.2.3\n# Only continue when the preceding test succeeds.\ncp -a /tmp/mos-desktop-test/desktop/0.2.3 /boot/optional/plugins/desktop/\nchmod 700 /boot/optional/plugins/desktop/0.2.3\nchmod 600 /boot/optional/plugins/desktop/0.2.3/*\ndpkg -i /boot/optional/plugins/desktop/0.2.3/${filename}\n# Only after dpkg succeeds, activate metadata:\ncp /tmp/mos-desktop-test/desktop/template.json /boot/optional/plugins/desktop/template.json\nchmod 600 /boot/optional/plugins/desktop/template.json\n\nRetain the entire existing 0.2.2 folder. Do not reboot to activate.\nHard-refresh /plugins/desktop through the same HTTPS/localhost origin.\nVerify the candidate version label/24px strip, move+resize autosave and refresh restoration,\nand Escape drag cancellation. Docking/tabs are not enabled.\n\nRollback (root): reinstall the retained 0.2.2 deb, restore the backed-up template,\nthen MOVE the 0.2.3 directory OUTSIDE /boot/optional/plugins/desktop\n(e.g. /boot/optional/desktop-layout-test-0.2.3-disabled, only if absent).\nMOS boot selects the highest numeric version folder, so metadata rollback alone\nis insufficient. Preserve settings.json and all browser storage throughout.\n\nThis is not a published GitHub tag or Hub update; Hub checks may not resolve it.\nNo source, credentials, settings, hooks or automatic installer are bundled.\nPackage SHA256: ${sha}\n`.replaceAll('0.2.3',version).replaceAll('0.2.2',previousVersion).replace('LOCAL L1 TEST CANDIDATE','LOCAL LAYOUT TEST CANDIDATE').replace('Docking/tabs are not enabled.','Tiling, tabs and explicit docking previews are enabled. Test preview cancellation, tab switching, reload, and return to Freeform. Arrangement records use a separate v2 key; the prior v1 record is preserved.'));
console.log(JSON.stringify({output, sha256:sha, installed:false, published:false}));
