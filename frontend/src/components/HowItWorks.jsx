import { Upload, Cpu, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload or Record",
    description: "Upload your audio/video files or record directly in the browser",
    icon: Upload,
    details: "Supports MP3, WAV, M4A, and 20+ other formats"
  },
  {
    number: "02",
    title: "AI Processing",
    description: "Our advanced AI transcribes speech with industry-leading accuracy",
    icon: Cpu,
    details: "Uses Deepgram's Nova-2 model for optimal results"
  },
  {
    number: "03",
    title: "Review & Edit",
    description: "Edit transcripts with our intuitive editor and speaker identification",
    icon: FileText,
    details: "Timestamps, speaker labels, and punctuation included"
  },
  {
    number: "04",
    title: "Export & Share",
    description: "Download in multiple formats or share securely with your team",
    icon: CheckCircle,
    details: "Export as TXT, PDF, SRT, or share via link"
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How it
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}works
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get perfect transcripts in four simple steps. No technical skills required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 rounded-full" />

          <div className="grid lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2 text-center group">
                    {/* Step number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Icon className="w-10 h-10 text-blue-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {step.description}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {step.details}
                    </p>

                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-300 transition-all duration-300 pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}