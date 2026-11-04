export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: 'caption_style' | 'background_pack' | 'effect' | 'subscription';
  price: number;
  previewUrl: string;
  features: string[];
}

export const marketplaceCatalog: MarketplaceItem[] = [
  {
    id: 'cap-hormozi',
    name: 'High-Impact Caption Blueprint',
    description: 'Complete Creator Suite with commercial fonts, SFX pop audio pack, transparent callout overlays, multi-editor cheatsheets (CapCut, Premiere, DaVinci, NexusCut), and retention guides for high-converting bold captions.',
    type: 'caption_style',
    price: 9.99,
    previewUrl: '/marketplace/hormozi.jpg',
    features: ['4 Commercial Fonts Included', '8 SFX Pop & Impact Audio Clips', '8 Transparent Callout Badges', 'Multi-Editor Preset Cheatsheets', 'High-Impact Caption Playbook', 'Commercial Project License']
  },
  {
    id: 'cap-creator-collection',
    name: '10-Style Caption Blueprint Collection',
    description: 'Ten editable caption recipes for educational videos, gaming clips, talking heads, vlogs, clean business content, and retro edits.',
    type: 'caption_style',
    price: 19.99,
    previewUrl: '/marketplace/abdaal.jpg',
    features: ['10 Editable JSON Blueprints', 'Multiple Creator Niches', 'Documented Styling Values', 'Commercial Project License']
  },
  {
    id: 'kit-hook-script',
    name: 'Short-Form Hook & Script Toolkit',
    description: 'Ten fill-in-the-blank hook frameworks plus educational, reaction, and storytelling script structures for faster content planning.',
    type: 'effect',
    price: 12.99,
    previewUrl: '/marketplace/growth.jpg',
    features: ['10 Hook Frameworks', '3 Complete Script Structures', 'Editable Markdown Files', 'Commercial Client Use']
  },
  {
    id: 'bg-satisfying-loops',
    name: 'Satisfying Loops Background Pack',
    description: 'Seamless 4K loop clips for the bottom half of split-screen shorts: kinetic sand, slime cuts, and press compilations that hold attention.',
    type: 'background_pack',
    price: 14.99,
    previewUrl: '/marketplace/asmr.jpg',
    features: ['10+ Seamless 4K Loops', 'Sand, Slime & Press Cuts', 'Loop-Ready Start/End Points', 'Commercial Project License']
  },
  {
    id: 'bg-gameplay-loops',
    name: 'Gameplay Background Pack',
    description: 'High-motion gameplay loops built for split-screen commentary: racing, parkour, and endless-run footage that never stalls the pace.',
    type: 'background_pack',
    price: 14.99,
    previewUrl: '/marketplace/gta.jpg',
    features: ['10+ 4K Gameplay Loops', 'Racing & Parkour Footage', 'No Audio Track Included', 'Commercial Project License']
  },
  {
    id: 'bg-all-access-bundle',
    name: 'All-Access Background Bundle',
    description: 'Both split-screen background packs in one purchase, plus every future background pack we release. The best value for daily publishers.',
    type: 'background_pack',
    price: 24.99,
    previewUrl: '/marketplace/bundle.svg',
    features: ['Both Background Packs', 'All Future Pack Updates', 'Save 17% vs Buying Separately', 'Commercial Project License']
  },
  {
    id: 'plan-creator',
    name: 'Creator Plan',
    description: 'For consistent content creators. Unlimited full-HD exports and every standard editor tool.',
    type: 'subscription',
    price: 12,
    previewUrl: '',
    features: ['Unlimited 1080p Exports', 'All Standard Editor Tools', 'Priority Access to New Features']
  },
  {
    id: 'plan-pro',
    name: 'Pro Plan',
    description: 'For creators publishing at a serious pace. Adds AI growth tools, transcript editing, and a brand kit.',
    type: 'subscription',
    price: 29,
    previewUrl: '',
    features: ['Growth Mode & Retention Focus Captions', 'Nexus ScriptCut Transcript Editing', 'Brand Kit + Priority Export Queue']
  },
  {
    id: 'plan-agency',
    name: 'Agency Plan',
    description: 'For freelancers and small client studios. Everything in Pro plus client-ready brand kits and commercial rights.',
    type: 'subscription',
    price: 49,
    previewUrl: '',
    features: ['Five Switchable Client Brand Kits', 'Agency-Priority Export Queue', 'Commercial Client-Use Rights']
  },
];
