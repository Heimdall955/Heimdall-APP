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

    // 2. Bluetooth permissions correctly scoped:
    //    - BLUETOOTH_SCAN with neverForLocation (Android 12+, no location needed)
    //    - ACCESS_FINE_LOCATION only up to Android 11 (required for legacy BLE scan)
    //    - Legacy BLUETOOTH / BLUETOOTH_ADMIN only up to Android 11
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }
    const permissions = manifest['uses-permission'];

    const upsertPermission = (name, attrs = {}) => {
      let perm = permissions.find((p) => p.$?.['android:name'] === name);
      if (!perm) {
        perm = { $: { 'android:name': name } };
        permissions.push(perm);
      }
      Object.assign(perm.$, attrs);
    };

    upsertPermission('android.permission.BLUETOOTH_SCAN', {
      'android:usesPermissionFlags': 'neverForLocation',
    });
    upsertPermission('android.permission.BLUETOOTH_CONNECT');
    upsertPermission('android.permission.ACCESS_FINE_LOCATION', {
      'android:maxSdkVersion': '30',
    });
    upsertPermission('android.permission.BLUETOOTH', {
      'android:maxSdkVersion': '30',
    });
    upsertPermission('android.permission.BLUETOOTH_ADMIN', {
      'android:maxSdkVersion': '30',
    });

    // 3. Fix content provider authority conflicts
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
