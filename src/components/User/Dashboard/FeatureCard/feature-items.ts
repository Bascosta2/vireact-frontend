import { 
  FaSun, 
  FaBookOpen, 
  FaVolumeUp, 
  FaChartBar, 
  FaComment,
  FaBrain
} from "react-icons/fa";
import { FEATURES_IDS } from "@/constants";

// Feature cards data
export const features = [
  {
    id: FEATURES_IDS.HOOK,
    icon: FaSun,
    title: "Hook",
    description: "Analyze your opening 3-5 seconds"
  },
  {
    id: FEATURES_IDS.PACING_RHYTHM,
    icon: FaBookOpen,
    title: "Pacing & Rhythm",
    description: "AI checks pacing & engagement flow"
  },
  {
    id: FEATURES_IDS.AUDIO,
    icon: FaVolumeUp,
    title: "Audio",
    description: "Keep voices clear & audio pro-level"
  },
  {
    id: FEATURES_IDS.VIEWS,
    icon: FaChartBar,
    title: "Views",
    description: "Predict your reach before posting"
  },
  {
    id: FEATURES_IDS.ADVANCED_ANALYTICS,
    icon: FaBrain,
    title: "Advanced Analytics",
    description: "YouTube like advanced analytics"
  },
  {
    id: FEATURES_IDS.CAPTION,
    icon: FaComment,
    title: "Caption",
    description: "Fix captions for max retention"
  }
];