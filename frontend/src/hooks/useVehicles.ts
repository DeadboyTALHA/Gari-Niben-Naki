'use client';
import { useState, useEffect, useCallback } from 'react';
import { vehiclesApi } from '@/lib/api';
import { Vehicle, VehicleFilters, VehicleListResponse } from '@/types';

// Hook for the car listing page — handles fetching, loading, and filtering
export function useVehicles(initialFilters: VehicleFilters = {}) {
  const [data, setData]       = useState<VehicleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vehiclesApi.list(filters);
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    vehicles:   data?.vehicles ?? [],
    total:      data?.total ?? 0,
    totalPages: data?.total_pages ?? 1,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetch,
  };
}

// Hook for a single vehicle detail page
export function useVehicle(id: number) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    vehiclesApi.get(id)
      .then(res => setVehicle(res.data))
      .catch(e => setError(e.response?.data?.detail || 'Car not found'))
      .finally(() => setLoading(false));
  }, [id]);

  return { vehicle, loading, error };
}