# Sprint 1: Content Creation Foundation - Technical Architecture

**Version:** 1.0  
**Date:** August 7, 2025  
**Sprint Goal:** Enable T&D admins to autonomously create, edit, and manage all training content without developer intervention.

---

## 🎯 STRATEGIC ALIGNMENT

### Updated PRD Approach (Section 7)
"Create fully functional product that allows several admins (humans partnering with specialized AI agents - but outside the app) to start working on creation and improvement of content via simple and reliable admin interfaces: cases, personas, feedback prompts, without the need to revert to hard coding."

### Sprint 1 Success Criteria
- **Admin Autonomy**: T&D teams can create/edit content independently
- **Content Velocity**: New scenarios created weekly vs monthly  
- **Quality Control**: Admin preview and validation before user exposure
- **Zero User Disruption**: No admin action breaks user experience
- **SACRED Protection**: Working voice systems remain untouched

---

## 🏗️ CORE ARCHITECTURE

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │  File System    │    │  User Frontend  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ /data/          │    │ ┌─────────────┐ │
│ │ Scenarios   │ │────│ └─Scenarios.md  │────│ │ Scenario    │ │
│ │ Manager     │ │    │ └─Characters.md │    │ │ Selector    │ │
│ └─────────────┘ │    │ └─Feedback.md   │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ /public/        │    │ ┌─────────────┐ │
│ │ Characters  │ │────│ └─Scenarios.md  │────│ │ Voice       │ │
│ │ Manager     │ │    │ └─Characters.md │    │ │ Conversation│ │
│ └─────────────┘ │    │ └─Feedback.md   │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ /archive/       │    │ ┌─────────────┐ │
│ │ Feedback    │ │────│ └─backups/      │────│ │ Feedback    │ │
│ │ Manager     │ │    │ └─logs/         │    │ │ Display     │ │
│ └─────────────┘ │    │                 │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18 + TypeScript (existing)
- **Admin UI**: New admin routes and components
- **Data Storage**: File-first approach (Markdown + JSON)
- **Authentication**: Simple admin@admin.com gate
- **File Sync**: Atomic write + verification patterns
- **Voice Integration**: Existing SACRED ElevenLabs system (untouched)

---

## 🔄 DEPENDENCY FLOW ARCHITECTURE

### Critical Dependency Chains

#### **Chain 1: Scenario Management**
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Admin Creates│    │ Update Files │    │ User Sees    │    │ Voice Gets   │
│ New Scenario │──→ │ /data/ &     │──→ │ New Option   │──→ │ Scenario     │
│              │    │ /public/     │    │              │    │ Context      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**Implementation:**
```typescript
// Admin action
async createScenario(scenarioData: ScenarioInput) {
  // 1. Validate scenario structure
  const validated = validateScenario(scenarioData);
  
  // 2. Update source of truth
  await updateFile('/data/Scenarios.md', validated);
  
  // 3. Sync to public folder
  await syncToPublic('/data/Scenarios.md', '/public/Scenarios.md');
  
  // 4. Verify user will see changes
  await verifyUserVisibility('scenarios');
  
  return { success: true, id: validated.id };
}

// User experience
// ScenarioSelector automatically picks up new scenarios
// VoiceConversation receives scenario context via existing props
```

#### **Chain 2: Character-Scenario Integration**
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Admin Creates│    │ Update       │    │ Context      │    │ ElevenLabs   │
│ Character    │──→ │ Characters   │──→ │ Assembly     │──→ │ Agent Gets   │
│              │    │ File         │    │ Engine       │    │ Full Persona │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**Implementation:**
```typescript
// Context Assembly Engine (THE CRITICAL INTEGRATION)
async assembleConversationContext(scenarioId: number, characterId?: number) {
  // Load scenario
  const scenario = await scenarioService.getScenario(scenarioId);
  
  // Load character (or default)
  const character = characterId 
    ? await characterService.getCharacter(characterId)
    : await characterService.getDefaultCharacter();
  
  // Assemble complete agent context
  return {
    // Scenario data (PRD 3.4.1)
    generalContext: scenario.generalContext,
    aiInstructions: scenario.aiInstructions,
    difficultyLevel: scenario.difficultyLevel,
    
    // Character data (PRD 3.3.1)
    characterName: character.name,
    personalContext: character.personalContext,
    complexityLevel: character.complexityLevel,
    voiceId: character.voiceId,
    
    // Combined prompt for ElevenLabs
    combinedPrompt: `
      You are ${character.name}. 
      
      Personal Context: ${character.personalContext}
      
      Scenario: ${scenario.generalContext}
      
      Your Role Instructions: ${scenario.aiInstructions}
    `
  };
}
```

#### **Chain 3: Feedback Management**
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Admin Sets   │    │ Update       │    │ Conversation │    │ User Gets    │
│ Feedback     │──→ │ Feedback     │──→ │ Ends, AI     │──→ │ Customized   │
│ Prompt       │    │ File         │    │ Generates    │    │ Feedback     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**Implementation:**
```typescript
// Admin sets active feedback prompt
async setActiveFeedbackPrompt(promptId: string, modelType: 'claude' | 'gemini' | 'openai') {
  const feedbackConfig = {
    activePromptId: promptId,
    selectedModel: modelType,
    prompts: await getAllFeedbackPrompts()
  };
  
  await updateFile('/data/AI_feedback.md', feedbackConfig);
  await syncToPublic('/data/AI_feedback.md', '/public/AI_feedback.md');
}

// Feedback generation (existing service, minor enhancement)
async generateFeedback(transcript: any[]) {
  // Load admin-configured prompt
  const config = await loadFeedbackConfig('/public/AI_feedback.md');
  const activePrompt = config.prompts.find(p => p.id === config.activePromptId);
  
  // Use admin-selected model
  const model = getModelClient(config.selectedModel);
  
  // Generate feedback with admin prompt
  return await model.generateFeedback(transcript, activePrompt.text);
}
```

---

## 🗂️ FILE SYSTEM ARCHITECTURE

### Folder Structure
```
/SkillCraft/
├── 📚 /data/              # Source of truth (admin writes here)
│   ├── Scenarios.md       # All scenarios (PRD 3.4.1 structure)
│   ├── AI_characters.md   # All characters (PRD 3.3.1 structure)
│   ├── AI_feedback.md     # Feedback prompts & config
│   └── admin_actions.json # Admin action log
├── 🌐 /public/            # Frontend accessible (synced from /data/)
│   ├── Scenarios.md       # Synced copy for user frontend
│   ├── AI_characters.md   # Synced copy for user frontend
│   └── AI_feedback.md     # Synced copy for feedback service
├── 🗄️ /archive/           # Backups and logs
│   ├── /backups/          # Auto-backups before changes
│   └── /logs/             # Admin action logs
└── 🔒 /src/               # SACRED application code (unchanged)
    ├── /components/       # Existing components (protected)
    ├── /services/         # Existing services (protected)  
    └── /pages/admin/      # NEW: Admin interfaces
```

### File Sync Patterns

#### **Pattern 1: Atomic Write + Sync**
```typescript
async function updateContent(type: ContentType, content: any) {
  // 1. Create backup first
  await createBackup(`/archive/backups/${type}_${Date.now()}.md`);
  
  // 2. Validate content structure
  const validated = validateContentStructure(type, content);
  
  // 3. Atomic write to source of truth
  const sourceFile = `/data/${type}.md`;
  await writeFileAtomic(sourceFile, validated);
  
  // 4. Sync to public folder
  const publicFile = `/public/${type}.md`;
  await copyFileAtomic(sourceFile, publicFile);
  
  // 5. Verify sync integrity
  const syncVerified = await verifySyncIntegrity(sourceFile, publicFile);
  if (!syncVerified) {
    throw new Error('File sync failed - reverting changes');
  }
  
  // 6. Log admin action
  await logAdminAction({
    action: 'update',
    type,
    timestamp: new Date(),
    fileHash: await getFileHash(sourceFile)
  });
  
  return { success: true, timestamp: new Date() };
}
```

#### **Pattern 2: Verification Points**
```typescript
// Verify user will see changes immediately
async function verifyUserVisibility(contentType: string) {
  // Check if frontend can load new content
  const publicContent = await fetch(`/public/${contentType}.md`);
  const parsedContent = await parseContent(publicContent);
  
  // Verify structure is correct
  if (!validateParsedContent(parsedContent)) {
    throw new Error('User visibility verification failed');
  }
  
  return true;
}

// Verify context assembly works
async function verifyContextAssembly(scenarioId: number, characterId: number) {
  const context = await assembleConversationContext(scenarioId, characterId);
  
  // Check all required fields present
  const requiredFields = ['generalContext', 'aiInstructions', 'personalContext', 'voiceId'];
  const missingFields = requiredFields.filter(field => !context[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Context assembly missing: ${missingFields.join(', ')}`);
  }
  
  return context;
}
```

---

## 🎨 ADMIN INTERFACE DESIGN

### Admin Routes Structure
```
/admin/
├── /admin/login           # Simple authentication
├── /admin/dashboard       # Overview + navigation
├── /admin/scenarios       # Scenarios CRUD (PRD 4.1.1)
├── /admin/characters      # Characters CRUD (PRD 4.1.2)
├── /admin/feedback        # Feedback prompts (PRD 4.1.3)
└── /admin/logs            # Admin action history
```

### Component Architecture
```typescript
// Admin Layout
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Scenarios Manager (PRD 4.1.1)
interface ScenarioManagerProps {}
interface ScenarioFormProps {
  scenario?: Scenario;
  onSave: (scenario: Scenario) => void;
  onCancel: () => void;
}

// Characters Manager (PRD 4.1.2)  
interface CharacterManagerProps {}
interface CharacterFormProps {
  character?: Character;
  onSave: (character: Character) => void;
  onVoiceChange: (characterId: number) => void;
}

// Feedback Manager (PRD 4.1.3)
interface FeedbackManagerProps {}
interface FeedbackPromptProps {
  prompts: FeedbackPrompt[];
  activePromptId: string;
  selectedModel: 'claude' | 'gemini' | 'openai';
  onPromptSelect: (promptId: string) => void;
  onModelChange: (model: string) => void;
}
```

### Form Structures (PRD Compliance)

#### **Scenario Form (PRD 4.1.1)**
```typescript
interface ScenarioForm {
  // PRD 3.4.1: Scenario Components (Hard Structure)
  generalContext: string;           // Textarea - background visible to both
  humanInstructions: string;        // Textarea - confidential for human
  aiInstructions: string;           // Textarea - confidential for AI
  learningObjectives: string[];     // Dynamic list input
  focusPoints: string[];            // Dynamic list input  
  debriefingPoints: string[];       // Dynamic list input
  difficultyLevel: number;          // Slider 1-10
}
```

#### **Character Form (PRD 4.1.2)**
```typescript
interface CharacterForm {
  // PRD 3.3.1: Character Components (Hard Structure)
  name: string;                     // Text input
  personalContext: string;          // Textarea - character description
  complexityLevel: number;          // Slider 1-10
  voiceId: string;                  // Auto-assigned, with "Change Voice" button
  gender: 'male' | 'female' | 'neutral'; // For voice assignment
}
```

#### **Feedback Prompt Form (PRD 4.1.3)**
```typescript
interface FeedbackPromptForm {
  name: string;                     // Prompt name/title
  promptText: string;               // Textarea - the actual prompt
  model: 'claude' | 'gemini' | 'openai'; // Model selection
  active: boolean;                  // Is this the active prompt?
}
```

---

## 🔧 IMPLEMENTATION PHASES

### **Phase 1: Foundation (Days 1-2)**
**Deliverables:**
- Admin authentication system
- Admin layout and navigation
- Basic file system utilities
- Atomic write/sync patterns

**Verification:**
- ✅ Admin can login and access /admin routes
- ✅ File operations work reliably
- ✅ Backup system creates backups before changes
- ✅ Sync patterns maintain data integrity

### **Phase 2: Scenarios Interface (Days 3-4)**
**Deliverables:**
- Scenarios list view with existing scenarios
- Create new scenario form (5 fields per PRD)
- Edit existing scenario form
- Delete scenario functionality
- Live preview before save

**Verification:**
- ✅ Admin creates scenario → File updated → User sees new option
- ✅ Admin edits scenario → Changes reflected in ScenarioSelector
- ✅ Admin deletes scenario → Removed from user options
- ✅ VoiceConversation receives correct scenario context

### **Phase 3: Characters Interface (Days 5-6)**  
**Deliverables:**
- Characters list view with existing characters
- Create new character form (name, context, complexity)
- ElevenLabs voice integration (auto-assign + change)
- Edit existing character form
- Delete character functionality

**Verification:**
- ✅ Admin creates character → Available in system
- ✅ Voice assignment works and persists
- ✅ Character context integrates with scenarios
- ✅ ElevenLabs receives proper persona instructions

### **Phase 4: Context Assembly Engine (Day 7)**
**Deliverables:**
- Context assembly service
- Character-scenario compatibility validation
- Integration testing between all components

**Verification:**
- ✅ Any admin-created character works with any scenario
- ✅ Context assembly produces complete agent config
- ✅ Voice conversations reflect character personality
- ✅ No context conflicts or missing data

### **Phase 5: Feedback Interface (Days 8-9)**
**Deliverables:**
- Feedback prompts list with active selection
- Create/edit prompt interface  
- Model selection (Claude/Gemini/OpenAI)
- Active prompt management

**Verification:**
- ✅ Admin changes prompt → Next conversation uses new prompt
- ✅ Model selection applied correctly
- ✅ Feedback generation reflects admin configuration
- ✅ User receives feedback per admin settings

### **Phase 6: Integration & Polish (Day 10)**
**Deliverables:**
- End-to-end testing of all dependency chains
- Error handling and edge case management  
- Admin interface UX polish
- Admin user documentation

**Verification:**
- ✅ Complete flow: Admin creates content → User experiences changes
- ✅ All file syncing bulletproof and verified
- ✅ No admin action breaks user experience
- ✅ Admin interfaces are intuitive and efficient

---

## 🛡️ CONSTITUTIONAL COMPLIANCE

### **SACRED Code Protection**
```
✅ ZERO modifications to VoiceConversation.tsx (SACRED)
✅ ZERO changes to scenarioService.ts (existing patterns preserved)
✅ ZERO changes to feedbackService.ts (minor enhancement only)
✅ ZERO changes to ratingService.ts (untouched)
✅ ADDITIVE ONLY: New admin routes, components, and services
```

### **PRD Requirements Fulfilled**
```
✅ PRD 4.1.1: Create/Customize Scenario Admin Interface
✅ PRD 4.1.2: Create/Customize Character Admin Interface  
✅ PRD 4.1.3: Feedback Setting/Customization Admin Interface
✅ PRD 3.3.1: Character Components (Hard Structure)
✅ PRD 3.4.1: Scenario Components (Hard Structure)
```

### **Dependency Chain Guarantees**
```
✅ Every admin action has defined, verified user impact
✅ File system sync patterns are atomic and verified
✅ Context assembly handles all character-scenario combinations
✅ No broken dependency chains possible
✅ Complete rollback capability maintained
```

### **Business Value Delivery**
```
✅ T&D admins become autonomous content creators
✅ Content iteration cycles accelerate from months to hours
✅ Quality control through admin preview and validation
✅ Multiple admins can work simultaneously
✅ AI agents can guide admin content creation
```

---

## 🎯 SUCCESS METRICS

### **Technical Metrics**
- **Admin Adoption**: All T&D team members using interface within 1 week
- **Content Velocity**: New scenarios created weekly vs monthly
- **System Reliability**: Zero user experience disruptions from admin actions
- **Data Integrity**: 100% success rate on file sync operations

### **Business Metrics**  
- **Content Quality**: User ratings on new vs existing scenarios
- **Admin Productivity**: Time to create new scenario (target: <30 minutes)
- **User Engagement**: Increase in scenario completion rates
- **Feedback Quality**: Admin-customized feedback effectiveness

---

## 🚀 DEPLOYMENT STRATEGY

### **Gradual Rollout**
1. **Week 1**: Deploy admin interfaces to staging
2. **Week 2**: T&D team training and initial content creation  
3. **Week 3**: Limited user testing with new content
4. **Week 4**: Full production deployment

### **Risk Mitigation**
- **Backup Strategy**: Automatic backups before every admin change
- **Rollback Plan**: Complete git-based version control
- **Testing Protocol**: Comprehensive dependency chain testing
- **Monitoring**: Real-time admin action logging and verification

---

**This architecture delivers the content creation foundation that transforms SkillCraft from developer-dependent to admin-autonomous, enabling rapid content iteration and quality improvement cycles essential for production success.**

**Constitutional compliance maintained. SACRED code protected. Enterprise-grade dependency management implemented.**