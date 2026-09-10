# 🌊 AquaTwin 3D — 4D Ocean Digital Twin Platform

<div align="center">

![Ministry of Earth Sciences](https://img.shields.io/badge/Organization-MoES_%2F_INCOIS-0891b2?style=for-the-badge)
![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite_+_Three.js-38bdf8?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI_+_xarray-10b981?style=for-the-badge&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)

**Next-Generation Web-Based Interactive 3D/4D Digital Twin Integrating Numerical Ocean Circulation Models & In-Situ Sensor Telemetry.**

[Overview](#-project-overview) •
[Core Innovations](#-core-innovations--capabilities) •
[3D Volume Slicing Box](#-3d-orthogonal-volume-slicing-box) •
[Real-Time Data Pipeline](#-live-real-time-data-sources-zero-mock-data) •
[Architecture](#-system-architecture) •
[Quickstart](#-installation--quickstart-guide) •
[Platform Highlights](#-platform-capabilities--highlights)

</div>

---

## 📌 Project Overview

* **Objective**: *Develop a web-based interactive 3D visualization platform that integrates numerical ocean model outputs and in-situ observations.*
* **Organization**: Ministry of Earth Sciences (MoES) / Indian National Centre for Ocean Information Services (INCOIS)
* **Domain**: Oceanography, Disaster Management, Marine Operations, & Climate Resilience

### Why AquaTwin 3D?
Historically, oceanographers, port operators, and disaster managers have had to toggle between static 2D NetCDF contour plots on one portal and tabular in-situ buoy telemetry CSVs on another. **AquaTwin 3D** solves this by unifying 4D numerical model forecasts (**INCOIS-ROMS**, **WaveWatch-III**, **HYCOM**) with real-time in-situ observing platforms (**OMNI Buoys**, **Argo Profiling Floats**, **Autonomous Underwater Gliders**, **CTD Casts**) into a single, interactive 3D digital twin running smoothly at 60 FPS in any standard web browser.

---

## 🌟 Core Innovations & Capabilities

### 1. 🧊 3D Orthogonal Volume Slicing Box (X, Y, Z Hydrographic Cube)
- **Volumetric Ocean Cube**: Dedicated 3D WebGL volume box modal isolating key ocean basins (Western Bay of Bengal, Northern Plume, Eastern Arabian Sea, Equatorial Channel).
- **3 Orthogonal Slicing Planes**:
  - **X-Plane (Latitude)**: Cross-sectional slice along latitude parallels.
  - **Y-Plane (Depth)**: Horizontal cutting plane slicing vertically from sea surface ($0\text{m}$) down to $-2,000\text{m}$.
  - **Z-Plane (Longitude)**: Zonal cross-sectional transect along longitude meridians.
- **Multi-Variable GPU Texture Shaders**:
  - 🌡️ **Water Temperature** (Thermoclines, warm surface pool, cold abyssal layers)
  - 🧂 **Salinity** (Freshwater river plume haloclines, high Arabian Sea salinity)
  - 🌊 **Ocean Current Speed** (Western boundary currents, subsurface shear)
  - 🟢 **Chlorophyll-a** (Deep Chlorophyll Maximum DCM layer at 30–60m)
  - 🤿 **Dissolved Oxygen** (Oxygen Minimum Zones OMZ)
  - ⚖️ **Seawater Density** (Pycnocline stratification $\sigma_\theta$)
- **6-DOF Holographic Interactive Probe**: Click or drag across any slice to inspect exact in-situ temperature, salinity, currents, chlorophyll, oxygen, density, and pressure at precise coordinates.

### 2. 🎛️ 4D Water Column Depth Slicer & Vertical Exaggeration
- **Discrete Depth Level Snapping**: Instant inspection of ocean stratification:
  - `0m` — Sea Surface Layer (~29.5°C)
  - `50m` — Mixed Layer Depth MLD (~28.2°C)
  - `100m` — Thermocline Upper Boundary (~22.5°C)
  - `200m` — Thermocline Core (~14.8°C)
  - `500m` — Intermediate Water (~9.6°C)
  - `1000m` — Deep Hydrographic Layer (~5.8°C)
  - `2000m` — Abyssal Plain (~2.4°C)
- **Continuous 1× to 50× Vertical Exaggeration**: Scales vertical dimension so subsurface thermocline gradients and glider dive profiles are distinctly visible on the global sphere.
- **Collapsible Minimalist Dock**: Smooth single-click collapse to compact vertical pill with synchronized legend auto-hide.

### 3. 🌌 Photorealistic Deep Space Cosmos & 4K Earth
- **8,000+ High-Density Astronomical Stars**: Multi-tier stellar background with authentic spectral classifications (hot blue-white Class O/B, silver Class A, warm golden Class K/M).
- **Milky Way Galactic Core**: Interstellar stardust belt rendered along the celestial sphere.
- **4K Satellite Earth**: High-resolution NASA Blue Marble texture with physical Rayleigh atmospheric limb scattering and dynamic cloud layer.

### 4. 🌊 Real 3D Undulating Gerstner Sea Waves
- **Physical Displacement**: High-subdivision WebGL surface mesh displaced via 4-component Gerstner wave equations parameterized by live **Significant Wave Height (SWH)** and peak period from Open-Meteo Marine API.
- **Foam & Sun Glint**: Physically derived crest foam and anisotropic specular solar reflections.

### 5. 🌀 Fluid Earth 1,600+ Particle Flow Tracer Engine
- **Fluid Current Streamlines**: Dynamic velocity flow particles inspired by Earth Nullschool / Fluid Earth.
- **Depth Stratification**: Toggle current vector particle flows across Surface ($0\text{m}$), $100\text{m}$, and $500\text{m}$ subsurface layers.
- **Pixel-Accurate Land Avoidance**: Real-time ocean mask ensures 100% dry land over India, Sri Lanka, and Arabia with zero stray particles.

### 6. 🛰️ Multi-Platform In-Situ Observational Networks
- **INCOIS OMNI Moored Buoys**: Real-time offshore moored buoys (BD08, BD10, BD11, AD02, AD04, etc.) with live SST, wave height, air temperature, and barometric pressure.
- **Global Argo GDAC Profilers**: Active WMO profiling floats with full 3D subsurface trajectory ribbons representing dives down to $-2,000\text{m}$.
- **Autonomous Underwater Gliders**: INCOIS/NIOT autonomous gliders (Samudra-1, Sagar-Tara) with active sawtooth undulating dive trajectories ($0\text{m} \leftrightarrow -1000\text{m}$) and BGC telemetry.
- **Research Vessel CTD Cast Stations**: Verified ORV Sagar Kanya and ORV Sagar Nidhi research cruise hydrographic casts with Deep Chlorophyll Maximum (DCM) beads.
- **Distinct 3D Balloon Pin Markers**: Compact, elegant 3D markers with ground contact pulse beacons and raycasting collision hulls.

### 7. 🔥 3D Thermal Isosurface & Tropical Cyclone Heat Potential (TCHP)
- **Isothermal Depth Curtains**: Visualizes $26^\circ\text{C}$ (D26) and $20^\circ\text{C}$ (D20) depth surfaces.
- **TCHP Cyclone Intensification Risk**: Dynamically color-coded risk zones (Low $<40$, High $80$, Very High $>120\text{ kJ/cm}^2$) indicating oceanic heat energy available to fuel tropical cyclones.

### 8. 📊 Ground-Truth Model Validation Engine
- Instant statistical skill assessment between numerical model outputs and co-located in-situ buoy observations:
  - Root Mean Square Error ($RMSE$)
  - Pearson Correlation Coefficient ($r$)
  - Willmott Index of Agreement ($d$)
  - Bias & Error Residual Scatter Plots

### 9. 🤖 OceanCopilot AI Assistant
- Integrated scientific marine assistant capable of answering questions regarding ocean models, thermocline dynamics, cyclone paths, and sensor telemetry.

### 10. 🏛️ Government Portal Theme & Clean Typography
- Deep matte obsidian black theme (`#050508`) with sleek glassmorphism and subtle slate borders.
- Professional institutional typography using **Public Sans**, **Inter**, and **Roboto Mono**.
- Clean, clutter-free Command Telemetry panel with single-line titles and isolated toggle switches.

---

## 📡 Live Real-Time Data Sources (Zero Mock Data)

| Dataset | Provider / Source | Update Cadence | Key Parameters |
| :--- | :--- | :--- | :--- |
| **Marine Waves & Swell** | Open-Meteo Marine API | Real-time (Hourly) | Significant Wave Height (SWH), Wave Period, Wave Direction |
| **Surface Ocean Currents** | Open-Meteo / Copernicus Marine | Real-time | Surface Velocity $(u, v)$, Current Speed (m/s) |
| **Sea Surface Temperature (SST)** | NOAA OISST / Open-Meteo | Daily / Hourly | Sea Surface Temp (°C), Thermal Anomaly |
| **Argo Profiling Floats** | Global Argo GDAC / Argovis | 10-day cycle | CTD Depth Profiles (Temp, Salinity, Pressure to -2000m) |
| **Moored Buoy Telemetry** | MoES / INCOIS OMNI & NOAA NDBC | Real-time / 3-Hourly | Wave Height, SST, Air Temp, Barometric Pressure, Wind |
| **Autonomous Gliders** | INCOIS / NIOT Glider Network | Active Missions | Sawtooth CTD + BGC (Chlorophyll, Oxygen, Density) |
| **CTD Rosette Casts** | ORV Sagar Kanya / Sagar Nidhi | Cruise Records | Calibrated Full-Column Hydrographic Profiles |
| **Bathymetry & Relief** | GEBCO Grid | Static 15-arcsec | Seafloor Depth, Mid-Indian Ridge, Trench Topography |

---

## 🏗️ System Architecture

```
                                  LIVE OCEAN DATA PROVIDERS
          [Open-Meteo Marine API]     [Argo GDAC / Argovis]     [INCOIS OMNI / NDBC]
                    │                           │                         │
                    └───────────────────┬───────┴─────────────────────────┘
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │    FASTAPI PYTHON BACKEND (Port 8000)   │
                   │  • data_fetcher.py (Live Telemetry)     │
                   │  • ocean_processor.py (xarray / NetCDF) │
                   │  • validation.py (RMSE / Willmott d)    │
                   └────────────────────┬────────────────────┘
                                        │ JSON & GeoJSON REST / WS
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │     VITE + REACT 19 FRONTEND (Port 3000)│
                   ├─────────────────────────────────────────┤
                   │  • 3D WebGL Engine (Three.js)           │
                   │    - 3D Orthogonal Volume Slicing Box   │
                   │    - 4D Water Column Depth Slicer       │
                   │    - 3D Gerstner Wave Displacement      │
                   │    - Fluid Particle Flow Current Engine │
                   │    - 3D Thermal Isosurface (TCHP)       │
                   │    - Deep Space Starfield Background    │
                   │  • Zustand State Management             │
                   │  • Statistical Validation Dashboard     │
                   │  • OceanCopilot AI Assistant            │
                   └─────────────────────────────────────────┘
```

---

## 🚀 Installation & Quickstart Guide

### Prerequisites
- **Node.js**: v18+ and npm
- **Python**: v3.10+ (Python 3.11 recommended)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/keerthan4531-a11y/aquatwin-3d.git
cd aquatwin-3d
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (Swagger docs at `http://127.0.0.1:8000/docs`).*

### 3. Frontend Setup (React 19 + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 📁 Repository Directory Structure

```
├── backend/
│   ├── models/             # Pydantic schemas (OceanData, Buoy, Argo, Validation)
│   ├── routers/            # API endpoints (telemetry, ocean_models, validation)
│   ├── services/           # Data integration services (Open-Meteo, Argo, OMNI)
│   ├── data_fetcher.py     # Live REST fetching & caching engine
│   ├── ocean_processor.py  # Spatial interpolation & NetCDF processing
│   ├── main.py             # FastAPI entrypoint
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── public/             # 4K textures, icons, and assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── currents/       # Fluid Earth particle flow engine
│   │   │   │   ├── globe/          # Earth sphere, atmosphere clouds, ocean mask
│   │   │   │   ├── sensors/        # OMNI buoys, Argo, Gliders, CTD 3D groups
│   │   │   │   ├── waves/          # Gerstner wave materials & physical displacement
│   │   │   │   ├── OceanGlobe3D.tsx# Main Three.js digital twin canvas
│   │   │   │   └── VolumeSlicerBox3D.tsx # 3D Orthogonal Volume Slicing Box
│   │   │   ├── hud/                # DepthSlider, ValidationDashboard, OceanCopilot
│   │   │   ├── layout/             # TopNavBar, AppShell, BottomTimelineBar
│   │   │   ├── modals/             # SensorDetailModal, VolumeControlPanel
│   │   │   ├── panels/             # SidebarDock, DepthSliderPanel, LegendPanel
│   │   │   └── ui/                 # LiquidGlassPanel, LiquidButton, AnimatedToggle
│   │   ├── data/                   # Real in-situ buoys, Argo, Gliders, CTD metadata
│   │   ├── services/               # API clients, volumeDataService, oceanStore
│   │   ├── styles/                 # Tailwind CSS & glassmorphism definitions
│   │   └── types/                  # Oceanographic TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 🏆 Platform Capabilities & Highlights

| Capability Area | AquaTwin 3D Execution |
| :--- | :--- |
| **Platform Fidelity** | Integrates numerical circulation model outputs with in-situ observing platforms in interactive 3D. |
| **Real vs Mock Data** | **100% Real Public API Telemetry**. No synthetic or simulated dummy numbers. Live feeds from Open-Meteo Marine, Global Argo GDAC, and INCOIS OMNI. |
| **Scientific Accuracy** | True thermocline stratification ($0\text{m}$ to $-2000\text{m}$), 3D orthogonal volume slicing, Gerstner wave equations based on SWH, and physical validation metrics ($RMSE$, $d$). |
| **Visual & UX Polish** | Institutional government portal aesthetics with deep matte obsidian black theme, 60 FPS WebGL responsiveness, and clean typography. |
| **Code Modularity** | Fully decoupled architecture with clean folder hierarchy, TypeScript strict typing, and high-performance Three.js GPU shaders. |

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).

<div align="center">
Built with ❤️ for <b>Ministry of Earth Sciences (INCOIS)</b>.
</div>
