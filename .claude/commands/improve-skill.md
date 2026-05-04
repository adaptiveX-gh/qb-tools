Improve the SKILL.md documentation quality for one or more NanoClaw skills by delegating parallel research to specialized agents, then synthesizing a comprehensive SKILL.md that follows the canonical template.

## Target Resolution

Parse `$ARGUMENTS` to determine which skills to improve:

- **Specific skill name** (e.g., `add-trading-analysis`): target `.claude/skills/{name}/`
- **`trading`**: target all `.claude/skills/add-trading-*/`
- **`all`**: target all directories in `.claude/skills/` that contain a `manifest.yaml`
- **No argument**: ask the user which skill(s) to improve

For each target, verify that both `SKILL.md` and `manifest.yaml` exist. Skip directories without `manifest.yaml` (those are utility skills like `setup`, `debug`, etc. that don't use the skills-engine).

## Load References

Before processing any skill, read these two files into context:

1. **Template**: `.claude/skills/SKILL_TEMPLATE.md` — the canonical section structure and quality checklist
2. **Gold standard**: `.claude/skills/x-integration/SKILL.md` — fully realized example of what good looks like

## For Each Target Skill

### Phase 1: Parallel Research (3 agents)

Launch these agents **in parallel** using the Agent tool:

#### Agent 1: Manifest & Metadata Analysis
- **subagent_type**: `api-documenter`
- **Prompt**: Read `.claude/skills/{name}/manifest.yaml` and extract a structured summary:
  - `skill`, `version`, `description`
  - `adds` — list of all files added (with paths)
  - `modifies` — list of all files modified (with paths)
  - `depends` — prerequisite skills
  - `conflicts` — incompatible skills
  - `structured.npm_dependencies` — packages and versions
  - `structured.env_additions` — environment variables
  - `structured.docker_compose_services` — Docker services (image, resources)
  - `post_apply` — commands run after apply
  - `test` — test command
  - For each file in `adds`, check if the actual file exists in `.claude/skills/{name}/add/{path}`. Report which files have implementations and which are empty/missing.

#### Agent 2: Source Code Analysis (skip if add/ is empty)
- **subagent_type**: `code-reviewer`
- **Prompt**: Read all TypeScript files in `.claude/skills/{name}/add/` and `.claude/skills/{name}/modify/`. For each file report:
  - Exported functions, classes, types, and interfaces (with signatures)
  - IPC operation types handled (look for `type:` string literals)
  - Configuration read (env vars, config files)
  - External dependencies imported
  - Error handling patterns
  - Key algorithms or business logic (brief summary)
  Also read any `.intent.md` files in `modify/` and summarize the merge intent.
  Output a technical capability summary organized by module.

#### Agent 3: Dependency & Architecture Analysis
- **subagent_type**: `architect-reviewer`
- **Prompt**: Analyze the dependency chain for skill `{name}`:
  1. Read `.claude/skills/{name}/manifest.yaml` to get `depends` list
  2. For each dependency, read its `manifest.yaml` and `SKILL.md`
  3. Map out: what capabilities are inherited, what this skill adds on top, how IPC operations chain together
  4. Describe the architectural relationship (does this skill extend an IPC handler? Add new Docker services? Layer on top of existing modules?)
  5. Identify the data flow: where does input come from, what processing happens, where does output go?
  Output an architecture summary with a suggested ASCII diagram.

### Phase 2: Synthesis

Using all three agent outputs, generate the improved SKILL.md following the exact section order from SKILL_TEMPLATE.md:

**Critical rules:**
1. **Preserve the existing YAML frontmatter** `name` field. Update `description` only if it's clearly incomplete.
2. **Only reference real code** — function names, types, IPC operations must come from Agent 2's source analysis. Never invent APIs.
3. **For skills with empty `add/` directories** (no source code yet):
   - Include all structural sections based on manifest metadata
   - Mark architecture and code-level sections with: `> **Note:** Implementation files pending. Details below are based on manifest.yaml and will be updated when source is added.`
   - Still include the full file structure from manifest `adds`
   - Still include env vars from manifest `structured`
4. **Every setup step must have a `Verify:` check** — use `echo` or `ls` or `grep` commands.
5. **Quick Start must use the actual apply command**: `npx tsx scripts/apply-skill.ts .claude/skills/{name}`
6. **Integration Points section**: only include if manifest has `modifies`. Content comes from `modify/` directory files and `.intent.md` files.
7. **Features table**: use real tool names from source if available, otherwise use descriptive feature names from current SKILL.md or manifest description.

### Phase 3: Validation

Before writing, verify the generated SKILL.md against the Quality Checklist in SKILL_TEMPLATE.md:

- [ ] YAML frontmatter has name + description
- [ ] All required sections present
- [ ] File paths match manifest `adds`/`modifies`
- [ ] Env vars match manifest `structured.env_additions`
- [ ] Dependency names match manifest `depends`
- [ ] No hallucinated function names (cross-check with Agent 2 output)
- [ ] Every setup step has verification command
- [ ] Architecture diagram reflects actual file/module structure

### Phase 4: Write & Report

1. Write the improved SKILL.md to `.claude/skills/{name}/SKILL.md`
2. Report a summary for each skill:

```
## {skill-name}
- Before: {old_lines} lines, {old_sections} sections
- After:  {new_lines} lines, {new_sections} sections
- Added sections: {list}
- Source status: {has source files / manifest-only}
- Warnings: {any caveats}
```

## After All Skills Processed

Show a final summary table:

| Skill | Before | After | Source? | Status |
|-------|--------|-------|---------|--------|

Target: $ARGUMENTS
