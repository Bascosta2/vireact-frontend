import { benefits } from '@/pages/PreLogin/EarlyAccess/components/Benefits/data/benefits-data';
import { socialProof } from '@/pages/PreLogin/EarlyAccess/data/form-data';
import { IoCheckmarkCircle } from 'react-icons/io5';
import ConfettiComponent from '@/components/Confetti';

function OnSuccess() {
  return (
    <>
      <ConfettiComponent />
      <div className="min-h-screen flex items-center justify-center sm:px-4 sm:py-12">
        <div className="max-w-2xl w-full">
          {/* Success State */}
          <div className="relative">

            {/* Main Card */}
            <div className="relative bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-8 shadow-2xl">
                <IoCheckmarkCircle className="w-10 h-10 text-white" />
              </div>

              {/* Success Content */}
              <h1 >
                You are on the exclusive list!
              </h1>
              <p className="text-xl text-white mb-8 leading-relaxed text-center">
                Welcome to the exclusive early access program.
                <br />
                <span className="text-light-gray text-sm">We'll notify you as soon as we're ready to launch.</span>
              </p>

              {/* Benefits Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold mb-1 text-lg !font-roboto">{benefit.title}</h3>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex justify-center gap-8 mb-8">
                {socialProof.map((proof, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-2">
                      <proof.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">{proof.count}</div>
                    <div className="text-gray-400 text-sm">{proof.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Free Content Help Below
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    target='_blank'
                    href="https://discord.gg/ENYHFp6MP"
                    className="btn-secondary">
                    Join Discord
                  </a>
                  <a
                    href="https://drive.google.com/drive/folders/1-yRGdurWXr3aFh6chJ42xxurOsmOeltQ"
                    target='_blank'
                    className="btn-secondary">
                    Get 119 Viral Hooks
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OnSuccess