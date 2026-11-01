// Checks every campaign under src/data/campaigns for broken references. Run: node tools/validate_campaigns.js
// Exit code 1 when there are errors; warnings do not fail the run.
// Design: todo/location-scaneario-structure-thought-design.txt (DECISION), todo/world_data_design.md.

const fs = require('fs');
const path = require('path');

const CAMPAIGNS_DIR = path.join(__dirname, '..', 'src', 'data', 'campaigns');
const RESERVED_RUN_FLAGS = ['battle_won', 'battle_lost']; // engine-provided temporary flags, never declared
const CLEARED_PREFIX = 'cleared:';

const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`${rel(file)}: cannot parse JSON (${e.message})`);
    return null;
  }
}

const rel = (file) => path.relative(path.join(__dirname, '..'), file);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

// Every game_event, including those nested in `if` branches.
function* allEvents(events = []) {
  for (const event of events) {
    yield event;
    if (event.type === 'if') {
      yield* allEvents(event.then);
      yield* allEvents(event.else);
    }
  }
}

function loadCampaign(campaignDir) {
  const campaignFile = path.join(campaignDir, 'campaign.json');
  const campaign = readJson(campaignFile);
  if (!campaign) return null;

  const bucket = { campaign, campaignFile, maps: {}, locations: {}, scenarios: {}, battles: {}, flags: {}, files: {} };
  const byFolder = { locations: 'locations', scenarios: 'scenarios', battles: 'battles' };

  for (const file of walk(campaignDir)) {
    if (!file.endsWith('.json') || file === campaignFile) continue;
    const content = readJson(file);
    if (!content) continue;
    const name = path.basename(file);
    const folder = path.basename(path.dirname(file));
    if (name === 'map.json') addUnique(bucket.maps, content.id, content, file);
    else if (name === 'flags.json') Object.assign(bucket.flags, content);
    else if (byFolder[folder]) addUnique(bucket[byFolder[folder]], content.id, content, file);
  }
  return bucket;
}

function addUnique(group, id, content, file) {
  if (!id) return errors.push(`${rel(file)}: missing "id"`);
  if (group[id]) return errors.push(`${rel(file)}: duplicate id "${id}"`);
  group[id] = { ...content, __file: file };
}

// Checks one `requires` list. where = a label for messages.
function checkRequires(c, requires = [], where) {
  for (const entry of requires) {
    if (typeof entry === 'string') {
      checkFlagName(c, entry, where, { allowRunFlags: true });
    } else if (entry && typeof entry.cleared === 'string') {
      if (!c.scenarios[entry.cleared]) errors.push(`${where}: requires { cleared: "${entry.cleared}" } but no scenario has that id`);
    } else {
      errors.push(`${where}: unknown requires entry ${JSON.stringify(entry)}`);
    }
  }
}

function checkFlagName(c, flag, where, { allowRunFlags = false } = {}) {
  if (flag.startsWith(CLEARED_PREFIX)) {
    const id = flag.slice(CLEARED_PREFIX.length);
    if (!c.scenarios[id]) errors.push(`${where}: flag "${flag}" names scenario "${id}" which does not exist`);
    return;
  }
  if (allowRunFlags && RESERVED_RUN_FLAGS.includes(flag)) return;
  if (!(flag in c.flags)) errors.push(`${where}: flag "${flag}" is not declared in flags.json`);
}

function checkCampaign(c) {
  const name = c.campaign.id ?? rel(c.campaignFile);

  // campaign -> maps
  for (const worldId of c.campaign.worlds ?? []) {
    if (!c.maps[worldId]) errors.push(`${name}: campaign.json lists world "${worldId}" but no map.json has that id`);
  }

  // maps -> locations
  const placedLocations = new Set();
  for (const map of Object.values(c.maps)) {
    for (const locationId of map.locations ?? []) {
      placedLocations.add(locationId);
      if (!c.locations[locationId]) errors.push(`${rel(map.__file)}: lists location "${locationId}" which does not exist`);
    }
  }

  // locations -> scenarios
  const listedScenarios = new Set();
  for (const location of Object.values(c.locations)) {
    const where = rel(location.__file);
    if (!placedLocations.has(location.id)) warnings.push(`${where}: location is not listed in any map.json`);
    checkRequires(c, location.requires, `${where} (location requires)`);
    if (!Array.isArray(location.scenarios) || location.scenarios.some(id => typeof id !== 'string')) {
      errors.push(`${where}: "scenarios" must be a flat list of scenario ids`);
      continue;
    }
    for (const scenarioId of location.scenarios) {
      listedScenarios.add(scenarioId);
      if (!c.scenarios[scenarioId]) errors.push(`${where}: lists scenario "${scenarioId}" which does not exist`);
    }
  }

  // scenarios
  for (const scenario of Object.values(c.scenarios)) {
    const where = rel(scenario.__file);
    if (!listedScenarios.has(scenario.id)) warnings.push(`${where}: scenario is not listed by any location`);
    checkRequires(c, scenario.requires, `${where} (scenario requires)`);

    let setsOwnClearedFlag = false;
    for (const event of allEvents(scenario.game_events)) {
      if (event.type === 'if') checkRequires(c, event.requires, `${where} (if)`);
      if (event.type === 'battle' && !c.battles[event.battle_id]) {
        errors.push(`${where}: battle "${event.battle_id}" does not exist`);
      }
      if (event.type === 'set_flag') {
        if (typeof event.flag !== 'string') errors.push(`${where}: set_flag without a string "flag"`);
        else {
          checkFlagName(c, event.flag, `${where} (set_flag)`);
          if (event.flag === CLEARED_PREFIX + scenario.id) setsOwnClearedFlag = true;
        }
      }
    }
    if (!setsOwnClearedFlag) {
      warnings.push(`${where}: never sets "${CLEARED_PREFIX}${scenario.id}", so it can never be cleared (forgot set_flag?)`);
    }
  }
}

const campaignDirs = fs.readdirSync(CAMPAIGNS_DIR, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(CAMPAIGNS_DIR, entry.name, 'campaign.json')))
  .map(entry => path.join(CAMPAIGNS_DIR, entry.name));

for (const dir of campaignDirs) {
  const campaign = loadCampaign(dir);
  if (campaign) checkCampaign(campaign);
}

warnings.forEach(message => console.log('WARN  ' + message));
errors.forEach(message => console.log('ERROR ' + message));
console.log(`\n${campaignDirs.length} campaign(s) checked: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
