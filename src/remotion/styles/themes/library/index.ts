import type { StyleId } from '../../ids';
import type { StyleTheme } from '../../theme';
import { analystBriefing } from './analyst-briefing';
import { artDeco } from './art-deco';
import { assemblyManual } from './assembly-manual';
import { audiogram } from './audiogram';
import { bauhaus } from './bauhaus';
import { beatCards } from './beat-cards';
import { bigNumbers } from './big-numbers';
import { blueprint } from './blueprint';
import { briefingBoard } from './briefing-board';
import { captionNews } from './caption-news';
import { caseFile } from './case-file';
import { celAnime } from './cel-anime';
import { circuitBoard } from './circuit-board';
import { citySymphony } from './city-symphony';
import { claymation } from './claymation';
import { codeEditor } from './code-editor';
import { coinStacks } from './coin-stacks';
import { colouredPencil } from './coloured-pencil';
import { copperEngraving } from './copper-engraving';
import { cosmos } from './cosmos';
import { countdown } from './countdown';
import { crayonBook } from './crayon-book';
import { crowdSim } from './crowd-sim';
import { deskFlythrough } from './desk-flythrough';
import { digitalRain } from './digital-rain';
import { doodle } from './doodle';
import { doubleExposure } from './double-exposure';
import { factoryCutaway } from './factory-cutaway';
import { feltWool } from './felt-wool';
import { fireflyDots } from './firefly-dots';
import { flatSpace } from './flat-space';
import { flowField } from './flow-field';
import { gameShow } from './game-show';
import { glassProduct } from './glass-product';
import { glitchCut } from './glitch-cut';
import { hologramHud } from './hologram-hud';
import { illuminated } from './illuminated';
import { investigationDesk } from './investigation-desk';
import { isoInfographic } from './iso-infographic';
import { isometricTown } from './isometric-town';
import { keynoteLaunch } from './keynote-launch';
import { kineticType } from './kinetic-type';
import { kinoMontage } from './kino-montage';
import { lidarScan } from './lidar-scan';
import { lightLeak } from './light-leak';
import { lightScan } from './light-scan';
import { lightTable } from './light-table';
import { liminalTape } from './liminal-tape';
import { liquidChrome } from './liquid-chrome';
import { liquidGlass } from './liquid-glass';
import { lowPoly } from './low-poly';
import { mangaPanels } from './manga-panels';
import { markerPad } from './marker-pad';
import { mascotExplainer } from './mascot-explainer';
import { mascotScreencast } from './mascot-screencast';
import { memphis } from './memphis';
import { microgame } from './microgame';
import { microscope } from './microscope';
import { midcenturyToon } from './midcentury-toon';
import { neonSigns } from './neon-signs';
import { newsPackage } from './news-package';
import { newsreel } from './newsreel';
import { oneBit } from './one-bit';
import { oneLine } from './one-line';
import { oscilloscope } from './oscilloscope';
import { paperLantern } from './paper-lantern';
import { paperMap } from './paper-map';
import { pastel3d } from './pastel-3d';
import { penPlotter } from './pen-plotter';
import { pencilDataviz } from './pencil-dataviz';
import { physicsLab } from './physics-lab';
import { pictogramGrid } from './pictogram-grid';
import { pixelDiorama } from './pixel-diorama';
import { pixelFx } from './pixel-fx';
import { popArt } from './pop-art';
import { popUpBook } from './pop-up-book';
import { productStudio } from './product-studio';
import { projectionModel } from './projection-model';
import { redPaperCut } from './red-paper-cut';
import { reliefMap } from './relief-map';
import { retroTerminal } from './retro-terminal';
import { risograph } from './risograph';
import { rubberHose } from './rubber-hose';
import { scifiToon } from './scifi-toon';
import { scratchFilm } from './scratch-film';
import { scratchboard } from './scratchboard';
import { screenPrint } from './screen-print';
import { shadowPuppets } from './shadow-puppets';
import { silentFilm } from './silent-film';
import { sketchnote } from './sketchnote';
import { spreadsheet } from './spreadsheet';
import { spyTitles } from './spy-titles';
import { stainedGlass } from './stained-glass';
import { stickFigures } from './stick-figures';
import { sunsetSilhouette } from './sunset-silhouette';
import { swissGrid } from './swiss-grid';
import { synthwave } from './synthwave';
import { tabletSketch } from './tablet-sketch';
import { teardown } from './teardown';
import { technicalDrawing } from './technical-drawing';
import { telestrator } from './telestrator';
import { textFlash } from './text-flash';
import { thermal } from './thermal';
import { tiltShift } from './tilt-shift';
import { transitMap } from './transit-map';
import { ukiyoE } from './ukiyo-e';
import { urbanSketch } from './urban-sketch';
import { vintageCollage } from './vintage-collage';
import { whiteboard } from './whiteboard';
import { woodcut } from './woodcut';
import { xrayScanner } from './xray-scanner';

/** The library styles (library.json), by id. Generated from the files in this folder. */
export const LIBRARY_THEMES: Partial<Record<StyleId, StyleTheme>> = {
  'analyst-briefing': analystBriefing,
  'art-deco': artDeco,
  'assembly-manual': assemblyManual,
  'audiogram': audiogram,
  'bauhaus': bauhaus,
  'beat-cards': beatCards,
  'big-numbers': bigNumbers,
  'blueprint': blueprint,
  'briefing-board': briefingBoard,
  'caption-news': captionNews,
  'case-file': caseFile,
  'cel-anime': celAnime,
  'circuit-board': circuitBoard,
  'city-symphony': citySymphony,
  'claymation': claymation,
  'code-editor': codeEditor,
  'coin-stacks': coinStacks,
  'coloured-pencil': colouredPencil,
  'copper-engraving': copperEngraving,
  'cosmos': cosmos,
  'countdown': countdown,
  'crayon-book': crayonBook,
  'crowd-sim': crowdSim,
  'desk-flythrough': deskFlythrough,
  'digital-rain': digitalRain,
  'doodle': doodle,
  'double-exposure': doubleExposure,
  'factory-cutaway': factoryCutaway,
  'felt-wool': feltWool,
  'firefly-dots': fireflyDots,
  'flat-space': flatSpace,
  'flow-field': flowField,
  'game-show': gameShow,
  'glass-product': glassProduct,
  'glitch-cut': glitchCut,
  'hologram-hud': hologramHud,
  'illuminated': illuminated,
  'investigation-desk': investigationDesk,
  'iso-infographic': isoInfographic,
  'isometric-town': isometricTown,
  'keynote-launch': keynoteLaunch,
  'kinetic-type': kineticType,
  'kino-montage': kinoMontage,
  'lidar-scan': lidarScan,
  'light-leak': lightLeak,
  'light-scan': lightScan,
  'light-table': lightTable,
  'liminal-tape': liminalTape,
  'liquid-chrome': liquidChrome,
  'liquid-glass': liquidGlass,
  'low-poly': lowPoly,
  'manga-panels': mangaPanels,
  'marker-pad': markerPad,
  'mascot-explainer': mascotExplainer,
  'mascot-screencast': mascotScreencast,
  'memphis': memphis,
  'microgame': microgame,
  'microscope': microscope,
  'midcentury-toon': midcenturyToon,
  'neon-signs': neonSigns,
  'news-package': newsPackage,
  'newsreel': newsreel,
  'one-bit': oneBit,
  'one-line': oneLine,
  'oscilloscope': oscilloscope,
  'paper-lantern': paperLantern,
  'paper-map': paperMap,
  'pastel-3d': pastel3d,
  'pen-plotter': penPlotter,
  'pencil-dataviz': pencilDataviz,
  'physics-lab': physicsLab,
  'pictogram-grid': pictogramGrid,
  'pixel-diorama': pixelDiorama,
  'pixel-fx': pixelFx,
  'pop-art': popArt,
  'pop-up-book': popUpBook,
  'product-studio': productStudio,
  'projection-model': projectionModel,
  'red-paper-cut': redPaperCut,
  'relief-map': reliefMap,
  'retro-terminal': retroTerminal,
  'risograph': risograph,
  'rubber-hose': rubberHose,
  'scifi-toon': scifiToon,
  'scratch-film': scratchFilm,
  'scratchboard': scratchboard,
  'screen-print': screenPrint,
  'shadow-puppets': shadowPuppets,
  'silent-film': silentFilm,
  'sketchnote': sketchnote,
  'spreadsheet': spreadsheet,
  'spy-titles': spyTitles,
  'stained-glass': stainedGlass,
  'stick-figures': stickFigures,
  'sunset-silhouette': sunsetSilhouette,
  'swiss-grid': swissGrid,
  'synthwave': synthwave,
  'tablet-sketch': tabletSketch,
  'teardown': teardown,
  'technical-drawing': technicalDrawing,
  'telestrator': telestrator,
  'text-flash': textFlash,
  'thermal': thermal,
  'tilt-shift': tiltShift,
  'transit-map': transitMap,
  'ukiyo-e': ukiyoE,
  'urban-sketch': urbanSketch,
  'vintage-collage': vintageCollage,
  'whiteboard': whiteboard,
  'woodcut': woodcut,
  'xray-scanner': xrayScanner,
};
