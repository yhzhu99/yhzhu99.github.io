// Simplified visual summaries, grounded in the associated papers and projects.
export const publicationIllustrations: Record<string, {
  title: string;
  subtitle: string;
  accent: string;
  nodes: [string, string, string];
  icons: [string, string, string];
}> = {
  aicare: { title: "Clinical AI copilot", subtitle: "Interactive decisions", accent: "#2563a6", nodes: ["Patient data", "Risk trends", "Clinician"], icons: ["record", "chart", "person"] },
  healthflow: { title: "HealthFlow", subtitle: "Plan · execute · evaluate · reflect", accent: "#087f79", nodes: ["EHR + task", "Agent loop", "Report"], icons: ["record", "loop", "report"] },
  gestacare: { title: "Preterm birth prediction", subtitle: "Dynamic clinical risk", accent: "#a54578", nodes: ["EHR history", "Risk trend", "Delivery"], icons: ["record", "chart", "heart"] },
  medagentboard: { title: "MedAgentBoard", subtitle: "Comparing approaches", accent: "#505db5", nodes: ["Tasks", "Models", "Benchmark"], icons: ["medical", "group", "chart"] },
  medagentaudit: { title: "MedAgentAudit", subtitle: "Find collaboration risks", accent: "#a45b29", nodes: ["Traces", "Audit", "Risks"], icons: ["group", "search", "warning"] },
  clinicrealm: { title: "ClinicRealm", subtitle: "Clinical prediction benchmark", accent: "#6754a5", nodes: ["Clinical data", "LLM vs ML", "Evaluation"], icons: ["record", "compare", "chart"] },
  colacare: { title: "ColaCare", subtitle: "Collaborative consultation", accent: "#328057", nodes: ["EHR data", "Doctors", "Consensus"], icons: ["record", "group", "report"] },
  emerge: { title: "EMERGE", subtitle: "Retrieval-augmented prediction", accent: "#176f9e", nodes: ["EHR inputs", "Retrieval", "Prediction"], icons: ["medical", "search", "chart"] },
  pyehr: { title: "COVID-19 benchmark", subtitle: "Reproducible evaluation", accent: "#735fa5", nodes: ["ICU records", "Models", "Benchmark"], icons: ["record", "compare", "chart"] },
};
