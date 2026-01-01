const usedNonces = new Map();
const TTL_MS = 60 * 1000; // 1 minute

function isNonceUsed(nonce) {
  const timestamp = usedNonces.get(nonce);
  if (!timestamp) return false;

  if (Date.now() - timestamp > TTL_MS) {
    usedNonces.delete(nonce);
    return false;
  }

  return true;
}

function markNonceUsed(nonce) {
  usedNonces.set(nonce, Date.now());
}

module.exports = {
  isNonceUsed,
  markNonceUsed
};
