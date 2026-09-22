const fs = require('fs');
const lines = fs.readFileSync('C:/Users/kkshi/.gemini/antigravity/brain/6cfe1a9d-79b6-47c3-987c-cd9bf8fced94/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

let latestFullContent = null;

for(const line of lines) {
  if(!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.content && obj.content.includes('"use client";') && obj.content.includes('export function MoveList')) {
      // It might be the output of Get-Content
      const match = obj.content.match(/"use client";[\s\S]*?(?=\n\n\n|$)/);
      if (match) {
        // Wait, the file is long.
      }
    }
    
    // Look for tool response of Get-Content
    if (obj.type === 'TOOL_RESPONSE' && obj.content && obj.content.includes('"use client";') && obj.content.includes('ChessDashboard')) {
      const idx = obj.content.indexOf('"use client";');
      latestFullContent = obj.content.substring(idx);
    }
  } catch (e) {}
}

if (latestFullContent) {
  // Strip off any trailing PowerShell prompt or command output markers if any
  const endIdx = latestFullContent.indexOf('\n\nThe command exited with code');
  if (endIdx > -1) {
    latestFullContent = latestFullContent.substring(0, endIdx);
  }
  fs.writeFileSync('src/components/ChessDashboard.tsx', latestFullContent, 'utf8');
  console.log("Recovered successfully!");
} else {
  console.log("Could not find full content.");
}
