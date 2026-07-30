export function parseTagsInput(tagsInput: string): string[] {
  return tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function appendTag(tagsInput: string, tag: string): string {
  const existing = parseTagsInput(tagsInput);
  if (existing.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase())) {
    return tagsInput;
  }
  return [...existing, tag].join(", ");
}
