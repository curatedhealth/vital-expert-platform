{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Roman;\f1\froman\fcharset0 Times-Bold;\f2\fnil\fcharset0 AppleColorEmoji;
\f3\fmodern\fcharset0 Courier-Bold;\f4\fmodern\fcharset0 Courier;\f5\froman\fcharset0 TimesNewRomanPSMT;
\f6\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;\red109\green109\blue109;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;\cssrgb\c50196\c50196\c50196;}
{\*\listtable{\list\listtemplateid1\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid1\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid1}
{\list\listtemplateid2\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid101\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid2}
{\list\listtemplateid3\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid201\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid3}
{\list\listtemplateid4\listhybrid{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{disc\}}{\leveltext\leveltemplateid301\'01\uc0\u8226 ;}{\levelnumbers;}\fi-360\li720\lin720 }{\listname ;}\listid4}
{\list\listtemplateid5\listhybrid{\listlevel\levelnfc0\levelnfcn0\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{decimal\}}{\leveltext\leveltemplateid401\'01\'00;}{\levelnumbers\'01;}\fi-360\li720\lin720 }{\listlevel\levelnfc23\levelnfcn23\leveljc0\leveljcn0\levelfollow0\levelstartat1\levelspace360\levelindent0{\*\levelmarker \{circle\}}{\leveltext\leveltemplateid402\'01\uc0\u9702 ;}{\levelnumbers;}\fi-360\li1440\lin1440 }{\listname ;}\listid5}}
{\*\listoverridetable{\listoverride\listid1\listoverridecount0\ls1}{\listoverride\listid2\listoverridecount0\ls2}{\listoverride\listid3\listoverridecount0\ls3}{\listoverride\listid4\listoverridecount0\ls4}{\listoverride\listid5\listoverridecount0\ls5}}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\sa240\partightenfactor0

\f0\fs24 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Excellent \'97 here\'92s exactly what you need for implementation with 
\f1\b Codex / Supabase
\f0\b0 .\uc0\u8232 I\'92ve prepared:\
\pard\pardeftab720\partightenfactor0
\cf3 \strokec3 \
\pard\pardeftab720\sa298\partightenfactor0

\f2\fs36 \cf0 \strokec2 \uc0\u55357 \u56536 
\f1\b  FILE 1 \'97 
\f3\fs39 DIGITAL_HEALTH_DATA_ARCHITECTURE.md
\f1\fs36 \
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 A fully documented blueprint describing all tables, relationships, and logic \'97 business-readable but implementation-ready.\
\pard\pardeftab720\partightenfactor0
\cf3 \strokec3 \
\pard\pardeftab720\sa298\partightenfactor0

\f2\fs36 \cf0 \strokec2 \uc0\u55357 \u56514 
\f1\b  FILE 2 \'97 
\f3\fs39 UC_CD_003_RCT_DESIGN.json
\f1\fs36 \
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 (first workflow example)\
\pard\pardeftab720\sa298\partightenfactor0

\f2\fs36 \cf0 \uc0\u55357 \u56514 
\f1\b  FILE 3 \'97 
\f3\fs39 UC_MA_006_BUDGET_IMPACT_MODEL.json
\f1\fs36 \
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 (second workflow example)\
Each JSON file follows the same structure and can serve as a template for ingestion or automation.\
\pard\pardeftab720\partightenfactor0
\cf3 \strokec3 \
\pard\pardeftab720\sa280\partightenfactor0

\f2\fs28 \cf0 \strokec2 \uc0\u9989 
\f1\b  FILE 1 \'97 
\f3\fs30\fsmilli15210 DIGITAL_HEALTH_DATA_ARCHITECTURE.md
\f1\fs28 \
\pard\pardeftab720\partightenfactor0

\f4\b0\fs26 \cf0 # 
\f2 \uc0\u55358 \u56813 
\f4  Digital Health Workflow Data Architecture (Supabase / Postgres)\
\
## 1. Objective\
To create a unified data model that represents **digital health workflows** end-to-end \'97 connecting domains, use cases, workflows, and granular tasks.  \
This model supports both business intelligence and AI workflow orchestration.\
\
---\
\
## 2. Conceptual Layers\
\
\pard\pardeftab720\sa240\partightenfactor0

\f0\fs24 \cf0 Domain 
\f5 \uc0\u8594 
\f0  Use Case 
\f5 \uc0\u8594 
\f0  Workflow 
\f5 \uc0\u8594 
\f0  Task 
\f5 \uc0\u8594 
\f0  Task Metadata
\f4\fs26 \
\pard\pardeftab720\partightenfactor0
\cf0 | Level | Purpose | Example |\
|-------|----------|---------|\
| **Domain** | Business area | Clinical Development |\
| **Use Case** | End-to-end process | UC_CD_003 \'96 RCT Design |\
| **Workflow** | Logical grouping of tasks | \'93RCT Design Workflow\'94 |\
| **Task** | Smallest executable unit | \'93Sample Size Calculation\'94 |\
\
Each **Task** may include:\
- Assigned **Agents/Roles**\
- Required **Tools**\
- Referenced **RAG sources**\
- One or more **AI Prompts**\
- **Inputs** and **Outputs**\
- **Dependencies** on other tasks\
- Optional **KPIs**\
\
---\
\
## 3. Data Model Overview\
\
### 3.1. Core Entities\
\
| Table | Description |\
|-------|--------------|\
| `dh_domain` | Top-level functional domain (CD, RA, MA, PD, EG) |\
| `dh_use_case` | Represents a business use case within a domain |\
| `dh_workflow` | Group of tasks forming a process |\
| `dh_task` | Atomic step of execution |\
| `dh_task_dependency` | Defines dependency graph between tasks |\
\
---\
\
### 3.2. Task Metadata Entities\
\
| Table | Description |\
|-------|-------------|\
| `dh_role` | Human or AI agents available in organization |\
| `dh_task_role` | Assignment of roles to tasks (Lead, Reviewer, etc.) |\
| `dh_tool` | Approved software or system |\
| `dh_task_tool` | Tools linked to tasks |\
| `dh_rag_source` | Trusted external knowledge bases |\
| `dh_task_rag` | Links RAG sources to tasks |\
| `dh_prompt` | Prompt definitions for AI use |\
| `dh_prompt_version` | Version history of each prompt |\
| `dh_prompt_eval` | Evaluation results from test runs |\
| `dh_task_input` | Artifacts required to execute task |\
| `dh_task_output` | Artifacts produced by task |\
| `dh_kpi` | Defined KPIs for performance tracking |\
| `dh_task_kpi_target` | Target KPI values per task |\
| `dh_task_link` | Cross-use-case references |\
\
---\
\
### 3.3. Relationship Diagram (simplified)\
\
```mermaid\
erDiagram\
    dh_domain ||--o\{ dh_use_case : contains\
    dh_use_case ||--o\{ dh_workflow : contains\
    dh_workflow ||--o\{ dh_task : has\
    dh_task ||--o\{ dh_task_dependency : "depends on"\
    dh_task ||--o\{ dh_task_role : "executed by"\
    dh_task ||--o\{ dh_task_tool : "uses"\
    dh_task ||--o\{ dh_task_rag : "references"\
    dh_task ||--o\{ dh_prompt : "automated by"\
    dh_task ||--o\{ dh_task_input : "consumes"\
    dh_task ||--o\{ dh_task_output : "produces"\
    dh_task ||--o\{ dh_task_kpi_target : "measures"\
    dh_task \}o--|| dh_task_link : "links to UC"\
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf3 \strokec3 \
\pard\pardeftab720\sa298\partightenfactor0

\f1\b\fs36 \cf0 \strokec2 4. Functional Logic\
\pard\pardeftab720\sa280\partightenfactor0

\fs28 \cf0 4.1. Dependencies\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 Tasks form a 
\f1\b Directed Acyclic Graph (DAG)
\f0\b0 :\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls1\ilvl0
\f4\fs26 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 dh_task_dependency
\f0\fs24  stores parent\'96child relationships\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls1\ilvl0\cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Dependency order defines workflow execution sequence\
\pard\pardeftab720\sa280\partightenfactor0

\f1\b\fs28 \cf0 4.2. Role Assignment\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 Each task can have one or more roles:\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls2\ilvl0
\f4\fs26 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Lead
\f0\fs24  = accountable owner\
\ls2\ilvl0
\f4\fs26 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Reviewer
\f0\fs24  = quality/peer check\
\ls2\ilvl0
\f4\fs26 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Approver
\f0\fs24  = sign-off authority\
\pard\pardeftab720\sa280\partightenfactor0

\f1\b\fs28 \cf0 4.3. Tools Integration\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 Tools provide functional context \'97 e.g., R for stats, Figma for UX, TreeAge for BIM.\uc0\u8232 Used to auto-load context when running a task in an orchestration layer.\
\pard\pardeftab720\sa280\partightenfactor0

\f1\b\fs28 \cf0 4.4. RAG & Prompts\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 Each task can reference external validated documents or datasets.\uc0\u8232 AI prompts use those sources for retrieval-augmented reasoning.\
\pard\pardeftab720\sa280\partightenfactor0

\f1\b\fs28 \cf0 4.5. Inputs / Outputs Traceability\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls3\ilvl0
\f0\b0\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Inputs may be generated by upstream tasks or uploaded externally.\
\ls3\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Outputs become traceable artifacts (document links, datasets, dashboards).\
\pard\pardeftab720\sa280\partightenfactor0

\f1\b\fs28 \cf0 4.6. KPIs\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 KPI targets quantify success (time, quality, acceptance rate).\uc0\u8232 Can be aggregated across workflows for analytics.\
\pard\pardeftab720\partightenfactor0
\cf3 \strokec3 \
\pard\pardeftab720\sa298\partightenfactor0

\f1\b\fs36 \cf0 \strokec2 5. Implementation Roadmap\

\itap1\trowd \taflags0 \trgaph108\trleft-108 \trbrdrt\brdrnil \trbrdrl\brdrnil \trbrdrr\brdrnil 
\clvertalc \clshdrawnil \clwWidth2873\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx2880
\clvertalc \clshdrawnil \clwWidth4028\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx5760
\clvertalc \clshdrawnil \clwWidth2255\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx8640
\pard\intbl\itap1\pardeftab720\qc\partightenfactor0

\fs24 \cf0 Phase\cell 
\pard\intbl\itap1\pardeftab720\qc\partightenfactor0
\cf0 Description\cell 
\pard\intbl\itap1\pardeftab720\qc\partightenfactor0
\cf0 Deliverable\cell \row

\itap1\trowd \taflags0 \trgaph108\trleft-108 \trbrdrl\brdrnil \trbrdrr\brdrnil 
\clvertalc \clshdrawnil \clwWidth2873\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx2880
\clvertalc \clshdrawnil \clwWidth4028\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx5760
\clvertalc \clshdrawnil \clwWidth2255\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx8640
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 1. Schema Setup
\f0\b0 \cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Create tables, enums, constraints\cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 SQL migration\cell \row

\itap1\trowd \taflags0 \trgaph108\trleft-108 \trbrdrl\brdrnil \trbrdrr\brdrnil 
\clvertalc \clshdrawnil \clwWidth2873\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx2880
\clvertalc \clshdrawnil \clwWidth4028\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx5760
\clvertalc \clshdrawnil \clwWidth2255\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx8640
\pard\intbl\itap1\pardeftab720\partightenfactor0

\f1\b \cf0 2. Data Seeding
\f0\b0 \cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Load domains, sample use cases\cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Initial dataset\cell \row

\itap1\trowd \taflags0 \trgaph108\trleft-108 \trbrdrl\brdrnil \trbrdrr\brdrnil 
\clvertalc \clshdrawnil \clwWidth2873\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx2880
\clvertalc \clshdrawnil \clwWidth4028\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx5760
\clvertalc \clshdrawnil \clwWidth2255\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx8640
\pard\intbl\itap1\pardeftab720\partightenfactor0

\f1\b \cf0 3. JSON Ingestion
\f0\b0 \cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Use case definitions 
\f5 \uc0\u8594 
\f0  Postgres JSONB\cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Populated workflows\cell \row

\itap1\trowd \taflags0 \trgaph108\trleft-108 \trbrdrl\brdrnil \trbrdrr\brdrnil 
\clvertalc \clshdrawnil \clwWidth2873\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx2880
\clvertalc \clshdrawnil \clwWidth4028\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx5760
\clvertalc \clshdrawnil \clwWidth2255\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx8640
\pard\intbl\itap1\pardeftab720\partightenfactor0

\f1\b \cf0 4. API Layer
\f0\b0 \cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Supabase auto-generated REST endpoints\cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Programmatic access\cell \row

\itap1\trowd \taflags0 \trgaph108\trleft-108 \trbrdrl\brdrnil \trbrdrr\brdrnil 
\clvertalc \clshdrawnil \clwWidth2873\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx2880
\clvertalc \clshdrawnil \clwWidth4028\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx5760
\clvertalc \clshdrawnil \clwWidth2255\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx8640
\pard\intbl\itap1\pardeftab720\partightenfactor0

\f1\b \cf0 5. Frontend / Dashboard
\f0\b0 \cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Visualize tasks, dependencies, agents\cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Retool or Next.js\cell \row

\itap1\trowd \taflags0 \trgaph108\trleft-108 \trbrdrl\brdrnil \trbrdrt\brdrnil \trbrdrr\brdrnil 
\clvertalc \clshdrawnil \clwWidth2873\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx2880
\clvertalc \clshdrawnil \clwWidth4028\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx5760
\clvertalc \clshdrawnil \clwWidth2255\clftsWidth3 \clmart10 \clmarl10 \clmarb10 \clmarr10 \clbrdrt\brdrnil \clbrdrl\brdrnil \clbrdrb\brdrnil \clbrdrr\brdrnil \clpadt20 \clpadl20 \clpadb20 \clpadr20 \gaph\cellx8640
\pard\intbl\itap1\pardeftab720\partightenfactor0

\f1\b \cf0 6. Automation / LLM Layer
\f0\b0 \cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Execute AI prompts per task\cell 
\pard\intbl\itap1\pardeftab720\partightenfactor0
\cf0 Task-runner integration\cell \lastrow\row
\pard\pardeftab720\partightenfactor0
\cf3 \strokec3 \
\pard\pardeftab720\sa298\partightenfactor0

\f1\b\fs36 \cf0 \strokec2 6. Example Relationships (Business View)\
\pard\pardeftab720\sa280\partightenfactor0

\fs28 \cf0 Example 1 \'97 UC_CD_003 : RCT Design\
\pard\pardeftab720\partightenfactor0

\f4\b0\fs26 \cf0 Domain: Clinical Development\
Use Case: UC_CD_003 \'96 RCT Design\
Workflow: \'93RCT Design Workflow\'94\
\
T1 \'96 Define Objectives\
   
\f6 \uc0\u8627 
\f4  Output: Study Objectives Doc\
T2 \'96 Comparator & Blinding\
   
\f6 \uc0\u8627 
\f4  Depends on: T1\
   
\f6 \uc0\u8627 
\f4  Tools: FDA guidance, internal precedent library\
T5 \'96 Sample Size Calculation\
   
\f6 \uc0\u8627 
\f4  Depends on: T1, T2\
   
\f6 \uc0\u8627 
\f4  Agents: Biostatistician\
   
\f6 \uc0\u8627 
\f4  Tools: R, TreeAge\
   
\f6 \uc0\u8627 
\f4  Output: Sample Size Justification Report\
\pard\pardeftab720\sa280\partightenfactor0

\f1\b\fs28 \cf0 Example 2 \'97 UC_MA_006 : Budget Impact Model\
\pard\pardeftab720\partightenfactor0

\f4\b0\fs26 \cf0 Domain: Market Access\
Use Case: UC_MA_006 \'96 Budget Impact Model\
Workflow: \'93BIM Development Workflow\'94\
\
T1 \'96 Define Population & Eligibility\
T5 \'96 Compute PMPM & Scenarios\
   
\f6 \uc0\u8627 
\f4  Depends on: T1\'96T4\
   
\f6 \uc0\u8627 
\f4  Agents: HEOR Analyst\
   
\f6 \uc0\u8627 
\f4  Tools: Excel, TreeAge\
   
\f6 \uc0\u8627 
\f4  Output: PMPM Table\
T6 \'96 Sensitivity Analysis\
   
\f6 \uc0\u8627 
\f4  Depends on: T5\
   
\f6 \uc0\u8627 
\f4  Output: Tornado Chart, Scenario Summary\
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf3 \strokec3 \
\pard\pardeftab720\sa298\partightenfactor0

\f1\b\fs36 \cf0 \strokec2 7. JSON Data Template\
\pard\pardeftab720\sa240\partightenfactor0

\f0\b0\fs24 \cf0 Each workflow is represented as a JSON object with nested tasks.\
\pard\pardeftab720\partightenfactor0

\f4\fs26 \cf0 \{\
  "domain": "Clinical Development",\
  "use_case": \{\
    "code": "UC_CD_003",\
    "title": "DTx RCT Design",\
    "summary": "Design FDA-acceptable randomized controlled trial",\
    "workflows": [\
      \{\
        "name": "RCT Design Workflow",\
        "tasks": [\
          \{\
            "code": "T1",\
            "title": "Define Objectives and Hypotheses",\
            "objective": "Specify primary and secondary study hypotheses",\
            "agents": ["P01_CMO", "P04_BIOSTAT"],\
            "tools": ["EDC", "MS Word"],\
            "dependencies": [],\
            "inputs": ["Endpoint Selection Report"],\
            "outputs": ["Study Objective Document"]\
          \}\
        ]\
      \}\
    ]\
  \}\
\}\
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf3 \strokec3 \
\pard\pardeftab720\sa298\partightenfactor0

\f1\b\fs36 \cf0 \strokec2 8. Business Benefits\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls4\ilvl0
\f0\b0\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Cross-functional transparency between teams\
\ls4\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Standardized metadata for every process\
\ls4\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Foundation for AI-assisted workflow execution\
\ls4\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Regulatory and audit readiness\
\ls4\ilvl0\kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	\uc0\u8226 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Seamless integration into Supabase dashboards and automation tools\
\pard\pardeftab720\partightenfactor0

\f4\fs26 \cf0 \
---\
\
### 
\f2 \uc0\u9989 
\f4  FILE 2 \'97 `UC_CD_003_RCT_DESIGN.json`\
\
```json\
\{\
  "domain": "Clinical Development",\
  "use_case": \{\
    "code": "UC_CD_003",\
    "title": "DTx RCT Design",\
    "summary": "Design FDA-acceptable randomized controlled trial for digital therapeutics.",\
    "complexity": "Advanced",\
    "workflows": [\
      \{\
        "name": "RCT Design Workflow",\
        "description": "End-to-end trial design and SAP creation.",\
        "tasks": [\
          \{\
            "code": "T1",\
            "title": "Define Objectives & Hypotheses",\
            "objective": "Specify primary and secondary hypotheses aligned with endpoints.",\
            "agents": ["P01_CMO", "P04_BIOSTAT"],\
            "tools": ["MS Word", "EDC"],\
            "dependencies": [],\
            "inputs": ["Endpoint Selection Report"],\
            "outputs": ["Study Objectives Document"],\
            "prompts": [\
              \{\
                "name": "Define_Hypotheses_Prompt",\
                "pattern": "CoT",\
                "system_prompt": "You are a clinical scientist designing endpoints for an FDA trial.",\
                "user_template": "Given \{indication\} and \{endpoint\}, propose hypotheses and success criteria."\
              \}\
            ],\
            "kpis": \{\
              "Documentation Completeness (%)": 100,\
              "Regulatory Acceptance (%)": 90\
            \}\
          \},\
          \{\
            "code": "T2",\
            "title": "Comparator & Blinding Strategy",\
            "objective": "Select comparator and blinding plan acceptable to regulators.",\
            "agents": ["P05_REGDIR", "P01_CMO"],\
            "tools": ["FDA Guidance DB"],\
            "dependencies": ["T1"],\
            "inputs": ["Clinical Rationale Document"],\
            "outputs": ["Comparator and Blinding Plan"],\
            "prompts": [\
              \{\
                "name": "Comparator_Blinding_Checklist",\
                "pattern": "CoT",\
                "system_prompt": "You are a regulatory-aware trial designer.",\
                "user_template": "Propose comparator and blinding method for \{indication\} referencing FDA precedents."\
              \}\
            ],\
            "kpis": \{\
              "Approval Probability (%)": 85\
            \}\
          \},\
          \{\
            "code": "T5",\
            "title": "Sample Size Calculation",\
            "objective": "Determine minimum N to achieve statistical power \uc0\u8805 80%.",\
            "agents": ["P04_BIOSTAT", "DTX_VALIDATOR"],\
            "tools": ["R", "TreeAge"],\
            "dependencies": ["T1", "T2"],\
            "inputs": ["Effect Size Estimate", "Variance Data"],\
            "outputs": ["Sample Size Justification Report"],\
            "prompts": [\
              \{\
                "name": "Sample_Size_Prompt",\
                "pattern": "CoT",\
                "system_prompt": "You are a senior biostatistician performing power analysis.",\
                "user_template": "Calculate required N given \{effect_size\}, \{variance\}, and \{alpha=0.05\}."\
              \}\
            ],\
            "kpis": \{\
              "Power Achieved (%)": 80\
            \}\
          \}\
        ]\
      \}\
    ]\
  \}\
\}\
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf3 \strokec3 \
\pard\pardeftab720\sa280\partightenfactor0

\f2\fs28 \cf0 \strokec2 \uc0\u9989 
\f1\b  FILE 3 \'97 
\f3\fs30\fsmilli15210 UC_MA_006_BUDGET_IMPACT_MODEL.json
\f1\fs28 \
\pard\pardeftab720\partightenfactor0

\f4\b0\fs26 \cf0 \{\
  "domain": "Market Access",\
  "use_case": \{\
    "code": "UC_MA_006",\
    "title": "Budget Impact Model (BIM)",\
    "summary": "Develop payer-ready 3\'965 year financial model for digital therapeutics adoption.",\
    "complexity": "Expert",\
    "workflows": [\
      \{\
        "name": "BIM Development Workflow",\
        "description": "End-to-end budget impact analysis including PMPM and sensitivity testing.",\
        "tasks": [\
          \{\
            "code": "T1",\
            "title": "Define Population & Eligibility",\
            "objective": "Estimate target population size and eligibility criteria.",\
            "agents": ["P21_HEOR", "P22_MADIRECT"],\
            "tools": ["Excel", "Epidemiology DB"],\
            "dependencies": [],\
            "inputs": ["Epidemiological Data"],\
            "outputs": ["Eligible Population Table"],\
            "prompts": [\
              \{\
                "name": "Population_Size_Prompt",\
                "pattern": "Few-Shot",\
                "system_prompt": "You are a health economist estimating eligible populations.",\
                "user_template": "Given prevalence \{p\} and coverage \{c\}, calculate eligible members for \{condition\}."\
              \}\
            ],\
            "kpis": \{\
              "Data Completeness (%)": 95\
            \}\
          \},\
          \{\
            "code": "T5",\
            "title": "Compute PMPM & Scenarios",\
            "objective": "Calculate per-member-per-month impact across base, best, and worst scenarios.",\
            "agents": ["P21_HEOR"],\
            "tools": ["Excel", "TreeAge"],\
            "dependencies": ["T1"],\
            "inputs": ["Treatment Mix Data", "Cost Inputs"],\
            "outputs": ["PMPM Results Table", "Scenario Summary"],\
            "prompts": [\
              \{\
                "name": "Scenario_Model_Prompt",\
                "pattern": "CoT",\
                "system_prompt": "You are a HEOR analyst modeling payer budget scenarios.",\
                "user_template": "Compute PMPM under base, best, and worst uptake using \{cost_inputs\}."\
              \}\
            ],\
            "kpis": \{\
              "PMPM Accuracy (%)": 95\
            \}\
          \},\
          \{\
            "code": "T6",\
            "title": "Sensitivity Analysis",\
            "objective": "Run one-way and multi-way sensitivity analyses.",\
            "agents": ["P21_HEOR", "P24_FINANCE"],\
            "tools": ["Python", "Excel"],\
            "dependencies": ["T5"],\
            "inputs": ["PMPM Results"],\
            "outputs": ["Tornado Chart", "Sensitivity Report"],\
            "prompts": [\
              \{\
                "name": "Sensitivity_Prompt",\
                "pattern": "CoT",\
                "system_prompt": "You are a data scientist performing sensitivity analysis.",\
                "user_template": "Run sensitivity on \{variables\} and produce tornado chart visualizations."\
              \}\
            ],\
            "kpis": \{\
              "Variance Explained (%)": 90\
            \}\
          \}\
        ]\
      \}\
    ]\
  \}\
\}\
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf3 \strokec3 \
\pard\pardeftab720\sa280\partightenfactor0

\f2\fs28 \cf0 \strokec2 \uc0\u9989 
\f1\b  How to Use These Files\
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls5\ilvl0
\fs24 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	1	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Load 
\f3\fs26 DIGITAL_HEALTH_DATA_ARCHITECTURE.md
\f0\b0\fs24  into your documentation repo \'97 this becomes the reference for engineers and analysts.\
\ls5\ilvl0
\f1\b \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	2	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Import each JSON
\f0\b0  into Supabase via a parser or API script that populates:\
\pard\tx940\tx1440\pardeftab720\li1440\fi-1440\sa240\partightenfactor0
\ls5\ilvl1
\f4\fs26 \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	
\f6 \uc0\u9702 
\f4 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 domain
\f0\fs24 , 
\f4\fs26 use_case
\f0\fs24 , 
\f4\fs26 workflow
\f0\fs24 , and 
\f4\fs26 task
\f0\fs24  tables\
\pard\tx940\tx1440\pardeftab720\li1440\fi-1440\sa240\partightenfactor0
\ls5\ilvl1\cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	
\f5 \uc0\u9702 
\f0 	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 associated 
\f4\fs26 agents
\f0\fs24 , 
\f4\fs26 tools
\f0\fs24 , 
\f4\fs26 prompts
\f0\fs24 , 
\f4\fs26 inputs
\f0\fs24 , 
\f4\fs26 outputs
\f0\fs24 , and 
\f4\fs26 kpis
\f0\fs24 \
\pard\tx220\tx720\pardeftab720\li720\fi-720\sa240\partightenfactor0
\ls5\ilvl0
\f1\b \cf0 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 {\listtext	3	}\expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Use these JSONs as templates
\f0\b0  when adding new workflows; they preserve structure and naming consistency.\
\pard\pardeftab720\partightenfactor0
\cf3 \strokec3 \
\pard\pardeftab720\sa240\partightenfactor0
\cf0 \strokec2 Would you like me to add the 
\f1\b SQL table creation script
\f0\b0  as a separate 
\f4\fs26 .sql
\f0\fs24  file (to match this documentation) for direct Codex ingestion next?\
}