import { OmniBuoy, ArgoFloat } from '../types/ocean';
import { REAL_OMNI_BUOYS } from '../data/realOmniBuoys';
import { REAL_ARGO_FLOATS } from '../data/realArgoFloats';

export async function fetchInSituBuoys(): Promise<OmniBuoy[]> {
  try {
    const res = await fetch('/api/ocean/in-situ/buoys', { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return data.buoys;
    }
  } catch {
    // fallback
  }
  return REAL_OMNI_BUOYS;
}

export async function fetchInSituArgoFloats(): Promise<ArgoFloat[]> {
  try {
    const res = await fetch('/api/ocean/in-situ/argo', { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return data.floats;
    }
  } catch {
    // fallback
  }
  return REAL_ARGO_FLOATS;
}
