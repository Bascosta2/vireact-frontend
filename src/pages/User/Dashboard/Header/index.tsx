import FeaturesList from '@/components/UI/FeaturesList';

interface DashboardHeaderProps {
    name: string;
    selectedFeatureIds: string[];
}


function DashboardHeader({ name, selectedFeatureIds }: DashboardHeaderProps) {
    return (
        <>

            {/* Background Gradient Circle */}
            <div className="absolute top-20 sm:top-32 left-1/2 transform -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-primary rounded-full opacity-30 blur-3xl" />

            {/* Greeting */}
            <div className="text-center mb-4">
                <h3 className="text-white text-2xl sm:text-4xl !font-roboto leading-tight mb-2">
                    Hello {name || 'User'}
                </h3>
                <p className="text-white/80 text-lg sm:text-xl font-roboto">
                    Please select what do you want to analyze & improve in your shorts
                </p>
            </div>

            {/* Selected Features Counter */}
            <div className="text-center mb-4">
                <div className="inline-flex items-center px-6 py-2 bg-gray bg-dark-primary border border-green-500 rounded-full mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm text-green-500 uppercase">
                        {selectedFeatureIds.length} out of 6 feature{selectedFeatureIds.length !== 1 ? 's' : ''} selected
                    </span>
                </div>
            </div>



            {/* <FeaturesList /> */}
        </>


    )
}

export default DashboardHeader