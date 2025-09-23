// Workspace types to match backend schemas

import { UserPublic } from "./auth";

export interface WorkspaceSettings {
  [key: string]: string | number | boolean | null;
}

export interface WorkspaceBase {
  name: string;
  description?: string;
  settings: WorkspaceSettings;
  is_public: boolean;
}

export interface WorkspaceCreate extends WorkspaceBase {
  collaborator_ids?: number[];
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string;
  settings?: WorkspaceSettings;
  is_public?: boolean;
  collaborator_ids?: number[];
}

export interface WorkspaceInDB extends WorkspaceBase {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Workspace extends WorkspaceInDB {
  collaborators: UserPublic[];
}

export interface WorkspacePublic {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
}

export interface KnowledgeBase {
  id: number;
  name: string;
  description?: string;
  collection_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Asset {
  id: number;
  type: string;
  title: string;
  url?: string;
  file_path?: string;
  content?: string;
  collection_id?: number;
  knowledge_base_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  knowledge_base_id?: number;
  is_active: boolean;
  created_at: string;
  asset_count: number;
}

export interface WorkspaceDetailed {
  id: number;
  name: string;
  description?: string;
  settings: WorkspaceSettings;
  is_public: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  collaborators: UserPublic[];
  knowledge_bases: KnowledgeBase[];
  assets: Asset[];
  collections: Collection[];
}

export interface MessageResponse {
  message: string;
}
