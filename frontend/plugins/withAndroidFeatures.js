const { withAndroidManifest } = require('@expo/config-plugins');

const NEW_PACKAGE = 'app.emergent.hanigpsfixf4b1b81d';
const OLD_PACKAGE = 'com.heimdall.app';

const withAndroidFeatures = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // 1. Mark hardware features as optional (Google Play compliance)
    if (!manifest['uses-feature']) {
      manifest['uses-feature'] = [];
    }

    const features = [
      'android.hardware.bluetooth',
      'android.hardware.bluetooth_le',
      'android.hardware.camera',
      'android.hardware.camera.autofocus',
    ];

    features.forEach((feature) => {
      const exists = manifest['uses-feature'].some(
        (f) => f.$?.['android:name'] === feature
      );
      if (!exists) {
        manifest['uses-feature'].push({
          $: {
            'android:name': feature,
            'android:required': 'false',
          },
        });
      }
    });

    // 2. Fix content provider authority conflicts
    // Replace old com.heimdall.app authorities with new package name
    const application = manifest.application?.[0];
    if (application?.provider) {
      application.provider.forEach((provider) => {
        const authorities = provider.$?.['android:authorities'];
        if (authorities && authorities.includes(OLD_PACKAGE)) {
          provider.$['android:authorities'] = authorities.replace(
            new RegExp(OLD_PACKAGE.replace(/\./g, '\\.'), 'g'),
            NEW_PACKAGE
          );
        }
      });
    }

    return config;
  });
};

module.exports = withAndroidFeatures;
