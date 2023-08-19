import type { encodeArgs } from "./FFmpeg";

export function transcodeVideoArgs(files: string[]): encodeArgs {
    const outputFilename = "output.mp4";
    const size = "300:300";
    const args = [
        "-nostdin",
        "-hide_banner",
        files.map(filename => `-i ${filename}`).join(" "),
        "-codec:v libx264 -pix_fmt yuv420p -preset ultrafast",
        "-filter_complex",
        [
            `[0:v]scale=${size}:force_original_aspect_ratio=decrease,setsar=1,pad=${size}:-1:-1:color=black[v0]`,
            `[1:v]scale=${size}:force_original_aspect_ratio=decrease,setsar=1,pad=${size}:-1:-1:color=black[v1]`,
            `[v0][v1]concat=n=2:v=1[outVideo]`,
            //`[0:a][1:a]concat=n=2:v=0:a=1[outAudio]`,
        ].join(";"),
        "-map [outVideo]",
        //"-map [outAudio]",
        outputFilename
    ].join(" ").split(" ");


    return ["ffmpeg", ...args];
}

export function trimVideo(): encodeArgs {
    const args = [
        `-nostdin`,
        `-ss 00:00:00`,
        `-to 00:00:03`,
        `-i 0.mp4`,
        `-c copy`,
        `output.mp4`,
    ].join(" ").split(" ");
    return ["ffmpeg", ...args]
}

export function glslTransition(): encodeArgs {
    const args = [
        `-nostdin`,
        `-i 0.mp4`,
        `-i 1.mp4`,
        `-i 2.mp4`,
        `-codec:v libx264 -pix_fmt yuv420p -preset ultrafast`,
        `-filter_complex gltransition`,
        `-y output.mp4`,
    ].join(" ").split(" ");
    return ["ffmpeg", ...args];
}

export function glsl(): encodeArgs {
    const args = [
        `-nostdin`,
        `-i 0.mp4`,
        `-i 1.mp4`,
        `-filter_complex glsl`,
        `-y output.mp4`,
    ].join(" ").split(" ");
    return ["ffmpeg", ...args];
}

export function psnr(): encodeArgs {
    const args = [
        `-nostdin`,
        `-i 0.mp4`,
        `-i 1.mp4`,
        `-i 2.mp4`,
        `-codec:v libx264 -pix_fmt yuv420p -preset ultrafast`,
        `-filter_complex psnr`,
        `-y output.mp4`,
    ].join(" ").split(" ");
    return ["ffmpeg", ...args];
}

export function dissolve(): encodeArgs {
    const args = [
        `-nostdin`,
        `-i 0.mp4`,
        `-i 1.mp4`,
        `-codec:v libx264 -pix_fmt yuv420p -preset ultrafast`,
        `-filter_complex xfade=transition=dissolve:duration=3:offset=3`,
        `-y output.mp4`,
    ].join(" ").split(" ");
    return ["ffmpeg", ...args];
}