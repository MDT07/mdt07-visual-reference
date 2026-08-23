import { promises as fs } from "node:fs";
import path from "node:path";

import type { VisualReference } from "@/lib/pinterest/types";

export interface ReferenceCollection {
  id: string;
  name: string;
  references: VisualReference[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchProject {
  id: string;
  name: string;
  brief: string;
  collections: ReferenceCollection[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectStore {
  projects: ResearchProject[];
}

const STORE_PATH = path.join(process.cwd(), "data", "projects.json");

async function readStore(): Promise<ProjectStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as ProjectStore;
  } catch {
    return { projects: [] };
  }
}

async function writeStore(store: ProjectStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function listProjects(): Promise<ResearchProject[]> {
  const store = await readStore();
  return store.projects;
}

export async function getProject(id: string): Promise<ResearchProject | null> {
  const store = await readStore();
  return store.projects.find((project) => project.id === id) ?? null;
}

export async function createProject(
  name: string,
  brief: string
): Promise<ResearchProject> {
  const store = await readStore();
  const project: ResearchProject = {
    id: crypto.randomUUID(),
    name,
    brief,
    collections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.projects.push(project);
  await writeStore(store);
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const store = await readStore();
  const initialLength = store.projects.length;
  store.projects = store.projects.filter((project) => project.id !== id);
  if (store.projects.length === initialLength) return false;
  await writeStore(store);
  return true;
}

export async function addReferenceToProject(
  projectId: string,
  collectionName: string,
  reference: VisualReference
): Promise<ResearchProject | null> {
  const store = await readStore();
  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return null;

  let collection = project.collections.find((c) => c.name === collectionName);
  if (!collection) {
    collection = {
      id: crypto.randomUUID(),
      name: collectionName,
      references: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    project.collections.push(collection);
  }

  if (!collection.references.some((r) => r.id === reference.id)) {
    collection.references.unshift(reference);
    collection.updatedAt = new Date().toISOString();
    project.updatedAt = new Date().toISOString();
    await writeStore(store);
  }

  return project;
}

export async function removeReferenceFromProject(
  projectId: string,
  collectionName: string,
  referenceId: string
): Promise<ResearchProject | null> {
  const store = await readStore();
  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const collection = project.collections.find((c) => c.name === collectionName);
  if (!collection) return project;

  const initialLength = collection.references.length;
  collection.references = collection.references.filter(
    (r) => r.id !== referenceId
  );

  if (collection.references.length !== initialLength) {
    collection.updatedAt = new Date().toISOString();
    project.updatedAt = new Date().toISOString();
    await writeStore(store);
  }

  return project;
}
