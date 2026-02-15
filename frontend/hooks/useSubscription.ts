import { useEffect, useState, useCallback } from 'react';
import { purchasesService, HeimdallSubscription } from '../services/purchases';
import { PurchasesPackage } from 'react-native-purchases';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<HeimdallSubscription>({
    isProUser: false,
    expirationDate: null,
    autoRenewEnabled: false,
    activeProduct: null,
  });
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        // Initialize purchases service
        await purchasesService.initialize();

        // Load available packages
        const availablePackages = await purchasesService.getAvailablePackages();
        setPackages(availablePackages);

        // Check current subscription status
        const currentStatus = await purchasesService.checkProStatus();
        setSubscription(currentStatus);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Subscription initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    try {
      setLoading(true);
      const result = await purchasesService.purchasePackage(pkg);

      if (result.success) {
        // Refresh subscription status
        const newStatus = await purchasesService.checkProStatus();
        setSubscription(newStatus);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      setLoading(true);
      const result = await purchasesService.restorePurchases();

      if (result.success && result.hasActiveSubscription) {
        const newStatus = await purchasesService.checkProStatus();
        setSubscription(newStatus);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, hasActiveSubscription: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const status = await purchasesService.checkProStatus();
      setSubscription(status);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    subscription,
    packages,
    loading,
    error,
    purchasePackage,
    restorePurchases,
    checkSubscriptionStatus,
    isProUser: subscription.isProUser,
    isSimulated: purchasesService.isInSimulatedMode(),
  };
};
