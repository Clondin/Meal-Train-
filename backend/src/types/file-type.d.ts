declare module 'file-type' {
  export function fileTypeFromBuffer(
    input: Uint8Array | Buffer
  ): Promise<{ ext: string; mime: string } | undefined>;
}
