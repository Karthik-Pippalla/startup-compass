# Developer Workflow Output Schema

## DeveloperWorkflowResult
```
{
  status: string;      // Lamatic execution status
  raw: any;            // Original result from Lamatic (string or object)
  parsed: DeveloperStackRecommendation;
}
```

## DeveloperStackRecommendation
```
{
  frontend_technologies?: string; // comma-separated list
  backend_technologies?: string;
  sql_databases?: string;
  nosql_databases?: string;
  authentication_and_authorization?: string;
  devops_and_deployment?: string;
  apis_and_integrations?: string;
  ai_or_ml?: string;
  cloud_services?: string;
  optional_enhancements?: string;
}
```

## Normalized Shape Returned by developerAgent.execute()
```
{
  stack: {
    frontend: string[];
    backend: string[];
    sql: string[];
    nosql: string[];
    auth: string[];
    devops: string[];
    apis: string[];
    ai_ml: string[];
    cloud: string[];
    enhancements: string[];
    legacy: object; // legacy raw stack fields if any
  };
  frontendTechnologies: string[];
  backendTechnologies: string[];
  sqlDatabases: string[];
  noSqlDatabases: string[];
  authenticationAndAuthorization: string[];
  devOpsAndDeployment: string[];
  apisAndIntegrations: string[];
  aiOrMl: string[];
  cloudServices: string[];
  optionalEnhancements: string[];
  apiDesign: EndpointSpec[]; // may be empty until workflow includes
  deliveryPlan: Milestone[]; // future expansion
  risks: string[];           // risk descriptions
  technicalExpertise: string;
  technologyPreference: string;
  visionSentence: string;    // original prompt/vision
  lamaticStatus: string;     // workflow status
  raw: any;                  // original Lamatic raw result
  specificPrompt: string;    // indicates prompt mode used
}
```

## EndpointSpec (future use)
```
{
  name: string;
  method?: string;
  path?: string;
  description?: string;
  params?: string[];
  responseExample?: any;
}
```

## Milestone (future use)
```
{
  title: string;
  description?: string;
  estimatedDurationDays?: number;
  dependencies?: string[];
}
```
