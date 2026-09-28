import type { Repository } from "../types/repository";

let repository: Repository | null = null;

export function getRepository(): Repository | null {
  return repository;
}

export function setRepository(value: Repository): void {
  repository = value;
}