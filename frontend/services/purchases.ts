import { Platform, Alert } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
  LOG_LEVEL,
  PurchasesOfferings,
} from 'react-native-purchases';

// RevenueCat API Keys - In production, use environment variables
const REVENUECAT_API_KEY_GOOGLE = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'goog_demo_key';
const REVENUECAT_API_KEY_APPLE = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || 'appl_demo_key';

export interface HeimdallSubscription {
  isProUser: boolean;
  expirationDate: Date | null;
  autoRenewEnabled: boolean;
  activeProduct: string | null;
}

class PurchasesService {
  private initialized = false;
  private isSimulated = true; // Set to true for demo/development

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Skip real initialization in web or demo mode
    if (Platform.OS === 'web' || this.isSimulated) {
      console.log('Purchases: Running in simulated mode');
      this.initialized = true;
      return;
    }

    try {
      // Set log level to debug during development
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      // Initialize with platform-specific API key
      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_API_KEY_APPLE
        : REVENUECAT_API_KEY_GOOGLE;

      await Purchases.configure({ apiKey });
      this.initialized = true;
      console.log('Purchases: Initialized successfully');
    } catch (error) {
      console.error('Purchases: Initialization failed', error);
      // Fall back to simulated mode
      this.isSimulated = true;
      this.initialized = true;
    }
  }

  async getAvailablePackages(): Promise<PurchasesPackage[]> {
    // Return simulated packages in demo mode
    if (this.isSimulated || Platform.OS === 'web') {
      return this.getSimulatedPackages();
    }

    try {
      const offerings = await Purchases.getOfferings();

      if (!offerings.current?.availablePackages) {
        console.warn('No offerings available');
        return [];
      }

      return offerings.current.availablePackages;
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
      return this.getSimulatedPackages();
    }
  }

  private getSimulatedPackages(): PurchasesPackage[] {
    // Return mock packages for demo/development
    return [
      {
        identifier: 'monthly',
        packageType: 'MONTHLY',
        product: {
          identifier: 'com.heimdall.pro.monthly',
          description: 'Heimdall PRO - Suscripción mensual',
          title: 'Mensual',
          priceString: '1,99 €',
          price: 1.99,
          currencyCode: 'EUR',
          introPrice: null,
          discounts: [],
          productCategory: 'SUBSCRIPTION',
          subscriptionPeriod: 'P1M',
        },
        offeringIdentifier: 'default',
        presentedOfferingContext: {
          offeringIdentifier: 'default',
        },
      } as any,
      {
        identifier: 'annual',
        packageType: 'ANNUAL',
        product: {
          identifier: 'com.heimdall.pro.yearly',
          description: 'Heimdall PRO - Suscripción anual',
          title: 'Anual',
          priceString: '14,99 €',
          price: 14.99,
          currencyCode: 'EUR',
          introPrice: null,
          discounts: [],
          productCategory: 'SUBSCRIPTION',
          subscriptionPeriod: 'P1Y',
        },
        offeringIdentifier: 'default',
        presentedOfferingContext: {
          offeringIdentifier: 'default',
        },
      } as any,
    ];
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; message: string }> {
    // Simulated purchase in demo mode
    if (this.isSimulated || Platform.OS === 'web') {
      return this.simulatePurchase(pkg);
    }

    try {
      const purchaseResult = await Purchases.purchasePackage(pkg);

      // Check if purchase is active
      const entitlements = purchaseResult.customerInfo.entitlements;
      const hasProEntitlement = entitlements.active['pro'] !== undefined;

      return {
        success: hasProEntitlement,
        message: hasProEntitlement
          ? '¡Bienvenido a Heimdall PRO!'
          : 'La compra se procesó pero el beneficio no está activo.',
      };
    } catch (error) {
      if (error instanceof PurchasesError) {
        if (error.code === 'PURCHASE_CANCELLED') {
          return {
            success: false,
            message: 'Compra cancelada por el usuario',
          };
        }
      }
      console.error('Purchase failed:', error);
      return {
        success: false,
        message: 'Error al procesar la compra. Inténtalo de nuevo.',
      };
    }
  }

  private async simulatePurchase(pkg: PurchasesPackage): Promise<{ success: boolean; message: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, always succeed
    return {
      success: true,
      message: `¡Suscripción ${pkg.packageType === 'ANNUAL' ? 'anual' : 'mensual'} activada! (MODO DEMO)`,
    };
  }

  async restorePurchases(): Promise<{ success: boolean; hasActiveSubscription: boolean }> {
    if (this.isSimulated || Platform.OS === 'web') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, hasActiveSubscription: false };
    }

    try {
      const customerInfo = await Purchases.restoreTransactions();
      const hasProEntitlement = customerInfo.entitlements.active['pro'] !== undefined;

      return {
        success: true,
        hasActiveSubscription: hasProEntitlement,
      };
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return {
        success: false,
        hasActiveSubscription: false,
      };
    }
  }

  async checkProStatus(): Promise<HeimdallSubscription> {
    const defaultStatus: HeimdallSubscription = {
      isProUser: false,
      expirationDate: null,
      autoRenewEnabled: false,
      activeProduct: null,
    };

    if (this.isSimulated || Platform.OS === 'web') {
      return defaultStatus;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const proEntitlement = customerInfo.entitlements.active['pro'];

      return {
        isProUser: proEntitlement !== undefined,
        expirationDate: proEntitlement
          ? new Date(proEntitlement.expirationDate || '')
          : null,
        autoRenewEnabled: proEntitlement?.willRenew ?? false,
        activeProduct: proEntitlement?.productIdentifier || null,
      };
    } catch (error) {
      console.error('Failed to check pro status:', error);
      return defaultStatus;
    }
  }

  isInSimulatedMode(): boolean {
    return this.isSimulated;
  }
}

export const purchasesService = new PurchasesService();
