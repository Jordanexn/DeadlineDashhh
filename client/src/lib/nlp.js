import { apiRequest } from "./queryClient";

/**
 * Analyzes rubric text to extract deliverables
 */
export async function analyzeRubric(text) {
  const response = await apiRequest('POST', '/api/analyze-rubric', { text });
  const result = await response.json();
  return result;
}

/**
 * Simple client-side fallback for identifying deliverables in a rubric text
 * This is a backup in case the server-side analysis fails
 */
export function analyzeRubricClientSide(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const deliverables = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and those that look like headers or instructions
    if (!line || line.length < 5 || /^(enhanced|technical|core|javascript|using|guidelines|notes|instructions|overview|background|introduction):/i.test(line)) {
      continue;
    }
    
    // Look for lines that start with numbers or have keywords indicating deliverables
    if (/^(\d+[\.:])/.test(line) || 
        /feature|requirement|task|implement|create|develop|build|design/i.test(line)) {
      
      // Extract the name (remove any leading numbers and symbols)
      const name = line.replace(/^(\d+[\.:]\s*)/, '').trim();
      
      deliverables.push({
        name,
        description: undefined,
        points: undefined
      });
    }
  }
  
  // If no deliverables were found, take a more aggressive approach
  if (deliverables.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length > 20 && /[A-Z]/.test(line[0])) { // Look for sentences starting with capital letters
        deliverables.push({
          name: line,
          description: undefined,
          points: undefined
        });
      }
    }
  }
  
  return { deliverables };
}