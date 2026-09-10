"""
AquaTwin 3D - Pydantic Data Schemas
Matches frontend TypeScript types for all real oceanographic datasets.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class WaveDataPoint(BaseModel):
    lat: float
    lon: float
    time: str
    wave_height_m: float = Field(..., description="Significant Wave Height (SWH) in meters")
    wave_direction_deg: float = Field(..., description="Wave propagation direction in degrees (0-360)")
    wave_period_s: float = Field(..., description="Peak wave period in seconds")
    wind_wave_height_m: Optional[float] = None
    swell_wave_height_m: Optional[float] = None

class WaveResponse(BaseModel):
    timestamp: str
    source: str = "Open-Meteo Marine API (ECMWF WAM / GFS Wave)"
    points: List[WaveDataPoint]

class CurrentVector(BaseModel):
    lat: float
    lon: float
    time: str
    velocity_ms: float = Field(..., description="Ocean current velocity magnitude in m/s")
    direction_deg: float = Field(..., description="Current direction in degrees towards which water flows")
    u_ms: float = Field(..., description="Eastward current velocity component")
    v_ms: float = Field(..., description="Northward current velocity component")

class CurrentResponse(BaseModel):
    timestamp: str
    source: str = "Open-Meteo Marine API (Mercator Ocean Physics)"
    vectors: List[CurrentVector]

class CTDMeasurement(BaseModel):
    depth: int = Field(..., description="Depth in meters or dbar pressure")
    temp: float = Field(..., description="In-situ water temperature in °C")
    salinity: float = Field(..., description="Practical salinity in PSU")
    density: float = Field(..., description="Water density in kg/m³")

class TrajectoryPoint(BaseModel):
    lat: float
    lon: float
    depth: int
    day: int

class ArgoFloatResponse(BaseModel):
    wmo_id: str
    platform_type: str
    basin: str
    lat: float
    lon: float
    cycle_number: int
    last_profile_date: str
    max_depth_m: int
    surface_temp_c: float
    surface_salinity_psu: float
    status: str
    ctd_profile: List[CTDMeasurement]
    trajectory: List[TrajectoryPoint]
    source_api: Optional[str] = "Global Argo GDAC / Argovis"

class BuoyDataResponse(BaseModel):
    id: str
    name: str
    basin: str
    lat: float
    lon: float
    depth_m: int
    sst_c: float
    salinity_psu: float
    air_temp_c: float
    wind_speed_ms: float
    wind_dir_deg: int
    wave_height_m: float
    current_speed_ms: float
    current_dir_deg: int
    sensor_health: str
    last_updated: str

class ModelValidationMetric(BaseModel):
    buoy_id: str
    name: str
    lat: float
    lon: float
    model_sst: float
    obs_sst: float
    residual_sst: float
    model_wave: float
    obs_wave: float
    residual_wave: float
    model_salinity: float
    obs_salinity: float
    residual_salinity: float
    model_current: float
    obs_current: float
    residual_current: float
    accuracy_score_pct: float

class ValidationSummaryResponse(BaseModel):
    status: str
    timestamp: str
    evaluated_sensors: int
    metrics: Dict[str, float]
    comparisons: List[ModelValidationMetric]

class BGCProfilePoint(BaseModel):
    depth: int
    temp: float
    salinity: float
    chlorophyll: float = Field(..., description="Chlorophyll-a concentration in µg/L")
    oxygen: float = Field(..., description="Dissolved Oxygen in µmol/kg")
    density: float

class GliderSawtoothPoint(BaseModel):
    lat: float
    lon: float
    depth: int
    dive: int

class GliderMissionResponse(BaseModel):
    id: str
    name: str
    glider_type: str
    basin: str
    operator: str
    lat: float
    lon: float
    heading_deg: int
    speed_knots: float
    current_depth_m: int
    dive_state: str
    battery_pct: int
    mission_day: int
    total_dives: int
    surface_temp_c: float
    surface_salinity_psu: float
    chlorophyll_surface_ug_l: float
    status: str
    last_surfaced: str
    profile: List[BGCProfilePoint]
    sawtooth_trajectory: List[GliderSawtoothPoint]

class CTDCastStationResponse(BaseModel):
    station_id: str
    vessel: str
    cruise_id: str
    basin: str
    lat: float
    lon: float
    bottom_depth_m: int
    cast_date: str
    surface_temp_c: float
    surface_salinity_psu: float
    chlorophyll_max_ug_l: float
    chlorophyll_max_depth_m: int
    cast_profile: List[BGCProfilePoint]

class IsosurfacePoint(BaseModel):
    lat: float
    lon: float
    target_temp_c: float
    surface_temp_c: float
    isotherm_depth_m: float
    tchp_kj_cm2: float
    cyclone_heat_risk: str

class IsosurfaceResponse(BaseModel):
    timestamp: str
    target_isotherm_c: float
    basin: str
    total_nodes: int
    mean_isotherm_depth_m: float
    max_tchp_kj_cm2: float
    points: List[IsosurfacePoint]

