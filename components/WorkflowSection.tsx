
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { WORKFLOW_STEPS } from '../constants';
import { WorkflowStep } from '../types';

const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<WorkflowStep>(WORKFLOW_STEPS[0]);

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-6 h-6" /> : <LucideIcons.HelpCircle className="w-6 h-6" />;
  };

  return (
    <section className="py-20 bg-white" id="workflow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Operational Framework</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Complete Operational Flow
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            From the first alert to legal closure, SSM ensures every step is governed by technical medical standards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-4">
            {WORKFLOW_STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  activeStep.id === step.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100' 
                    : 'bg-white border-transparent hover:bg-slate-50 grayscale hover:grayscale-0'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeStep.id === step.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {getIcon(step.icon)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 0{step.id}</div>
                  <div className={`font-bold ${activeStep.id === step.id ? 'text-blue-900' : 'text-slate-700'}`}>
                    {step.title}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              {getIcon(activeStep.icon)}
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-semibold text-blue-300 mb-8 border border-blue-500/30">
                  Detailed Operational Phase
                </div>
                <h3 className="text-4xl font-bold mb-6">{activeStep.title}</h3>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                  {activeStep.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {activeStep.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
                      <LucideIcons.ChevronRight className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Standard</span>
                    <span className="text-sm font-medium">WHO Global Protocols</span>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-white font-semibold flex items-center gap-2 transition-all">
                  Full Technical Documentation <LucideIcons.ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
