# Funding Workflow Output Schema

## FundingWorkflowResult
```
{
  status: string; // Lamatic execution status (e.g., 'success')
  raw: any;       // Original result from Lamatic (may be JSON string or object)
  parsed: FundingReport;
}
```

## FundingReport
```
{
  Summary?: string; // Consolidated narrative/report text
  // Optionally future structured fields:
  ImmediateOpportunities?: Opportunity[]; // time-sensitive grants or programs
  RollingOpportunities?: Opportunity[];   // ongoing grant or funding sources
  RecommendedNextSteps?: string[];        // actionable bullet points
}
```

## Opportunity
```
{
  name: string;          // Program or grant name
  amountOrRange?: string; // Funding amount or range (if provided)
  focusAreas?: string[];  // Technology / domain focus areas
  deadline?: string;      // Deadline or "rolling"
  sourceUrl?: string;     // Reference link
  notes?: string;         // Extra details / caveats
}
```
