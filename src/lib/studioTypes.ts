export interface Project {
  id: number;
  name: string;
  description: string;
  module: string;
  status: string;
  updated_at: string;
}

export interface StudioModel {
  id: number;
  name: string;
  provider: string;
  task: string;
  params: string;
  downloads: number;
  version: string;
  status: string;
}

export interface Dataset {
  id: number;
  name: string;
  format: string;
  rows_count: number;
  size_label: string;
  license: string;
  downloads: number;
}

export interface Deployment {
  id: number;
  name: string;
  target: string;
  region: string;
  status: string;
  url: string;
  version: string;
  deployed_at: string;
}

export interface Activity {
  id: number;
  actor: string;
  action: string;
  target: string;
  module: string;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  created_at: string;
}
