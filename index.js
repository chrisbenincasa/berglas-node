const Storage = require("@google-cloud/storage").Storage;
const KeyManagementServiceClient = require("@google-cloud/kms")
  .KeyManagementServiceClient;
const crypto = require("crypto");

const BERGLAS_PREFIX = "berglas://";
const METADATA_KMS_KEY = "berglas-kms-key";
const GCM_NONCE_SIZE = 12;

const ALGORITHM = "aes-256-gcm";
const UTF8 = "utf-8";
const BASE64 = "base64";

const decipher = (dek, cipherText) => {
  let nonce = cipherText.slice(0, GCM_NONCE_SIZE);
  let toDecrypt = cipherText.slice(GCM_NONCE_SIZE);

  let cipher = crypto.createCipheriv(ALGORITHM, dek, nonce);
  return cipher.update(toDecrypt.slice(0, toDecrypt.length - 16));
};

/**
 * Resolves the value of a given secret by retrieving it from the relevant bucket and deciphering it.
 * @param {string} projectId Project ID used for the Storage client
 * @param {string} secretName The name of the secret to decipher, optionally prefixed with berglas:// for
 * easy use with environment variable values
 */
const resolve = async (projectId, secretName) => {
  if (!projectId || projectId.length === 0) {
    throw new Error("Project name required!");
  }

  let sanitizedName = secretName;

  if (sanitizedName.startsWith(BERGLAS_PREFIX)) {
    sanitizedName = sanitizedName.substring(BERGLAS_PREFIX.length);
  }

  let [bucket, object] = sanitizedName.split("/", 2);

  // Read the blob from storage
  const storageClient = new Storage({
    projectId
  });

  let [file, metadata] = await storageClient
    .bucket(bucket)
    .file(object)
    .get();

  let key = metadata.metadata[METADATA_KMS_KEY];

  let [contents, _] = await file.download();

  let [content1, content2] = contents.toString(UTF8).split(":");

  let encDek = Buffer.from(content1, BASE64);
  let cipherText = Buffer.from(content2, BASE64);

  const kmsClient = new KeyManagementServiceClient();

  let [kmsResp, _1] = await kmsClient.decrypt({
    name: key,
    ciphertext: Buffer.from(encDek),
    additionalAuthenticatedData: Buffer.from(object)
  });

  return decipher(kmsResp.plaintext, cipherText);
};

/**
 * Replace all environvment variables beginnging with "berglas://" with their resolved values
 * @param {string} projectId
 */
const substitute = async projectId => {
  const resolved = await Promise.all(
    Object.entries(process.env)
      .filter(([_, element]) => element.startsWith(BERGLAS_PREFIX))
      .map(async ([key, element]) => [key, await resolve(projectId, element)])
  );

  for (const [key, element] of resolved) {
    process.env[key] = element;
  }
};

module.exports = { resolve, substitute };
