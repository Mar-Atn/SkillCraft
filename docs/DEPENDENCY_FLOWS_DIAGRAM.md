# Dependency Flows - Visual Architecture

**Sprint 1: Content Creation Foundation**  
**Focus:** Clean, bulletproof dependency chains from admin actions to user experience

---

## 🔄 CORE DEPENDENCY CHAINS

### **Chain 1: Scenario Management Flow**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SCENARIO DEPENDENCY CHAIN                         │
└─────────────────────────────────────────────────────────────────────────────┘

Admin Action                File System                User Experience
┌─────────────┐           ┌─────────────┐            ┌─────────────┐
│             │           │             │            │             │
│   Admin     │  CREATE   │  /data/     │   SYNC     │ Scenario    │
│  Creates    │────────→  │ Scenarios   │────────→   │ Selector    │
│  Scenario   │           │   .md       │            │ Updates     │
│             │           │             │            │             │
└─────────────┘           └─────────────┘            └─────────────┘
                                │                             │
                                │                             │
                                ▼                             ▼
                          ┌─────────────┐            ┌─────────────┐
                          │  /public/   │            │    User     │
                          │ Scenarios   │            │  Selects    │
                          │   .md       │            │  Scenario   │
                          │             │            │             │
                          └─────────────┘            └─────────────┘
                                                             │
                                                             │
                                                             ▼
                                                    ┌─────────────┐
                                                    │    Voice    │
                                                    │Conversation │
                                                    │ Gets Context│
                                                    │             │
                                                    └─────────────┘

VERIFICATION POINTS:
✓ File write success
✓ Public folder sync verified  
✓ Frontend cache cleared
✓ User sees new option immediately
✓ VoiceConversation receives correct context
```

### **Chain 2: Character-Scenario Integration Flow**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CHARACTER-SCENARIO INTEGRATION                        │
└─────────────────────────────────────────────────────────────────────────────┘

Admin Creates Character            Context Assembly Engine            ElevenLabs Agent
┌─────────────┐                   ┌─────────────┐                    ┌─────────────┐
│             │                   │             │                    │             │
│   Admin     │  CREATE           │  Character  │   ASSEMBLE        │ ElevenLabs  │
│  Creates    │────────────────→  │    Data     │────────────────→  │   Agent     │
│ Character   │                   │     +       │                    │  Receives   │
│             │                   │  Scenario   │                    │  Complete   │
└─────────────┘                   │    Data     │                    │  Persona    │
                                  │             │                    │             │
                                  └─────────────┘                    └─────────────┘
                                         │
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ Combined    │
                                  │ Prompt:     │
                                  │ - Character │
                                  │ - Scenario  │
                                  │ - Voice ID  │
                                  │             │
                                  └─────────────┘

CONTEXT ASSEMBLY ALGORITHM:
```typescript
function assembleContext(scenarioId, characterId) {
  const scenario = loadScenario(scenarioId);
  const character = loadCharacter(characterId);
  
  return {
    voice: character.voiceId,
    prompt: `
      You are ${character.name}.
      ${character.personalContext}
      
      Scenario: ${scenario.generalContext}
      Your instructions: ${scenario.aiInstructions}
    `
  };
}
```

VERIFICATION POINTS:
✓ Character data persisted correctly
✓ Voice assignment saved and retrievable  
✓ Context assembly produces complete config
✓ ElevenLabs agent receives proper persona
```

### **Chain 3: Feedback Configuration Flow**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEEDBACK CONFIGURATION CHAIN                       │
└─────────────────────────────────────────────────────────────────────────────┘

Admin Sets Prompt              Conversation Ends              User Gets Feedback
┌─────────────┐              ┌─────────────┐                ┌─────────────┐
│             │              │             │                │             │
│   Admin     │  CONFIGURE   │Conversation │   GENERATE     │    User     │
│   Sets      │────────────→ │    Ends     │────────────→   │  Receives   │
│ Feedback    │              │             │                │ Customized  │
│  Prompt     │              │             │                │  Feedback   │
│             │              │             │                │             │
└─────────────┘              └─────────────┘                └─────────────┘
       │                             │
       ▼                             ▼
┌─────────────┐              ┌─────────────┐
│  /data/     │              │ AI Model    │
│AI_feedback  │              │ (Claude/    │
│   .md       │              │ Gemini/     │
│             │              │ OpenAI)     │
└─────────────┘              │ Uses Admin  │
       │                     │   Prompt    │
       ▼                     │             │
┌─────────────┐              └─────────────┘
│  /public/   │
│AI_feedback  │
│   .md       │
│             │
└─────────────┘

VERIFICATION POINTS:
✓ Active prompt marked correctly
✓ Model selection applied
✓ Feedback uses admin-defined prompt
✓ User receives personalized feedback
```

---

## 🏗️ FILE SYSTEM SYNC ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FILE SYSTEM SYNC PATTERNS                         │
└─────────────────────────────────────────────────────────────────────────────┘

SOURCE OF TRUTH              PUBLIC ACCESS               USER FRONTEND
     (Admin)                  (Frontend)                 (Experience)

┌─────────────┐             ┌─────────────┐            ┌─────────────┐
│             │             │             │            │             │
│   /data/    │   ATOMIC    │  /public/   │   FETCH    │   React     │
│ Scenarios   │────SYNC───→ │ Scenarios   │──────────→ │ Components  │
│   .md       │             │   .md       │            │             │
│             │             │             │            │             │
└─────────────┘             └─────────────┘            └─────────────┘
       │                           │                           │
       │                           │                           │
       ▼                           ▼                           ▼
┌─────────────┐             ┌─────────────┐            ┌─────────────┐
│ Characters  │   ATOMIC    │ Characters  │   FETCH    │ Scenario    │
│   .md       │────SYNC───→ │   .md       │──────────→ │ Selector    │
│             │             │             │            │             │
└─────────────┘             └─────────────┘            └─────────────┘
       │                           │                           │
       │                           │                           │
       ▼                           ▼                           ▼
┌─────────────┐             ┌─────────────┐            ┌─────────────┐
│ Feedback    │   ATOMIC    │ Feedback    │   FETCH    │ Feedback    │
│   .md       │────SYNC───→ │   .md       │──────────→ │ Service     │
│             │             │             │            │             │
└─────────────┘             └─────────────┘            └─────────────┘

SYNC VERIFICATION:
┌─────────────┐
│  /archive/  │
│  backups/   │  ← Backup before every change
│   logs/     │  ← Log every admin action
│             │
└─────────────┘
```

### **Atomic Sync Algorithm**
```typescript
async function atomicSync(sourceFile: string, targetFile: string) {
  // 1. Create backup
  const backup = await createBackup(sourceFile);
  
  // 2. Verify source file integrity
  const sourceValid = await validateFile(sourceFile);
  if (!sourceValid) throw new Error('Source file invalid');
  
  // 3. Atomic write to target
  const tempFile = `${targetFile}.tmp`;
  await writeFile(tempFile, await readFile(sourceFile));
  await rename(tempFile, targetFile);
  
  // 4. Verify target matches source
  const syncValid = await verifySyncIntegrity(sourceFile, targetFile);
  if (!syncValid) {
    await restoreFromBackup(backup, targetFile);
    throw new Error('Sync failed - restored from backup');
  }
  
  // 5. Log success
  await logSyncSuccess(sourceFile, targetFile);
  
  return true;
}
```

---

## 🎯 ADMIN INTERFACE FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ADMIN USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────────────────┘

LOGIN                 DASHBOARD              CONTENT MANAGEMENT
┌─────────────┐      ┌─────────────┐       ┌─────────────┐
│             │      │             │       │             │
│ admin@      │ AUTH │ Navigation  │SELECT │ Scenarios   │
│ admin.com   │────→ │   Menu      │────→  │ Manager     │
│             │      │             │       │             │
└─────────────┘      └─────────────┘       └─────────────┘
                            │                      │
                            ├──────────────────────┤
                            │                      │
                            ▼                      ▼
                     ┌─────────────┐       ┌─────────────┐
                     │ Characters  │       │ Feedback    │
                     │ Manager     │       │ Manager     │
                     │             │       │             │
                     └─────────────┘       └─────────────┘

ADMIN ACTIONS:
┌─────────────────────────────────────────────────────────────────────────────┐
│ CREATE SCENARIO                                                             │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│ │   Fill      │  │   Preview   │  │    Save     │  │   Verify    │        │
│ │   Form      │→ │   Content   │→ │   & Sync    │→ │User Sees It │        │
│ │             │  │             │  │             │  │             │        │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CREATE CHARACTER                                                            │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│ │   Define    │  │  Assign     │  │  Test       │  │   Deploy    │        │
│ │ Personality │→ │   Voice     │→ │ Context     │→ │ to Scenarios│        │
│ │             │  │             │  │ Assembly    │  │             │        │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CONFIGURE FEEDBACK                                                          │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│ │   Write     │  │   Select    │  │   Test      │  │   Apply     │        │
│ │  Prompt     │→ │   Model     │→ │ Generation  │→ │   Active    │        │
│ │             │  │             │  │             │  │             │        │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 CONSTITUTIONAL PROTECTION MAP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SACRED CODE PROTECTION                            │
└─────────────────────────────────────────────────────────────────────────────┘

UNTOUCHABLE (SACRED)              PROTECTED (EXISTING)           NEW (ADDITIVE)
┌─────────────┐                  ┌─────────────┐               ┌─────────────┐
│VoiceConver- │ ← NEVER MODIFY   │ Scenario    │ ← MINOR       │   Admin     │
│sation.tsx   │                  │ Service.ts  │   ENHANCE     │ Interfaces  │
│             │                  │             │               │             │
└─────────────┘                  └─────────────┘               └─────────────┘
┌─────────────┐                  ┌─────────────┐               ┌─────────────┐
│Transcript   │ ← NEVER MODIFY   │ Feedback    │ ← MINOR       │   Admin     │
│Service.ts   │                  │ Service.ts  │   ENHANCE     │ Services    │
│             │                  │             │               │             │
└─────────────┘                  └─────────────┘               └─────────────┘
┌─────────────┐                  ┌─────────────┐               ┌─────────────┐
│Rating       │ ← NEVER MODIFY   │   Existing  │ ← PRESERVE    │File System  │
│Service.ts   │                  │ Components  │   EXACTLY     │ Utilities   │
│             │                  │             │               │             │
└─────────────┘                  └─────────────┘               └─────────────┘

MODIFICATION RULES:
✅ ADD new admin routes and components
✅ ENHANCE existing services with backward compatibility  
✅ CREATE new file system utilities
❌ NEVER modify SACRED voice integration
❌ NEVER change existing component interfaces
❌ NEVER break existing user experience
```

---

**This architecture ensures bulletproof dependency flows while maintaining complete constitutional compliance and SACRED code protection.**

**Every admin action flows cleanly to user experience. Every dependency chain is verified. Every change is logged and recoverable.**

**Ready to implement this clean, professional content management foundation.**