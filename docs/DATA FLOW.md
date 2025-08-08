# DATA STRUCTURE

## 1. Inputs
1.1. AI Character
    - Name
    - Assigned Elevanlabs Agent (via ID)    - 
    - Complexity level (1-10)
    - Personal context and Character description 
   
1.2. Scenario
    - Difficulty level (1-10)
    - General instruction 
    - Confidential instruction 1 (human)
    - Confidential instruction 2 (AI)
    - Learning goals  
    - Default Character (from the list of existing AI characters)

1.3. Feedback prompt
    - customisable part (name and plain text, selected by admin from a set of feedback prompts)
    - constant part for scoring (no access of admin, fixed in code - based on the 5 criteria description and scoring approach)

1.4. Users
    - e-mail log-in
    - password
    - name
    - role: user or admin
    - status (active or non active)

## 2. Fetching from Elevemnalbs
2.1. Conversation ID (for later fetching full conversation transcipts)
2.2. Full transcripts (for feedback, demostrashion for user and storage)


## 3. Outputs:
3.1. Conversation. 
    3.1.1. Requires (what goes to AI agent):
        - AI character (including AI agent ID)
        - General context of the case
        - Confidential instruction of the AI
    3.1.2. Outputs:
        - Conversation elevenlabs ID (for later fetching full conversation transcipts)
        - Full transcripts - just full text of the conversation (for feedback, demostrashion for user and storage)

3.2. Individual Feedbacks (NOT syncronous - after the conversation)
    3.2.1. Requires (what goes to AI agent):
        - Full transcript
        - Full scenario (difficultym, general instructions, confidential instructions 1, confindetial instructions 2, learning goals)
        - Full feedback prompt (customisable part - for text feedback, andfixed part for scoring of the conversation   
    3.2.2. Outputs 
        - Personal Feedback (plain text)
        - 5 Scores for sub-skills/criteria, general score calculated as average of the 5 

3.3. Average scores (tracking) 
Formula. Initial scores = 0. First time average = score of the conversation; then average = rolling weighted average score with higher weight of the last result. General score of the skill = average of the 5 sub-skills 
    

# DATA STORAGE
## CUSTOMIZATION RELATED (local storage, updated by ADMINS via admin interfaces) 
- AI Character
- Scenarios
- Feedback prompt (customisable part)
- Users (created by users at sign-up, validated by ADMIN via admin interface + two super users for testing - admin@admin.com and user@user.com)

## USER SPECIFIC (local storage) 
- History of all cases played by the user
- All feed-backs
- All transcripts of each conversation held by the user
- All scores of the cases
- Average score in dynamic


