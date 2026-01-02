import { benefits } from './data/benefits-data';

function Benefits() {
  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
      
      {/* Benefits Card */}
      <div className="relative bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 !font-roboto text-center">
          Why Join Early Access?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-2 !font-roboto">{benefit.title}</h4>
              <p className="text-gray-400 text-xs leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Benefits;
