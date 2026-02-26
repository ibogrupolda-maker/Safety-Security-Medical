
import React from 'react';
import { ArrowRight, BookOpen, Bell, ShieldCheck, Zap } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  icon: any;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    title: 'Novos Protocolos de AVC 2026',
    excerpt: 'Atualização nas janelas de intervenção e critérios de triagem para suspeita de AVC isquémico em ambientes corporativos.',
    category: 'Protocolo Clínico',
    date: '12 Fev, 2026',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    icon: ShieldCheck
  },
  {
    id: '2',
    title: 'Expansão da Rede em Tete',
    excerpt: 'SSM integra três novas clínicas de pronto-atendimento na província de Tete para suporte a operações mineiras.',
    category: 'Rede SSM',
    date: '10 Fev, 2026',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    icon: Zap
  },
  {
    id: '3',
    title: 'Webinar: Primeiros Socorros',
    excerpt: 'Sessão de esclarecimento sobre o uso de desfibrilhadores automáticos externos (DAE) em escritórios de alta densidade.',
    category: 'Formação',
    date: '08 Fev, 2026',
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=800',
    icon: BookOpen
  }
];

const NewsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-corporate uppercase tracking-tight">Boletim Informativo SSM</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Atualizações Clínicas e Operacionais</p>
        </div>
        <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all self-start sm:self-center">
          Ver todas as notícias <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsData.map((news) => (
          <div 
            key={news.id} 
            className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-500 flex flex-col h-full"
          >
            {/* Imagem Responsiva */}
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={news.image} 
                alt={news.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-white/50">
                  {news.category}
                </span>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3">
                <news.icon className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{news.date}</span>
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                {news.title}
              </h3>
              
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 flex-1">
                {news.excerpt}
              </p>

              <button className="w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors border-b-2 border-slate-100 hover:border-blue-100 pb-1">
                Ler Artigo Completo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
