# SkillCraft Project Cleanup Analysis
**Constitutional Housekeeping - Professional Project Organization**

---

## 🏛️ CONSTITUTIONAL COMPLIANCE ANALYSIS

### ✅ PERFECTLY ALIGNED FILES
- **CLAUDE.md**: Constitutional framework document (SACRED)
- **SCSX_PRD.md**: Product requirements document (SACRED)
- **ELEVENLABS_SDK_REFERENCE.md**: Technical patterns reference (SACRED)
- **STATUS.md**: Project progress tracking (CONSTITUTIONAL REQUIREMENT)

### ✅ PRD-MANDATED ESSENTIAL FILES
- **Scenarios.md**: Primary scenario content (PRD Section 3.4)
- **AI_characters.md**: Character definitions (PRD Section 3.3)  
- **AI_feedback.md**: Feedback prompts (PRD Section 3.5)
- **scoring_methodology.md**: Rating criteria (PRD Section 3.6)

---

## 📂 FILE CATEGORIZATION

### 🟢 ESSENTIAL (Core Functionality - NEVER DELETE)

#### Constitutional Framework
- `CLAUDE.md` - Development constitution (SACRED)
- `SCSX_PRD.md` - Product requirements (SACRED) 
- `ELEVENLABS_SDK_REFERENCE.md` - Technical patterns (SACRED)
- `STATUS.md` - Project tracking

#### Core Application
- `src/` folder (entire directory) - React application
- `package.json` & `package-lock.json` - Dependencies
- `index.html` - Entry point
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Styling configuration
- `.env` - Environment variables

#### PRD-Mandated Data Files
- `Scenarios.md` - Training scenarios (PRD 3.4)
- `public/Scenarios.md` - Frontend-accessible scenarios
- `AI_characters.md` - Character definitions (PRD 3.3)
- `AI_feedback.md` - Feedback prompts (PRD 3.5)
- `scoring_methodology.md` - Rating methodology (PRD 3.6)

#### SACRED Components (Protected by CLAUDE.md)
- `src/components/voice/VoiceConversation.tsx` - Voice integration (UNTOUCHABLE)
- `src/services/transcriptService.ts` - NM pattern implementation
- `src/services/feedbackService.ts` - Working feedback system
- `src/services/ratingService.ts` - Working rating engine

### 🟡 USEFUL (Supporting Documentation - KEEP)

#### Project Management
- `README.md` - Project overview
- `RATING_SYSTEM_GUIDE.md` - System documentation
- `.gitignore` - Version control configuration

#### Reference Materials
- `AGENT_FETCH&USE_GUIDE.md` - Agent collaboration guide
- `ELEVENLABS_AGENT_SETUP.md` - ElevenLabs configuration

#### API Documentation
- `API/` folder contents - API keys and documentation
- `scripts/` folder - Utility scripts

### 🟠 EXPERIMENTAL (Test/Development Files - ARCHIVE)

#### Test Files
- `test-scenario-integration.html` - Session 3 test page
- `scripts/voice-conversation-test.html` - Voice testing
- `src/utils/testEWMA.ts` - Rating system tests
- `src/utils/testRatingSystem.ts` - Rating system tests  
- `src/utils/comprehensiveRatingTest.ts` - Rating system tests

#### Development Utilities
- `scripts/create-elevenlabs-agent.js` - Agent creation script
- `scripts/test-agent-connection.js` - Connection testing

### 🔴 REDUNDANT (Duplicate/Outdated Content - DELETE CANDIDATES)

#### Duplicate Documentation
- `IMPLEMENTATION_SUMMARY.md` - Covered by STATUS.md
- `SOLUTION_SUMMARY.md` - Covered by STATUS.md  
- `PROJECT_PLAN.md` - Superseded by SCSX_PRD.md
- `VALIDATION_REPORT.md` - Covered by STATUS.md
- `PROJECT DOCS/USE_EXP/IMPLEMENTATION_SUMMARY.md` - Duplicate

#### Old Configuration
- `eslint.config.js` - Using default linting
- `.prettierrc` - Using default formatting
- `postcss.config.js` - Standard Tailwind config
- `vitest.config.ts` - No tests currently running

#### Build Artifacts (Auto-generated)
- `backend/dist/` - Compiled backend (can be rebuilt)

### ❓ UNKNOWN (Need Review - INVESTIGATE)

#### Project Context Files
- `PROJECT DOCS/CONTEXT FROM JETBRAINS/` - Contains .docx files
- `PROJECT DOCS/USE_EXP/new JB program.md` - Purpose unclear
- `PROJECT DOCS/USE_EXP/transcript fetching method.md` - May be useful reference

---

## 🧹 PROPOSED CLEANUP STRATEGY

### PHASE 1: CREATE CONSTITUTIONAL FOLDER STRUCTURE
Following CLAUDE.md requirements for proper organization:

```
/SkillCraft/
├── /docs/                    # Documentation (new)
│   ├── CLAUDE.md            # Move here
│   ├── SCSX_PRD.md         # Move here
│   ├── ELEVENLABS_SDK_REFERENCE.md  # Move here
│   ├── STATUS.md            # Move here
│   ├── RATING_SYSTEM_GUIDE.md  # Move here
│   └── README.md            # Move here
├── /reference/              # Reference materials (new)
│   ├── AGENT_FETCH&USE_GUIDE.md
│   ├── ELEVENLABS_AGENT_SETUP.md
│   └── API/                 # Keep API folder
├── /data/                   # PRD-mandated data (new)
│   ├── Scenarios.md
│   ├── AI_characters.md
│   ├── AI_feedback.md
│   └── scoring_methodology.md
├── /experiments/            # Experimental code (new)
│   ├── test-scenario-integration.html
│   ├── rating-tests/        # Move rating test files
│   └── voice-tests/         # Move voice test files
├── /archive/                # Historical documents (new)
│   └── old-docs/            # Move redundant files
└── [keep all src/, public/, scripts/ as-is]
```

### PHASE 2: SAFE DELETIONS (Low Risk)
Files that can be safely deleted:
- `IMPLEMENTATION_SUMMARY.md` (duplicate of STATUS.md)
- `SOLUTION_SUMMARY.md` (duplicate of STATUS.md)
- `PROJECT_PLAN.md` (superseded by SCSX_PRD.md)
- `VALIDATION_REPORT.md` (covered by STATUS.md)
- `PROJECT DOCS/USE_EXP/IMPLEMENTATION_SUMMARY.md` (duplicate)
- `backend/dist/` (can be rebuilt)

### PHASE 3: ARCHIVE TO /archive/
Files to preserve but archive:
- `eslint.config.js` → `/archive/configs/`
- `.prettierrc` → `/archive/configs/`
- `postcss.config.js` → `/archive/configs/`
- `vitest.config.ts` → `/archive/configs/`

### PHASE 4: ORGANIZE EXPERIMENTS
Move to `/experiments/`:
- Test files from `src/utils/`
- `test-scenario-integration.html`
- Voice test files from `scripts/`

### PHASE 5: INVESTIGATE UNKNOWNS
Review and categorize:
- `PROJECT DOCS/CONTEXT FROM JETBRAINS/` files
- Determine if JetBrains context should be in `/reference/` or `/archive/`

---

## 🔒 PROTECTION GUARANTEES

### NEVER TOUCH (SACRED CODE)
- `src/components/voice/VoiceConversation.tsx`
- `src/services/transcriptService.ts`
- ElevenLabs integration patterns
- Working rating engine components

### CONSTITUTIONAL COMPLIANCE
- CLAUDE.md requirements followed exactly
- SCSX_PRD.md mandates preserved
- NM patterns kept intact
- Proper documentation hierarchy maintained

### ROLLBACK PLAN
- Git commit before any changes
- All moves/renames tracked
- Reference updates documented
- Easy restoration if needed

---

## 📋 EXECUTION CHECKLIST

- [ ] Create folder structure (/docs/, /reference/, /data/, /experiments/, /archive/)
- [ ] Move constitutional documents to /docs/
- [ ] Move PRD-mandated files to /data/
- [ ] Move reference materials to /reference/
- [ ] Archive experimental files to /experiments/
- [ ] Delete confirmed redundant files
- [ ] Update any broken file references
- [ ] Test build process works after reorganization
- [ ] Update README.md with new structure
- [ ] Git commit with detailed change documentation

---

**CONSTITUTIONAL COMPLIANCE**: ✅ All CLAUDE.md requirements met
**SACRED CODE PROTECTION**: ✅ No modifications to protected components  
**PRD ALIGNMENT**: ✅ All PRD-mandated files preserved and organized
**ROLLBACK READY**: ✅ Complete change tracking and restoration plan

*Ready for review and approval before execution.*