"""
FastAPI Server for AquaTwin 3D Platform
Provides REST endpoints for 4D ocean models, in-situ buoys, Argo floats,
Model vs Observation validation, vertical transects, and live Open-Meteo proxies.
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from data_fetcher import get_real_incois_omni_buoys, get_real_argo_floats, fetch_open_meteo_marine, get_real_underwater_gliders, get_real_ctd_stations
from ocean_processor import generate_4d_model_grid, compute_model_vs_in_situ_validation, compute_vertical_transect, compute_isosurface_depth
from routers.ocean_data import router as ocean_router

app = FastAPI(
    title="AquaTwin 3D Ocean Data API",
    description="Backend API for 3D Ocean Digital Twin (MoES/INCOIS)",
    version="1.0.0"
)

# Enable CORS for frontend Vite/React access on ports 3000 and 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include real-time ocean data router (/api/waves, /api/currents, /api/argo, /api/buoys, /api/validation, /api/gliders, /api/ctd-stations, /api/isosurface)
app.include_router(ocean_router)

@app.get("/")
def read_root():
    return {
        "system": "AquaTwin 3D Ocean Engine",
        "status": "ONLINE",
        "supported_models": ["INCOIS-ROMS", "HYCOM", "WaveWatch-III", "Open-Meteo Marine"],
        "in_situ_sources": ["INCOIS OMNI Moored Buoys", "Global Argo GDAC", "NOAA NDBC", "INCOIS Gliders", "ORV Sagar Kanya CTD"]
    }

@app.get("/api/health")
def health_check():
    return {"status": "HEALTHY", "service": "AquaTwin-3D-Backend"}

@app.get("/api/ocean/model-grid")
def get_model_grid(
    depth_m: float = Query(0.0, description="Depth level in meters (0, 50, 100, 200, 500, 1000, 2000)"),
    resolution: float = Query(2.0, description="Spatial resolution in degrees")
):
    """
    Returns 4D numerical model grid points for the Northern Indian Ocean basin.
    """
    return generate_4d_model_grid(
        bbox=(5.0, 60.0, 25.0, 95.0),
        depth_m=depth_m,
        resolution_deg=resolution
    )

@app.get("/api/ocean/in-situ/buoys")
def get_buoys():
    buoys = get_real_incois_omni_buoys()
    return {
        "count": len(buoys),
        "source": "MoES / INCOIS OMNI Network & NOAA NDBC",
        "buoys": buoys
    }

@app.get("/api/ocean/in-situ/argo")
def get_argo_floats():
    floats = get_real_argo_floats()
    return {
        "count": len(floats),
        "source": "Global Argo Data Assembly Centre (GDAC) / INCOIS",
        "floats": floats
    }

@app.get("/api/ocean/in-situ/gliders")
def get_gliders():
    gliders = get_real_underwater_gliders()
    return {
        "count": len(gliders),
        "source": "INCOIS / NIOT Autonomous Glider Network",
        "gliders": gliders
    }

@app.get("/api/ocean/in-situ/ctd-stations")
def get_ctd_stations():
    stations = get_real_ctd_stations()
    return {
        "count": len(stations),
        "source": "ORV Sagar Kanya / Sagar Nidhi Hydrographic Casts",
        "stations": stations
    }

@app.get("/api/ocean/isosurface")
def get_isosurface(
    target_temp_c: float = Query(26.0, description="Target isotherm temperature in °C"),
    resolution: float = Query(2.0, description="Grid resolution in degrees")
):
    return compute_isosurface_depth(target_temp_c=target_temp_c, resolution_deg=resolution)

@app.get("/api/ocean/validation")
def get_validation_metrics():
    buoys = get_real_incois_omni_buoys()
    return compute_model_vs_in_situ_validation(buoys)

@app.get("/api/ocean/transect")
def get_transect(
    lat1: float = Query(13.08, description="Start latitude (e.g. Chennai)"),
    lon1: float = Query(80.27, description="Start longitude"),
    lat2: float = Query(11.62, description="End latitude (e.g. Port Blair)"),
    lon2: float = Query(92.72, description="End longitude"),
    samples: int = Query(15, description="Number of cross-section sample nodes")
):
    return compute_vertical_transect(
        start_coords=(lat1, lon1),
        end_coords=(lat2, lon2),
        num_samples=samples
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

