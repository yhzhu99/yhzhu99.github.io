import type { Profile } from "../types";

export const profile: Profile = {
  name: "Yinghao Zhu",
  cnName: "朱英豪",
  title: "PhD Student",
  role: "Researcher",
  affiliation: "The University of Hong Kong",
  school: "School of Computing and Data Science",
  email: "yhzhu99@gmail.com",
  photo: "/assets/profile-photo.jpg",
  bio: 'I am a PhD student at The University of Hong Kong, supervised by <a href="https://yulequan.github.io/" target="_blank" rel="noopener">Prof. Lequan Yu</a>. I also work closely with <a href="http://scholar.pku.edu.cn/malt/home" target="_blank" rel="noopener">Prof. Liantao Ma</a> at Peking University. My research focuses on <strong>AI for Healthcare</strong> — building reliable, practical AI systems that improve clinical decision-making and accelerate healthcare research.',
  interests: [
    { uid: "ai-agent-healthcare", title: "AI Agent for Healthcare", description: "Designing autonomous and collaborative AI agents to support clinical workflows and accelerate healthcare research." },
    { uid: "medical-llm", title: "Medical Large Language Models (LLMs)", description: "Developing medical LLMs and multimodal LLMs for diverse healthcare applications." },
    { uid: "healthcare-benchmarks", title: "Healthcare Benchmarks, Toolkits & Platforms", description: "Creating robust benchmarks, open-source toolkits, and accessible platforms." },
    { uid: "human-agent-collaboration", title: "Human-Agent Collaboration & Interaction in Healthcare", description: "Advancing effective clinician/researcher-AI collaboration with a focus on interpretability, reliability, and real-world usability." },
  ],
  workspace: { title: "3D Workspace", location: "Workstation at BUAA", description: "A bright 360-degree reconstruction of my workstation at BUAA." },
};
