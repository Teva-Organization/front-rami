export const configuracoesEndpoints = {
  wfActivities: '/WFActivity',
  WFActivitiesSearch: '/WFActivity/search',
  wfActivityById: (id: number | string) => `/WFActivity/${id}`,
  wfFlows: '/WFFlow',
  wfFlowsSearch: '/WFFlow/search',
  wfFlowById: (id: number | string) => `/WFFlow/${id}`,
  wfActivityFlows: '/WFActivityFlow',
  wfActivityFlowsSearch: '/WFActivityFlow/search',
  wfActivityFlowById: (id: number | string) => `/WFActivityFlow/${id}`,
  wfProcesses: '/WFProcess',
  wfProcessesSearch: '/WFProcess/search',
  wfProcessById: (id: number | string) => `/WFProcess/${id}`,
} as const;
