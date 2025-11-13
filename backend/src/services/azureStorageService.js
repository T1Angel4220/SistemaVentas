const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const { config } = require('../config/config');

let blobServiceClient = null;
let containerClient = null;
let initialized = false;

const getConnectionOptions = () => {
  const hasConnectionString = !!config.storage.connectionString;
  const hasAccountAndKey = !!config.storage.account && !!config.storage.key;

  if (hasConnectionString) {
    return {
      mode: 'connectionString',
      connectionString: config.storage.connectionString,
    };
  }

  if (hasAccountAndKey) {
    return {
      mode: 'sharedKey',
      account: config.storage.account,
      key: config.storage.key,
    };
  }

  return null;
};

const initialize = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  const options = getConnectionOptions();
  const container = config.storage.container;

  if (!options || !container) {
    console.warn('⚠️  Azure Blob Storage no configurado. Se usará almacenamiento local para imágenes.');
    return;
  }

  try {
    if (options.mode === 'connectionString') {
      blobServiceClient = BlobServiceClient.fromConnectionString(options.connectionString);
    } else {
      const credential = new StorageSharedKeyCredential(options.account, options.key);
      const url = config.storage.url || `https://${options.account}.blob.core.windows.net`;
      blobServiceClient = new BlobServiceClient(url, credential);
    }

    containerClient = blobServiceClient.getContainerClient(container);
  } catch (error) {
    console.error('❌ Error al inicializar Azure Blob Storage:', error.message);
    blobServiceClient = null;
    containerClient = null;
  }
};

const ensureContainer = async () => {
  initialize();
  if (!containerClient) {
    return false;
  }

  try {
    await containerClient.createIfNotExists();
    return true;
  } catch (error) {
    console.error('❌ No se pudo asegurar el contenedor de Azure Blob Storage:', error.message);
    return false;
  }
};

const getContainerClient = () => {
  initialize();
  return containerClient;
};

const isEnabled = () => {
  initialize();
  return !!containerClient;
};

const getBlobNameFromUrl = (url) => {
  if (!url || !isEnabled()) {
    return null;
  }

  try {
    const baseUrl = config.storage.url
      ? `${config.storage.url.replace(/\/+$/, '')}/${config.storage.container}`
      : containerClient.url;

    if (url.startsWith(baseUrl)) {
      return url.substring(baseUrl.length + 1);
    }

    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+/, '');
    const prefix = `${config.storage.container}/`;
    if (path.startsWith(prefix)) {
      return path.substring(prefix.length);
    }

    return path;
  } catch (error) {
    return null;
  }
};

const uploadBuffer = async (buffer, blobName, options = {}) => {
  if (!buffer || !blobName) {
    throw new Error('Buffer y nombre de blob son requeridos');
  }

  const container = getContainerClient();

  if (!container) {
    return null;
  }

  await ensureContainer();

  const blockBlobClient = container.getBlockBlobClient(blobName);

  const uploadOptions = {};
  if (options.contentType) {
    uploadOptions.blobHTTPHeaders = { blobContentType: options.contentType };
  }

  await blockBlobClient.uploadData(buffer, uploadOptions);

  return {
    url: blockBlobClient.url,
    blobName,
  };
};

const deleteBlob = async (blobNameOrUrl) => {
  if (!blobNameOrUrl) {
    return;
  }

  const container = getContainerClient();
  if (!container) {
    return;
  }

  const blobName = blobNameOrUrl.startsWith('http')
    ? getBlobNameFromUrl(blobNameOrUrl)
    : blobNameOrUrl;

  if (!blobName) {
    return;
  }

  try {
    await container.deleteBlob(blobName);
  } catch (error) {
    if (error.statusCode !== 404) {
      console.warn(`⚠️  No se pudo eliminar el blob ${blobName}:`, error.message);
    }
  }
};

const getPublicUrl = (blobName) => {
  if (!blobName) {
    return null;
  }

  if (blobName.startsWith('http')) {
    return blobName;
  }

  if (config.storage.url) {
    return `${config.storage.url.replace(/\/+$/, '')}/${config.storage.container}/${blobName}`;
  }

  const container = getContainerClient();
  if (!container) {
    return null;
  }

  return `${container.url}/${blobName}`;
};

module.exports = {
  isEnabled,
  uploadBuffer,
  deleteBlob,
  getPublicUrl,
  getBlobNameFromUrl,
};

