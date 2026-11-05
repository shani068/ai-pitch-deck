import "server-only";

import ImageKit, { toFile } from "@imagekit/nodejs";

let imagekitClient: ImageKit | null = null;

function getImageKit(): ImageKit {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not set");
  }

  imagekitClient ??= new ImageKit({ privateKey });
  return imagekitClient;
}

/**
 * Uploads `buffer` to `folder/fileName` and returns its URL. The name is kept as given and an
 * existing file at that path is replaced, so uploading the same path twice leaves one file.
 */
export async function uploadImage(
  buffer: Buffer,
  { fileName, folder }: { fileName: string; folder: string },
): Promise<string> {
  const response = await getImageKit().files.upload({
    file: await toFile(buffer, fileName),
    fileName,
    folder,
    useUniqueFileName: false,
    overwriteFile: true,
  });

  if (!response.url) {
    throw new Error("ImageKit returned no URL for the uploaded image");
  }

  return response.url;
}
