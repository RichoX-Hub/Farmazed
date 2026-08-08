const { Storage } = require('@google-cloud/storage');

const storage = new Storage({ projectId: 'farmazed' });
const BUCKET  = process.env.GCS_BUCKET || 'farmazed-docs';
const bucket  = storage.bucket(BUCKET);

/**
 * Upload a file buffer to Cloud Storage.
 * Returns the GCS path (gs://...) and a 1-hour signed URL.
 */
async function uploadFile(caseId, docId, originalName, buffer, mimeType) {
  const ext      = originalName.split('.').pop();
  const gcsPath  = `cases/${caseId}/${docId}.${ext}`;
  const file     = bucket.file(gcsPath);

  await file.save(buffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  const [signedUrl] = await file.getSignedUrl({
    action:  'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  return {
    gcsPath:    `gs://${BUCKET}/${gcsPath}`,
    signedUrl,
    storagePath: gcsPath,
  };
}

/**
 * Generate a fresh 1-hour signed URL for an existing GCS file.
 */
async function getSignedUrl(storagePath) {
  const file = bucket.file(storagePath);
  const [url] = await file.getSignedUrl({
    action:  'read',
    expires: Date.now() + 60 * 60 * 1000,
  });
  return url;
}

/**
 * Delete a file from Cloud Storage.
 */
async function deleteFile(storagePath) {
  const file = bucket.file(storagePath);
  await file.delete({ ignoreNotFound: true });
}

module.exports = { uploadFile, getSignedUrl, deleteFile };
