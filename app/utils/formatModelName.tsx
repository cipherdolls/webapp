export function formatModelName(modelName: string | undefined): string {
  if (!modelName) {
    return '';
  }

  // Split organization and model name
  let organization = '';
  let nameWithoutOrg = modelName;

  if (modelName.includes('/')) {
    const parts = modelName.split('/');
    organization = parts[0];
    nameWithoutOrg = parts[1];
  }

  // Split into parts by hyphen
  const parts = nameWithoutOrg.split('-');

  // Handle model family name
  let modelFamily = parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1);

  // Special case: if model family is "Gpt", make it uppercase
  if (modelFamily?.toLowerCase() === 'gpt') {
    modelFamily = 'GPT';
  }

  // Prepare result components
  let mainParts: string[] = [];
  let versionPart = '';
  let sizePart = '';
  let variantParts: string[] = [];

  // Add organization if present (take only the first word and capitalize)
  if (organization) {
    const orgWords = organization.split('-');
    const formattedOrg = orgWords[0]?.charAt(0).toUpperCase() + orgWords[0]?.slice(1);
    mainParts.push(formattedOrg);
  }

  // Add model family
  if (modelFamily) {
    mainParts.push(modelFamily);
  }

  // Analyze other parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // Version number check (e.g., 2.0, 3.3, 4)
    if (/^\d+(\.\d+)?$/.test(part)) {
      versionPart = part;
    }
    // Size check (e.g., 70b, 9b, 17b-16e)
    else if (/^\d+b(-\d+e)?$/.test(part)) {
      // Convert "17b-16e" to "(17Bx16E)" format
      if (part.includes('-')) {
        const [size, extra] = part.split('-');
        sizePart = `(${size.toUpperCase()}x${extra.toUpperCase()})`;
      } else {
        // Convert just "70b" to "(70B)" format
        sizePart = `(${part.toUpperCase()})`;
      }
    }
    // Skip the "instruct" keyword
    else if (part.toLowerCase() === 'instruct') {
      // Skip "instruct" as it's not in the desired format
      continue;
    }
    // Add other parts as variants
    else {
      // Capitalize the first letter
      const formattedVariant = part.charAt(0).toUpperCase() + part.slice(1);
      variantParts.push(formattedVariant);
    }
  }

  // Add version
  if (versionPart) {
    mainParts.push(versionPart);
  }

  // Add variants
  if (variantParts.length > 0) {
    mainParts = mainParts.concat(variantParts);
  }

  // Join the main parts
  let result = mainParts.join(' ');

  // Add size information
  if (sizePart) {
    result += ' ' + sizePart;
  }

  return result;
}
