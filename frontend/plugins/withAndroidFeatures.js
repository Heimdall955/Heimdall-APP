const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidFeatures = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

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

    return config;
  });
};

module.exports = withAndroidFeatures;
