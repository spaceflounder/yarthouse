import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
import { decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

const VERSION = '1.0.0a';
const zipFile = `https://github.com/spaceflounder/yart-shell/archive/refs/heads/main.zip`;

const helpUrl = `https://github.com/spaceflounder/yart-shell/wiki/YAML-Adventure-RunTime`;

const usageMsg = `

usage:
yarthouse [PROJECT NAME]

`


const finishMsg = (projectName: string) => `

Edit ${projectName}/gameInfo.yaml to get started!

Read the docs at ${helpUrl}

To run new story, type
%ccd ${projectName}
deno task dev

`



function generateIFID() {

  const randomInt = () => Math.floor(Math.random() * 16);

  const generateHex = (size: number) => [...Array(size)].
      map(() => randomInt().
      toString(16)).
      join('');

  return [
      generateHex(8),
      generateHex(4),
      generateHex(4),
      generateHex(4),
      generateHex(12),
  ].
  join('-').
  toUpperCase();

}


async function downloadFile(src: string, dest: string) {
  
  try {
    const fileObj = await download(src, {dir: './', file: dest});
    return fileObj;
  } catch (err) {
    console.log(err)
  }

}


async function finishNewGame(name: string) {

  const ifid = generateIFID();
  let gameInfo = await Deno.readTextFile(`${name}/gameInfo.yaml`);
  gameInfo = gameInfo.replace('$IFID$', ifid);
  await Deno.writeTextFile(`${name}/gameInfo.yaml`, gameInfo);
  let indexHtml = await Deno.readTextFile(`./${name}/dist/index.html`);
  indexHtml = indexHtml.replace('$IFID$', ifid);
  await Deno.writeTextFile(`${name}/dist/index.html`, indexHtml);

}


async function run() {
  const token = new Date().getTime().toString();
  const tempName = `tf${token}.zip`;
  const tempDir = `td${token}`;
  console.log(`%cYART Game Creation Tool ${VERSION}`, `color: cyan`);
  console.log(`--------------------------------------`);
  const args = Deno.args;
  if (args.length !== 1) {
    console.log(usageMsg);
    return;
  }
  const project_name = Deno.args[0] ?? 'my_game';
  console.log(`Downloading project template...`);
  await downloadFile(zipFile, tempName);
  await decompress(tempName, tempDir);
  console.log(`Creating ${project_name}...`);
  setTimeout(async () => {
    console.log(`Creating the ${project_name} folder...`);
    await Deno.rename(`${tempDir}/yart-main`, project_name ?? 'new_game');
    await Deno.remove(tempDir);
    await Deno.remove(tempName);
    setTimeout(async () => {
      console.log(`Finishing ${project_name} creation...`);
      await finishNewGame(project_name);
      console.log(`New project ${project_name} complete!`);
      console.log(finishMsg(project_name), `color: cyan`);
    }, 100);
  }, 100);
}

run();
