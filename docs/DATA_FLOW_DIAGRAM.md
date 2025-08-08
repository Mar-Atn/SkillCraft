# SkillCraft Data Flow Visualization
*Visual representation of data flows and dependencies*

## System Architecture Overview

```mermaid
graph TB
    subgraph "External APIs"
        EL[ElevenLabs API<br/>Agents & Conversations]
        GM[Gemini API<br/>AI Feedback]
    end

    subgraph "File Storage"
        SM[Scenarios.md<br/>Static Scenarios]
        PD[Company_SX_Guide.pdf<br/>Reference Materials]
    end

    subgraph "localStorage"
        LS1[skillcraft_data<br/>Characters & System]
        LS2[skillcraft_user_data<br/>Progress & Conversations]
    end

    subgraph "Services Layer"
        DS[dataService.ts<br/>Character CRUD]
        SS[scenarioService.ts<br/>File Parser]
        ELS[elevenLabsService.ts<br/>Agent Fetching]
        FS[feedbackService.ts<br/>AI Processing]
        UDS[userDataService.ts<br/>Progress Tracking]
        TS[transcriptService.ts<br/>Transcript Fetching]
    end

    subgraph "Admin Interface"
        CM[CharacterManagement<br/>Agent Assignment]
        SM2[ScenarioManagement<br/>CRUD Interface]
        AD[AdminDashboard<br/>Overview]
    end

    subgraph "User Interface"
        DB[Dashboard<br/>Scenario Selection]
        SP[ScenarioPage<br/>Practice Interface]
        VC[VoiceConversation<br/>Live Practice]
        FD[FeedbackDisplay<br/>Results]
    end

    subgraph "Context & State"
        AC[AuthContext<br/>User State]
        CS[Component State<br/>Runtime Data]
    end

    %% External API connections
    ELS --> EL
    VC --> EL
    TS --> EL
    FS --> GM

    %% File connections
    SS --> SM
    SS --> PD

    %% localStorage connections
    DS --> LS1
    UDS --> LS2

    %% Service to UI connections
    CM --> ELS
    CM --> DS
    SM2 --> SS
    DB --> SS
    SP --> SS
    VC --> DS
    VC --> UDS
    VC --> TS
    VC --> FS
    FD --> UDS

    %% Context connections
    AC --> CM
    AC --> SM2
    AC --> AD
    AC --> DB
    AC --> VC

    %% Data flow arrows
    VC -->|Creates| LS2
    FS -->|Stores Feedback| LS2
    CM -->|Updates Characters| LS1
    ELS -->|Fetches Agents| EL
    VC -->|Uses Agent IDs| LS1

    style EL fill:#e1f5fe
    style GM fill:#e8f5e8
    style LS1 fill:#fff3e0
    style LS2 fill:#fff3e0
    style VC fill:#f3e5f5
    style CM fill:#f3e5f5
```

## Critical Data Pathways

### **1. Character-Agent Assignment Flow**
```
Admin Interface → ElevenLabs API → localStorage → Voice Conversation
     ↓               ↓                ↓              ↓
CharacterMgmt → elevenLabsService → dataService → VoiceConversation
     ↓               ↓                ↓              ↓
"Edit Character" → "Fetch Agents" → "Save Agent" → "Use Agent ID"
```

### **2. Conversation & Feedback Flow**
```
User Practice → ElevenLabs → Transcript → Gemini → localStorage
      ↓            ↓           ↓          ↓         ↓
ScenarioPage → VoiceConv → transcriptSvc → feedbackSvc → userDataSvc
      ↓            ↓           ↓          ↓         ↓
"Start" → "Live Conversation" → "Get Text" → "AI Analysis" → "Store Results"
```

### **3. Scenario Loading Flow**
```
File System → Service Cache → User Interface
     ↓           ↓              ↓
Scenarios.md → scenarioService → Dashboard/ScenarioPage
     ↓           ↓              ↓
"Static Data" → "Parse & Cache" → "Display Scenarios"
```

## Data Consistency Map

### **Consistent Flows** ✅
- **Character ↔ Agent Assignment**: Reliable localStorage persistence
- **Progress Tracking**: EWMA ratings with proper storage
- **Voice Integration**: Agent IDs flow correctly to conversations
- **Feedback Pipeline**: End-to-end transcript to feedback storage

### **Inconsistent Flows** ⚠️
- **User Authentication**: In-memory only, lost on refresh
- **Scenario-Character Links**: File-based vs localStorage split
- **Admin Scenario CRUD**: UI exists but doesn't persist to file
- **Past Conversations**: Stored but no access UI

## Storage Interaction Matrix

|Component|localStorage|Files|ElevenLabs|Gemini|
|---------|------------|-----|----------|------|
|**CharacterManagement**|✅ Read/Write|❌|✅ Fetch|❌|
|**ScenarioManagement**|❌|✅ Read Only|❌|❌|
|**VoiceConversation**|✅ Read/Write|❌|✅ Converse|❌|
|**Dashboard**|✅ Read|✅ Read|❌|❌|
|**FeedbackService**|✅ Write|❌|✅ Transcript|✅ Generate|
|**UserDataService**|✅ Read/Write|❌|❌|❌|

## Potential Data Conflicts

### **1. Character Assignment Conflicts**
```
Scenarios.md: assignedCharacterId: 1
localStorage: character.id: 1 (but different data)
Risk: Character data inconsistency
```

### **2. User State Loss**
```
User logs in → Practices → Page refresh → User lost
localStorage has progress but no user context
Risk: Orphaned progress data
```

### **3. Admin Changes Not Persisting**
```
Admin edits scenario → UI updates → File unchanged
Next reload: Changes lost
Risk: Admin frustration, data loss
```

## Recommended Fixes Priority

### **🔥 Critical (Data Loss Risk)**
1. **User Persistence**: Add user authentication to localStorage
2. **Scenario Persistence**: Connect admin CRUD to actual storage

### **⚠️ Important (Consistency Issues)**
3. **Unified Character-Scenario Assignment**: Single source of truth
4. **Past Conversations UI**: Access stored conversation history

### **💡 Enhancement (User Experience)**
5. **Data Migration Tools**: Handle localStorage schema changes
6. **Backup/Export Features**: Allow data export for safety

This analysis shows a solid core architecture with specific integration gaps that can be systematically addressed.