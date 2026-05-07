# Codebase Bundle Generator for Copyright

When this file is referenced, perform the following task using a `generalist` sub-agent:

## Objective
Concatenate all primary source code files into a single Markdown file named `CODEBASE.md` in the project root for the purpose of copyright registration.

## Requirements
1. **Scope:** 
   - Scan all standard source directories (e.g., `src/`, `app/`, `lib/`, `components/`, `scripts/`, `functions/`).
   - Include key configuration files in the root (e.g., `package.json`, `tsconfig.json`, `tailwind.config.js`, `app.config.js`, `requirements.txt`, `go.mod`, `Cargo.toml`).
2. **Exclusions (DO NOT INCLUDE):**
   - `node_modules/`, `.git/`, `.expo/`, `build/`, `dist/`.
   - Platform-specific build folders (e.g., `android/`, `ios/`).
   - Binary assets (Images, Audio, Video, PDFs).
   - Lock files (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`).
   - The generated `CODEBASE.md` itself.
3. **Formatting:**
   - For every file included, add a Level 2 Markdown header with the relative file path: `## File: [path]`.
   - Wrap the file content in a fenced code block with the correct language identifier (e.g., ` ```tsx `, ` ```python `, ` ```json `).
4. **Final Output:** Save the result as `CODEBASE.md` in the root directory.

## How to use
Tell Gemini CLI: *"Follow the instructions in COPYRIGHT_GEN.md to generate my codebase bundle."*
