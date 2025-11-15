# Competitor Workflow Output Schema

## CompetitorWorkflowResult
```
{
  status: string; // Lamatic execution status
  raw: any;       // Original workflow result (string or object)
  parsed: CompetitorWorkflowParsed;
}
```

## CompetitorWorkflowParsed
```
{
  Output?: string | {
    competitors?: any;            // May be array of competitor objects or string list
    positioning?: any;            // Optional positioning info
    differentiation?: any;        // Optional differentiation details
    pricing_models?: any;         // Pricing model list
    threats?: any;                // Threats or risks
  };
}
```

## Normalized Shape Returned by competitorAgent.execute()
```
{
  lamaticStatus: string;
  raw: any;                // Original Lamatic output
  promptUsed: string;      // Prompt given to workflow
  industry: string;
  competitors: Competitor[]; // Normalized competitor list
  positioning: string | object | null;
  differentiation: string | object | null;
  pricingModels: (string | object)[];
  threatAssessment: (string | object)[];
  monitoringPlan: string[];
  competitorScope: string;
  marketAnalysisRegion: string;
  analysisDepth: string;   // Summary string
  specificPrompt: string;  // Indicator of prompt mode
}
```

## Competitor
```
{
  name: string;
  description?: string;
  headquarters?: string;
  established?: number | string;
  funding?: string;
  type?: string; // e.g., Series A
  partners?: string[];
  founders?: string[];
  source?: string; // data source reference
  website?: string;
}
```
