import React, { useEffect } from 'react';
import { OceanGlobe3D } from './components/3d/OceanGlobe3D';
import { AppShell } from './components/layout/AppShell';
import { TopNavBar } from './components/layout/TopNavBar';
import { BottomTimelineBar } from './components/layout/BottomTimelineBar';
import { SidebarDock } from './components/panels/SidebarDock';
import { DepthSliderPanel } from './components/panels/DepthSliderPanel';
import { LegendPanel } from './components/panels/LegendPanel';
import { SensorDetailModal } from './components/modals/SensorDetailModal';
import { VolumeSlicerBox3D } from './components/3d/VolumeSlicerBox3D';
import { ValidationDashboard } from './components/hud/ValidationDashboard';
import { OceanCopilotChat } from './components/hud/OceanCopilotChat';
import { CameraPreset } from './types/ocean';
import { useOceanStore } from './services/oceanStore';
import { LiquidGlassFilter } from './components/ui/LiquidGlassFilter';

export const App: React.FC = () => {
  const store = useOceanStore();

  // Preload all real-time feeds on mount (Open-Meteo Waves & Currents, Argo GDAC, Buoys, Gliders, CTD, Isosurface)
  useEffect(() => {
    store.fetchAllLiveOceanData();
  }, []);

  // 4D Temporal Playback Interval
  useEffect(() => {
    if (!store.isPlaying) return;
    const intervalTime = 1200 / store.speed;
    const interval = setInterval(() => {
      store.setForecastHour((prev: number) => {
        const steps = [0, 6, 12, 18, 24, 36, 48, 72];
        const nextIdx = (steps.indexOf(prev) + 1) % steps.length;
        return steps[nextIdx];
      });
    }, intervalTime);
    return () => clearInterval(interval);
  }, [store.isPlaying, store.speed]);

  return (
    <>
      <LiquidGlassFilter />
      <AppShell
        header={
        <TopNavBar
          onOpenVolumeSlicer={() => store.setIsVolumeSlicerOpen(true)}
          onOpenValidation={() => store.setIsValidationOpen(true)}
          onToggleCopilot={() => store.setIsCopilotOpen(!store.isCopilotOpen)}
          isCopilotOpen={store.isCopilotOpen}
        />
      }
      viewport3D={
        <OceanGlobe3D
          variable={store.variable}
          depth={store.depth}
          verticalExaggeration={store.verticalExaggeration}
          currentDepthLayer={store.currentDepthLayer}
          buoys={store.showBuoys ? store.buoys : []}
          argoFloats={store.showArgo ? store.argoFloats : []}
          gliders={store.showGliders ? store.gliderMissions : []}
          ctdStations={store.showCTDStations ? store.ctdStations : []}
          isosurfaceData={store.showIsosurface ? store.isosurfaceData : null}
          isosurfaceTargetTemp={store.isosurfaceTargetTemp}
          wavePoints={store.wavePoints}
          currentVectors={store.currentVectors}
          selectedBuoy={store.selectedBuoy}
          selectedArgo={store.selectedArgo}
          selectedGlider={store.selectedGlider}
          selectedCTDStation={store.selectedCTDStation}
          onSelectBuoy={(b) => store.setSelectedBuoy(b)}
          onSelectArgo={(a) => store.setSelectedArgo(a)}
          onSelectGlider={(g) => store.setSelectedGlider(g)}
          onSelectCTDStation={(c) => store.setSelectedCTDStation(c)}
          activeCyclone={store.activeCyclone}
          showWaves={store.showWaves}
          showCurrents={store.showCurrents}
          showBuoys={store.showBuoys}
          showArgo={store.showArgo}
          showGliders={store.showGliders}
          showCTDStations={store.showCTDStations}
          showIsosurface={store.showIsosurface}
          showBathymetry={store.showBathymetry}
        />
      }
      leftSidebar={
        <SidebarDock
          onSelectBuoy={(b) => store.setSelectedBuoy(b)}
          onSelectArgo={(a) => store.setSelectedArgo(a)}
          onSelectGlider={(g) => store.setSelectedGlider(g)}
          onSelectCTD={(c) => store.setSelectedCTDStation(c)}
        />
      }
      rightSidebar={
        <div className="flex flex-col space-y-3 items-end">
          <DepthSliderPanel />
          {!store.isDepthSlicerCollapsed && <LegendPanel />}
        </div>
      }
      bottomBar={<BottomTimelineBar />}
      modals={
        <>
          {/* Sensor CTD Telemetry Modal (Buoy, Argo, Glider, CTD) */}
          <SensorDetailModal
            buoy={store.selectedBuoy}
            argo={store.selectedArgo}
            glider={store.selectedGlider}
            ctdStation={store.selectedCTDStation}
            onClose={() => {
              store.setSelectedBuoy(null);
              store.setSelectedArgo(null);
              store.setSelectedGlider(null);
              store.setSelectedCTDStation(null);
            }}
          />

          {/* 3D Orthogonal Volume Slicing Box Modal */}
          <VolumeSlicerBox3D
            isOpen={store.isVolumeSlicerOpen}
            onClose={() => store.setIsVolumeSlicerOpen(false)}
          />

          {/* Ground-Truth Validation Engine Dashboard */}
          {store.validationSummary && (
            <ValidationDashboard
              isOpen={store.isValidationOpen}
              onClose={() => store.setIsValidationOpen(false)}
              validationSummary={store.validationSummary}
            />
          )}

          {/* OceanCopilot AI Assistant Panel */}
          <OceanCopilotChat
            isOpen={store.isCopilotOpen}
            onClose={() => store.setIsCopilotOpen(false)}
            onChangeVariable={(v) => store.setVariable(v)}
            onChangeDepth={(d) => store.setDepth(d)}
            onOpenTransect={() => store.setIsTransectOpen(true)}
            onOpenValidation={() => store.setIsValidationOpen(true)}
            onSelectCyclone={(c) => store.setActiveCyclone(c)}
            onSelectBuoy={(b) => store.setSelectedBuoy(b)}
            onSelectArgo={(a) => store.setSelectedArgo(a)}
            buoys={store.buoys}
            argoFloats={store.argoFloats}
          />
        </>
      }
    />
  </>
  );
};

export default App;

