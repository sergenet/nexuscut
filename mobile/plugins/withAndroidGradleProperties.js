const { withGradleProperties } = require('expo/config-plugins');

/**
 * Pins NexusCut's tuned Gradle daemon settings across `expo prebuild`.
 *
 * Why this exists: android/gradle.properties is regenerated from the Expo template, and
 * mobile/.gitignore ignores the whole /android directory, so the hand-tuned values below
 * are untracked. The template ships `-Xmx2048m -XX:MaxMetaspaceSize=512m` and no
 * `org.gradle.workers.max`, which on this machine let the daemon die during
 * dex/resource merging with "insufficient memory for the Java Runtime Environment".
 *
 * Only the three values that differ from the template are pinned; everything else is left
 * to the template so an Expo upgrade can still change defaults we never touched.
 */

const TUNED_PROPERTIES = {
  // 4 GB heap is comfortable on a 32 GB host; the heap dump makes the next OOM diagnosable.
  'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError',
  // Capping workers keeps peak native memory bounded during dex/resource merging.
  'org.gradle.workers.max': '4',
  'org.gradle.parallel': 'true',
};

/**
 * Sets a property in the parsed gradle.properties items, collapsing any duplicates
 * (the template never writes these twice, but a second application must not either —
 * duplicate keys are last-one-wins, which is exactly the kind of silent surprise this
 * plugin exists to prevent).
 */
function setProperty(items, key, value) {
  const matches = items.filter((item) => item.type === 'property' && item.key === key);
  if (matches.length === 0) {
    items.push({ type: 'property', key, value });
    return;
  }
  matches[0].value = value;
  for (let i = matches.length - 1; i >= 1; i--) {
    const extra = items.indexOf(matches[i]);
    if (extra !== -1) items.splice(extra, 1);
  }
}

module.exports = function withAndroidGradlePropertiesTuning(config) {
  return withGradleProperties(config, (configWithMod) => {
    const items = configWithMod.modResults;
    for (const [key, value] of Object.entries(TUNED_PROPERTIES)) {
      setProperty(items, key, value);
    }
    return configWithMod;
  });
};

// Exposed for tests; Expo only uses the default callable export.
module.exports.TUNED_PROPERTIES = TUNED_PROPERTIES;
module.exports.setProperty = setProperty;
