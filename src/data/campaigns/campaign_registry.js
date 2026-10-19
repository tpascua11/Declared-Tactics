const ctx = require.context('./', true, /\.json$/);

// Underscore-prefixed folders (_Template) are examples, not playable campaigns.
const KIND_BY_FOLDER = { locations: 'locations', scenarios: 'scenarios', battles: 'battles' };

function emptyBucket(campaign) {
  return { campaign, maps: {}, locations: {}, scenarios: {}, battles: {}, flags: {} };
}

function addById(bucket, kind, item, key) {
  if (bucket[kind][item.id]) {
    throw new Error(`Duplicate ${kind} id "${item.id}" in campaign "${bucket.campaign.id}" (${key})`);
  }
  bucket[kind][item.id] = item;
}

function addFlags(bucket, flags, key) {
  for (const name of Object.keys(flags)) {
    if (bucket.flags[name]) {
      throw new Error(`Duplicate flag "${name}" in campaign "${bucket.campaign.id}" (${key})`);
    }
    bucket.flags[name] = flags[name];
  }
}

const keysByFolder = {};
for (const key of ctx.keys()) {
  const [, folder] = key.split('/');
  if (folder.startsWith('_')) continue;
  (keysByFolder[folder] ||= []).push(key);
}

export const CAMPAIGN_REGISTRY = {};

for (const [folder, keys] of Object.entries(keysByFolder)) {
  const campaignKey = keys.find(key => key === `./${folder}/campaign.json`);
  if (!campaignKey) throw new Error(`Campaign folder "${folder}" has no campaign.json`);
  const bucket = emptyBucket(ctx(campaignKey));
  CAMPAIGN_REGISTRY[bucket.campaign.id] = bucket;

  for (const key of keys) {
    if (key === campaignKey) continue;
    const file = ctx(key);
    const segments = key.split('/');
    const fileName = segments[segments.length - 1];
    const kind = KIND_BY_FOLDER[segments[segments.length - 2]];
    if (kind) addById(bucket, kind, file, key);
    else if (fileName === 'map.json') addById(bucket, 'maps', file, key);
    else if (fileName === 'flags.json') addFlags(bucket, file, key);
    else throw new Error(`Unrecognized campaign file ${key}`);
  }
}

export const getCampaign = (campaign_id) => CAMPAIGN_REGISTRY[campaign_id];
