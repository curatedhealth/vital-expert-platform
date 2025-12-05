# L5 Tool Agent Prompt Starter Templates

## Overview

L5 Tool Agents are specialized agents that provide specific tool capabilities. They execute discrete functions using underlying tools and APIs, serving as building blocks that other agents can utilize.

## Key Characteristics

- **Cross-functional**: Available to all departments and agent levels
- **Tool-specific**: Each agent wraps specific tool capabilities
- **Function-oriented**: Execute discrete, well-defined functions
- **Composable**: Can be chained together in workflows
- **Fast execution**: Optimized for quick task completion

## Template Patterns

### Search Operations
```
"Search [source/database] for [query/criteria] and return [output format]"
```

**Variables:**
- `[source]`: PubMed, Google Scholar, internal database, ClinicalTrials.gov
- `[query]`: keywords, filters, date ranges, authors
- `[output]`: results list, summary, citations

**Examples:**
```
"Search PubMed for recent publications on [drug] mechanism of action in [indication]"
"Search ClinicalTrials.gov for active Phase 3 trials in our therapeutic area"
```

---

### Calculation Operations
```
"Calculate [metric/value] using [inputs/parameters] and return [output]"
```

**Variables:**
- `[metric]`: sample size, dosing, statistics, deadlines
- `[inputs]`: effect size, variance, patient data, dates
- `[output]`: numeric result, confidence interval, formatted table

**Examples:**
```
"Calculate sample size needed for 80% power with expected effect size of 0.5"
"Calculate the statistical significance of the treatment difference"
```

---

### Comparison Operations
```
"Compare [item A] and [item B] highlighting [differences/similarities]"
```

**Variables:**
- `[items]`: documents, versions, datasets, labels
- `[focus]`: changes, additions, deletions, discrepancies

**Examples:**
```
"Compare the current and previous protocol versions highlighting all changes"
"Compare US and EU product labels identifying regional differences"
```

---

### Conversion Operations
```
"Convert [input] from [format A] to [format B] maintaining [quality/accuracy]"
```

**Variables:**
- `[input]`: document, data, image, content
- `[formats]`: PDF, Word, Excel, HTML, Markdown, PowerPoint
- `[quality]`: formatting, structure, accuracy

**Examples:**
```
"Convert the Word document to PDF maintaining all formatting"
"Convert the Excel data to a formatted HTML table"
```

---

### Extraction Operations
```
"Extract [data type] from [source] into [output format]"
```

**Variables:**
- `[data type]`: tables, text, references, key points
- `[source]`: PDF, document, webpage, database
- `[output]`: structured data, list, summary

**Examples:**
```
"Extract all tables from the PDF document into Excel format"
"Extract action items and deadlines from the meeting transcript"
```

---

### Checking/Validation Operations
```
"Check [input] for [criteria] and [report findings]"
```

**Variables:**
- `[input]`: text, code, references, data
- `[criteria]`: grammar, spelling, accuracy, completeness
- `[findings]`: errors, suggestions, warnings

**Examples:**
```
"Check the document for grammar and spelling errors"
"Verify all citations are correctly formatted and accessible"
```

---

## Cross-Functional L5 Tool Templates

### Literature Searcher
1. "Search scientific literature databases for publications on [topic] from the last [timeframe]"
2. "Find systematic reviews and meta-analyses on [intervention] in [population]"
3. "Retrieve full-text articles matching the search criteria for detailed review"
4. "Search for conference abstracts from [congress] on [therapeutic area]"

### PubMed Search Tool
1. "Search PubMed for recent publications on [drug name] mechanism of action"
2. "Find clinical trial publications for [compound] in [indication] from 2020-present"
3. "Search for safety publications reporting [adverse event] with [drug class]"
4. "Retrieve author publication history for [KOL name] in [therapeutic area]"

### Statistical Calculator
1. "Calculate the p-value for the difference between treatment and control groups"
2. "Compute confidence intervals for the primary endpoint results"
3. "Calculate odds ratio and relative risk from the 2x2 contingency table"
4. "Perform sample size calculation for a superiority trial design"

### Drug Interaction Checker
1. "Check for potential drug interactions between [drug A] and [drug B]"
2. "Identify contraindicated medication combinations for this patient profile"
3. "Review the concomitant medication list for clinically significant interactions"
4. "Assess CYP450 interaction potential for the proposed drug combination"

### Dosing Calculator
1. "Calculate pediatric dosing based on weight and age for [medication]"
2. "Determine renal dose adjustment for patient with [creatinine clearance]"
3. "Calculate loading dose and maintenance dose for [drug] based on patient parameters"
4. "Convert dosing between different formulations (IV to oral)"

### Document Converter
1. "Convert the PDF document to editable Word format"
2. "Transform the PowerPoint slides to PDF for distribution"
3. "Convert the HTML report to Markdown format"
4. "Transform Excel data to formatted Word tables"

### Grammar Checker
1. "Check the document for grammatical errors and suggest corrections"
2. "Review the text for passive voice and recommend active alternatives"
3. "Identify unclear sentences and provide clarity suggestions"
4. "Check for consistency in terminology throughout the document"

### Version Comparison Tool
1. "Compare version 1.0 and version 2.0 of the protocol and highlight changes"
2. "Generate a redline document showing all edits between drafts"
3. "Identify sections with substantive changes vs. editorial updates"
4. "Track changes between the submitted and approved label versions"

### Meeting Scheduler
1. "Find available meeting times across the provided attendee calendars"
2. "Schedule a recurring meeting for the project team across time zones"
3. "Identify optimal meeting times considering global participant locations"
4. "Send calendar invitations for the scheduled meeting"

### Deadline Calculator
1. "Calculate the regulatory submission deadline based on approval date and requirements"
2. "Determine business days remaining until the commitment due date"
3. "Calculate milestone dates based on project timeline and dependencies"
4. "Adjust deadlines accounting for regional holidays"

---

## Quality Checklist for L5 Starters

- [ ] 50-100 characters
- [ ] Single tool function
- [ ] Clear input parameters
- [ ] Expected output defined
- [ ] Uses function verbs (search, calculate, compare, convert, extract, check)
- [ ] Tool-specific terminology
- [ ] Composable for workflows
