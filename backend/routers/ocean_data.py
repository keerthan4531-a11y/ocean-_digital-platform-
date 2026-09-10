"""
AquaTwin 3D - Ocean Data Router
Provides proxied, cached real oceanographic data for waves, currents, Argo, and buoys.
"""

from fastapi import APIRouter, Query
from datetime import datetime
from typing import Dict, Any, List

from services.open_meteo_client import fetch_real_waves, fetch_real_currents
from services.argo_client import fetch_real_argo_floats
from data_fetcher import get_real_incois_omni_buoys, get_real_underwater_gliders, get_real_ctd_stations
from ocean_processor import compute_model_vs_in_situ_validation, compute_vertical_transect, compute_isosurface_depth, generate_subsurface_currents

router = APIRouter(prefix="/api", tags=["Ocean Data"])

@router.get("/waves")
def get_live_waves() -> Dict[str, Any]:
    """
    Returns real Significant Wave Height (SWH), wave direction, and peak period
    fetched directly from Open-Meteo Marine API with server-side TTL caching.
    """
    points = fetch_real_waves()
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "Open-Meteo Marine API (Real SWH)",
        "count": len(points),
        "points": points
    }

@router.get("/currents")
def get_live_currents(depth_m: float = Query(0.0, description="Depth in meters: 0 (surface), 100, 500")) -> Dict[str, Any]:
    """
    Returns ocean current velocity vectors at specified depth (0m, 100m, 500m).
    """
    if depth_m == 0.0:
        vectors = fetch_real_currents()
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "source": "Open-Meteo Marine API (Surface u/v Currents)",
            "depth_m": 0.0,
            "count": len(vectors),
            "vectors": vectors
        }
    else:
        return generate_subsurface_currents(depth_m=depth_m)

@router.get("/subsurface-currents")
def get_subsurface_currents(depth_m: float = Query(100.0, description="Depth level in meters (0, 100, 500)")) -> Dict[str, Any]:
    """
    Returns depth-stratified current vectors at 0m, 100m, or 500m.
    """
    return generate_subsurface_currents(depth_m=depth_m)

@router.get("/argo")
def get_live_argo() -> Dict[str, Any]:
    """
    Returns active Argo profiling floats and real CTD profiles from Global Argo GDAC / Argovis.
    """
    floats = fetch_real_argo_floats()
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "Global Argo GDAC / Argovis",
        "count": len(floats),
        "floats": floats
    }

@router.get("/buoys")
def get_live_buoys() -> Dict[str, Any]:
    """
    Returns verified positions and telemetry for INCOIS OMNI moored buoys in the Northern Indian Ocean.
    """
    buoys = get_real_incois_omni_buoys()
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "MoES / INCOIS OMNI Network & NOAA NDBC",
        "count": len(buoys),
        "buoys": buoys
    }

@router.get("/gliders")
def get_live_gliders() -> Dict[str, Any]:
    """
    Returns active autonomous underwater glider missions with sawtooth profiles and BGC sensors.
    """
    gliders = get_real_underwater_gliders()
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "INCOIS / NIOT Autonomous Glider Network",
        "count": len(gliders),
        "gliders": gliders
    }

@router.get("/ctd-stations")
def get_live_ctd_stations() -> Dict[str, Any]:
    """
    Returns calibrated CTD rosette cast stations from research vessel cruises.
    """
    stations = get_real_ctd_stations()
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "ORV Sagar Kanya / Sagar Nidhi Hydrographic Casts",
        "count": len(stations),
        "stations": stations
    }

@router.get("/isosurface")
def get_ocean_isosurface(
    target_temp_c: float = Query(26.0, description="Target isotherm temperature in °C (e.g. 26.0 for D26 / TCHP, 20.0 for D20)"),
    resolution: float = Query(2.0, description="Grid resolution in degrees")
) -> Dict[str, Any]:
    """
    Computes the 3D depth of a specific thermal isosurface across the Indian Ocean basin.
    """
    return compute_isosurface_depth(target_temp_c=target_temp_c, resolution_deg=resolution)

@router.get("/validation")
def get_validation_metrics() -> Dict[str, Any]:
    """
    Computes statistical model vs observation validation metrics (Residuals, RMSE, Bias, Skill Score).
    """
    buoys = get_real_incois_omni_buoys()
    return compute_model_vs_in_situ_validation(buoys)

@router.get("/transect")
def get_vertical_transect(
    lat1: float = Query(13.08, description="Start latitude (e.g. Chennai)"),
    lon1: float = Query(80.27, description="Start longitude"),
    lat2: float = Query(11.62, description="End latitude (e.g. Port Blair)"),
    lon2: float = Query(92.72, description="End longitude"),
    samples: int = Query(15, description="Number of cross-section sample nodes")
) -> Dict[str, Any]:
    """
    Returns a 3D vertical water-column cross-section from surface down to 2000m depth.
    """
    return compute_vertical_transect(
        start_coords=(lat1, lon1),
        end_coords=(lat2, lon2),
        num_samples=samples
    )

