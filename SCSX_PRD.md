# SkillCraft Setting Expectations (SCSX). Product Requirements. Document v1.0

**Date Created:** August 5, 2025  
**Version:** 1.0  
**Project:** SkillCraft Setting Expectations (SCSX). Voice-Powered Training Web App Allowing to Train the Skills of productive Managing Expectations Conversations for Leaders at an IT company   
**Status:** Requirements Definition Phase

---

## 1. PRODUCT OVERVIEW

### 1.1 Vision Statement
SCSX is a simple to use voice-powered AI training web app that helps team-leads to develop skills of productive setting expectations conversations  with their direct reports through realistic practice conversations with distinct AI characters, providing immediate feedback and progress tracking.

### 1.2 Product Mission
Help develop productive Setting Expectation skills across the company leadership and employee.

### 1.3 Target Users
- **Primary Users:** team-leads (around 490 people) of the company
- **Admin Users:** T&D leads, content administrators, system administrators

### 1.4 Success Criteria
- Users complete multiple scenarios and return for additional practice
- Measurable skill improvement across defined set of criteria
- Platform preferred over traditional training methods
- Positive user feedback on realism of AI characters, scenarios and general effectiveness
- Technical reliability 

---

## 2. USER PERSONAS & ROLES

### 2.1 End User (Negotiation Learner)
**Profile:** Busy team lead seeking to improve setting expectations skills to achieve better alignment and clarity of expectations with his team and across the company
**Goals:** 
- Practice realistic setting expectation conversation scenarios safely
- Receive immediate, actionable feedback
- Track progress over time
- Flexible training that fits schedule

**Key Needs:**
- Natural voice conversation experience
- Authentic AI character personalities, including 'difficult' to handle
- Realistic cases of different complexity 
- Clear skill assessment and improvement guidance
- Clear progress tracking (graphic)
- Access to all past conversations and feedbacks 
- Professional, distraction-free interface

### 2.2 Admin User (Content Manager)
**Profile:** Training manager or subject matter expert
**Goals:**
- Customize and Add new Scenarios (via standard simple interface) 
- Customize and Add AI Characters, and assign them to scenarios (via standard simple interface)
- Customize AI generated feedback promt (via standard simple prompt for the feedback giving agent).
- Monitor user progress and engagement
- Track training effectiveness

### 2.3 System Administrator
**Profile:** Technical administrator managing platform
**Goals:**
- Ensure system reliability and performance
- Manage user access and permissions
- Monitor technical metrics
- Handle integrations and backups

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Core User Journey: OCCAM'S RAZOR SURGICAL DESIGN OF UX

#### 3.1.1 User Registration & Onboarding
- **Account Creation:** super simple Email-based registration with super simple standard authentication
- **Testing User and Admin User** uses: test@test.com with password test, and user admin@admin.com with password admin - should be created from and maintained from start of development till production (separate decision)

#### 3.1.2 Main Dashboard
- **General skill level:** general skill level, main sub-skills/criteria levels
- **Progress Chart for overall skill score:** Historical improvement trends over time
- **Chose the next scenario:** icons of all available scenarios indicating, if the scenarios has been already played or not and how successful was the best attempt (one star if scenario score was below 60, two stars if the score was between 60 and 80, three stars if the score was over 80) 
- **Past conversations:** button leading to all past conversations, scores received and feed-back provided 
- **Access to setting expectation guideline:** company document, simple guideline of how to conduct productive setting expectation conversations 

#### 3.1.2 Scenario Introduction Screen (once the scenario is selected)  
- **Character Selection:** Automatic (by default) or Choose from available AI negotiation partners. Cartoon picture of the AI persona's face.
- **Briefing Materials:** Scenario instructions (General context and Confidential instructions) 
- **Voice Check:** Test microphone and audio settings before starting

#### 3.1.3 Voice Conversation Experience (15 minutes limit)
- **Natural Speech:** Real-time voice conversation with AI character. Voice fit to gender. AI always speaks English.
- **Context Awareness:** AI maintains full conversation context and case context state
- **Interruption Handling:** Graceful handling of pauses, interruptions, or technical issues

#### 3.1.4 Post-Conversation Analysis
- **Post Conversation Feedback:** AI-generated assessment of user's performance (according to set assessment prompt)  
- **Skill Breakdown:** Scoring overall performance and performance across set criteria
- **Conversation Transcript:** Full text transcript of the conversation available for review

### 3.2 Voice Conversation System

- **Use life-conversation via elevenlabs API example approach of the NegotiationMaster project** do not invent any other tech or approach

### 3.3 Characters Personalities
- **Actual AI agent created via Elevenlabs API** 
- **Descriptions created by Admin, via simple Create Character interface:** all Characters descriptions stored in a database
- **Have three main parts, assembled at the moment of calling Elevenlabs agent for conversation:** voice (chosen from Elevenlabs agents), personal context (stored at file AI_characters.md), case specific context   

#### 3.3.1 Character Components (Hard Structure) 
- **Name:** Set by admin
- **Voice:** Automatic assignment from Elevenlabs voices, gender sensitive 
- **Personal context and Character description:** text, created by admin and stored in Character database, set by admin
- **Persona's complexity:** number 1-10, how difficult it is to deal with such person in a setting expectations conversation, set by admin  

#### 3.3.1 Create Character Admin Interface 
- **Simple interface:** list of all existing characters, delete, manage, add buttons 
- **Fields to fill:** Name, personal context and character description as plain text, + voice added from Elevenlabs automatically and saved for specific character (button change voice - generates another voice automatically), Character's complexity level 1-10. Set by Admin.
- **Storing:** all Characters descriptions are saved at AI_chacrters.md file. Could also be changed and added via changing this file (simple backdoor to admin interface, especially during tests).


#### 3.4 Scenarios
- **All scenarios are stored in one Scenarios.md file** 
- **5 components in each scenario** - see scenario components 
- **All scenarios are created and managed by admin** 

#### 3.4.1 Scenario Components (Hard Structure)
- **General Context:** Clear background information, visible for both participants (human and AI), plain text
- **Confidential Instructions 1:** Confidential instructions for the human participant, plain text
- **Confidential Instructions 2:** Confidential instructions for AI participant, plain text
- **Case methodological description:** What is the case's learning objective, focus points, points for debriefing,  plain text
- **Case difficulty level:** number 1 to 10


### 3.5 Feedback Engine
- **Feedback is given by an AI model, admin has a choice of AI models to be used:** 
- **Feedback promt is defined by the admin as simple text:** 

#### 3.5.2 Fetching Conversation Transcipts and Feedback Generation
- **Upon termination of the conversation automatic fetching and feedback generation:** check and use process realized in NegotiationMaster project
- **Context for the Feedback:** system sends to selected AI model (1) full text of the AI_feedback.md files containing the prompt for feedback (2) full Transcript of the conversation fetched from elevenlabs (3) full set of case description - all five parts. Additionally system sends (4) scoring_methodology.md file and make a request to same AI model to provide quantitative assessment of scores: overall score and sub-scores. 


#### 3.6 Scoring System

#### 3.6.1 Skill Quantitative Assessment (Scoring) of individual conversations
- **General Score:** Competitive negotiation effectiveness, BATNA usage, position advocacy
- **individual Scores for each of the pre-defined criteria/sub-skill:** 

#### 3.6.2 General Skill Quantitative Assessment (scoring)
- **Skill Scoring After Each Conversation:** 1-100 scale for general skill and separately for each criteria, provided by AI model, giving feedback after each conversation;
- **Cumulative Skill Scoring:** - skills scores (general skill and overall skill) are adjusted after receiving each conversation scores using skill scoring methodology, similar to sports rating systems, with latest scores more impactful then the older ones.

#### 3.6.3 Effective "Setting Expectations" conversation five criteria (sub-skills), against which performance and progress should be scored
- **Clarity and Specificity of Expectations (WHAT & HOW):** Did the conversation result in clear, specific expectations regarding what the team member needs to achieve (results/outcomes) and how they are expected to act (behaviors, actions)? Were vague terms translated into actionable understanding? 
- **Mutual Understanding and Alignment:** Was there a genuine dialogue where both the manager and the team member actively participated in defining expectations, sharing perspectives, and reaching a shared vision? Did the team member clearly understand where to focus their efforts and priorities? 
- **Proactive Problem Solving & Support Identification:** Did the conversation proactively address potential challenges, explore growth limitations (if applicable), and discuss the support needed by the team member to meet expectations? 
- **Appropriate Customization & Flexibility:** Was the approach to setting expectations tailored to the individual's situation, considering their professional maturity, the nature of their tasks (e.g., stable vs. rapidly changing environment), and their aspirations? Did it go beyond a rigid SMART framework when not applicable? 
- **Documentation and Verification:** Was the outcome of the conversation clearly documented in a shared space, and was the team member asked to verify and agree upon it? 



### 3.7 User Management & Authentication

#### 3.6.1 Account Management
- **Standard Registration:** Email verification and password requirements

#### 3.6.2 Access Control
- **Role-Based Access:** Different permissions for users, admins
- **Content Access:** All scenarios accessible to all users 
- **Session Management:** Secure login/logout and session timeout handling

---

## 4. ADMIN FUNCTIONALITY

### 4.1 Content Management

#### 4.1.1 Create/Customize Scenario Admin Interface (Hard Structure)
- **Simple interface:** list of all existing scenarios, delete, manage, add buttons 
- **General Context:** Clear background information, visible for both participants (human and AI), plain text
- **Confidential Instructions 1:** Confidential instructions for the human participant, plain text
- **Confidential Instructions 2:** Confidential instructions for AI participant, plain text
- **Case methodological description:** What is the case's learning objective, focus points, points for debriefing, plain text
- **Case difficulty level:** number 1 to 10


#### 4.1.2 Create / Customize Character Admin Interface (Hard Structure) 
- **Simple interface:** list of all existing characters, delete, manage, add buttons 
- **Fields to fill:** Name, personal context and character description as plain text, + voice added from Elevenlabs automatically and saved for specific character (button change voice - generates another voice automatically), Character's complexity level 1-10. Set by Admin.
- **Storing:** all Characters descriptions are saved at AI_chacrters.md file. Could also be changed and added via changing this file (simple backdoor to admin interface, especially during tests).


#### 4.1.3 Feedback Setting / Customization Admin Interface
- **Choice of existing models  that can be used for feedback, marking, which one is selected:** Claude, Gemini, Open AI
- **Simple interface - list of existing prompts, that can be used, marking, which one is selected:** use this one, delete, manage, add new buttons 
- **Check, change or create Feedback promt as a simple text:** all feedback promts are stored in AI_Feedback_Promts.md file.   

### 4.3 System Configuration

#### 4.3.1 Platform Settings
- **Voice Engine Configuration:** Adjust speech recognition and synthesis parameters
- **Assessment Calibration:** Fine-tune scoring algorithms 
- **Performance Optimization:** System resource management and scaling
- **Integration Management:** API configurations and external system connections

#### 4.3.2 Monitoring & Maintenance
- **System Health:** Real-time monitoring of platform performance
- **Error Handling:** Automated error detection and response
- **Backup Management:** Data protection and recovery procedures
- **Update Deployment:** Controlled rollout of platform improvements

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.3 Usability Requirements
- **Browser Compatibility:** Support for Chrome, Firefox, Safari, Edge
- **Mobile Responsiveness:** Functional on tablets and large phones

### 5.4 Technical Architecture
- **Single-Page Application:** React-based frontend for responsive user experience
- **RESTful API:** Clean backend interface for frontend and potential integrations
- **Database Design:** Scalable data model for users, conversations, and analytics
- **Voice Integration:** Reliable ElevenLabs API integration, based on NegotiationsMaster project working examle

## 6. SUCCESS METRICS

### 6.1 User Engagement KPIs
- **Users feedback:** Feedback
- **Session Completion:** Percentage of started conversations completed
- **Return Rate:** Users who return for additional sessions within 30 days
- **Scenario Progression:** Users advancing through difficulty levels

### 6.2 Learning Effectiveness Measures
- **Skill Improvement:** Measurable progress across negotiation dimensions
- **Confidence Growth:** Self-reported confidence improvements
- **Satisfaction Scores:** Net Promoter Score and user satisfaction ratings

### 6.3 Technical Performance Benchmarks
- **Response Time:** Average voice conversation latency
- **System Reliability:** Uptime and error rates
- **Audio Quality:** Speech recognition accuracy and voice synthesis clarity


**Document Owner:** Marat  
**Last Updated:** August 5, 2025  
**Next Review:** Upon completion of gap analysis  
**Status:** Ready for the start of the project**
