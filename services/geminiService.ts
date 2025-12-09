import { GoogleGenAI } from "@google/genai";
import type { RoleQuota } from '../types';

const getClient = () => {
    const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found. Please set it in Settings.");
    }
    return new GoogleGenAI({ apiKey });
};

const getModelName = () => {
    return 'gemini-2.5-flash';
};

/**
 * Safely escapes a string to be used inside a JavaScript array within a string, and wraps it in single quotes.
 * @param str The string to escape.
 * @returns The escaped and quoted string.
 */
const escapeStringForJs = (str: string) => `'${str.replace(/'/g, "\\'")}'`;


export const generateFormAScript = async (roster: string[], roles: string[]): Promise<string> => {
    const scriptRosterArray = `[${roster.map(escapeStringForJs).join(', ')}]`;

    const prompt = `
Generate a Google Apps Script function named 'createSkillSurveyForm'.
This function should create a Google Form with the title '電影劇組技能調查表'.
The form should have the following fields in this specific order:

1.  **Name (Dropdown):**
    *   Create a dropdown list question with the title '姓名'.
    *   This is a required question.
    *   The options should be the student names in this JavaScript array: ${scriptRosterArray}.
    *   **Use this exact syntax:** \`form.addListItem().setTitle('姓名').setChoiceValues(${scriptRosterArray}).setRequired(true);\`

2.  **Skill Ratings (Linear Scale):**
    *   For each role in the list [${roles.map(r => `'${r}'`).join(', ')}], create a 'Linear scale' question.
    *   The title of each question must be the role name.
    *   The scale must go from 1 to 10.
    *   Label 1 as '新手' (Beginner) and 10 as '精通' (Expert).
    *   All these questions are required.
    *   **Use this syntax:** \`form.addScaleItem().setTitle('Role Name').setBounds(1, 10).setLabels('新手', '精通').setRequired(true);\`

3.  **Notes (Paragraph Text):**
    *   Create a 'Paragraph' text question with the title '備註：強化與推銷自己'.
    *   This is an optional question.
    *   **Use this syntax:** \`form.addParagraphTextItem().setTitle('備註：強化與推銷自己');\`

The script must log the URL of the newly created form to the console.
Provide ONLY the raw JavaScript code for the function, without any markdown or explanations.
`;

    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: getModelName(),
            contents: prompt,
        });
        const script = response.text.replace(/```javascript|```/g, '').trim();
        return script;
    } catch (error) {
        console.error("Error generating Google Apps Script for Form A:", error);
        return "Error generating script. Please check your API Key in Settings.";
    }
};


export const generateFormBCScripts = async (
    directors: { name: string, projectName: string }[],
    roster: string[],
    roles: string[],
    roleQuotas: RoleQuota
): Promise<{ formB: string, formC: string }> => {
    const directorChoices = directors.map(d => `${d.name}《${d.projectName}》`);
    const crewMembers = roster.filter(student => !directors.some(d => d.name === student));
    const directorNames = directors.map(d => d.name);

    const scriptCrewMembersArray = `[${crewMembers.map(escapeStringForJs).join(', ')}]`;
    const scriptDirectorNamesArray = `[${directorNames.map(escapeStringForJs).join(', ')}]`;
    const scriptDirectorChoicesArray = `[${directorChoices.map(escapeStringForJs).join(', ')}]`;

    const promptB = `
Generate a Google Apps Script function named 'createCrewPreferenceForm'.
This function should create a Google Form with the title '劇組志願調查表 (工作人員填寫)'.
The form should have the following fields:

1. A dropdown list question with the title '姓名' (Name). This is a required question.
   - The options should be the non-director crew members, provided in this JS array: ${scriptCrewMembersArray}.
   - Use the syntax: \`form.addListItem().setTitle('姓名').setChoiceValues(${scriptCrewMembersArray}).setRequired(true);\`

2. Three separate dropdown list questions for preferences: '第一志願', '第二志願', '第三志願'. These are all required questions.
   - Each dropdown should contain the list of director projects, provided in this JS array: ${scriptDirectorChoicesArray}.
   - For '第一志願', use: \`form.addListItem().setTitle('第一志願').setChoiceValues(${scriptDirectorChoicesArray}).setRequired(true);\`.
   - Follow the same pattern for '第二志願' and '第三志願'.

The script should log the URL of the newly created form to the console. Only provide the JavaScript code for the function, without markdown.
`;

    const roleQuestionsInstructions = Object.entries(roleQuotas)
        .filter(([role, quota]) => role !== '導演' && quota > 0)
        .map(([role, quota]) => {
            if (quota === 1) {
                return `- A 'Multiple-choice' question with the title '挑選 ${role} (選 1 位)'.`;
            } else { // quota > 1
                return `- A 'Checkbox' question with the title '挑選 ${role} (選 ${quota} 位)'.`;
            }
        })
        .join('\n');


    const promptC = `
You are an expert in Google Apps Script. Your task is to generate a robust and functional Google Apps Script function named 'createDirectorSelectionForm'.

This function must create a Google Form with the title '導演選組單'.

The form must have the following fields in the specified order:

1.  **Director's Name (Dropdown):**
    *   Create a dropdown question for the director's name.
    *   The title must be '您的姓名 (導演)'.
    *   This question is **required**.
    *   The options for the dropdown are the names in this JavaScript array: ${scriptDirectorNamesArray}.
    *   **You must use this exact syntax:** \`form.addListItem().setTitle('您的姓名 (導演)').setChoiceValues(${scriptDirectorNamesArray}).setRequired(true);\`

2.  **Role Selection Questions:**
    *   For each role specified below, create a corresponding question.
    *   The choices for ALL of these role selection questions must be the list of non-director crew members, provided in this JavaScript array: ${scriptCrewMembersArray}.
    *   These questions are **optional** (not required).
    *   Here are the questions to add:
${roleQuestionsInstructions}

    *   **Syntax Guide for Role Questions:**
        *   For a 'Multiple-choice' question, use the syntax: \`form.addMultipleChoiceItem().setTitle('Your Title').setChoiceValues(${scriptCrewMembersArray});\`
        *   For a 'Checkbox' question, use the syntax: \`form.addCheckboxItem().setTitle('Your Title').setChoiceValues(${scriptCrewMembersArray});\`

3.  **Notes (Paragraph Text):**
    *   Create a 'Paragraph' text question with the title '備註：期待的特殊工作技能'.
    *   This is an optional question.
    *   **You must use this exact syntax:** \`form.addParagraphTextItem().setTitle('備註：期待的特殊工作技能');\`

The script must conclude by logging the URL of the newly created form to the console using \`Logger.log('Form URL: ' + form.getPublishedUrl());\`.

CRITICAL: Provide ONLY the raw JavaScript code for the 'createDirectorSelectionForm' function. Do not include any surrounding markdown (like \`\`\`javascript\`), explanations, or other functions.
`;

    try {
        const ai = getClient();
        const model = getModelName();
        const [responseB, responseC] = await Promise.all([
            ai.models.generateContent({ model: model, contents: promptB }),
            ai.models.generateContent({ model: model, contents: promptC }),
        ]);

        const formB = responseB.text.replace(/```javascript|```/g, '').trim();
        const formC = responseC.text.replace(/```javascript|```/g, '').trim();

        return { formB, formC };

    } catch (error) {
        console.error("Error generating Google Apps Scripts for Forms B & C:", error);
        return { formB: "Error generating script.", formC: "Error generating script." };
    }
};


export const analyzeSkills = async (skillData: any[]): Promise<string> => {
    const prompt = `
重要前提：這份資料是學生的「自我評估」，分數高代表學生對該職位有高度興趣與自信，不完全等同於客觀的專業能力。請在你的分析摘要中，反映出這個脈絡。

請分析以下的電影劇組技能調查資料，並為老師提供一份簡潔的摘要（使用繁體中文），以利於快速分組。
目標是找出對某些職位抱有高度熱情與自信的學生。

你的摘要應該包含：
1. 點出哪些職位有很多學生給自己打了高分（9-10分），並明確列出這些學生的「姓名」。
2. 提及哪些職位的資深成員（或表達高度意願者）可能較少。
3. 摘要應易於閱讀且具有行動導向，幫助老師了解班級成員的志願分佈。

數據資料如下：
${JSON.stringify(skillData)}
`;
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: getModelName(),
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing skills:", error);
        return "無法分析技能數據。請檢查您的 API Key 設定。";
    }
};


export const performCrewAssignment = async (
    csvA: any[],
    csvB: any[],
    csvC: any[],
    roleQuotas: { [role: string]: number },
    directors: { name: string, projectName: string }[]
): Promise<{ assignments: any, rationale: string }> => {
    const prompt = `
You are a film school teaching assistant forming student film crews. Your goal is to create balanced teams and ensure as many students as possible are assigned a role.

You are given three datasets:
1.  **Student Skills (Data A):** Contains each student's self-assessed skill level (1-10) for various roles and a personal note.
2.  **Crew Preferences (Data B):** Contains each non-director student's ranked preference for which director/project they want to work on.
3.  **Director Preferences (Data C):** Contains each director's ranked preference for students to fill specific roles.

And two configuration objects:
1. **Directors and Projects:** ${JSON.stringify(directors)}
2. **Role Quotas per team:** ${JSON.stringify(roleQuotas)}

**Your task is to analyze all this data and assign students to crews for each project.**

**Priorities (in order):**
1. Fill all required roles for each project as specified in the Role Quotas.
2. Maximize the number of students assigned to a role.
3. Consider preferences from all three datasets: student skill levels, crew project preferences, and director's choices. Try to find a good balance.
4. Assign students to roles where they have a high self-assessed skill score (e.g., 7 or higher).
5. If a student did not submit a form, leave a slot open for them but do not assign them.

**Output Format:**
Respond with a single JSON object. This object must have two keys: "assignments" and "rationale".
- The "assignments" value should be an array of objects, where each object represents a project and has the following structure: { projectName: string, director: string, crew: [{ role: string, student: string }] }.
- The "rationale" value should be a string in Traditional Chinese explaining the logic behind your assignments, highlighting key decisions or compromises.

**Here is the data:**
Data A (Student Skills):
${JSON.stringify(csvA)}

Data B (Crew Preferences):
${JSON.stringify(csvB)}

Data C (Director Preferences):
${JSON.stringify(csvC)}

Now, generate the JSON output.
`;

    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: getModelName(), // Use the selected model, even for complex tasks? Or force Pro?
            // The original code used 'gemini-2.5-pro' here, which is very specific.
            // If the user selects 'flash', it might be too weak.
            // But let's respect the user's choice or default to Pro if they chose Pro.
            // Actually, the user can select 'gemini-1.5-pro'.
            // If they select 'flash', we use 'flash'.
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return { assignments: result.assignments, rationale: result.rationale };

    } catch (error) {
        console.error("Error performing crew assignment:", error);
        return { assignments: [], rationale: "AI分析失敗，請檢查上傳的CSV檔案格式是否正確，或檢查您的 API Key 設定。" };
    }
};