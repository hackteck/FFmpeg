import type { Emscripten, EmscriptenModule } from "./emscripten.d";
import { createBlobFromSource, loadScript } from "./emscripten";

export type encodeArgs = ["ffmpeg" | "ffprobe", ...string[]];
declare var _createFFmpeg: EmscriptenModule;

const FFmpegBase = (globalThis.location?.origin || ".") + "/FFmpeg-wasm";

function getScriptsContent() {
  let mainContent = "";
  let workerContent = "";
  return async function () {
    if (!mainContent) mainContent = await (await fetch(`${FFmpegBase}/ffmpeg.js`)).text();
    if (!workerContent)
      workerContent = await (await fetch(`${FFmpegBase}/ffmpeg.worker.js`)).text();
    return { mainContent, workerContent };
  };
}

export function createFFmpeg<T = string>(args: encodeArgs, preRun: Emscripten["preRun"] = []) {
  const scriptsContent = getScriptsContent();

  return new Promise<{ output: T; Module: Emscripten }>(async (resolve, reject) => {
    if (typeof _createFFmpeg === "undefined") {
      try {
        await loadScript(`${FFmpegBase}/ffmpeg.js`);
      } catch (error) {
        console.error("Cant load script", error);
        return null;
      }
    }

    // scripts contents (boost startup time)
    const { mainContent, workerContent } = await scriptsContent();

    // stdin
    let stdin = "";

    // main module
    const Module = await _createFFmpeg({
      mainScriptUrlOrBlob: createBlobFromSource(mainContent),
      locateFile(path: string, scriptDirectory: string) {
        switch (path) {
          // boost startup time by loading the worker file inline
          case "ffmpeg.worker.js":
            return createBlobFromSource(workerContent);
          // default location
          default:
            return scriptDirectory + path;
        }
      },
      print: console.log.bind(null, "FFmpeg:"),
      printErr: console.warn.bind(null, "FFmpeg:"),
      preRun: [
        // stdin/stdout
        function (Module: Emscripten) {
          Module.FS.init(
            () => null,
            (charCode) => {
              if (charCode === null) {
                debugger;
              } else stdin += String.fromCharCode(charCode);
            }
          );
        },
      ].concat(preRun),
      async onExit(code: number) {
        if (code === 0) {
          let output: any = stdin;
          try {
            output = JSON.parse(stdin);
          } catch { }
          //@ts-ignore
          resolve({ output, Module });
        } else reject(new Error(`FFmpeg exited with code ${code}`));
      },
    });

    // run ffmpeg
    Module.callMain(args);
  });
}
