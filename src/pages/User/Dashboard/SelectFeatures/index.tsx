import FeatureCarousel from '@/components/UI/FeatureCarousel';

interface SelectFeaturesProps {
    selectedFeatureIds: string[];
    setSelectedFeatureIds: (ids: string[]) => void;
}

function SelectFeatures({ selectedFeatureIds, setSelectedFeatureIds }: SelectFeaturesProps) {
    return (
        <FeatureCarousel
            selectedFeatureIds={selectedFeatureIds}
            setSelectedFeatureIds={setSelectedFeatureIds}
        />
    );
}

export default SelectFeatures;
