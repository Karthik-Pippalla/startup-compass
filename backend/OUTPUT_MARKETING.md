# Marketing Workflow Output Schema

## MarketingWorkflowResult
```
{
  status: string;   // Lamatic execution status
  raw: any;         // Original result (string or object)
  parsed: MarketingSynthesis | { Output?: string | object };
}
```

## MarketingSynthesis (possible structured fields)
```
{
  demographic_profile?: DemographicProfile;
  behavioral_profile?: BehavioralProfile;
  psychographic_profile?: PsychographicProfile;
}
```

## DemographicProfile
```
{
  age?: {
    range?: string;
    military_percentage?: Record<string,string>; // e.g., { millennials: '40%' }
  };
  gender?: { majority?: string; percentage?: string };
  sexual_orientation?: { majority?: string; percentage?: string };
  education_level?: { highest_likelihood?: string; comparison?: string };
  urbanicity?: { residency?: string; description?: string };
}
```

## BehavioralProfile
```
{
  technology_adoption?: Record<string,string | number>; // key-value adoption stats
  online_dating_usage?: Record<string,string | number>;
  app_preferences?: Record<string,string | number>;
  ai_interaction?: Record<string,string | number>;
}
```

## PsychographicProfile
```
{
  attitudes_towards_ai?: Record<string,string>;
  relationship_goals?: Record<string,string>;
}
```

## Normalized Shape Returned by marketingAgent.execute()
```
{
  lamaticStatus: string;
  raw: any;
  promptUsed: string;
  demographicProfile: DemographicProfile | {};
  behavioralProfile: BehavioralProfile | {};
  psychographicProfile: PsychographicProfile | {};
  demographics: object; // shorthand subset
  narrative: string;
  targetMarket: string;
  launchScope: string;
  specificPrompt: string;
}
```
