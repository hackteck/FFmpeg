export interface Emscripten {
    INITIAL_MEMORY: number;
    mainScriptUrlOrBlob: string;
    /** 
     * This method will be called when the runtime needs to load a file.
     * This lets you host for example on a CDN.
     * @see https://emscripten.org/docs/api_reference/module.html#Module.locateFile
     */
    locateFile(path: string, scriptDirectory: string): string;

    canvas?: HTMLCanvasElement;

    print(str: string): void;
    printErr(str: string): void;

    /** File operations in Emscripten.
     * It is used internally for all of Emscripten’s `libc` and `libcxx` file I/O.
     * @see https://emscripten.org/docs/api_reference/Filesystem-API.html#file-system-api
     */
    FS: {
        /** Sets up standard I/O devices for `stdin`, `stdout`, and `stderr`.
         * The devices are set up using the following (optional) callbacks.
         * If any of the callbacks throw an exception, it will be caught and handled as if the device malfunctioned.
         * @see https://emscripten.org/docs/api_reference/Filesystem-API.html#FS.init
        */
        init(
            /** Input callback. This will be called with no parameters whenever the program attempts to read from `stdin`. It should return an ASCII character code when data is available, or `null` when it isn’t. */
            input?: () => number | null,
            /** Output callback. This will be called with an ASCII character code whenever the program writes to `stdout`. It may also be called with `null` to flush the output. */
            output?:
                /** @param charCode The character code to write to `stdout`. */
                (charCode: number | null) => void,
            /** Error callback. This is similar to `output`, except it is called when data is written to `stderr`. */
            stderr?:
                /** @param charCode The character code to write to `stderr`. */
                (charCode: number | null) => void,
        ): void;
        writeFile(name: string, data: Uint8Array): void;
        readFile(path: string): Uint8Array;
    }

    preRun: ((module: Emscripten) => void)[];
    callMain(args: string[]): void;
    onExit(code: number): void;
}

export type EmscriptenModule = (params: Partial<Emscripten>) => Promise<Pick<Emscripten, "callMain">>

export interface readerResult {
    file: File,
    reader: FileReader,
    safeFilename: string,
}